// src/lib/report-cards/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

import {
  normalizeAppRole,
} from "@/lib/navigation/roles";

import type {
  AppRole,
} from "@/lib/navigation/roles";

import prisma from "@/lib/prisma";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type ReportCardRole =
  AppRole;

export type ReportCardManagerRole =
  Extract<
    AppRole,
    | "super_admin"
    | "admin"
    | "teacher"
    | "custom"
  >;

export type ReportCardAdministrativeRole =
  Extract<
    AppRole,
    | "super_admin"
    | "admin"
    | "custom"
  >;

export type ReportCardManagementScope =
  | "GLOBAL"
  | "TEACHER_OWNED";

/* -------------------------------------------------------------------------- */
/* BASE USER CONTEXT                                                          */
/* -------------------------------------------------------------------------- */

export type ReportCardAuthContext = {
  userId:
    string;

  /*
   * Transitional normalized application persona.
   *
   * We keep this because Student, Parent and Teacher
   * ownership workflows still need a domain persona
   * while the remaining Report Card files are migrated.
   *
   * It is NOT the final authorization decision.
   */
  role:
    ReportCardRole;

  /*
   * Best normalized identity/role key available
   * from our local Access Actor.
   */
  roleKey:
    string;

  /*
   * Exact RBAC capabilities.
   */
  canView:
    boolean;

  canGenerate:
    boolean;

  canEdit:
    boolean;

  canSubmit:
    boolean;

  canReview:
    boolean;

  canPublish:
    boolean;

  canManageSettings:
    boolean;
};

/* -------------------------------------------------------------------------- */
/* MANAGER CONTEXT                                                            */
/* -------------------------------------------------------------------------- */

export type ReportCardManagerAuthContext =
  Omit<
    ReportCardAuthContext,
    "role"
  > & {
    role:
      ReportCardManagerRole;

    scope:
      ReportCardManagementScope;
  };

/* -------------------------------------------------------------------------- */
/* ADMINISTRATIVE / REVIEW CONTEXT                                            */
/* -------------------------------------------------------------------------- */

export type ReportCardAdministrativeAuthContext =
  Omit<
    ReportCardAuthContext,
    "role"
  > & {
    role:
      ReportCardAdministrativeRole;

    scope:
      "GLOBAL";
  };

/* ========================================================================== */
/* NORMALISATION HELPERS                                                      */
/* ========================================================================== */

function normalizeRoleKey(
  value:
    unknown,
) {
  return typeof value ===
    "string"
    ? value
        .trim()
        .toLowerCase()
    : "";
}

/* ========================================================================== */
/* PERMISSION GRANT HELPERS                                                   */
/* ========================================================================== */

function assignmentGrantsPermission(
  assignment: {
    role: {
      key:
        string;

      permissions: {
        permission: {
          key:
            string;

          isActive:
            boolean;
        };
      }[];
    };
  },

  permission:
    string,
) {
  const normalizedPermission =
    permission
      .trim()
      .toLowerCase();

  return assignment.role.permissions.some(
    (
      rolePermission,
    ) =>
      rolePermission.permission
        .isActive &&
      rolePermission.permission.key
        .trim()
        .toLowerCase() ===
        normalizedPermission,
  );
}

/* ========================================================================== */
/* RESOLVE TEACHER-OWNED MANAGEMENT SCOPE                                     */
/* ========================================================================== */

function resolveReportCardManagementScope({
  activeAssignments,
}: {
  activeAssignments: {
    role: {
      key:
        string;

      permissions: {
        permission: {
          key:
            string;

          isActive:
            boolean;
        };
      }[];
    };
  }[];
}): ReportCardManagementScope {
  /*
   * These are the permissions that place an actor
   * inside a report-card management workflow.
   *
   * report_cards.view alone is deliberately excluded:
   * students and parents may legitimately hold view.
   */
  const managementPermissions = [
    "report_cards.generate",
    "report_cards.edit",
    "report_cards.submit",
    "report_cards.review",
    "report_cards.publish",
    "report_cards.settings",
  ];

  const grantingAssignments =
    activeAssignments.filter(
      (
        assignment,
      ) =>
        managementPermissions.some(
          (
            permission,
          ) =>
            assignmentGrantsPermission(
              assignment,
              permission,
            ),
        ),
    );

  /*
   * Teacher ownership applies only when every
   * role that grants management authority is Teacher.
   *
   * Example:
   *
   * Teacher + Parent
   * where only Teacher grants report-card management
   * remains TEACHER_OWNED.
   *
   * Teacher + Academic Director
   * where Academic Director grants management authority
   * becomes GLOBAL.
   */
  const teacherOwned =
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

  return teacherOwned
    ? "TEACHER_OWNED"
    : "GLOBAL";
}

/* ========================================================================== */
/* REQUIRE REPORT-CARD USER                                                   */
/* ========================================================================== */

export async function requireReportCardUser(): Promise<ReportCardAuthContext> {
  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor
  ) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  /* ------------------------------------------------------------------------ */
  /* IDENTITY PERSONA                                                         */
  /* ------------------------------------------------------------------------ */

  /*
   * Prefer the local normalized legacy persona.
   *
   * Unlike the previous implementation, this does
   * not read authorization identity from Clerk
   * session metadata.
   */
  const legacyRoleKey =
    normalizeRoleKey(
      accessActor.actor
        .legacyRole,
    );

  const activeRoleKeys =
    accessActor.activeAssignments
      .map(
        (
          assignment,
        ) =>
          assignment.role.key
            .trim()
            .toLowerCase(),
      )
      .filter(
        Boolean,
      );

  /*
   * If legacyRole is unavailable, prefer a known
   * domain persona from active RBAC assignments.
   */
  const knownPersona =
    [
      "super_admin",
      "admin",
      "teacher",
      "student",
      "parent",
    ].find(
      (
        key,
      ) =>
        activeRoleKeys.includes(
          key,
        ),
    );

  const roleKey =
    legacyRoleKey ||
    knownPersona ||
    activeRoleKeys[0] ||
    "custom";

  const role =
    normalizeAppRole(
      roleKey,
    );

  /* ------------------------------------------------------------------------ */
  /* CAPABILITIES                                                             */
  /* ------------------------------------------------------------------------ */

  return {
    userId:
      accessActor.actor.id,

    role,

    roleKey,

    canView:
      accessActor.can(
        "report_cards.view",
      ),

    canGenerate:
      accessActor.can(
        "report_cards.generate",
      ),

    canEdit:
      accessActor.can(
        "report_cards.edit",
      ),

    canSubmit:
      accessActor.can(
        "report_cards.submit",
      ),

    canReview:
      accessActor.can(
        "report_cards.review",
      ),

    canPublish:
      accessActor.can(
        "report_cards.publish",
      ),

    canManageSettings:
      accessActor.can(
        "report_cards.settings",
      ),
  };
}

/* ========================================================================== */
/* REQUIRE REPORT-CARD MANAGER                                                */
/* ========================================================================== */

export async function requireReportCardManager(): Promise<ReportCardManagerAuthContext> {
  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor
  ) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const user =
    await requireReportCardUser();

  /*
   * report_cards.view by itself is not enough to
   * enter the management workspace.
   *
   * Students and parents may hold view permission.
   */
  const hasManagementAuthority =
    user.canGenerate ||
    user.canEdit ||
    user.canSubmit ||
    user.canReview ||
    user.canPublish ||
    user.canManageSettings;

  if (
    !hasManagementAuthority
  ) {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  const scope =
    resolveReportCardManagementScope({
      activeAssignments:
        accessActor.activeAssignments,
    });

  /*
   * Preserve the transitional persona expected
   * by existing Report Card queries.
   *
   * Authorization itself comes from RBAC above.
   */
  const role:
    ReportCardManagerRole =
    scope ===
    "TEACHER_OWNED"
      ? "teacher"
      : user.role ===
            "admin" ||
          user.role ===
            "super_admin"
        ? user.role
        : "custom";

  return {
    ...user,

    role,

    scope,
  };
}

/* ========================================================================== */
/* REQUIRE EXACT REPORT-CARD PERMISSION                                       */
/* ========================================================================== */

// export async function requireReportCardPermission(
//   permission:
//     | "report_cards.view"
//     | "report_cards.generate"
//     | "report_cards.edit"
//     | "report_cards.submit"
//     | "report_cards.review"
//     | "report_cards.publish"
//     | "report_cards.settings",
// ) {
//   const accessActor =
//     await getCurrentAccessActor();

//   if (
//     !accessActor
//   ) {
//     throw new Error(
//       "UNAUTHENTICATED",
//     );
//   }

//   if (
//     !accessActor.can(
//       permission,
//     )
//   ) {
//     throw new Error(
//       "UNAUTHORISED",
//     );
//   }

//   return {
//     userId:
//       accessActor.actor.id,

//     permission,
//   };
// }

export async function requireReportCardPermission(
  permission:
    | "report_cards.view"
    | "report_cards.generate"
    | "report_cards.edit"
    | "report_cards.submit"
    | "report_cards.review"
    | "report_cards.publish"
    | "report_cards.settings",
) {
  /*
   * Resolve the manager context first.
   *
   * This gives us:
   * - authenticated user ID
   * - normalized transitional role
   * - RBAC capabilities
   * - ownership scope
   *
   * Exact authorization is still enforced below
   * using the requested permission.
   */
  const user = await requireReportCardManager();

  const hasPermission =
    permission === "report_cards.view"
      ? user.canView
      : permission === "report_cards.generate"
        ? user.canGenerate
        : permission === "report_cards.edit"
          ? user.canEdit
          : permission === "report_cards.submit"
            ? user.canSubmit
            : permission === "report_cards.review"
              ? user.canReview
              : permission === "report_cards.publish"
                ? user.canPublish
                : user.canManageSettings;

  if (!hasPermission) {
    throw new Error("UNAUTHORISED");
  }

  return {
    ...user,

    permission,
  };
}



/* ========================================================================== */
/* REQUIRE REPORT-CARD GENERATION ACCESS                                      */
/* ========================================================================== */

export async function requireReportCardGenerationAccess(
  classId: number,
) {
  /*
   * Report-card generation has two valid authorization paths:
   *
   * 1. GLOBAL GENERATION AUTHORITY
   *    A user holding report_cards.generate may generate report cards
   *    according to their normal RBAC authority.
   *
   * 2. CLASS-SUPERVISOR AUTHORITY
   *    A teacher may generate report cards for the specific class that
   *    they supervise, even when they do not hold the global
   *    report_cards.generate permission.
   *
   * Teaching a lesson in a class does NOT grant generation authority.
   */

  if (
    !Number.isInteger(classId) ||
    classId <= 0
  ) {
    throw new Error("INVALID_CLASS");
  }

  const user =
    await requireReportCardManager();

  /*
   * Users with the explicit global generation capability retain their
   * existing authority.
   */
  if (user.canGenerate) {
    return {
      ...user,

      generationAccess:
        "GLOBAL" as const,
    };
  }

  /*
   * Otherwise, generation authority must come from direct
   * class supervision.
   */
  const supervisedClass =
    await prisma.class.findFirst({
      where: {
        id: classId,
        supervisorId: user.userId,
      },

      select: {
        id: true,
      },
    });

  if (!supervisedClass) {
    throw new Error("UNAUTHORISED");
  }

  return {
    ...user,

    scope:
      "TEACHER_OWNED" as const,

    generationAccess:
      "CLASS_SUPERVISOR" as const,
  };
}
/* ========================================================================== */
/* REQUIRE REPORT-CARD ADMINISTRATIVE / REVIEW AUTHORITY                      */
/* ========================================================================== */

export async function requireReportCardAdmin(): Promise<ReportCardAdministrativeAuthContext> {
  const user =
    await requireReportCardManager();

  /*
   * Administrative review authority is now based
   * on the exact review capability rather than
   * literal admin identity.
   *
   * Teacher-only managers are deliberately excluded
   * from the global administrative workflow.
   */
  if (
    user.scope !==
      "GLOBAL" ||
    !user.canReview
  ) {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  return {
    ...user,

    role:
      user.role ===
        "admin" ||
      user.role ===
        "super_admin"
        ? user.role
        : "custom",

    scope:
      "GLOBAL",
  };
}