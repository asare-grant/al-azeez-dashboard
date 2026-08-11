import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  createNotificationEvent,
} from "./service";

import {
  getReportApprovedRecipients,
  getReportChangesRequestedRecipients,
  getReportPublishedRecipients,
  getReportStaleRecipients,
  getReportSubmittedRecipients,
} from "./report-card-recipients";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type NotificationTx = {
  tx?:
    Prisma.TransactionClient;
};

type ReportCardNotificationBase = {
  reportCardId:
    number;

  studentId:
    string;

  studentName:
    string;

  classId:
    number;

  className:
    string;

  academicYear:
    string;

  termName:
    string;

  actorId?:
    string | null;

  actorRole?:
    string | null;

  actorName?:
    string | null;
};

/* -------------------------------------------------------------------------- */
/*                              SHARED HELPERS                                */
/* -------------------------------------------------------------------------- */

function formatTermName(
  value: string,
) {
  return value.replace(
    /_/g,
    " ",
  );
}

function buildReportCardMetadata(
  input:
    ReportCardNotificationBase,
) {
  return {
    reportCardId:
      input.reportCardId,

    studentId:
      input.studentId,

    classId:
      input.classId,

    academicYear:
      input.academicYear,

    termName:
      input.termName,
  };
}

/* -------------------------------------------------------------------------- */
/*                         REPORT SUBMITTED                                   */
/* -------------------------------------------------------------------------- */

export async function notifyReportCardSubmitted({
  tx,
  ...input
}: ReportCardNotificationBase &
  NotificationTx) {
  const recipients =
    await getReportSubmittedRecipients({
      actorId:
        input.actorId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "REPORT_CARD_SUBMITTED",

      category:
        "REPORT_CARD",

      priority:
        "HIGH",

      title:
        "Report Card Awaiting Review",

      message:
        `${input.studentName}'s ${formatTermName(
          input.termName,
        )} report card has been submitted for administrative review.`,

      actionUrl:
        `/list/report-cards/${input.reportCardId}/review`,

      entityType:
        "REPORT_CARD",

      entityId:
        input.reportCardId,

      /*
       * Version-independent on purpose.
       * A new submission after reopening should
       * create a new event, so callers should pass
       * a unique lifecycle timestamp/version in
       * the dedupe key later if needed.
       */
      dedupeKey:
        null,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata:
        buildReportCardMetadata(
          input,
        ),

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                     CHANGES REQUESTED                                     */
/* -------------------------------------------------------------------------- */

export async function notifyReportCardChangesRequested({
  reviewNote,
  tx,
  ...input
}: ReportCardNotificationBase &
  NotificationTx & {
    reviewNote:
      string;
  }) {
  const recipients =
    await getReportChangesRequestedRecipients({
      classId:
        input.classId,

      actorId:
        input.actorId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "REPORT_CARD_CHANGES_REQUESTED",

      category:
        "REPORT_CARD",

      priority:
        "HIGH",

      title:
        "Report Card Changes Requested",

      message:
        `Changes were requested for ${input.studentName}'s ${formatTermName(
          input.termName,
        )} report card.`,

      actionUrl:
        `/teacher/classes/${input.classId}/report-cards/${input.reportCardId}/review`,

      entityType:
        "REPORT_CARD",

      entityId:
        input.reportCardId,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata: {
        ...buildReportCardMetadata(
          input,
        ),

        reviewNote,
      },

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                           REPORT APPROVED                                  */
/* -------------------------------------------------------------------------- */

export async function notifyReportCardApproved({
  tx,
  ...input
}: ReportCardNotificationBase &
  NotificationTx) {
  const recipients =
    await getReportApprovedRecipients({
      classId:
        input.classId,

      actorId:
        input.actorId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "REPORT_CARD_APPROVED",

      category:
        "REPORT_CARD",

      priority:
        "NORMAL",

      title:
        "Report Card Approved",

      message:
        `${input.studentName}'s ${formatTermName(
          input.termName,
        )} report card has been approved.`,

      actionUrl:
        `/teacher/classes/${input.classId}/report-cards/${input.reportCardId}`,

      entityType:
        "REPORT_CARD",

      entityId:
        input.reportCardId,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata:
        buildReportCardMetadata(
          input,
        ),

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                          REPORT PUBLISHED                                  */
/* -------------------------------------------------------------------------- */

export async function notifyReportCardPublished({
  tx,
  ...input
}: ReportCardNotificationBase &
  NotificationTx) {
  const recipients =
    await getReportPublishedRecipients({
      studentId:
        input.studentId,

      actorId:
        input.actorId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "REPORT_CARD_PUBLISHED",

      category:
        "REPORT_CARD",

      priority:
        "HIGH",

      title:
        "Report Card Published",

      message:
        `${input.studentName}'s ${formatTermName(
          input.termName,
        )} ${input.academicYear} report card is now available.`,

      /*
       * We intentionally point parents/students
       * to their own portal rather than the
       * administrator route.
       *
       * We will refine per-role URLs later if
       * your parent/student routes differ.
       */
      actionUrl:
        null,

      entityType:
        "REPORT_CARD",

      entityId:
        input.reportCardId,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata:
        buildReportCardMetadata(
          input,
        ),

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                            REPORT STALE                                    */
/* -------------------------------------------------------------------------- */

export async function notifyReportCardStale({
  reason,
  tx,
  ...input
}: ReportCardNotificationBase &
  NotificationTx & {
    reason:
      string;
  }) {
  const recipients =
    await getReportStaleRecipients({
      classId:
        input.classId,

      actorId:
        input.actorId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "REPORT_CARD_STALE",

      category:
        "REPORT_CARD",

      priority:
        "HIGH",

      title:
        "Report Card Needs Regeneration",

      message:
        `${input.studentName}'s report card is outdated because an academic source changed.`,

      actionUrl:
        `/list/report-cards/${input.reportCardId}`,

      entityType:
        "REPORT_CARD",

      entityId:
        input.reportCardId,

      /*
       * One stale cycle should create one event.
       * Later, when we wire this into the actual
       * invalidation service, we can include
       * staleAt/version in this key.
       */
      dedupeKey:
        null,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata: {
        ...buildReportCardMetadata(
          input,
        ),

        reason,
      },

      recipients,
    },
  });
}




/* -------------------------------------------------------------------------- */
/*                         REPORT REOPENED                                    */
/* -------------------------------------------------------------------------- */

export async function notifyReportCardReopened({
  reviewNote,
  tx,
  ...input
}: ReportCardNotificationBase &
  NotificationTx & {
    reviewNote:
      string;
  }) {
  const recipients =
    await getReportApprovedRecipients({
      classId:
        input.classId,

      actorId:
        input.actorId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "REPORT_CARD_REOPENED",

      category:
        "REPORT_CARD",

      priority:
        "HIGH",

      title:
        "Report Card Reopened",

      message:
        `${input.studentName}'s report card has been reopened for further editing.`,

      actionUrl:
        `/teacher/classes/${input.classId}/report-cards/${input.reportCardId}/review`,

      entityType:
        "REPORT_CARD",

      entityId:
        input.reportCardId,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata: {
        ...buildReportCardMetadata(
          input,
        ),

        reviewNote,
      },

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                       REPORT REGENERATED                                   */
/* -------------------------------------------------------------------------- */

export async function notifyReportCardRegenerated({
  tx,
  ...input
}: ReportCardNotificationBase &
  NotificationTx) {
  const recipients =
    await getReportStaleRecipients({
      classId:
        input.classId,

      actorId:
        input.actorId,

      tx,
    });

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type:
        "REPORT_CARD_REGENERATED",

      category:
        "REPORT_CARD",

      priority:
        "NORMAL",

      title:
        "Report Card Regenerated",

      message:
        `${input.studentName}'s report card has been regenerated with the latest academic data.`,

      actionUrl:
        `/list/report-cards/${input.reportCardId}`,

      entityType:
        "REPORT_CARD",

      entityId:
        input.reportCardId,

      actorId:
        input.actorId,

      actorRole:
        input.actorRole,

      actorName:
        input.actorName,

      metadata:
        buildReportCardMetadata(
          input,
        ),

      recipients,
    },
  });
}