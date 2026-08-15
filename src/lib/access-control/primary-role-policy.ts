import type {
  PrimaryApplicationRole,
} from "./provisioning-types";

export const primaryRoleRequiredAccessRole:
  Record<
    PrimaryApplicationRole,
    string
  > = {
  admin:
    "admin",

  teacher:
    "teacher",

  student:
    "student",

  parent:
    "parent",

  /*
   * Existing Clerk/application role:
   * account
   *
   * RBAC role:
   * accountant
   */
  account:
    "accountant",
};

export function getRequiredAccessRoleKey(
  role:
    PrimaryApplicationRole,
) {
  return primaryRoleRequiredAccessRole[
    role
  ];
}