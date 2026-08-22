// src/lib/access-control/system-role-sync-core.ts

import prisma from "@/lib/prisma";

import {
  permissionCatalogue,
} from "./permission-catalogue";

import {
  getSystemRoleDefinition,
  systemRoles,
} from "./system-roles";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type PermissionCatalogueSyncResult = {
  configuredCount:
    number;

  createdCount:
    number;

  updatedCount:
    number;
};

export type SystemRoleSyncResult = {
  roleKey:
    string;

  roleId:
    number;

  created:
    boolean;

  desiredCount:
    number;

  existingCount:
    number;

  addedCount:
    number;

  removedCount:
    number;

  finalCount:
    number;
};

export type SystemAccessControlSyncResult = {
  permissions:
    PermissionCatalogueSyncResult;

  roles:
    SystemRoleSyncResult[];

  summary: {
    roleCount:
      number;

    rolesCreated:
      number;

    permissionsAdded:
      number;

    permissionsRemoved:
      number;
  };
};


export type SystemRoleSyncPreview = {
  roleKey:
    string;

  roleName:
    string;

  roleExists:
    boolean;

  currentType:
    string | null;

  desiredType:
    "SYSTEM";

  currentProtected:
    boolean | null;

  desiredProtected:
    boolean;

  existingPermissions:
    string[];

  desiredPermissions:
    string[];

  permissionsToAdd:
    string[];

  permissionsToRemove:
    string[];

  metadataChanges: {
    name:
      boolean;

    description:
      boolean;

    type:
      boolean;

    isProtected:
      boolean;

    isActive:
      boolean;
  };

  hasChanges:
    boolean;
};

export type SystemAccessControlPreview = {
  permissionCatalogue: {
    configuredCount:
      number;

    existingCount:
      number;

    permissionsToCreate:
      string[];

    permissionsToUpdate:
      string[];
  };

  roles:
    SystemRoleSyncPreview[];

  summary: {
    rolesConfigured:
      number;

    rolesToCreate:
      number;

    rolesToUpdate:
      number;

    permissionAssignmentsToAdd:
      number;

    permissionAssignmentsToRemove:
      number;
  };
};

/* ========================================================================== */
/* NORMALIZATION                                                              */
/* ========================================================================== */

function normalizeKey(
  value:
    string,
) {
  return value
    .trim()
    .toLowerCase();
}

/* ========================================================================== */
/* VALIDATE CODE CONFIGURATION                                                */
/* ========================================================================== */

export function validateSystemRoleConfiguration() {
  const catalogueKeys =
    new Set(
      permissionCatalogue.map(
        (
          permission,
        ) =>
          normalizeKey(
            permission.key,
          ),
      ),
    );

  const roleKeys =
    new Set<string>();

  const roleNames =
    new Set<string>();

  const errors:
    string[] =
    [];

  for (
    const definition of
    systemRoles
  ) {
    const roleKey =
      normalizeKey(
        definition.key,
      );

    const roleName =
      definition.name
        .trim()
        .toLowerCase();

    /* ---------------------------------------------------------------------- */
    /* DUPLICATE ROLE KEYS                                                    */
    /* ---------------------------------------------------------------------- */

    if (
      roleKeys.has(
        roleKey,
      )
    ) {
      errors.push(
        `Duplicate system role key: "${roleKey}".`,
      );
    }

    roleKeys.add(
      roleKey,
    );

    /* ---------------------------------------------------------------------- */
    /* DUPLICATE ROLE NAMES                                                   */
    /* ---------------------------------------------------------------------- */

    if (
      roleNames.has(
        roleName,
      )
    ) {
      errors.push(
        `Duplicate system role name: "${definition.name}".`,
      );
    }

    roleNames.add(
      roleName,
    );

    /* ---------------------------------------------------------------------- */
    /* UNKNOWN PERMISSIONS                                                    */
    /* ---------------------------------------------------------------------- */

    for (
      const permissionKey of
      definition.permissions
    ) {
      const normalizedPermissionKey =
        normalizeKey(
          permissionKey,
        );

      if (
        !catalogueKeys.has(
          normalizedPermissionKey,
        )
      ) {
        errors.push(
          `Role "${roleKey}" references permission "${normalizedPermissionKey}", but that permission is absent from permissionCatalogue.`,
        );
      }
    }
  }

  if (
    errors.length >
    0
  ) {
    throw new Error(
      [
        "System role configuration is invalid:",
        "",
        ...errors.map(
          (
            error,
          ) =>
            `- ${error}`,
        ),
      ].join(
        "\n",
      ),
    );
  }

  return {
    valid:
      true,

    roleCount:
      systemRoles.length,

    permissionCount:
      permissionCatalogue.length,
  };
}

/* ========================================================================== */
/* SYNC PERMISSION CATALOGUE                                                  */
/* ========================================================================== */

export async function syncPermissionCatalogue(): Promise<
  PermissionCatalogueSyncResult
> {
  /*
   * Validate before touching the database.
   */
  validateSystemRoleConfiguration();

  let createdCount =
    0;

  let updatedCount =
    0;

  for (
    const definition of
    permissionCatalogue
  ) {
    const key =
      normalizeKey(
        definition.key,
      );

    const existing =
      await prisma.permission.findUnique({
        where: {
          key,
        },

        select: {
          id:
            true,

          name:
            true,

          description:
            true,

          group:
            true,

          sortOrder:
            true,

          isActive:
            true,
        },
      });

    if (
      !existing
    ) {
      await prisma.permission.create({
        data: {
          key,

          name:
            definition.name,

          description:
            definition.description,

          group:
            definition.group,

          sortOrder:
            definition.sortOrder,

          isActive:
            true,
        },
      });

      createdCount +=
        1;

      continue;
    }

    const changed =
      existing.name !==
        definition.name ||
      existing.description !==
        definition.description ||
      existing.group !==
        definition.group ||
      existing.sortOrder !==
        definition.sortOrder ||
      !existing.isActive;

    if (
      changed
    ) {
      await prisma.permission.update({
        where: {
          id:
            existing.id,
        },

        data: {
          name:
            definition.name,

          description:
            definition.description,

          group:
            definition.group,

          sortOrder:
            definition.sortOrder,

          /*
           * A permission that remains in the catalogue
           * is considered active.
           */
          isActive:
            true,
        },
      });

      updatedCount +=
        1;
    }
  }

  return {
    configuredCount:
      permissionCatalogue.length,

    createdCount,

    updatedCount,
  };
}

/* ========================================================================== */
/* ENSURE ROLE EXISTS                                                         */
/* ========================================================================== */

async function ensureConfiguredRole(
  roleKey:
    string,
) {
  const normalizedRoleKey =
    normalizeKey(
      roleKey,
    );

  const definition =
    getSystemRoleDefinition(
      normalizedRoleKey,
    );

  if (
    !definition
  ) {
    throw new Error(
      `Configured access role "${normalizedRoleKey}" does not exist in systemRoles.`,
    );
  }

  const existing =
    await prisma.accessRole.findUnique({
      where: {
        key:
          normalizedRoleKey,
      },

      select: {
        id:
          true,

        key:
          true,

        name:
          true,

        description:
          true,

        type:
          true,

        isProtected:
          true,

        isActive:
          true,
      },
    });

  /* ------------------------------------------------------------------------ */
  /* CREATE                                                                   */
  /* ------------------------------------------------------------------------ */

  if (
    !existing
  ) {
    const created =
      await prisma.accessRole.create({
        data: {
          key:
            normalizedRoleKey,

          name:
            definition.name,

          description:
            definition.description,

          /*
           * Anything declared in systemRoles.ts is
           * application-defined, not administrator-created.
           */
          type:
            "SYSTEM",

          isProtected:
            definition.protected,

          isActive:
            true,
        },

        select: {
          id:
            true,

          key:
            true,

          name:
            true,

          description:
            true,

          type:
            true,

          isProtected:
            true,

          isActive:
            true,
        },
      });

    return {
      role:
        created,

      created:
        true,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* RECONCILE ROLE METADATA                                                  */
  /* ------------------------------------------------------------------------ */

  const metadataChanged =
    existing.name !==
      definition.name ||
    existing.description !==
      definition.description ||
    existing.type !==
      "SYSTEM" ||
    existing.isProtected !==
      definition.protected ||
    !existing.isActive;

  if (
    !metadataChanged
  ) {
    return {
      role:
        existing,

      created:
        false,
    };
  }

  const updated =
    await prisma.accessRole.update({
      where: {
        id:
          existing.id,
      },

      data: {
        name:
          definition.name,

        description:
          definition.description,

        type:
          "SYSTEM",

        isProtected:
          definition.protected,

        /*
         * Code-defined roles remain active.
         *
         * Removing/retiring a predefined role should
         * therefore be performed by removing it from
         * systemRoles.ts first.
         */
        isActive:
          true,
      },

      select: {
        id:
          true,

        key:
          true,

        name:
          true,

        description:
          true,

        type:
          true,

        isProtected:
          true,

        isActive:
          true,
      },
    });

  return {
    role:
      updated,

    created:
      false,
  };
}

/* ========================================================================== */
/* SYNC ONE SYSTEM ROLE                                                       */
/* ========================================================================== */

export async function syncSystemRolePermissions(
  roleKey:
    string,
): Promise<SystemRoleSyncResult> {
  /*
   * This makes direct single-role synchronization safe too.
   *
   * If new permissions were added to the code catalogue,
   * they will exist before we resolve the desired role bundle.
   */
  await syncPermissionCatalogue();

  const normalizedRoleKey =
    normalizeKey(
      roleKey,
    );

  const definition =
    getSystemRoleDefinition(
      normalizedRoleKey,
    );

  if (
    !definition
  ) {
    throw new Error(
      `Configured access role "${normalizedRoleKey}" does not exist in systemRoles.`,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ROLE                                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    role,
    created,
  } =
    await ensureConfiguredRole(
      normalizedRoleKey,
    );

  /* ------------------------------------------------------------------------ */
  /* CURRENT ROLE PERMISSIONS                                                 */
  /* ------------------------------------------------------------------------ */

  const existingAssignments =
    await prisma.rolePermission.findMany({
      where: {
        roleId:
          role.id,
      },

      select: {
        permissionId:
          true,

        permission: {
          select: {
            key:
              true,
          },
        },
      },
    });

  const existingCount =
    existingAssignments.length;

  /* ------------------------------------------------------------------------ */
  /* DESIRED PERMISSIONS                                                      */
  /* ------------------------------------------------------------------------ */

  const desiredKeys =
    Array.from(
      new Set(
        definition.permissions.map(
          (
            permission,
          ) =>
            normalizeKey(
              permission,
            ),
        ),
      ),
    );

  const desiredPermissions =
    await prisma.permission.findMany({
      where: {
        key: {
          in:
            desiredKeys,
        },

        isActive:
          true,
      },

      select: {
        id:
          true,

        key:
          true,
      },
    });

  /* ------------------------------------------------------------------------ */
  /* DEFENSIVE DATABASE VALIDATION                                            */
  /* ------------------------------------------------------------------------ */

  const foundKeys =
    new Set(
      desiredPermissions.map(
        (
          permission,
        ) =>
          permission.key,
      ),
    );

  const missingPermissionKeys =
    desiredKeys.filter(
      (
        permission,
      ) =>
        !foundKeys.has(
          permission,
        ),
    );

  if (
    missingPermissionKeys.length >
    0
  ) {
    throw new Error(
      `Role "${normalizedRoleKey}" references missing or inactive database permissions: ${missingPermissionKeys.join(
        ", ",
      )}`,
    );
  }

  /* ------------------------------------------------------------------------ */
  /* DIFFERENCE                                                               */
  /* ------------------------------------------------------------------------ */

  const existingByKey =
    new Map(
      existingAssignments.map(
        (
          assignment,
        ) => [
          assignment.permission.key,

          assignment.permissionId,
        ],
      ),
    );

  const desiredKeySet =
    new Set(
      desiredKeys,
    );

  const permissionsToAdd =
    desiredPermissions.filter(
      (
        permission,
      ) =>
        !existingByKey.has(
          permission.key,
        ),
    );

  const permissionIdsToRemove =
    existingAssignments
      .filter(
        (
          assignment,
        ) =>
          !desiredKeySet.has(
            assignment.permission.key,
          ),
      )
      .map(
        (
          assignment,
        ) =>
          assignment.permissionId,
      );

  /* ------------------------------------------------------------------------ */
  /* TRANSACTION                                                              */
  /* ------------------------------------------------------------------------ */

  await prisma.$transaction(
    async (
      tx,
    ) => {
      /*
       * Reconciliation is authoritative for code-defined
       * roles.
       *
       * Permissions removed from systemRoles.ts therefore
       * stop contributing immediately after synchronization.
       */
      if (
        permissionIdsToRemove.length >
        0
      ) {
        await tx.rolePermission.deleteMany({
          where: {
            roleId:
              role.id,

            permissionId: {
              in:
                permissionIdsToRemove,
            },
          },
        });
      }

      if (
        permissionsToAdd.length >
        0
      ) {
        await tx.rolePermission.createMany({
          data:
            permissionsToAdd.map(
              (
                permission,
              ) => ({
                roleId:
                  role.id,

                permissionId:
                  permission.id,

                grantedBy:
                  "system-role-sync",
              }),
            ),

          skipDuplicates:
            true,
        });
      }
    },
  );

  const finalCount =
    existingCount -
    permissionIdsToRemove.length +
    permissionsToAdd.length;

  return {
    roleKey:
      normalizedRoleKey,

    roleId:
      role.id,

    created,

    desiredCount:
      desiredKeys.length,

    existingCount,

    addedCount:
      permissionsToAdd.length,

    removedCount:
      permissionIdsToRemove.length,

    finalCount,
  };
}

/* ========================================================================== */
/* INTERNAL ROLE SYNC WITHOUT CATALOGUE REPEAT                                */
/* ========================================================================== */

async function syncConfiguredRoleAfterCatalogue(
  roleKey:
    string,
): Promise<SystemRoleSyncResult> {
  const normalizedRoleKey =
    normalizeKey(
      roleKey,
    );

  const definition =
    getSystemRoleDefinition(
      normalizedRoleKey,
    );

  if (
    !definition
  ) {
    throw new Error(
      `Configured access role "${normalizedRoleKey}" does not exist in systemRoles.`,
    );
  }

  const {
    role,
    created,
  } =
    await ensureConfiguredRole(
      normalizedRoleKey,
    );

  const existingAssignments =
    await prisma.rolePermission.findMany({
      where: {
        roleId:
          role.id,
      },

      select: {
        permissionId:
          true,

        permission: {
          select: {
            key:
              true,
          },
        },
      },
    });

  const existingCount =
    existingAssignments.length;

  const desiredKeys =
    Array.from(
      new Set(
        definition.permissions.map(
          (
            permission,
          ) =>
            normalizeKey(
              permission,
            ),
        ),
      ),
    );

  const desiredPermissions =
    await prisma.permission.findMany({
      where: {
        key: {
          in:
            desiredKeys,
        },

        isActive:
          true,
      },

      select: {
        id:
          true,

        key:
          true,
      },
    });

  const foundKeys =
    new Set(
      desiredPermissions.map(
        (
          permission,
        ) =>
          permission.key,
      ),
    );

  const missingPermissionKeys =
    desiredKeys.filter(
      (
        permission,
      ) =>
        !foundKeys.has(
          permission,
        ),
    );

  if (
    missingPermissionKeys.length >
    0
  ) {
    throw new Error(
      `Role "${normalizedRoleKey}" references missing or inactive database permissions: ${missingPermissionKeys.join(
        ", ",
      )}`,
    );
  }

  const existingByKey =
    new Map(
      existingAssignments.map(
        (
          assignment,
        ) => [
          assignment.permission.key,

          assignment.permissionId,
        ],
      ),
    );

  const desiredKeySet =
    new Set(
      desiredKeys,
    );

  const permissionsToAdd =
    desiredPermissions.filter(
      (
        permission,
      ) =>
        !existingByKey.has(
          permission.key,
        ),
    );

  const permissionIdsToRemove =
    existingAssignments
      .filter(
        (
          assignment,
        ) =>
          !desiredKeySet.has(
            assignment.permission.key,
          ),
      )
      .map(
        (
          assignment,
        ) =>
          assignment.permissionId,
      );

  await prisma.$transaction(
    async (
      tx,
    ) => {
      if (
        permissionIdsToRemove.length >
        0
      ) {
        await tx.rolePermission.deleteMany({
          where: {
            roleId:
              role.id,

            permissionId: {
              in:
                permissionIdsToRemove,
            },
          },
        });
      }

      if (
        permissionsToAdd.length >
        0
      ) {
        await tx.rolePermission.createMany({
          data:
            permissionsToAdd.map(
              (
                permission,
              ) => ({
                roleId:
                  role.id,

                permissionId:
                  permission.id,

                grantedBy:
                  "system-role-sync",
              }),
            ),

          skipDuplicates:
            true,
        });
      }
    },
  );

  const finalCount =
    existingCount -
    permissionIdsToRemove.length +
    permissionsToAdd.length;

  return {
    roleKey:
      normalizedRoleKey,

    roleId:
      role.id,

    created,

    desiredCount:
      desiredKeys.length,

    existingCount,

    addedCount:
      permissionsToAdd.length,

    removedCount:
      permissionIdsToRemove.length,

    finalCount,
  };
}


/* ========================================================================== */
/* PREVIEW / DRY RUN                                                          */
/* ========================================================================== */

export async function previewSystemRoleSync(): Promise<
  SystemAccessControlPreview
> {
  /*
   * Validate the TypeScript configuration first.
   *
   * This performs no database writes.
   */
  validateSystemRoleConfiguration();

  /* ------------------------------------------------------------------------ */
  /* PERMISSION CATALOGUE                                                     */
  /* ------------------------------------------------------------------------ */

  const existingPermissions =
    await prisma.permission.findMany({
      select: {
        key:
          true,

        name:
          true,

        description:
          true,

        group:
          true,

        sortOrder:
          true,

        isActive:
          true,
      },
    });

  const existingPermissionByKey =
    new Map(
      existingPermissions.map(
        (
          permission,
        ) => [
          normalizeKey(
            permission.key,
          ),

          permission,
        ],
      ),
    );

  const permissionsToCreate:
    string[] =
    [];

  const permissionsToUpdate:
    string[] =
    [];

  for (
    const definition of
    permissionCatalogue
  ) {
    const key =
      normalizeKey(
        definition.key,
      );

    const existing =
      existingPermissionByKey.get(
        key,
      );

    if (
      !existing
    ) {
      permissionsToCreate.push(
        key,
      );

      continue;
    }

    const changed =
      existing.name !==
        definition.name ||
      existing.description !==
        definition.description ||
      existing.group !==
        definition.group ||
      existing.sortOrder !==
        definition.sortOrder ||
      !existing.isActive;

    if (
      changed
    ) {
      permissionsToUpdate.push(
        key,
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* ROLES                                                                    */
  /* ------------------------------------------------------------------------ */

  const previews:
    SystemRoleSyncPreview[] =
    [];

  for (
    const definition of
    systemRoles
  ) {
    const roleKey =
      normalizeKey(
        definition.key,
      );

    const existingRole =
      await prisma.accessRole.findUnique({
        where: {
          key:
            roleKey,
        },

        select: {
          id:
            true,

          name:
            true,

          description:
            true,

          type:
            true,

          isProtected:
            true,

          isActive:
            true,

          permissions: {
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
      });

    const desiredPermissions =
      Array.from(
        new Set(
          definition.permissions.map(
            (
              permission,
            ) =>
              normalizeKey(
                permission,
              ),
          ),
        ),
      ).sort();

    const existingPermissionKeys =
      (
        existingRole?.permissions.map(
          (
            assignment,
          ) =>
            normalizeKey(
              assignment.permission
                .key,
            ),
        ) ??
        []
      ).sort();

    const existingSet =
      new Set(
        existingPermissionKeys,
      );

    const desiredSet =
      new Set(
        desiredPermissions,
      );

    const permissionsToAdd =
      desiredPermissions.filter(
        (
          permission,
        ) =>
          !existingSet.has(
            permission,
          ),
      );

    const permissionsToRemove =
      existingPermissionKeys.filter(
        (
          permission,
        ) =>
          !desiredSet.has(
            permission,
          ),
      );

    const metadataChanges = {
      name:
        !existingRole ||
        existingRole.name !==
          definition.name,

      description:
        !existingRole ||
        existingRole.description !==
          definition.description,

      type:
        !existingRole ||
        existingRole.type !==
          "SYSTEM",

      isProtected:
        !existingRole ||
        existingRole.isProtected !==
          definition.protected,

      isActive:
        !existingRole ||
        !existingRole.isActive,
    };

    const metadataChanged =
      Object.values(
        metadataChanges,
      ).some(
        Boolean,
      );

    const hasChanges =
      !existingRole ||
      metadataChanged ||
      permissionsToAdd.length >
        0 ||
      permissionsToRemove.length >
        0;

    previews.push({
      roleKey,

      roleName:
        definition.name,

      roleExists:
        Boolean(
          existingRole,
        ),

      currentType:
        existingRole?.type ??
        null,

      desiredType:
        "SYSTEM",

      currentProtected:
        existingRole
          ?.isProtected ??
        null,

      desiredProtected:
        definition.protected,

      existingPermissions:
        existingPermissionKeys,

      desiredPermissions,

      permissionsToAdd,

      permissionsToRemove,

      metadataChanges,

      hasChanges,
    });
  }

  /* ------------------------------------------------------------------------ */
  /* SUMMARY                                                                  */
  /* ------------------------------------------------------------------------ */

  return {
    permissionCatalogue: {
      configuredCount:
        permissionCatalogue.length,

      existingCount:
        existingPermissions.length,

      permissionsToCreate,

      permissionsToUpdate,
    },

    roles:
      previews,

    summary: {
      rolesConfigured:
        previews.length,

      rolesToCreate:
        previews.filter(
          (
            role,
          ) =>
            !role.roleExists,
        ).length,

      rolesToUpdate:
        previews.filter(
          (
            role,
          ) =>
            role.roleExists &&
            role.hasChanges,
        ).length,

      permissionAssignmentsToAdd:
        previews.reduce(
          (
            total,
            role,
          ) =>
            total +
            role.permissionsToAdd
              .length,
          0,
        ),

      permissionAssignmentsToRemove:
        previews.reduce(
          (
            total,
            role,
          ) =>
            total +
            role.permissionsToRemove
              .length,
          0,
        ),
    },
  };
}

/* ========================================================================== */
/* SYNC EVERYTHING                                                            */
/* ========================================================================== */

export async function syncAllSystemRolePermissions(): Promise<
  SystemAccessControlSyncResult
> {
  /*
   * Fail before database reconciliation if the
   * TypeScript configuration contradicts itself.
   */
  validateSystemRoleConfiguration();

  /* ------------------------------------------------------------------------ */
  /* PERMISSION CATALOGUE                                                     */
  /* ------------------------------------------------------------------------ */

  const permissions =
    await syncPermissionCatalogue();

  /* ------------------------------------------------------------------------ */
  /* SYSTEM ROLES                                                             */
  /* ------------------------------------------------------------------------ */

  const roles:
    SystemRoleSyncResult[] =
    [];

  for (
    const definition of
    systemRoles
  ) {
    roles.push(
      await syncConfiguredRoleAfterCatalogue(
        definition.key,
      ),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* SUMMARY                                                                  */
  /* ------------------------------------------------------------------------ */

  return {
    permissions,

    roles,

    summary: {
      roleCount:
        roles.length,

      rolesCreated:
        roles.filter(
          (
            role,
          ) =>
            role.created,
        ).length,

      permissionsAdded:
        roles.reduce(
          (
            total,
            role,
          ) =>
            total +
            role.addedCount,
          0,
        ),

      permissionsRemoved:
        roles.reduce(
          (
            total,
            role,
          ) =>
            total +
            role.removedCount,
          0,
        ),
    },
  };
}