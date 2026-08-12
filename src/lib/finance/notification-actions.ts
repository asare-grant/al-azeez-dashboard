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

import {
  Prisma,
} from "@prisma/client";

import {
  queueFeeReminderWhatsApp,
} from "@/lib/whatsapp/queue";

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

/* -------------------------------------------------------------------------- */
/*             SEND SINGLE FEE REMINDER — IN-APP + WHATSAPP                  */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*          SINGLE OUTSTANDING FEE REMINDER — MULTI CHANNEL                   */
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

  /* ---------------------------------------------------------------------- */
  /*                              AUTHORISATION                             */
  /* ---------------------------------------------------------------------- */

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
    /*
     * One individual reminder per invoice per day.
     */
    const today =
      new Date()
        .toISOString()
        .slice(
          0,
          10,
        );

    const reminderKey =
      `individual-${today}`;

    const result =
      await prisma.$transaction(
        async (
          tx,
        ) => {
          /* -------------------------------------------------------------- */
          /*                       LOAD FEE ACCOUNT                          */
          /* -------------------------------------------------------------- */

          const invoice =
            await tx.feeMaster.findUnique({
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

                    class: {
                      select: {
                        id:
                          true,

                        name:
                          true,
                      },
                    },

                    parent: {
                      select: {
                        id:
                          true,

                        name:
                          true,

                        surname:
                          true,

                        phone:
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
            throw new Error(
              "The fee account could not be found.",
            );
          }

          /* -------------------------------------------------------------- */
          /*                         PARENT                                 */
          /* -------------------------------------------------------------- */

          const parent =
            invoice.student
              .parent;

          if (
            !parent
          ) {
            throw new Error(
              "No parent account is linked to this student.",
            );
          }

          const parentPhone =
            parent.phone
              ?.trim() ??
            "";

          if (
            !parentPhone
          ) {
            throw new Error(
              "The linked parent does not have a contact phone number.",
            );
          }

          /* -------------------------------------------------------------- */
          /*                 RECALCULATE REAL BALANCE                       */
          /* -------------------------------------------------------------- */

          const summary =
            await getFeeAccountSummary({
              feeMasterId:
                invoice.id,

              tx,
            });

          if (
            summary.balance <=
            0
          ) {
            throw new Error(
              "This student's fee account is already fully paid.",
            );
          }

          /* -------------------------------------------------------------- */
          /*                    CREATE IN-APP EVENT                         */
          /* -------------------------------------------------------------- */

          const notification =
            await notifyFeeBalanceDue({
              tx,

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

              actorId:
                userId,

              actorRole:
                "admin",

              actorName:
                null,
            });

          if (
            !notification
          ) {
            throw new Error(
              "The parent could not be resolved for notification delivery.",
            );
          }

          /*
           * Your notification system already uses
           * dedupe keys.
           *
           * If today's logical reminder already
           * exists, we must NOT create another
           * WhatsApp job.
           */
          if (
            !notification
              .createdEvent
          ) {
            throw new Error(
              "A fee reminder has already been sent for this account today.",
            );
          }

          /* -------------------------------------------------------------- */
          /*          RESOLVE THE EVENT ID FROM THE DEDUPE KEY             */
          /* -------------------------------------------------------------- */

          /*
           * notifyFeeBalanceDue() generates:
           *
           * fee:{feeMasterId}:balance:{reminderKey}
           */
          const dedupeKey =
            `fee:${invoice.id}:balance:${reminderKey}`;

          const notificationEvent =
            await tx.notificationEvent.findUnique({
              where: {
                dedupeKey,
              },

              select: {
                id:
                  true,
              },
            });

          if (
            !notificationEvent
          ) {
            throw new Error(
              "The finance notification event could not be resolved.",
            );
          }

          /* -------------------------------------------------------------- */
          /*                 QUEUE WHATSAPP DELIVERY                        */
          /* -------------------------------------------------------------- */

          const whatsapp =
            await queueFeeReminderWhatsApp({
              tx,

              recipientId:
                parent.id,

              phoneNumber:
                parentPhone,

              notificationEventId:
                notificationEvent.id,

              feeMasterId:
                invoice.id,

              studentId:
                invoice.student.id,
            });

          /* -------------------------------------------------------------- */
          /*                           RESULT                               */
          /* -------------------------------------------------------------- */

          return {
            feeMasterId:
              invoice.id,

            studentId:
              invoice.student.id,

            studentName:
              `${invoice.student.name} ${invoice.student.surname}`.trim(),

            parentId:
              parent.id,

            parentName:
              `${parent.name} ${parent.surname}`.trim(),

            balance:
              summary.balance,

            notificationEventId:
              notificationEvent.id,

            inAppDeliveredCount:
              notification.deliveredCount,

            whatsappDeliveryId:
              whatsapp.id,

            whatsappStatus:
              whatsapp.status,
          };
        },

        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,

          maxWait:
            10_000,

          timeout:
            30_000,
        },
      );

    /* ------------------------------------------------------------------ */
    /*                          REVALIDATION                              */
    /* ------------------------------------------------------------------ */

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

      data:
        result,

      message:
        `Reminder created successfully for ${result.studentName}. In-app delivery completed and WhatsApp delivery was queued.`,
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
          : "The fee reminder could not be created.",
    };
  }
}