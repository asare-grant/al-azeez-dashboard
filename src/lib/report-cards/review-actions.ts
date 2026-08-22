// src/lib/report-cards/review-actions.ts
"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

import { Prisma } from "@prisma/client";

import { requireReportCardUser } from "./auth";

import { reviewReportCardReadiness } from "./review-readiness";

import {
  canApproveReportCard,
  canRequestReportCardChanges,
  canSubmitReportCardForReview,
} from "./workflow-guards";

import {
  approveReportCardSchema,
  reopenReportCardReviewSchema,
  reportCardDetailsSchema,
  requestReportCardChangesSchema,
  submitReportCardForReviewSchema,
} from "./review-validation";

import type {
  ApproveReportCardResult,
  ReopenReportCardReviewResult,
  RequestReportCardChangesResult,
  SaveReportCardDetailsResult,
  SubmitReportCardForReviewResult,
} from "./review-types";

import type { ReportCardActionResult } from "./types";
import { reportCardFailure, reportCardSuccess } from "./action-result";

import { createReportCardActivity } from "./activity-service";

import { requireReportCardPermission } from "./auth";

import { buildReportCardManagerWhere } from "./access";

import {
  notifyReportCardApproved,
  notifyReportCardChangesRequested,
  notifyReportCardReopened,
  notifyReportCardSubmitted,
} from "@/lib/notifications";
/* -------------------------------------------------------------------------- */
/*                            SHARED CONSTANTS                                */
/* -------------------------------------------------------------------------- */

const REPORT_CARD_LIST_PATH = "/list/report-cards";

const REPORT_CARD_EDITABLE_REVIEW_STATUSES = [
  "DRAFT",
  "CHANGES_REQUESTED",
] as const;

/* -------------------------------------------------------------------------- */
/*                         NORMALISATION HELPERS                              */
/* -------------------------------------------------------------------------- */

function normalizeNullableText(value: string): string | null {
  const normalized = value.trim();

  return normalized ? normalized : null;
}

function buildReadinessErrorMessage(
  errors: {
    description: string;
  }[],
): string {
  if (errors.length === 0) {
    return "The report card is not ready.";
  }

  return errors
    .slice(0, 3)
    .map((error) => error.description)
    .join(" ");
}

/* -------------------------------------------------------------------------- */
/*                           ROUTE REVALIDATION                               */
/* -------------------------------------------------------------------------- */

function revalidateReportCardRoutes({
  reportCardId,
  classId,
  studentId,
}: {
  reportCardId: number;
  classId: number;
  studentId: string;
}) {
  revalidatePath(REPORT_CARD_LIST_PATH);

  revalidatePath(`${REPORT_CARD_LIST_PATH}/${reportCardId}`);

  revalidatePath(`${REPORT_CARD_LIST_PATH}/${reportCardId}/print`);

  revalidatePath(`/teacher/classes/${classId}/report-cards`);

  revalidatePath(`/teacher/classes/${classId}/report-cards/${reportCardId}`);

  revalidatePath(
    `/teacher/classes/${classId}/report-cards/${reportCardId}/print`,
  );

  /*
   * These routes will only display the card after it
   * has been published, but revalidating them keeps
   * the complete access system consistent.
   */
  revalidatePath("/student/report-cards");

  revalidatePath(`/student/report-cards/${reportCardId}`);

  revalidatePath(`/parent/children/${studentId}/report-cards`);

  revalidatePath(`/parent/children/${studentId}/report-cards/${reportCardId}`);
}

/* -------------------------------------------------------------------------- */
/*                           ACCESS HELPERS                                   */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                      REVIEWABLE REPORT SELECT                              */
/* -------------------------------------------------------------------------- */

const reviewableReportCardSelect = {
  id: true,

  studentId: true,
  classId: true,

  status: true,
  reviewStatus: true,

  calculationStatus: true,

  isStale: true,
  staleAt: true,
  staleReason: true,

  version: true,

  academicYear: true,

  student: {
    select: {
      id: true,

      name: true,

      surname: true,
    },
  },

  class: {
    select: {
      id: true,

      name: true,
    },
  },

  term: {
    select: {
      id: true,

      name: true,
    },
  },

  subjectCount: true,
  completedSubjectCount: true,
  incompleteSubjectCount: true,

  averageScore: true,
  overallGrade: true,

  daysSchoolOpened: true,
  daysPresent: true,
  daysAbsent: true,

  conduct: true,
  attitude: true,
  interest: true,

  classTeacherRemark: true,
  headTeacherRemark: true,

  promotionStatus: true,

  termClosedOn: true,
  nextTermBegins: true,

  reviewNote: true,
} as const;

/* -------------------------------------------------------------------------- */
/*                      SAVE EDITABLE REPORT DETAILS                          */
/* -------------------------------------------------------------------------- */

export async function saveReportCardDetails(
  rawInput: unknown,
): Promise<ReportCardActionResult<SaveReportCardDetailsResult>> {
  const parsed = reportCardDetailsSchema.safeParse(rawInput);

  if (!parsed.success) {
    return reportCardFailure(
      "Some report-card details are invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const { userId, role, scope, canReview } =
      await requireReportCardPermission("report_cards.edit");

    const data = parsed.data;

    const managerWhere = buildReportCardManagerWhere({
      reportCardId: data.reportCardId,

      userId,

      scope,
    });

    if (!managerWhere) {
      return reportCardFailure(
        "You do not have permission to update this report card.",
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        /*
         * First read the report using the same
         * manager ownership policy that will
         * later be repeated in the mutation.
         */
        const reportCard = await tx.reportCard.findFirst({
          where: managerWhere,

          select: {
            id: true,

            studentId: true,

            classId: true,

            status: true,

            reviewStatus: true,

            version: true,

            headTeacherRemark: true,
          },
        });

        if (!reportCard) {
          throw new Error("REPORT_CARD_NOT_FOUND");
        }

        if (reportCard.status !== "DRAFT") {
          throw new Error("REPORT_CARD_LOCKED");
        }

        if (
          !REPORT_CARD_EDITABLE_REVIEW_STATUSES.includes(
            reportCard.reviewStatus as "DRAFT" | "CHANGES_REQUESTED",
          )
        ) {
          throw new Error("REVIEW_STATE_LOCKED");
        }

        /*
         * Repeat authorization, lifecycle state
         * and version in the actual write.
         */
        const updated = await tx.reportCard.updateMany({
          where: {
            ...managerWhere,

            status: "DRAFT",

            reviewStatus: {
              in: ["DRAFT", "CHANGES_REQUESTED"],
            },

            version: reportCard.version,
          },

          data: {
            conduct: normalizeNullableText(data.conduct),

            attitude: normalizeNullableText(data.attitude),

            interest: normalizeNullableText(data.interest),

            classTeacherRemark: normalizeNullableText(data.classTeacherRemark),

            /*
             * Teachers cannot overwrite
             * the head-teacher remark.
             */
            headTeacherRemark: canReview
              ? normalizeNullableText(data.headTeacherRemark)
              : reportCard.headTeacherRemark,

            promotionStatus: normalizeNullableText(data.promotionStatus),

            termClosedOn: data.termClosedOn,

            nextTermBegins: data.nextTermBegins,

            version: {
              increment: 1,
            },
          },
        });

        /*
         * If another request changed the card
         * after our read, the version no longer
         * matches and this write affects zero rows.
         */
        if (updated.count !== 1) {
          throw new Error("CONCURRENT_REVIEW_UPDATE");
        }

        /*
         * Only create the activity after the
         * state mutation succeeded.
         */
        await createReportCardActivity({
          tx,

          reportCardId: reportCard.id,

          type: "DETAILS_UPDATED",

          actorId: userId,

          actorRole: role,

          actorName: null,

          title: "Report details updated",

          description:
            "Student development, remarks or progression details were updated.",
        });

        /*
         * updateMany only returns a count,
         * so read the updated values required
         * by the server-action response.
         */
        const updatedReportCard = await tx.reportCard.findUniqueOrThrow({
          where: {
            id: reportCard.id,
          },

          select: {
            id: true,

            studentId: true,

            classId: true,

            reviewStatus: true,

            daysSchoolOpened: true,

            daysPresent: true,

            daysAbsent: true,

            attendancePercentage: true,

            updatedAt: true,
          },
        });

        return updatedReportCard;
      },

      /*
       * THIS IS WHERE THE TRANSACTION
       * OPTIONS GO.
       *
       * They are the second argument to
       * prisma.$transaction().
       */
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    revalidateReportCardRoutes({
      reportCardId: result.id,

      classId: result.classId,

      studentId: result.studentId,
    });

    return reportCardSuccess("Report-card details saved successfully.", {
      reportCardId: result.id,

      reviewStatus: result.reviewStatus,

      attendance: {
        daysSchoolOpened: result.daysSchoolOpened,

        daysPresent: result.daysPresent,

        daysAbsent: result.daysAbsent,

        attendancePercentage: result.attendancePercentage,
      },

      updatedAt: result.updatedAt,
    });
  } catch (error) {
    console.error("SAVE REPORT CARD DETAILS ERROR:", error);

    return reportCardFailure(getReviewActionErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                       SUBMIT REPORT FOR REVIEW                             */
/* -------------------------------------------------------------------------- */

export async function submitReportCardForReview(
  rawInput: unknown,
): Promise<ReportCardActionResult<SubmitReportCardForReviewResult>> {
  const parsed = submitReportCardForReviewSchema.safeParse(rawInput);

  if (!parsed.success) {
    return reportCardFailure(
      "The review submission request is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const { userId, role, scope } = await requireReportCardPermission(
      "report_cards.submit",
    );

    const { reportCardId, note } = parsed.data;

    const managerWhere = buildReportCardManagerWhere({
      reportCardId,

      userId,

      scope,
    });

    if (!managerWhere) {
      return reportCardFailure(
        "You do not have permission to submit this report card.",
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const reportCard = await tx.reportCard.findFirst({
          where: managerWhere,

          select: reviewableReportCardSelect,
        });

        if (!reportCard) {
          throw new Error("REPORT_CARD_NOT_FOUND");
        }

        const workflow = canSubmitReportCardForReview(reportCard);

        if (!workflow.allowed) {
          throw new ReportCardWorkflowError(
            workflow.reason ??
              "This report card cannot be submitted for review.",
          );
        }

        const readiness = reviewReportCardReadiness(reportCard);

        if (!readiness.readyForReview) {
          throw new ReportCardReadinessError(
            buildReadinessErrorMessage(readiness.errors),
          );
        }

        const now = new Date();

        const updated = await tx.reportCard.updateMany({
          where: {
            ...managerWhere,

            status: "DRAFT",

            reviewStatus: {
              in: ["DRAFT", "CHANGES_REQUESTED"],
            },

            isStale: false,

            calculationStatus: "READY",

            /*
             * The snapshot cannot have changed between
             * validation and submission.
             */
            version: reportCard.version,
          },

          data: {
            reviewStatus: "SUBMITTED",

            submittedForReviewAt: now,

            submittedForReviewBy: userId,

            reviewNote: note?.trim() || null,

            /*
             * Clear the previous correction state.
             */
            changesRequestedAt: null,

            changesRequestedBy: null,

            approvedAt: null,

            approvedBy: null,

            version: {
              increment: 1,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error("CONCURRENT_REVIEW_UPDATE");
        }

        await createReportCardActivity({
          tx,

          reportCardId: reportCard.id,

          type: "SUBMITTED_FOR_REVIEW",

          actorId: userId,

          actorRole: role,

          actorName: null,

          title: "Submitted for review",

          description:
            "The report card was submitted for administrative review.",

          note: note?.trim() || null,
        });

        await notifyReportCardSubmitted({
          tx,

          reportCardId: reportCard.id,

          studentId: reportCard.studentId,

          studentName:
            `${reportCard.student.name} ${reportCard.student.surname}`.trim(),

          classId: reportCard.classId,

          className: reportCard.class.name,

          academicYear: reportCard.academicYear,

          termName: reportCard.term.name,

          actorId: userId,

          actorRole: role,

          actorName: null,
        });

        return {
          reportCardId: reportCard.id,

          studentId: reportCard.studentId,

          classId: reportCard.classId,

          submittedForReviewAt: now,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    revalidateReportCardRoutes({
      reportCardId: result.reportCardId,

      classId: result.classId,

      studentId: result.studentId,
    });

    return reportCardSuccess("Report card submitted for review.", {
      reportCardId: result.reportCardId,

      reviewStatus: "SUBMITTED",

      submittedForReviewAt: result.submittedForReviewAt,
    });
  } catch (error) {
    console.error("SUBMIT REPORT CARD FOR REVIEW ERROR:", error);

    return reportCardFailure(getReviewActionErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                       REQUEST REPORT CHANGES                              */
/* -------------------------------------------------------------------------- */

export async function requestReportCardChanges(
  rawInput: unknown,
): Promise<ReportCardActionResult<RequestReportCardChangesResult>> {
  const parsed = requestReportCardChangesSchema.safeParse(rawInput);

  if (!parsed.success) {
    return reportCardFailure(
      "The correction request is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const { userId, role } = await requireReportCardPermission(
      "report_cards.review",
    );

    const { reportCardId, reviewNote } = parsed.data;

    const now = new Date();

    const result = await prisma.$transaction(
      async (tx) => {
        const reportCard = await tx.reportCard.findUnique({
          where: {
            id: reportCardId,
          },

          select: reviewableReportCardSelect,
        });

        if (!reportCard) {
          throw new Error("REPORT_CARD_NOT_FOUND");
        }

        const workflow = canRequestReportCardChanges(reportCard);

        if (!workflow.allowed) {
          throw new ReportCardWorkflowError(
            workflow.reason ??
              "Changes cannot be requested for this report card.",
          );
        }

        const updated = await tx.reportCard.updateMany({
          where: {
            id: reportCard.id,

            status: "DRAFT",

            reviewStatus: "SUBMITTED",

            isStale: false,

            version: reportCard.version,
          },

          data: {
            reviewStatus: "CHANGES_REQUESTED",

            reviewNote: reviewNote.trim(),

            changesRequestedAt: now,

            changesRequestedBy: userId,

            approvedAt: null,

            approvedBy: null,

            version: {
              increment: 1,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error("CONCURRENT_REVIEW_UPDATE");
        }

        await createReportCardActivity({
          tx,

          reportCardId: reportCard.id,

          type: "CHANGES_REQUESTED",

          actorId: userId,

          actorRole: role,

          actorName: null,

          title: "Changes requested",

          description: "The report card was returned for correction.",

          note: reviewNote.trim(),
        });

        await notifyReportCardChangesRequested({
          tx,

          reportCardId: reportCard.id,

          studentId: reportCard.studentId,

          studentName:
            `${reportCard.student.name} ${reportCard.student.surname}`.trim(),

          classId: reportCard.classId,

          className: reportCard.class.name,

          academicYear: reportCard.academicYear,

          termName: reportCard.term.name,

          reviewNote: reviewNote.trim(),

          actorId: userId,

          actorRole: role,

          actorName: null,
        });

        return {
          ...reportCard,

          changesRequestedAt: now,

          reviewNote: reviewNote.trim(),
        };
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    revalidateReportCardRoutes({
      reportCardId: result.id,

      classId: result.classId,

      studentId: result.studentId,
    });

    return reportCardSuccess(
      "The report card has been returned for corrections.",
      {
        reportCardId: result.id,

        reviewStatus: "CHANGES_REQUESTED",

        reviewNote: result.reviewNote,

        changesRequestedAt: result.changesRequestedAt,
      },
    );
  } catch (error) {
    console.error("REQUEST REPORT CARD CHANGES ERROR:", error);

    return reportCardFailure(getReviewActionErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                          APPROVE REPORT CARD                               */
/* -------------------------------------------------------------------------- */

export async function approveReportCard(
  rawInput: unknown,
): Promise<ReportCardActionResult<ApproveReportCardResult>> {
  const parsed = approveReportCardSchema.safeParse(rawInput);

  if (!parsed.success) {
    return reportCardFailure(
      "The approval request is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const { userId, role } = await requireReportCardPermission(
      "report_cards.review",
    );

    const { reportCardId, reviewNote } = parsed.data;

    const result = await prisma.$transaction(
      async (tx) => {
        const reportCard = await tx.reportCard.findUnique({
          where: {
            id: reportCardId,
          },

          select: reviewableReportCardSelect,
        });

        if (!reportCard) {
          throw new Error("REPORT_CARD_NOT_FOUND");
        }

        const workflow = canApproveReportCard(reportCard);

        if (!workflow.allowed) {
          throw new ReportCardWorkflowError(
            workflow.reason ?? "This report card cannot be approved.",
          );
        }

        const readiness = reviewReportCardReadiness(reportCard);

        if (!readiness.readyForApproval) {
          throw new ReportCardReadinessError(
            buildReadinessErrorMessage(readiness.errors),
          );
        }

        const now = new Date();

        const updated = await tx.reportCard.updateMany({
          where: {
            id: reportCard.id,

            status: "DRAFT",

            reviewStatus: "SUBMITTED",

            calculationStatus: "READY",

            isStale: false,

            version: reportCard.version,
          },

          data: {
            reviewStatus: "APPROVED",

            approvedAt: now,

            approvedBy: userId,

            reviewNote: reviewNote?.trim() || reportCard.reviewNote,

            changesRequestedAt: null,

            changesRequestedBy: null,

            version: {
              increment: 1,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error("CONCURRENT_REVIEW_UPDATE");
        }

        await createReportCardActivity({
          tx,

          reportCardId: reportCard.id,

          type: "APPROVED",

          actorId: userId,

          actorRole: role,

          actorName: null,

          title: "Report approved",

          description: "The report card passed administrative review.",

          note: reviewNote?.trim() || null,
        });

        await notifyReportCardApproved({
          tx,

          reportCardId: reportCard.id,

          studentId: reportCard.studentId,

          studentName:
            `${reportCard.student.name} ${reportCard.student.surname}`.trim(),

          classId: reportCard.classId,

          className: reportCard.class.name,

          academicYear: reportCard.academicYear,

          termName: reportCard.term.name,

          actorId: userId,

          actorRole: role,

          actorName: null,
        });

        return {
          reportCardId: reportCard.id,

          studentId: reportCard.studentId,

          classId: reportCard.classId,

          approvedAt: now,
        };
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    revalidateReportCardRoutes({
      reportCardId: result.reportCardId,

      classId: result.classId,

      studentId: result.studentId,
    });

    return reportCardSuccess("Report card approved successfully.", {
      reportCardId: result.reportCardId,

      reviewStatus: "APPROVED",

      approvedAt: result.approvedAt,
    });
  } catch (error) {
    console.error("APPROVE REPORT CARD ERROR:", error);

    return reportCardFailure(getReviewActionErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                         REOPEN APPROVED REPORT                             */
/* -------------------------------------------------------------------------- */

export async function reopenReportCardReview(
  rawInput: unknown,
): Promise<ReportCardActionResult<ReopenReportCardReviewResult>> {
  const parsed = reopenReportCardReviewSchema.safeParse(rawInput);

  if (!parsed.success) {
    return reportCardFailure(
      "The reopen request is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const { userId, role } = await requireReportCardPermission(
      "report_cards.review",
    );

    const { reportCardId, reviewNote } = parsed.data;

    const now = new Date();

    const result = await prisma.$transaction(
      async (tx) => {
        const reportCard = await tx.reportCard.findFirst({
          where: {
            id: reportCardId,

            status: "DRAFT",

            reviewStatus: "APPROVED",
          },

          select: {
            id: true,

            studentId: true,

            classId: true,

            academicYear: true,

            version: true,

            student: {
              select: {
                name: true,

                surname: true,
              },
            },

            class: {
              select: {
                name: true,
              },
            },

            term: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!reportCard) {
          throw new Error("REPORT_NOT_APPROVED");
        }

        const updated = await tx.reportCard.updateMany({
          where: {
            id: reportCard.id,

            status: "DRAFT",

            reviewStatus: "APPROVED",

            version: reportCard.version,
          },

          data: {
            reviewStatus: "DRAFT",

            reviewNote: reviewNote.trim(),

            approvedAt: null,

            approvedBy: null,

            submittedForReviewAt: null,

            submittedForReviewBy: null,

            changesRequestedAt: now,

            changesRequestedBy: userId,

            version: {
              increment: 1,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error("CONCURRENT_REVIEW_UPDATE");
        }

        await createReportCardActivity({
          tx,

          reportCardId: reportCard.id,

          type: "REOPENED",

          actorId: userId,

          actorRole: role,

          actorName: null,

          title: "Review reopened",

          description:
            "The approved report card was reopened for further editing.",

          note: reviewNote.trim(),
        });

        await notifyReportCardReopened({
          tx,

          reportCardId: reportCard.id,

          studentId: reportCard.studentId,

          studentName:
            `${reportCard.student.name} ${reportCard.student.surname}`.trim(),

          classId: reportCard.classId,

          className: reportCard.class.name,

          academicYear: reportCard.academicYear,

          termName: reportCard.term.name,

          reviewNote: reviewNote.trim(),

          actorId: userId,

          actorRole: role,

          actorName: null,
        });

        return {
          ...reportCard,

          reviewNote: reviewNote.trim(),
        };
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    revalidateReportCardRoutes({
      reportCardId: result.id,

      classId: result.classId,

      studentId: result.studentId,
    });

    return reportCardSuccess("The approved report card has been reopened.", {
      reportCardId: result.id,

      reviewStatus: "DRAFT",

      reviewNote: result.reviewNote,
    });
  } catch (error) {
    console.error("REOPEN REPORT CARD REVIEW ERROR:", error);

    return reportCardFailure(getReviewActionErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                             ERROR HANDLING                                 */
/* -------------------------------------------------------------------------- */

class ReportCardWorkflowError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "ReportCardWorkflowError";
  }
}

class ReportCardReadinessError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "ReportCardReadinessError";
  }
}

function getReviewActionErrorMessage(error: unknown): string {
  if (error instanceof ReportCardWorkflowError) {
    return error.message;
  }

  if (error instanceof ReportCardReadinessError) {
    return error.message;
  }

  if (!(error instanceof Error)) {
    return "The report-card request could not be completed.";
  }

  switch (error.message) {
    case "UNAUTHORISED":
      return "You are not authorised to manage report cards.";

    case "REPORT_CARD_NOT_FOUND":
      return "The selected report card could not be found.";

    case "REPORT_CARD_LOCKED":
      return "Published or archived report cards cannot be edited.";

    case "REVIEW_STATE_LOCKED":
      return "This report card cannot be edited in its current review state.";

    case "INVALID_REVIEW_TRANSITION":
      return "The report card cannot be submitted from its current review state.";

    case "REPORT_NOT_AWAITING_REVIEW":
      return "This report card is not awaiting administrator review.";

    case "REPORT_NOT_APPROVED":
      return "Only an approved draft report card can be reopened.";

    case "CONCURRENT_REVIEW_UPDATE":
      return "The report card was changed by another user. Refresh the page and try again.";

    default:
      return "The report-card review action could not be completed.";
  }
}
