// src/lib/academic-engine/weighting-snapshot.ts

import type {
  AcademicEngineSubmissionStrategy,
  AcademicWeightingRule,
  AcademicWeightingSnapshot,
} from "./types";

import {
  calculateConfiguredWeightTotal,
} from "./subject-score";

function resolveAssignmentStrategy(
  weighting: AcademicWeightingRule,
): AcademicEngineSubmissionStrategy {
  return (
    weighting.assignmentScoreStrategy ??
    "AVERAGE"
  );
}

function resolveExaminationStrategy(
  weighting: AcademicWeightingRule,
): AcademicEngineSubmissionStrategy {
  return (
    weighting.examinationScoreStrategy ??
    "LATEST"
  );
}

export function createAcademicWeightingSnapshot(
  weighting: AcademicWeightingRule,
): AcademicWeightingSnapshot {
  return {
    weightingId:
      weighting.id,

    academicYear:
      weighting.academicYear,

    termId:
      weighting.termId,

    gradeId:
      weighting.gradeId,

    assignmentWeight:
      weighting.assignmentWeight,

    assessmentWeight:
      weighting.assessmentWeight,

    examWeight:
      weighting.examWeight,

    assessmentScoreStrategy:
      weighting.assessmentScoreStrategy,

    assignmentScoreStrategy:
      resolveAssignmentStrategy(
        weighting,
      ),

    examinationScoreStrategy:
      resolveExaminationStrategy(
        weighting,
      ),

    passMark:
      weighting.passMark,

    totalWeight:
      calculateConfiguredWeightTotal(
        weighting,
      ),
  };
}