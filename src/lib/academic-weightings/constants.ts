// src/lib/academic-weightings/constants.ts

export const ACADEMIC_WEIGHTING_LIMITS = {
  MIN_WEIGHT: 0,
  MAX_WEIGHT: 100,
  REQUIRED_TOTAL_WEIGHT: 100,

  MIN_PASS_MARK: 0,
  MAX_PASS_MARK: 100,

  MIN_SCORE: 0,
  MAX_SCORE: 100,

  MIN_BOUNDARIES: 1,
  MAX_BOUNDARIES: 20,

  ACADEMIC_YEAR_MAX_LENGTH: 20,

  WEIGHT_TOLERANCE: 0.01,
} as const;

export const DEFAULT_ACADEMIC_WEIGHTING = {
  assignmentWeight: 0,
  assessmentWeight: 30,
  examWeight: 70,

  assessmentScoreStrategy:
    "AVERAGE" as const,

  passMark: 50,
  isActive: true,
} as const;