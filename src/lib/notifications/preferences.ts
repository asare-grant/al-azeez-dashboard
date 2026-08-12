import "server-only";

import type { NotificationCategory, Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

type NotificationDb = typeof prisma | Prisma.TransactionClient;

export type NotificationPreferenceState = {
  category: NotificationCategory;

  inAppEnabled: boolean;

  emailEnabled: boolean;

  pushEnabled: boolean;

  whatsAppEnabled: boolean;

  smsEnabled: boolean;
};

/* -------------------------------------------------------------------------- */
/*                      DEFAULT PREFERENCE                                    */
/* -------------------------------------------------------------------------- */

export function getDefaultNotificationPreference(
  category: NotificationCategory,
): NotificationPreferenceState {
  return {
    category,

    inAppEnabled: true,

    emailEnabled: false,

    pushEnabled: false,

    whatsAppEnabled: false,

    smsEnabled: false,
  };
}

/* -------------------------------------------------------------------------- */
/*                       GET USER PREFERENCE                                  */
/* -------------------------------------------------------------------------- */

export async function getUserNotificationPreference({
  userId,
  category,
  tx,
}: {
  userId: string;

  category: NotificationCategory;

  tx?: Prisma.TransactionClient;
}): Promise<NotificationPreferenceState> {
  const db: NotificationDb = tx ?? prisma;

  const preference = await db.notificationPreference.findUnique({
    where: {
      userId_category: {
        userId,

        category,
      },
    },

    select: {
      category: true,

      inAppEnabled: true,

      emailEnabled: true,

      pushEnabled: true,

      whatsAppEnabled: true,

      smsEnabled: true,
    },
  });

  return preference ?? getDefaultNotificationPreference(category);
}

/* -------------------------------------------------------------------------- */
/*                  FILTER RECIPIENTS BY IN-APP PREFERENCE                    */
/* -------------------------------------------------------------------------- */

export async function filterRecipientsByInAppPreference<
  T extends {
    recipientId: string;
  },
>({
  recipients,
  category,
  tx,
}: {
  recipients: T[];

  category: NotificationCategory;

  tx?: Prisma.TransactionClient;
}): Promise<T[]> {
  if (recipients.length === 0) {
    return [];
  }

  const db: NotificationDb = tx ?? prisma;

  const userIds = Array.from(
    new Set(
      recipients
        .map((recipient) => recipient.recipientId.trim())
        .filter(Boolean),
    ),
  );

  if (userIds.length === 0) {
    return [];
  }

  /*
   * Fetch only explicitly stored preferences.
   *
   * Missing rows intentionally mean:
   *
   * inAppEnabled = true
   *
   * because notifications are enabled
   * by default.
   */
  const preferences = await db.notificationPreference.findMany({
    where: {
      userId: {
        in: userIds,
      },

      category,
    },

    select: {
      userId: true,

      inAppEnabled: true,
    },
  });

  const disabledUserIds = new Set(
    preferences
      .filter((preference) => !preference.inAppEnabled)
      .map((preference) => preference.userId),
  );

  return recipients.filter(
    (recipient) => !disabledUserIds.has(recipient.recipientId),
  );
}
