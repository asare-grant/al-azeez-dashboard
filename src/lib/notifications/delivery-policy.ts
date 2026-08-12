import "server-only";

import type {
  NotificationCategory,
  NotificationType,
  Prisma,
} from "@prisma/client";

import {
  getNotificationSystemSettings,
  getNotificationUserSettings,
} from "./settings";

import {
  getUserNotificationPreference,
} from "./preferences";

import {
  isMandatoryNotification,
} from "./policy";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type NotificationDeliveryChannel =
  | "IN_APP"
  | "EMAIL"
  | "PUSH"
  | "WHATSAPP"
  | "SMS";

export type NotificationDeliveryDecisionReason =
  | "MANDATORY_NOTIFICATION"
  | "ENABLED"
  | "USER_DISABLED"
  | "CHANNEL_DISABLED_GLOBALLY"
  | "QUIET_HOURS"
  | "INVALID_QUIET_HOURS_CONFIGURATION";

export type NotificationChannelDecision = {
  channel:
    NotificationDeliveryChannel;

  allowed:
    boolean;

  deferred:
    boolean;

  reason:
    NotificationDeliveryDecisionReason;
};

export type NotificationDeliveryPolicyResult = {
  userId:
    string;

  category:
    NotificationCategory;

  type:
    NotificationType;

  mandatory:
    boolean;

  quietHoursActive:
    boolean;

  inApp:
    NotificationChannelDecision;

  email:
    NotificationChannelDecision;

  push:
    NotificationChannelDecision;

  whatsApp:
    NotificationChannelDecision;

  sms:
    NotificationChannelDecision;
};

type ResolveNotificationDeliveryPolicyInput = {
  userId:
    string;

  category:
    NotificationCategory;

  type:
    NotificationType;

  now?:
    Date;

  tx?:
    Prisma.TransactionClient;
};



/* -------------------------------------------------------------------------- */
/*                            TIMEZONE HELPERS                                */
/* -------------------------------------------------------------------------- */

function getMinuteOfDayInTimezone({
  date,
  timezone,
}: {
  date:
    Date;

  timezone:
    string;
}) {
  try {
    const formatter =
      new Intl.DateTimeFormat(
        "en-GB",
        {
          timeZone:
            timezone,

          hour:
            "2-digit",

          minute:
            "2-digit",

          hour12:
            false,
        },
      );

    const parts =
      formatter.formatToParts(
        date,
      );

    const hour =
      Number(
        parts.find(
          (
            part,
          ) =>
            part.type ===
            "hour",
        )?.value,
      );

    const minute =
      Number(
        parts.find(
          (
            part,
          ) =>
            part.type ===
            "minute",
        )?.value,
      );

    if (
      !Number.isInteger(
        hour,
      ) ||
      !Number.isInteger(
        minute,
      )
    ) {
      return null;
    }

    return (
      hour *
        60 +
      minute
    );
  } catch {
    return null;
  }
}

function isMinuteInsideQuietHours({
  currentMinute,
  startMinute,
  endMinute,
}: {
  currentMinute:
    number;

  startMinute:
    number;

  endMinute:
    number;
}) {
  /*
   * Same start/end means no quiet-hours window.
   */
  if (
    startMinute ===
    endMinute
  ) {
    return false;
  }

  /*
   * Same-day window:
   *
   * 13:00 → 17:00
   */
  if (
    startMinute <
    endMinute
  ) {
    return (
      currentMinute >=
        startMinute &&
      currentMinute <
        endMinute
    );
  }

  /*
   * Overnight window:
   *
   * 21:00 → 06:00
   */
  return (
    currentMinute >=
      startMinute ||
    currentMinute <
      endMinute
  );
}



function resolveQuietHours({
  now,
  enabled,
  startMinute,
  endMinute,
  timezone,
}: {
  now:
    Date;

  enabled:
    boolean;

  startMinute:
    number | null;

  endMinute:
    number | null;

  timezone:
    string;
}) {
  if (
    !enabled
  ) {
    return {
      active:
        false,

      valid:
        true,
    };
  }

  if (
    startMinute ===
      null ||
    endMinute ===
      null
  ) {
    return {
      active:
        false,

      valid:
        false,
    };
  }

  if (
    startMinute <
      0 ||
    startMinute >
      1439 ||
    endMinute <
      0 ||
    endMinute >
      1439
  ) {
    return {
      active:
        false,

      valid:
        false,
    };
  }

  const currentMinute =
    getMinuteOfDayInTimezone({
      date:
        now,

      timezone,
    });

  if (
    currentMinute ===
    null
  ) {
    return {
      active:
        false,

      valid:
        false,
    };
  }

  return {
    active:
      isMinuteInsideQuietHours({
        currentMinute,

        startMinute,

        endMinute,
      }),

    valid:
      true,
  };
}





function buildChannelDecision({
  channel,
  globallyEnabled,
  userEnabled,
  mandatory,
  quietHoursActive,
  quietHoursApply,
}: {
  channel:
    NotificationDeliveryChannel;

  globallyEnabled:
    boolean;

  userEnabled:
    boolean;

  mandatory:
    boolean;

  quietHoursActive:
    boolean;

  quietHoursApply:
    boolean;
}): NotificationChannelDecision {
  /*
   * Mandatory notifications bypass user preference
   * and quiet hours, but they still require the
   * transport itself to exist globally.
   *
   * For IN_APP we expect system-wide availability
   * to remain enabled.
   */
  if (
    mandatory
  ) {
    if (
      !globallyEnabled
    ) {
      return {
        channel,

        allowed:
          false,

        deferred:
          false,

        reason:
          "CHANNEL_DISABLED_GLOBALLY",
      };
    }

    return {
      channel,

      allowed:
        true,

      deferred:
        false,

      reason:
        "MANDATORY_NOTIFICATION",
    };
  }

  if (
    !globallyEnabled
  ) {
    return {
      channel,

      allowed:
        false,

      deferred:
        false,

      reason:
        "CHANNEL_DISABLED_GLOBALLY",
    };
  }

  if (
    !userEnabled
  ) {
    return {
      channel,

      allowed:
        false,

      deferred:
        false,

      reason:
        "USER_DISABLED",
    };
  }

  if (
    quietHoursApply &&
    quietHoursActive
  ) {
    return {
      channel,

      allowed:
        false,

      deferred:
        true,

      reason:
        "QUIET_HOURS",
    };
  }

  return {
    channel,

    allowed:
      true,

    deferred:
      false,

    reason:
      "ENABLED",
  };
}





/* -------------------------------------------------------------------------- */
/*                       RESOLVE DELIVERY POLICY                              */
/* -------------------------------------------------------------------------- */

export async function resolveNotificationDeliveryPolicy({
  userId,
  category,
  type,
  now =
    new Date(),
  tx,
}: ResolveNotificationDeliveryPolicyInput): Promise<NotificationDeliveryPolicyResult> {
  const normalizedUserId =
    userId.trim();

  if (
    !normalizedUserId
  ) {
    throw new Error(
      "A user is required before notification delivery policy can be resolved.",
    );
  }

  const [
    systemSettings,
    userSettings,
    preference,
  ] =
    await Promise.all([
      getNotificationSystemSettings({
        tx,
      }),

      getNotificationUserSettings({
        userId:
          normalizedUserId,

        tx,
      }),

      getUserNotificationPreference({
        userId:
          normalizedUserId,

        category,

        tx,
      }),
    ]);

  const mandatory =
    isMandatoryNotification(
      type,
    );

  const quietHours =
    resolveQuietHours({
      now,

      enabled:
        systemSettings.quietHoursEnabled &&
        userSettings.quietHoursEnabled,

      startMinute:
        userSettings.quietHoursStartMinute,

      endMinute:
        userSettings.quietHoursEndMinute,

      timezone:
        userSettings.timezone,
    });

  /*
   * In-app delivery is immediate in this phase.
   *
   * We intentionally DO NOT defer in-app
   * notifications during quiet hours.
   *
   * Quiet hours primarily control interruptive
   * outbound channels such as:
   *
   * - email
   * - push
   * - WhatsApp
   * - SMS
   *
   * The notification centre remains a reliable
   * record of school activity.
   */
  const inApp =
    buildChannelDecision({
      channel:
        "IN_APP",

      globallyEnabled:
        systemSettings.inAppEnabled,

      userEnabled:
        preference.inAppEnabled,

      mandatory,

      quietHoursActive:
        quietHours.active,

      quietHoursApply:
        false,
    });

  const email =
    buildChannelDecision({
      channel:
        "EMAIL",

      globallyEnabled:
        systemSettings.emailEnabled,

      userEnabled:
        preference.emailEnabled,

      mandatory,

      quietHoursActive:
        quietHours.active,

      quietHoursApply:
        true,
    });

  const push =
    buildChannelDecision({
      channel:
        "PUSH",

      globallyEnabled:
        systemSettings.pushEnabled,

      userEnabled:
        preference.pushEnabled,

      mandatory,

      quietHoursActive:
        quietHours.active,

      quietHoursApply:
        true,
    });

  const whatsApp =
    buildChannelDecision({
      channel:
        "WHATSAPP",

      globallyEnabled:
        systemSettings.whatsAppEnabled,

      userEnabled:
        preference.whatsAppEnabled,

      mandatory,

      quietHoursActive:
        quietHours.active,

      quietHoursApply:
        true,
    });

  const sms =
    buildChannelDecision({
      channel:
        "SMS",

      globallyEnabled:
        systemSettings.smsEnabled,

      userEnabled:
        preference.smsEnabled,

      mandatory,

      quietHoursActive:
        quietHours.active,

      quietHoursApply:
        true,
    });

  return {
    userId:
      normalizedUserId,

    category,

    type,

    mandatory,

    quietHoursActive:
      quietHours.active,

    inApp,

    email,

    push,

    whatsApp,

    sms,
  };
}