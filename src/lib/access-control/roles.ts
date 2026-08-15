import "server-only";

import type {
  AccessContext,
} from "./types";

import {
  getCurrentAccessContext,
} from "./context";

function normalizeRoleKey(
  roleKey:
    string,
) {
  return roleKey
    .trim()
    .toLowerCase();
}

export function contextHasRole(
  context:
    AccessContext,

  roleKey:
    string,
) {
  return context.roleKeys.has(
    normalizeRoleKey(
      roleKey,
    ),
  );
}

export function contextHasAnyRole(
  context:
    AccessContext,

  roleKeys:
    string[],
) {
  return roleKeys.some(
    (
      roleKey,
    ) =>
      contextHasRole(
        context,

        roleKey,
      ),
  );
}

export async function hasRole(
  roleKey:
    string,
) {
  const context =
    await getCurrentAccessContext();

  return contextHasRole(
    context,

    roleKey,
  );
}