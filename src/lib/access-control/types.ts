import type {
  UserAccountStatus,
} from "@prisma/client";

export type AccessRoleSummary = {
  id:
    number;

  key:
    string;

  name:
    string;

  type:
    "SYSTEM" |
    "CUSTOM";

  isProtected:
    boolean;
};

export type AccessContext = {
  authenticated:
    boolean;

  provisioned:
    boolean;

  userId:
    string | null;

  legacyRole:
    string | null;

  accountStatus:
    UserAccountStatus | null;

  active:
    boolean;

  roles:
    AccessRoleSummary[];

  roleKeys:
    Set<string>;

  permissions:
    Set<string>;

  /*
   * Convenience property for UI/logging.
   */
  permissionCount:
    number;

  roleCount:
    number;
};