// src/lib/assessments/auth.ts

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

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AssessmentUserRole =
  AppRole;

export type AssessmentAccessScope =
  | "GLOBAL"
  | "OWN_LESSONS";

export type AssessmentAuthContext = {
  userId:
    string;

  role:
    AssessmentUserRole;

  /*
   * Compatibility/persona role key.
   *
   * Authorization itself does NOT depend on this.
   */
  roleKey:
    string;

  scope:
    AssessmentAccessScope;

  permissions:
    ReadonlySet<string>;
};

/* ========================================================================== */
/* ROLE/PERSONA RESOLUTION                                                    */
/* ========================================================================== */

function getActorRoleKey(
  accessActor:
    NonNullable<
      Awaited<
        ReturnType<
          typeof getCurrentAccessActor
        >
      >
    >,
) {
  /*
   * Prefer the legacy application persona when present.
   *
   * This remains useful for:
   *
   * teacher
   * student
   * parent
   * account
   *
   * It is NOT being used as the authorization decision.
   */
  const legacyRole =
    accessActor.actor
      .legacyRole
      ?.trim()
      .toLowerCase();

  if (
    legacyRole
  ) {
    return legacyRole;
  }

  /*
   * For identities without a legacy persona,
   * preserve one active RBAC role key for
   * display/persona compatibility.
   */
  const activeRoleKey =
    accessActor
      .activeAssignments[0]
      ?.role.key
      ?.trim()
      .toLowerCase();

  return (
    activeRoleKey ||
    "custom"
  );
}


/* ========================================================================== */
/* PERMISSION-AWARE MANAGEMENT SCOPE                                          */
/* ========================================================================== */

/* ========================================================================== */
/* PERMISSION-AWARE ASSESSMENT SCOPE                                          */
/* ========================================================================== */

function getAssessmentPermissionScope(
  accessActor: NonNullable<
    Awaited<
      ReturnType<
        typeof getCurrentAccessActor
      >
    >
  >,
  permission: AssessmentPermission,
): AssessmentAccessScope {
  const normalizedPermission =
    permission
      .trim()
      .toLowerCase();

  const grantingAssignments =
    accessActor.activeAssignments.filter(
      (assignment) =>
        assignment.role.permissions.some(
          (rolePermission) =>
            rolePermission.permission.isActive &&
            rolePermission.permission.key
              .trim()
              .toLowerCase() ===
              normalizedPermission,
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
    ? "OWN_LESSONS"
    : "GLOBAL";
}
/* ========================================================================== */
/* REQUIRE AUTHENTICATED ASSESSMENT USER                                      */
/* ========================================================================== */

export async function requireAssessmentUser(): Promise<AssessmentAuthContext> {
  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor
  ) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const roleKey =
    getActorRoleKey(
      accessActor,
    );

  const role =
    normalizeAppRole(
      roleKey,
    );

  /*
   * Scope is an ownership concept, not authorization.
   *
   * A Teacher is limited to lessons assigned to that
   * teacher.
   *
   * Other authorized administrative/delegated roles
   * operate globally unless a future role-specific
   * scope model says otherwise.
   */
  const scope:
    AssessmentAccessScope =
    role === "teacher"
      ? "OWN_LESSONS"
      : "GLOBAL";

  return {
    userId:
      accessActor.actor.id,

    role,

    roleKey,

    scope,

    permissions:
      accessActor.permissions,
  };
}

/* ========================================================================== */
/* REQUIRE ASSESSMENT VIEW ACCESS                                             */
/* ========================================================================== */

// export async function requireAssessmentViewer(): Promise<AssessmentAuthContext> {
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
//       "assessments.view",
//     )
//   ) {
//     throw new Error(
//       "UNAUTHORIZED",
//     );
//   }

//   const roleKey =
//     getActorRoleKey(
//       accessActor,
//     );

//   const role =
//     normalizeAppRole(
//       roleKey,
//     );

//   return {
//     userId:
//       accessActor.actor.id,

//     role,

//     roleKey,

//     scope:
//       role === "teacher"
//         ? "OWN_LESSONS"
//         : "GLOBAL",

//     permissions:
//       accessActor.permissions,
//   };
// }

export async function requireAssessmentViewer(): Promise<AssessmentAuthContext> {
  return requireAssessmentPermission("assessments.view");
}
/* ========================================================================== */
/* REQUIRE EXACT ASSESSMENT PERMISSION                                        */
/* ========================================================================== */

export type AssessmentPermission =
  | "assessments.view"
  | "assessments.create"
  | "assessments.publish"
  | "assessments.grade";

export async function requireAssessmentPermission(
  permission: AssessmentPermission,
): Promise<AssessmentAuthContext> {
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

  const roleKey =
    getActorRoleKey(
      accessActor,
    );

  const role =
    normalizeAppRole(
      roleKey,
    );

  return {
    userId:
      accessActor.actor.id,

    role,

    roleKey,

    scope:
      getAssessmentPermissionScope(
        accessActor,
        permission,
      ),

    permissions:
      accessActor.permissions,
  };
}



export async function requireAssessmentPermissions(
  permissions: readonly AssessmentPermission[],
): Promise<AssessmentAuthContext> {
  const accessActor =
    await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const hasEveryPermission =
    permissions.every(
      (permission) =>
        accessActor.can(
          permission,
        ),
    );

  if (!hasEveryPermission) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  const roleKey =
    getActorRoleKey(
      accessActor,
    );

  const role =
    normalizeAppRole(
      roleKey,
    );

  const scope:
    AssessmentAccessScope =
    permissions.every(
      (permission) =>
        getAssessmentPermissionScope(
          accessActor,
          permission,
        ) === "GLOBAL",
    )
      ? "GLOBAL"
      : "OWN_LESSONS";

  return {
    userId:
      accessActor.actor.id,

    role,

    roleKey,

    scope,

    permissions:
      accessActor.permissions,
  };
}
/* ========================================================================== */
/* REQUIRE ASSESSMENT MANAGER                                                 */
/* ========================================================================== */

export async function requireAssessmentManagementViewer(): Promise<AssessmentAuthContext> {
  /*
   * Management workspaces may be used by different
   * delegated assessment roles.
   *
   * A user must:
   * 1. be allowed to view assessments, and
   * 2. hold at least one management capability.
   *
   * This helper is for READ-ONLY management queries.
   * Mutations must use requireAssessmentPermission()
   * or requireAssessmentPermissions() with the exact
   * capability required by that action.
   */
  const user =
    await requireAssessmentViewer();

  const managementAuthority =
    user.permissions.has(
      "assessments.create",
    ) ||
    user.permissions.has(
      "assessments.publish",
    ) ||
    user.permissions.has(
      "assessments.grade",
    );

  if (
    !managementAuthority
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  return user;
}

/* ========================================================================== */
/* REQUIRE STUDENT                                                            */
/* ========================================================================== */

export async function requireAssessmentStudent(): Promise<AssessmentAuthContext> {
  const user =
    await requireAssessmentViewer();

  /*
   * This is a PERSONA/OWNERSHIP requirement,
   * not an administrative authorization rule.
   *
   * Student assessment routes operate on the
   * authenticated student's own records.
   */
  if (
    user.role !==
    "student"
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  return {
    ...user,

    scope:
      "GLOBAL",
  };
}

/* ========================================================================== */
/* REQUIRE PARENT                                                             */
/* ========================================================================== */

export async function requireAssessmentParent(): Promise<AssessmentAuthContext> {
  const user =
    await requireAssessmentViewer();

  /*
   * Parent-specific endpoints use this persona only
   * to establish parent -> child ownership.
   */
  if (
    user.role !==
    "parent"
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  return {
    ...user,

    scope:
      "GLOBAL",
  };
}