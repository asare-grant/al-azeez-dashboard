import "server-only";

import type { Prisma } from "@prisma/client";

import { normaliseWhatsAppPhone } from "./phone";

export async function queueFeeReminderWhatsApp({
  tx,

  phoneNumber,

  recipientId,

  feeMasterId,

  studentId,

  notificationEventId,
}: {
  tx: Prisma.TransactionClient;

  phoneNumber: string;

  recipientId: string | null;

  feeMasterId: number;

  studentId: string;

  notificationEventId: number;
}) {
  const normalizedPhone = normaliseWhatsAppPhone(phoneNumber);

  const templateName =
    process.env.WHATSAPP_FEE_REMINDER_TEMPLATE ?? "school_fee_balance_reminder";

  return tx.whatsAppDelivery.create({
    data: {
      recipientId,

      recipientRole: "parent",

      phoneNumber: normalizedPhone,

      templateName,

      status: "QUEUED",

      attemptCount: 0,

      nextAttemptAt: new Date(),

      feeMasterId,

      studentId,

      notificationEventId,
    },

    select: {
      id: true,

      status: true,

      queuedAt: true,

      phoneNumber: true,

      notificationEventId: true,

      feeMasterId: true,

      studentId: true,
    },
  });
}
