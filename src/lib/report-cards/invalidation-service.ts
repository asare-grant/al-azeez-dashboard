import "server-only";

import prisma from "@/lib/prisma";

export type InvalidateStudentReportCardInput = {
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
/*                    INVALIDATE ONE STUDENT'S DRAFT                          */
/* -------------------------------------------------------------------------- */

export async function invalidateStudentReportCard({
  studentId,
  classId,
  academicYear,
  termId,
  reason,
}: InvalidateStudentReportCardInput): Promise<InvalidateStudentReportCardResult> {
  const normalizedAcademicYear =
    academicYear.trim();

  const normalizedReason =
    reason.trim();

  if (
    !studentId ||
    !Number.isInteger(classId) ||
    classId <= 0 ||
    !Number.isInteger(termId) ||
    termId <= 0 ||
    !normalizedAcademicYear
  ) {
    throw new Error(
      "The report-card invalidation request is invalid.",
    );
  }

  const reportCards =
    await prisma.reportCard.findMany({
      where: {
        studentId,
        classId,
        academicYear:
          normalizedAcademicYear,
        termId,

        /*
         * Published and archived report cards are immutable
         * historical snapshots and must never be invalidated.
         */
        status: "DRAFT",
      },

      select: {
        id: true,
      },
    });

  if (
    reportCards.length === 0
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

  const invalidated =
    await prisma.reportCard.updateMany({
      where: {
        id: {
          in: reportCardIds,
        },

        status: "DRAFT",
      },

      data: {
        isStale: true,
        staleAt: now,

        staleReason:
          normalizedReason ||
          "One or more source academic results changed.",

        /*
         * A changed academic result invalidates any
         * previous review decision.
         */
        reviewStatus: "DRAFT",

        submittedForReviewAt: null,
        submittedForReviewBy: null,

        approvedAt: null,
        approvedBy: null,

        changesRequestedAt: null,
        changesRequestedBy: null,

        reviewNote: null,

        lockedAt: null,

        version: {
          increment: 1,
        },
      },
    });

  return {
    invalidatedCount:
      invalidated.count,

    reportCardIds,
  };
}


import type {
  Prisma,
} from "@prisma/client";

export async function invalidateStudentReportCardWithTransaction({
  tx,
  studentId,
  classId,
  academicYear,
  termId,
  reason,
}: InvalidateStudentReportCardInput & {
  tx: Prisma.TransactionClient;
}): Promise<InvalidateStudentReportCardResult> {
  const normalizedAcademicYear =
    academicYear.trim();

  const reportCards =
    await tx.reportCard.findMany({
      where: {
        studentId,
        classId,
        academicYear:
          normalizedAcademicYear,
        termId,
        status: "DRAFT",
      },

      select: {
        id: true,
      },
    });

  const reportCardIds =
    reportCards.map(
      (reportCard) =>
        reportCard.id,
    );

  if (
    reportCardIds.length === 0
  ) {
    return {
      invalidatedCount: 0,
      reportCardIds: [],
    };
  }

  const invalidated =
    await tx.reportCard.updateMany({
      where: {
        id: {
          in: reportCardIds,
        },

        status: "DRAFT",
      },

      data: {
        isStale: true,
        staleAt: new Date(),

        staleReason:
          reason.trim() ||
          "One or more source academic results changed.",

        reviewStatus: "DRAFT",

        submittedForReviewAt: null,
        submittedForReviewBy: null,

        approvedAt: null,
        approvedBy: null,

        changesRequestedAt: null,
        changesRequestedBy: null,

        reviewNote: null,

        lockedAt: null,

        version: {
          increment: 1,
        },
      },
    });

  return {
    invalidatedCount:
      invalidated.count,

    reportCardIds,
  };
}