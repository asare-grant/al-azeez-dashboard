// src/lib/notifications/service.ts
import "server-only";

import type {
  NotificationCategory,
  NotificationEntityType,
  NotificationPriority,
  NotificationType,
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import { isMandatoryNotification } from "./policy";

import {
  filterRecipientsByInAppPreference,
} from "./preferences";
/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type NotificationDb = typeof prisma | Prisma.TransactionClient;

export type NotificationRecipient = {
  recipientId: string;
  recipientRole: string;
};

export type CreateNotificationEventInput = {
  type: NotificationType;

  category: NotificationCategory;

  priority?: NotificationPriority;

  title: string;

  message: string;

  actionUrl?: string | null;

  entityType?: NotificationEntityType | null;

  entityId?: string | number | null;

  dedupeKey?: string | null;

  actorId?: string | null;

  actorRole?: string | null;

  actorName?: string | null;

  metadata?: Prisma.InputJsonValue | null;

  recipients: NotificationRecipient[];
};

export type NotificationDispatchResult = {
  eventId: number;

  createdEvent: boolean;

  recipientCount: number;

  deliveredCount: number;
};

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

function normalizeText(value?: string | null) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function normalizeEntityId(value?: string | number | null) {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized || null;
}

function normalizeRecipients(recipients: NotificationRecipient[]) {
  const unique = new Map<string, NotificationRecipient>();

  for (const recipient of recipients) {
    const recipientId = recipient.recipientId.trim();

    const recipientRole = recipient.recipientRole.trim();

    if (!recipientId || !recipientRole) {
      continue;
    }

    unique.set(recipientId, {
      recipientId,
      recipientRole,
    });
  }

  return Array.from(unique.values());
}

/* -------------------------------------------------------------------------- */
/*                         CORE DISPATCH FUNCTION                             */
/* -------------------------------------------------------------------------- */

export async function createNotificationEvent({
  input,
  tx,
}: {
  input: CreateNotificationEventInput;

  tx?: Prisma.TransactionClient;
}): Promise<NotificationDispatchResult> {
  const db: NotificationDb = tx ?? prisma;

  const title = input.title.trim();

  const message = input.message.trim();

  if (!title) {
    throw new Error("Notification title is required.");
  }

  if (!message) {
    throw new Error("Notification message is required.");
  }

  const resolvedRecipients = normalizeRecipients(input.recipients);

  if (resolvedRecipients.length === 0) {
    return {
      eventId: 0,

      createdEvent: false,

      recipientCount: 0,

      deliveredCount: 0,
    };
  }

  /*
   * Mandatory workflow/integrity notifications
   * bypass user preference filtering.
   */
  const mandatory = isMandatoryNotification(input.type);

  const recipients =
  mandatory
    ? resolvedRecipients
    : await filterRecipientsByInAppPreference({
        recipients:
          resolvedRecipients,

        category:
          input.category,

        tx,
      });

  /*
   * The event had intended recipients, but all
   * optional deliveries were disabled by user
   * preferences.
   *
   * No event needs to be created because there
   * will be no deliveries.
   */
  if (recipients.length === 0) {
    return {
      eventId: 0,

      createdEvent: false,

      recipientCount: resolvedRecipients.length,

      deliveredCount: 0,
    };
  }

  const dedupeKey = normalizeText(input.dedupeKey);

  /*
   * If a dedupe key is supplied, reuse the
   * existing logical event instead of creating
   * another copy.
   */
  const existingEvent = dedupeKey
    ? await db.notificationEvent.findUnique({
        where: {
          dedupeKey,
        },

        select: {
          id: true,
        },
      })
    : null;

  const event = existingEvent
    ? existingEvent
    : await db.notificationEvent.create({
        data: {
          type: input.type,

          category: input.category,

          priority: input.priority ?? "NORMAL",

          title,

          message,

          actionUrl: normalizeText(input.actionUrl),

          entityType: input.entityType ?? null,

          entityId: normalizeEntityId(input.entityId),

          dedupeKey,

          actorId: normalizeText(input.actorId),

          actorRole: normalizeText(input.actorRole),

          actorName: normalizeText(input.actorName),

          metadata: input.metadata ?? undefined,
        },

        select: {
          id: true,
        },
      });

  /*
   * createMany + skipDuplicates works with:
   *
   * @@unique([eventId, recipientId])
   *
   * so retrying the same logical dispatch does
   * not create duplicate user deliveries.
   */
  const delivery = await db.notification.createMany({
    data: recipients.map((recipient) => ({
      eventId: event.id,

      recipientId: recipient.recipientId,

      recipientRole: recipient.recipientRole,
    })),

    skipDuplicates: true,
  });

  return {
    eventId: event.id,

    createdEvent: !existingEvent,

    recipientCount: resolvedRecipients.length,

    deliveredCount: delivery.count,
  };
}

/* -------------------------------------------------------------------------- */
/*                        CONVENIENCE DELIVERY HELPERS                         */
/* -------------------------------------------------------------------------- */

export async function notifyUser({
  recipientId,
  recipientRole,
  ...eventInput
}: Omit<CreateNotificationEventInput, "recipients"> & {
  recipientId: string;
  recipientRole: string;
}) {
  return createNotificationEvent({
    input: {
      ...eventInput,

      recipients: [
        {
          recipientId,
          recipientRole,
        },
      ],
    },
  });
}

export async function notifyUsers({
  recipients,
  ...eventInput
}: CreateNotificationEventInput) {
  return createNotificationEvent({
    input: {
      ...eventInput,

      recipients,
    },
  });
}

export async function createNotificationEventWithTransaction({
  tx,
  input,
}: {
  tx: Prisma.TransactionClient;

  input: CreateNotificationEventInput;
}) {
  return createNotificationEvent({
    input,
    tx,
  });
}
