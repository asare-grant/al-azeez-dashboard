// src/lib/notifications/actions.ts
"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  auth,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

import type {
  NotificationCategory,
} from "@prisma/client";

import {
  NOTIFICATION_CATEGORY_SET,
} from "./constants";

import {
  isValidMinuteOfDay,
  parseTimeToMinuteOfDay,
} from "./settings";

/* -------------------------------------------------------------------------- */
/*                            MARK AS READ                                    */
/* -------------------------------------------------------------------------- */

export async function markNotificationAsRead(
  notificationId: number,
) {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return {
      success: false,

      message:
        "You must be signed in.",
    };
  }

  if (
    !Number.isInteger(
      notificationId,
    ) ||
    notificationId <= 0
  ) {
    return {
      success: false,

      message:
        "Invalid notification.",
    };
  }

  const result =
    await prisma.notification.updateMany({
      where: {
        id:
          notificationId,

        recipientId:
          userId,

        readAt:
          null,
      },

      data: {
        readAt:
          new Date(),

        seenAt:
          new Date(),
      },
    });

  revalidatePath(
    "/",
  );

  return {
    success:
      result.count > 0,

    message:
      result.count > 0
        ? "Notification marked as read."
        : "Notification was already read or could not be found.",
  };
}

/* -------------------------------------------------------------------------- */
/*                          MARK ALL AS READ                                  */
/* -------------------------------------------------------------------------- */

export async function markAllNotificationsAsRead() {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return {
      success: false,

      message:
        "You must be signed in.",
    };
  }

  const now =
    new Date();

  const result =
    await prisma.notification.updateMany({
      where: {
        recipientId:
          userId,

        readAt:
          null,

        archivedAt:
          null,
      },

      data: {
        readAt:
          now,

        seenAt:
          now,
      },
    });

  revalidatePath(
    "/",
  );

  return {
    success: true,

    count:
      result.count,

    message:
      result.count > 0
        ? `${result.count} notification${
            result.count === 1
              ? ""
              : "s"
          } marked as read.`
        : "No unread notifications.",
  };
}

/* -------------------------------------------------------------------------- */
/*                        MARK ALL AS SEEN                                    */
/* -------------------------------------------------------------------------- */

export async function markNotificationsAsSeen() {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return {
      success: false,
    };
  }

  await prisma.notification.updateMany({
    where: {
      recipientId:
        userId,

      seenAt:
        null,

      archivedAt:
        null,
    },

    data: {
      seenAt:
        new Date(),
    },
  });

  revalidatePath(
    "/",
  );

  return {
    success: true,
  };
}

/* -------------------------------------------------------------------------- */
/*                          ARCHIVE NOTIFICATION                              */
/* -------------------------------------------------------------------------- */

export async function archiveNotification(
  notificationId: number,
) {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return {
      success: false,

      message:
        "You must be signed in.",
    };
  }

  if (
    !Number.isInteger(
      notificationId,
    ) ||
    notificationId <= 0
  ) {
    return {
      success: false,

      message:
        "Invalid notification.",
    };
  }

  const result =
    await prisma.notification.updateMany({
      where: {
        id:
          notificationId,

        recipientId:
          userId,

        archivedAt:
          null,
      },

      data: {
        archivedAt:
          new Date(),
      },
    });

  revalidatePath(
    "/",
  );

  return {
    success:
      result.count > 0,

    message:
      result.count > 0
        ? "Notification archived."
        : "Notification could not be found.",
  };
}




/* -------------------------------------------------------------------------- */
/*                    MARK READ AND RETURN DESTINATION                        */
/* -------------------------------------------------------------------------- */

export async function openNotification(
  notificationId: number,
) {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return {
      success:
        false,

      message:
        "You must be signed in.",
    };
  }

  if (
    !Number.isInteger(
      notificationId,
    ) ||
    notificationId <=
      0
  ) {
    return {
      success:
        false,

      message:
        "Invalid notification.",
    };
  }

  const notification =
    await prisma.notification.findFirst({
      where: {
        id:
          notificationId,

        recipientId:
          userId,

        archivedAt:
          null,
      },

      select: {
        id:
          true,

        readAt:
          true,
      },
    });

  if (
    !notification
  ) {
    return {
      success:
        false,

      message:
        "Notification could not be found.",
    };
  }

  if (
    !notification.readAt
  ) {
    const now =
      new Date();

    await prisma.notification.update({
      where: {
        id:
          notification.id,
      },

      data: {
        readAt:
          now,

        seenAt:
          now,
      },
    });
  }

  revalidatePath(
    "/notifications",
  );

  return {
    success:
      true,
  };
}



/* -------------------------------------------------------------------------- */
/*                    UPDATE NOTIFICATION PREFERENCE                          */
/* -------------------------------------------------------------------------- */



export async function updateNotificationPreference({
  category,
  inAppEnabled,
}: {
  category:
    NotificationCategory;

  inAppEnabled:
    boolean;
}) {
  const {
    userId,
  } = await auth();

  if (!userId) {
    return {
      success:
        false,

      message:
        "You must be signed in.",
    };
  }

  if (
    !NOTIFICATION_CATEGORY_SET.has(
      category,
    )
  ) {
    return {
      success:
        false,

      message:
        "Invalid notification category.",
    };
  }

  /*
   * SYSTEM notifications remain enabled.
   *
   * This prevents critical system alerts from
   * accidentally becoming invisible.
   */
  if (
    category ===
    "SYSTEM" &&
    !inAppEnabled
  ) {
    return {
      success:
        false,

      message:
        "Critical system notifications cannot be disabled.",
    };
  }

  await prisma.notificationPreference.upsert({
    where: {
      userId_category: {
        userId,

        category,
      },
    },

    update: {
      inAppEnabled,
    },

    create: {
      userId,

      category,

      inAppEnabled,

      emailEnabled:
        false,

      pushEnabled:
        false,
    },
  });

  revalidatePath(
    "/notifications",
  );

  revalidatePath(
    "/notifications/settings",
  );

  return {
    success:
      true,

    message:
      "Notification preference updated.",
  };
}



/* -------------------------------------------------------------------------- */
/*                     UPDATE USER DELIVERY SETTINGS                          */
/* -------------------------------------------------------------------------- */

export async function updateNotificationUserSettings({
  quietHoursEnabled,
  quietHoursStart,
  quietHoursEnd,
  timezone,
}: {
  quietHoursEnabled:
    boolean;

  quietHoursStart:
    string;

  quietHoursEnd:
    string;

  timezone:
    string;
}) {
  const {
    userId,
  } =
    await auth();

  if (
    !userId
  ) {
    return {
      success:
        false,

      message:
        "You must be signed in.",
    };
  }

  /* ---------------------------------------------------------------------- */
  /*                              TIMEZONE                                  */
  /* ---------------------------------------------------------------------- */

  const normalizedTimezone =
    timezone.trim() ||
    "Africa/Accra";

  try {
    /*
     * Validate the IANA timezone by asking
     * Intl to construct a formatter with it.
     */
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone:
          normalizedTimezone,
      },
    );
  } catch {
    return {
      success:
        false,

      message:
        "Select a valid timezone.",
    };
  }

  /* ---------------------------------------------------------------------- */
  /*                          QUIET HOURS                                   */
  /* ---------------------------------------------------------------------- */

  let startMinute:
    number | null =
    null;

  let endMinute:
    number | null =
    null;

  if (
    quietHoursEnabled
  ) {
    startMinute =
      parseTimeToMinuteOfDay(
        quietHoursStart,
      );

    endMinute =
      parseTimeToMinuteOfDay(
        quietHoursEnd,
      );

    if (
      startMinute ===
        null ||
      endMinute ===
        null ||
      !isValidMinuteOfDay(
        startMinute,
      ) ||
      !isValidMinuteOfDay(
        endMinute,
      )
    ) {
      return {
        success:
          false,

        message:
          "Enter valid quiet-hour start and end times.",
      };
    }

    if (
      startMinute ===
      endMinute
    ) {
      return {
        success:
          false,

        message:
          "Quiet-hour start and end times must be different.",
      };
    }
  }

  await prisma.notificationUserSettings.upsert({
    where: {
      userId,
    },

    update: {
      quietHoursEnabled,

      quietHoursStartMinute:
        startMinute,

      quietHoursEndMinute:
        endMinute,

      timezone:
        normalizedTimezone,
    },

    create: {
      userId,

      quietHoursEnabled,

      quietHoursStartMinute:
        startMinute,

      quietHoursEndMinute:
        endMinute,

      timezone:
        normalizedTimezone,
    },
  });

  revalidatePath(
    "/notifications/settings",
  );

  return {
    success:
      true,

    message:
      quietHoursEnabled
        ? "Quiet hours updated successfully."
        : "Quiet hours have been disabled.",
  };
}



/* -------------------------------------------------------------------------- */
/*                  UPDATE GLOBAL NOTIFICATION SETTINGS                       */
/* -------------------------------------------------------------------------- */

export async function updateNotificationSystemSettings({
  emailEnabled,
  pushEnabled,
  whatsAppEnabled,
  smsEnabled,
  quietHoursEnabled,
}: {
  emailEnabled:
    boolean;

  pushEnabled:
    boolean;

  whatsAppEnabled:
    boolean;

  smsEnabled:
    boolean;

  quietHoursEnabled:
    boolean;
}) {
  const accessActor =
  await getCurrentAccessActor();

if (
  !accessActor
) {
  return {
    success:
      false,

    message:
      "You must be signed in.",
  };
}

if (
  !accessActor.can(
    "notification_operations.policy.manage",
  )
) {
  return {
    success:
      false,

    message:
      "You do not have permission to manage global notification policy.",
  };
}

const userId =
  accessActor.actor.id;

  try {
    const settings =
      await prisma.notificationSystemSettings.upsert({
        where: {
          id:
            1,
        },

        update: {
          /*
           * In-app remains intentionally protected.
           */
          inAppEnabled:
            true,

          emailEnabled,

          pushEnabled,

          whatsAppEnabled,

          smsEnabled,

          quietHoursEnabled,

          updatedBy:
            userId,
        },

        create: {
          id:
            1,

          inAppEnabled:
            true,

          emailEnabled,

          pushEnabled,

          whatsAppEnabled,

          smsEnabled,

          quietHoursEnabled,

          updatedBy:
            userId,
        },

        select: {
          id:
            true,

          inAppEnabled:
            true,

          emailEnabled:
            true,

          pushEnabled:
            true,

          whatsAppEnabled:
            true,

          smsEnabled:
            true,

          quietHoursEnabled:
            true,

          updatedBy:
            true,

          updatedAt:
            true,
        },
      });

    revalidatePath(
      "/list/notification-operations",
    );

    revalidatePath(
      "/notifications/settings",
    );

    return {
      success:
        true,

      message:
        "Global notification policy updated successfully.",

      settings,
    };
  } catch (
    error
  ) {
    console.error(
      "UPDATE NOTIFICATION SYSTEM SETTINGS ERROR:",
      error,
    );

    return {
      success:
        false,

      message:
        "Global notification settings could not be updated.",
    };
  }
}