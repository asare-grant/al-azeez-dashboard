import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type TeacherPermission =
  | "teachers.view"
  | "teachers.create"
  | "teachers.update"
  | "teachers.delete";

export type TeacherAccessScope =
  | "GLOBAL"
  | "SELF";

export type TeacherPermissionContext = {
  userId: string;

  scope: TeacherAccessScope;
};

/* ========================================================================== */
/* PERMISSION GRANT                                                           */
/* ========================================================================== */

function assignmentGrantsPermission(
  assignment: NonNullable<
    Awaited<
      ReturnType<
        typeof getCurrentAccessActor
      >
    >
  >["activeAssignments"][number],

  permission: TeacherPermission,
) {
  const normalizedPermission =
    permission
      .trim()
      .toLowerCase();

  return assignment.role.permissions.some(
    (rolePermission) =>
      rolePermission.permission.isActive &&
      rolePermission.permission.key
        .trim()
        .toLowerCase() ===
        normalizedPermission,
  );
}

/* ========================================================================== */
/* RESOLVE PERMISSION SCOPE                                                   */
/* ========================================================================== */

export function getTeacherPermissionScope(
  accessActor: NonNullable<
    Awaited<
      ReturnType<
        typeof getCurrentAccessActor
      >
    >
  >,

  permission: TeacherPermission,
): TeacherAccessScope {
  const grantingAssignments =
    accessActor.activeAssignments.filter(
      (assignment) =>
        assignmentGrantsPermission(
          assignment,
          permission,
        ),
    );

  /*
   * A permission is SELF-scoped only when every active
   * assignment granting that exact permission is the
   * protected Teacher role.
   *
   * Therefore:
   *
   * Teacher only
   *   -> SELF
   *
   * Teacher + another role that also grants teachers.view
   *   -> GLOBAL
   *
   * Admin / Auditor / delegated management role
   *   -> GLOBAL
   */
  const teacherOnlyAuthority =
    grantingAssignments.length > 0 &&
    grantingAssignments.every(
      (assignment) =>
        assignment.role.key
          .trim()
          .toLowerCase() ===
        "teacher",
    );

  return teacherOnlyAuthority
    ? "SELF"
    : "GLOBAL";
}

/* ========================================================================== */
/* REQUIRE EXACT TEACHER PERMISSION                                           */
/* ========================================================================== */

export async function requireTeacherPermission(
  permission: TeacherPermission,
): Promise<TeacherPermissionContext> {
  const accessActor =
    await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  if (
    !accessActor.can(
      permission,
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  return {
    userId:
      accessActor.actor.id,

    scope:
      getTeacherPermissionScope(
        accessActor,
        permission,
      ),
  };
}