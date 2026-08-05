// src/lib/academic-engine/category-status.ts

import type {
  AcademicEngineResultStatus,
  CategoryScoreSummary,
  SubjectCategoryBreakdown,
} from "./types";

export function categoryIsComplete(
  category: CategoryScoreSummary,
): boolean {
  return (
    category.status ===
      "COMPLETE" &&
    category.percentage !== null
  );
}

export function categoryIsMissing(
  category: CategoryScoreSummary,
): boolean {
  return (
    category.status ===
    "MISSING"
  );
}

export function categoryIsUnusable(
  category: CategoryScoreSummary,
): boolean {
  return (
    category.status ===
    "UNUSABLE"
  );
}

export function getCategoryStatuses(
  breakdown: SubjectCategoryBreakdown,
): Record<
  "assignment" |
    "assessment" |
    "examination",
  AcademicEngineResultStatus
> {
  return {
    assignment:
      breakdown.assignment.status,

    assessment:
      breakdown.assessment.status,

    examination:
      breakdown.examination.status,
  };
}

export function getIncompleteCategories(
  breakdown: SubjectCategoryBreakdown,
): CategoryScoreSummary[] {
  return [
    breakdown.assignment,
    breakdown.assessment,
    breakdown.examination,
  ].filter(
    (category) =>
      category.status !==
      "COMPLETE",
  );
}

export function subjectCategoriesAreComplete(
  breakdown: SubjectCategoryBreakdown,
): boolean {
  return (
    categoryIsComplete(
      breakdown.assignment,
    ) &&
    categoryIsComplete(
      breakdown.assessment,
    ) &&
    categoryIsComplete(
      breakdown.examination,
    )
  );
}