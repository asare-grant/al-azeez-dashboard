"use server";

import {
  Prisma,
} from "@prisma/client";

import {
  revalidatePath,
} from "next/cache";

import prisma from "@/lib/prisma";


import {
  requireReportCardAdmin,
} from "./auth";

import {
  requireReportCardManager,
} from "./auth";

import {
  generateClassReportCards,
} from "./generation-service";

import {
  REPORT_CARD_LIST_PATH,
  parentReportCardPath,
  reportCardDetailsPath,
  studentReportCardPath,
} from "./paths";

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
  fieldErrors?: Record<
    string,
    string[] | undefined
  >,
): ReportCardActionResult<T> {
  return {
    success: false,
    error: true,
    message,
    fieldErrors,
  };
}

function getReportCardErrorMessage(
  error: unknown,
) {
  if (
    error instanceof
    Prisma.PrismaClientKnownRequestError
  ) {
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
  input:
    GenerateClassReportCardsInput,
): Promise<
  ReportCardActionResult<ReportCardGenerationSummary>
> {
  try {
    const {
      userId,
    } = await requireReportCardManager();

    const classId =
      Number(input.classId);

    const termId =
      Number(input.termId);

    const academicYear =
      input.academicYear?.trim();

    if (
      !Number.isInteger(classId) ||
      classId <= 0 ||
      !Number.isInteger(termId) ||
      termId <= 0 ||
      !academicYear
    ) {
      return reportCardFailure(
        "Select a valid class, academic year and term.",
      );
    }

    /*
     * Authentication, role permissions, class ownership,
     * weighting validation and source-result validation are
     * enforced by the generation validator and service.
     */
      const summary =
      await generateClassReportCards(
        {
          classId,
          termId,
          academicYear,

          allowPartial:
            input.allowPartial ??
            false,
        },

        userId,
      );

    revalidatePath(
      `${REPORT_CARD_LIST_PATH}/generate`,
    );

    revalidatePath(
      `${REPORT_CARD_LIST_PATH}/review`,
    );

    revalidatePath(
      `/teacher/classes/${classId}/report-cards`,
    );

    /*
     * Only changed drafts need individual route
     * revalidation. Published and archived snapshots
     * remain untouched.
     */
    for (
      const item of
      summary.reportCards
    ) {
      if (
        item.action !==
          "CREATED" &&
        item.action !==
          "REGENERATED"
      ) {
        continue;
      }

      revalidatePath(
        reportCardDetailsPath(
          item.reportCardId,
        ),
      );

      revalidatePath(
        `${reportCardDetailsPath(
          item.reportCardId,
        )}/review`,
      );

      revalidatePath(
        `${reportCardDetailsPath(
          item.reportCardId,
        )}/print`,
      );
    }

    const changedCount =
      summary.created +
      summary.regenerated;

    const message =
      changedCount > 0
        ? `${changedCount} report-card draft${
            changedCount === 1
              ? ""
              : "s"
          } generated successfully.`
        : summary.preserved > 0
          ? "No drafts required updating. Published or archived report cards were preserved."
          : "No report-card drafts required updating.";

    return reportCardSuccess(
      message,
      summary,
    );
  } catch (error) {
    console.error(
      "GENERATE REPORT CARD DRAFTS ERROR:",
      error,
    );

    return reportCardFailure(
      getReportCardErrorMessage(
        error,
      ),
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                         PUBLISH ONE REPORT CARD                            */
/* -------------------------------------------------------------------------- */

export async function publishReportCard(
  reportCardId: number,
): Promise<
  ReportCardActionResult<PublishReportCardResult>
> {
  try {
    const {
      userId,
    } = await requireReportCardAdmin();

    if (
      !Number.isInteger(
        reportCardId,
      ) ||
      reportCardId <= 0
    ) {
      return reportCardFailure(
        "Select a valid report card.",
      );
    }

    const now =
      new Date();

    const claimed =
      await prisma.reportCard.updateMany({
        where: {
          id:
            reportCardId,

          status:
            "DRAFT",
          
          reviewStatus:
            "APPROVED",

          calculationStatus:
            "READY",
        },

        data: {
          status:
            "PUBLISHED",

          publishedAt:
            now,

          lockedAt:
            now,

          publishedById:
            userId,
        },
      });

    if (claimed.count !== 1) {
      const existing =
        await prisma.reportCard.findUnique({
          where: {
            id:
              reportCardId,
          },

          select: {
            status: true,
            calculationStatus:
              true,
          },
        });

      if (!existing) {
        return reportCardFailure(
          "The report card could not be found.",
        );
      }

      if (
        existing.status !==
        "DRAFT"
      ) {
        return reportCardFailure(
          "This report card has already been published or archived.",
        );
      }

      return reportCardFailure(
        "Only complete report cards can be published.",
      );
    }

    revalidatePath(
      REPORT_CARD_LIST_PATH,
    );

    revalidatePath(
      reportCardDetailsPath(
        reportCardId,
      ),
    );

    revalidatePath(
      studentReportCardPath(
        reportCardId,
      ),
    );

    const published =
      await prisma.reportCard.findUniqueOrThrow({
        where: {
          id:
            reportCardId,
        },

        select: {
          id: true,
          status: true,
          publishedAt: true,
        },
      });

    return reportCardSuccess(
      "Report card published and locked successfully.",
      {
        reportCardId:
          published.id,

        status:
          published.status,

        publishedAt:
          published.publishedAt ??
          now,
      },
    );
  } catch (error) {
    console.error(
      "PUBLISH REPORT CARD ERROR:",
      error,
    );

    return reportCardFailure(
      getReportCardErrorMessage(
        error,
      ),
    );
  }
}


/* -------------------------------------------------------------------------- */
/*                          ARCHIVE REPORT CARD                               */
/* -------------------------------------------------------------------------- */

export async function archiveReportCard(
  reportCardId: number,
): Promise<
  ReportCardActionResult<{
    reportCardId: number;
    status: "ARCHIVED";
    archivedAt: Date;
  }>
> {
  try {
    await requireReportCardAdmin();

    if (
      !Number.isInteger(
        reportCardId,
      ) ||
      reportCardId <= 0
    ) {
      return reportCardFailure(
        "Select a valid report card.",
      );
    }

    const now =
      new Date();

    const archived =
      await prisma.reportCard.updateMany({
        where: {
          id: reportCardId,

          status: {
            in: [
              "DRAFT",
              "PUBLISHED",
            ],
          },
        },

        data: {
          status:
            "ARCHIVED",

          archivedAt:
            now,

          lockedAt:
            now,
        },
      });

    if (archived.count !== 1) {
      const existing =
        await prisma.reportCard.findUnique({
          where: {
            id:
              reportCardId,
          },

          select: {
            status: true,
          },
        });

      if (!existing) {
        return reportCardFailure(
          "The report card could not be found.",
        );
      }

      return reportCardFailure(
        "This report card has already been archived.",
      );
    }

    revalidatePath(
      REPORT_CARD_LIST_PATH,
    );

    revalidatePath(
      reportCardDetailsPath(
        reportCardId,
      ),
    );

    revalidatePath(
      studentReportCardPath(
        reportCardId,
      ),
    );

    return reportCardSuccess(
      "Report card archived successfully.",
      {
        reportCardId,

        status:
          "ARCHIVED",

        archivedAt:
          now,
      },
    );
  } catch (error) {
    console.error(
      "ARCHIVE REPORT CARD ERROR:",
      error,
    );

    return reportCardFailure(
      getReportCardErrorMessage(
        error,
      ),
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                         PUBLISH CLASS REPORT CARDS                         */
/* -------------------------------------------------------------------------- */

export async function publishClassReportCards({
  classId,
  academicYear,
  termId,
}: ReportCardAcademicPeriodInput): Promise<
  ReportCardActionResult<PublishClassReportCardsResult>
> {
  try {
    const {
      userId,
    } = await requireReportCardAdmin();

    const now =
      new Date();

    const readyDrafts =
      await prisma.reportCard.findMany({
        where: {
          classId,
          academicYear,
          termId,

          status:
            "DRAFT",

          reviewStatus:
            "APPROVED",
          
          calculationStatus:
            "READY",
        },

        select: {
          id: true,
        },
      });

    const allDraftCount =
      await prisma.reportCard.count({
        where: {
          classId,
          academicYear,
          termId,

          status:
            "DRAFT",
        },
      });

    if (
      readyDrafts.length === 0
    ) {
      return reportCardFailure(
        "No complete draft report cards are ready for publication.",
      );
    }

    const ids =
      readyDrafts.map(
        (reportCard) =>
          reportCard.id,
      );

    const published =
      await prisma.reportCard.updateMany({
        where: {
          id: {
            in: ids,
          },

          status:
            "DRAFT",

          calculationStatus:
            "READY",
        },

        data: {
          status:
            "PUBLISHED",

          publishedAt:
            now,

          lockedAt:
            now,

          publishedById:
            userId,
        },
      });

    revalidatePath(
      REPORT_CARD_LIST_PATH,
    );

    revalidatePath(
      "/student/report-cards",
    );

    revalidatePath(
      "/parent/report-cards",
    );

    return reportCardSuccess(
      `${published.count} report cards published and locked.`,

      {
        publishedCount:
          published.count,

        skippedCount:
          Math.max(
            0,
            allDraftCount -
              published.count,
          ),

        reportCardIds:
          ids,
      },
    );
  } catch (error) {
    console.error(
      "PUBLISH CLASS REPORT CARDS ERROR:",
      error,
    );

    return reportCardFailure(
      getReportCardErrorMessage(
        error,
      ),
    );
  }
}


