// src/lib/academic-engine/server/types.ts

import type {
  AcademicEngineOptions,
  AcademicEngineResultRecord,
  AcademicGradingScale,
  AcademicPeriodContext,
  AcademicWeightingRule,
  ClassTermCalculationInput,
  ClassTermReport,
} from "../types";

import type {
  NormalizeAcademicResultsResult,
} from "../normalize-result";

/* -------------------------------------------------------------------------- */
/*                              LOADER INPUT                                  */
/* -------------------------------------------------------------------------- */

export type LoadClassTermEngineInput = {
  classId: number;

  academicYear: string;

  termId: number;
};

/* -------------------------------------------------------------------------- */
/*                              LOADER ISSUES                                 */
/* -------------------------------------------------------------------------- */

export type AcademicEngineLoaderIssueCode =
  | "CLASS_NOT_FOUND"
  | "TERM_NOT_FOUND"
  | "TERM_YEAR_MISMATCH"
  | "NO_STUDENTS"
  | "NO_LESSONS"
  | "NO_ACTIVE_WEIGHTING"
  | "NO_GRADING_SCALE"
  | "INVALID_GRADING_SCALE"
  | "RESULT_SOURCE_MISSING"
  | "RESULT_SUBJECT_MISSING"
  | "RESULT_REJECTED";

export type AcademicEngineLoaderIssue = {
  code: AcademicEngineLoaderIssueCode;

  message: string;

  severity:
    | "WARNING"
    | "ERROR";

  resultId?: number;
  studentId?: string;
  subjectId?: number;
};

/* -------------------------------------------------------------------------- */
/*                           LOADED CONFIGURATION                             */
/* -------------------------------------------------------------------------- */

export type LoadedAcademicConfiguration = {
  period: AcademicPeriodContext;

  weighting: AcademicWeightingRule;

  gradingScale: AcademicGradingScale;
};

/* -------------------------------------------------------------------------- */
/*                         DATABASE LOADER OUTPUT                             */
/* -------------------------------------------------------------------------- */

export type LoadedClassTermEngineData = {
  input: ClassTermCalculationInput;

  configuration:
    LoadedAcademicConfiguration;

  rawResults:
    AcademicEngineResultRecord[];

  normalization:
    NormalizeAcademicResultsResult;

  issues:
    AcademicEngineLoaderIssue[];

  statistics: {
    studentCount: number;
    lessonCount: number;
    subjectCount: number;

    rawResultCount: number;
    acceptedResultCount: number;
    rejectedResultCount: number;
  };
};

/* -------------------------------------------------------------------------- */
/*                           SERVICE OUTCOME                                  */
/* -------------------------------------------------------------------------- */

export type LoadClassTermEngineResult =
  | {
      success: true;

      data:
        LoadedClassTermEngineData;

      warnings:
        AcademicEngineLoaderIssue[];
    }
  | {
      success: false;

      message: string;

      code:
        AcademicEngineLoaderIssueCode;

      errors:
        AcademicEngineLoaderIssue[];
    };

export type GenerateClassTermReportInput =
  LoadClassTermEngineInput & {
    options?:
      Partial<AcademicEngineOptions>;
  };

export type GenerateClassTermReportResult =
  | {
      success: true;

      report:
        ClassTermReport;

      loader:
        LoadedClassTermEngineData;

      warnings:
        AcademicEngineLoaderIssue[];
    }
  | {
      success: false;

      message: string;

      code: string;

      loader?:
        LoadedClassTermEngineData;

      errors:
        Array<
          | AcademicEngineLoaderIssue
          | ClassTermReport["issues"][number]
        >;
    };