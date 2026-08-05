// src/lib/academic-engine/group-results.ts

import type {
  AcademicResultCategory,
  NormalizedAcademicResult,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                               GROUP TYPES                                  */
/* -------------------------------------------------------------------------- */

export type AcademicCategoryGroups = {
  assignments:
    NormalizedAcademicResult[];

  assessments:
    NormalizedAcademicResult[];

  examinations:
    NormalizedAcademicResult[];
};

export type SubjectResultGroup = {
  subjectId: number;
  subjectName: string;

  assignments:
    NormalizedAcademicResult[];

  assessments:
    NormalizedAcademicResult[];

  examinations:
    NormalizedAcademicResult[];

  all:
    NormalizedAcademicResult[];
};

export type StudentResultGroup = {
  studentId: string;

  subjects:
    Map<
      number,
      SubjectResultGroup
    >;

  all:
    NormalizedAcademicResult[];
};

/* -------------------------------------------------------------------------- */
/*                          CATEGORY GROUPING                                 */
/* -------------------------------------------------------------------------- */

export function groupResultsByCategory(
  results:
    NormalizedAcademicResult[],
): AcademicCategoryGroups {
  const grouped:
    AcademicCategoryGroups =
    {
      assignments: [],
      assessments: [],
      examinations: [],
    };

  for (
    const result of results
  ) {
    switch (result.type) {
      case "ASSIGNMENT":
        grouped.assignments.push(
          result,
        );
        break;

      case "ASSESSMENT":
        grouped.assessments.push(
          result,
        );
        break;

      case "EXAM":
        grouped.examinations.push(
          result,
        );
        break;
    }
  }

  return grouped;
}

/* -------------------------------------------------------------------------- */
/*                           SUBJECT GROUPING                                 */
/* -------------------------------------------------------------------------- */

export function groupResultsBySubject(
  results:
    NormalizedAcademicResult[],
): Map<number, SubjectResultGroup> {
  const grouped =
    new Map<
      number,
      SubjectResultGroup
    >();

  for (
    const result of results
  ) {
    const existing =
      grouped.get(
        result.subjectId,
      );

    const subjectGroup =
      existing ?? {
        subjectId:
          result.subjectId,

        subjectName:
          result.subjectName,

        assignments: [],

        assessments: [],

        examinations: [],

        all: [],
      };

    subjectGroup.all.push(
      result,
    );

    switch (result.type) {
      case "ASSIGNMENT":
        subjectGroup.assignments.push(
          result,
        );
        break;

      case "ASSESSMENT":
        subjectGroup.assessments.push(
          result,
        );
        break;

      case "EXAM":
        subjectGroup.examinations.push(
          result,
        );
        break;
    }

    grouped.set(
      result.subjectId,
      subjectGroup,
    );
  }

  return grouped;
}

/* -------------------------------------------------------------------------- */
/*                            STUDENT GROUPING                                */
/* -------------------------------------------------------------------------- */

export function groupResultsByStudent(
  results:
    NormalizedAcademicResult[],
): Map<string, StudentResultGroup> {
  const grouped =
    new Map<
      string,
      StudentResultGroup
    >();

  for (
    const result of results
  ) {
    const existingStudent =
      grouped.get(
        result.studentId,
      );

    const studentGroup =
      existingStudent ?? {
        studentId:
          result.studentId,

        subjects:
          new Map<
            number,
            SubjectResultGroup
          >(),

        all: [],
      };

    studentGroup.all.push(
      result,
    );

    const existingSubject =
      studentGroup.subjects.get(
        result.subjectId,
      );

    const subjectGroup =
      existingSubject ?? {
        subjectId:
          result.subjectId,

        subjectName:
          result.subjectName,

        assignments: [],

        assessments: [],

        examinations: [],

        all: [],
      };

    subjectGroup.all.push(
      result,
    );

    switch (result.type) {
      case "ASSIGNMENT":
        subjectGroup.assignments.push(
          result,
        );
        break;

      case "ASSESSMENT":
        subjectGroup.assessments.push(
          result,
        );
        break;

      case "EXAM":
        subjectGroup.examinations.push(
          result,
        );
        break;
    }

    studentGroup.subjects.set(
      result.subjectId,
      subjectGroup,
    );

    grouped.set(
      result.studentId,
      studentGroup,
    );
  }

  return grouped;
}

/* -------------------------------------------------------------------------- */
/*                           CATEGORY HELPERS                                 */
/* -------------------------------------------------------------------------- */

export function getCategoryResults({
  group,
  category,
}: {
  group: SubjectResultGroup;
  category:
    AcademicResultCategory;
}): NormalizedAcademicResult[] {
  switch (category) {
    case "ASSIGNMENT":
      return group.assignments;

    case "ASSESSMENT":
      return group.assessments;

    case "EXAM":
      return group.examinations;
  }
}

/* -------------------------------------------------------------------------- */
/*                            SORTING HELPERS                                 */
/* -------------------------------------------------------------------------- */

export function sortResultsByDateAscending(
  results:
    NormalizedAcademicResult[],
): NormalizedAcademicResult[] {
  return [...results].sort(
    (
      first,
      second,
    ) =>
      new Date(
        first.date,
      ).getTime() -
      new Date(
        second.date,
      ).getTime(),
  );
}

export function sortResultsByDateDescending(
  results:
    NormalizedAcademicResult[],
): NormalizedAcademicResult[] {
  return [...results].sort(
    (
      first,
      second,
    ) =>
      new Date(
        second.date,
      ).getTime() -
      new Date(
        first.date,
      ).getTime(),
  );
}

export function sortResultsByPercentageDescending(
  results:
    NormalizedAcademicResult[],
): NormalizedAcademicResult[] {
  return [...results].sort(
    (
      first,
      second,
    ) => {
      const percentageDifference =
        second.percentage -
        first.percentage;

      if (
        percentageDifference !==
        0
      ) {
        return percentageDifference;
      }

      return (
        new Date(
          second.date,
        ).getTime() -
        new Date(
          first.date,
        ).getTime()
      );
    },
  );
}