import "server-only";

import type { Prisma } from "@prisma/client";

import { createNotificationEvent } from "./service";

import {
  getAssessmentResultRecipient,
  getAssessmentStudentRecipients,
} from "./assessment-recipients";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type NotificationTx = {
  tx?: Prisma.TransactionClient;
};

type AssessmentNotificationBase = {
  assessmentId: number;

  assessmentTitle: string;

  classId: number;

  className: string;

  subjectName: string;

  actorId?: string | null;

  actorRole?: string | null;

  actorName?: string | null;
};

function buildAssessmentMetadata(input: AssessmentNotificationBase) {
  return {
    assessmentId: input.assessmentId,

    classId: input.classId,

    className: input.className,

    subjectName: input.subjectName,
  };
}

/* -------------------------------------------------------------------------- */
/*                       ASSESSMENT SCHEDULED                                 */
/* -------------------------------------------------------------------------- */

export async function notifyAssessmentScheduled({
  scheduledFor,
  tx,
  ...input
}: AssessmentNotificationBase &
  NotificationTx & {
    scheduledFor: Date | string;
  }) {
  const recipients = await getAssessmentStudentRecipients({
    classId: input.classId,

    actorId: input.actorId,

    tx,
  });

  if (recipients.length === 0) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type: "ASSESSMENT_SCHEDULED",

      category: "ASSESSMENT",

      priority: "NORMAL",

      title: "Assessment Scheduled",

      message: `${input.assessmentTitle} for ${input.subjectName} has been scheduled.`,

      actionUrl: `/student/assessments/${input.assessmentId}`,

      entityType: "ASSESSMENT",

      entityId: input.assessmentId,

      dedupeKey: `assessment:${input.assessmentId}:scheduled`,

      actorId: input.actorId,

      actorRole: input.actorRole,

      actorName: input.actorName,

      metadata: {
        ...buildAssessmentMetadata(input),

        scheduledFor: new Date(scheduledFor).toISOString(),
      },

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                       ASSESSMENT PUBLISHED                                 */
/* -------------------------------------------------------------------------- */

export async function notifyAssessmentPublished({
  tx,
  ...input
}: AssessmentNotificationBase & NotificationTx) {
  const recipients = await getAssessmentStudentRecipients({
    classId: input.classId,

    actorId: input.actorId,

    tx,
  });

  if (recipients.length === 0) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type: "ASSESSMENT_PUBLISHED",

      category: "ASSESSMENT",

      priority: "HIGH",

      title: "Assessment Available",

      message: `${input.assessmentTitle} for ${input.subjectName} is now available.`,

      actionUrl: `/student/assessments/${input.assessmentId}`,

      entityType: "ASSESSMENT",

      entityId: input.assessmentId,

      dedupeKey: `assessment:${input.assessmentId}:published`,

      actorId: input.actorId,

      actorRole: input.actorRole,

      actorName: input.actorName,

      metadata: buildAssessmentMetadata(input),

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                         ASSESSMENT DUE SOON                                */
/* -------------------------------------------------------------------------- */

export async function notifyAssessmentDueSoon({
  hoursRemaining,
  tx,
  ...input
}: AssessmentNotificationBase &
  NotificationTx & {
    hoursRemaining: number;
  }) {
  const recipients = await getAssessmentStudentRecipients({
    classId: input.classId,

    tx,
  });

  if (recipients.length === 0) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type: "ASSESSMENT_DUE_SOON",

      category: "ASSESSMENT",

      priority: "HIGH",

      title: "Assessment Due Soon",

      message: `${input.assessmentTitle} is due in approximately ${hoursRemaining} hour${
        hoursRemaining === 1 ? "" : "s"
      }.`,

      actionUrl: `/student/assessments/${input.assessmentId}`,

      entityType: "ASSESSMENT",

      entityId: input.assessmentId,

      dedupeKey: `assessment:${input.assessmentId}:due-soon:${hoursRemaining}h`,

      metadata: {
        ...buildAssessmentMetadata(input),

        hoursRemaining,
      },

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                         RESULT READY                                       */
/* -------------------------------------------------------------------------- */

export async function notifyAssessmentResultReady({
  studentId,
  attemptId,
  score,
  totalMarks,
  percentage,
  tx,
  ...input
}: AssessmentNotificationBase &
  NotificationTx & {
    studentId: string;

    attemptId: number;

    score: number;

    totalMarks: number;

    percentage: number;
  }) {
  const recipients = await getAssessmentResultRecipient({
    studentId,

    actorId: input.actorId,

    tx,
  });

  if (recipients.length === 0) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type: "ASSESSMENT_RESULT_READY",

      category: "ASSESSMENT",

      priority: "NORMAL",

      title: "Assessment Result Ready",

      message: `Your result for ${input.assessmentTitle} is now available.`,

      actionUrl: `/student/assessments/${input.assessmentId}/result?attemptId=${attemptId}`,

      entityType: "ASSESSMENT",

      entityId: input.assessmentId,

      dedupeKey: `assessment:${input.assessmentId}:result:${studentId}:attempt:${attemptId}`,

      actorId: input.actorId,

      actorRole: input.actorRole,

      actorName: input.actorName,

      metadata: {
        ...buildAssessmentMetadata(input),

        studentId,

        attemptId,

        score,

        totalMarks,

        percentage,
      },

      recipients,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                          FEEDBACK ADDED                                    */
/* -------------------------------------------------------------------------- */

export async function notifyAssessmentFeedbackAdded({
  studentId,
  attemptId,
  tx,
  ...input
}: AssessmentNotificationBase &
  NotificationTx & {
    studentId: string;

    attemptId: number;
  }) {
  const recipients = await getAssessmentResultRecipient({
    studentId,

    actorId: input.actorId,

    tx,
  });

  if (recipients.length === 0) {
    return null;
  }

  return createNotificationEvent({
    tx,

    input: {
      type: "ASSESSMENT_FEEDBACK_ADDED",

      category: "ASSESSMENT",

      priority: "NORMAL",

      title: "Assessment Feedback Available",

      message: `New feedback has been added to ${input.assessmentTitle}.`,

      actionUrl: `/student/assessments/${input.assessmentId}/result?attemptId=${attemptId}`,

      entityType: "ASSESSMENT",

      entityId: input.assessmentId,

      actorId: input.actorId,

      actorRole: input.actorRole,

      actorName: input.actorName,

      metadata: {
        ...buildAssessmentMetadata(input),

        studentId,

        attemptId,
      },

      recipients,
    },
  });
}
