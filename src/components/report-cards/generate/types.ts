import type {
  TermName,
} from "@prisma/client";

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
/*                         EXISTING REPORT COUNTS                             */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationExistingReports = {
  total: number;
  draft: number;
  published: number;
  archived: number;
};

/* -------------------------------------------------------------------------- */
/*                        CONFIGURATION READINESS                             */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationReadiness = {
  ready: boolean;

  classOption:
    | ReportCardGenerationClassOption
    | null;

  term:
    | ReportCardGenerationTermOption
    | null;

  weighting:
    | ReportCardGenerationWeighting
    | null;

  existingReportCards:
    ReportCardGenerationExistingReports;

  issues: string[];
};