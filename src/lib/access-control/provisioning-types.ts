export const primaryApplicationRoles = [
  "admin",
  "teacher",
  "student",
  "parent",
  "account",
] as const;

export type PrimaryApplicationRole =
  (typeof primaryApplicationRoles)[number];

export type UserProvisioningIdentity = {
  firstName:
    string;

  lastName:
    string;

  email:
    string;

  phone:
    string | null;

  username:
    string;

  imageUrl:
    string | null;
};

export type UserProvisioningAccess = {
  primaryRole:
    PrimaryApplicationRole;

  roleIds:
    number[];
};

export type UserProvisioningAccount = {
  password:
    string;
};

/*
 * Domain-specific school-profile information.
 *
 * We deliberately keep this generic here.
 * Student/Teacher/Parent/Account adapters will
 * validate their own profile payload.
 */
export type UserProvisioningInput = {
  identity:
    UserProvisioningIdentity;

  access:
    UserProvisioningAccess;

  account:
    UserProvisioningAccount;

  profile:
    unknown;
};