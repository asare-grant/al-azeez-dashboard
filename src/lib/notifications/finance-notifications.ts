import "server-only";

import type {
  PaymentMethod,
  Prisma,
} from "@prisma/client";

import {
  createNotificationEvent,
} from "./service";

import {
  getFeeParentRecipients,
} from "./finance-recipients";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

type NotificationTx = {
  tx?:
    Prisma.TransactionClient;
};

type FeeNotificationBase = {
  feeMasterId:
    number;

  studentId:
    string;

  studentName:
    string;

  classId:
    number;

  className:
    string;

  term:
    string;

  academicYear:
    string;

  actorId?:
    string | null;

  actorRole?:
    string | null;

  actorName?:
    string | null;
};

function money(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-GH",
    {
      style:
        "currency",

      currency:
        "GHS",

      minimumFractionDigits:
        2,
    },
  ).format(
    value,
  );
}

function buildFeeMetadata(
  input:
    FeeNotificationBase,
) {
  return {
    feeMasterId:
      input.feeMasterId,

    studentId:
      input.studentId,

    studentName:
      input.studentName,

    classId:
      input.classId,

    className:
      input.className,

    term:
      input.term,

    academicYear:
      input.academicYear,
  };
}

/* -------------------------------------------------------------------------- */
/*                           FEE ASSIGNED                                     */
/* -------------------------------------------------------------------------- */

export async function notifyFeeAssigned({
  totalAmount,
  tx,
  ...input
}: FeeNotificationBase &
  NotificationTx & {
    totalAmount:
      number;
  }) {
  const recipients =
    await getFeeParentRecipients({
      studentId:
        input.studentId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "FEE_ASSIGNED",

      category:
        "FINANCE",

      priority:
        "NORMAL",

      title:
        "New School Fee Invoice",

      message:
        `A ${money(
          totalAmount,
        )} school fee invoice has been issued for ${input.studentName} for ${input.term}, ${input.academicYear}.`,

      actionUrl:
        null,

      entityType:
        "FEE",

      entityId:
        String(
          input.feeMasterId,
        ),

      dedupeKey:
        `fee:${input.feeMasterId}:assigned`,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata: {
        ...buildFeeMetadata(
          input,
        ),

        totalAmount,
      },

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                         PAYMENT RECEIVED                                   */
/* -------------------------------------------------------------------------- */

export async function notifyFeePaymentReceived({
  paymentId,
  amountPaid,
  totalPaid,
  balance,
  paymentMethod,
  tx,
  ...input
}: FeeNotificationBase &
  NotificationTx & {
    paymentId:
      number;

    amountPaid:
      number;

    totalPaid:
      number;

    balance:
      number;

    paymentMethod:
      PaymentMethod;
  }) {
  const recipients =
    await getFeeParentRecipients({
      studentId:
        input.studentId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  const fullyPaid =
    balance <=
    0;

  return createNotificationEvent({
    tx,

    input: {
      type:
        "FEE_PAYMENT_RECEIVED",

      category:
        "FINANCE",

      priority:
        fullyPaid
          ? "NORMAL"
          : "NORMAL",

      title:
        fullyPaid
          ? "School Fees Fully Paid"
          : "Fee Payment Received",

      message:
        fullyPaid
          ? `${money(
              amountPaid,
            )} was received for ${input.studentName}. The ${input.term} school fee account is now fully paid.`
          : `${money(
              amountPaid,
            )} was received for ${input.studentName}. Remaining balance: ${money(
              balance,
            )}.`,

      actionUrl:
        null,

      entityType:
        "PAYMENT",

      entityId:
        String(
          paymentId,
        ),

      dedupeKey:
        `fee-payment:${paymentId}:received`,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata: {
        ...buildFeeMetadata(
          input,
        ),

        paymentId,

        amountPaid,

        totalPaid,

        balance,

        paymentMethod,
      },

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                          BALANCE REMINDER                                  */
/* -------------------------------------------------------------------------- */

export async function notifyFeeBalanceDue({
  totalAmount,
  totalPaid,
  balance,
  reminderKey,
  tx,
  ...input
}: FeeNotificationBase &
  NotificationTx & {
    totalAmount:
      number;

    totalPaid:
      number;

    balance:
      number;

    reminderKey:
      string;
  }) {
  if (
    balance <=
    0
  ) {
    return null;
  }

  const recipients =
    await getFeeParentRecipients({
      studentId:
        input.studentId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "FEE_BALANCE_DUE",

      category:
        "FINANCE",

      priority:
        "HIGH",

      title:
        "Outstanding School Fee Balance",

      message:
        `${input.studentName} has an outstanding school fee balance of ${money(
          balance,
        )} for ${input.term}, ${input.academicYear}.`,

      actionUrl:
        null,

      entityType:
        "FEE",

      entityId:
        String(
          input.feeMasterId,
        ),

      /*
       * reminderKey defines the reminder cycle.
       *
       * Example:
       * 2026-08
       *
       * This permits another legitimate reminder
       * next month without repeated notifications
       * during the current month.
       */
      dedupeKey:
        `fee:${input.feeMasterId}:balance:${reminderKey}`,

      actorId:
        input.actorId ??
        null,

      actorRole:
        input.actorRole ??
        "system",

      actorName:
        input.actorName ??
        "Finance Monitor",

      metadata: {
        ...buildFeeMetadata(
          input,
        ),

        totalAmount,

        totalPaid,

        balance,

        reminderKey,
      },

      recipients,
    },
  });
}