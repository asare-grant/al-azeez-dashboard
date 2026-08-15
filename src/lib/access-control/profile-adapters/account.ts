import "server-only";

import type {
  Prisma,
} from "@prisma/client";

export async function createAccountProvisioningProfile({
  userId,
}: {
  userId:
    string;

  identity: {
    username:
      string | null;

    imageUrl:
      string | null;
  };

  profile:
    unknown;

  tx:
    Prisma.TransactionClient;
}) {
  /*
   * No additional Prisma model currently exists
   * for legacy "account" users.
   *
   * Their authoritative local identity is:
   *
   * UserAccount
   *
   * and their effective access comes from:
   *
   * UserRoleAssignment → accountant AccessRole
   */

  return {
    type:
      "account" as const,

    userId,
  };
}