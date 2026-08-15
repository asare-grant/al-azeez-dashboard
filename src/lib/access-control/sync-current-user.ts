import "server-only";

import {
  currentUser,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import {
  resolveLegacyAccessRole,
} from "./legacy-role-map";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type SyncedAccessIdentity = {
  userId:
    string;

  legacyRole:
    string | null;

  accessRoleKey:
    string | null;

  accountCreated:
    boolean;

  assignmentCreated:
    boolean;
};

/* -------------------------------------------------------------------------- */
/*                       SYNC CURRENT CLERK USER                              */
/* -------------------------------------------------------------------------- */

export async function syncCurrentUserAccessIdentity(): Promise<
  SyncedAccessIdentity | null
> {
  const user =
    await currentUser();

  if (
    !user
  ) {
    return null;
  }

  const legacyRole =
    typeof user.publicMetadata.role ===
    "string"
      ? user.publicMetadata.role
          .trim()
          .toLowerCase()
      : null;

  const accessRoleKey =
    resolveLegacyAccessRole(
      legacyRole,
    );

  const displayName =
    user.firstName
      ? `${user.firstName} ${
          user.lastName ||
          ""
        }`.trim()
      : user.username ||
        null;

  const primaryEmail =
    user.emailAddresses.find(
      (
        email,
      ) =>
        email.id ===
        user.primaryEmailAddressId,
    )?.emailAddress ??
    user.emailAddresses[0]
      ?.emailAddress ??
    null;

  const primaryPhone =
    user.phoneNumbers.find(
      (
        phone,
      ) =>
        phone.id ===
        user.primaryPhoneNumberId,
    )?.phoneNumber ??
    user.phoneNumbers[0]
      ?.phoneNumber ??
    null;

  /* ---------------------------------------------------------------------- */
  /*                         USER ACCOUNT                                   */
  /* ---------------------------------------------------------------------- */

  const existingAccount =
    await prisma.userAccount.findUnique({
      where: {
        id:
          user.id,
      },

      select: {
        id:
          true,
      },
    });

  await prisma.userAccount.upsert({
    where: {
      id:
        user.id,
    },

    update: {
      username:
        user.username ||
        null,

      email:
        primaryEmail,

      phone:
        primaryPhone,

      displayName,

      imageUrl:
        user.imageUrl ||
        null,

      /*
       * This remains merely a migration /
       * compatibility hint.
       */
      legacyRole,
    },

    create: {
      id:
        user.id,

      username:
        user.username ||
        null,

      email:
        primaryEmail,

      phone:
        primaryPhone,

      displayName,

      imageUrl:
        user.imageUrl ||
        null,

      status:
        "ACTIVE",

      legacyRole,
    },
  });

  /*
   * Unknown/new roles are allowed to exist as
   * UserAccount records without automatically
   * receiving an RBAC role.
   */
  if (
    !accessRoleKey
  ) {
    return {
      userId:
        user.id,

      legacyRole,

      accessRoleKey:
        null,

      accountCreated:
        !existingAccount,

      assignmentCreated:
        false,
    };
  }

  /* ---------------------------------------------------------------------- */
  /*                         SYSTEM ROLE                                    */
  /* ---------------------------------------------------------------------- */

  const role =
    await prisma.accessRole.findUnique({
      where: {
        key:
          accessRoleKey,
      },

      select: {
        id:
          true,

        isActive:
          true,
      },
    });

  if (
    !role ||
    !role.isActive
  ) {
    console.warn(
      `RBAC system role "${accessRoleKey}" does not exist or is inactive.`,
    );

    return {
      userId:
        user.id,

      legacyRole,

      accessRoleKey,

      accountCreated:
        !existingAccount,

      assignmentCreated:
        false,
    };
  }

  const existingAssignment =
    await prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId:
            user.id,

          roleId:
            role.id,
        },
      },

      select: {
        id:
          true,
      },
    });

  if (
    !existingAssignment
  ) {
    await prisma.userRoleAssignment.create({
      data: {
        userId:
          user.id,

        roleId:
          role.id,

        /*
         * This assignment mirrors the existing
         * Clerk role during migration.
         */
        source:
          "MIGRATION",

        assignedBy:
          "legacy-role-sync",
      },
    });
  }

  return {
    userId:
      user.id,

    legacyRole,

    accessRoleKey,

    accountCreated:
      !existingAccount,

    assignmentCreated:
      !existingAssignment,
  };
}