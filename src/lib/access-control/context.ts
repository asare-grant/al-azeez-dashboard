import "server-only";

import {
  auth,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import type {
  AccessContext,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                          EMPTY ACCESS CONTEXT                              */
/* -------------------------------------------------------------------------- */

function emptyAccessContext(): AccessContext {
  return {
    authenticated:
      false,

    provisioned:
      false,

    userId:
      null,

    legacyRole:
      null,

    accountStatus:
      null,

    active:
      false,

    roles:
      [],

    roleKeys:
      new Set(),

    permissions:
      new Set(),

    permissionCount:
      0,

    roleCount:
      0,
  };
}

/* -------------------------------------------------------------------------- */
/*                     GET CURRENT ACCESS CONTEXT                             */
/* -------------------------------------------------------------------------- */

export async function getCurrentAccessContext(): Promise<AccessContext> {
  const {
    userId,
  } =
    await auth();

  if (
    !userId
  ) {
    return emptyAccessContext();
  }

  const now =
    new Date();

  const account =
    await prisma.userAccount.findUnique({
      where: {
        id:
          userId,
      },

      select: {
        id:
          true,

        status:
          true,

        legacyRole:
          true,

        roles: {
          where: {
            AND: [
              {
                role: {
                  isActive:
                    true,
                },
              },

              {
                OR: [
                  {
                    expiresAt:
                      null,
                  },

                  {
                    expiresAt: {
                      gt:
                        now,
                    },
                  },
                ],
              },
            ],
          },

          select: {
            role: {
              select: {
                id:
                  true,

                key:
                  true,

                name:
                  true,

                type:
                  true,

                isProtected:
                  true,

                permissions: {
                  where: {
                    permission: {
                      isActive:
                        true,
                    },
                  },

                  select: {
                    permission: {
                      select: {
                        key:
                          true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

  if (
    !account
  ) {
    return {
      ...emptyAccessContext(),

      authenticated:
        true,

      userId,
    };
  }

  const roles =
    account.roles.map(
      (
        assignment,
      ) => ({
        id:
          assignment.role.id,

        key:
          assignment.role.key,

        name:
          assignment.role.name,

        type:
          assignment.role.type,

        isProtected:
          assignment.role
            .isProtected,
      }),
    );

  const roleKeys =
    new Set(
      roles.map(
        (
          role,
        ) =>
          role.key,
      ),
    );

  const permissions =
    new Set<string>();

  for (
    const assignment of
    account.roles
  ) {
    for (
      const rolePermission of
      assignment.role
        .permissions
    ) {
      permissions.add(
        rolePermission
          .permission
          .key,
      );
    }
  }

  const active =
    account.status ===
    "ACTIVE";

  /*
   * Suspended/disabled users technically retain
   * role assignments in history, but the effective
   * access set must be empty.
   */
  const effectivePermissions =
    active
      ? permissions
      : new Set<string>();

  return {
    authenticated:
      true,

    provisioned:
      true,

    userId:
      account.id,

    legacyRole:
      account.legacyRole,

    accountStatus:
      account.status,

    active,

    roles,

    roleKeys,

    permissions:
      effectivePermissions,

    permissionCount:
      effectivePermissions.size,

    roleCount:
      roles.length,
  };
}