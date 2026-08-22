// src/lib/academics/options-auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* ACADEMIC OPERATIONS PERMISSIONS                                             */
/* ========================================================================== */

/*
 * These are management/operational permissions that
 * legitimately require academic-period and lesson options.
 *
 * Student/Parent read-only permissions are intentionally
 * excluded.
 */
const ACADEMIC_OPERATIONS_PERMISSIONS = [
  "academics.lessons.manage",

  "exams.manage",

  "assignments.manage",

  "results.manage",

  "assessments.create",

  "assessments.publish",

  "assessments.grade",

  "report_cards.generate",

  "report_cards.edit",

  "report_cards.submit",

  "report_cards.review",

  "report_cards.publish",
] as const;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AcademicOptionsAccess = {
  userId:
    string;

  scope:
    "GLOBAL" | "OWN_LESSONS";

  actorRole:
    string | null;

  actorName:
    string | null;
};

/* ========================================================================== */
/* REQUIRE ACADEMIC OPERATIONS ACCESS                                         */
/* ========================================================================== */

export async function requireAcademicOptionsAccess(): Promise<
  AcademicOptionsAccess
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

  const normalizedPermissions =
    new Set(
      ACADEMIC_OPERATIONS_PERMISSIONS.map(
        (
          permission,
        ) =>
          permission
            .trim()
            .toLowerCase(),
      ),
    );

  const hasAcademicAuthority =
    Array.from(
      accessActor.permissions,
    ).some(
      (
        permission,
      ) =>
        normalizedPermissions.has(
          permission
            .trim()
            .toLowerCase() as
            (typeof ACADEMIC_OPERATIONS_PERMISSIONS)[number],
        ),
    );

  if (
    !hasAcademicAuthority
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  /*
   * Find every role that grants at least one of the
   * academic operational permissions above.
   */
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
            normalizedPermissions.has(
              rolePermission
                .permission
                .key
                .trim()
                .toLowerCase() as
                (typeof ACADEMIC_OPERATIONS_PERMISSIONS)[number],
            ),
        ),
    );

  /*
   * Teacher-only authority remains ownership-scoped.
   *
   * If another active RBAC role grants academic
   * operational authority, the actor receives global
   * option visibility.
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
    "Academic User";

  return {
    userId:
      accessActor.actor.id,

    scope:
      teacherOnlyAuthority
        ? "OWN_LESSONS"
        : "GLOBAL",

    actorRole,

    actorName,
  };
}