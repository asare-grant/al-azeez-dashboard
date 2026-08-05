// src/lib/academic-engine/normalize-result.ts

import type {
  ResultType,
} from "@prisma/client";

import type {
  AcademicEngineOptions,
  AcademicEngineResultRecord,
  AcademicResultCategory,
  NormalizedAcademicResult,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  normalizePercentage,
  toFiniteNumber,
} from "./numeric";

/* -------------------------------------------------------------------------- */
/*                                 TYPES                                      */
/* -------------------------------------------------------------------------- */

export type ResultNormalizationIssueCode =
  | "INVALID_RESULT_TYPE"
  | "INVALID_RESULT_ID"
  | "MISSING_STUDENT_ID"
  | "INVALID_SUBJECT_ID"
  | "MISSING_SUBJECT_NAME"
  | "INVALID_SCORE"
  | "INVALID_TOTAL_MARKS"
  | "INVALID_PERCENTAGE"
  | "PERCENTAGE_UNAVAILABLE"
  | "INVALID_DATE";

export type ResultNormalizationIssue = {
  resultId: number | null;

  code:
    ResultNormalizationIssueCode;

  message: string;
};

export type NormalizeAcademicResultSuccess =
  {
    success: true;

    data:
      NormalizedAcademicResult;

    warnings:
      ResultNormalizationIssue[];
  };

export type NormalizeAcademicResultFailure =
  {
    success: false;

    resultId: number | null;

    errors:
      ResultNormalizationIssue[];
  };

export type NormalizeAcademicResultOutcome =
  | NormalizeAcademicResultSuccess
  | NormalizeAcademicResultFailure;

export type NormalizeAcademicResultsResult =
  {
    results:
      NormalizedAcademicResult[];

    rejected:
      {
        record:
          AcademicEngineResultRecord;

        errors:
          ResultNormalizationIssue[];
      }[];

    warnings:
      ResultNormalizationIssue[];

    acceptedCount: number;
    rejectedCount: number;
    totalCount: number;
  };

/* -------------------------------------------------------------------------- */
/*                            TYPE NORMALIZATION                              */
/* -------------------------------------------------------------------------- */

export function mapResultTypeToCategory(
  type: ResultType,
): AcademicResultCategory | null {
  switch (type) {
    case "ASSIGNMENT":
      return "ASSIGNMENT";

    case "ASSESSMENT":
      return "ASSESSMENT";

    case "EXAM":
      return "EXAM";

    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*                             DATE NORMALIZATION                             */
/* -------------------------------------------------------------------------- */

export function normalizeResultDate(
  value: Date | string,
): Date | null {
  const date =
    value instanceof Date
      ? new Date(
          value.getTime(),
        )
      : new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

/* -------------------------------------------------------------------------- */
/*                            SINGLE RESULT                                   */
/* -------------------------------------------------------------------------- */

export function normalizeAcademicResult(
  record:
    AcademicEngineResultRecord,
  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): NormalizeAcademicResultOutcome {
  const errors:
    ResultNormalizationIssue[] =
    [];

  const warnings:
    ResultNormalizationIssue[] =
    [];

  const resultId =
    Number.isInteger(record.id) &&
    record.id > 0
      ? record.id
      : null;

  if (!resultId) {
    errors.push({
      resultId: null,

      code:
        "INVALID_RESULT_ID",

      message:
        "The result record has an invalid identifier.",
    });
  }

  const category =
    mapResultTypeToCategory(
      record.type,
    );

  if (!category) {
    errors.push({
      resultId,

      code:
        "INVALID_RESULT_TYPE",

      message:
        `Result type "${String(
          record.type,
        )}" is not supported by the academic engine.`,
    });
  }

  const studentId =
    record.studentId?.trim();

  if (!studentId) {
    errors.push({
      resultId,

      code:
        "MISSING_STUDENT_ID",

      message:
        "The result does not belong to a valid student.",
    });
  }

  if (
    !Number.isInteger(
      record.subjectId,
    ) ||
    record.subjectId <= 0
  ) {
    errors.push({
      resultId,

      code:
        "INVALID_SUBJECT_ID",

      message:
        "The result does not contain a valid subject.",
    });
  }

  const subjectName =
    record.subjectName?.trim();

  if (!subjectName) {
    errors.push({
      resultId,

      code:
        "MISSING_SUBJECT_NAME",

      message:
        "The result does not contain a subject name.",
    });
  }

  const score =
    toFiniteNumber(
      record.score,
    );

  if (score === null) {
    errors.push({
      resultId,

      code:
        "INVALID_SCORE",

      message:
        "The result score is not a valid number.",
    });
  }

  const totalMarks =
    record.totalMarks ===
      null ||
    record.totalMarks ===
      undefined
      ? null
      : toFiniteNumber(
          record.totalMarks,
        );

  if (
    record.totalMarks !== null &&
    record.totalMarks !== undefined &&
    totalMarks === null
  ) {
    errors.push({
      resultId,

      code:
        "INVALID_TOTAL_MARKS",

      message:
        "The result total marks value is invalid.",
    });
  }

  if (
    totalMarks !== null &&
    totalMarks <= 0
  ) {
    errors.push({
      resultId,

      code:
        "INVALID_TOTAL_MARKS",

      message:
        "Total marks must be greater than zero.",
    });
  }

  const storedPercentage =
    record.percentage === null ||
    record.percentage ===
      undefined
      ? null
      : toFiniteNumber(
          record.percentage,
        );

  if (
    record.percentage !== null &&
    record.percentage !==
      undefined &&
    storedPercentage === null
  ) {
    warnings.push({
      resultId,

      code:
        "INVALID_PERCENTAGE",

      message:
        "The stored percentage was invalid, so the engine attempted to derive it from the score and total marks.",
    });
  }

  const percentage =
    normalizePercentage({
      percentage:
        storedPercentage,

      score,
      totalMarks,

      decimalPlaces:
        options
          .roundingDecimalPlaces,

      clamp:
        options
          .clampFinalScores,
    });

  if (percentage === null) {
    errors.push({
      resultId,

      code:
        "PERCENTAGE_UNAVAILABLE",

      message:
        "A percentage could not be calculated because both a valid percentage and valid total marks were unavailable.",
    });
  }

  const date =
    normalizeResultDate(
      record.date,
    );

  if (!date) {
    errors.push({
      resultId,

      code:
        "INVALID_DATE",

      message:
        "The result date is invalid.",
    });
  }

  if (
    errors.length > 0 ||
    !resultId ||
    !category ||
    !studentId ||
    !subjectName ||
    score === null ||
    percentage === null ||
    !date
  ) {
    return {
      success: false,

      resultId,

      errors,
    };
  }

  return {
    success: true,

    warnings,

    data: {
      id:
        resultId,

      type:
        category,

      studentId,

      subjectId:
        record.subjectId,

      subjectName,

      title:
        record.title?.trim() ||
        `${subjectName} ${category}`,

      rawScore:
        score,

      totalMarks,

      percentage,

      date,

      assignmentId:
        record.assignmentId ??
        null,

      assessmentId:
        record.assessmentId ??
        null,

      assessmentAttemptId:
        record.assessmentAttemptId ??
        null,

      examId:
        record.examId ??
        null,

      attemptNumber:
        record.attemptNumber ??
        null,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                            MULTIPLE RESULTS                                */
/* -------------------------------------------------------------------------- */

export function normalizeAcademicResults(
  records:
    AcademicEngineResultRecord[],
  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): NormalizeAcademicResultsResult {
  const results:
    NormalizedAcademicResult[] =
    [];

  const rejected:
    NormalizeAcademicResultsResult["rejected"] =
    [];

  const warnings:
    ResultNormalizationIssue[] =
    [];

  for (
    const record of records
  ) {
    const outcome =
      normalizeAcademicResult(
        record,
        options,
      );

    if (!outcome.success) {
      rejected.push({
        record,

        errors:
          outcome.errors,
      });

      continue;
    }

    results.push(
      outcome.data,
    );

    warnings.push(
      ...outcome.warnings,
    );
  }

  return {
    results,

    rejected,

    warnings,

    acceptedCount:
      results.length,

    rejectedCount:
      rejected.length,

    totalCount:
      records.length,
  };
}