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

export type ExamResultSyncInput = {
  tx: Prisma.TransactionClient;

  /*
   * Present when editing an existing result.
   */
  resultId?: number;

  studentId: string;

  examId: number;

  score: number;

  totalMarks: number;
};

export type ExamResultSyncResult = {
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
    !Number.isFinite(
      score,
    ) ||
    score < 0
  ) {
    throw new Error(
      "The examination score is invalid.",
    );
  }

  if (
    !Number.isFinite(
      totalMarks,
    ) ||
    totalMarks <= 0
  ) {
    throw new Error(
      "The examination total marks are invalid.",
    );
  }

  if (
    score >
    totalMarks
  ) {
    throw new Error(
      "The examination score cannot be greater than the total marks.",
    );
  }

  return roundNumber(
    (
      score /
      totalMarks
    ) *
      100,
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
    return (
      first !==
      second
    );
  }

  return (
    Math.abs(
      first -
        second,
    ) >
    tolerance
  );
}

/* -------------------------------------------------------------------------- */
/*                           EXAM RESULT SYNC                                 */
/* -------------------------------------------------------------------------- */

export async function syncExamResult({
  tx,
  resultId,
  studentId,
  examId,
  score,
  totalMarks,
}: ExamResultSyncInput): Promise<ExamResultSyncResult> {
  const normalizedStudentId =
    studentId.trim();

  if (
    !normalizedStudentId
  ) {
    throw new Error(
      "The student could not be resolved.",
    );
  }

  if (
    !Number.isInteger(
      examId,
    ) ||
    examId <= 0
  ) {
    throw new Error(
      "The examination could not be resolved.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                              LOAD EXAM                                 */
  /* ---------------------------------------------------------------------- */

  const exam =
    await tx.exam.findUnique({
      where: {
        id:
          examId,
      },

      select: {
        id: true,

        title: true,

        academicYear:
          true,

        termId:
          true,

        lesson: {
          select: {
            id: true,

            classId:
              true,

            subjectId:
              true,
          },
        },
      },
    });

  if (!exam) {
    throw new Error(
      "The selected examination could not be found.",
    );
  }

  const academicYear =
    exam.academicYear
      ?.trim();

  const termId =
    exam.termId;

  if (
    !academicYear
  ) {
    throw new Error(
      "The examination does not have an academic year.",
    );
  }

  if (
    !termId ||
    !Number.isInteger(
      termId,
    ) ||
    termId <= 0
  ) {
    throw new Error(
      "The examination does not have a valid school term.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                        VERIFY STUDENT CLASS                            */
  /* ---------------------------------------------------------------------- */

  const student =
    await tx.student.findFirst({
      where: {
        id:
          normalizedStudentId,

        classId:
          exam.lesson.classId,
      },

      select: {
        id: true,
      },
    });

  if (!student) {
    throw new Error(
      "The selected student does not belong to the examination class.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                         CALCULATE PERCENTAGE                           */
  /* ---------------------------------------------------------------------- */

  const percentage =
    calculatePercentage({
      score,
      totalMarks,
    });

  /* ---------------------------------------------------------------------- */
  /*                           LOAD RESULT                                  */
  /* ---------------------------------------------------------------------- */

  const existingResult =
    resultId !==
    undefined
      ? await tx.result.findUnique({
          where: {
            id:
              resultId,
          },

          select: {
            id: true,

            type:
              true,

            studentId:
              true,

            examId:
              true,

            score:
              true,

            totalMarks:
              true,

            percentage:
              true,
          },
        })
      : await tx.result.findFirst({
          where: {
            studentId:
              normalizedStudentId,

            examId:
              exam.id,

            type:
              "EXAM",
          },

          select: {
            id: true,

            type:
              true,

            studentId:
              true,

            examId:
              true,

            score:
              true,

            totalMarks:
              true,

            percentage:
              true,
          },
        });

  /* ---------------------------------------------------------------------- */
  /*                           VALIDATE EDIT                                */
  /* ---------------------------------------------------------------------- */

  if (
    resultId !==
      undefined &&
    !existingResult
  ) {
    throw new Error(
      "The examination result could not be found.",
    );
  }

  if (
    resultId !==
      undefined &&
    existingResult?.type !==
      "EXAM"
  ) {
    throw new Error(
      "The selected result is not an examination result.",
    );
  }

  if (
    resultId !==
      undefined &&
    existingResult &&
    (
      existingResult.studentId !==
        normalizedStudentId ||
      existingResult.examId !==
        exam.id
    )
  ) {
    throw new Error(
      "The examination result does not match the selected student and examination.",
    );
  }

  /*
   * Creation must never silently overwrite an existing
   * student-exam result.
   */
  if (
    resultId ===
      undefined &&
    existingResult
  ) {
    throw new Error(
      "This student already has a result for the selected examination. Edit the existing result instead.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                           CHANGE DETECTION                             */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /*                           RESULT MUTATION                              */
  /* ---------------------------------------------------------------------- */

  const result =
    resultId !==
    undefined
      ? await tx.result.update({
          where: {
            id:
              resultId,
          },

          data: {
            score,

            totalMarks,

            percentage,

            type:
              "EXAM",

            /*
             * Keep the result source unambiguous.
             */
            assignmentId:
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
              "EXAM",

            examId:
              exam.id,

            assignmentId:
              null,

            score,

            totalMarks,

            percentage,
          },

          select: {
            id: true,
          },
        });

  /* ---------------------------------------------------------------------- */
  /*                       REPORT INVALIDATION                              */
  /* ---------------------------------------------------------------------- */

  const invalidation =
    resultChanged
      ? await invalidateStudentReportCardWithTransaction({
          tx,

          studentId:
            normalizedStudentId,

          classId:
            exam.lesson.classId,

          academicYear,

          termId,

          reason:
            `The examination result for "${exam.title}" changed after this report card was generated.`,
        })
      : {
          invalidatedCount:
            0,

          reportCardIds:
            [],
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