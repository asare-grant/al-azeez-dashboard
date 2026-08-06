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
/*                         GENERATION SELECTION                               */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationSelection = {
  classId: number | null;
  academicYear: string;
  termId: number | null;
};

/* -------------------------------------------------------------------------- */
/*                            CLASS OPTION                                    */
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
/*                             TERM OPTION                                    */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationTermOption = {
  id: number;
  name: TermName;

  startDate: Date | string;
  endDate: Date | string;

  isActive: boolean;
};

/* -------------------------------------------------------------------------- */
/*                              PAGE DATA                                     */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationPageData = {
  classes:
    ReportCardGenerationClassOption[];

  terms:
    ReportCardGenerationTermOption[];

  academicYears: string[];

  defaultAcademicYear:
    string | null;

  defaultTermId:
    number | null;
};

/* -------------------------------------------------------------------------- */
/*                    SINGLE SHARED READINESS CONTRACT                        */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationReadiness =
  ReportCardGenerationValidation;

/* -------------------------------------------------------------------------- */
/*                         GENERATION RESULT                                  */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationResult =
  ReportCardGenerationSummary;