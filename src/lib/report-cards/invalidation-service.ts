import "server-only";

import type {
  Prisma,
} from "@prisma/client";

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

  await tx.reportCard.updateMany({
    where: {
      id: {
        in:
          reportCardIds,
      },

      /*
       * Double protection against another request
       * publishing the card between the find and update.
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
        normaliseReason(
          reason,
        ),

      version: {
        increment:
          1,
        },

      /* -------------------------------------------------------------- */
      /*                    REVIEW WORKFLOW RESET                       */
      /* -------------------------------------------------------------- */

      /*
       * A report that was approved before its academic
       * source results changed is no longer approved.
       */
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

      /*
       * The previous review note belonged to the old
       * academic snapshot.
       */
      reviewNote:
        null,
    },
  });

  return {
    invalidatedCount:
      reportCardIds.length,

    reportCardIds,
  };
}