import "server-only";

import {
  AccessDeniedError,
  AccountInactiveError,
} from "./errors";

import {
  getCurrentAccessContext,
} from "./context";

import {
  contextHasAllPermissions,
  contextHasAnyPermission,
  contextHasPermission,
} from "./permissions";

/* -------------------------------------------------------------------------- */
/*                        REQUIRE ACTIVE ACCOUNT                              */
/* -------------------------------------------------------------------------- */

export async function requireActiveAccessContext() {
  const context =
    await getCurrentAccessContext();

  if (
    !context.authenticated
  ) {
    throw new AccessDeniedError({
      message:
        "You must be signed in.",
    });
  }

  if (
    !context.provisioned
  ) {
    throw new AccessDeniedError({
      message:
        "Your access profile has not been provisioned.",
    });
  }

  if (
    !context.active
  ) {
    throw new AccountInactiveError();
  }

  return context;
}

/* -------------------------------------------------------------------------- */
/*                        REQUIRE PERMISSION                                  */
/* -------------------------------------------------------------------------- */

export async function requirePermission(
  permission:
    string,
) {
  const context =
    await requireActiveAccessContext();

  if (
    !contextHasPermission(
      context,

      permission,
    )
  ) {
    throw new AccessDeniedError({
      permission,

      message:
        `Permission "${permission}" is required.`,
    });
  }

  return context;
}

/* -------------------------------------------------------------------------- */
/*                     REQUIRE ANY PERMISSION                                 */
/* -------------------------------------------------------------------------- */

export async function requireAnyPermission(
  permissions:
    string[],
) {
  const context =
    await requireActiveAccessContext();

  if (
    !contextHasAnyPermission(
      context,

      permissions,
    )
  ) {
    throw new AccessDeniedError({
      message:
        "You do not have any of the permissions required for this action.",
    });
  }

  return context;
}

/* -------------------------------------------------------------------------- */
/*                     REQUIRE ALL PERMISSIONS                                */
/* -------------------------------------------------------------------------- */

export async function requireAllPermissions(
  permissions:
    string[],
) {
  const context =
    await requireActiveAccessContext();

  if (
    !contextHasAllPermissions(
      context,

      permissions,
    )
  ) {
    throw new AccessDeniedError({
      message:
        "You do not have all permissions required for this action.",
    });
  }

  return context;
}