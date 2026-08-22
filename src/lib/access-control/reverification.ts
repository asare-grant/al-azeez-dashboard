// src/lib/access-control/reverification.ts

import "server-only";

import {
  auth,
  reverificationError,
  reverificationErrorResponse,
} from "@clerk/nextjs/server";

export type ReverificationPreset =
  | "strict_mfa"
  | "strict"
  | "moderate"
  | "lax";

/* ========================================================================== */
/* API / ROUTE-HANDLER REVERIFICATION                                         */
/* ========================================================================== */

// /*
//  * Use this version from:
//  *
//  * app/api/**/route.ts
//  *
//  * It returns Clerk's special HTTP 403 response.
//  */
export async function requireReverificationIfNeeded({
  required,
  preset = "strict",
}: {
  required:
    boolean;

  preset?:
    ReverificationPreset;
}) {
  if (
    !required
  ) {
    return null;
  }

  const {
    has,
  } =
    await auth();

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

  return reverificationErrorResponse(
    preset,
  );
}

/* ========================================================================== */
/* SERVER-ACTION REVERIFICATION                                               */
/* ========================================================================== */

/*
 * Use this version from Server Actions / services
 * invoked through Server Actions.
 *
 * The client must invoke the corresponding Server
 * Action through Clerk's useReverification() hook.
 */
export async function requireServerActionReverificationIfNeeded({
  required,
  preset = "strict",
}: {
  required:
    boolean;

  preset?:
    ReverificationPreset;
}) {
  if (
    !required
  ) {
    return null;
  }

  const {
    has,
  } =
    await auth();

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

  return reverificationError(
    preset,
  );
}