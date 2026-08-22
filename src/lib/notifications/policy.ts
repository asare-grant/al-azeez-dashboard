// src/lib/notifications/policy.ts
import "server-only";

import type { NotificationType } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                    MANDATORY NOTIFICATION TYPES                            */
/* -------------------------------------------------------------------------- */

const mandatoryNotificationTypes = new Set<NotificationType>([
  /* -------------------------------------------------------------- */
  /*                    REPORT-CARD WORKFLOW                        */
  /* -------------------------------------------------------------- */

  "REPORT_CARD_STALE",

  "REPORT_CARD_CHANGES_REQUESTED",

  "REPORT_CARD_SUBMITTED",

  "REPORT_CARD_APPROVED",

  "REPORT_CARD_PUBLISHED",

  /* -------------------------------------------------------------- */
  /*                        ATTENDANCE                              */
  /* -------------------------------------------------------------- */

  "ATTENDANCE_INCOMPLETE",

  /* -------------------------------------------------------------- */
  /*                          FINANCE                               */
  /* -------------------------------------------------------------- */

  "FEE_PAYMENT_RECEIVED",

  "FEE_PAYMENT_CONFIRMED",

  /* -------------------------------------------------------------- */
  /*                           EVENTS                               */
  /* -------------------------------------------------------------- */

  "EVENT_CANCELLED",

  /* -------------------------------------------------------------- */
  /*                           DELEGATED ACCESS                               */
  /* -------------------------------------------------------------- */

  "DELEGATED_ACCESS_EXPIRING_URGENT",

  /* -------------------------------------------------------------- */
  /*                    ACCESS REVIEW GOVERNANCE                    */
  /* -------------------------------------------------------------- */

  "ACCESS_REVIEW_DUE_URGENT",

  "ACCESS_REVIEW_OVERDUE",

  /* -------------------------------------------------------------- */
  /*                           SYSTEM                               */
  /* -------------------------------------------------------------- */

  "SYSTEM_ALERT",
]);

/* -------------------------------------------------------------------------- */
/*                         POLICY HELPERS                                     */
/* -------------------------------------------------------------------------- */

export function isMandatoryNotification(type: NotificationType) {
  return mandatoryNotificationTypes.has(type);
}
