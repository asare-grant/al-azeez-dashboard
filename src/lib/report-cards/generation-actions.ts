"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  z,
} from "zod";

import {
  generateClassReportCards,
} from "./generation-service";

import type {
  ReportCardGenerationSummary,
} from "./generation-types";

import type {
  ReportCardActionResult,
} from "./types";

import {
  reportCardFailure,
  reportCardSuccess,
} from "./action-result";

import {
  requireReportCardManager,
} from "./auth";

/* -------------------------------------------------------------------------- */
/*                              VALIDATION                                    */
/* -------------------------------------------------------------------------- */

const generateClassReportCardsSchema =
  z.object({
    classId:
      z.coerce
        .number({
          error:
            "Select a valid class.",
        })
        .int()
        .positive(),

    termId:
      z.coerce
        .number({
          error:
            "Select a valid term.",
        })
        .int()
        .positive(),

    academicYear:
      z
        .string()
        .trim()
        .min(
          4,
          "Enter a valid academic year.",
        )
        .max(
          20,
          "The academic year is too long.",
        ),

    allowPartial:
      z
        .boolean()
        .optional()
        .default(false),
  });

/* -------------------------------------------------------------------------- */
/*                            SERVER ACTION                                   */
/* -------------------------------------------------------------------------- */

export async function generateClassReportCardDrafts(
  rawInput: unknown,
): Promise<
  ReportCardActionResult<ReportCardGenerationSummary>
> {
  const parsed =
    generateClassReportCardsSchema.safeParse(
      rawInput,
    );

  if (!parsed.success) {
    return reportCardFailure(
      "The report-card generation request is invalid.",
      parsed.error.flatten()
        .fieldErrors,
    );
  }

  try {
    const {
        userId,
      } = await requireReportCardManager();
        
    const summary =
      await generateClassReportCards(
        parsed.data,
        userId,
      );

    revalidatePath(
      "/list/report-cards",
    );

    revalidatePath(
      "/list/report-cards/generate",
    );

    revalidatePath(
      "/list/report-cards/review",
    );

    revalidatePath(
      `/teacher/classes/${summary.classId}/report-cards`,
    );

    for (
      const item of
      summary.reportCards
    ) {
      revalidatePath(
        `/list/report-cards/${item.reportCardId}`,
      );

      revalidatePath(
        `/list/report-cards/${item.reportCardId}/review`,
      );
    }

    const changed =
      summary.created +
      summary.regenerated;

    return reportCardSuccess(
      changed > 0
        ? `${changed} report-card draft${
            changed === 1
              ? ""
              : "s"
          } generated successfully.`
        : "No report-card drafts required updating.",
      summary,
    );
  } catch (error) {
    console.error(
      "GENERATE CLASS REPORT CARDS ERROR:",
      error,
    );

    return reportCardFailure(
      error instanceof Error
        ? error.message
        : "Report cards could not be generated.",
    );
  }
}