"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  cloneAccessRole,
  createCustomAccessRole,
  retireCustomAccessRole,
  updateCustomAccessRole,
  updateCustomRolePermissions,
} from "./role-service";

/* -------------------------------------------------------------------------- */
/*                            CREATE ROLE                                     */
/* -------------------------------------------------------------------------- */

export async function createCustomRoleAction(
  input:
    unknown,
) {
  const result =
    await createCustomAccessRole(
      input,
    );

  if (
    result.success
  ) {
    revalidatePath(
      "/list/access-control",
    );

    revalidatePath(
      "/list/access-control/roles",
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*                             CLONE ROLE                                     */
/* -------------------------------------------------------------------------- */

export async function cloneRoleAction(
  input:
    unknown,
) {
  const result =
    await cloneAccessRole(
      input,
    );

  if (
    result.success
  ) {
    revalidatePath(
      "/list/access-control/roles",
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*                             UPDATE ROLE                                    */
/* -------------------------------------------------------------------------- */

export async function updateCustomRoleAction(
  input:
    unknown,
) {
  const result =
    await updateCustomAccessRole(
      input,
    );

  if (
  result.success
) {
  revalidatePath(
    "/list/access-control",
  );

  revalidatePath(
    "/list/access-control/roles",
  );
}

  return result;
}

/* -------------------------------------------------------------------------- */
/*                         UPDATE PERMISSIONS                                 */
/* -------------------------------------------------------------------------- */

export async function updateRolePermissionsAction(
  input:
    unknown,
) {
  const result =
    await updateCustomRolePermissions(
      input,
    );

  if (
  result.success
) {
  revalidatePath(
    "/list/access-control",
  );

  revalidatePath(
    "/list/access-control/roles",
  );
}

  return result;
}

/* -------------------------------------------------------------------------- */
/*                              RETIRE ROLE                                   */
/* -------------------------------------------------------------------------- */

export async function retireRoleAction(
  roleId:
    number,
) {
  const result =
    await retireCustomAccessRole(
      roleId,
    );

  if (
  result.success
) {
  revalidatePath(
    "/list/access-control",
  );

  revalidatePath(
    "/list/access-control/roles",
  );

  revalidatePath(
    "/list/access-control/users",
  );
}

  return result;
}