// src/lib/academic-engine/student-term-summary.ts

import type {
  AcademicEngineOptions,
  StudentTermSummary,
  SubjectFinalResult,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  calculateAverage,
  calculateSum,
  roundNumber,
} from "./numeric";

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

export function subjectIsComplete(
  subject: SubjectFinalResult,
): boolean {
  return (
    subject.calculationStatus ===
    "READY"
  );
}

export function subjectIsIncomplete(
  subject: SubjectFinalResult,
): boolean {
  return (
    subject.calculationStatus !==
    "READY"
  );
}

export function getSubjectsIncludedInAverage({
  subjects,
  excludeIncompleteSubjects,
}: {
  subjects: SubjectFinalResult[];

  excludeIncompleteSubjects: boolean;
}): SubjectFinalResult[] {
  if (!excludeIncompleteSubjects) {
    return subjects;
  }

  return subjects.filter(
    subjectIsComplete,
  );
}

/* -------------------------------------------------------------------------- */
/*                       GRADE-POINT CALCULATION                              */
/* -------------------------------------------------------------------------- */

function calculateGradePointSummary(
  subjects: SubjectFinalResult[],
  decimalPlaces: number,
): {
  totalGradePoints: number | null;
  averageGradePoint: number | null;
} {
  const gradePoints =
    subjects
      .map(
        (subject) =>
          subject.gradePoint,
      )
      .filter(
        (
          gradePoint,
        ): gradePoint is number =>
          gradePoint !== null &&
          Number.isFinite(
            gradePoint,
          ),
      );

  if (gradePoints.length === 0) {
    return {
      totalGradePoints: null,
      averageGradePoint: null,
    };
  }

  return {
    totalGradePoints:
      calculateSum(
        gradePoints,
        decimalPlaces,
      ),

    averageGradePoint:
      calculateAverage(
        gradePoints,
        decimalPlaces,
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT TERM SUMMARY                               */
/* -------------------------------------------------------------------------- */

export function calculateStudentTermSummary(
  subjects: SubjectFinalResult[],

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): StudentTermSummary {
  const completeSubjects =
    subjects.filter(
      subjectIsComplete,
    );

  const incompleteSubjects =
    subjects.filter(
      subjectIsIncomplete,
    );

  const subjectsIncludedInAverage =
    getSubjectsIncludedInAverage({
      subjects,

      excludeIncompleteSubjects:
        options
          .excludeIncompleteSubjectsFromAverage,
    });

  const includedScores =
    subjectsIncludedInAverage.map(
      (subject) =>
        subject.finalScore,
    );

  const totalScore =
    calculateSum(
      includedScores,
      options.roundingDecimalPlaces,
    );

  const averageScore =
    calculateAverage(
      includedScores,
      options.roundingDecimalPlaces,
    );

  const passedSubjectCount =
    completeSubjects.filter(
      (subject) =>
        subject.passed,
    ).length;

  const failedSubjectCount =
    completeSubjects.filter(
      (subject) =>
        !subject.passed,
    ).length;

  const passRate =
    completeSubjects.length === 0
      ? null
      : roundNumber(
          (passedSubjectCount /
            completeSubjects.length) *
            100,

          options.roundingDecimalPlaces,
        );

  const gradePointSummary =
    calculateGradePointSummary(
      completeSubjects,
      options.roundingDecimalPlaces,
    );

  return {
    subjectCount:
      subjects.length,

    completedSubjectCount:
      completeSubjects.length,

    incompleteSubjectCount:
      incompleteSubjects.length,

    totalScore,

    averageScore,

    highestSubjectScore:
      includedScores.length === 0
        ? null
        : roundNumber(
            Math.max(
              ...includedScores,
            ),

            options.roundingDecimalPlaces,
          ),

    lowestSubjectScore:
      includedScores.length === 0
        ? null
        : roundNumber(
            Math.min(
              ...includedScores,
            ),

            options.roundingDecimalPlaces,
          ),

    passedSubjectCount,

    failedSubjectCount,

    passRate,

    totalGradePoints:
      gradePointSummary
        .totalGradePoints,

    averageGradePoint:
      gradePointSummary
        .averageGradePoint,
  };
}