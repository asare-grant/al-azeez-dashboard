// src/lib/academic-weightings/types.ts

import type {
  AssessmentScoreStrategy,
  GradingScaleStatus,
  TermName,
} from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                              ACTION RESULTS                                */
/* -------------------------------------------------------------------------- */

export type AcademicWeightingActionResult<
  T = never,
> =
  | {
      success: true;
      error: false;
      message: string;
      data: T;
      fieldErrors?: never;
    }
  | {
      success: false;
      error: true;
      message: string;
      data?: never;
      fieldErrors?: Record<
        string,
        string[] | undefined
      >;
    };

/* -------------------------------------------------------------------------- */
/*                            GRADE BOUNDARIES                                 */
/* -------------------------------------------------------------------------- */

export type GradeBoundaryInput = {
  id?: number;

  grade: string;

  minimumScore: number;
  maximumScore: number;

  remark: string;

  gradePoint?: number | null;

  position: number;
};

export type GradeBoundaryRecord =
  GradeBoundaryInput & {
    id: number;
    gradingScaleId: number;

    createdAt: Date | string;
    updatedAt: Date | string;
  };

/* -------------------------------------------------------------------------- */
/*                             GRADING SCALES                                  */
/* -------------------------------------------------------------------------- */

export type GradingScaleInput = {
  id?: number;

  name: string;
  description?: string | null;

  status: GradingScaleStatus;
  isDefault: boolean;

  boundaries: GradeBoundaryInput[];
};

export type GradingScaleListItem = {
  id: number;

  name: string;
  description: string | null;

  status: GradingScaleStatus;
  isDefault: boolean;

  boundaryCount: number;
  weightingCount: number;

  createdAt: Date | string;
  updatedAt: Date | string;
};

/* -------------------------------------------------------------------------- */
/*                          ACADEMIC WEIGHTINGS                                */
/* -------------------------------------------------------------------------- */

export type AcademicWeightingInput = {
  id?: number;

  academicYear: string;

  termId: number;
  gradeId: number;
  gradingScaleId: number;

  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;

  assessmentScoreStrategy:
    AssessmentScoreStrategy;

  passMark: number;

  isActive: boolean;
};

export type AcademicWeightingListItem = {
  id: number;

  academicYear: string;

  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;

  assessmentScoreStrategy:
    AssessmentScoreStrategy;

  passMark: number;
  isActive: boolean;

  term: {
    id: number;
    name: TermName;
    isActive: boolean;
  };

  grade: {
    id: number;
    level: string;
  };

  gradingScale: {
    id: number;
    name: string;
    status: GradingScaleStatus;
  };

  createdAt: Date | string;
  updatedAt: Date | string;
};

/* -------------------------------------------------------------------------- */
/*                              SELECT OPTIONS                                 */
/* -------------------------------------------------------------------------- */

export type AcademicWeightingFormOptions = {
  terms: {
    id: number;
    name: TermName;
    isActive: boolean;
    startDate: Date | string;
    endDate: Date | string;
  }[];

  grades: {
    id: number;
    level: string;
  }[];

  gradingScales: {
    id: number;
    name: string;
    status: GradingScaleStatus;
    isDefault: boolean;
  }[];

  academicYears: string[];
};




export type AcademicWeightingMetrics = {
  total: number;
  active: number;
  inactive: number;

  gradesConfigured: number;
  academicYearsConfigured: number;

  averagePassMark: number | null;
};

export type AcademicWeightingListFilters = {
  page?: number;
  pageSize?: number;

  search?: string;

  academicYear?: string;
  termId?: number;
  gradeId?: number;
  gradingScaleId?: number;

  status?:
    | "ALL"
    | "ACTIVE"
    | "INACTIVE";
};

export type AcademicWeightingMutationResult = {
  weightingId: number;
  updatedAt: Date | string;
};

export type AcademicWeightingStatusResult = {
  weightingId: number;
  isActive: boolean;
  updatedAt: Date | string;
};

export type AcademicWeightingDeleteResult = {
  weightingId: number;
};