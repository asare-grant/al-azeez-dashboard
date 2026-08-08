"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

import { requireReportCardUser } from "./auth";

import {
  bulkApproveReportCardsSchema,
  bulkPublishReportCardsSchema,
  bulkRequestReportCardChangesSchema,
} from "./bulk-review-validation";

import type { BulkReportCardActionSummary } from "./bulk-review-types";

import type { ReportCardActionResult } from "./types";

import { reportCardFailure, reportCardSuccess } from "./action-result";

import { reviewReportCardReadiness } from "./review-readiness";

import {
  canApproveReportCard,
  canPublishReportCard,
  canRequestReportCardChanges,
} from "./workflow-guards";

/* -------------------------------------------------------------------------- */
/*                              SHARED HELPERS                                */
/* -------------------------------------------------------------------------- */

async function requireReportCardAdmin() {
  const { userId, role } = await requireReportCardUser();

  if (role !== "admin") {
    throw new Error("ADMIN_REQUIRED");
  }

  return {
    userId,
  };
}

function revalidateBulkReviewRoutes() {
  revalidatePath("/list/report-cards");

  revalidatePath("/list/report-cards/review");
}

function revalidateIndividualCards(reportCardIds: number[]) {
  for (const reportCardId of reportCardIds) {
    revalidatePath(`/list/report-cards/${reportCardId}`);

    revalidatePath(`/list/report-cards/${reportCardId}/review`);

    revalidatePath(`/list/report-cards/${reportCardId}/print`);
  }
}

const bulkReadinessSelect = {
  id: true,

  studentId: true,
  classId: true,

  status: true,
  reviewStatus: true,
  calculationStatus: true,

  isStale: true,
  staleAt: true,
  staleReason: true,

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
/*                          BULK APPROVE REPORTS                              */
/* -------------------------------------------------------------------------- */

export async function bulkApproveReportCards(
  rawInput: unknown,
): Promise<ReportCardActionResult<BulkReportCardActionSummary>> {
  const parsed = bulkApproveReportCardsSchema.safeParse(rawInput);

  if (!parsed.success) {
    return reportCardFailure(
      "The bulk approval request is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const { userId } = await requireReportCardAdmin();

    const { reportCardIds, reviewNote } = parsed.data;

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const reportCards = await tx.reportCard.findMany({
        where: {
          id: {
            in: reportCardIds,
          },
        },

        select: bulkReadinessSelect,
      });

      const foundMap = new Map(
        reportCards.map((reportCard) => [reportCard.id, reportCard]),
      );

      const completedIds: number[] = [];

      const skippedItems: {
        reportCardId: number;
        reason: string;
      }[] = [];

      for (const reportCardId of reportCardIds) {
        const reportCard = foundMap.get(reportCardId);

        if (!reportCard) {
          skippedItems.push({
            reportCardId,

            reason: "Report card not found.",
          });

          continue;
        }

        const workflow = canApproveReportCard(reportCard);

        if (!workflow.allowed) {
          skippedItems.push({
            reportCardId,

            reason: workflow.reason ?? "The report card cannot be approved.",
          });

          continue;
        }

        const readiness = reviewReportCardReadiness(reportCard);

        if (!readiness.readyForApproval) {
          skippedItems.push({
            reportCardId,

            reason:
              readiness.errors[0]?.description ??
              "The report card is not ready for approval.",
          });

          continue;
        }

        const updateResult = await tx.reportCard.updateMany({
          where: {
            id: reportCardId,

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

        if (updateResult.count === 1) {
          completedIds.push(reportCardId);
        } else {
          skippedItems.push({
            reportCardId,

            reason: "The report card was changed by another user.",
          });
        }
      }

      return {
        requested: reportCardIds.length,

        completed: completedIds.length,

        skipped: skippedItems.length,

        reportCardIds: completedIds,

        skippedItems,
      };
    });

    revalidateBulkReviewRoutes();

    revalidateIndividualCards(result.reportCardIds);

    return reportCardSuccess(
      result.completed > 0
        ? `${result.completed} report card${
            result.completed === 1 ? "" : "s"
          } approved successfully.`
        : "No report cards were approved.",
      result,
    );
  } catch (error) {
    console.error("BULK APPROVE REPORT CARDS ERROR:", error);

    return reportCardFailure(
      error instanceof Error && error.message === "ADMIN_REQUIRED"
        ? "Only an administrator can approve report cards."
        : "The selected report cards could not be approved.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                       BULK REQUEST CORRECTIONS                             */
/* -------------------------------------------------------------------------- */

export async function bulkRequestReportCardChanges(
  rawInput: unknown,
): Promise<ReportCardActionResult<BulkReportCardActionSummary>> {
  const parsed = bulkRequestReportCardChangesSchema.safeParse(rawInput);

  if (!parsed.success) {
    return reportCardFailure(
      "The bulk correction request is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const { userId } = await requireReportCardAdmin();

    const { reportCardIds, reviewNote } = parsed.data;

    const now = new Date();

    const completedIds: number[] = [];

    const skippedItems: {
      reportCardId: number;
      reason: string;
    }[] = [];

    await prisma.$transaction(async (tx) => {
      const reportCards = await tx.reportCard.findMany({
        where: {
          id: {
            in: reportCardIds,
          },
        },

        select: bulkReadinessSelect,
      });

      const foundMap = new Map(
        reportCards.map((reportCard) => [reportCard.id, reportCard]),
      );

      for (const reportCardId of reportCardIds) {
        const reportCard = foundMap.get(reportCardId);

        if (!reportCard) {
          skippedItems.push({
            reportCardId,
            reason: "Report card not found.",
          });

          continue;
        }

        const workflow = canRequestReportCardChanges(reportCard);

        if (!workflow.allowed) {
          skippedItems.push({
            reportCardId,

            reason:
              workflow.reason ??
              "Changes cannot be requested for this report card.",
          });

          continue;
        }
        const updateResult = await tx.reportCard.updateMany({
          where: {
            id: reportCardId,

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

        if (updateResult.count === 1) {
          completedIds.push(reportCardId);
        } else {
          skippedItems.push({
            reportCardId,

            reason: "The report card was changed by another user.",
          });
        }
      }
    });

    const summary: BulkReportCardActionSummary = {
      requested: reportCardIds.length,

      completed: completedIds.length,

      skipped: skippedItems.length,

      reportCardIds: completedIds,

      skippedItems,
    };

    revalidateBulkReviewRoutes();

    revalidateIndividualCards(completedIds);

    return reportCardSuccess(
      completedIds.length > 0
        ? `${completedIds.length} report card${
            completedIds.length === 1 ? "" : "s"
          } returned for corrections.`
        : "No report cards were returned for corrections.",
      summary,
    );
  } catch (error) {
    console.error("BULK REQUEST REPORT CHANGES ERROR:", error);

    return reportCardFailure(
      error instanceof Error && error.message === "ADMIN_REQUIRED"
        ? "Only an administrator can request report-card corrections."
        : "The correction request could not be completed.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                           BULK PUBLISH REPORTS                             */
/* -------------------------------------------------------------------------- */

export async function bulkPublishReportCards(
  rawInput: unknown,
): Promise<ReportCardActionResult<BulkReportCardActionSummary>> {
  const parsed = bulkPublishReportCardsSchema.safeParse(rawInput);

  if (!parsed.success) {
    return reportCardFailure(
      "The bulk publication request is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  try {
    const { userId } = await requireReportCardAdmin();

    const { reportCardIds } = parsed.data;

    const now = new Date();

    const completedIds: number[] = [];

    const skippedItems: {
      reportCardId: number;
      reason: string;
    }[] = [];

    await prisma.$transaction(async (tx) => {
      const reportCards = await tx.reportCard.findMany({
        where: {
          id: {
            in: reportCardIds,
          },
        },

        select: bulkReadinessSelect,
      });

      const foundMap = new Map(
        reportCards.map((reportCard) => [reportCard.id, reportCard]),
      );

      for (const reportCardId of reportCardIds) {
        const reportCard = foundMap.get(reportCardId);

        if (!reportCard) {
          skippedItems.push({
            reportCardId,
            reason: "Report card not found.",
          });

          continue;
        }

        const workflow = canPublishReportCard(reportCard);

        if (!workflow.allowed) {
          skippedItems.push({
            reportCardId,

            reason: workflow.reason ?? "This report card cannot be published.",
          });

          continue;
        }

        const updateResult = await tx.reportCard.updateMany({
          where: {
            id: reportCardId,

            status: "DRAFT",

            reviewStatus: "APPROVED",

            calculationStatus: "READY",

            isStale: false,
          },

          data: {
            status: "PUBLISHED",

            publishedAt: now,

            publishedBy: userId,

            lockedAt: now,

            version: {
              increment: 1,
            },
          },
        });

        if (updateResult.count === 1) {
          completedIds.push(reportCardId);
        } else {
          skippedItems.push({
            reportCardId,

            reason: "The report card was changed by another user.",
          });
        }
      }
    });

    const summary: BulkReportCardActionSummary = {
      requested: reportCardIds.length,

      completed: completedIds.length,

      skipped: skippedItems.length,

      reportCardIds: completedIds,

      skippedItems,
    };

    revalidateBulkReviewRoutes();

    revalidateIndividualCards(completedIds);

    revalidatePath("/student/report-cards");

    revalidatePath("/parent/children");

    revalidatePath("/parent/report-cards");

    return reportCardSuccess(
      completedIds.length > 0
        ? `${completedIds.length} report card${
            completedIds.length === 1 ? "" : "s"
          } published successfully.`
        : "No report cards were published.",
      summary,
    );
  } catch (error) {
    console.error("BULK PUBLISH REPORT CARDS ERROR:", error);

    return reportCardFailure(
      error instanceof Error && error.message === "ADMIN_REQUIRED"
        ? "Only an administrator can publish report cards."
        : "The selected report cards could not be published.",
    );
  }
}
