"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

import { calculateReportCardAttendance } from "./attendance";

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

type ReportCardManager = {
  userId: string;
  role: "admin" | "teacher";
};

async function requireReportCardManager(): Promise<ReportCardManager> {
  const { userId, role } = await requireReportCardUser();

  if (role !== "admin" && role !== "teacher") {
    throw new Error("UNAUTHORISED");
  }

  return {
    userId,
    role,
  };
}

async function requireReportCardAdministrator() {
  const { userId, role } = await requireReportCardUser();

  if (role !== "admin") {
    throw new Error("ADMIN_REQUIRED");
  }

  return {
    userId,
    role,
  } as const;
}

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
    const { userId, role } = await requireReportCardManager();

    const data = parsed.data;

    const attendance = calculateReportCardAttendance({
      daysSchoolOpened: data.daysSchoolOpened,

      daysPresent: data.daysPresent,
    });

    const result = await prisma.$transaction(async (tx) => {
      const reportCard = await tx.reportCard.findFirst({
        where: {
          id: data.reportCardId,

          ...(role === "teacher"
            ? {
                class: {
                  lessons: {
                    some: {
                      teacherId: userId,
                    },
                  },
                },
              }
            : {}),
        },

        select: {
          id: true,

          studentId: true,
          classId: true,

          status: true,
          reviewStatus: true,

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

      const now = new Date();

      const updated = await tx.reportCard.update({
        where: {
          id: reportCard.id,
        },

        data: {
          daysSchoolOpened: attendance.daysSchoolOpened,

          daysPresent: attendance.daysPresent,

          daysAbsent: attendance.daysAbsent,

          attendancePercentage: attendance.attendancePercentage,

          conduct: normalizeNullableText(data.conduct),

          attitude: normalizeNullableText(data.attitude),

          interest: normalizeNullableText(data.interest),

          classTeacherRemark: normalizeNullableText(data.classTeacherRemark),

          /*
           * A teacher cannot overwrite the
           * administrator/head-teacher remark.
           */
          headTeacherRemark:
            role === "admin"
              ? normalizeNullableText(data.headTeacherRemark)
              : reportCard.headTeacherRemark,

          promotionStatus: normalizeNullableText(data.promotionStatus),

          termClosedOn: data.termClosedOn,

          nextTermBegins: data.nextTermBegins,

          regeneratedAt: now,

          version: {
            increment: 1,
          },
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

      return updated;
    });

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
    const { userId, role } = await requireReportCardManager();

    const { reportCardId, note } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const reportCard = await tx.reportCard.findFirst({
        where: {
          id: reportCardId,

          ...(role === "teacher"
            ? {
                class: {
                  lessons: {
                    some: {
                      teacherId: userId,
                    },
                  },
                },
              }
            : {}),
        },

        select: reviewableReportCardSelect,
      });

      if (!reportCard) {
        throw new Error("REPORT_CARD_NOT_FOUND");
      }

      const workflow = canSubmitReportCardForReview(reportCard);

      if (!workflow.allowed) {
        throw new ReportCardWorkflowError(
          workflow.reason ?? "This report card cannot be submitted for review.",
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
          id: reportCard.id,

          status: "DRAFT",

          reviewStatus: {
            in: ["DRAFT", "CHANGES_REQUESTED"],
          },

          isStale: false,

          calculationStatus: "READY",
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

      return {
        reportCardId: reportCard.id,

        studentId: reportCard.studentId,

        classId: reportCard.classId,

        submittedForReviewAt: now,
      };
    });

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
    const { userId } = await requireReportCardAdministrator();

    const { reportCardId, reviewNote } = parsed.data;

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
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

      return {
        ...reportCard,

        changesRequestedAt: now,

        reviewNote: reviewNote.trim(),
      };
    });

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
    const { userId } = await requireReportCardAdministrator();

    const { reportCardId, reviewNote } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
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

      return {
        reportCardId: reportCard.id,

        studentId: reportCard.studentId,

        classId: reportCard.classId,

        approvedAt: now,
      };
    });

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
    const { userId } = await requireReportCardAdministrator();

    const { reportCardId, reviewNote } = parsed.data;

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
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

      return {
        ...reportCard,

        reviewNote: reviewNote.trim(),
      };
    });

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

    case "ADMIN_REQUIRED":
      return "Only an administrator can perform this review action.";

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
