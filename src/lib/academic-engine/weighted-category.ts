// src/lib/academic-engine/weighted-category.ts

import type {
  AcademicEngineOptions,
  AcademicResultCategory,
  CategoryScoreSummary,
  WeightedCategoryScore,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  clampPercentage,
  roundNumber,
} from "./numeric";

/* -------------------------------------------------------------------------- */
/*                                TYPES                                       */
/* -------------------------------------------------------------------------- */

export type CalculateWeightedCategoryInput = {
  category: AcademicResultCategory;

  summary: CategoryScoreSummary;

  weight: number;

  /**
   * Used when available weights are being rescaled.
   *
   * Example:
   * Original weight = 30
   * Available total weight = 30
   * Effective weight becomes 100
   */
  effectiveWeight?: number;
};

/* -------------------------------------------------------------------------- */
/*                           WEIGHT VALIDATION                                 */
/* -------------------------------------------------------------------------- */

export function isValidCategoryWeight(
  weight: number,
): boolean {
  return (
    Number.isFinite(weight) &&
    weight >= 0 &&
    weight <= 100
  );
}

export function categoryCarriesWeight(
  weight: number,
): boolean {
  return (
    isValidCategoryWeight(weight) &&
    weight > 0
  );
}

/* -------------------------------------------------------------------------- */
/*                        WEIGHTED CATEGORY SCORE                              */
/* -------------------------------------------------------------------------- */

export function calculateWeightedCategoryScore(
  {
    category,
    summary,
    weight,
    effectiveWeight = weight,
  }: CalculateWeightedCategoryInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): WeightedCategoryScore {
  const validWeight =
    isValidCategoryWeight(weight);

  const validEffectiveWeight =
    isValidCategoryWeight(
      effectiveWeight,
    );

  const available =
    summary.status ===
      "COMPLETE" &&
    summary.percentage !== null &&
    Number.isFinite(
      summary.percentage,
    );

  const includedInFinalScore =
    validWeight &&
    validEffectiveWeight &&
    effectiveWeight > 0 &&
    available;

  if (!includedInFinalScore) {
    return {
      category,

      rawPercentage:
        summary.percentage,

      weight:
        validWeight
          ? weight
          : 0,

      effectiveWeight:
        validEffectiveWeight
          ? effectiveWeight
          : 0,

      weightedScore: 0,

      available,

      includedInFinalScore:
        false,
    };
  }

  const rawPercentage =
    options.clampFinalScores
      ? clampPercentage(
          summary.percentage!,
        )
      : summary.percentage!;

  const weightedScore =
    roundNumber(
      rawPercentage *
        (effectiveWeight / 100),

      options.roundingDecimalPlaces,
    );

  return {
    category,

    rawPercentage,

    weight,

    effectiveWeight,

    weightedScore,

    available: true,

    includedInFinalScore:
      true,
  };
}