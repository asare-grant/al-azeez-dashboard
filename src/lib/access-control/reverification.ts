import "server-only";

import {
  auth,
  reverificationErrorResponse,
} from "@clerk/nextjs/server";

export type ReverificationPreset =
  | "strict_mfa"
  | "strict"
  | "moderate"
  | "lax";

/* ========================================================================== */
/* REQUIRE REVERIFICATION WHEN NEEDED                                         */
/* ========================================================================== */

export async function requireReverificationIfNeeded({
  required,
  preset = "strict",
}: {
  required: boolean;
  preset?: ReverificationPreset;
}) {
  if (!required) {
    return null;
  }

  const {
    has,
  } = await auth();

  const recentlyVerified =
    has({
      reverification:
        preset,
    });

  if (
    recentlyVerified
  ) {
    return null;
  }

  /*
   * Clerk returns a special 403 response.
   *
   * useReverification() on the client recognizes this response,
   * opens Clerk's reverification UI, and retries the request after
   * successful verification.
   */
  return reverificationErrorResponse(
    preset,
  );
}