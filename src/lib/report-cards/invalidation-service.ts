import "server-only";

import type { Prisma } from "@prisma/client";

import { notifyReportCardStale } from "@/lib/notifications";

import { createReportCardActivity } from "./activity-service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type TransactionClient = Prisma.TransactionClient;

export type ReportCardInvalidationActor = {
  actorId?: string | null;

  actorRole?: string | null;

  actorName?: string | null;
};

export type InvalidateStudentReportCardInput = {
  tx: TransactionClient;

  studentId: string;

  classId: number;

  academicYear: string;

  termId: number;

  reason: string;

  actor?: ReportCardInvalidationActor;
};

export type InvalidateTermReportCardsInput = {
  tx: TransactionClient;

  termId: number;

  academicYear?: string;

  reason: string;

  actor?: ReportCardInvalidationActor;
};

export type ReportCardInvalidationResult = {
  invalidatedCount: number;

  reportCardIds: number[];
};

/*
 * Keep this alias because some of your older
 * result-sync code may still import this name.
 */
export type InvalidateStudentReportCardResult = ReportCardInvalidationResult;

/* -------------------------------------------------------------------------- */
/*                            NORMALISATION                                   */
/* -------------------------------------------------------------------------- */

function normaliseReason(reason: string) {
  const value = reason.trim();

  return (
    value ||
    "One or more academic source records changed after this report card was generated."
  );
}

/* -------------------------------------------------------------------------- */
/*                         SHARED REPORT SELECT                               */
/* -------------------------------------------------------------------------- */

const staleReportCardSelect = {
  id: true,

  studentId: true,

  classId: true,

  academicYear: true,

  termId: true,

  status: true,

  isStale: true,

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
} as const;

type StaleReportCard = Prisma.ReportCardGetPayload<{
  select: typeof staleReportCardSelect;
}>;

/* -------------------------------------------------------------------------- */
/*                   INVALIDATE ONE RESOLVED REPORT                           */
/* -------------------------------------------------------------------------- */

async function invalidateResolvedReportCard({
  tx,
  reportCard,
  reason,
  actor,
}: {
  tx: TransactionClient;

  reportCard: StaleReportCard;

  reason: string;

  actor?: ReportCardInvalidationActor;
}) {
  /*
   * Published and archived report cards are
   * immutable historical records.
   */
  if (reportCard.status !== "DRAFT") {
    return false;
  }

  /*
   * --------------------------------------------------------------
   * IMPORTANT — NOTIFICATION / ACTIVITY DEDUPLICATION
   * --------------------------------------------------------------
   *
   * Only perform work when the report moves:
   *
   *       FRESH -> STALE
   *
   * A card that is already stale remains in the same stale cycle.
   *
   * Therefore multiple source edits before regeneration do NOT:
   *
   * - keep incrementing the version,
   * - rewrite staleAt,
   * - overwrite staleReason,
   * - create duplicate activity entries,
   * - create duplicate notifications.
   */
  if (reportCard.isStale) {
    return false;
  }

  const now = new Date();

  const normalisedReason = normaliseReason(reason);

  /*
   * Optimistic concurrency protection.
   *
   * The report must still be:
   *
   * - this exact version
   * - a DRAFT
   * - fresh
   *
   * when the mutation occurs.
   */
  const updateResult = await tx.reportCard.updateMany({
    where: {
      id: reportCard.id,

      status: "DRAFT",

      isStale: false,

      version: reportCard.version,
    },

    data: {
      /* -------------------------------------------------------------- */
      /*                    ACADEMIC SNAPSHOT STATE                     */
      /* -------------------------------------------------------------- */

      isStale: true,

      staleAt: now,

      staleReason: normalisedReason,

      version: {
        increment: 1,
      },

      /* -------------------------------------------------------------- */
      /*                    REVIEW WORKFLOW RESET                       */
      /* -------------------------------------------------------------- */

      reviewStatus: "DRAFT",

      submittedForReviewAt: null,

      submittedForReviewBy: null,

      approvedAt: null,

      approvedBy: null,

      changesRequestedAt: null,

      changesRequestedBy: null,

      reviewNote: null,
    },
  });

  /*
   * Another transaction may have changed,
   * invalidated or regenerated this report
   * between our lookup and mutation.
   */
  if (updateResult.count !== 1) {
    return false;
  }

  /* ------------------------------------------------------------------ */
  /*                   RECORD STALE ACTIVITY                            */
  /* ------------------------------------------------------------------ */

  /*
   * Preserve the report-card activity history
   * you already built earlier.
   *
   * This executes inside the SAME transaction
   * as the stale-state mutation.
   */
  await createReportCardActivity({
    tx,

    reportCardId: reportCard.id,

    type: "MARKED_STALE",

    actorId: actor?.actorId ?? null,

    actorRole: actor?.actorRole ?? "system",

    actorName: actor?.actorName ?? null,

    title: "Academic snapshot outdated",

    description: normalisedReason,

    metadata: {
      studentId: reportCard.studentId,

      classId: reportCard.classId,

      academicYear: reportCard.academicYear,

      termId: reportCard.termId,

      previousVersion: reportCard.version,

      staleReason: normalisedReason,
    },
  });

  /* ------------------------------------------------------------------ */
  /*                    CREATE STALE NOTIFICATION                       */
  /* ------------------------------------------------------------------ */

  /*
   * Notification creation is deliberately placed
   * AFTER the stale mutation and activity record,
   * but still inside the SAME transaction.
   *
   * Therefore:
   *
   * report stale
   * + activity
   * + notification
   *
   * either all commit or all roll back.
   */
  await notifyReportCardStale({
    tx,

    reportCardId: reportCard.id,

    studentId: reportCard.studentId,

    studentName:
      `${reportCard.student.name} ${reportCard.student.surname}`.trim(),

    classId: reportCard.classId,

    className: reportCard.class.name,

    academicYear: reportCard.academicYear,

    termName: reportCard.term.name,

    reason: normalisedReason,

    actorId: actor?.actorId ?? null,

    actorRole: actor?.actorRole ?? "system",

    actorName: actor?.actorName ?? null,
  });

  return true;
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

  actor,
}: InvalidateStudentReportCardInput): Promise<ReportCardInvalidationResult> {
  const normalisedStudentId = studentId.trim();

  const normalisedAcademicYear = academicYear.trim();

  const normalisedReason = normaliseReason(reason);

  if (!normalisedStudentId) {
    throw new Error(
      "A student is required before a report card can be invalidated.",
    );
  }

  if (!Number.isInteger(classId) || classId <= 0) {
    throw new Error(
      "A valid class is required before a report card can be invalidated.",
    );
  }

  if (!normalisedAcademicYear) {
    throw new Error(
      "An academic year is required before a report card can be invalidated.",
    );
  }

  if (!Number.isInteger(termId) || termId <= 0) {
    throw new Error(
      "A valid term is required before a report card can be invalidated.",
    );
  }

  /*
   * --------------------------------------------------------------
   * IMPORTANT
   * --------------------------------------------------------------
   *
   * Only DRAFT reports can become stale.
   *
   * Published and archived academic records
   * remain immutable historical snapshots.
   */
  const reportCard = await tx.reportCard.findFirst({
    where: {
      studentId: normalisedStudentId,

      classId,

      academicYear: normalisedAcademicYear,

      termId,

      status: "DRAFT",
    },

    select: staleReportCardSelect,
  });

  if (!reportCard) {
    return {
      invalidatedCount: 0,

      reportCardIds: [],
    };
  }

  /*
   * Already stale means this report is still
   * waiting for regeneration.
   *
   * Do not start another stale cycle.
   */
  if (reportCard.isStale) {
    return {
      invalidatedCount: 0,

      reportCardIds: [],
    };
  }

  const invalidated = await invalidateResolvedReportCard({
    tx,

    reportCard,

    reason: normalisedReason,

    actor,
  });

  return {
    invalidatedCount: invalidated ? 1 : 0,

    reportCardIds: invalidated ? [reportCard.id] : [],
  };
}

/* -------------------------------------------------------------------------- */
/*                   INVALIDATE ALL REPORTS IN A TERM                         */
/* -------------------------------------------------------------------------- */

export async function invalidateTermReportCardsWithTransaction({
  tx,

  termId,

  academicYear,

  reason,

  actor,
}: InvalidateTermReportCardsInput): Promise<ReportCardInvalidationResult> {
  const normalisedAcademicYear = academicYear?.trim();

  const normalisedReason = normaliseReason(reason);

  if (!Number.isInteger(termId) || termId <= 0) {
    throw new Error(
      "A valid term is required before report cards can be invalidated.",
    );
  }

  /*
   * Only fresh DRAFT cards are loaded.
   *
   * This makes term-wide invalidation naturally
   * idempotent and prevents duplicate notifications.
   */
  const reportCards = await tx.reportCard.findMany({
    where: {
      termId,

      ...(normalisedAcademicYear
        ? {
            academicYear: normalisedAcademicYear,
          }
        : {}),

      status: "DRAFT",

      isStale: false,
    },

    select: staleReportCardSelect,

    orderBy: {
      id: "asc",
    },
  });

  if (reportCards.length === 0) {
    return {
      invalidatedCount: 0,

      reportCardIds: [],
    };
  }

  const invalidatedReportCardIds: number[] = [];

  /*
   * Sequential processing is intentional.
   *
   * Each card gets:
   *
   * 1. stale mutation
   * 2. activity entry
   * 3. notification event
   *
   * before we move to the next report.
   */
  for (const reportCard of reportCards) {
    const invalidated = await invalidateResolvedReportCard({
      tx,

      reportCard,

      reason: normalisedReason,

      actor,
    });

    if (invalidated) {
      invalidatedReportCardIds.push(reportCard.id);
    }
  }

  return {
    invalidatedCount: invalidatedReportCardIds.length,

    reportCardIds: invalidatedReportCardIds,
  };
}
