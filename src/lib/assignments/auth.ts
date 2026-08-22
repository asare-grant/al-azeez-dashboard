// src/lib/assignments/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AssignmentAccessScope =
  | "GLOBAL"
  | "OWN_LESSONS";

export type AssignmentManagerContext = {
  userId:
    string;

  scope:
    AssignmentAccessScope;
};

/* ========================================================================== */
/* REQUIRE ASSIGNMENT MANAGER                                                 */
/* ========================================================================== */

export async function requireAssignmentManager(): Promise<
  AssignmentManagerContext
> {
  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor
  ) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  if (
    !accessActor.can(
      "assignments.manage",
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* RESOLVE WHERE THE PERMISSION CAME FROM                                   */
  /* ------------------------------------------------------------------------ */

  /*
   * A Teacher's built-in assignments.manage permission
   * is deliberately scoped to that teacher's lessons.
   *
   * Admin, Academic Director, Super Admin, or another
   * delegated role that grants assignments.manage gets
   * global assignment authority.
   *
   * This also handles a Teacher who is additionally
   * granted an administrative role:
   *
   * teacher + academic_director
   *
   * becomes GLOBAL because assignments.manage is also
   * granted through a non-teacher role.
   */
  const assignmentsManageGrantingRoles =
    accessActor.activeAssignments.filter(
      (
        assignment,
      ) =>
        assignment.role.permissions.some(
          (
            rolePermission,
          ) =>
            rolePermission
              .permission
              .isActive &&
            rolePermission
              .permission
              .key
              .trim()
              .toLowerCase() ===
              "assignments.manage",
        ),
    );

  const teacherOnlyAuthority =
    assignmentsManageGrantingRoles.length >
      0 &&
    assignmentsManageGrantingRoles.every(
      (
        assignment,
      ) =>
        assignment.role.key
          .trim()
          .toLowerCase() ===
        "teacher",
    );

  return {
    userId:
      accessActor.actor.id,

    scope:
      teacherOnlyAuthority
        ? "OWN_LESSONS"
        : "GLOBAL",
  };
}


/* ========================================================================== */
/* REQUIRE ASSIGNMENT LIST ACCESS                                             */
/* ========================================================================== */

export type AssignmentListAccessContext = {
  userId: string;

  canManage: boolean;

  global: boolean;

  ownLessons: boolean;

  ownStudentClass: boolean;

  ownChildrenClasses: boolean;
};

export async function requireAssignmentListAccess(): Promise<AssignmentListAccessContext> {
  const accessActor =
    await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const canView =
    accessActor.can(
      "assignments.view",
    );

  const canManage =
    accessActor.can(
      "assignments.manage",
    );

  /*
   * A manager must be allowed into the list even if a
   * custom delegated role contains assignments.manage
   * without separately containing assignments.view.
   */
  if (
    !canView &&
    !canManage
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* MANAGEMENT AUTHORITY                                                     */
  /* ------------------------------------------------------------------------ */

  if (canManage) {
    const manager =
      await requireAssignmentManager();

    return {
      userId:
        manager.userId,

      canManage:
        true,

      global:
        manager.scope ===
        "GLOBAL",

      ownLessons:
        manager.scope ===
        "OWN_LESSONS",

      ownStudentClass:
        false,

      ownChildrenClasses:
        false,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* READ-ONLY VIEW AUTHORITY                                                  */
  /* ------------------------------------------------------------------------ */

  const viewingRoles =
    accessActor.activeAssignments.filter(
      (
        assignment,
      ) =>
        assignment.role.permissions.some(
          (
            rolePermission,
          ) =>
            rolePermission
              .permission
              .isActive &&
            rolePermission
              .permission
              .key
              .trim()
              .toLowerCase() ===
              "assignments.view",
        ),
    );

  const viewingRoleKeys =
    new Set(
      viewingRoles.map(
        (
          assignment,
        ) =>
          assignment.role.key
            .trim()
            .toLowerCase(),
      ),
    );

  /*
   * Non-persona delegated roles are treated as global
   * viewers because their explicit RBAC grant represents
   * institution-level delegated viewing authority.
   */
  const hasDelegatedGlobalViewer =
    Array.from(
      viewingRoleKeys,
    ).some(
      (
        roleKey,
      ) =>
        roleKey !==
          "teacher" &&
        roleKey !==
          "student" &&
        roleKey !==
          "parent",
    );

  if (
    hasDelegatedGlobalViewer
  ) {
    return {
      userId:
        accessActor.actor.id,

      canManage:
        false,

      global:
        true,

      ownLessons:
        false,

      ownStudentClass:
        false,

      ownChildrenClasses:
        false,
    };
  }

  const ownLessons =
    viewingRoleKeys.has(
      "teacher",
    );

  const ownStudentClass =
    viewingRoleKeys.has(
      "student",
    );

  const ownChildrenClasses =
    viewingRoleKeys.has(
      "parent",
    );

  if (
    !ownLessons &&
    !ownStudentClass &&
    !ownChildrenClasses
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  return {
    userId:
      accessActor.actor.id,

    canManage:
      false,

    global:
      false,

    ownLessons,

    ownStudentClass,

    ownChildrenClasses,
  };
}