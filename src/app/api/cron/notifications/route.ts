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

export async function GET(
  request: Request,
) {
  const expectedSecret =
    process.env.CRON_SECRET;

  if (
    !expectedSecret
  ) {
    console.error(
      "CRON_SECRET is not configured.",
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Scheduled notification service is not configured.",
      },

      {
        status:
          500,
      },
    );
  }

  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    authorization !==
    `Bearer ${expectedSecret}`
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unauthorized.",
      },

      {
        status:
          401,
      },
    );
  }

  try {
    const summary =
      await runScheduledNotifications();

    return NextResponse.json(
      {
        success:
          true,

        summary,
      },

      {
        status:
          200,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "SCHEDULED NOTIFICATION ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          error instanceof Error
            ? error.message
            : "Scheduled notifications could not be processed.",
      },

      {
        status:
          500,
      },
    );
  }
}