import type {
  ReportCardCalculationStatus,
  TermName,
} from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                              GENERATION INPUT                              */
/* -------------------------------------------------------------------------- */

export type GenerateClassReportCardsInput = {
  classId: number;
  termId: number;
  academicYear: string;

  /**
   * Allows drafts to be generated when individual
   * students have missing source results.
   *
   * Structural errors such as missing weighting or
   * grading scale can never be bypassed.
   */
  allowPartial?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                         STUDENT GENERATION RESULT                          */
/* -------------------------------------------------------------------------- */

export type GeneratedReportCardAction =
  | "CREATED"
  | "REGENERATED"
  | "PRESERVED"
  | "SKIPPED";

export type GeneratedReportCardItem = {
  reportCardId: number;

  studentId: string;
  studentName: string;

  action:
    GeneratedReportCardAction;

  calculationStatus:
    ReportCardCalculationStatus;

  subjectCount: number;
  completedSubjectCount: number;
  incompleteSubjectCount: number;

  averageScore: number | null;
  overallGrade: string | null;

  message: string;
};

/* -------------------------------------------------------------------------- */
/*                            GENERATION SUMMARY                              */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationSummary = {
  classId: number;
  className: string;

  gradeId: number;
  gradeLevel: string;

  termId: number;
  termName: TermName;

  academicYear: string;

  studentCount: number;
  subjectCount: number;

  created: number;
  regenerated: number;
  preserved: number;
  skipped: number;

  ready: number;
  partial: number;
  blocked: number;

  subjectSnapshotsCreated: number;

  startedAt: Date | string;
  completedAt: Date | string;

  durationMilliseconds: number;

  reportCards:
    GeneratedReportCardItem[];

  warnings: string[];
};