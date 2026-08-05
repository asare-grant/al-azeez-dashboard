// src/lib/academic-weightings/utils.ts

import type {
  GradeBoundaryInput,
} from "./types";

import {
  ACADEMIC_WEIGHTING_LIMITS,
} from "./constants";

/* -------------------------------------------------------------------------- */
/*                             WEIGHT UTILITIES                                */
/* -------------------------------------------------------------------------- */

export function calculateWeightTotal({
  assignmentWeight,
  assessmentWeight,
  examWeight,
}: {
  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;
}) {
  return Number(
    (
      assignmentWeight +
      assessmentWeight +
      examWeight
    ).toFixed(2),
  );
}

export function isValidWeightTotal({
  assignmentWeight,
  assessmentWeight,
  examWeight,
}: {
  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;
}) {
  const total =
    calculateWeightTotal({
      assignmentWeight,
      assessmentWeight,
      examWeight,
    });

  return (
    Math.abs(
      total -
        ACADEMIC_WEIGHTING_LIMITS
          .REQUIRED_TOTAL_WEIGHT,
    ) <=
    ACADEMIC_WEIGHTING_LIMITS
      .WEIGHT_TOLERANCE
  );
}

export function convertWeightToFactor(
  weight: number,
) {
  return weight / 100;
}

export function calculateWeightedScore({
  percentage,
  weight,
}: {
  percentage: number;
  weight: number;
}) {
  return Number(
    (
      percentage *
      convertWeightToFactor(
        weight,
      )
    ).toFixed(2),
  );
}

/* -------------------------------------------------------------------------- */
/*                          ACADEMIC-YEAR UTILITIES                            */
/* -------------------------------------------------------------------------- */

export function deriveAcademicYear(
  date: Date,
) {
  const year =
    date.getFullYear();

  const startYear =
    date.getMonth() >= 7
      ? year
      : year - 1;

  return `${startYear}/${startYear + 1}`;
}

export function getAcademicYearRange({
  startYear,
  count = 5,
}: {
  startYear: number;
  count?: number;
}) {
  return Array.from(
    {
      length: Math.max(
        1,
        count,
      ),
    },
    (_, index) => {
      const year =
        startYear - index;

      return `${year}/${year + 1}`;
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                         GRADING-SCALE UTILITIES                             */
/* -------------------------------------------------------------------------- */

export function normalizeGradeBoundaries(
  boundaries: GradeBoundaryInput[],
): GradeBoundaryInput[] {
  return [...boundaries]
    .sort(
      (
        first,
        second,
      ) =>
        second.minimumScore -
        first.minimumScore,
    )
    .map(
      (
        boundary,
        index,
      ) => ({
        ...boundary,

        grade:
          boundary.grade
            .trim()
            .toUpperCase(),

        remark:
          boundary.remark
            .trim(),

        position:
          index,
      }),
    );
}

export function findGradeBoundary({
  score,
  boundaries,
}: {
  score: number;
  boundaries: GradeBoundaryInput[];
}) {
  const normalizedScore =
    Math.min(
      ACADEMIC_WEIGHTING_LIMITS
        .MAX_SCORE,
      Math.max(
        ACADEMIC_WEIGHTING_LIMITS
          .MIN_SCORE,
        score,
      ),
    );

  return (
    boundaries.find(
      (boundary) =>
        normalizedScore >=
          boundary.minimumScore &&
        normalizedScore <=
          boundary.maximumScore,
    ) ?? null
  );
}

export function getGradeForScore({
  score,
  boundaries,
}: {
  score: number;
  boundaries: GradeBoundaryInput[];
}) {
  const boundary =
    findGradeBoundary({
      score,
      boundaries,
    });

  return {
    grade:
      boundary?.grade ?? null,

    remark:
      boundary?.remark ?? null,

    gradePoint:
      boundary?.gradePoint ??
      null,
  };
}