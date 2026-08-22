// src/lib/lessons/auth.ts

import "server-only";

import { getCurrentAccessActor } from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type LessonAccessScope = "GLOBAL" | "OWN_LESSONS";

export type LessonManagerContext = {
  userId: string;

  scope: LessonAccessScope;
};

export type LessonListAccessContext = {
  userId: string;

  /*
   * Whether the actor has academics.lessons.manage.
   */
  canManage: boolean;

  /*
   * Institution-wide read authority.
   */
  global: boolean;

  /*
   * Teacher persona:
   * lessons taught by this teacher.
   */
  ownLessons: boolean;

  /*
   * Student persona:
   * lessons belonging to the student's own class.
   */
  ownStudentClass: boolean;

  /*
   * Parent persona:
   * lessons belonging to classes containing
   * the parent's linked children.
   */
  ownChildrenClasses: boolean;
};

/* ========================================================================== */
/* REQUIRE LESSON MANAGER                                                     */
/* ========================================================================== */

export async function requireLessonManager(): Promise<LessonManagerContext> {
  const accessActor = await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!accessActor.can("academics.lessons.manage")) {
    throw new Error("UNAUTHORIZED");
  }

  /*
   * Determine which active role actually grants
   * academics.lessons.manage.
   *
   * If the authority comes only from Teacher,
   * restrict the actor to their own lessons.
   *
   * If Admin, Super Admin, Academic Director or another
   * delegated role grants the permission, allow global scope.
   */
  const grantingRoles = accessActor.activeAssignments.filter((assignment) =>
    assignment.role.permissions.some(
      (rolePermission) =>
        rolePermission.permission.isActive &&
        rolePermission.permission.key.trim().toLowerCase() ===
          "academics.lessons.manage",
    ),
  );

  const teacherOnlyAuthority =
    grantingRoles.length > 0 &&
    grantingRoles.every(
      (assignment) => assignment.role.key.trim().toLowerCase() === "teacher",
    );

  return {
    userId: accessActor.actor.id,

    scope: teacherOnlyAuthority ? "OWN_LESSONS" : "GLOBAL",
  };
}

/* ========================================================================== */
/* REQUIRE LESSON LIST ACCESS                                                 */
/* ========================================================================== */

export async function requireLessonListAccess(): Promise<LessonListAccessContext> {
  const accessActor = await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error("UNAUTHENTICATED");
  }

  const canView = accessActor.can("academics.lessons.view");

  const canManage = accessActor.can("academics.lessons.manage");

  if (!canView && !canManage) {
    throw new Error("UNAUTHORIZED");
  }

  /* ------------------------------------------------------------------------ */
  /* MANAGEMENT AUTHORITY                                                     */
  /* ------------------------------------------------------------------------ */

  /*
   * Management authority takes precedence.
   *
   * A Teacher whose management permission is teacher-only
   * remains restricted to their own lessons.
   *
   * A delegated/global lesson manager receives institution-wide
   * lesson access.
   */
  if (canManage) {
    const manager = await requireLessonManager();

    return {
      userId: manager.userId,

      canManage: true,

      global: manager.scope === "GLOBAL",

      ownLessons: manager.scope === "OWN_LESSONS",

      ownStudentClass: false,

      ownChildrenClasses: false,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* READ-ONLY VIEW AUTHORITY                                                 */
  /* ------------------------------------------------------------------------ */

  /*
   * Determine which active roles actually grant
   * academics.lessons.view.
   *
   * This is permission-grant aware rather than simply checking
   * every role assigned to the user.
   */
  const viewingRoles = accessActor.activeAssignments.filter((assignment) =>
    assignment.role.permissions.some(
      (rolePermission) =>
        rolePermission.permission.isActive &&
        rolePermission.permission.key.trim().toLowerCase() ===
          "academics.lessons.view",
    ),
  );

  const viewingRoleKeys = new Set(
    viewingRoles.map((assignment) => assignment.role.key.trim().toLowerCase()),
  );

  /*
   * Persona roles have resource-scoped visibility:
   *
   * Teacher
   *   -> own lessons
   *
   * Student
   *   -> lessons belonging to their own class
   *
   * Parent
   *   -> lessons belonging to their children's classes
   *
   * Any other explicitly delegated RBAC role granting
   * academics.lessons.view is treated as a global viewer.
   */
  const hasDelegatedGlobalViewer = Array.from(viewingRoleKeys).some(
    (roleKey) =>
      roleKey !== "teacher" && roleKey !== "student" && roleKey !== "parent",
  );

  if (hasDelegatedGlobalViewer) {
    return {
      userId: accessActor.actor.id,

      canManage: false,

      global: true,

      ownLessons: false,

      ownStudentClass: false,

      ownChildrenClasses: false,
    };
  }

  const ownLessons = viewingRoleKeys.has("teacher");

  const ownStudentClass = viewingRoleKeys.has("student");

  const ownChildrenClasses = viewingRoleKeys.has("parent");

  if (!ownLessons && !ownStudentClass && !ownChildrenClasses) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    userId: accessActor.actor.id,

    canManage: false,

    global: false,

    ownLessons,

    ownStudentClass,

    ownChildrenClasses,
  };
}
