// scripts/sync-system-role-permissions.ts

import prisma from "../src/lib/prisma";

import {
  previewSystemRoleSync,
  syncAllSystemRolePermissions,
} from "../src/lib/access-control/system-role-sync-core";

/* ========================================================================== */
/* ARGUMENTS                                                                  */
/* ========================================================================== */

/* ========================================================================== */
/* ARGUMENTS                                                                  */
/* ========================================================================== */

const args =
  new Set(
    process.argv.slice(
      2,
    ),
  );

/*
 * IMPORTANT:
 *
 * Preview is the DEFAULT behaviour.
 *
 * Nothing is written unless --apply is
 * explicitly supplied.
 */
const apply =
  args.has(
    "--apply",
  );

const yes =
  args.has(
    "--yes",
  );

/* ========================================================================== */
/* CONSOLE HELPERS                                                            */
/* ========================================================================== */

function divider() {
  console.log(
    "--------------------------------------------------------------------------",
  );
}

function heading(
  value:
    string,
) {
  console.log();
  console.log(
    value,
  );
  divider();
}

/* ========================================================================== */
/* PREVIEW                                                                    */
/* ========================================================================== */

async function printPreview() {
  const preview =
    await previewSystemRoleSync();

  console.log();
  console.log(
    "==========================================================================",
  );

  console.log(
    " SYSTEM ROLE & PERMISSION RECONCILIATION",
  );

  console.log(
    "==========================================================================",
  );

  heading(
    "PERMISSION CATALOGUE",
  );

  console.log(
    `Configured: ${preview.permissionCatalogue.configuredCount}`,
  );

  console.log(
    `Currently in database: ${preview.permissionCatalogue.existingCount}`,
  );

  console.log(
    `To create: ${preview.permissionCatalogue.permissionsToCreate.length}`,
  );

  console.log(
    `To update: ${preview.permissionCatalogue.permissionsToUpdate.length}`,
  );

  if (
    preview.permissionCatalogue
      .permissionsToCreate
      .length >
    0
  ) {
    console.log();
    console.log(
      "New permissions:",
    );

    for (
      const permission of
      preview.permissionCatalogue
        .permissionsToCreate
    ) {
      console.log(
        `  + ${permission}`,
      );
    }
  }

  if (
    preview.permissionCatalogue
      .permissionsToUpdate
      .length >
    0
  ) {
    console.log();
    console.log(
      "Permissions requiring metadata update:",
    );

    for (
      const permission of
      preview.permissionCatalogue
        .permissionsToUpdate
    ) {
      console.log(
        `  ~ ${permission}`,
      );
    }
  }

  heading(
    "SYSTEM ROLES",
  );

  for (
    const role of
    preview.roles
  ) {
    console.log();
    console.log(
      `${role.roleName} (${role.roleKey})`,
    );

    console.log(
      `  Exists: ${role.roleExists ? "yes" : "no"}`,
    );

    console.log(
      `  Current permissions: ${role.existingPermissions.length}`,
    );

    console.log(
      `  Desired permissions: ${role.desiredPermissions.length}`,
    );

    console.log(
      `  Add: ${role.permissionsToAdd.length}`,
    );

    console.log(
      `  Remove: ${role.permissionsToRemove.length}`,
    );

    if (
      !role.roleExists
    ) {
      console.log(
        "  Role will be created.",
      );
    }

    const metadataChanges =
      Object.entries(
        role.metadataChanges,
      )
        .filter(
          (
            [
              ,
              changed,
            ],
          ) =>
            changed,
        )
        .map(
          (
            [
              key,
            ],
          ) =>
            key,
        );

    if (
      metadataChanges.length >
      0
    ) {
      console.log(
        `  Metadata changes: ${metadataChanges.join(
          ", ",
        )}`,
      );
    }

    if (
      role.permissionsToAdd
        .length >
      0
    ) {
      console.log(
        "  Permissions to add:",
      );

      for (
        const permission of
        role.permissionsToAdd
      ) {
        console.log(
          `    + ${permission}`,
        );
      }
    }

    if (
      role.permissionsToRemove
        .length >
      0
    ) {
      console.log(
        "  Permissions to remove:",
      );

      for (
        const permission of
        role.permissionsToRemove
      ) {
        console.log(
          `    - ${permission}`,
        );
      }
    }

    if (
      !role.hasChanges
    ) {
      console.log(
        "  No changes.",
      );
    }
  }

  heading(
    "SUMMARY",
  );

  console.log(
    `Configured roles: ${preview.summary.rolesConfigured}`,
  );

  console.log(
    `Roles to create: ${preview.summary.rolesToCreate}`,
  );

  console.log(
    `Existing roles to update: ${preview.summary.rolesToUpdate}`,
  );

  console.log(
    `Permission assignments to add: ${preview.summary.permissionAssignmentsToAdd}`,
  );

  console.log(
    `Permission assignments to remove: ${preview.summary.permissionAssignmentsToRemove}`,
  );

  return preview;
}

/* ========================================================================== */
/* MAIN                                                                       */
/* ========================================================================== */

async function main() {
  const preview =
    await printPreview();

  /* ------------------------------------------------------------------------ */
  /* DRY RUN                                                                  */
  /* ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------ */
/* PREVIEW-ONLY DEFAULT                                                     */
/* ------------------------------------------------------------------------ */

if (
  !apply
) {
  console.log();
  console.log(
    "PREVIEW COMPLETE — NO DATABASE CHANGES WERE MADE.",
  );

  console.log();

  console.log(
    "To apply these changes, run:",
  );

  console.log();

  console.log(
    "npm run sync:system-roles -- --apply",
  );

  console.log();

  return;
}

  /* ------------------------------------------------------------------------ */
  /* SAFETY                                                                   */
  /* ------------------------------------------------------------------------ */

  const destructive =
    preview.summary
      .permissionAssignmentsToRemove >
    0;

  if (
    destructive &&
    !yes
  ) {
    console.log();
    console.log(
      "Synchronization would REMOVE existing permission assignments.",
    );

    console.log(
      "Review the preview carefully.",
    );

    console.log();

    console.log(
      "If the preview is correct, rerun with:",
    );

    console.log();

    console.log(
      "npm run sync:system-roles -- --yes",
    );

    console.log();

    process.exitCode =
      2;

    return;
  }

  /* ------------------------------------------------------------------------ */
  /* APPLY                                                                    */
  /* ------------------------------------------------------------------------ */

  console.log();
  console.log(
    "Applying reconciliation...",
  );

  const result =
    await syncAllSystemRolePermissions();

  console.log();
  console.log(
    "==========================================================================",
  );

  console.log(
    " RECONCILIATION COMPLETE",
  );

  console.log(
    "==========================================================================",
  );

  console.log();

  console.log(
    `Permission catalogue configured: ${result.permissions.configuredCount}`,
  );

  console.log(
    `Permission rows created: ${result.permissions.createdCount}`,
  );

  console.log(
    `Permission rows updated: ${result.permissions.updatedCount}`,
  );

  console.log();

  console.log(
    `Roles synchronized: ${result.summary.roleCount}`,
  );

  console.log(
    `Roles created: ${result.summary.rolesCreated}`,
  );

  console.log(
    `Role permissions added: ${result.summary.permissionsAdded}`,
  );

  console.log(
    `Role permissions removed: ${result.summary.permissionsRemoved}`,
  );

  console.log();

  for (
    const role of
    result.roles
  ) {
    console.log(
      `${role.roleKey.padEnd(
        22,
      )} ${String(
        role.existingCount,
      ).padStart(
        3,
      )} → ${String(
        role.finalCount,
      ).padStart(
        3,
      )}  (+${role.addedCount} / -${role.removedCount})${
        role.created
          ? "  [CREATED]"
          : ""
      }`,
    );
  }

  console.log();
}

/* ========================================================================== */
/* EXECUTE                                                                    */
/* ========================================================================== */

main()
  .catch(
    (
      error,
    ) => {
      console.error();
      console.error(
        "[SYSTEM_ROLE_SYNC_FAILED]",
        error,
      );

      process.exitCode =
        1;
    },
  )
  .finally(
    async () => {
      await prisma.$disconnect();
    },
  );