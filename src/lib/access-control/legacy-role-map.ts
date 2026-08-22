export const legacyRoleToAccessRole = {
  super_admin:
    "super_admin",

  admin:
    "admin",

  teacher:
    "teacher",

  student:
    "student",

  parent:
    "parent",

  /*
 * The existing application uses the legacy
 * persona key "account".
 *
 * We intentionally keep it mapped to the
 * protected RBAC "account" role during migration.
 *
 * "accountant" remains a separate richer
 * operational role that can be assigned explicitly.
 */
account:
  "account",
} as const;

export type LegacyApplicationRole =
  keyof typeof legacyRoleToAccessRole;

export function resolveLegacyAccessRole(
  role:
    string | null | undefined,
) {
  if (
    !role
  ) {
    return null;
  }

  const normalized =
    role
      .trim()
      .toLowerCase();

  return (
    legacyRoleToAccessRole[
      normalized as LegacyApplicationRole
    ] ??
    null
  );
}