import "server-only";

import prisma from "@/lib/prisma";

import {
  getFeeAccountSummary,
} from "@/lib/finance/fee-account-service";

import {
  notifyFeeBalanceDue,
} from "@/lib/notifications/finance-notifications";

function currentReminderKey(
  now:
    Date,
) {
  return `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() +
      1,
  ).padStart(
    2,
    "0",
  )}`;
}

export async function processFeeBalanceReminders() {
  const now =
    new Date();

  const reminderKey =
    currentReminderKey(
      now,
    );

  /*
   * Only invoices that are not already marked paid
   * need scanning.
   *
   * We still recalculate the account below rather
   * than trusting status alone.
   */
  const invoices =
    await prisma.feeMaster.findMany({
      where: {
        status: {
          in: [
            "PENDING",
            "PARTIAL",
          ],
        },
      },

      select: {
        id:
          true,

        term:
          true,

        academicYear:
          true,

        totalAmount:
          true,

        student: {
          select: {
            id:
              true,

            name:
              true,

            surname:
              true,

            class: {
              select: {
                id:
                  true,

                name:
                  true,
              },
            },
          },
        },
      },

      orderBy: {
        id:
          "asc",
      },
    });

  let scanned =
    0;

  let outstanding =
    0;

  let eventsCreated =
    0;

  let deliveriesCreated =
    0;

  for (
    const invoice of
    invoices
  ) {
    scanned++;

    const summary =
      await getFeeAccountSummary({
        feeMasterId:
          invoice.id,
      });

    if (
      summary.balance <=
      0
    ) {
      continue;
    }

    outstanding++;

    const result =
      await notifyFeeBalanceDue({
        feeMasterId:
          invoice.id,

        studentId:
          invoice.student.id,

        studentName:
          `${invoice.student.name} ${invoice.student.surname}`.trim(),

        classId:
          invoice.student.class.id,

        className:
          invoice.student.class.name,

        term:
          invoice.term,

        academicYear:
          invoice.academicYear,

        totalAmount:
          summary.totalAmount,

        totalPaid:
          summary.paidAmount,

        balance:
          summary.balance,

        reminderKey,
      });

    if (
      !result
    ) {
      continue;
    }

    if (
      result.createdEvent
    ) {
      eventsCreated++;
    }

    deliveriesCreated +=
      result.deliveredCount;
  }

  return {
    scanned,

    outstanding,

    eventsCreated,

    deliveriesCreated,
  };
}