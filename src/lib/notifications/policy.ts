import "server-only";

import type {
  NotificationType,
} from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                    MANDATORY NOTIFICATION TYPES                            */
/* -------------------------------------------------------------------------- */

const mandatoryNotificationTypes =
  new Set<NotificationType>([
    /*
     * Academic integrity / workflow notifications
     * must always reach their intended recipient.
     */
    "REPORT_CARD_STALE",

    "REPORT_CARD_CHANGES_REQUESTED",

    "REPORT_CARD_SUBMITTED",

    "ATTENDANCE_INCOMPLETE",

    /*
     * System-critical notifications.
     */
    "SYSTEM_ALERT",
  ]);

/* -------------------------------------------------------------------------- */
/*                         POLICY HELPERS                                     */
/* -------------------------------------------------------------------------- */

export function isMandatoryNotification(
  type: NotificationType,
) {
  return mandatoryNotificationTypes.has(
    type,
  );
}