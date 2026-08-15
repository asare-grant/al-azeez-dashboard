import "server-only";

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                               ADMIN GUARD                                  */
/* -------------------------------------------------------------------------- */

async function requireLegacyAdmin() {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  /*
   * IMPORTANT:
   *
   * Phase 10C still uses the EXISTING Clerk role
   * as the protection boundary.
   *
   * RBAC is not enforcing access yet.
   */
  if (!userId || role !== "admin") {
    throw new Error("Unauthorized");
  }

  return {
    userId,
  };
}

/* -------------------------------------------------------------------------- */
/*                         ACCESS CONTROL OVERVIEW                            */
/* -------------------------------------------------------------------------- */

export async function getAccessControlOverview() {
  await requireLegacyAdmin();

  const now = new Date();

  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    suspendedUsers,
    disabledUsers,
    totalRoles,
    customRoles,
    systemRoles,
    assignments,
    expiringAssignments,
    recentUsers,
    recentActivity,
  ] = await Promise.all([
    prisma.userAccount.count(),

    prisma.userAccount.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.userAccount.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.userAccount.count({
      where: {
        status: "SUSPENDED",
      },
    }),

    prisma.userAccount.count({
      where: {
        status: "DISABLED",
      },
    }),

    prisma.accessRole.count({
      where: {
        isActive: true,
      },
    }),

    prisma.accessRole.count({
      where: {
        type: "CUSTOM",

        isActive: true,
      },
    }),

    prisma.accessRole.count({
      where: {
        type: "SYSTEM",

        isActive: true,
      },
    }),

    prisma.userRoleAssignment.count(),

    prisma.userRoleAssignment.count({
      where: {
        expiresAt: {
          gt: now,

          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    prisma.userAccount.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 6,

      select: {
        id: true,

        displayName: true,

        username: true,

        imageUrl: true,

        legacyRole: true,

        status: true,

        createdAt: true,

        roles: {
          where: {
            role: {
              isActive: true,
            },
          },

          select: {
            role: {
              select: {
                key: true,

                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.accessAuditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 8,

      select: {
        id: true,

        action: true,

        actorName: true,

        actorRole: true,

        targetUserId: true,

        reason: true,

        createdAt: true,

        targetUser: {
          select: {
            displayName: true,

            username: true,
          },
        },
      },
    }),
  ]);

  return {
    metrics: {
      totalUsers,

      activeUsers,

      pendingUsers,

      suspendedUsers,

      disabledUsers,

      totalRoles,

      customRoles,

      systemRoles,

      assignments,

      expiringAssignments,
    },

    recentUsers: recentUsers.map((user) => ({
      ...user,

      roles: user.roles.map((assignment) => assignment.role),
    })),

    recentActivity,
  };
}

/* -------------------------------------------------------------------------- */
/*                         ACCESS CONTROL USERS                               */
/* -------------------------------------------------------------------------- */

export type AccessControlUserStatusFilter =
  | "ALL"
  | "ACTIVE"
  | "PENDING"
  | "SUSPENDED"
  | "DISABLED";

export type GetAccessControlUsersInput = {
  page?: number;

  pageSize?: number;

  search?: string;

  role?: string;

  status?: AccessControlUserStatusFilter;
};

export async function getAccessControlUsers({
  page = 1,
  pageSize = 12,
  search,
  role,
  status = "ALL",
}: GetAccessControlUsersInput = {}) {
  await requireLegacyAdmin();

  const safePage = Math.max(1, Math.floor(page));

  const safePageSize = Math.min(50, Math.max(5, Math.floor(pageSize)));

  const normalizedSearch = search?.trim().slice(0, 100) || "";

  const normalizedRole = role?.trim().toLowerCase().slice(0, 100) || "";

  const safeStatus: AccessControlUserStatusFilter =
    status === "ACTIVE" ||
    status === "PENDING" ||
    status === "SUSPENDED" ||
    status === "DISABLED"
      ? status
      : "ALL";

  const where: import("@prisma/client").Prisma.UserAccountWhereInput = {
    AND: [
      normalizedSearch
        ? {
            OR: [
              {
                displayName: {
                  contains: normalizedSearch,

                  mode: "insensitive",
                },
              },

              {
                username: {
                  contains: normalizedSearch,

                  mode: "insensitive",
                },
              },

              {
                email: {
                  contains: normalizedSearch,

                  mode: "insensitive",
                },
              },

              {
                phone: {
                  contains: normalizedSearch,
                },
              },
            ],
          }
        : {},

      normalizedRole
        ? {
            roles: {
              some: {
                role: {
                  key: normalizedRole,
                },
              },
            },
          }
        : {},

      safeStatus !== "ALL"
        ? {
            status: safeStatus,
          }
        : {},
    ],
  };

  const skip = (safePage - 1) * safePageSize;

  const [users, total, roles, statusCounts, allUserCount] = await Promise.all([
    prisma.userAccount.findMany({
      where,

      orderBy: [
        {
          status: "asc",
        },

        {
          displayName: "asc",
        },

        {
          createdAt: "desc",
        },
      ],

      skip,

      take: safePageSize,

      select: {
        id: true,

        username: true,

        email: true,

        phone: true,

        displayName: true,

        imageUrl: true,

        status: true,

        legacyRole: true,

        createdAt: true,

        updatedAt: true,

        roles: {
          orderBy: {
            assignedAt: "asc",
          },

          select: {
            id: true,

            source: true,

            assignedAt: true,

            expiresAt: true,

            role: {
              select: {
                id: true,

                key: true,

                name: true,

                type: true,

                isProtected: true,

                isActive: true,
              },
            },
          },
        },
      },
    }),

    prisma.userAccount.count({
      where,
    }),

    prisma.accessRole.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          type: "asc",
        },

        {
          name: "asc",
        },
      ],

      select: {
        id: true,

        key: true,

        name: true,

        type: true,
      },
    }),

    prisma.userAccount.groupBy({
      by: ["status"],

      _count: {
        _all: true,
      },
    }),

    prisma.userAccount.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  const statusMap = new Map(
    statusCounts.map((item) => [item.status, item._count._all]),
  );

  return {
    users,

    roles,

    filters: {
      search: normalizedSearch,

      role: normalizedRole,

      status: safeStatus,
    },

    pagination: {
      page: safePage,

      pageSize: safePageSize,

      total,

      totalPages,

      hasPrevious: safePage > 1,

      hasNext: safePage < totalPages,
    },

    counts: {
      all: allUserCount,

      active: statusMap.get("ACTIVE") ?? 0,

      pending: statusMap.get("PENDING") ?? 0,

      suspended: statusMap.get("SUSPENDED") ?? 0,

      disabled: statusMap.get("DISABLED") ?? 0,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                     ROLES & PERMISSIONS CENTRE                             */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                     ROLES & PERMISSIONS CENTRE                             */
/* -------------------------------------------------------------------------- */

export async function getAccessControlRolesAndPermissions() {
  await requireLegacyAdmin();

  const [rawRoles, rawPermissions, totalAssignments] = await Promise.all([
    /* ------------------------------------------------------------------ */
    /* ROLES                                                              */
    /* ------------------------------------------------------------------ */

    prisma.accessRole.findMany({
      orderBy: [
        {
          type: "asc",
        },

        {
          name: "asc",
        },
      ],

      select: {
        id: true,

        key: true,

        name: true,

        description: true,

        type: true,

        isProtected: true,

        isActive: true,

        createdAt: true,

        updatedAt: true,

        /*
         * IMPORTANT:
         *
         * Your schema calls the user-role relation
         * "assignments", not "users".
         */
        _count: {
          select: {
            assignments: true,

            permissions: true,
          },
        },

        /*
         * RolePermission[]
         */
        permissions: {
          select: {
            permission: {
              select: {
                id: true,

                key: true,

                name: true,

                description: true,

                /*
                 * Your Permission model uses:
                 *
                 * group String
                 *
                 * not "module".
                 */
                group: true,

                sortOrder: true,

                isActive: true,
              },
            },
          },
        },
      },
    }),

    /* ------------------------------------------------------------------ */
    /* PERMISSION CATALOGUE                                                */
    /* ------------------------------------------------------------------ */

    prisma.permission.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          group: "asc",
        },

        {
          sortOrder: "asc",
        },

        {
          name: "asc",
        },
      ],

      select: {
        id: true,

        key: true,

        name: true,

        description: true,

        group: true,

        sortOrder: true,
      },
    }),

    /* ------------------------------------------------------------------ */
    /* ROLE ASSIGNMENTS                                                    */
    /* ------------------------------------------------------------------ */

    prisma.userRoleAssignment.count(),
  ]);

  /* ---------------------------------------------------------------------- */
  /* NORMALIZE ROLES FOR THE UI                                             */
  /* ---------------------------------------------------------------------- */

  /*
   * Our UI components currently expect:
   *
   * _count.users
   *
   * while Prisma correctly calls the relation:
   *
   * assignments
   *
   * Rather than changing the database schema, we simply
   * expose a presentation-friendly "users" count here.
   */

  const roles = rawRoles.map((role) => ({
    id: role.id,

    key: role.key,

    name: role.name,

    description: role.description,

    type: role.type,

    isProtected: role.isProtected,

    isActive: role.isActive,

    createdAt: role.createdAt,

    updatedAt: role.updatedAt,

    _count: {
      users: role._count.assignments,

      permissions: role._count.permissions,
    },

    /*
     * Keep only active permissions in the
     * effective matrix.
     *
     * We expose "module" as a UI alias for
     * the database "group" field so the
     * PermissionMatrix component can remain
     * clean and presentation-oriented.
     */
    permissions: role.permissions
      .filter((assignment) => assignment.permission.isActive)
      .map((assignment) => ({
        permission: {
          id: assignment.permission.id,

          key: assignment.permission.key,

          name: assignment.permission.name,

          description: assignment.permission.description,

          module: assignment.permission.group,

          sortOrder: assignment.permission.sortOrder,
        },
      }))
      .sort((a, b) => {
        if (a.permission.module !== b.permission.module) {
          return a.permission.module.localeCompare(b.permission.module);
        }

        return a.permission.sortOrder - b.permission.sortOrder;
      }),
  }));

  /* ---------------------------------------------------------------------- */
  /* NORMALIZE PERMISSION CATALOGUE FOR THE UI                              */
  /* ---------------------------------------------------------------------- */

  const permissions = rawPermissions.map((permission) => ({
    id: permission.id,

    key: permission.key,

    name: permission.name,

    description: permission.description,

    /*
     * DB = group
     * UI = module
     *
     * This is only a presentation alias.
     */
    module: permission.group,

    sortOrder: permission.sortOrder,
  }));

  /* ---------------------------------------------------------------------- */
  /* PERMISSION GROUPS                                                       */
  /* ---------------------------------------------------------------------- */

  const permissionGroupMap = new Map<string, typeof permissions>();

  for (const permission of permissions) {
    const module = permission.module || "GENERAL";

    const current = permissionGroupMap.get(module) ?? [];

    current.push(permission);

    permissionGroupMap.set(module, current);
  }

  const permissionGroups = Array.from(permissionGroupMap.entries()).map(
    ([module, items]) => ({
      module,

      permissions: items,
    }),
  );

  /* ---------------------------------------------------------------------- */
  /* METRICS                                                                 */
  /* ---------------------------------------------------------------------- */

  const systemRoles = roles.filter((role) => role.type === "SYSTEM").length;

  const customRoles = roles.filter((role) => role.type === "CUSTOM").length;

  const activeRoles = roles.filter((role) => role.isActive).length;

  const protectedRoles = roles.filter((role) => role.isProtected).length;

  /* ---------------------------------------------------------------------- */
  /* RESPONSE                                                                */
  /* ---------------------------------------------------------------------- */

  return {
    roles,

    permissions,

    permissionGroups,

    metrics: {
      totalRoles: roles.length,

      systemRoles,

      customRoles,

      activeRoles,

      protectedRoles,

      totalPermissions: permissions.length,

      totalAssignments,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                              ROLE DETAIL                                   */
/* -------------------------------------------------------------------------- */

export async function getAccessControlRoleDetail(roleId: number) {
  await requireLegacyAdmin();

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return null;
  }

  const [role, permissions] = await Promise.all([
    prisma.accessRole.findUnique({
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

        isActive: true,

        createdAt: true,

        updatedAt: true,

        assignments: {
          orderBy: {
            assignedAt: "desc",
          },

          select: {
            id: true,

            source: true,

            assignedAt: true,

            expiresAt: true,

            user: {
              select: {
                id: true,

                displayName: true,

                username: true,

                email: true,

                imageUrl: true,

                status: true,
              },
            },
          },
        },

        permissions: {
          select: {
            grantedAt: true,

            grantedBy: true,

            permission: {
              select: {
                id: true,

                key: true,

                name: true,

                description: true,

                group: true,

                sortOrder: true,

                isActive: true,
              },
            },
          },
        },
      },
    }),

    prisma.permission.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          group: "asc",
        },

        {
          sortOrder: "asc",
        },

        {
          name: "asc",
        },
      ],

      select: {
        id: true,

        key: true,

        name: true,

        description: true,

        group: true,

        sortOrder: true,
      },
    }),
  ]);

  if (!role) {
    return null;
  }

  const assignedPermissionIds = new Set(
    role.permissions
      .filter((item) => item.permission.isActive)
      .map((item) => item.permission.id),
  );

  const permissionGroups = Array.from(
    permissions.reduce((groups, permission) => {
      const current = groups.get(permission.group) ?? [];

      current.push(permission);

      groups.set(permission.group, current);

      return groups;
    }, new Map<string, typeof permissions>()),
  ).map(([group, items]) => ({
    group,

    permissions: items.map((permission) => ({
      ...permission,

      assigned: assignedPermissionIds.has(permission.id),
    })),
  }));

  return {
    role: {
      ...role,

      permissionCount: assignedPermissionIds.size,

      userCount: role.assignments.length,
    },

    permissionGroups,
  };
}

/* -------------------------------------------------------------------------- */
/*                        CUSTOM ROLE BUILDER DATA                            */
/* -------------------------------------------------------------------------- */

export async function getCustomRoleBuilderData({
  cloneRoleId,
}: {
  cloneRoleId?: number;
} = {}) {
  await requireLegacyAdmin();

  const [permissions, sourceRole] = await Promise.all([
    prisma.permission.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          group: "asc",
        },

        {
          sortOrder: "asc",
        },

        {
          name: "asc",
        },
      ],

      select: {
        id: true,

        key: true,

        name: true,

        description: true,

        group: true,

        sortOrder: true,
      },
    }),

    cloneRoleId
      ? prisma.accessRole.findUnique({
          where: {
            id: cloneRoleId,
          },

          select: {
            id: true,

            name: true,

            key: true,

            description: true,

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
        })
      : Promise.resolve(null),
  ]);

  const permissionGroups = Array.from(
    permissions.reduce((map, permission) => {
      const current = map.get(permission.group) ?? [];

      current.push(permission);

      map.set(permission.group, current);

      return map;
    }, new Map<string, typeof permissions>()),
  ).map(([group, items]) => ({
    group,

    permissions: items,
  }));

  return {
    permissionGroups,

    sourceRole: sourceRole
      ? {
          ...sourceRole,

          permissionIds: sourceRole.permissions.map(
            (item) => item.permissionId,
          ),
        }
      : null,
  };
}

/* -------------------------------------------------------------------------- */
/*                       CREATE USER WIZARD DATA                              */
/* -------------------------------------------------------------------------- */

export async function getCreateUserWizardData() {
  await requireLegacyAdmin();

  const [roles, classes, subjects, parents, students] = await Promise.all([
    prisma.accessRole.findMany({
      where: {
        isActive: true,
      },

      orderBy: [
        {
          type: "asc",
        },

        {
          name: "asc",
        },
      ],

      select: {
        id: true,

        key: true,

        name: true,

        description: true,

        type: true,

        isProtected: true,

        _count: {
          select: {
            permissions: true,
          },
        },
      },
    }),

    prisma.class.findMany({
      orderBy: {
        name: "asc",
      },

      select: {
        id: true,

        name: true,

        gradeId: true,
      },
    }),

    prisma.subject.findMany({
      orderBy: {
        name: "asc",
      },

      select: {
        id: true,

        name: true,
      },
    }),

    prisma.parent.findMany({
      orderBy: [
        {
          name: "asc",
        },

        {
          surname: "asc",
        },
      ],

      select: {
        id: true,

        name: true,

        surname: true,

        phone: true,
      },
    }),

    prisma.student.findMany({
      orderBy: [
        {
          name: "asc",
        },

        {
          surname: "asc",
        },
      ],

      select: {
        id: true,

        name: true,

        surname: true,

        studentID: true,

        parentId: true,

        class: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    roles,

    classes,

    subjects,

    parents,

    students,
  };
}
