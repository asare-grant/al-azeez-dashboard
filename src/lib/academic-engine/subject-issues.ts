// src/lib/academic-engine/subject-issues.ts

import type {
  AcademicResultCategory,
  CategoryScoreSummary,
  SubjectCalculationIssue,
  SubjectCategoryBreakdown,
} from "./types";

type CategoryConfiguration = {
  category: AcademicResultCategory;
  label: string;
  weight: number;
  summary: CategoryScoreSummary;
};

export function buildSubjectCategoryIssues({
  categories,
  weights,
  requireEveryWeightedCategory,
}: {
  categories: SubjectCategoryBreakdown;

  weights: {
    assignmentWeight: number;
    assessmentWeight: number;
    examWeight: number;
  };

  requireEveryWeightedCategory: boolean;
}): SubjectCalculationIssue[] {
  const configurations: CategoryConfiguration[] =
    [
      {
        category:
          "ASSIGNMENT",

        label:
          "Assignment",

        weight:
          weights.assignmentWeight,

        summary:
          categories.assignment,
      },

      {
        category:
          "ASSESSMENT",

        label:
          "Assessment",

        weight:
          weights.assessmentWeight,

        summary:
          categories.assessment,
      },

      {
        category:
          "EXAM",

        label:
          "Examination",

        weight:
          weights.examWeight,

        summary:
          categories.examination,
      },
    ];

  const issues:
    SubjectCalculationIssue[] =
    [];

  for (
    const configuration of
    configurations
  ) {
    const {
      category,
      label,
      weight,
      summary,
    } = configuration;

    if (weight <= 0) {
      continue;
    }

    if (
      summary.status ===
      "MISSING"
    ) {
      issues.push({
        code:
          category === "ASSIGNMENT"
            ? "NO_ASSIGNMENT_RESULT"
            : category ===
                "ASSESSMENT"
              ? "NO_ASSESSMENT_RESULT"
              : "NO_EXAM_RESULT",

        message:
          `${label} carries ${weight}% but no result has been recorded.`,

        severity:
          requireEveryWeightedCategory
            ? "ERROR"
            : "WARNING",

        category,
      });

      if (
        requireEveryWeightedCategory
      ) {
        issues.push({
          code:
            "MISSING_REQUIRED_CATEGORY",

          message:
            `${label} is required before this subject result can be completed.`,

          severity:
            "ERROR",

          category,
        });
      }

      continue;
    }

    if (
      summary.status ===
      "UNUSABLE"
    ) {
      issues.push({
        code:
          "INVALID_RESULT_PERCENTAGE",

        message:
          `${label} records exist, but none can be used for calculation.`,

        severity:
          requireEveryWeightedCategory
            ? "ERROR"
            : "WARNING",

        category,
      });
    }
  }

  return issues;
}