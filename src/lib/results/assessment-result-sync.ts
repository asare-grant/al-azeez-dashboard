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

export type AssessmentResultSyncInput = {
  tx: Prisma.TransactionClient;

  assessmentId: number;

  assessmentAttemptId: number;

  studentId: string;

  score: number;

  totalMarks: number;

  percentage: number;

  grade: string;

  remarks: string;
};

export type AssessmentResultSyncResult = {
  resultId: number;

  resultChanged: boolean;

  invalidatedReportCardCount: number;

  invalidatedReportCardIds: number[];
};

/* -------------------------------------------------------------------------- */
/*                              NUMBER HELPERS                                */
/* -------------------------------------------------------------------------- */

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
/*                         ASSESSMENT RESULT SYNC                             */
/* -------------------------------------------------------------------------- */

export async function syncAssessmentResult({
  tx,

  assessmentId,

  assessmentAttemptId,

  studentId,

  score,

  totalMarks,

  percentage,

  grade,

  remarks,
}: AssessmentResultSyncInput): Promise<AssessmentResultSyncResult> {
  const normalizedStudentId =
    studentId.trim();

  if (!normalizedStudentId) {
    throw new Error(
      "The student could not be resolved.",
    );
  }

  if (
    !Number.isInteger(
      assessmentId,
    ) ||
    assessmentId <= 0
  ) {
    throw new Error(
      "The assessment could not be resolved.",
    );
  }

  if (
    !Number.isInteger(
      assessmentAttemptId,
    ) ||
    assessmentAttemptId <= 0
  ) {
    throw new Error(
      "The assessment attempt could not be resolved.",
    );
  }

  if (
    !Number.isFinite(
      score,
    ) ||
    score < 0
  ) {
    throw new Error(
      "The assessment score is invalid.",
    );
  }

  if (
    !Number.isFinite(
      totalMarks,
    ) ||
    totalMarks <= 0
  ) {
    throw new Error(
      "The assessment total marks are invalid.",
    );
  }

  if (
    score >
    totalMarks
  ) {
    throw new Error(
      "The assessment score cannot be greater than the total marks.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                      RESOLVE ASSESSMENT PERIOD                         */
  /* ---------------------------------------------------------------------- */

  const assessment =
    await tx.assessment.findUnique({
      where: {
        id:
          assessmentId,
      },

      select: {
        id: true,

        title:
          true,

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

  if (!assessment) {
    throw new Error(
      "The selected assessment could not be found.",
    );
  }

  const academicYear =
    assessment.academicYear
      ?.trim();

  if (!academicYear) {
    throw new Error(
      "The assessment does not have an academic year.",
    );
  }

  const termId =
    assessment.termId;

  if (
    !termId ||
    !Number.isInteger(
      termId,
    ) ||
    termId <= 0
  ) {
    throw new Error(
      "The assessment does not have a valid school term.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                       VERIFY ATTEMPT IDENTITY                          */
  /* ---------------------------------------------------------------------- */

  const attempt =
    await tx.assessmentAttempt.findFirst({
      where: {
        id:
          assessmentAttemptId,

        assessmentId:
          assessment.id,

        studentId:
          normalizedStudentId,
      },

      select: {
        id: true,
      },
    });

  if (!attempt) {
    throw new Error(
      "The assessment attempt does not match the selected assessment and student.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                       VERIFY STUDENT CLASS                             */
  /* ---------------------------------------------------------------------- */

  const student =
    await tx.student.findFirst({
      where: {
        id:
          normalizedStudentId,

        classId:
          assessment.lesson.classId,
      },

      select: {
        id: true,
      },
    });

  if (!student) {
    throw new Error(
      "The selected student does not belong to the assessment class.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                         EXISTING RESULT                                */
  /* ---------------------------------------------------------------------- */

  const existingResult =
    await tx.result.findUnique({
      where: {
        assessmentAttemptId:
          assessmentAttemptId,
      },

      select: {
        id: true,

        type: true,

        studentId: true,

        assessmentId: true,

        assessmentAttemptId:
          true,

        score: true,

        totalMarks: true,

        percentage: true,

        grade: true,

        remarks: true,
      },
    });

  if (
    existingResult &&
    existingResult.type !==
      "ASSESSMENT"
  ) {
    throw new Error(
      "The existing result linked to this attempt is not an assessment result.",
    );
  }

  if (
    existingResult &&
    (
      existingResult.studentId !==
        normalizedStudentId ||
      existingResult.assessmentId !==
        assessment.id ||
      existingResult.assessmentAttemptId !==
        assessmentAttemptId
    )
  ) {
    throw new Error(
      "The existing assessment result does not match this submission.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                         CHANGE DETECTION                               */
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
    ) ||
    existingResult.grade !==
      grade ||
    existingResult.remarks !==
      remarks;

  /* ---------------------------------------------------------------------- */
  /*                           RESULT UPSERT                                */
  /* ---------------------------------------------------------------------- */

  const result =
    await tx.result.upsert({
      where: {
        assessmentAttemptId:
          assessmentAttemptId,
      },

      create: {
        score,

        totalMarks,

        percentage,

        grade,

        remarks,

        type:
          "ASSESSMENT",

        assessmentId:
          assessment.id,

        assessmentAttemptId,

        studentId:
          normalizedStudentId,

        /*
         * Keep source identity unambiguous.
         */
        examId:
          null,

        assignmentId:
          null,
      },

      update: {
        score,

        totalMarks,

        percentage,

        grade,

        remarks,

        type:
          "ASSESSMENT",

        assessmentId:
          assessment.id,

        studentId:
          normalizedStudentId,

        examId:
          null,

        assignmentId:
          null,
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
            assessment.lesson.classId,

          academicYear,

          termId,

          reason:
            `The assessment result for "${assessment.title}" changed after this report card was generated.`,
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

    invalidatedReportCardCount:
      invalidation.invalidatedCount,

    invalidatedReportCardIds:
      invalidation.reportCardIds,
  };
}