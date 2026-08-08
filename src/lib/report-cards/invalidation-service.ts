import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  createReportCardActivity,
} from "./activity-service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type InvalidateStudentReportCardInput = {
  tx: Prisma.TransactionClient;

  studentId: string;

  classId: number;

  academicYear: string;

  termId: number;

  reason: string;
};

export type InvalidateStudentReportCardResult = {
  invalidatedCount: number;

  reportCardIds: number[];
};

/* -------------------------------------------------------------------------- */
/*                            NORMALISATION                                   */
/* -------------------------------------------------------------------------- */

function normaliseReason(
  reason: string,
) {
  const value =
    reason.trim();

  return (
    value ||
    "One or more academic source records changed after this report card was generated."
  );
}

/* -------------------------------------------------------------------------- */
/*                   INVALIDATE STUDENT REPORT CARD                           */
/* -------------------------------------------------------------------------- */

export async function invalidateStudentReportCardWithTransaction({
  tx,

  studentId,

  classId,

  academicYear,

  termId,

  reason,
}: InvalidateStudentReportCardInput): Promise<InvalidateStudentReportCardResult> {
  const normalisedStudentId =
    studentId.trim();

  const normalisedAcademicYear =
    academicYear.trim();

  if (!normalisedStudentId) {
    throw new Error(
      "A student is required before a report card can be invalidated.",
    );
  }

  if (
    !Number.isInteger(
      classId,
    ) ||
    classId <= 0
  ) {
    throw new Error(
      "A valid class is required before a report card can be invalidated.",
    );
  }

  if (
    !normalisedAcademicYear
  ) {
    throw new Error(
      "An academic year is required before a report card can be invalidated.",
    );
  }

  if (
    !Number.isInteger(
      termId,
    ) ||
    termId <= 0
  ) {
    throw new Error(
      "A valid term is required before a report card can be invalidated.",
    );
  }

  /*
   * IMPORTANT:
   *
   * We deliberately target only DRAFT report cards.
   *
   * Published and archived academic records are historical
   * snapshots and must never be silently changed because a
   * teacher edits a later source result.
   */
  const reportCards =
    await tx.reportCard.findMany({
      where: {
        studentId:
          normalisedStudentId,

        classId,

        academicYear:
          normalisedAcademicYear,

        termId,

        status:
          "DRAFT",
      },

      select: {
        id: true,
      },
    });

  if (
    reportCards.length ===
    0
  ) {
    return {
      invalidatedCount: 0,

      reportCardIds: [],
    };
  }

  const reportCardIds =
    reportCards.map(
      (reportCard) =>
        reportCard.id,
    );

  const now =
    new Date();

  const normalisedReason =
  normaliseReason(
    reason,
  );

const updateResult =
  await tx.reportCard.updateMany({
    where: {
      id: {
        in:
          reportCardIds,
        },

        /*
        * Protect against another workflow
        * changing the report between lookup
        * and invalidation.
        */
        status:
          "DRAFT",
      },

      data: {
        /* -------------------------------------------------------------- */
        /*                    ACADEMIC SNAPSHOT STATE                     */
        /* -------------------------------------------------------------- */

        isStale:
          true,

        staleAt:
          now,

        staleReason:
          normalisedReason,

        version: {
          increment:
            1,
        },

        /* -------------------------------------------------------------- */
        /*                    REVIEW WORKFLOW RESET                       */
        /* -------------------------------------------------------------- */

        reviewStatus:
          "DRAFT",

        submittedForReviewAt:
          null,

        submittedForReviewBy:
          null,

        approvedAt:
          null,

        approvedBy:
          null,

        changesRequestedAt:
          null,

        changesRequestedBy:
          null,

        reviewNote:
          null,
      },
    });

  /*
  * Resolve the exact records that received
  * this invalidation before writing audit
  * activity.
  */
  const invalidatedCards =
    updateResult.count > 0
      ? await tx.reportCard.findMany({
          where: {
            id: {
              in:
                reportCardIds,
            },

            status:
              "DRAFT",

            isStale:
              true,

            staleAt:
              now,
          },

          select: {
            id: true,
          },
        })
      : [];

  const invalidatedReportCardIds =
    invalidatedCards.map(
      (reportCard) =>
        reportCard.id,
    );

  /* ------------------------------------------------------------------ */
  /*                   RECORD STALE ACTIVITIES                          */
  /* ------------------------------------------------------------------ */

  for (
    const reportCardId of
    invalidatedReportCardIds
  ) {
    await createReportCardActivity({
      tx,

      reportCardId,

      type:
        "MARKED_STALE",

      actorId:
        null,

      actorRole:
        "system",

      actorName: null,

      title:
        "Academic snapshot outdated",

      description:
        normalisedReason,

      metadata: {
        studentId:
          normalisedStudentId,

        classId,

        academicYear:
          normalisedAcademicYear,

        termId,
      },
    });
  }

  return {
    invalidatedCount:
      invalidatedReportCardIds.length,

    reportCardIds:
      invalidatedReportCardIds,
  };
    
}