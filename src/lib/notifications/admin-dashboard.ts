import "server-only";

import {
  auth,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type NotificationOperationsHealth =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL"
  | "UNKNOWN";

export type NotificationOperationsData = {
  health:
    NotificationOperationsHealth;

  latestRun: {
    id:
      number;

    trigger:
      string;

    status:
      string;

    scannerCount:
      number;

    succeededCount:
      number;

    failedCount:
      number;

    startedAt:
      Date;

    completedAt:
      Date | null;

    durationMs:
      number | null;

    scanners: {
      id:
        number;

      scannerKey:
        string;

      status:
        string;

      durationMs:
        number | null;

      errorMessage:
        string | null;

      result:
        unknown;

      startedAt:
        Date;

      completedAt:
        Date | null;
    }[];
  } | null;

  today: {
    eventsCreated:
      number;

    deliveriesCreated:
      number;

    unread:
      number;

    unseen:
      number;

    archived:
      number;
  };

  last24Hours: {
    runs:
      number;

    successfulRuns:
      number;

    partialRuns:
      number;

    failedRuns:
      number;

    averageDurationMs:
      number | null;
  };

  recentRuns: {
    id:
      number;

    trigger:
      string;

    status:
      string;

    scannerCount:
      number;

    succeededCount:
      number;

    failedCount:
      number;

    startedAt:
      Date;

    completedAt:
      Date | null;

    durationMs:
      number | null;
  }[];

  recentFailures: {
    id:
      number;

    runId:
      number;

    scannerKey:
      string;

    errorMessage:
      string | null;

    startedAt:
      Date;
  }[];
};

/* -------------------------------------------------------------------------- */
/*                              DATE HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getUtcStartOfToday() {
  const now =
    new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function get24HoursAgo() {
  return new Date(
    Date.now() -
      24 *
        60 *
        60 *
        1000,
  );
}

/* -------------------------------------------------------------------------- */
/*                               HEALTH                                      */
/* -------------------------------------------------------------------------- */

function resolveHealth({
  latestRun,
}: {
  latestRun:
    NotificationOperationsData["latestRun"];
}): NotificationOperationsHealth {
  if (
    !latestRun
  ) {
    return "UNKNOWN";
  }

  if (
    latestRun.status ===
      "FAILED" ||
    latestRun.failedCount ===
      latestRun.scannerCount
  ) {
    return "CRITICAL";
  }

  if (
    latestRun.status ===
      "PARTIAL" ||
    latestRun.failedCount >
      0
  ) {
    return "WARNING";
  }

  if (
    latestRun.status ===
      "SUCCEEDED"
  ) {
    return "HEALTHY";
  }

  return "UNKNOWN";
}

/* -------------------------------------------------------------------------- */
/*                       NOTIFICATION OPERATIONS DATA                         */
/* -------------------------------------------------------------------------- */

export async function getNotificationOperationsData(): Promise<NotificationOperationsData> {
  const {
    userId,
    sessionClaims,
  } =
    await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (
    !userId ||
    role !==
      "admin"
  ) {
    throw new Error(
      "Unauthorized",
    );
  }

  const startOfToday =
    getUtcStartOfToday();

  const twentyFourHoursAgo =
    get24HoursAgo();

  const [
    latestRun,
    eventsCreatedToday,
    deliveriesCreatedToday,
    unreadToday,
    unseenToday,
    archivedToday,
    runsLast24Hours,
    recentRuns,
    recentFailures,
  ] =
    await Promise.all([
      prisma.notificationSchedulerRun.findFirst({
        orderBy: {
          startedAt:
            "desc",
        },

        include: {
          scanners: {
            orderBy: {
              startedAt:
                "asc",
            },
          },
        },
      }),

      prisma.notificationEvent.count({
        where: {
          createdAt: {
            gte:
              startOfToday,
          },
        },
      }),

      prisma.notification.count({
        where: {
          createdAt: {
            gte:
              startOfToday,
          },
        },
      }),

      prisma.notification.count({
        where: {
          createdAt: {
            gte:
              startOfToday,
          },

          readAt:
            null,

          archivedAt:
            null,
        },
      }),

      prisma.notification.count({
        where: {
          createdAt: {
            gte:
              startOfToday,
          },

          seenAt:
            null,

          archivedAt:
            null,
        },
      }),

      prisma.notification.count({
        where: {
          archivedAt: {
            gte:
              startOfToday,
          },
        },
      }),

      prisma.notificationSchedulerRun.findMany({
        where: {
          startedAt: {
            gte:
              twentyFourHoursAgo,
          },
        },

        select: {
          id:
            true,

          status:
            true,

          durationMs:
            true,
        },
      }),

      prisma.notificationSchedulerRun.findMany({
        orderBy: {
          startedAt:
            "desc",
        },

        take:
          10,

        select: {
          id:
            true,

          trigger:
            true,

          status:
            true,

          scannerCount:
            true,

          succeededCount:
            true,

          failedCount:
            true,

          startedAt:
            true,

          completedAt:
            true,

          durationMs:
            true,
        },
      }),

      prisma.notificationSchedulerScannerRun.findMany({
        where: {
          status:
            "FAILED",
        },

        orderBy: {
          startedAt:
            "desc",
        },

        take:
          8,

        select: {
          id:
            true,

          runId:
            true,

          scannerKey:
            true,

          errorMessage:
            true,

          startedAt:
            true,
        },
      }),
    ]);

  const successfulRuns =
    runsLast24Hours.filter(
      (
        run,
      ) =>
        run.status ===
        "SUCCEEDED",
    ).length;

  const partialRuns =
    runsLast24Hours.filter(
      (
        run,
      ) =>
        run.status ===
        "PARTIAL",
    ).length;

  const failedRuns =
    runsLast24Hours.filter(
      (
        run,
      ) =>
        run.status ===
        "FAILED",
    ).length;

  const durations =
    runsLast24Hours
      .map(
        (
          run,
        ) =>
          run.durationMs,
      )
      .filter(
        (
          duration,
        ): duration is number =>
          duration !==
          null,
      );

  const averageDurationMs =
    durations.length >
    0
      ? Math.round(
          durations.reduce(
            (
              total,
              duration,
            ) =>
              total +
              duration,

            0,
          ) /
            durations.length,
        )
      : null;

  const normalizedLatestRun =
    latestRun
      ? {
          id:
            latestRun.id,

          trigger:
            latestRun.trigger,

          status:
            latestRun.status,

          scannerCount:
            latestRun.scannerCount,

          succeededCount:
            latestRun.succeededCount,

          failedCount:
            latestRun.failedCount,

          startedAt:
            latestRun.startedAt,

          completedAt:
            latestRun.completedAt,

          durationMs:
            latestRun.durationMs,

          scanners:
            latestRun.scanners.map(
              (
                scanner,
              ) => ({
                id:
                  scanner.id,

                scannerKey:
                  scanner.scannerKey,

                status:
                  scanner.status,

                durationMs:
                  scanner.durationMs,

                errorMessage:
                  scanner.errorMessage,

                result:
                  scanner.result,

                startedAt:
                  scanner.startedAt,

                completedAt:
                  scanner.completedAt,
              }),
            ),
        }
      : null;

  return {
    health:
      resolveHealth({
        latestRun:
          normalizedLatestRun,
      }),

    latestRun:
      normalizedLatestRun,

    today: {
      eventsCreated:
        eventsCreatedToday,

      deliveriesCreated:
        deliveriesCreatedToday,

      unread:
        unreadToday,

      unseen:
        unseenToday,

      archived:
        archivedToday,
    },

    last24Hours: {
      runs:
        runsLast24Hours.length,

      successfulRuns,

      partialRuns,

      failedRuns,

      averageDurationMs,
    },

    recentRuns,

    recentFailures,
  };
}





/* -------------------------------------------------------------------------- */
/*                    ADMIN NOTIFICATION SYSTEM SETTINGS                      */
/* -------------------------------------------------------------------------- */

export async function getAdminNotificationSystemSettings() {
  const {
    userId,
    sessionClaims,
  } =
    await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (
    !userId ||
    role !==
      "admin"
  ) {
    throw new Error(
      "Unauthorized",
    );
  }

  const settings =
    await prisma.notificationSystemSettings.findUnique({
      where: {
        id:
          1,
      },

      select: {
        id:
          true,

        inAppEnabled:
          true,

        emailEnabled:
          true,

        pushEnabled:
          true,

        whatsAppEnabled:
          true,

        smsEnabled:
          true,

        quietHoursEnabled:
          true,

        updatedBy:
          true,

        updatedAt:
          true,
      },
    });

  return (
    settings ?? {
      id:
        1,

      inAppEnabled:
        true,

      emailEnabled:
        false,

      pushEnabled:
        false,

      whatsAppEnabled:
        false,

      smsEnabled:
        false,

      quietHoursEnabled:
        true,

      updatedBy:
        null,

      updatedAt:
        null,
    }
  );
}