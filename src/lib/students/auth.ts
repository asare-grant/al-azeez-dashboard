// src/lib/students/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type StudentPermission =
  | "students.view"
  | "students.create"
  | "students.update"
  | "students.delete";

export type StudentAccessScope =
  | "GLOBAL"
  | "TEACHER_OWNED";

export type StudentPermissionContext = {
  userId: string;

  scope: StudentAccessScope;
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

  permission: StudentPermission,
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

export function getStudentPermissionScope(
  accessActor: NonNullable<
    Awaited<
      ReturnType<
        typeof getCurrentAccessActor
      >
    >
  >,

  permission: StudentPermission,
): StudentAccessScope {
  const grantingAssignments =
    accessActor.activeAssignments.filter(
      (assignment) =>
        assignmentGrantsPermission(
          assignment,
          permission,
        ),
    );

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
    ? "TEACHER_OWNED"
    : "GLOBAL";
}

/* ========================================================================== */
/* REQUIRE EXACT STUDENT PERMISSION                                           */
/* ========================================================================== */

export async function requireStudentPermission(
  permission: StudentPermission,
): Promise<StudentPermissionContext> {
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
      getStudentPermissionScope(
        accessActor,
        permission,
      ),
  };
}