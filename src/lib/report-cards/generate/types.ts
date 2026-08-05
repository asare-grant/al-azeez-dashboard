import type {
  TermName,
} from "@prisma/client";

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

export type ReportCardGenerationTermOption = {
  id: number;
  name: TermName;

  startDate: Date | string;
  endDate: Date | string;

  isActive: boolean;
};

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

export type ReportCardGenerationPageData = {
  classes: ReportCardGenerationClassOption[];

  terms: ReportCardGenerationTermOption[];

  academicYears: string[];

  defaultAcademicYear: string | null;
  defaultTermId: number | null;
};

export type ReportCardGenerationSelection = {
  classId: number | null;
  academicYear: string;
  termId: number | null;
};

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

  existingReportCards: {
    total: number;
    draft: number;
    published: number;
    archived: number;
  };

  issues: string[];
};