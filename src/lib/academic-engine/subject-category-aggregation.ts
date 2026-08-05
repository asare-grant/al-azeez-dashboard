// src/lib/academic-engine/subject-category-aggregation.ts

import type {
  AcademicEngineOptions,
  AcademicEngineSubmissionStrategy,
  NormalizedAcademicResult,
  SubjectCategoryBreakdown,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  aggregateCategoryResults,
} from "./category-aggregation";

type AggregateSubjectCategoriesInput = {
  assignments:
    NormalizedAcademicResult[];

  assessments:
    NormalizedAcademicResult[];

  examinations:
    NormalizedAcademicResult[];

  assignmentStrategy?:
    AcademicEngineSubmissionStrategy;

  assessmentStrategy:
    AcademicEngineSubmissionStrategy;

  examinationStrategy?:
    AcademicEngineSubmissionStrategy;
};

export function aggregateSubjectCategories(
  {
    assignments,
    assessments,
    examinations,

    assignmentStrategy =
      "AVERAGE",

    assessmentStrategy,

    examinationStrategy =
      "LATEST",
  }: AggregateSubjectCategoriesInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): SubjectCategoryBreakdown {
  return {
    assignment:
      aggregateCategoryResults(
        {
          category:
            "ASSIGNMENT",

          results:
            assignments,

          strategy:
            assignmentStrategy,
        },

        options,
      ),

    assessment:
      aggregateCategoryResults(
        {
          category:
            "ASSESSMENT",

          results:
            assessments,

          strategy:
            assessmentStrategy,
        },

        options,
      ),

    examination:
      aggregateCategoryResults(
        {
          category:
            "EXAM",

          results:
            examinations,

          strategy:
            examinationStrategy,
        },

        options,
      ),
  };
}