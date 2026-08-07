import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  invalidateStudentReportCardWithTransaction,
} from "@/lib/report-cards/invalidation-service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AssignmentResultSyncInput = {
  tx: Prisma.TransactionClient;

  /**
   * Present during an edit. The exact Result row must
   * be updated using this primary key.
   */
  resultId?: number;

  studentId: string;
  assignmentId: number;

  score: number;
  totalMarks: number;
};

export type AssignmentResultSyncResult = {
  resultId: number;

  resultChanged: boolean;

  percentage: number;

  invalidatedReportCardCount: number;
  invalidatedReportCardIds: number[];
};

/* -------------------------------------------------------------------------- */
/*                              NUMBER HELPERS                                */
/* -------------------------------------------------------------------------- */

function roundNumber(
  value: number,
  decimalPlaces = 2,
) {
  const factor =
    10 ** decimalPlaces;

  return (
    Math.round(
      value * factor,
    ) / factor
  );
}

function calculatePercentage({
  score,
  totalMarks,
}: {
  score: number;
  totalMarks: number;
}) {
  if (
    !Number.isFinite(score) ||
    score < 0
  ) {
    throw new Error(
      "The assignment score is invalid.",
    );
  }

  if (
    !Number.isFinite(totalMarks) ||
    totalMarks <= 0
  ) {
    throw new Error(
      "The assignment total marks are invalid.",
    );
  }

  return roundNumber(
    Math.min(
      100,
      Math.max(
        0,
        (score / totalMarks) *
          100,
      ),
    ),
  );
}

function numbersDiffer(
  first: number | null,
  second: number | null,
  tolerance = 0.001,
) {
  if (
    first === null ||
    second === null
  ) {
    return first !== second;
  }

  return (
    Math.abs(
      first - second,
    ) > tolerance
  );
}

/* -------------------------------------------------------------------------- */
/*                           ASSIGNMENT RESULT SYNC                           */
/* -------------------------------------------------------------------------- */

export async function syncAssignmentResult({
  tx,
  resultId,
  studentId,
  assignmentId,
  score,
  totalMarks,
}: AssignmentResultSyncInput): Promise<AssignmentResultSyncResult> {
  const normalizedStudentId =
    studentId.trim();

  if (!normalizedStudentId) {
    throw new Error(
      "The student could not be resolved.",
    );
  }

  if (
    !Number.isInteger(
      assignmentId,
    ) ||
    assignmentId <= 0
  ) {
    throw new Error(
      "The assignment could not be resolved.",
    );
  }

  const assignment =
    await tx.assignment.findUnique({
      where: {
        id: assignmentId,
      },

      select: {
        id: true,
        title: true,

        academicYear: true,
        termId: true,

        lesson: {
          select: {
            id: true,
            classId: true,
            subjectId: true,
          },
        },
      },
    });

  if (!assignment) {
    throw new Error(
      "The selected assignment could not be found.",
    );
  }

  const academicYear =
    assignment.academicYear
      ?.trim();

  const termId =
    assignment.termId;

  if (!academicYear) {
    throw new Error(
      "The assignment does not have an academic year.",
    );
  }

  if (
    !termId ||
    !Number.isInteger(termId) ||
    termId <= 0
  ) {
    throw new Error(
      "The assignment does not have a valid school term.",
    );
  }

  const student =
    await tx.student.findFirst({
      where: {
        id:
          normalizedStudentId,

        classId:
          assignment.lesson.classId,
      },

      select: {
        id: true,
      },
    });

  if (!student) {
    throw new Error(
      "The selected student does not belong to the assignment class.",
    );
  }

  const percentage =
    calculatePercentage({
      score,
      totalMarks,
    });

 /*
 * Editing must always target the exact Result primary key.
 * Creation checks student + assignment to prevent duplicates.
 */
const existingResult =
  resultId !== undefined
    ? await tx.result.findUnique({
        where: {
          id: resultId,
        },

        select: {
          id: true,
          type: true,
          studentId: true,
          assignmentId: true,

          score: true,
          totalMarks: true,
          percentage: true,
        },
      })
    : await tx.result.findFirst({
        where: {
          studentId:
            normalizedStudentId,

          assignmentId:
            assignment.id,

          type:
            "ASSIGNMENT",
        },

        select: {
          id: true,
          type: true,
          studentId: true,
          assignmentId: true,

          score: true,
          totalMarks: true,
          percentage: true,
        },
      });

if (
  resultId !== undefined &&
  !existingResult
) {
  throw new Error(
    "The assignment result could not be found.",
  );
}

if (
  resultId !== undefined &&
  existingResult?.type !==
    "ASSIGNMENT"
) {
  throw new Error(
    "The selected result is not an assignment result.",
  );
}

/*
 * Do not allow an edit request to move an existing Result
 * to another student or another assignment.
 */
if (
  resultId !== undefined &&
  existingResult &&
  (
    existingResult.studentId !==
      normalizedStudentId ||
    existingResult.assignmentId !==
      assignment.id
  )
) {
  throw new Error(
    "The assignment result does not match the selected student and assignment.",
  );
}

/*
 * During creation, an existing student-assignment result
 * means this would be a duplicate.
 */
if (
  resultId === undefined &&
  existingResult
) {
  throw new Error(
    "This student already has a result for the selected assignment. Edit the existing result instead.",
  );
}

const resultChanged =
  !existingResult ||
  numbersDiffer(
    existingResult.score,
    score,
  ) ||
  numbersDiffer(
    existingResult.totalMarks,
    totalMarks,
  ) ||
  numbersDiffer(
    existingResult.percentage,
    percentage,
  );

const result =
  resultId !== undefined
    ? await tx.result.update({
        where: {
          id: resultId,
        },

        data: {
          /*
           * Student and assignment identity are intentionally
           * preserved after the checks above.
           */
          score,
          totalMarks,
          percentage,

          type:
            "ASSIGNMENT",

          examId:
            null,
        },

        select: {
          id: true,
        },
      })
    : await tx.result.create({
        data: {
          studentId:
            normalizedStudentId,

          type:
            "ASSIGNMENT",

          assignmentId:
            assignment.id,

          examId:
            null,

          score,
          totalMarks,
          percentage,
        },

        select: {
          id: true,
        },
      });

  const invalidation =
    resultChanged
      ? await invalidateStudentReportCardWithTransaction({
          tx,

          studentId:
            normalizedStudentId,

          classId:
            assignment.lesson.classId,

          academicYear,
          termId,

          reason:
            `The assignment result for "${assignment.title}" changed after this report card was generated.`,
        })
      : {
          invalidatedCount: 0,
          reportCardIds: [],
        };

  return {
    resultId:
      result.id,

    resultChanged,

    percentage,

    invalidatedReportCardCount:
      invalidation.invalidatedCount,

    invalidatedReportCardIds:
      invalidation.reportCardIds,
  };
}