import "server-only";

import {
  auth,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

/* ========================================================================== */
/* CURRENT ACCESS ACTOR                                                       */
/* ========================================================================== */

export async function getCurrentAccessActor() {
  const {
    userId,
  } =
    await auth();

  if (
    !userId
  ) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* ACTOR                                                                    */
  /* ------------------------------------------------------------------------ */

  const actor =
    await prisma.userAccount.findUnique({
      where: {
        id:
          userId,
      },

      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission:
                      true,
                  },
                },
              },
            },
          },
        },
      },
    });

  if (
    !actor
  ) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* ACCOUNT STATUS                                                           */
  /* ------------------------------------------------------------------------ */

  /*
   * Clerk suspension/banning already prevents normal
   * authentication, but RBAC should also independently
   * refuse authority to a locally suspended/disabled
   * account.
   */
  if (
    actor.status !==
    "ACTIVE"
  ) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* ACTIVE ROLE ASSIGNMENTS                                                  */
  /* ------------------------------------------------------------------------ */

  const now =
    new Date();

  const activeAssignments =
    actor.roles.filter(
      (
        assignment,
      ) =>
        assignment.role
          .isActive &&
        (
          !assignment.expiresAt ||
          assignment.expiresAt >
            now
        ),
    );

  /* ------------------------------------------------------------------------ */
  /* EFFECTIVE PERMISSIONS                                                    */
  /* ------------------------------------------------------------------------ */

  const permissions =
    new Set<string>(
      activeAssignments.flatMap(
        (
          assignment,
        ) =>
          assignment.role.permissions
            .filter(
              (
                rolePermission,
              ) =>
                rolePermission
                  .permission
                  .isActive,
            )
            .map(
              (
                rolePermission,
              ) =>
                rolePermission
                  .permission
                  .key
                  .trim()
                  .toLowerCase(),
            ),
      ),
    );

  /* ------------------------------------------------------------------------ */
  /* PERMISSION CHECK                                                         */
  /* ------------------------------------------------------------------------ */

  function can(
    permission:
      string,
  ) {
    const normalizedPermission =
      permission
        .trim()
        .toLowerCase();

    if (
      !normalizedPermission
    ) {
      return false;
    }

    return permissions.has(
      normalizedPermission,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    actor,

    permissions,

    activeAssignments,

    can,
  };
}