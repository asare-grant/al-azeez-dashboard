import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  cloneAccessRoleSchema,
  createAccessRoleSchema,
  updateAccessRoleSchema,
  updateRolePermissionsSchema,
} from "./role-validation";

/* -------------------------------------------------------------------------- */
/*                           CURRENT ADMIN ACTOR                              */
/* -------------------------------------------------------------------------- */

async function requireRoleManagementAdmin() {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  /*
   * IMPORTANT:
   *
   * We still deliberately enforce through the
   * existing Clerk role during the shadow-RBAC phase.
   */
  if (!userId || role !== "admin") {
    throw new Error("Unauthorized");
  }

  const clerkUser = await currentUser();

  const actorName = clerkUser?.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
    : (clerkUser?.username ?? "Administrator");

  return {
    userId,

    role,

    actorName,
  };
}

function normalizeDescription(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized || null;
}

/* -------------------------------------------------------------------------- */
/*                           CREATE CUSTOM ROLE                               */
/* -------------------------------------------------------------------------- */

export async function createCustomAccessRole(input: unknown) {
  const actor = await requireRoleManagementAdmin();

  const parsed = createAccessRoleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,

      message: parsed.error.issues[0]?.message ?? "Invalid role details.",
    };
  }

  const { name, key, description, permissionIds } = parsed.data;

  const uniquePermissionIds = Array.from(new Set(permissionIds));

  try {
    const role = await prisma.$transaction(async (tx) => {
      /* -------------------------------------------------------------- */
      /* DUPLICATE CHECK                                                */
      /* -------------------------------------------------------------- */

      const duplicate = await tx.accessRole.findFirst({
        where: {
          OR: [
            {
              key,
            },

            {
              name: {
                equals: name,

                mode: "insensitive",
              },
            },
          ],
        },

        select: {
          id: true,
        },
      });

      if (duplicate) {
        throw new Error("ROLE_ALREADY_EXISTS");
      }

      /* -------------------------------------------------------------- */
      /* VERIFY PERMISSIONS                                             */
      /* -------------------------------------------------------------- */

      const validPermissions =
        uniquePermissionIds.length > 0
          ? await tx.permission.findMany({
              where: {
                id: {
                  in: uniquePermissionIds,
                },

                isActive: true,
              },

              select: {
                id: true,
              },
            })
          : [];

      if (validPermissions.length !== uniquePermissionIds.length) {
        throw new Error("INVALID_PERMISSION_SELECTION");
      }

      /* -------------------------------------------------------------- */
      /* ROLE                                                           */
      /* -------------------------------------------------------------- */

      const createdRole = await tx.accessRole.create({
        data: {
          key,

          name,

          description: normalizeDescription(description),

          type: "CUSTOM",

          isProtected: false,

          isActive: true,
        },

        select: {
          id: true,

          key: true,

          name: true,
        },
      });

      /* -------------------------------------------------------------- */
      /* PERMISSIONS                                                    */
      /* -------------------------------------------------------------- */

      if (validPermissions.length > 0) {
        await tx.rolePermission.createMany({
          data: validPermissions.map((permission) => ({
            roleId: createdRole.id,

            permissionId: permission.id,

            grantedBy: actor.userId,
          })),

          skipDuplicates: true,
        });
      }

      /* -------------------------------------------------------------- */
      /* AUDIT                                                          */
      /* -------------------------------------------------------------- */

      await tx.accessAuditLog.create({
        data: {
          action: "ROLE_CREATED",

          actorId: actor.userId,

          actorRole: actor.role,

          actorName: actor.actorName,

          roleId: createdRole.id,

          metadata: {
            roleKey: createdRole.key,

            roleName: createdRole.name,

            permissionIds: validPermissions.map((permission) => permission.id),
          } satisfies Prisma.InputJsonValue,
        },
      });

      return createdRole;
    });

    return {
      success: true as const,

      roleId: role.id,

      message: "Custom role created successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "ROLE_ALREADY_EXISTS") {
      return {
        success: false as const,

        message: "A role with this name or key already exists.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "INVALID_PERMISSION_SELECTION"
    ) {
      return {
        success: false as const,

        message: "One or more selected permissions are invalid.",
      };
    }

    console.error("CREATE CUSTOM ACCESS ROLE ERROR:", error);

    return {
      success: false as const,

      message: "The custom role could not be created.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                               CLONE ROLE                                   */
/* -------------------------------------------------------------------------- */

export async function cloneAccessRole(input: unknown) {
  const actor = await requireRoleManagementAdmin();

  const parsed = cloneAccessRoleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,

      message: parsed.error.issues[0]?.message ?? "Invalid clone request.",
    };
  }

  const { sourceRoleId, name, key, description } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const sourceRole = await tx.accessRole.findUnique({
        where: {
          id: sourceRoleId,
        },

        select: {
          id: true,

          key: true,

          name: true,

          permissions: {
            where: {
              permission: {
                isActive: true,
              },
            },

            select: {
              permissionId: true,
            },
          },
        },
      });

      if (!sourceRole) {
        throw new Error("SOURCE_ROLE_NOT_FOUND");
      }

      const duplicate = await tx.accessRole.findFirst({
        where: {
          OR: [
            {
              key,
            },

            {
              name: {
                equals: name,

                mode: "insensitive",
              },
            },
          ],
        },

        select: {
          id: true,
        },
      });

      if (duplicate) {
        throw new Error("ROLE_ALREADY_EXISTS");
      }

      const clonedRole = await tx.accessRole.create({
        data: {
          key,

          name,

          description:
            normalizeDescription(description) ??
            `Custom role based on ${sourceRole.name}.`,

          type: "CUSTOM",

          isProtected: false,

          isActive: true,
        },

        select: {
          id: true,

          key: true,

          name: true,
        },
      });

      if (sourceRole.permissions.length > 0) {
        await tx.rolePermission.createMany({
          data: sourceRole.permissions.map((item) => ({
            roleId: clonedRole.id,

            permissionId: item.permissionId,

            grantedBy: actor.userId,
          })),
        });
      }

      await tx.accessAuditLog.create({
        data: {
          action: "ROLE_CREATED",

          actorId: actor.userId,

          actorRole: actor.role,

          actorName: actor.actorName,

          roleId: clonedRole.id,

          metadata: {
            operation: "CLONE",

            sourceRoleId: sourceRole.id,

            sourceRoleKey: sourceRole.key,

            clonedRoleKey: clonedRole.key,

            permissionCount: sourceRole.permissions.length,
          } satisfies Prisma.InputJsonValue,
        },
      });

      return clonedRole;
    });

    return {
      success: true as const,

      roleId: result.id,

      message: "Role cloned successfully.",
    };
  } catch (error) {
    console.error("CLONE ACCESS ROLE ERROR:", error);

    return {
      success: false as const,

      message:
        error instanceof Error && error.message === "ROLE_ALREADY_EXISTS"
          ? "A role with this name or key already exists."
          : "The role could not be cloned.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                         UPDATE CUSTOM ROLE                                 */
/* -------------------------------------------------------------------------- */

export async function updateCustomAccessRole(input: unknown) {
  const actor = await requireRoleManagementAdmin();

  const parsed = updateAccessRoleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,

      message: parsed.error.issues[0]?.message ?? "Invalid role details.",
    };
  }

  const { roleId, name, description } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.accessRole.findUnique({
        where: {
          id: roleId,
        },

        select: {
          id: true,

          key: true,

          name: true,

          description: true,

          type: true,

          isProtected: true,
        },
      });

      if (!existing) {
        throw new Error("ROLE_NOT_FOUND");
      }

      if (existing.isProtected || existing.type === "SYSTEM") {
        throw new Error("PROTECTED_ROLE");
      }

      const duplicateName = await tx.accessRole.findFirst({
        where: {
          id: {
            not: existing.id,
          },

          name: {
            equals: name,

            mode: "insensitive",
          },
        },

        select: {
          id: true,
        },
      });

      if (duplicateName) {
        throw new Error("ROLE_NAME_EXISTS");
      }

      await tx.accessRole.update({
        where: {
          id: roleId,
        },

        data: {
          name,

          description: normalizeDescription(description),
        },
      });

      await tx.accessAuditLog.create({
        data: {
          action: "ROLE_UPDATED",

          actorId: actor.userId,

          actorRole: actor.role,

          actorName: actor.actorName,

          roleId: existing.id,

          metadata: {
            before: {
              name: existing.name,

              description: existing.description,
            },

            after: {
              name,

              description: normalizeDescription(description),
            },
          } satisfies Prisma.InputJsonValue,
        },
      });
    });

    return {
      success: true as const,

      message: "Role updated successfully.",
    };
  } catch (error) {
    const code = error instanceof Error ? error.message : "";

    return {
      success: false as const,

      message:
        code === "PROTECTED_ROLE"
          ? "Protected system roles cannot be edited."
          : code === "ROLE_NAME_EXISTS"
            ? "Another role already uses this name."
            : "The role could not be updated.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                       UPDATE ROLE PERMISSIONS                              */
/* -------------------------------------------------------------------------- */

export async function updateCustomRolePermissions(input: unknown) {
  const actor = await requireRoleManagementAdmin();

  const parsed = updateRolePermissionsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,

      message: "Invalid permission selection.",
    };
  }

  const { roleId, permissionIds } = parsed.data;

  const requestedPermissionIds = Array.from(new Set(permissionIds));

  try {
    const result = await prisma.$transaction(async (tx) => {
      const role = await tx.accessRole.findUnique({
        where: {
          id: roleId,
        },

        select: {
          id: true,

          type: true,

          isProtected: true,

          permissions: {
            select: {
              permissionId: true,
            },
          },
        },
      });

      if (!role) {
        throw new Error("ROLE_NOT_FOUND");
      }

      if (role.isProtected || role.type === "SYSTEM") {
        throw new Error("PROTECTED_ROLE");
      }

      const validPermissions =
        requestedPermissionIds.length > 0
          ? await tx.permission.findMany({
              where: {
                id: {
                  in: requestedPermissionIds,
                },

                isActive: true,
              },

              select: {
                id: true,
              },
            })
          : [];

      if (validPermissions.length !== requestedPermissionIds.length) {
        throw new Error("INVALID_PERMISSION");
      }

      const existing = new Set(
        role.permissions.map((item) => item.permissionId),
      );

      const requested = new Set(validPermissions.map((item) => item.id));

      const toAdd = Array.from(requested).filter((id) => !existing.has(id));

      const toRemove = Array.from(existing).filter((id) => !requested.has(id));

      if (toRemove.length > 0) {
        await tx.rolePermission.deleteMany({
          where: {
            roleId,

            permissionId: {
              in: toRemove,
            },
          },
        });
      }

      if (toAdd.length > 0) {
        await tx.rolePermission.createMany({
          data: toAdd.map((permissionId) => ({
            roleId,

            permissionId,

            grantedBy: actor.userId,
          })),

          skipDuplicates: true,
        });
      }

      /*
       * Write individual audit entries.
       */
      if (toAdd.length > 0) {
        await tx.accessAuditLog.createMany({
          data: toAdd.map((permissionId) => ({
            action: "PERMISSION_ADDED" as const,

            actorId: actor.userId,

            actorRole: actor.role,

            actorName: actor.actorName,

            roleId,

            permissionId,
          })),
        });
      }

      if (toRemove.length > 0) {
        await tx.accessAuditLog.createMany({
          data: toRemove.map((permissionId) => ({
            action: "PERMISSION_REMOVED" as const,

            actorId: actor.userId,

            actorRole: actor.role,

            actorName: actor.actorName,

            roleId,

            permissionId,
          })),
        });
      }

      return {
        added: toAdd.length,

        removed: toRemove.length,
      };
    });

    return {
      success: true as const,

      added: result.added,

      removed: result.removed,

      message: "Role permissions updated.",
    };
  } catch (error) {
    return {
      success: false as const,

      message:
        error instanceof Error && error.message === "PROTECTED_ROLE"
          ? "Protected system-role permissions cannot be changed."
          : "The role permissions could not be updated.",
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                           RETIRE CUSTOM ROLE                               */
/* -------------------------------------------------------------------------- */

export async function retireCustomAccessRole(roleId: number) {
  const actor = await requireRoleManagementAdmin();

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return {
      success: false  as const,

      message: "Invalid role.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const role = await tx.accessRole.findUnique({
        where: {
          id: roleId,
        },

        select: {
          id: true,

          name: true,

          key: true,

          type: true,

          isProtected: true,

          isActive: true,

          _count: {
            select: {
              assignments: true,
            },
          },
        },
      });

      if (!role) {
        throw new Error("ROLE_NOT_FOUND");
      }

      if (role.isProtected || role.type === "SYSTEM") {
        throw new Error("PROTECTED_ROLE");
      }

      /*
       * Important:
       *
       * We allow historical assignments to remain.
       * Once isActive=false, the authorization context
       * already ignores this role.
       */
      await tx.accessRole.update({
        where: {
          id: role.id,
        },

        data: {
          isActive: false,
        },
      });

      await tx.accessAuditLog.create({
        data: {
          action: "ROLE_UPDATED",

          actorId: actor.userId,

          actorRole: actor.role,

          actorName: actor.actorName,

          roleId: role.id,

          reason: "Role retired",

          metadata: {
            operation: "RETIRE",

            roleKey: role.key,

            roleName: role.name,

            assignmentCount: role._count.assignments,
          } satisfies Prisma.InputJsonValue,
        },
      });
    });

    return {
      success: true as const,

      message: "Role retired successfully.",
    };
  } catch (error) {
    return {
      success: false as const,

      message:
        error instanceof Error && error.message === "PROTECTED_ROLE"
          ? "Protected system roles cannot be retired."
          : "The role could not be retired.",
    };
  }
}
