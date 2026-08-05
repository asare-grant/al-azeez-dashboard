// src/lib/academic-engine/class-term-report.ts

import type {
  AcademicEngineCalculationStatus,
  AcademicEngineOptions,
  ClassRankingEntry,
  ClassTermCalculationInput,
  ClassTermReport,
  RankedSubjectResult,
  StudentTermReport,
  SubjectRankingSummary,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  buildStudentTermReport,
} from "./student-term-report";

import {
  calculateAverage,
  roundNumber,
} from "./numeric";

import {
  createClassRankings,
} from "./ranking";

import {
  buildSubjectPerformance,
  buildSubjectRankings,
} from "./subject-performance";

import {
  buildClassReportIssues,
} from "./class-report-issues";

/* -------------------------------------------------------------------------- */
/*                          RANKING LOOKUPS                                   */
/* -------------------------------------------------------------------------- */

function createOverallRankingLookup(
  rankings: ClassRankingEntry[],
): Map<
  string,
  ClassRankingEntry
> {
  return new Map(
    rankings.map(
      (ranking) => [
        ranking.studentId,
        ranking,
      ],
    ),
  );
}

function createSubjectRankingLookup(
  subjectRankings:
    SubjectRankingSummary[],
): Map<
  number,
  Map<
    string,
    {
      position: number;
      tied: boolean;
    }
  >
> {
  const lookup =
    new Map<
      number,
      Map<
        string,
        {
          position: number;
          tied: boolean;
        }
      >
    >();

  for (
    const subject of
    subjectRankings
  ) {
    lookup.set(
      subject.subjectId,

      new Map(
        subject.rankings.map(
          (ranking) => [
            ranking.studentId,

            {
              position:
                ranking.position,

              tied:
                ranking.tied,
            },
          ],
        ),
      ),
    );
  }

  return lookup;
}

/* -------------------------------------------------------------------------- */
/*                       PERFORMANCE LOOKUPS                                  */
/* -------------------------------------------------------------------------- */

function createSubjectPerformanceLookup(
  performance:
    ClassTermReport["subjectPerformance"],
) {
  return new Map(
    performance.map(
      (subject) => [
        subject.subject.id,
        subject,
      ],
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                        APPLY SUBJECT RANKINGS                               */
/* -------------------------------------------------------------------------- */

function applySubjectStatistics({
  report,
  subjectRankingLookup,
  subjectPerformanceLookup,
}: {
  report: StudentTermReport;

  subjectRankingLookup:
    ReturnType<
      typeof createSubjectRankingLookup
    >;

  subjectPerformanceLookup:
    ReturnType<
      typeof createSubjectPerformanceLookup
    >;
}): RankedSubjectResult[] {
  return report.subjects.map(
    (subject) => {
      const ranking =
        subjectRankingLookup
          .get(
            subject.subject.id,
          )
          ?.get(
            report.student.id,
          );

      const performance =
        subjectPerformanceLookup.get(
          subject.subject.id,
        );

      return {
        ...subject,

        position:
          ranking?.position ??
          null,

        classAverage:
          performance
            ?.classAverage ??
          null,

        highestScore:
          performance
            ?.highestScore ??
          null,

        lowestScore:
          performance
            ?.lowestScore ??
          null,
      };
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                           CLASS STATUS                                     */
/* -------------------------------------------------------------------------- */

function resolveClassReportStatus({
  reports,
  hasErrors,
}: {
  reports: StudentTermReport[];

  hasErrors: boolean;
}): AcademicEngineCalculationStatus {
  if (hasErrors) {
    return "BLOCKED";
  }

  if (
    reports.some(
      (report) =>
        report.calculationStatus ===
        "BLOCKED",
    )
  ) {
    return "PARTIAL";
  }

  if (
    reports.some(
      (report) =>
        report.calculationStatus ===
        "PARTIAL",
    )
  ) {
    return "PARTIAL";
  }

  return "READY";
}

/* -------------------------------------------------------------------------- */
/*                         CLASS TERM REPORT                                  */
/* -------------------------------------------------------------------------- */

export function buildClassTermReport(
  input: ClassTermCalculationInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): ClassTermReport {
  const classStudentCount =
    input.students.length;

  /*
   * Each student input may already contain the shared
   * period, weighting and grading scale. We override
   * them with the class-level values to guarantee that
   * every report uses the same academic configuration.
   */
  const draftReports =
    input.students.map(
      (studentInput) =>
        buildStudentTermReport(
          {
            ...studentInput,

            period:
              input.period,

            weighting:
              input.weighting,

            gradingScale:
              input.gradingScale,

            classStudentCount,
          },

          options,
        ),
    );

  const rankings =
    createClassRankings({
      reports:
        draftReports,

      mode:
        options.rankingMode,

      decimalPlaces:
        options
          .roundingDecimalPlaces,
    });

  const subjectPerformance =
    buildSubjectPerformance({
      reports:
        draftReports,

      options,
    });

  const subjectRankings =
    buildSubjectRankings({
      reports:
        draftReports,

      options,
    });

  const overallRankingLookup =
    createOverallRankingLookup(
      rankings,
    );

  const subjectRankingLookup =
    createSubjectRankingLookup(
      subjectRankings,
    );

  const subjectPerformanceLookup =
    createSubjectPerformanceLookup(
      subjectPerformance,
    );

  const reports =
    draftReports.map(
      (report) => ({
        ...report,

        overallPosition:
          overallRankingLookup.get(
            report.student.id,
          )?.position ?? null,

        classStudentCount,

        subjects:
          applySubjectStatistics({
            report,

            subjectRankingLookup,

            subjectPerformanceLookup,
          }),
      }),
    );

  const rankedAverages =
    reports
      .filter(
        (report) =>
          report.calculationStatus ===
            "READY" &&
          report.summary
            .averageScore !== null,
      )
      .map(
        (report) =>
          report.summary
            .averageScore!,
      );

  const classAverage =
    calculateAverage(
      rankedAverages,

      options
        .roundingDecimalPlaces,
    );

  const highestAverage =
    rankedAverages.length === 0
      ? null
      : roundNumber(
          Math.max(
            ...rankedAverages,
          ),

          options
            .roundingDecimalPlaces,
        );

  const lowestAverage =
    rankedAverages.length === 0
      ? null
      : roundNumber(
          Math.min(
            ...rankedAverages,
          ),

          options
            .roundingDecimalPlaces,
        );

  /*
   * Official class pass/fail counts use only complete
   * student reports.
   */
  const completeReports =
    reports.filter(
      (report) =>
        report.calculationStatus ===
          "READY" &&
        report.summary
          .averageScore !== null,
    );

  const passCount =
    completeReports.filter(
      (report) =>
        report.summary
          .averageScore! >=
        input.weighting.passMark,
    ).length;

  const failCount =
    completeReports.length -
    passCount;

  const passRate =
    completeReports.length === 0
      ? null
      : roundNumber(
          (
            passCount /
            completeReports.length
          ) * 100,

          options
            .roundingDecimalPlaces,
        );

  const issues =
    buildClassReportIssues({
      period:
        input.period,

      reports,
    });

  const hasErrors =
    issues.some(
      (issue) =>
        issue.severity ===
        "ERROR",
    );

  return {
    period:
      input.period,

    students:
      reports,

    rankings,

    subjectRankings,

    classAverage,

    highestAverage,

    lowestAverage,

    passCount,

    failCount,

    passRate,

    subjectPerformance,

    calculationStatus:
      resolveClassReportStatus({
        reports,
        hasErrors,
      }),

    issues,

    generatedAt:
      new Date(),
  };
}



export type BuildClassTermReportOutcome =
  | {
      success: true;

      data: ClassTermReport;

      warnings:
        ClassTermReport["issues"];
    }
  | {
      success: false;

      data: ClassTermReport;

      message: string;

      errors:
        ClassTermReport["issues"];
    };

export function calculateCompleteClassTermReport(
  input: ClassTermCalculationInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): BuildClassTermReportOutcome {
  const report =
    buildClassTermReport(
      input,
      options,
    );

  const errors =
    report.issues.filter(
      (issue) =>
        issue.severity ===
        "ERROR",
    );

  const warnings =
    report.issues.filter(
      (issue) =>
        issue.severity ===
        "WARNING",
    );

  if (
    report.calculationStatus ===
      "BLOCKED" ||
    errors.length > 0
  ) {
    return {
      success: false,

      data:
        report,

      message:
        errors[0]?.message ??
        "The class term report could not be completed.",

      errors,
    };
  }

  return {
    success: true,

    data:
      report,

    warnings,
  };
}