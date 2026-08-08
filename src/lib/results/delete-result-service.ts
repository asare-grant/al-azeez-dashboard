import "server-only";

import type { Prisma } from "@prisma/client";

import { invalidateStudentReportCardWithTransaction } from "@/lib/report-cards/invalidation-service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type DeleteAcademicResultInput = {
  tx: Prisma.TransactionClient;

  resultId: number;
};

export type DeleteAcademicResultResult = {
  resultId: number;

  resultType: "EXAM" | "ASSIGNMENT" | "ASSESSMENT";

  invalidatedReportCardCount: number;

  invalidatedReportCardIds: number[];
};

/* -------------------------------------------------------------------------- */
/*                       DELETE ACADEMIC RESULT                               */
/* -------------------------------------------------------------------------- */

export async function deleteAcademicResultWithTransaction({
  tx,
  resultId,
}: DeleteAcademicResultInput): Promise<DeleteAcademicResultResult> {
  if (!Number.isInteger(resultId) || resultId <= 0) {
    throw new Error("The result ID is invalid.");
  }

  /* ---------------------------------------------------------------------- */
  /*                          LOAD RESULT SOURCE                            */
  /* ---------------------------------------------------------------------- */

  const result = await tx.result.findUnique({
    where: {
      id: resultId,
    },

    select: {
      id: true,

      type: true,

      studentId: true,

      examId: true,

      assignmentId: true,

      assessmentId: true,

      assessmentAttemptId: true,

      exam: {
        select: {
          id: true,

          title: true,

          academicYear: true,

          termId: true,

          lesson: {
            select: {
              classId: true,
            },
          },
        },
      },

      assignment: {
        select: {
          id: true,

          title: true,

          academicYear: true,

          termId: true,

          lesson: {
            select: {
              classId: true,
            },
          },
        },
      },
      assessment: {
        select: {
          id: true,

          title: true,

          academicYear: true,

          termId: true,

          lesson: {
            select: {
              classId: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new Error("The result could not be found.");
  }

  /* ---------------------------------------------------------------------- */
  /*                    RESOLVE ACADEMIC PERIOD                             */
  /* ---------------------------------------------------------------------- */

  let classId: number;

  let academicYear: string;

  let termId: number;

  let reason: string;

  let resultType: "EXAM" | "ASSIGNMENT" | "ASSESSMENT";

  /* ---------------------------------------------------------------------- */
  /*                         EXAMINATION RESULT                             */
  /* ---------------------------------------------------------------------- */

  if (result.type === "EXAM") {
    if (!result.exam) {
      throw new Error(
        "The examination linked to this result could not be found.",
      );
    }

    const normalizedAcademicYear = result.exam.academicYear?.trim();

    if (!normalizedAcademicYear) {
      throw new Error("The examination does not have an academic year.");
    }

    if (
      !result.exam.termId ||
      !Number.isInteger(result.exam.termId) ||
      result.exam.termId <= 0
    ) {
      throw new Error("The examination does not have a valid school term.");
    }

    classId = result.exam.lesson.classId;

    academicYear = normalizedAcademicYear;

    termId = result.exam.termId;

    resultType = "EXAM";

    reason = `The examination result for "${result.exam.title}" was deleted after this report card was generated.`;
  } else if (result.type === "ASSIGNMENT") {
    /* ---------------------------------------------------------------------- */
    /*                           ASSIGNMENT RESULT                            */
    /* ---------------------------------------------------------------------- */
    if (!result.assignment) {
      throw new Error(
        "The assignment linked to this result could not be found.",
      );
    }

    const normalizedAcademicYear = result.assignment.academicYear?.trim();

    if (!normalizedAcademicYear) {
      throw new Error("The assignment does not have an academic year.");
    }

    if (
      !result.assignment.termId ||
      !Number.isInteger(result.assignment.termId) ||
      result.assignment.termId <= 0
    ) {
      throw new Error("The assignment does not have a valid school term.");
    }

    classId = result.assignment.lesson.classId;

    academicYear = normalizedAcademicYear;

    termId = result.assignment.termId;

    resultType = "ASSIGNMENT";

    reason = `The assignment result for "${result.assignment.title}" was deleted after this report card was generated.`;
  } 
  /* ---------------------------------------------------------------------- */
/*                           ASSESSMENT RESULT                            */
/* ---------------------------------------------------------------------- */

else if (
  result.type ===
  "ASSESSMENT"
) {
  if (
    !result.assessment
  ) {
    throw new Error(
      "The assessment linked to this result could not be found.",
    );
  }

  const normalizedAcademicYear =
    result.assessment.academicYear
      ?.trim();

  if (
    !normalizedAcademicYear
  ) {
    throw new Error(
      "The assessment does not have an academic year.",
    );
  }

  if (
    !result.assessment.termId ||
    !Number.isInteger(
      result.assessment.termId,
    ) ||
    result.assessment.termId <=
      0
  ) {
    throw new Error(
      "The assessment does not have a valid school term.",
    );
  }

  classId =
    result.assessment.lesson.classId;

  academicYear =
    normalizedAcademicYear;

  termId =
    result.assessment.termId;

  resultType =
    "ASSESSMENT";

  reason =
    `The assessment result for "${result.assessment.title}" was deleted after this report card was generated.`;
}
  else {
    /* ---------------------------------------------------------------------- */
    /*                         UNSUPPORTED TYPE                               */
    /* ---------------------------------------------------------------------- */
    throw new Error(
      "This result type is not supported by the academic result deletion service.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                            DELETE RESULT                               */
  /* ---------------------------------------------------------------------- */

  await tx.result.delete({
    where: {
      id: result.id,
    },
  });

  /* ---------------------------------------------------------------------- */
  /*                         INVALIDATE REPORT                              */
  /* ---------------------------------------------------------------------- */

  const invalidation = await invalidateStudentReportCardWithTransaction({
    tx,

    studentId: result.studentId,

    classId,

    academicYear,

    termId,

    reason,
  });

  return {
    resultId: result.id,

    resultType,

    invalidatedReportCardCount: invalidation.invalidatedCount,

    invalidatedReportCardIds: invalidation.reportCardIds,
  };
}
