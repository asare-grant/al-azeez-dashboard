// src/lib/academic-engine/constants.ts

import type {
  AcademicEngineOptions,
} from "./types";

export const ACADEMIC_ENGINE_LIMITS = {
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,

  MIN_DECIMAL_PLACES: 0,
  MAX_DECIMAL_PLACES: 6,

  DEFAULT_DECIMAL_PLACES: 2,

  FLOAT_TOLERANCE: 0.0001,
} as const;

export const DEFAULT_ACADEMIC_ENGINE_OPTIONS: AcademicEngineOptions =
  {
    roundingDecimalPlaces:
      ACADEMIC_ENGINE_LIMITS.DEFAULT_DECIMAL_PLACES,

    rankingMode:
      "COMPETITION",

    requireEveryWeightedCategory:
      true,

    excludeIncompleteSubjectsFromAverage:
      true,

    clampFinalScores:
      true,
    
    normalizeAvailableWeights:
      false,
  };