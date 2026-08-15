import "server-only";

import type {
  AccessContext,
} from "./types";

import {
  getCurrentAccessContext,
} from "./context";

/* -------------------------------------------------------------------------- */
/*                          NORMALIZE PERMISSION                              */
/* -------------------------------------------------------------------------- */

function normalizePermission(
  permission:
    string,
) {
  return permission
    .trim()
    .toLowerCase();
}

/* -------------------------------------------------------------------------- */
/*                           CONTEXT HELPERS                                  */
/* -------------------------------------------------------------------------- */

export function contextHasPermission(
  context:
    AccessContext,

  permission:
    string,
) {
  if (
    !context.authenticated ||
    !context.active
  ) {
    return false;
  }

  const normalized =
    normalizePermission(
      permission,
    );

  if (
    !normalized
  ) {
    return false;
  }

  return context.permissions.has(
    normalized,
  );
}

export function contextHasAnyPermission(
  context:
    AccessContext,

  permissions:
    string[],
) {
  if (
    permissions.length ===
    0
  ) {
    return false;
  }

  return permissions.some(
    (
      permission,
    ) =>
      contextHasPermission(
        context,

        permission,
      ),
  );
}

export function contextHasAllPermissions(
  context:
    AccessContext,

  permissions:
    string[],
) {
  if (
    permissions.length ===
    0
  ) {
    return true;
  }

  return permissions.every(
    (
      permission,
    ) =>
      contextHasPermission(
        context,

        permission,
      ),
  );
}

/* -------------------------------------------------------------------------- */
/*                         CURRENT USER HELPERS                               */
/* -------------------------------------------------------------------------- */

export async function hasPermission(
  permission:
    string,
) {
  const context =
    await getCurrentAccessContext();

  return contextHasPermission(
    context,

    permission,
  );
}

export async function hasAnyPermission(
  permissions:
    string[],
) {
  const context =
    await getCurrentAccessContext();

  return contextHasAnyPermission(
    context,

    permissions,
  );
}

export async function hasAllPermissions(
  permissions:
    string[],
) {
  const context =
    await getCurrentAccessContext();

  return contextHasAllPermissions(
    context,

    permissions,
  );
}