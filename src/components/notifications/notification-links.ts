import type { NotificationEntityType, NotificationType } from "@prisma/client";

type NotificationMetadata = Record<string, unknown> | null;

type ResolveNotificationUrlInput = {
  type: NotificationType;

  entityType: NotificationEntityType | null;

  entityId: string | null;

  eventActionUrl: string | null;

  recipientRole: string;

  metadata: unknown;
};

function asObject(value: unknown): NotificationMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function numberFromMetadata(
  metadata: NotificationMetadata,

  key: string,
) {
  const value = metadata?.[key];

  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }

  return null;
}

function stringFromMetadata(
  metadata: NotificationMetadata,

  key: string,
) {
  const value = metadata?.[key];

  return typeof value === "string" ? value : null;
}

export function resolveNotificationUrl({
  type,
  entityType,
  entityId,
  eventActionUrl,
  recipientRole,
  metadata,
}: ResolveNotificationUrlInput) {
  const meta = asObject(metadata);

  const reportCardId =
    numberFromMetadata(
      meta,
      "reportCardId",
    ) ??
    (entityType ===
    "REPORT_CARD"
      ? Number(entityId) ||
        null
      : null);

  const assessmentId =
    numberFromMetadata(
      meta,
      "assessmentId",
    ) ??
    (entityType ===
    "ASSESSMENT"
      ? Number(entityId) ||
        null
      : null);

  const classId =
    numberFromMetadata(
      meta,
      "classId",
    );

  const studentId =
    stringFromMetadata(
      meta,
      "studentId",
    );

  const attemptId =
    numberFromMetadata(
      meta,
      "attemptId",
    );

  const feeMasterId =
    numberFromMetadata(
      meta,
      "feeMasterId",
    );

  const paymentId =
    numberFromMetadata(
      meta,
      "paymentId",
    );

  /* ---------------------------------------------------------------------- */
  /*                           REPORT CARDS                                 */
  /* ---------------------------------------------------------------------- */

  if (
    entityType ===
      "REPORT_CARD" &&
    reportCardId
  ) {
    if (
      recipientRole ===
      "admin"
    ) {
      if (
        type ===
          "REPORT_CARD_SUBMITTED" ||
        type ===
          "REPORT_CARD_STALE"
      ) {
        return `/list/report-cards/${reportCardId}/review`;
      }

      return `/list/report-cards/${reportCardId}`;
    }

    if (
      recipientRole ===
        "teacher" &&
      classId
    ) {
      return `/teacher/classes/${classId}/report-cards/${reportCardId}`;
    }

    if (
      recipientRole ===
        "parent" &&
      studentId
    ) {
      return `/parent/children/${studentId}/report-cards/${reportCardId}`;
    }

    if (
      recipientRole ===
      "student"
    ) {
      return `/student/report-cards/${reportCardId}`;
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                              FINANCE                                   */
  /* ---------------------------------------------------------------------- */

  const isFinanceNotification =
    type ===
      "FEE_ASSIGNED" ||
    type ===
      "FEE_PAYMENT_RECEIVED" ||
    type ===
      "FEE_PAYMENT_CONFIRMED" ||
    type ===
      "FEE_BALANCE_DUE";

  if (
    isFinanceNotification
  ) {
    /*
     * Parents should be sent to the exact
     * invoice whenever we know both the
     * student and fee-master IDs.
     */
    if (
      recipientRole ===
        "parent" &&
      studentId &&
      feeMasterId
    ) {
      return `/parent/children/${studentId}/fees/${feeMasterId}`;
    }

    /*
     * Fallback for older finance notifications
     * that have a student ID but no invoice ID.
     */
    if (
      recipientRole ===
        "parent" &&
      studentId
    ) {
      return `/parent/children/${studentId}/fees`;
    }

    /*
     * Finance notifications intended for
     * administrators return to the finance
     * workspace.
     */
    if (
      recipientRole ===
      "admin"
    ) {
      return "/list/FinanceDashboardPage";
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                           ASSESSMENTS                                  */
  /* ---------------------------------------------------------------------- */

  if (
    entityType ===
      "ASSESSMENT" &&
    assessmentId
  ) {
    if (
      recipientRole ===
      "student"
    ) {
      if (
        attemptId &&
        (type ===
          "ASSESSMENT_RESULT_READY" ||
          type ===
            "ASSESSMENT_FEEDBACK_ADDED")
      ) {
        return `/student/assessments/${assessmentId}/result?attemptId=${attemptId}`;
      }

      return `/student/assessments/${assessmentId}`;
    }

    /*
     * Admin/teacher assessment events can still
     * use the trusted domain action URL when one
     * has been supplied.
     */
    if (
      eventActionUrl
    ) {
      return eventActionUrl;
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                              FALLBACK                                  */
  /* ---------------------------------------------------------------------- */

  if (
    eventActionUrl
  ) {
    return eventActionUrl;
  }

  return null;
}
