// src/app/api/cron/notifications/route.ts

import {
  timingSafeEqual,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import {
  runScheduledNotifications,
} from "@/lib/notifications/scheduled/run-scheduled-notifications";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

/* -------------------------------------------------------------------------- */
/*                             AUTHENTICATION                                 */
/* -------------------------------------------------------------------------- */

function safelyEquals(
  actual: string,
  expected: string,
) {
  const actualBuffer =
    Buffer.from(
      actual,
    );

  const expectedBuffer =
    Buffer.from(
      expected,
    );

  if (
    actualBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    actualBuffer,
    expectedBuffer,
  );
}

function isAuthorized(
  request: Request,
) {
  const secret =
    process.env
      .CRON_SECRET
      ?.trim();

  if (
    !secret
  ) {
    throw new Error(
      "CRON_SECRET is not configured.",
    );
  }

  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    !authorization?.startsWith(
      "Bearer ",
    )
  ) {
    return false;
  }

  const suppliedSecret =
    authorization
      .slice(
        "Bearer ".length,
      )
      .trim();

  return safelyEquals(
    suppliedSecret,
    secret,
  );
}

/* -------------------------------------------------------------------------- */
/*                               HANDLER                                      */
/* -------------------------------------------------------------------------- */

async function handleCron(
  request: Request,
) {
  try {
    if (
      !isAuthorized(
        request,
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Unauthorized.",
        },

        {
          status: 401,
        },
      );
    }

    const result =
      await runScheduledNotifications({
        trigger:
          "cron",
      });

    /*
     * Another scheduler instance already owns
     * the active lease.
     *
     * This is a successful no-op, not an error.
     */
    if (
      !result.executed
    ) {
      return NextResponse.json(
        {
          success: true,

          skipped: true,

          reason:
            result.reason,
        },

        {
          status: 200,
        },
      );
    }

    return NextResponse.json(
      {
        success:
          result.status !==
          "FAILED",

        result,
      },

      {
        status:
          result.status ===
          "FAILED"
            ? 500
            : 200,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "NOTIFICATION CRON ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "The notification scheduler could not run.",
      },

      {
        status: 500,
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                     GET + POST SUPPORT                                     */
/* -------------------------------------------------------------------------- */

export async function GET(
  request: Request,
) {
  return handleCron(
    request,
  );
}

export async function POST(
  request: Request,
) {
  return handleCron(
    request,
  );
}