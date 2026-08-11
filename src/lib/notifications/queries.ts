import "server-only";

import {
  auth,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import type {
  NotificationCategory,
} from "@prisma/client";


/* -------------------------------------------------------------------------- */
/*                          USER NOTIFICATIONS                                */
/* -------------------------------------------------------------------------- */

export async function getUserNotifications({
  limit = 20,
  includeArchived = false,
}: {
  limit?: number;

  includeArchived?: boolean;
} = {}) {
  const {
    userId,
  } = await auth();

  if (!userId) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const safeLimit =
    Math.min(
      Math.max(
        limit,
        1,
      ),
      100,
    );

  return prisma.notification.findMany({
    where: {
      recipientId:
        userId,

      ...(includeArchived
        ? {}
        : {
            archivedAt:
              null,
          }),
    },

    orderBy: {
      createdAt:
        "desc",
    },

    take:
      safeLimit,

    select: {
      id:
        true,

      recipientRole:
        true,

      readAt:
        true,

      seenAt:
        true,

      archivedAt:
        true,

      createdAt:
        true,

      event: {
        select: {
          id:
            true,

          type:
            true,

          category:
            true,

          priority:
            true,

          title:
            true,

          message:
            true,

          actionUrl:
            true,

          entityType:
            true,

          entityId:
            true,

          actorId:
            true,

          actorRole:
            true,

          actorName:
            true,

          metadata:
            true,

          createdAt:
            true,
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                         UNREAD NOTIFICATION COUNT                           */
/* -------------------------------------------------------------------------- */

export async function getUnreadNotificationCount() {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return 0;
  }

  return prisma.notification.count({
    where: {
      recipientId:
        userId,

      readAt:
        null,

      archivedAt:
        null,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                         UNSEEN NOTIFICATION COUNT                           */
/* -------------------------------------------------------------------------- */

export async function getUnseenNotificationCount() {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return 0;
  }

  return prisma.notification.count({
    where: {
      recipientId:
        userId,

      seenAt:
        null,

      archivedAt:
        null,
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                    FULL NOTIFICATION CENTRE                               */
/* -------------------------------------------------------------------------- */

export async function getNotificationCentre({
  page = 1,
  pageSize = 20,
}: {
  page?: number;

  pageSize?: number;
} = {}) {
  const {
    userId,
  } = await auth();

  if (!userId) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const safePage =
    Math.max(
      1,
      Math.floor(
        page,
      ),
    );

  const safePageSize =
    Math.min(
      50,
      Math.max(
        5,
        Math.floor(
          pageSize,
        ),
      ),
    );

  const skip =
    (safePage - 1) *
    safePageSize;

  const where = {
    recipientId:
      userId,

    archivedAt:
      null,
  };

  const [
    items,
    total,
    unread,
  ] =
    await Promise.all([
      prisma.notification.findMany({
        where,

        orderBy: {
          createdAt:
            "desc",
        },

        skip,

        take:
          safePageSize,

        select: {
          id:
            true,

          recipientRole:
            true,

          readAt:
            true,

          seenAt:
            true,

          archivedAt:
            true,

          createdAt:
            true,

          event: {
            select: {
              id:
                true,

              type:
                true,

              category:
                true,

              priority:
                true,

              title:
                true,

              message:
                true,

              actionUrl:
                true,

              entityType:
                true,

              entityId:
                true,

              actorId:
                true,

              actorRole:
                true,

              actorName:
                true,

              metadata:
                true,

              createdAt:
                true,
            },
          },
        },
      }),

      prisma.notification.count({
        where,
      }),

      prisma.notification.count({
        where: {
          ...where,

          readAt:
            null,
        },
      }),
    ]);

  return {
    items,

    total,

    unread,

    page:
      safePage,

    pageSize:
      safePageSize,

    totalPages:
      Math.max(
        1,
        Math.ceil(
          total /
            safePageSize,
        ),
      ),
  };
}



/* -------------------------------------------------------------------------- */
/*                       NOTIFICATION PREFERENCES                             */
/* -------------------------------------------------------------------------- */

const notificationCategories:
  NotificationCategory[] = [
    "ASSESSMENT",

    "REPORT_CARD",

    "ATTENDANCE",

    "ACADEMIC",

    "FINANCE",

    "ANNOUNCEMENT",

    "SYSTEM",

    "GENERAL",
  ];

export async function getUserNotificationPreferences() {
  const {
    userId,
  } = await auth();

  if (!userId) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const saved =
    await prisma.notificationPreference.findMany({
      where: {
        userId,
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

  const preferenceMap =
    new Map(
      saved.map(
        (
          preference,
        ) => [
          preference.category,
          preference,
        ],
      ),
    );

  return notificationCategories.map(
    (
      category,
    ) => {
      const preference =
        preferenceMap.get(
          category,
        );

      return (
        preference ?? {
          category,

          inAppEnabled:
            true,

          emailEnabled:
            false,

          pushEnabled:
            false,
        }
      );
    },
  );
}