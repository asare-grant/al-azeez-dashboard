import {
  PrismaClient,
} from "@prisma/client";

import {
  permissionCatalogue,
} from "../src/lib/access-control/permission-catalogue";

import {
  systemRoles,
} from "../src/lib/access-control/system-roles";

const prisma =
  new PrismaClient();

async function seedAccessControl() {
  console.log(
    "🔐 Seeding RBAC permissions...",
  );

  /* ---------------------------------------------------------------------- */
  /* PERMISSIONS                                                            */
  /* ---------------------------------------------------------------------- */

  for (
    const permission of
    permissionCatalogue
  ) {
    await prisma.permission.upsert({
      where: {
        key:
          permission.key,
      },

      update: {
        name:
          permission.name,

        description:
          permission.description,

        group:
          permission.group,

        sortOrder:
          permission.sortOrder,

        isActive:
          true,
      },

      create: {
        key:
          permission.key,

        name:
          permission.name,

        description:
          permission.description,

        group:
          permission.group,

        sortOrder:
          permission.sortOrder,

        isActive:
          true,
      },
    });
  }

  const permissions =
    await prisma.permission.findMany({
      where: {
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

  const permissionMap =
    new Map(
      permissions.map(
        (
          permission,
        ) => [
          permission.key,
          permission.id,
        ],
      ),
    );


    for (
  const role of
  systemRoles
) {
  if (
    role.permissions.includes(
      "*",
    )
  ) {
    continue;
  }

  for (
    const key of
    role.permissions
  ) {
    if (
      !permissionMap.has(
        key,
      )
    ) {
      throw new Error(
        `Role "${role.key}" references unknown permission "${key}".`,
      );
    }
  }
}

  /* ---------------------------------------------------------------------- */
  /* ROLES                                                                  */
  /* ---------------------------------------------------------------------- */

  console.log(
    "🔐 Seeding RBAC roles...",
  );

  for (
    const definition of
    systemRoles
  ) {
    const role =
      await prisma.accessRole.upsert({
        where: {
          key:
            definition.key,
        },

        update: {
          name:
            definition.name,

          description:
            definition.description,

          type:
            "SYSTEM",

          isProtected:
            definition.protected,

          isActive:
            true,
        },

        create: {
          key:
            definition.key,

          name:
            definition.name,

          description:
            definition.description,

          type:
            "SYSTEM",

          isProtected:
            definition.protected,

          isActive:
            true,
        },
      });

    const permissionKeys =
      definition.permissions.includes(
        "*",
      )
        ? permissions.map(
            (
              permission,
            ) =>
              permission.key,
          )
        : definition.permissions;

    /*
     * Seed is authoritative for SYSTEM roles.
     *
     * This keeps them synchronized with the
     * source-controlled permission catalogue.
     */
    await prisma.rolePermission.deleteMany({
      where: {
        roleId:
          role.id,
      },
    });

    const permissionIds =
      permissionKeys
        .map(
          (
            key,
          ) =>
            permissionMap.get(
              key,
            ),
        )
        .filter(
          (
            id,
          ): id is number =>
            typeof id ===
            "number",
        );

    if (
      permissionIds.length >
      0
    ) {
      await prisma.rolePermission.createMany({
        data:
          permissionIds.map(
            (
              permissionId,
            ) => ({
              roleId:
                role.id,

              permissionId,

              grantedBy:
                "system-seed",
            }),
          ),

        skipDuplicates:
          true,
      });
    }
  }

  console.log(
    "✅ RBAC permission catalogue seeded.",
  );
}

seedAccessControl()
  .catch(
    (
      error,
    ) => {
      console.error(
        "RBAC SEED ERROR:",
        error,
      );

      process.exit(
        1,
      );
    },
  )
  .finally(
    async () => {
      await prisma.$disconnect();
    },
  );