import "server-only";

import {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  acquireNotificationSchedulerLock,
  releaseNotificationSchedulerLock,
} from "./scheduler-lock";

import {
  scheduledNotificationScanners,
} from "./scanner-registry";

import type {
  ScheduledNotificationEngineResult,
  ScheduledScannerExecution,
} from "./scheduler-types";

/* -------------------------------------------------------------------------- */
/*                               HELPERS                                      */
/* -------------------------------------------------------------------------- */

function errorMessage(
  error:
    unknown,
) {
  const message =
    error instanceof Error
      ? error.message
      : "The scheduled notification scanner failed.";

  /*
   * Keep scheduler logs useful without allowing
   * arbitrary provider/database errors to create
   * excessively large database records.
   */
  return message
    .trim()
    .slice(
      0,
      4000,
    );
}

function toJsonValue(
  value:
    unknown,
): Prisma.InputJsonValue {
  /*
   * Scanner results should contain ordinary
   * serializable summary objects.
   */
  return JSON.parse(
    JSON.stringify(
      value,
    ),
  ) as Prisma.InputJsonValue;
}

/* -------------------------------------------------------------------------- */
/*                      RUN SCHEDULED NOTIFICATIONS                           */
/* -------------------------------------------------------------------------- */

export async function runScheduledNotifications({
  trigger =
    "cron",
}: {
  trigger?:
    string;
} = {}): Promise<ScheduledNotificationEngineResult> {
  const lease =
    await acquireNotificationSchedulerLock();

  if (
    !lease
  ) {
    return {
      executed:
        false,

      reason:
        "ALREADY_RUNNING",
    };
  }

  const engineStartedAt =
    new Date();

  let runId:
    number | null =
    null;

  try {
    /* ------------------------------------------------------------------ */
    /*                         CREATE RUN LOG                             */
    /* ------------------------------------------------------------------ */

    const schedulerRun =
      await prisma.notificationSchedulerRun.create({
        data: {
          trigger:

            trigger
              .trim()
              .slice(
                0,
                100,
              ) ||
            "unknown",

          status:
            "RUNNING",

          scannerCount:
            scheduledNotificationScanners.length,

          startedAt:
            engineStartedAt,
        },

        select: {
          id:
            true,
        },
      });

    runId =
      schedulerRun.id;

    const scannerResults:
      ScheduledScannerExecution[] =
      [];

    let succeededCount =
      0;

    let failedCount =
      0;

    /* ------------------------------------------------------------------ */
    /*                        EXECUTE SCANNERS                            */
    /* ------------------------------------------------------------------ */

    /*
     * Sequential execution is deliberate.
     *
     * Failure isolation does NOT require Promise.all().
     * Running them sequentially:
     *
     * - reduces sudden database load
     * - gives predictable logs
     * - prevents one expensive scanner from competing
     *   with three others for connections
     * - still allows every scanner to execute after
     *   another scanner fails
     */
    for (
      const scanner of
      scheduledNotificationScanners
    ) {
      const scannerStartedAt =
        new Date();

      const scannerLog =
        await prisma.notificationSchedulerScannerRun.create({
          data: {
            runId:
              schedulerRun.id,

            scannerKey:
              scanner.key,

            status:
              "RUNNING",

            startedAt:
              scannerStartedAt,
          },

          select: {
            id:
              true,
          },
        });

      try {
        console.info(
          `[NOTIFICATION SCHEDULER] Starting ${scanner.key}`,
        );

        const result =
          await scanner.run();

        const completedAt =
          new Date();

        const durationMs =
          completedAt.getTime() -
          scannerStartedAt.getTime();

        await prisma.notificationSchedulerScannerRun.update({
          where: {
            id:
              scannerLog.id,
          },

          data: {
            status:
              "SUCCEEDED",

            result:
              toJsonValue(
                result,
              ),

            completedAt,

            durationMs,
          },
        });

        succeededCount++;

        scannerResults.push({
          key:
            scanner.key,

          status:
            "SUCCEEDED",

          durationMs,

          result,
        });

        console.info(
          `[NOTIFICATION SCHEDULER] Completed ${scanner.key} in ${durationMs}ms`,
        );
      } catch (
        error
      ) {
        const completedAt =
          new Date();

        const durationMs =
          completedAt.getTime() -
          scannerStartedAt.getTime();

        const message =
          errorMessage(
            error,
          );

        /*
         * Record this scanner failure and CONTINUE.
         *
         * This is the core failure-isolation behaviour.
         */
        await prisma.notificationSchedulerScannerRun.update({
          where: {
            id:
              scannerLog.id,
          },

          data: {
            status:
              "FAILED",

            errorMessage:
              message,

            completedAt,

            durationMs,
          },
        });

        failedCount++;

        scannerResults.push({
          key:
            scanner.key,

          status:
            "FAILED",

          durationMs,

          error:
            message,
        });

        console.error(
          `[NOTIFICATION SCHEDULER] ${scanner.key} failed:`,
          error,
        );
      }
    }

    /* ------------------------------------------------------------------ */
    /*                      FINAL ENGINE STATUS                           */
    /* ------------------------------------------------------------------ */

    const completedAt =
      new Date();

    const durationMs =
      completedAt.getTime() -
      engineStartedAt.getTime();

    const status =
      failedCount ===
      0
        ? "SUCCEEDED"
        : succeededCount >
            0
          ? "PARTIAL"
          : "FAILED";

    await prisma.notificationSchedulerRun.update({
      where: {
        id:
          schedulerRun.id,
      },

      data: {
        status,

        succeededCount,

        failedCount,

        completedAt,

        durationMs,
      },
    });

    return {
      executed:
        true,

      runId:
        schedulerRun.id,

      status,

      startedAt:
        engineStartedAt.toISOString(),

      completedAt:
        completedAt.toISOString(),

      durationMs,

      scannerCount:
        scheduledNotificationScanners.length,

      succeededCount,

      failedCount,

      scanners:
        scannerResults,
    };
  } catch (
    error
  ) {
    /*
     * This block represents failure of the ENGINE
     * itself rather than one individual scanner.
     */
    const completedAt =
      new Date();

    const durationMs =
      completedAt.getTime() -
      engineStartedAt.getTime();

    console.error(
      "NOTIFICATION SCHEDULER ENGINE ERROR:",
      error,
    );

    if (
      runId
    ) {
      try {
        await prisma.notificationSchedulerRun.update({
          where: {
            id:
              runId,
          },

          data: {
            status:
              "FAILED",

            completedAt,

            durationMs,
          },
        });
      } catch (
        logError
      ) {
        console.error(
          "NOTIFICATION SCHEDULER LOGGING ERROR:",
          logError,
        );
      }
    }

    throw error;
  } finally {
    /*
     * Always attempt to release our own lease.
     *
     * The token condition in the lock service
     * prevents us from releasing somebody else's
     * replacement lease.
     */
    try {
      await releaseNotificationSchedulerLock({
        key:
          lease.key,

        token:
          lease.token,
      });
    } catch (
      error
    ) {
      console.error(
        "NOTIFICATION SCHEDULER LOCK RELEASE ERROR:",
        error,
      );
    }
  }
}