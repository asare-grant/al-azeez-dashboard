// src/lib/attendance/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AttendancePermission =
  | "attendance.view"
  | "attendance.record"
  | "attendance.modify"
  | "attendance.report";

export type AttendanceAccessScope =
  | "GLOBAL"
  | "SUPERVISED_CLASSES";

export type AttendanceActorContext = {
  userId:
    string;

  actorRole:
    string | null;

  actorName:
    string | null;

  scope:
    AttendanceAccessScope;
};

/* ========================================================================== */
/* REQUIRE ATTENDANCE PERMISSION                                              */
/* ========================================================================== */

export async function requireAttendancePermission(
  permission:
    AttendancePermission,
): Promise<AttendanceActorContext> {
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
      permission,
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  const grantingAssignments =
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
              permission
                .trim()
                .toLowerCase(),
        ),
    );

  /*
   * Teacher-only authority remains class-scoped.
   *
   * If another active role also grants the same
   * attendance permission, the actor receives
   * global management scope.
   */
  const teacherOnlyAuthority =
    grantingAssignments.length >
      0 &&
    grantingAssignments.every(
      (
        assignment,
      ) =>
        assignment.role.key
          .trim()
          .toLowerCase() ===
        "teacher",
    );

  const grantingAssignment =
    grantingAssignments[0];

  const actorRole =
    grantingAssignment
      ?.role.key
      ?.trim()
      .toLowerCase() ??
    accessActor.actor
      .legacyRole
      ?.trim()
      .toLowerCase() ??
    null;

  const actorName =
    accessActor.actor
      .displayName
      ?.trim() ||
    accessActor.actor
      .username
      ?.trim() ||
    accessActor.actor
      .email
      ?.trim() ||
    "Attendance Manager";

  return {
    userId:
      accessActor.actor.id,

    actorRole,

    actorName,

    scope:
      teacherOnlyAuthority
        ? "SUPERVISED_CLASSES"
        : "GLOBAL",
  };
}