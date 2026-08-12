import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

type NotificationDb =
  | typeof prisma
  | Prisma.TransactionClient;

export type NotificationUserSettingsState = {
  userId:
    string;

  quietHoursEnabled:
    boolean;

  quietHoursStartMinute:
    number | null;

  quietHoursEndMinute:
    number | null;

  timezone:
    string;
};

export type NotificationSystemSettingsState = {
  inAppEnabled:
    boolean;

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

  updatedBy:
    string | null;
};

/* -------------------------------------------------------------------------- */
/*                            DEFAULT USER SETTINGS                           */
/* -------------------------------------------------------------------------- */

export function getDefaultNotificationUserSettings({
  userId,
}: {
  userId:
    string;
}): NotificationUserSettingsState {
  return {
    userId,

    quietHoursEnabled:
      false,

    quietHoursStartMinute:
      null,

    quietHoursEndMinute:
      null,

    timezone:
      "Africa/Accra",
  };
}

/* -------------------------------------------------------------------------- */
/*                           DEFAULT SYSTEM SETTINGS                          */
/* -------------------------------------------------------------------------- */

export function getDefaultNotificationSystemSettings(): NotificationSystemSettingsState {
  return {
    inAppEnabled:
      true,

    emailEnabled:
      false,

    pushEnabled:
      false,

    whatsAppEnabled:
      false,

    smsEnabled:
      false,

    quietHoursEnabled:
      true,

    updatedBy:
      null,
  };
}

/* -------------------------------------------------------------------------- */
/*                           GET USER SETTINGS                                */
/* -------------------------------------------------------------------------- */

export async function getNotificationUserSettings({
  userId,
  tx,
}: {
  userId:
    string;

  tx?:
    Prisma.TransactionClient;
}): Promise<NotificationUserSettingsState> {
  const normalizedUserId =
    userId.trim();

  if (
    !normalizedUserId
  ) {
    throw new Error(
      "A user is required before notification settings can be loaded.",
    );
  }

  const db:
    NotificationDb =
    tx ??
    prisma;

  const settings =
    await db.notificationUserSettings.findUnique({
      where: {
        userId:
          normalizedUserId,
      },

      select: {
        userId:
          true,

        quietHoursEnabled:
          true,

        quietHoursStartMinute:
          true,

        quietHoursEndMinute:
          true,

        timezone:
          true,
      },
    });

  return (
    settings ??
    getDefaultNotificationUserSettings({
      userId:
        normalizedUserId,
    })
  );
}

/* -------------------------------------------------------------------------- */
/*                         GET SYSTEM SETTINGS                                */
/* -------------------------------------------------------------------------- */

export async function getNotificationSystemSettings({
  tx,
}: {
  tx?:
    Prisma.TransactionClient;
} = {}): Promise<NotificationSystemSettingsState> {
  const db:
    NotificationDb =
    tx ??
    prisma;

  const settings =
    await db.notificationSystemSettings.findUnique({
      where: {
        id:
          1,
      },

      select: {
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
      },
    });

  return (
    settings ??
    getDefaultNotificationSystemSettings()
  );
}




/* -------------------------------------------------------------------------- */
/*                           QUIET-HOUR VALIDATION                            */
/* -------------------------------------------------------------------------- */

export function isValidMinuteOfDay(
  value:
    number,
) {
  return (
    Number.isInteger(
      value,
    ) &&
    value >=
      0 &&
    value <=
      1439
  );
}

export function formatMinuteOfDay(
  value:
    number | null,
) {
  if (
    value ===
    null ||
    !isValidMinuteOfDay(
      value,
    )
  ) {
    return null;
  }

  const hours =
    Math.floor(
      value /
        60,
    );

  const minutes =
    value %
    60;

  return `${String(
    hours,
  ).padStart(
    2,
    "0",
  )}:${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}`;
}

export function parseTimeToMinuteOfDay(
  value:
    string,
) {
  const match =
    /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
      value.trim(),
    );

  if (
    !match
  ) {
    return null;
  }

  const hours =
    Number(
      match[1],
    );

  const minutes =
    Number(
      match[2],
    );

  return (
    hours *
      60 +
    minutes
  );
}