// src/lib/academic-engine/ranking.ts

import type {
  AcademicEngineRankingMode,
  ClassRankingEntry,
  StudentTermReport,
  SubjectFinalResult,
  SubjectRankingEntry,
} from "./types";

import {
  approximatelyEqual,
  roundNumber,
} from "./numeric";

/* -------------------------------------------------------------------------- */
/*                              GENERIC TYPES                                 */
/* -------------------------------------------------------------------------- */

type RankableValue<T> = {
  item: T;
  score: number;
};

type RankedValue<T> = {
  item: T;

  score: number;

  position: number;

  tied: boolean;
};

/* -------------------------------------------------------------------------- */
/*                          GENERIC RANKING ENGINE                             */
/* -------------------------------------------------------------------------- */

export function rankValues<T>({
  values,
  mode = "COMPETITION",
  tolerance = 0.0001,
}: {
  values: RankableValue<T>[];

  mode?: AcademicEngineRankingMode;

  tolerance?: number;
}): RankedValue<T>[] {
  const sorted = [...values]
    .filter(
      (entry) =>
        Number.isFinite(
          entry.score,
        ),
    )
    .sort(
      (first, second) =>
        second.score -
        first.score,
    );

  if (sorted.length === 0) {
    return [];
  }

  const ranked: RankedValue<T>[] =
    [];

  let previousScore:
    | number
    | null = null;

  let previousPosition = 0;

  let densePosition = 0;

  for (
    let index = 0;
    index < sorted.length;
    index++
  ) {
    const current =
      sorted[index];

    const tiedWithPrevious =
      previousScore !== null &&
      approximatelyEqual({
        first:
          current.score,

        second:
          previousScore,

        tolerance,
      });

    let position: number;

    if (tiedWithPrevious) {
      position =
        previousPosition;
    } else if (
      mode === "DENSE"
    ) {
      densePosition += 1;

      position =
        densePosition;
    } else {
      /*
       * Competition ranking:
       *
       * 1, 2, 2, 4
       */
      position =
        index + 1;
    }

    ranked.push({
      item:
        current.item,

      score:
        current.score,

      position,

      tied: false,
    });

    previousScore =
      current.score;

    previousPosition =
      position;
  }

  /*
   * Mark all entries sharing a position
   * as tied.
   */
  const positionCounts =
    new Map<number, number>();

  for (const entry of ranked) {
    positionCounts.set(
      entry.position,

      (
        positionCounts.get(
          entry.position,
        ) ?? 0
      ) + 1,
    );
  }

  return ranked.map(
    (entry) => ({
      ...entry,

      tied:
        (
          positionCounts.get(
            entry.position,
          ) ?? 0
        ) > 1,
    }),
  );
}

/* -------------------------------------------------------------------------- */
/*                         OVERALL CLASS RANKING                               */
/* -------------------------------------------------------------------------- */

export function createClassRankings({
  reports,
  mode = "COMPETITION",
  decimalPlaces = 2,
}: {
  reports: StudentTermReport[];

  mode?: AcademicEngineRankingMode;

  decimalPlaces?: number;
}): ClassRankingEntry[] {
  /*
   * Only complete reports should receive
   * official class positions.
   */
  const rankableReports =
    reports.filter(
      (report) =>
        report.calculationStatus ===
          "READY" &&
        report.summary
          .averageScore !== null,
    );

  const ranked =
    rankValues({
      values:
        rankableReports.map(
          (report) => ({
            item: report,

            score:
              report.summary
                .averageScore!,
          }),
        ),

      mode,
    });

  return ranked.map(
    ({
      item: report,
      score,
      position,
      tied,
    }) => ({
      studentId:
        report.student.id,

      studentName:
        `${report.student.name} ${report.student.surname}`.trim(),

      averageScore:
        roundNumber(
          score,
          decimalPlaces,
        ),

      totalScore:
        report.summary
          .totalScore,

      completedSubjectCount:
        report.summary
          .completedSubjectCount,

      position,

      tied,
    }),
  );
}

/* -------------------------------------------------------------------------- */
/*                           SUBJECT RANKING                                   */
/* -------------------------------------------------------------------------- */

export function createSubjectRankings({
  subjectResults,
  mode = "COMPETITION",
  decimalPlaces = 2,
}: {
  subjectResults: {
    student: StudentTermReport["student"];
    result: SubjectFinalResult;
  }[];

  mode?: AcademicEngineRankingMode;

  decimalPlaces?: number;
}): SubjectRankingEntry[] {
  const rankableResults =
    subjectResults.filter(
      ({ result }) =>
        result.calculationStatus ===
        "READY" &&
        Number.isFinite(
          result.finalScore,
        ),
    );

  const ranked =
    rankValues({
      values:
        rankableResults.map(
          (entry) => ({
            item: entry,

            score:
              entry.result.finalScore,
          }),
        ),

      mode,
    });

  return ranked.map(
    ({
      item,
      score,
      position,
      tied,
    }) => ({
      studentId:
        item.student.id,

      studentName:
        `${item.student.name} ${item.student.surname}`.trim(),

      subjectId:
        item.result.subject.id,

      score:
        roundNumber(
          score,
          decimalPlaces,
        ),

      position,

      tied,
    }),
  );
}