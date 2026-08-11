import "server-only";

import type {
  NotificationCategory,
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

type NotificationDb =
  | typeof prisma
  | Prisma.TransactionClient;

export type NotificationPreferenceState = {
  category:
    NotificationCategory;

  inAppEnabled:
    boolean;

  emailEnabled:
    boolean;

  pushEnabled:
    boolean;
};

/* -------------------------------------------------------------------------- */
/*                      DEFAULT PREFERENCE                                    */
/* -------------------------------------------------------------------------- */

export function getDefaultNotificationPreference(
  category: NotificationCategory,
): NotificationPreferenceState {
  return {
    category,

    /*
     * Existing behavior remains unchanged:
     * notifications are enabled unless the user
     * explicitly disables a category.
     */
    inAppEnabled:
      true,

    emailEnabled:
      false,

    pushEnabled:
      false,
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
  userId:
    string;

  category:
    NotificationCategory;

  tx?:
    Prisma.TransactionClient;
}): Promise<NotificationPreferenceState> {
  const db: NotificationDb =
    tx ??
    prisma;

  const preference =
    await db.notificationPreference.findUnique({
      where: {
        userId_category: {
          userId,

          category,
        },
      },

      select: {
        category:
          true,

        inAppEnabled:
          true,

        emailEnabled:
          true,

        pushEnabled:
          true,
      },
    });

  return (
    preference ??
    getDefaultNotificationPreference(
      category,
    )
  );
}