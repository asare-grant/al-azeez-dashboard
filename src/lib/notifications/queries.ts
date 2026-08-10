// src/lib/notifications/queries.ts
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getUserNotifications({
  limit = 20,
}: {
  limit?: number;
} = {}) {
  const { userId } =
    await auth();

  if (!userId) {
    throw new Error(
      "UNAUTHENTICATED"
    );
  }

  return prisma.notification.findMany({
    where: {
      recipientId: userId,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,

    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      actionUrl: true,
      readAt: true,
      createdAt: true,
    },
  });
}


export async function getUnreadNotificationCount() {
  const { userId } =
    await auth();

  if (!userId) {
    return 0;
  }

  return prisma.notification.count({
    where: {
      recipientId: userId,
      readAt: null,
    },
  });
}