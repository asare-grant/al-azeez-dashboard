import "server-only";

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export type AccessControlPermissionKey =
  | "users.update"
  | "users.manage_status"
  | "users.reset_password"
  | "roles.assign"
  | "roles.remove"
  | "roles.manage_expiry";

export async function getCurrentAccessActor() {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return null;
  }

  const actor =
    await prisma.userAccount.findUnique({
      where: {
        id: userId,
      },

      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  if (!actor) {
    return null;
  }

  const now =
    new Date();

  const activeAssignments =
    actor.roles.filter(
      (assignment) =>
        assignment.role.isActive &&
        (
          !assignment.expiresAt ||
          assignment.expiresAt > now
        ),
    );

  const permissions =
    new Set(
      activeAssignments.flatMap(
        (assignment) =>
          assignment.role.permissions
            .filter(
              (rolePermission) =>
                rolePermission.permission.isActive,
            )
            .map(
              (rolePermission) =>
                rolePermission.permission.key,
            ),
      ),
    );

  /*
   * Transitional fallback.
   *
   * Existing legacy administrators retain management
   * access while the full RBAC permission catalogue is
   * being populated.
   *
   * We can remove this later once all Admin roles contain
   * the explicit permissions.
   */
  const legacyAdmin =
    actor.legacyRole
      ?.trim()
      .toLowerCase() ===
    "admin";

  function can(
    permission:
      AccessControlPermissionKey,
  ) {
    return (
      legacyAdmin ||
      permissions.has(
        permission,
      )
    );
  }

  return {
    actor,

    permissions,

    activeAssignments,

    legacyAdmin,

    can,
  };
}