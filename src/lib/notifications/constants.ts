import type {
  NotificationCategory,
} from "@prisma/client";

export const NOTIFICATION_CATEGORIES =
  [
    "ASSESSMENT",

    "REPORT_CARD",

    "ATTENDANCE",

    "ACADEMIC",

    "FINANCE",

    "ANNOUNCEMENT",

    "SYSTEM",

    "GENERAL",
  ] as const satisfies
    readonly NotificationCategory[];

export const NOTIFICATION_CATEGORY_SET =
  new Set<NotificationCategory>(
    NOTIFICATION_CATEGORIES,
  );