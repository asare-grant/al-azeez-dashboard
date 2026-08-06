import type {
  TermName,
} from "@prisma/client";

import type {
  ReportCardGenerationSummary,
} from "@/lib/report-cards/generation-types";

import type {
  ReportCardGenerationValidation,
} from "@/lib/report-cards/generation-validator";
/* -------------------------------------------------------------------------- */
/*                              CLASS OPTION                                  */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationClassOption = {
  id: number;
  name: string;

  grade: {
    id: number;
    level: string;
  };

  studentCount: number;
  lessonCount: number;
};

/* -------------------------------------------------------------------------- */
/*                               TERM OPTION                                  */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationTermOption = {
  id: number;
  name: TermName;

  startDate: Date | string;
  endDate: Date | string;

  isActive: boolean;
};

/* -------------------------------------------------------------------------- */
/*                         ACADEMIC WEIGHTING DATA                             */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationWeighting = {
  id: number;

  academicYear: string;

  classId: number;
  gradeId: number;

  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;

  passMark: number;

  gradingScale: {
    id: number;
    name: string;
  };
};

/* -------------------------------------------------------------------------- */
/*                         GENERATION PAGE OPTIONS                            */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationPageData = {
  classes:
    ReportCardGenerationClassOption[];

  terms:
    ReportCardGenerationTermOption[];

  academicYears: string[];

  defaultAcademicYear:
    | string
    | null;

  defaultTermId:
    | number
    | null;
};

/* -------------------------------------------------------------------------- */
/*                         CURRENT USER SELECTION                             */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationSelection = {
  classId:
    | number
    | null;

  academicYear: string;

  termId:
    | number
    | null;
};


/* -------------------------------------------------------------------------- */
/*                     SHARED GENERATION READINESS                            */
/* -------------------------------------------------------------------------- */

/**
 * The Generation Studio consumes the exact result returned
 * by validateReportCardGeneration().
 *
 * Do not create a second UI-specific readiness interface.
 */
export type ReportCardGenerationReadiness =
  ReportCardGenerationValidation;

/* -------------------------------------------------------------------------- */
/*                         GENERATION RESULT                                  */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationResult =
  ReportCardGenerationSummary;