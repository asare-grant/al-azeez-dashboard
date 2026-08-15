export const legacyRoleToAccessRole = {
  admin:
    "admin",

  teacher:
    "teacher",

  student:
    "student",

  parent:
    "parent",

  /*
   * Your existing application calls this role
   * "account".
   *
   * RBAC uses the more meaningful system role:
   * accountant.
   */
  account:
    "accountant",
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