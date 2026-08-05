// src/lib/academic-engine/category-aggregation.ts

import type {
  AcademicEngineOptions,
  AcademicEngineSubmissionStrategy,
  CategoryAggregationInput,
  CategoryAggregationIssue,
  CategoryAggregationItem,
  CategoryScoreSummary,
  NormalizedAcademicResult,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  calculateAverage,
  percentageIsValid,
  roundNumber,
} from "./numeric";

/* -------------------------------------------------------------------------- */
/*                              VALIDATION                                    */
/* -------------------------------------------------------------------------- */

type PreparedCategoryResult = {
  result: NormalizedAcademicResult;
  date: Date;
};

function prepareCategoryResults(
  results: NormalizedAcademicResult[],
): {
  usable: PreparedCategoryResult[];
  unusable: NormalizedAcademicResult[];
  issues: CategoryAggregationIssue[];
} {
  const usable: PreparedCategoryResult[] =
    [];

  const unusable: NormalizedAcademicResult[] =
    [];

  const issues: CategoryAggregationIssue[] =
    [];

  for (const result of results) {
    if (
      !Number.isFinite(result.percentage) ||
      !percentageIsValid(
        result.percentage,
      )
    ) {
      unusable.push(result);

      issues.push({
        code: "INVALID_PERCENTAGE",

        message:
          `"${result.title}" contains an invalid percentage.`,

        severity: "ERROR",

        resultId: result.id,
      });

      continue;
    }

    const date =
      result.date instanceof Date
        ? new Date(
            result.date.getTime(),
          )
        : new Date(result.date);

    if (
      Number.isNaN(date.getTime())
    ) {
      unusable.push(result);

      issues.push({
        code: "INVALID_DATE",

        message:
          `"${result.title}" contains an invalid result date.`,

        severity: "ERROR",

        resultId: result.id,
      });

      continue;
    }

    usable.push({
      result,
      date,
    });
  }

  return {
    usable,
    unusable,
    issues,
  };
}

/* -------------------------------------------------------------------------- */
/*                              SORTING                                       */
/* -------------------------------------------------------------------------- */

function sortOldestFirst(
  results: PreparedCategoryResult[],
) {
  return [...results].sort(
    (first, second) => {
      const dateDifference =
        first.date.getTime() -
        second.date.getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      /*
       * A lower ID is treated as the earlier record
       * when two records have the same timestamp.
       */
      return (
        first.result.id -
        second.result.id
      );
    },
  );
}

function sortNewestFirst(
  results: PreparedCategoryResult[],
) {
  return [...results].sort(
    (first, second) => {
      const dateDifference =
        second.date.getTime() -
        first.date.getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      /*
       * A higher ID is treated as the newer record
       * when two records have the same timestamp.
       */
      return (
        second.result.id -
        first.result.id
      );
    },
  );
}

function sortHighestFirst(
  results: PreparedCategoryResult[],
) {
  return [...results].sort(
    (first, second) => {
      const scoreDifference =
        second.result.percentage -
        first.result.percentage;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      /*
       * If scores are tied, prefer the latest record.
       */
      const dateDifference =
        second.date.getTime() -
        first.date.getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return (
        second.result.id -
        first.result.id
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                           SELECTED RESULTS                                 */
/* -------------------------------------------------------------------------- */

function selectCategoryResults({
  results,
  strategy,
}: {
  results: PreparedCategoryResult[];
  strategy: AcademicEngineSubmissionStrategy;
}): PreparedCategoryResult[] {
  if (results.length === 0) {
    return [];
  }

  switch (strategy) {
    case "AVERAGE":
      return results;

    case "HIGHEST":
      return [
        sortHighestFirst(results)[0],
      ];

    case "FIRST":
      return [
        sortOldestFirst(results)[0],
      ];

    case "LATEST":
      return [
        sortNewestFirst(results)[0],
      ];

    default:
      return [];
  }
}

/* -------------------------------------------------------------------------- */
/*                         ITEM TRANSFORMATION                                */
/* -------------------------------------------------------------------------- */

function createAggregationItems({
  usable,
  unusable,
  selectedIds,
}: {
  usable: PreparedCategoryResult[];
  unusable: NormalizedAcademicResult[];
  selectedIds: Set<number>;
}): CategoryAggregationItem[] {
  const usableItems =
    usable.map(({ result }) => ({
      resultId: result.id,

      title: result.title,

      percentage:
        result.percentage,

      date: result.date,

      selected:
        selectedIds.has(result.id),

      attemptNumber:
        result.attemptNumber,
    }));

  /*
   * Invalid normalized records should rarely reach
   * this stage. They are retained for transparency,
   * but are never selected.
   */
  const unusableItems =
    unusable.map((result) => ({
      resultId: result.id,

      title: result.title,

      percentage:
        Number.isFinite(
          result.percentage,
        )
          ? result.percentage
          : 0,

      date: result.date,

      selected: false,

      attemptNumber:
        result.attemptNumber,
    }));

  return [
    ...usableItems,
    ...unusableItems,
  ].sort((first, second) => {
    const firstTime =
      new Date(
        first.date,
      ).getTime();

    const secondTime =
      new Date(
        second.date,
      ).getTime();

    if (
      Number.isNaN(firstTime) &&
      Number.isNaN(secondTime)
    ) {
      return (
        first.resultId -
        second.resultId
      );
    }

    if (Number.isNaN(firstTime)) {
      return 1;
    }

    if (Number.isNaN(secondTime)) {
      return -1;
    }

    return (
      firstTime -
      secondTime
    );
  });
}

/* -------------------------------------------------------------------------- */
/*                          CATEGORY AGGREGATION                              */
/* -------------------------------------------------------------------------- */

export function aggregateCategoryResults(
  input: CategoryAggregationInput,
  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): CategoryScoreSummary {
  const {
    category,
    strategy,
    results,
  } = input;

  if (results.length === 0) {
    return {
      category,

      strategy,

      recordCount: 0,

      usableRecordCount: 0,
      unusableRecordCount: 0,

      selectedRecordCount: 0,

      rawAverage: null,

      percentage: null,

      status: "MISSING",

      items: [],

      issues: [
        {
          code: "NO_RESULTS",

          message:
            `No ${category.toLowerCase()} result has been recorded.`,

          severity: "WARNING",
        },
      ],
    };
  }

  const {
    usable,
    unusable,
    issues,
  } = prepareCategoryResults(
    results,
  );

  if (usable.length === 0) {
    return {
      category,

      strategy,

      recordCount:
        results.length,

      usableRecordCount: 0,

      unusableRecordCount:
        unusable.length,

      selectedRecordCount: 0,

      rawAverage: null,

      percentage: null,

      status: "UNUSABLE",

      items:
        createAggregationItems({
          usable,
          unusable,
          selectedIds:
            new Set<number>(),
        }),

      issues: [
        ...issues,

        {
          code: "NO_USABLE_RESULTS",

          message:
            `The recorded ${category.toLowerCase()} results could not be used.`,

          severity: "ERROR",
        },
      ],
    };
  }

  const selected =
    selectCategoryResults({
      results: usable,
      strategy,
    });

  if (selected.length === 0) {
    return {
      category,

      strategy,

      recordCount:
        results.length,

      usableRecordCount:
        usable.length,

      unusableRecordCount:
        unusable.length,

      selectedRecordCount: 0,

      rawAverage:
        calculateAverage(
          usable.map(
            ({ result }) =>
              result.percentage,
          ),
          options.roundingDecimalPlaces,
        ),

      percentage: null,

      status: "UNUSABLE",

      items:
        createAggregationItems({
          usable,
          unusable,
          selectedIds:
            new Set<number>(),
        }),

      issues: [
        ...issues,

        {
          code: "UNSUPPORTED_STRATEGY",

          message:
            `The aggregation strategy "${String(
              strategy,
            )}" is not supported.`,

          severity: "ERROR",
        },
      ],
    };
  }

  const rawAverage =
    calculateAverage(
      usable.map(
        ({ result }) =>
          result.percentage,
      ),
      options.roundingDecimalPlaces,
    );

  const selectedPercentage =
    strategy === "AVERAGE"
      ? rawAverage
      : selected[0]
          .result.percentage;

  const percentage =
    selectedPercentage === null
      ? null
      : roundNumber(
          selectedPercentage,
          options.roundingDecimalPlaces,
        );

  const selectedIds =
    new Set(
      selected.map(
        ({ result }) =>
          result.id,
      ),
    );

  return {
    category,

    strategy,

    recordCount:
      results.length,

    usableRecordCount:
      usable.length,

    unusableRecordCount:
      unusable.length,

    selectedRecordCount:
      selected.length,

    rawAverage,

    percentage,

    status:
      percentage === null
        ? "UNUSABLE"
        : "COMPLETE",

    items:
      createAggregationItems({
        usable,
        unusable,
        selectedIds,
      }),

    issues,
  };
}