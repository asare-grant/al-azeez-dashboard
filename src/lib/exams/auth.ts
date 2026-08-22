// src/lib/exams/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type ExamAccessScope =
  | "GLOBAL"
  | "OWN_LESSONS";

export type ExamManagerContext = {
  userId:
    string;

  scope:
    ExamAccessScope;
};

/* ========================================================================== */
/* REQUIRE EXAM MANAGER                                                       */
/* ========================================================================== */

export async function requireExamManager(): Promise<
  ExamManagerContext
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
      "exams.manage",
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  /*
   * Determine which active roles actually grant
   * exams.manage.
   *
   * If Teacher is the only granting role,
   * restrict access to that Teacher's own lessons.
   *
   * If Admin, Super Admin, Academic Director or
   * another delegated role also grants exams.manage,
   * the actor receives GLOBAL scope.
   */
  const grantingRoles =
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
              "exams.manage",
        ),
    );

  const teacherOnlyAuthority =
    grantingRoles.length >
      0 &&
    grantingRoles.every(
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
/* REQUIRE EXAM LIST ACCESS                                                   */
/* ========================================================================== */

export type ExamListAccessContext = {
  userId: string;

  canManage: boolean;

  global: boolean;

  ownLessons: boolean;

  ownStudentClass: boolean;

  ownChildrenClasses: boolean;
};

export async function requireExamListAccess(): Promise<ExamListAccessContext> {
  const accessActor =
    await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const canView =
    accessActor.can(
      "exams.view",
    );

  const canManage =
    accessActor.can(
      "exams.manage",
    );

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
      await requireExamManager();

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
              "exams.view",
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