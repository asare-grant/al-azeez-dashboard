import "server-only";

import { processAssessmentDueSoonNotifications } from "./assessment-due-soon";

import { processAttendanceAbsenceNotifications } from "./attendance-absence";

import { processAttendanceCompletenessNotifications } from "./attendance-completeness";

import { processFeeBalanceReminders } from "./fee-balance-reminders";

export type ScheduledNotificationSummary = {
  startedAt: string;

  completedAt: string;

  assessmentDueSoon: {
    scanned: number;

    eventsCreated: number;

    deliveriesCreated: number;
  };
  attendanceAbsence: {
    scanned: number;

    eventsCreated: number;

    deliveriesCreated: number;
  };
  attendanceCompleteness: {
    skipped: boolean;

    reason: string | null;

    classesScanned: number;

    incompleteClasses: number;

    eventsCreated: number;

    deliveriesCreated: number;
  };
  feeBalanceReminders: {
    scanned: number;

    outstanding: number;

    eventsCreated: number;

    deliveriesCreated: number;
  };
};

export async function runScheduledNotifications(): Promise<ScheduledNotificationSummary> {
  const startedAt = new Date();

  const [
    assessmentDueSoon,
    attendanceAbsence,
    attendanceCompleteness,
    feeBalanceReminders,
  ] = await Promise.all([
    processAssessmentDueSoonNotifications(),

    processAttendanceAbsenceNotifications(),

    processAttendanceCompletenessNotifications(),

    processFeeBalanceReminders(),
  ]);

  const completedAt = new Date();

  return {
    startedAt: startedAt.toISOString(),

    completedAt: completedAt.toISOString(),

    assessmentDueSoon,

    attendanceAbsence,

    attendanceCompleteness,

    feeBalanceReminders,
  };
}
