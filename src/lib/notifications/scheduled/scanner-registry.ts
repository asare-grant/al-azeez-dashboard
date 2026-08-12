import "server-only";

import {
  processAssessmentDueSoonNotifications,
} from "./assessment-due-soon";

import {
  processAttendanceAbsenceNotifications,
} from "./attendance-absence";

import {
  processAttendanceCompletenessNotifications,
} from "./attendance-completeness";

import {
  processFeeBalanceReminders,
} from "./fee-balance-reminders";

import {
  processUpcomingEventNotifications,
} from "./process-upcoming-events";

import type {
  ScheduledScannerKey,
} from "./scheduler-types";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type ScheduledNotificationScanner = {
  key:
    ScheduledScannerKey;

  label:
    string;

  run:
    () =>
      Promise<unknown>;
};

/* -------------------------------------------------------------------------- */
/*                             SCANNER REGISTRY                               */
/* -------------------------------------------------------------------------- */

export const scheduledNotificationScanners:
  readonly ScheduledNotificationScanner[] =
  [
    {
      key:
        "assessment-due-soon",

      label:
        "Assessment Due Soon",

      run:
        processAssessmentDueSoonNotifications,
    },

    {
      key:
        "attendance-absence",

      label:
        "Attendance Absence",

      run:
        processAttendanceAbsenceNotifications,
    },

    {
      key:
        "attendance-completeness",

      label:
        "Attendance Completeness",

      run:
        processAttendanceCompletenessNotifications,
    },

    {
      key:
        "fee-balance-reminders",

      label:
        "Outstanding Fee Reminders",

      run:
        processFeeBalanceReminders,
    },

    {
      key:
        "upcoming-events",

      label:
        "Upcoming Academic Events",

      run:
        processUpcomingEventNotifications,
    },
  ] as const;