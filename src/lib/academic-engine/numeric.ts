// src/lib/academic-engine/numeric.ts

import { ACADEMIC_ENGINE_LIMITS } from "./constants";

/* -------------------------------------------------------------------------- */
/*                              NUMBER CHECKS                                 */
/* -------------------------------------------------------------------------- */

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                                ROUNDING                                    */
/* -------------------------------------------------------------------------- */

export function normalizeDecimalPlaces(
    decimalPlaces: number
): number {
  if (
    !Number.isInteger(
        decimalPlaces
    )
) {
    return ACADEMIC_ENGINE_LIMITS.DEFAULT_DECIMAL_PLACES;
  }

  return Math.min(
    ACADEMIC_ENGINE_LIMITS.MAX_DECIMAL_PLACES,

    Math.max(
      ACADEMIC_ENGINE_LIMITS.MIN_DECIMAL_PLACES,

      decimalPlaces,
    ),
  );
}

export function roundNumber(
  value: number,
  decimalPlaces: number = 
    ACADEMIC_ENGINE_LIMITS.DEFAULT_DECIMAL_PLACES,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const safeDecimalPlaces
   = 
  normalizeDecimalPlaces(
    decimalPlaces
);

  const factor = 10 ** safeDecimalPlaces;

  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/* -------------------------------------------------------------------------- */
/*                                  CLAMPING                                  */
/* -------------------------------------------------------------------------- */

export function clampNumber({
  value,
  minimum,
  maximum,
}: {
  value: number;
  minimum: number;
  maximum: number;
}): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, value));
}

export function clampPercentage(value: number): number {
  return clampNumber({
    value,

    minimum: ACADEMIC_ENGINE_LIMITS.MIN_PERCENTAGE,

    maximum: ACADEMIC_ENGINE_LIMITS.MAX_PERCENTAGE,
  });
}

/* -------------------------------------------------------------------------- */
/*                              PERCENTAGES                                   */
/* -------------------------------------------------------------------------- */

export function calculatePercentage({
  score,
  totalMarks,
  decimalPlaces = ACADEMIC_ENGINE_LIMITS.DEFAULT_DECIMAL_PLACES,
  clamp = true,
}: {
  score: number;
  totalMarks: number;
  decimalPlaces?: number;
  clamp?: boolean;
}): number | null {
  if (
    !Number.isFinite(score) ||
    !Number.isFinite(totalMarks) ||
    totalMarks <= 0
  ) {
    return null;
  }

  const percentage = (score / totalMarks) * 100;

  const safePercentage = clamp ? clampPercentage(percentage) : percentage;

  return roundNumber(safePercentage, decimalPlaces);
}

export function normalizePercentage({
  percentage,
  score,
  totalMarks,
  decimalPlaces = ACADEMIC_ENGINE_LIMITS.DEFAULT_DECIMAL_PLACES,
  clamp = true,
}: {
  percentage?: number | null;
  score?: number | null;
  totalMarks?: number | null;
  decimalPlaces?: number;
  clamp?: boolean;
}): number | null {
  if (
    percentage !== null &&
    percentage !== undefined &&
    Number.isFinite(percentage)
  ) {
    const safePercentage = clamp ? clampPercentage(percentage) : percentage;

    return roundNumber(safePercentage, decimalPlaces);
  }

  if (
    score === null ||
    score === undefined ||
    totalMarks === null ||
    totalMarks === undefined
  ) {
    return null;
  }

  return calculatePercentage({
    score,
    totalMarks,
    decimalPlaces,
    clamp,
  });
}

/* -------------------------------------------------------------------------- */
/*                                AVERAGES                                    */
/* -------------------------------------------------------------------------- */

export function calculateAverage(
  values: number[],
  decimalPlaces: number = ACADEMIC_ENGINE_LIMITS.DEFAULT_DECIMAL_PLACES,
): number | null {
  const validValues = values.filter((value): value is number =>
    Number.isFinite(value),
  );

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce((sum, value) => sum + value, 0);

  return roundNumber(
    total / validValues.length,

    decimalPlaces,
  );
}

export function calculateSum(
  values: number[],
  decimalPlaces: number = 
    ACADEMIC_ENGINE_LIMITS.DEFAULT_DECIMAL_PLACES,
): number {
  return roundNumber(
    values
      .filter(
        (value): value is number => 
            Number.isFinite(value)
    )
      .reduce((sum, value) => 
        sum + value, 
      0
    ),

    decimalPlaces,
  );
}

/* -------------------------------------------------------------------------- */
/*                              COMPARISONS                                   */
/* -------------------------------------------------------------------------- */

export function approximatelyEqual({
  first,
  second,
  tolerance = ACADEMIC_ENGINE_LIMITS.FLOAT_TOLERANCE,
}: {
  first: number;
  second: number;
  tolerance?: number;
}): boolean {
  return Math.abs(first - second) <= tolerance;
}

export function percentageIsValid(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= ACADEMIC_ENGINE_LIMITS.MIN_PERCENTAGE &&
    value <= ACADEMIC_ENGINE_LIMITS.MAX_PERCENTAGE
  );
}
