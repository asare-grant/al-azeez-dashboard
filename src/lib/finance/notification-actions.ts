"use server";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  revalidatePath,
} from "next/cache";

import prisma from "@/lib/prisma";

import {
  getFeeAccountSummary,
} from "@/lib/finance/fee-account-service";

import {
  notifyFeeBalanceDue,
} from "@/lib/notifications/finance-notifications";

/* -------------------------------------------------------------------------- */
/*                       SEND ARREARS REMINDERS                               */
/* -------------------------------------------------------------------------- */

export async function sendOutstandingFeeReminders({
  term,
  academicYear,
}: {
  term:
    string;

  academicYear:
    string;
}) {
  const {
    userId,
    sessionClaims,
  } =
    await auth();

  const role = (
    sessionClaims?.metadata as {
      role?:
        string;
    }
  )?.role;

  if (
    !userId ||
    role !==
      "admin"
  ) {
    return {
      success:
        false,

      error:
        true,

      message:
        "You are not authorized to send fee reminders.",
    };
  }

  const normalisedTerm =
    term.trim();

  const normalisedAcademicYear =
    academicYear.trim();

  if (
    !normalisedTerm ||
    !normalisedAcademicYear
  ) {
    return {
      success:
        false,

      error:
        true,

      message:
        "Select a term and academic year before sending reminders.",
    };
  }

  try {
    const invoices =
      await prisma.feeMaster.findMany({
        where: {
          term:
            normalisedTerm,

          academicYear:
            normalisedAcademicYear,
        },

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

              parentId:
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

    let outstandingCount =
      0;

    let notifiedCount =
      0;

    let skippedNoParent =
      0;

    let skippedDuplicate =
      0;

    /*
     * A manual batch gets its own date-based key.
     *
     * This prevents an accidental double-click from
     * notifying the same parent twice on the same day,
     * while still allowing another reminder on a later day.
     */
    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        );

    for (
      const invoice of
      invoices
    ) {
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

      outstandingCount++;

      if (
        !invoice.student
          .parentId
      ) {
        skippedNoParent++;

        continue;
      }

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

          /*
           * Different namespace from the scheduled
           * monthly reminder.
           */
          reminderKey:
            `manual-${today}`,

          actorId:
            userId,

          actorRole:
            "admin",

          actorName:
            null,
        });

      if (
        !result
      ) {
        continue;
      }

      if (
        result.createdEvent
      ) {
        notifiedCount +=
          result.deliveredCount;
      } else {
        skippedDuplicate++;
      }
    }

    revalidatePath(
      "/list/FinanceDashboardPage",
    );

    revalidatePath(
      "/notifications",
    );

    return {
      success:
        true,

      error:
        false,

      data: {
        invoicesScanned:
          invoices.length,

        outstandingCount,

        notifiedCount,

        skippedNoParent,

        skippedDuplicate,
      },

      message:
        outstandingCount ===
        0
          ? "There are no outstanding fee balances for this period."
          : `Fee reminders processed successfully for ${outstandingCount} outstanding account${
              outstandingCount ===
              1
                ? ""
                : "s"
            }.`,
    };
  } catch (
    error
  ) {
    console.error(
      "SEND OUTSTANDING FEE REMINDERS ERROR:",
      error,
    );

    return {
      success:
        false,

      error:
        true,

      message:
        error instanceof Error
          ? error.message
          : "Fee reminders could not be sent.",
    };
  }
}





/* -------------------------------------------------------------------------- */
/*                 SEND SINGLE OUTSTANDING FEE REMINDER                       */
/* -------------------------------------------------------------------------- */

export async function sendSingleOutstandingFeeReminder({
  feeMasterId,
}: {
  feeMasterId:
    number;
}) {
  const {
    userId,
    sessionClaims,
  } =
    await auth();

  const role = (
    sessionClaims?.metadata as {
      role?:
        string;
    }
  )?.role;

  if (
    !userId ||
    role !==
      "admin"
  ) {
    return {
      success:
        false,

      error:
        true,

      message:
        "You are not authorized to send fee reminders.",
    };
  }

  if (
    !Number.isInteger(
      feeMasterId,
    ) ||
    feeMasterId <=
      0
  ) {
    return {
      success:
        false,

      error:
        true,

      message:
        "Select a valid fee account.",
    };
  }

  try {
    const invoice =
      await prisma.feeMaster.findUnique({
        where: {
          id:
            feeMasterId,
        },

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

              parentId:
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
      });

    if (
      !invoice
    ) {
      return {
        success:
          false,

        error:
          true,

        message:
          "The fee account could not be found.",
      };
    }

    if (
      !invoice.student
        .parentId
    ) {
      return {
        success:
          false,

        error:
          true,

        message:
          "No parent account is linked to this student.",
      };
    }

    /*
     * Never trust the balance displayed in the browser.
     *
     * Recalculate directly from the authoritative
     * invoice/payment records before notifying anyone.
     */
    const summary =
      await getFeeAccountSummary({
        feeMasterId:
          invoice.id,
      });

    if (
      summary.balance <=
      0
    ) {
      return {
        success:
          false,

        error:
          true,

        message:
          "This student's fee account is already fully paid.",
      };
    }

    /*
     * One individual reminder per invoice per day.
     *
     * This protects against accidental repeated clicks
     * while still allowing another reminder on a later day.
     */
    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        );

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

        reminderKey:
          `individual-${today}`,

        actorId:
          userId,

        actorRole:
          "admin",

        actorName:
          null,
      });

    revalidatePath(
      "/list/FinanceDashboardPage",
    );

    revalidatePath(
      "/notifications",
    );

    if (
      !result
    ) {
      return {
        success:
          false,

        error:
          true,

        message:
          "The parent could not be resolved for notification delivery.",
      };
    }

    if (
      !result.createdEvent
    ) {
      return {
        success:
          false,

        error:
          true,

        message:
          "A fee reminder has already been sent for this account today.",
      };
    }

    return {
      success:
        true,

      error:
        false,

      data: {
        feeMasterId:
          invoice.id,

        studentId:
          invoice.student.id,

        studentName:
          `${invoice.student.name} ${invoice.student.surname}`.trim(),

        balance:
          summary.balance,

        deliveredCount:
          result.deliveredCount,
      },

      message:
        `Fee reminder sent successfully for ${invoice.student.name} ${invoice.student.surname}.`,
    };
  } catch (
    error
  ) {
    console.error(
      "SEND SINGLE FEE REMINDER ERROR:",
      error,
    );

    return {
      success:
        false,

      error:
        true,

      message:
        error instanceof Error
          ? error.message
          : "The fee reminder could not be sent.",
    };
  }
}