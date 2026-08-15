import "server-only";

type RoleLike = {
  key: string;
  isActive: boolean;
  isProtected: boolean;
};

type AssignmentLike = {
  expiresAt: Date | null;
  role: RoleLike;
};

export type AccountHierarchyUser = {
  id: string;
  legacyRole: string | null;

  roles: AssignmentLike[];
};

export type ProtectedAction =
  | "EDIT_USER"
  | "RESET_PASSWORD"
  | "MANAGE_STATUS"
  | "MANAGE_ROLES";

/* ========================================================================== */
/* ROLE TRUST LEVELS                                                          */
/* ========================================================================== */

/*
 * Higher number = more privileged.
 *
 * IMPORTANT:
 * Replace/add keys here to match the real system-role keys
 * you use in AccessRole.
 */
const ROLE_TRUST_LEVEL: Record<string, number> = {
  super_admin: 1000,

  admin: 800,

  user_manager: 600,

  helpdesk: 500,

  accountant: 400,

  teacher: 300,

  parent: 200,

  student: 100,

  account: 100,
};

/* ========================================================================== */
/* ROLE TRUST                                                                 */
/* ========================================================================== */

export function getRoleTrustLevel(
  role:
    | string
    | {
        key: string;
      },
) {
  const key = typeof role === "string" ? role : role.key;

  return ROLE_TRUST_LEVEL[key.trim().toLowerCase()] ?? 0;
}

/* ========================================================================== */
/* TRUST RESOLUTION                                                           */
/* ========================================================================== */

function getActiveAssignments(user: AccountHierarchyUser) {
  const now = new Date();

  return user.roles.filter(
    (assignment) =>
      assignment.role.isActive &&
      (!assignment.expiresAt || assignment.expiresAt > now),
  );
}

export function getAccountTrustLevel(user: AccountHierarchyUser) {
  const activeAssignments = getActiveAssignments(user);

  const roleLevels = activeAssignments.map((assignment) =>
    getRoleTrustLevel(assignment.role),
  );

  /*
   * Transitional fallback for legacy identities.
   */
  if (roleLevels.length === 0 && user.legacyRole) {
    roleLevels.push(getRoleTrustLevel(user.legacyRole));
  }

  return Math.max(0, ...roleLevels);
}

/* ========================================================================== */
/* PROTECTED ROLE DETECTION                                                   */
/* ========================================================================== */

export function hasProtectedAccessRole(user: AccountHierarchyUser) {
  return getActiveAssignments(user).some(
    (assignment) => assignment.role.isProtected,
  );
}

/* ========================================================================== */
/* MANAGEMENT POLICY                                                         */
/* ========================================================================== */

export function canActorManageTarget({
  actor,
  target,
  action,
}: {
  actor: AccountHierarchyUser;
  target: AccountHierarchyUser;
  action: ProtectedAction;
}) {
  const actorTrust = getAccountTrustLevel(actor);

  const targetTrust = getAccountTrustLevel(target);

  const targetProtected = hasProtectedAccessRole(target);

  /* ------------------------------------------------------------------------ */
  /* SELF MANAGEMENT                                                         */
  /* ------------------------------------------------------------------------ */

  if (actor.id === target.id) {
    if (
      action === "RESET_PASSWORD" ||
      action === "MANAGE_STATUS" ||
      action === "MANAGE_ROLES"
    ) {
      return {
        allowed: false,
        reason:
          action === "RESET_PASSWORD"
            ? "Use your personal account security settings to reset your own password."
            : action === "MANAGE_ROLES"
              ? "You cannot change your own administrative role assignments through this workflow."
              : "You cannot suspend, disable or otherwise change your own administrative lifecycle state.",
        code: "SELF_PROTECTED" as const,
        actorTrust,
        targetTrust,
        targetProtected,
      };
    }

    /*
     * Editing ordinary profile/contact information on yourself
     * remains allowed if the caller has users.update.
     */
  }

  /* ------------------------------------------------------------------------ */
  /* HIGHER PRIVILEGE TARGET                                                 */
  /* ------------------------------------------------------------------------ */

  if (targetTrust > actorTrust) {
    return {
      allowed: false,
      reason:
        "This account has a higher security authority than your current account.",
      code: "TARGET_HIGHER_PRIVILEGE" as const,
      actorTrust,
      targetTrust,
      targetProtected,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* EQUAL PRIVILEGE TARGET                                                  */
  /* ------------------------------------------------------------------------ */

  if (targetTrust === actorTrust && actor.id !== target.id && targetTrust > 0) {
    return {
      allowed: false,
      reason:
        "Accounts at the same security authority level cannot perform this sensitive action against each other.",
      code: "TARGET_EQUAL_PRIVILEGE" as const,
      actorTrust,
      targetTrust,
      targetProtected,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* PROTECTED TARGET ROLE                                                   */
  /* ------------------------------------------------------------------------ */

  if (targetProtected && actorTrust <= targetTrust) {
    return {
      allowed: false,
      reason:
        "This account contains a protected system role and cannot be managed by your current authority level.",
      code: "TARGET_PROTECTED" as const,
      actorTrust,
      targetTrust,
      targetProtected,
    };
  }

  return {
    allowed: true,
    reason: null,
    code: "ALLOWED" as const,
    actorTrust,
    targetTrust,
    targetProtected,
  };
}

/* ========================================================================== */
/* ROLE ASSIGNMENT AUTHORITY                                                  */
/* ========================================================================== */

export type ManageableRole = {
  key: string;
  isActive: boolean;
  isProtected: boolean;
};

export function canActorAssignRole({
  actor,
  role,
}: {
  actor: AccountHierarchyUser;
  role: ManageableRole;
}) {
  const actorTrust = getAccountTrustLevel(actor);

  const roleTrust = getRoleTrustLevel(role);

  if (!role.isActive) {
    return {
      allowed: false,
      code: "ROLE_INACTIVE" as const,
      reason: "Inactive roles cannot be assigned.",
      actorTrust,
      roleTrust,
    };
  }

  /*
   * An administrator may not manufacture authority
   * equal to or greater than their own.
   */
  if (roleTrust >= actorTrust && roleTrust > 0) {
    return {
      allowed: false,
      code: "ROLE_AUTHORITY_TOO_HIGH" as const,
      reason:
        "You cannot assign a role at or above your own security authority.",
      actorTrust,
      roleTrust,
    };
  }

  return {
    allowed: true,
    code: "ALLOWED" as const,
    reason: null,
    actorTrust,
    roleTrust,
  };
}

export function canActorRemoveRole({
  actor,
  role,
}: {
  actor: AccountHierarchyUser;
  role: ManageableRole;
}) {
  const actorTrust = getAccountTrustLevel(actor);

  const roleTrust = getRoleTrustLevel(role);

  if (roleTrust >= actorTrust && roleTrust > 0) {
    return {
      allowed: false,
      code: "ROLE_AUTHORITY_TOO_HIGH" as const,
      reason:
        "You cannot remove a role at or above your own security authority.",
      actorTrust,
      roleTrust,
    };
  }

  return {
    allowed: true,
    code: "ALLOWED" as const,
    reason: null,
    actorTrust,
    roleTrust,
  };
}

/* ========================================================================== */
/* SENSITIVE ACTION REVERIFICATION                                            */
/* ========================================================================== */

/*
 * Adjust this if your actual Admin trust level differs.
 *
 * From our hierarchy:
 *
 * super_admin = 1000
 * admin       = 800
 */
export const HIGH_TRUST_ACCOUNT_LEVEL = 800;

export function isHighTrustAccount(user: AccountHierarchyUser) {
  return getAccountTrustLevel(user) >= HIGH_TRUST_ACCOUNT_LEVEL;
}

export function shouldRequireSensitiveReverification({
  target,
  action,
}: {
  target: AccountHierarchyUser;

  action:
    | "RESET_PASSWORD"
    | "SUSPEND_ACCOUNT"
    | "DISABLE_ACCOUNT"
    | "ACTIVATE_ACCOUNT"
    | "EDIT_USER"
    | "PRIVILEGED_ROLE_CHANGE";
}) {
  const highTrust = isHighTrustAccount(target);

  switch (action) {
    /*
     * Authentication changes against a high-trust account
     * require recent administrator verification.
     */
    case "RESET_PASSWORD":
      return highTrust;

    /*
     * Lifecycle changes against high-trust identities
     * require recent administrator verification.
     */
    case "SUSPEND_ACCOUNT":
    case "DISABLE_ACCOUNT":
    case "ACTIVATE_ACCOUNT":
      return highTrust;

    /*
     * Ordinary application-profile edits remain protected
     * by permission + account hierarchy.
     */
    case "EDIT_USER":
      return false;

    /*
     * This is only a placeholder for the role-management
     * workflow we will build later.
     *
     * That workflow should also examine the ROLE BEING
     * assigned/removed, not merely the target user's
     * current roles.
     */
    case "PRIVILEGED_ROLE_CHANGE":
      return highTrust;

    default:
      return false;
  }
}
