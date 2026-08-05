// src/lib/academic-engine/subject-performance.ts

import type {
  AcademicEngineOptions,
  StudentTermReport,
  SubjectClassPerformance,
  SubjectFinalResult,
  SubjectRankingSummary,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  calculateAverage,
  roundNumber,
} from "./numeric";

import {
  createSubjectRankings,
} from "./ranking";

/* -------------------------------------------------------------------------- */
/*                         SUBJECT RESULT GROUPING                             */
/* -------------------------------------------------------------------------- */

export type ClassSubjectResultGroup = {
  subjectId: number;

  subjectName: string;

  results: {
    student:
      StudentTermReport["student"];

    result:
      SubjectFinalResult;
  }[];
};

export function groupClassResultsBySubject(
  reports: StudentTermReport[],
): Map<
  number,
  ClassSubjectResultGroup
> {
  const grouped =
    new Map<
      number,
      ClassSubjectResultGroup
    >();

  for (const report of reports) {
    for (
      const subjectResult of
      report.subjects
    ) {
      const existing =
        grouped.get(
          subjectResult.subject.id,
        );

      const group =
        existing ?? {
          subjectId:
            subjectResult.subject.id,

          subjectName:
            subjectResult.subject.name,

          results: [],
        };

      group.results.push({
        student:
          report.student,

        result:
          subjectResult,
      });

      grouped.set(
        subjectResult.subject.id,
        group,
      );
    }
  }

  return grouped;
}

/* -------------------------------------------------------------------------- */
/*                      SUBJECT PERFORMANCE SUMMARY                            */
/* -------------------------------------------------------------------------- */

export function calculateSubjectClassPerformance({
  group,
  options = DEFAULT_ACADEMIC_ENGINE_OPTIONS,
}: {
  group: ClassSubjectResultGroup;

  options?: AcademicEngineOptions;
}): SubjectClassPerformance {
  const firstResult =
    group.results[0]?.result;

  const gradedResults =
    group.results
      .map(
        (entry) =>
          entry.result,
      )
      .filter(
        (result) =>
          result.calculationStatus ===
          "READY",
      );

  const scores =
    gradedResults.map(
      (result) =>
        result.finalScore,
    );

  const passCount =
    gradedResults.filter(
      (result) =>
        result.passed,
    ).length;

  const failCount =
    gradedResults.filter(
      (result) =>
        !result.passed,
    ).length;

  const passRate =
    gradedResults.length === 0
      ? null
      : roundNumber(
          (
            passCount /
            gradedResults.length
          ) * 100,

          options
            .roundingDecimalPlaces,
        );

  return {
    subject:
      firstResult?.subject ?? {
        id:
          group.subjectId,

        name:
          group.subjectName,
      },

    studentCount:
      group.results.length,

    gradedStudentCount:
      gradedResults.length,

    classAverage:
      calculateAverage(
        scores,

        options
          .roundingDecimalPlaces,
      ),

    highestScore:
      scores.length === 0
        ? null
        : roundNumber(
            Math.max(
              ...scores,
            ),

            options
              .roundingDecimalPlaces,
          ),

    lowestScore:
      scores.length === 0
        ? null
        : roundNumber(
            Math.min(
              ...scores,
            ),

            options
              .roundingDecimalPlaces,
          ),

    passCount,

    failCount,

    passRate,
  };
}

/* -------------------------------------------------------------------------- */
/*                      ALL SUBJECT PERFORMANCE                               */
/* -------------------------------------------------------------------------- */

export function buildSubjectPerformance({
  reports,
  options = DEFAULT_ACADEMIC_ENGINE_OPTIONS,
}: {
  reports: StudentTermReport[];

  options?: AcademicEngineOptions;
}): SubjectClassPerformance[] {
  const groups =
    groupClassResultsBySubject(
      reports,
    );

  return Array.from(
    groups.values(),
  )
    .map(
      (group) =>
        calculateSubjectClassPerformance({
          group,
          options,
        }),
    )
    .sort(
      (first, second) =>
        first.subject.name.localeCompare(
          second.subject.name,
        ),
    );
}

/* -------------------------------------------------------------------------- */
/*                       ALL SUBJECT RANKINGS                                  */
/* -------------------------------------------------------------------------- */

export function buildSubjectRankings({
  reports,
  options = DEFAULT_ACADEMIC_ENGINE_OPTIONS,
}: {
  reports: StudentTermReport[];

  options?: AcademicEngineOptions;
}): SubjectRankingSummary[] {
  const groups =
    groupClassResultsBySubject(
      reports,
    );

  return Array.from(
    groups.values(),
  )
    .map(
      (group) => ({
        subjectId:
          group.subjectId,

        subjectName:
          group.subjectName,

        rankings:
          createSubjectRankings({
            subjectResults:
              group.results,

            mode:
              options.rankingMode,

            decimalPlaces:
              options
                .roundingDecimalPlaces,
          }),
      }),
    )
    .sort(
      (first, second) =>
        first.subjectName.localeCompare(
          second.subjectName,
        ),
    );
}