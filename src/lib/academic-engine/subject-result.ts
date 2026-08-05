// src/lib/academic-engine/subject-result.ts

import type {
  AcademicEngineCalculationStatus,
  AcademicEngineOptions,
  SubjectCalculationInput,
  SubjectCalculationIssue,
  SubjectFinalResult,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  aggregateSubjectCategories,
} from "./subject-category-aggregation";

import {
  calculateSubjectScore,
} from "./subject-score";

import {
  createAcademicWeightingSnapshot,
} from "./weighting-snapshot";

import {
  resolveAcademicGrade,
} from "./grading-scale";

/* -------------------------------------------------------------------------- */
/*                          HELPER FUNCTIONS                                  */
/* -------------------------------------------------------------------------- */

function getClassId(
  input: SubjectCalculationInput,
): number {
  return (
    input.period.class?.id ??
    input.student.class.id
  );
}

function createBlockedGradeValues() {
  return {
    grade: "N/A",

    remark:
      "Subject result is incomplete.",

    gradePoint: null,

    passed: false,
  };
}

function combineCalculationStatus({
  scoreStatus,
  hasGradeResolutionError,
}: {
  scoreStatus:
    AcademicEngineCalculationStatus;

  hasGradeResolutionError:
    boolean;
}): AcademicEngineCalculationStatus {
  if (
    scoreStatus === "BLOCKED" ||
    hasGradeResolutionError
  ) {
    return "BLOCKED";
  }

  return scoreStatus;
}

/* -------------------------------------------------------------------------- */
/*                     COMPLETE SUBJECT RESULT BUILDER                        */
/* -------------------------------------------------------------------------- */

export function buildSubjectFinalResult(
  input: SubjectCalculationInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): SubjectFinalResult {
  const {
    student,
    subject,
    period,
    weighting,
    gradingScale,
    assignments,
    assessments,
    examinations,
  } = input;

  const assignmentStrategy =
    weighting.assignmentScoreStrategy ??
    "AVERAGE";

  const examinationStrategy =
    weighting.examinationScoreStrategy ??
    "LATEST";

  const categories =
    aggregateSubjectCategories(
      {
        assignments,

        assessments,

        examinations,

        assignmentStrategy,

        assessmentStrategy:
          weighting.assessmentScoreStrategy,

        examinationStrategy,
      },

      options,
    );

  const scoreCalculation =
    calculateSubjectScore(
      {
        categories,
        weighting,
      },

      options,
    );

  const issues:
    SubjectCalculationIssue[] = [
      ...scoreCalculation.issues,
    ];

  /*
   * Do not assign an official grade to a blocked
   * subject calculation.
   */
  const shouldResolveGrade =
    scoreCalculation.calculationStatus !==
    "BLOCKED";

  const gradeResolution =
    shouldResolveGrade
      ? resolveAcademicGrade(
          {
            score:
              scoreCalculation.finalScore,

            gradingScale,

            passMark:
              weighting.passMark,
          },

          options,
        )
      : null;

  if (
    gradeResolution &&
    !gradeResolution.success
  ) {
    issues.push({
      code:
        "NO_GRADING_BOUNDARY",

      message:
        gradeResolution.errors
          .map(
            (error) =>
              error.message,
          )
          .join(" "),

      severity:
        "ERROR",
    });
  }

  const gradeValues =
    gradeResolution?.success
      ? {
          grade:
            gradeResolution.data
              .grade,

          remark:
            gradeResolution.data
              .remark,

          gradePoint:
            gradeResolution.data
              .gradePoint,

          passed:
            gradeResolution.data
              .passed,
        }
      : createBlockedGradeValues();

  const hasGradeResolutionError =
    Boolean(
      gradeResolution &&
        !gradeResolution.success,
    );

  const calculationStatus =
    combineCalculationStatus({
      scoreStatus:
        scoreCalculation.calculationStatus,

      hasGradeResolutionError,
    });

  return {
    studentId:
      student.id,

    subject,

    academicYear:
      period.academicYear,

    termId:
      period.term.id,

    gradeId:
      period.grade.id,

    classId:
      getClassId(input),

    categories,

    weighted:
      scoreCalculation.weighted,

    finalScore:
      scoreCalculation.finalScore,

    totalAvailableWeight:
      scoreCalculation.availableWeight,

    grade:
      gradeValues.grade,

    remark:
      gradeValues.remark,

    gradePoint:
      gradeValues.gradePoint,

    passed:
      gradeValues.passed,

    calculationStatus,

    issues,

    weightingSnapshot:
      createAcademicWeightingSnapshot(
        weighting,
      ),

    gradingScaleSnapshot: {
      gradingScaleId:
        gradingScale.id,

      gradingScaleName:
        gradingScale.name,

      boundary:
        gradeResolution?.success
          ? {
              ...gradeResolution.boundary,
            }
          : null,
    },
  };
}



export type BuildSubjectFinalResultOutcome =
  | {
      success: true;

      data: SubjectFinalResult;

      warnings:
        SubjectCalculationIssue[];
    }
  | {
      success: false;

      data: SubjectFinalResult;

      message: string;

      errors:
        SubjectCalculationIssue[];
    };

export function calculateCompleteSubjectResult(
  input: SubjectCalculationInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): BuildSubjectFinalResultOutcome {
  const result =
    buildSubjectFinalResult(
      input,
      options,
    );

  const errors =
    result.issues.filter(
      (issue) =>
        issue.severity ===
        "ERROR",
    );

  const warnings =
    result.issues.filter(
      (issue) =>
        issue.severity ===
        "WARNING",
    );

  if (
    result.calculationStatus ===
      "BLOCKED" ||
    errors.length > 0
  ) {
    return {
      success: false,

      data: result,

      message:
        errors[0]?.message ??
        "The subject result could not be completed.",

      errors,
    };
  }

  return {
    success: true,

    data: result,

    warnings,
  };
}