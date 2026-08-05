import type {
  AcademicWeightingInput,
} from "./types";

import {
  DEFAULT_ACADEMIC_WEIGHTING,
} from "./constants";

import {
  deriveAcademicYear,
} from "./utils";

export function createEmptyAcademicWeighting({
  defaultGradingScaleId,
  defaultTermId,
  defaultGradeId,
}: {
  defaultGradingScaleId?: number;
  defaultTermId?: number;
  defaultGradeId?: number;
} = {}): AcademicWeightingInput {
  return {
    academicYear:
      deriveAcademicYear(
        new Date(),
      ),

    termId:
      defaultTermId ?? 0,

    gradeId:
      defaultGradeId ?? 0,

    gradingScaleId:
      defaultGradingScaleId ?? 0,

    assignmentWeight:
      DEFAULT_ACADEMIC_WEIGHTING
        .assignmentWeight,

    assessmentWeight:
      DEFAULT_ACADEMIC_WEIGHTING
        .assessmentWeight,

    examWeight:
      DEFAULT_ACADEMIC_WEIGHTING
        .examWeight,

    assessmentScoreStrategy:
      DEFAULT_ACADEMIC_WEIGHTING
        .assessmentScoreStrategy,

    passMark:
      DEFAULT_ACADEMIC_WEIGHTING
        .passMark,

    isActive:
      DEFAULT_ACADEMIC_WEIGHTING
        .isActive,
  };
}