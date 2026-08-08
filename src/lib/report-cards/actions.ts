"use server";

import { Prisma } from "@prisma/client";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

import { requireReportCardAdmin, requireReportCardManager } from "./auth";

import { canPublishReportCard } from "./workflow-guards";

import { persistClassTermReport } from "./persistence-service";

import { generateClassReportCards } from "./generation-service";

import {
  REPORT_CARD_LIST_PATH,
  parentReportCardPath,
  reportCardDetailsPath,
  studentReportCardPath,
} from "./paths";

import { createReportCardActivity } from "./activity-service";

import type {
  GenerateClassReportCardsInput,
  ReportCardGenerationSummary,
} from "./generation-types";

import type {
  PublishClassReportCardsResult,
  PublishReportCardResult,
  ReportCardAcademicPeriodInput,
  ReportCardActionResult,
} from "./types";

function reportCardSuccess<T>(
  message: string,
  data: T,
): ReportCardActionResult<T> {
  return {
    success: true,
    error: false,
    message,
    data,
  };
}

function reportCardFailure<T = never>(
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
): ReportCardActionResult<T> {
  return {
    success: false,
    error: true,
    message,
    fieldErrors,
  };
}

function getReportCardErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A report card already exists for this student and academic period.";
    }

    if (error.code === "P2025") {
      return "The selected report card could not be found.";
    }

    if (error.code === "P2034") {
      return "Another request changed the report card. Please try again.";
    }
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHENTICATED":
        return "You must sign in before managing report cards.";

      case "UNAUTHORISED":
        return "You are not authorised to manage report cards.";

      case "CONCURRENT_PUBLICATION_UPDATE":
        return "The report card changed before publication could be completed. Refresh the page and try again.";

      case "REPORT_CARD_NOT_FOUND":
        return "The report card could not be found.";

      case "REPORT_ALREADY_ARCHIVED":
        return "This report card has already been archived.";

      case "CONCURRENT_ARCHIVE_UPDATE":
        return "The report card changed before it could be archived. Refresh the page and try again.";

      default:
        return error.message;
    }
  }

  return "The report-card operation could not be completed.";
}

/* -------------------------------------------------------------------------- */
/*                      GENERATE OR REGENERATE DRAFTS                         */
/* -------------------------------------------------------------------------- */

export async function generateClassReportCardDrafts(
  input: GenerateClassReportCardsInput,
): Promise<ReportCardActionResult<ReportCardGenerationSummary>> {
  try {
    const { userId } = await requireReportCardManager();

    const classId = Number(input.classId);

    const termId = Number(input.termId);

    const academicYear = input.academicYear?.trim();

    if (
      !Number.isInteger(classId) ||
      classId <= 0 ||
      !Number.isInteger(termId) ||
      termId <= 0 ||
      !academicYear
    ) {
      return reportCardFailure("Select a valid class, academic year and term.");
    }

    /*
     * Authentication, role permissions, class ownership,
     * weighting validation and source-result validation are
     * enforced by the generation validator and service.
     */
    const summary = await generateClassReportCards(
      {
        classId,
        termId,
        academicYear,

        allowPartial: input.allowPartial ?? false,
      },

      userId,
    );

    revalidatePath(`${REPORT_CARD_LIST_PATH}/generate`);

    revalidatePath(`${REPORT_CARD_LIST_PATH}/review`);

    revalidatePath(`/teacher/classes/${classId}/report-cards`);

    /*
     * Only changed drafts need individual route
     * revalidation. Published and archived snapshots
     * remain untouched.
     */
    for (const item of summary.reportCards) {
      if (item.action !== "CREATED" && item.action !== "REGENERATED") {
        continue;
      }

      revalidatePath(reportCardDetailsPath(item.reportCardId));

      revalidatePath(`${reportCardDetailsPath(item.reportCardId)}/review`);

      revalidatePath(`${reportCardDetailsPath(item.reportCardId)}/print`);
    }

    const changedCount = summary.created + summary.regenerated;

    const message =
      changedCount > 0
        ? `${changedCount} report-card draft${
            changedCount === 1 ? "" : "s"
          } generated successfully.`
        : summary.preserved > 0
          ? "No drafts required updating. Published or archived report cards were preserved."
          : "No report-card drafts required updating.";

    return reportCardSuccess(message, summary);
  } catch (error) {
    console.error("GENERATE REPORT CARD DRAFTS ERROR:", error);

    return reportCardFailure(getReportCardErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                         PUBLISH ONE REPORT CARD                            */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                         PUBLISH ONE REPORT CARD                            */
/* -------------------------------------------------------------------------- */

export async function publishReportCard(
  reportCardId: number,
): Promise<ReportCardActionResult<PublishReportCardResult>> {
  try {
    const { userId } = await requireReportCardAdmin();

    if (!Number.isInteger(reportCardId) || reportCardId <= 0) {
      return reportCardFailure("Select a valid report card.");
    }

    /* ------------------------------------------------------------------ */
    /*                      LOAD CURRENT WORKFLOW STATE                   */
    /* ------------------------------------------------------------------ */

    const reportCard = await prisma.reportCard.findUnique({
      where: {
        id: reportCardId,
      },

      select: {
        id: true,

        studentId: true,

        classId: true,

        status: true,

        reviewStatus: true,

        calculationStatus: true,

        isStale: true,

        subjectCount: true,

        completedSubjectCount: true,

        incompleteSubjectCount: true,

        version: true,
      },
    });

    if (!reportCard) {
      return reportCardFailure("The report card could not be found.");
    }

    /* ------------------------------------------------------------------ */
    /*                    CENTRAL WORKFLOW ENFORCEMENT                    */
    /* ------------------------------------------------------------------ */

    const workflow = canPublishReportCard(reportCard);

    if (!workflow.allowed) {
      return reportCardFailure(
        workflow.reason ?? "This report card cannot be published.",
      );
    }

    const now = new Date();

    const published = await prisma.$transaction(
      async (tx) => {
        /* -------------------------------------------------------------- */
        /*                     ATOMIC PUBLICATION CLAIM                   */
        /* -------------------------------------------------------------- */

        const claimed = await tx.reportCard.updateMany({
          where: {
            id: reportCard.id,

            status: "DRAFT",

            reviewStatus: "APPROVED",

            calculationStatus: "READY",

            isStale: false,

            /*
             * Optimistic concurrency protection.
             */
            version: reportCard.version,
          },

          data: {
            status: "PUBLISHED",

            publishedAt: now,

            lockedAt: now,

            publishedById: userId,

            version: {
              increment: 1,
            },
          },
        });

        if (claimed.count !== 1) {
          throw new Error("CONCURRENT_PUBLICATION_UPDATE");
        }

        /* -------------------------------------------------------------- */
        /*                     RECORD PUBLICATION                         */
        /* -------------------------------------------------------------- */

        await createReportCardActivity({
          tx,

          reportCardId: reportCard.id,

          type: "PUBLISHED",

          actorId: userId,

          actorRole: "admin",

          actorName: null,

          title: "Report published",

          description: "The final report card was published and locked.",

          metadata: {
            version: reportCard.version + 1,
          },
        });

        return tx.reportCard.findUniqueOrThrow({
          where: {
            id: reportCard.id,
          },

          select: {
            id: true,

            status: true,

            publishedAt: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );
    /* ------------------------------------------------------------------ */
    /*                          REVALIDATION                              */
    /* ------------------------------------------------------------------ */

    revalidatePath(REPORT_CARD_LIST_PATH);

    revalidatePath(reportCardDetailsPath(reportCardId));

    revalidatePath(studentReportCardPath(reportCardId));

    revalidatePath("/student/report-cards");

    revalidatePath("/parent/children");

    /* ------------------------------------------------------------------ */
    /*                        RETURN FINAL STATE                          */
    /* ------------------------------------------------------------------ */

    return reportCardSuccess("Report card published and locked successfully.", {
      reportCardId: published.id,

      status: published.status,

      publishedAt: published.publishedAt ?? now,
    });
  } catch (error) {
    console.error("PUBLISH REPORT CARD ERROR:", error);

    return reportCardFailure(getReportCardErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                          ARCHIVE REPORT CARD                               */
/* -------------------------------------------------------------------------- */

export async function archiveReportCard(reportCardId: number): Promise<
  ReportCardActionResult<{
    reportCardId: number;
    status: "ARCHIVED";
    archivedAt: Date;
  }>
> {
  try {
    const { userId } = await requireReportCardAdmin();

    if (!Number.isInteger(reportCardId) || reportCardId <= 0) {
      return reportCardFailure("Select a valid report card.");
    }

    const now = new Date();

    const archiveResult = await prisma.$transaction(
      async (tx) => {
        /*
         * Load the current record so we know
         * whether it exists before trying to archive it.
         */
        const existing = await tx.reportCard.findUnique({
          where: {
            id: reportCardId,
          },

          select: {
            id: true,

            status: true,

            version: true,
          },
        });

        if (!existing) {
          throw new Error("REPORT_CARD_NOT_FOUND");
        }

        if (existing.status === "ARCHIVED") {
          throw new Error("REPORT_ALREADY_ARCHIVED");
        }

        const archived = await tx.reportCard.updateMany({
          where: {
            id: reportCardId,

            status: {
              in: ["DRAFT", "PUBLISHED"],
            },

            version: existing.version,
          },

          data: {
            status: "ARCHIVED",

            archivedAt: now,

            lockedAt: now,

            version: {
              increment: 1,
            },
          },
        });

        if (archived.count !== 1) {
          throw new Error("CONCURRENT_ARCHIVE_UPDATE");
        }

        await createReportCardActivity({
          tx,

          reportCardId,

          type: "ARCHIVED",

          actorId: userId,

          actorRole: "admin",

          actorName: null,

          title: "Report archived",

          description: "The report card was moved to the archive.",

          metadata: {
            previousStatus: existing.status,

            version: existing.version + 1,
          },
        });

        return {
          reportCardId,

          status: "ARCHIVED" as const,

          archivedAt: now,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    revalidatePath(REPORT_CARD_LIST_PATH);

    revalidatePath(reportCardDetailsPath(reportCardId));

    revalidatePath(studentReportCardPath(reportCardId));

    return reportCardSuccess(
      "Report card archived successfully.",
      archiveResult,
    );
  } catch (error) {
    console.error("ARCHIVE REPORT CARD ERROR:", error);

    return reportCardFailure(getReportCardErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                         PUBLISH CLASS REPORT CARDS                         */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                         PUBLISH CLASS REPORT CARDS                         */
/* -------------------------------------------------------------------------- */

export async function publishClassReportCards({
  classId,
  academicYear,
  termId,
}: GenerateClassReportCardsInput): Promise<
  ReportCardActionResult<PublishClassReportCardsResult>
> {
  try {
    const { userId } = await requireReportCardAdmin();

    const normalizedClassId = Number(classId);

    const normalizedTermId = Number(termId);

    const normalizedAcademicYear = academicYear?.trim();

    if (
      !Number.isInteger(normalizedClassId) ||
      normalizedClassId <= 0 ||
      !Number.isInteger(normalizedTermId) ||
      normalizedTermId <= 0 ||
      !normalizedAcademicYear
    ) {
      return reportCardFailure("Select a valid class, academic year and term.");
    }

    /* ------------------------------------------------------------------ */
    /*                       LOAD ALL DRAFT CANDIDATES                    */
    /* ------------------------------------------------------------------ */

    const candidates = await prisma.reportCard.findMany({
      where: {
        classId: normalizedClassId,

        academicYear: normalizedAcademicYear,

        termId: normalizedTermId,

        status: "DRAFT",
      },

      select: {
        id: true,

        status: true,

        reviewStatus: true,

        calculationStatus: true,

        isStale: true,

        subjectCount: true,

        completedSubjectCount: true,

        incompleteSubjectCount: true,

        version: true,
      },
    });

    if (candidates.length === 0) {
      return reportCardFailure(
        "No draft report cards were found for the selected academic period.",
      );
    }

    /* ------------------------------------------------------------------ */
    /*                    APPLY SHARED PUBLICATION GUARD                  */
    /* ------------------------------------------------------------------ */

    const eligible = candidates.filter(
      (reportCard) => canPublishReportCard(reportCard).allowed,
    );

    if (eligible.length === 0) {
      return reportCardFailure(
        "No approved, complete and current report cards are ready for publication.",
      );
    }

    const eligibleIds = eligible.map((reportCard) => reportCard.id);

    /* ------------------------------------------------------------------ */
    /*                     ATOMIC BULK PUBLICATION                        */
    /* ------------------------------------------------------------------ */
    const now = new Date();

    const bulkPublication = await prisma.$transaction(
      async (tx) => {
        const published = await tx.reportCard.updateMany({
          where: {
            id: {
              in: eligibleIds,
            },

            status: "DRAFT",

            reviewStatus: "APPROVED",

            calculationStatus: "READY",

            isStale: false,
          },

          data: {
            status: "PUBLISHED",

            publishedAt: now,

            lockedAt: now,

            publishedById: userId,

            version: {
              increment: 1,
            },
          },
        });

        const publishedCards = await tx.reportCard.findMany({
          where: {
            id: {
              in: eligibleIds,
            },

            status: "PUBLISHED",

            publishedAt: now,
          },

          select: {
            id: true,

            version: true,
          },
        });

        const publishedIds = publishedCards.map((reportCard) => reportCard.id);

        /*
         * Record one immutable activity
         * for every successfully published card.
         */
        for (const reportCard of publishedCards) {
          await createReportCardActivity({
            tx,

            reportCardId: reportCard.id,

            type: "PUBLISHED",

            actorId: userId,

            actorRole: "admin",

            actorName: null,

            title: "Report published",

            description:
              "The final report card was published and locked through class publication.",

            metadata: {
              source: "class-publication",

              classId: normalizedClassId,

              academicYear: normalizedAcademicYear,

              termId: normalizedTermId,

              version: reportCard.version,
            },
          });
        }

        return {
          publishedCount: published.count,

          publishedIds,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    /* ------------------------------------------------------------------ */
    /*                           REVALIDATION                             */
    /* ------------------------------------------------------------------ */

    revalidatePath(REPORT_CARD_LIST_PATH);

    revalidatePath("/student/report-cards");

    revalidatePath("/parent/children");

    revalidatePath("/parent/report-cards");

    /* ------------------------------------------------------------------ */
    /*                            SUMMARY                                */
    /* ------------------------------------------------------------------ */

    const skippedCount = Math.max(
      0,
      candidates.length - bulkPublication.publishedIds.length,
    );

    return reportCardSuccess(
      bulkPublication.publishedCount === 1
        ? "1 report card published and locked successfully."
        : `${bulkPublication.publishedCount} report cards published and locked successfully.`,
      {
        publishedCount: bulkPublication.publishedCount,

        skippedCount,

        reportCardIds: bulkPublication.publishedIds,
      },
    );
    
  } catch (error) {
    console.error("PUBLISH CLASS REPORT CARDS ERROR:", error);

    return reportCardFailure(getReportCardErrorMessage(error));
  }
}
