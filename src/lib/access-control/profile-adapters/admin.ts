import "server-only";

import type {
  Prisma,
} from "@prisma/client";

export async function createAdminProvisioningProfile({
  userId,
  identity,
  tx,
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
  if (
    !identity.username
  ) {
    throw new Error(
      "A username is required for administrator accounts.",
    );
  }

  await tx.admin.create({
    data: {
      id:
        userId,

      username:
        identity.username,

      img:
        identity.imageUrl,
    },
  });

  return {
    type:
      "admin" as const,
  };
}