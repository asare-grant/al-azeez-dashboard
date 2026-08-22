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

  /*
   * Clerk's reverification result is deliberately
   * passed straight through to useReverification().
   *
   * Only our ordinary provisioning result contains
   * the `success` property.
   */
  if (
    result &&
    typeof result ===
      "object" &&
    "success" in
      result &&
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