// src/lib/academic-engine/subject-score.ts

import type {
  AcademicEngineCalculationStatus,
  AcademicEngineOptions,
  AcademicWeightingRule,
  SubjectCategoryBreakdown,
  SubjectWeightedBreakdown,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  approximatelyEqual,
  clampPercentage,
  roundNumber,
} from "./numeric";

import {
  calculateWeightedCategoryScore,
  categoryCarriesWeight,
  isValidCategoryWeight,
} from "./weighted-category";

import {
  buildSubjectCategoryIssues,
} from "./subject-issues";

/* -------------------------------------------------------------------------- */
/*                                TYPES                                       */
/* -------------------------------------------------------------------------- */

export type SubjectScoreCalculationInput = {
  categories: SubjectCategoryBreakdown;

  weighting: AcademicWeightingRule;
};

export type SubjectScoreCalculationResult = {
  weighted: SubjectWeightedBreakdown;

  finalScore: number;

  configuredTotalWeight: number;

  availableWeight: number;

  effectiveTotalWeight: number;

  calculationStatus:
    AcademicEngineCalculationStatus;

  issues: ReturnType<
    typeof buildSubjectCategoryIssues
  >;
};

/* -------------------------------------------------------------------------- */
/*                        WEIGHTING VALIDATION                                 */
/* -------------------------------------------------------------------------- */

export function calculateConfiguredWeightTotal(
  weighting: Pick<
    AcademicWeightingRule,
    | "assignmentWeight"
    | "assessmentWeight"
    | "examWeight"
  >,
): number {
  return roundNumber(
    weighting.assignmentWeight +
      weighting.assessmentWeight +
      weighting.examWeight,

    2,
  );
}

export function weightingIsValid(
  weighting: Pick<
    AcademicWeightingRule,
    | "assignmentWeight"
    | "assessmentWeight"
    | "examWeight"
  >,
): boolean {
  const weights = [
    weighting.assignmentWeight,
    weighting.assessmentWeight,
    weighting.examWeight,
  ];

  return (
    weights.every(
      isValidCategoryWeight,
    ) &&
    approximatelyEqual({
      first:
        calculateConfiguredWeightTotal(
          weighting,
        ),

      second: 100,

      tolerance: 0.01,
    })
  );
}

/* -------------------------------------------------------------------------- */
/*                         AVAILABLE WEIGHT                                   */
/* -------------------------------------------------------------------------- */

function calculateAvailableWeight({
  categories,
  weighting,
}: SubjectScoreCalculationInput): number {
  let availableWeight = 0;

  if (
    categoryCarriesWeight(
      weighting.assignmentWeight,
    ) &&
    categories.assignment.status ===
      "COMPLETE" &&
    categories.assignment.percentage !==
      null
  ) {
    availableWeight +=
      weighting.assignmentWeight;
  }

  if (
    categoryCarriesWeight(
      weighting.assessmentWeight,
    ) &&
    categories.assessment.status ===
      "COMPLETE" &&
    categories.assessment.percentage !==
      null
  ) {
    availableWeight +=
      weighting.assessmentWeight;
  }

  if (
    categoryCarriesWeight(
      weighting.examWeight,
    ) &&
    categories.examination.status ===
      "COMPLETE" &&
    categories.examination.percentage !==
      null
  ) {
    availableWeight +=
      weighting.examWeight;
  }

  return roundNumber(
    availableWeight,
    2,
  );
}

/* -------------------------------------------------------------------------- */
/*                           EFFECTIVE WEIGHT                                 */
/* -------------------------------------------------------------------------- */

function calculateEffectiveWeight({
  configuredWeight,
  availableWeight,
  normalizeAvailableWeights,
  categoryAvailable,
}: {
  configuredWeight: number;
  availableWeight: number;
  normalizeAvailableWeights: boolean;
  categoryAvailable: boolean;
}): number {
  if (
    !categoryAvailable ||
    configuredWeight <= 0
  ) {
    return 0;
  }

  if (
    !normalizeAvailableWeights ||
    availableWeight <= 0 ||
    approximatelyEqual({
      first:
        availableWeight,

      second: 100,

      tolerance: 0.01,
    })
  ) {
    return configuredWeight;
  }

  return roundNumber(
    (configuredWeight /
      availableWeight) *
      100,

    6,
  );
}

/* -------------------------------------------------------------------------- */
/*                        CALCULATION STATUS                                   */
/* -------------------------------------------------------------------------- */

function resolveSubjectCalculationStatus({
  validWeighting,
  availableWeight,
  configuredTotalWeight,
  requiredCategoryErrors,
}: {
  validWeighting: boolean;
  availableWeight: number;
  configuredTotalWeight: number;
  requiredCategoryErrors: boolean;
}): AcademicEngineCalculationStatus {
  if (
    !validWeighting ||
    availableWeight <= 0
  ) {
    return "BLOCKED";
  }

  if (
    requiredCategoryErrors
  ) {
    return "BLOCKED";
  }

  if (
    approximatelyEqual({
      first:
        availableWeight,

      second:
        configuredTotalWeight,

      tolerance: 0.01,
    })
  ) {
    return "READY";
  }

  return "PARTIAL";
}

/* -------------------------------------------------------------------------- */
/*                         SUBJECT SCORE ENGINE                                */
/* -------------------------------------------------------------------------- */

export function calculateSubjectScore(
  input: SubjectScoreCalculationInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): SubjectScoreCalculationResult {
  const {
    categories,
    weighting,
  } = input;

  const configuredTotalWeight =
    calculateConfiguredWeightTotal(
      weighting,
    );

  const validWeighting =
    weightingIsValid(
      weighting,
    );

  const issues =
    buildSubjectCategoryIssues({
      categories,

      weights: {
        assignmentWeight:
          weighting.assignmentWeight,

        assessmentWeight:
          weighting.assessmentWeight,

        examWeight:
          weighting.examWeight,
      },

      requireEveryWeightedCategory:
        options.requireEveryWeightedCategory,
    });

  if (!validWeighting) {
    issues.unshift({
      code:
        approximatelyEqual({
          first:
            configuredTotalWeight,

          second: 100,

          tolerance: 0.01,
        })
          ? "INVALID_WEIGHTING"
          : "WEIGHTS_DO_NOT_TOTAL_100",

      message:
        approximatelyEqual({
          first:
            configuredTotalWeight,

          second: 100,

          tolerance: 0.01,
        })
          ? "One or more category weights are invalid."
          : `The configured category weights total ${configuredTotalWeight}% instead of 100%.`,

      severity:
        "ERROR",
    });
  }

  const availableWeight =
    calculateAvailableWeight(
      input,
    );

  const assignmentAvailable =
    categories.assignment.status ===
      "COMPLETE" &&
    categories.assignment.percentage !==
      null;

  const assessmentAvailable =
    categories.assessment.status ===
      "COMPLETE" &&
    categories.assessment.percentage !==
      null;

  const examinationAvailable =
    categories.examination.status ===
      "COMPLETE" &&
    categories.examination.percentage !==
      null;

  const assignmentEffectiveWeight =
    calculateEffectiveWeight({
      configuredWeight:
        weighting.assignmentWeight,

      availableWeight,

      normalizeAvailableWeights:
        options.normalizeAvailableWeights,

      categoryAvailable:
        assignmentAvailable,
    });

  const assessmentEffectiveWeight =
    calculateEffectiveWeight({
      configuredWeight:
        weighting.assessmentWeight,

      availableWeight,

      normalizeAvailableWeights:
        options.normalizeAvailableWeights,

      categoryAvailable:
        assessmentAvailable,
    });

  const examinationEffectiveWeight =
    calculateEffectiveWeight({
      configuredWeight:
        weighting.examWeight,

      availableWeight,

      normalizeAvailableWeights:
        options.normalizeAvailableWeights,

      categoryAvailable:
        examinationAvailable,
    });

  const weighted:
    SubjectWeightedBreakdown =
    {
      assignment:
        calculateWeightedCategoryScore(
          {
            category:
              "ASSIGNMENT",

            summary:
              categories.assignment,

            weight:
              weighting.assignmentWeight,

            effectiveWeight:
              assignmentEffectiveWeight,
          },

          options,
        ),

      assessment:
        calculateWeightedCategoryScore(
          {
            category:
              "ASSESSMENT",

            summary:
              categories.assessment,

            weight:
              weighting.assessmentWeight,

            effectiveWeight:
              assessmentEffectiveWeight,
          },

          options,
        ),

      examination:
        calculateWeightedCategoryScore(
          {
            category:
              "EXAM",

            summary:
              categories.examination,

            weight:
              weighting.examWeight,

            effectiveWeight:
              examinationEffectiveWeight,
          },

          options,
        ),
    };

  const rawFinalScore =
    weighted.assignment
      .weightedScore +
    weighted.assessment
      .weightedScore +
    weighted.examination
      .weightedScore;

  const finalScore =
    roundNumber(
      options.clampFinalScores
        ? clampPercentage(
            rawFinalScore,
          )
        : rawFinalScore,

      options.roundingDecimalPlaces,
    );

  const effectiveTotalWeight =
    roundNumber(
      weighted.assignment
        .effectiveWeight +
        weighted.assessment
          .effectiveWeight +
        weighted.examination
          .effectiveWeight,

      2,
    );

  const requiredCategoryErrors =
    issues.some(
      (issue) =>
        issue.severity ===
          "ERROR" &&
        (
          issue.code ===
            "MISSING_REQUIRED_CATEGORY" ||
          issue.code ===
            "INVALID_RESULT_PERCENTAGE"
        ),
    );

  const calculationStatus =
    resolveSubjectCalculationStatus({
      validWeighting,

      availableWeight,

      configuredTotalWeight,

      requiredCategoryErrors,
    });

  return {
    weighted,

    finalScore,

    configuredTotalWeight,

    availableWeight,

    effectiveTotalWeight,

    calculationStatus,

    issues,
  };
}