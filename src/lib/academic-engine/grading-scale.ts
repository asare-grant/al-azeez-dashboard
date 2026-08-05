// src/lib/academic-engine/grading-scale.ts

import type {
  AcademicEngineOptions,
  AcademicGradeBoundary,
  AcademicGradeResolution,
  AcademicGradingScale,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  clampPercentage,
  roundNumber,
} from "./numeric";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type GradingScaleIssueCode =
  | "NO_BOUNDARIES"
  | "INVALID_BOUNDARY"
  | "OVERLAPPING_BOUNDARIES"
  | "DUPLICATE_GRADE"
  | "NO_MATCHING_BOUNDARY";

export type GradingScaleIssue = {
  code: GradingScaleIssueCode;

  message: string;

  boundaryId?: number;
  grade?: string;
};

export type GradingScaleValidationResult = {
  valid: boolean;

  boundaries: AcademicGradeBoundary[];

  errors: GradingScaleIssue[];
};

export type ResolveAcademicGradeInput = {
  score: number;

  gradingScale: AcademicGradingScale;

  passMark: number;
};

export type ResolveAcademicGradeResult =
  | {
      success: true;

      data: AcademicGradeResolution;

      boundary: AcademicGradeBoundary;

      warnings: GradingScaleIssue[];
    }
  | {
      success: false;

      score: number;

      errors: GradingScaleIssue[];
    };

/* -------------------------------------------------------------------------- */
/*                            BOUNDARY SORTING                                */
/* -------------------------------------------------------------------------- */

export function sortGradeBoundaries(
  boundaries: AcademicGradeBoundary[],
): AcademicGradeBoundary[] {
  return [...boundaries].sort(
    (first, second) => {
      const positionDifference =
        first.position -
        second.position;

      if (positionDifference !== 0) {
        return positionDifference;
      }

      const minimumDifference =
        second.minimumScore -
        first.minimumScore;

      if (minimumDifference !== 0) {
        return minimumDifference;
      }

      return (
        second.maximumScore -
        first.maximumScore
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                          BOUNDARY VALIDATION                               */
/* -------------------------------------------------------------------------- */

export function validateGradingScale(
  gradingScale: AcademicGradingScale,
): GradingScaleValidationResult {
  const boundaries =
    sortGradeBoundaries(
      gradingScale.boundaries,
    );

  const errors: GradingScaleIssue[] =
    [];

  if (boundaries.length === 0) {
    errors.push({
      code: "NO_BOUNDARIES",

      message:
        `The grading scale "${gradingScale.name}" does not contain any grade boundaries.`,
    });

    return {
      valid: false,
      boundaries,
      errors,
    };
  }

  const gradeLabels =
    new Set<string>();

  for (const boundary of boundaries) {
    const normalizedGrade =
      boundary.grade
        .trim()
        .toUpperCase();

    if (
      !normalizedGrade ||
      !Number.isFinite(
        boundary.minimumScore,
      ) ||
      !Number.isFinite(
        boundary.maximumScore,
      ) ||
      boundary.minimumScore < 0 ||
      boundary.maximumScore > 100 ||
      boundary.minimumScore >
        boundary.maximumScore
    ) {
      errors.push({
        code: "INVALID_BOUNDARY",

        message:
          `The boundary for grade "${boundary.grade || "Unnamed"}" is invalid.`,

        boundaryId:
          boundary.id,

        grade:
          boundary.grade,
      });
    }

    if (
      gradeLabels.has(
        normalizedGrade,
      )
    ) {
      errors.push({
        code: "DUPLICATE_GRADE",

        message:
          `The grade label "${boundary.grade}" appears more than once.`,

        boundaryId:
          boundary.id,

        grade:
          boundary.grade,
      });
    }

    gradeLabels.add(
      normalizedGrade,
    );
  }

  /*
   * Check every pair because boundaries may not
   * necessarily be stored in score order.
   */
  for (
    let firstIndex = 0;
    firstIndex <
    boundaries.length;
    firstIndex++
  ) {
    const first =
      boundaries[firstIndex];

    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex <
      boundaries.length;
      secondIndex++
    ) {
      const second =
        boundaries[secondIndex];

      const overlaps =
        first.minimumScore <=
          second.maximumScore &&
        second.minimumScore <=
          first.maximumScore;

      if (overlaps) {
        errors.push({
          code:
            "OVERLAPPING_BOUNDARIES",

          message:
            `Grade "${first.grade}" overlaps with grade "${second.grade}".`,

          boundaryId:
            second.id,

          grade:
            second.grade,
        });
      }
    }
  }

  return {
    valid:
      errors.length === 0,

    boundaries,

    errors,
  };
}

/* -------------------------------------------------------------------------- */
/*                          BOUNDARY MATCHING                                 */
/* -------------------------------------------------------------------------- */

export function findGradeBoundary({
  score,
  boundaries,
}: {
  score: number;
  boundaries: AcademicGradeBoundary[];
}): AcademicGradeBoundary | null {
  return (
    boundaries.find(
      (boundary) =>
        score >=
          boundary.minimumScore &&
        score <=
          boundary.maximumScore,
    ) ?? null
  );
}

/* -------------------------------------------------------------------------- */
/*                         GRADE RESOLUTION                                   */
/* -------------------------------------------------------------------------- */

export function resolveAcademicGrade(
  {
    score,
    gradingScale,
    passMark,
  }: ResolveAcademicGradeInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): ResolveAcademicGradeResult {
  const safeScore =
    roundNumber(
      options.clampFinalScores
        ? clampPercentage(score)
        : score,

      options.roundingDecimalPlaces,
    );

  const validation =
    validateGradingScale(
      gradingScale,
    );

  if (!validation.valid) {
    return {
      success: false,

      score: safeScore,

      errors:
        validation.errors,
    };
  }

  const boundary =
    findGradeBoundary({
      score: safeScore,

      boundaries:
        validation.boundaries,
    });

  if (!boundary) {
    return {
      success: false,

      score: safeScore,

      errors: [
        {
          code:
            "NO_MATCHING_BOUNDARY",

          message:
            `No grade boundary in "${gradingScale.name}" covers a score of ${safeScore}%.`,
        },
      ],
    };
  }

  const safePassMark =
    clampPercentage(
      Number.isFinite(passMark)
        ? passMark
        : 50,
    );

  return {
    success: true,

    boundary,

    warnings: [],

    data: {
      gradingScaleId:
        gradingScale.id,

      gradingScaleName:
        gradingScale.name,

      score:
        safeScore,

      grade:
        boundary.grade,

      remark:
        boundary.remark,

      gradePoint:
        boundary.gradePoint,

      minimumScore:
        boundary.minimumScore,

      maximumScore:
        boundary.maximumScore,

      /*
       * Passing is determined by the configured
       * academic weighting pass mark.
       *
       * The grade boundary supplies the grade,
       * remark and grade point.
       */
      passed:
        safeScore >=
        safePassMark,
    },
  };
}