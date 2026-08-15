"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  provisionUser,
} from "./provisioning-service";

export async function provisionUserAction(
  input:
    unknown,
) {
  const result =
    await provisionUser(
      input,
    );

  if (
    result.success
  ) {
    revalidatePath(
      "/list/access-control",
    );

    revalidatePath(
      "/list/access-control/users",
    );

    revalidatePath(
      "/list/access-control/roles",
    );
  }

  return result;
}