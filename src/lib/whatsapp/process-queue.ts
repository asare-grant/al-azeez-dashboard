import "server-only";

import prisma from "@/lib/prisma";

import {
  getFeeAccountSummary,
} from "@/lib/finance/fee-account-service";

import {
  sendFeeReminderWhatsApp,
} from "./client";

/* -------------------------------------------------------------------------- */
/*                               CONSTANTS                                    */
/* -------------------------------------------------------------------------- */

const DEFAULT_BATCH_SIZE =
  20;

const MAX_ATTEMPTS =
  4;

/*
 * Retry progression:
 *
 * attempt 1 → 5 minutes
 * attempt 2 → 15 minutes
 * attempt 3 → 1 hour
 * attempt 4 → final failure
 */
function getRetryDelayMs(
  attemptCount:
    number,
) {
  if (
    attemptCount <=
    1
  ) {
    return (
      5 *
      60 *
      1000
    );
  }

  if (
    attemptCount ===
    2
  ) {
    return (
      15 *
      60 *
      1000
    );
  }

  return (
    60 *
    60 *
    1000
  );
}

/* -------------------------------------------------------------------------- */
/*                              RESULT TYPE                                   */
/* -------------------------------------------------------------------------- */

export type WhatsAppQueueProcessorResult = {
  scanned:
    number;

  claimed:
    number;

  sent:
    number;

  retried:
    number;

  failed:
    number;

  skipped:
    number;
};

/* -------------------------------------------------------------------------- */
/*                          CLAIM ONE DELIVERY                                */
/* -------------------------------------------------------------------------- */

async function claimWhatsAppDelivery(
  deliveryId:
    number,
) {
  const now =
    new Date();

  const claimed =
    await prisma.whatsAppDelivery.updateMany({
      where: {
        id:
          deliveryId,

        status:
          "QUEUED",

        OR: [
          {
            nextAttemptAt:
              null,
          },

          {
            nextAttemptAt: {
              lte:
                now,
            },
          },
        ],
      },

      data: {
        status:
          "PROCESSING",

        lastAttemptAt:
          now,

        attemptCount: {
          increment:
            1,
        },
      },
    });

  return (
    claimed.count ===
    1
  );
}

/* -------------------------------------------------------------------------- */
/*                           PROCESS ONE DELIVERY                             */
/* -------------------------------------------------------------------------- */

async function processWhatsAppDelivery(
  deliveryId:
    number,
) {
  const delivery =
    await prisma.whatsAppDelivery.findUnique({
      where: {
        id:
          deliveryId,
      },

      select: {
        id:
          true,

        status:
          true,

        attemptCount:
          true,

        phoneNumber:
          true,

        feeMasterId:
          true,

        studentId:
          true,

        recipientId:
          true,

        feeMaster: {
          select: {
            id:
              true,

            term:
              true,

            academicYear:
              true,

            student: {
              select: {
                id:
                  true,

                name:
                  true,

                surname:
                  true,

                parent: {
                  select: {
                    id:
                      true,

                    name:
                      true,

                    surname:
                      true,
                  },
                },
              },
            },
          },
        },
      },
    });

  if (
    !delivery ||
    delivery.status !==
      "PROCESSING"
  ) {
    return {
      status:
        "SKIPPED" as const,
    };
  }

  if (
    !delivery.feeMaster
  ) {
    await prisma.whatsAppDelivery.update({
      where: {
        id:
          delivery.id,
      },

      data: {
        status:
          "FAILED",

        failedAt:
          new Date(),

        failureCode:
          "FEE_ACCOUNT_NOT_FOUND",

        failureMessage:
          "The fee account linked to this WhatsApp reminder no longer exists.",
      },
    });

    return {
      status:
        "FAILED" as const,
    };
  }

  const invoice =
    delivery.feeMaster;

  const parent =
    invoice.student.parent;

  if (
    !parent
  ) {
    await prisma.whatsAppDelivery.update({
      where: {
        id:
          delivery.id,
      },

      data: {
        status:
          "FAILED",

        failedAt:
          new Date(),

        failureCode:
          "PARENT_NOT_FOUND",

        failureMessage:
          "The student no longer has a linked parent account.",
      },
    });

    return {
      status:
        "FAILED" as const,
    };
  }

  /* ---------------------------------------------------------------------- */
  /*                   RECHECK CURRENT FINANCIAL STATE                      */
  /* ---------------------------------------------------------------------- */

  const summary =
    await getFeeAccountSummary({
      feeMasterId:
        invoice.id,
    });

  /*
   * The parent may have paid AFTER the reminder
   * was queued but BEFORE the worker processed it.
   *
   * In that case, we must not send an outdated
   * arrears message.
   */
  if (
    summary.balance <=
    0
  ) {
    await prisma.whatsAppDelivery.update({
      where: {
        id:
          delivery.id,
      },

      data: {
        status:
          "FAILED",

        failedAt:
          new Date(),

        failureCode:
          "BALANCE_SETTLED",

        failureMessage:
          "The fee balance was settled before the WhatsApp reminder was sent.",
      },
    });

    return {
      status:
        "SKIPPED" as const,
    };
  }

  /* ---------------------------------------------------------------------- */
  /*                           SEND MESSAGE                                 */
  /* ---------------------------------------------------------------------- */

  try {
    const sent =
      await sendFeeReminderWhatsApp({
        phoneNumber:
          delivery.phoneNumber,

        parentName:
          `${parent.name} ${parent.surname}`.trim(),

        studentName:
          `${invoice.student.name} ${invoice.student.surname}`.trim(),

        term:
          invoice.term,

        academicYear:
          invoice.academicYear,

        balance:
          summary.balance,
      });

    await prisma.whatsAppDelivery.update({
      where: {
        id:
          delivery.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          sent.providerMessageId,

        sentAt:
          new Date(),

        nextAttemptAt:
          null,

        failureCode:
          null,

        failureMessage:
          null,
      },
    });

    return {
      status:
        "SENT" as const,
    };
  } catch (
    error
  ) {
    const message =
      error instanceof Error
        ? error.message
        : "WhatsApp delivery failed.";

    const finalAttempt =
      delivery.attemptCount >=
      MAX_ATTEMPTS;

    if (
      finalAttempt
    ) {
      await prisma.whatsAppDelivery.update({
        where: {
          id:
            delivery.id,
        },

        data: {
          status:
            "FAILED",

          failedAt:
            new Date(),

          nextAttemptAt:
            null,

          failureCode:
            "DELIVERY_FAILED",

          failureMessage:
            message,
        },
      });

      return {
        status:
          "FAILED" as const,
      };
    }

    const nextAttemptAt =
      new Date(
        Date.now() +
          getRetryDelayMs(
            delivery.attemptCount,
          ),
      );

    await prisma.whatsAppDelivery.update({
      where: {
        id:
          delivery.id,
      },

      data: {
        status:
          "QUEUED",

        nextAttemptAt,

        failureCode:
          "RETRY_SCHEDULED",

        failureMessage:
          message,
      },
    });

    return {
      status:
        "RETRY" as const,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                            QUEUE PROCESSOR                                 */
/* -------------------------------------------------------------------------- */

export async function processWhatsAppQueue({
  batchSize =
    DEFAULT_BATCH_SIZE,
}: {
  batchSize?:
    number;
} = {}): Promise<WhatsAppQueueProcessorResult> {
  const safeBatchSize =
    Math.max(
      1,

      Math.min(
        100,

        Math.floor(
          batchSize,
        ),
      ),
    );

  const now =
    new Date();

  const candidates =
    await prisma.whatsAppDelivery.findMany({
      where: {
        status:
          "QUEUED",

        OR: [
          {
            nextAttemptAt:
              null,
          },

          {
            nextAttemptAt: {
              lte:
                now,
            },
          },
        ],
      },

      select: {
        id:
          true,
      },

      orderBy: [
        {
          nextAttemptAt:
            "asc",
        },

        {
          queuedAt:
            "asc",
        },
      ],

      take:
        safeBatchSize,
    });

  let claimed =
    0;

  let sent =
    0;

  let retried =
    0;

  let failed =
    0;

  let skipped =
    0;

  /*
   * Sequential processing is intentional for now.
   *
   * It prevents a first release from generating
   * a burst of outbound requests and keeps worker
   * behavior easy to observe.
   */
  for (
    const candidate of
    candidates
  ) {
    const didClaim =
      await claimWhatsAppDelivery(
        candidate.id,
      );

    if (
      !didClaim
    ) {
      skipped++;

      continue;
    }

    claimed++;

    const result =
      await processWhatsAppDelivery(
        candidate.id,
      );

    if (
      result.status ===
      "SENT"
    ) {
      sent++;
    } else if (
      result.status ===
      "RETRY"
    ) {
      retried++;
    } else if (
      result.status ===
      "FAILED"
    ) {
      failed++;
    } else {
      skipped++;
    }
  }

  return {
    scanned:
      candidates.length,

    claimed,

    sent,

    retried,

    failed,

    skipped,
  };
}