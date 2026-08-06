import type {
  ReportCardCalculationStatus,
  ReportCardReviewStatus,
  ReportCardStatus,
} from "@prisma/client";

export type ReportCardActionResult<T = never> =
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

// export type GenerateClassReportCardsInput = {
//   classId: number;
//   academicYear: string;
//   termId: number;
// };

// export type GenerateClassReportCardsResult = {
//   classId: number;
//   academicYear: string;
//   termId: number;

//   generatedCount: number;
//   regeneratedCount: number;
//   lockedCount: number;
//   failedCount: number;

//   reportCardIds: number[];
// };

export type PublishReportCardResult = {
  reportCardId: number;
  status: ReportCardStatus;
  publishedAt: Date;
};

export type PublishClassReportCardsResult = {
  publishedCount: number;
  skippedCount: number;
  reportCardIds: number[];
};

export type ReportCardListItem = {
  id: number;

  status: ReportCardStatus;
  calculationStatus:
    ReportCardCalculationStatus;

  academicYear: string;

  student: {
    id: string;
    studentId: string;
    name: string;
    surname: string;
  };

  class: {
    id: number;
    name: string;
  };

  grade: {
    id: number;
    level: string;
  };

  term: {
    id: number;
    name: string;
  };

  subjectCount: number;
  completedSubjectCount: number;

  totalScore: number;
  averageScore: number | null;

  overallGrade: string | null;
  overallPosition: number | null;

  generatedAt: Date;
  publishedAt: Date | null;
};


/* -------------------------------------------------------------------------- */
/*                        GENERATION TYPE EXPORTS                             */
/* -------------------------------------------------------------------------- */

export type {
  GeneratedReportCardAction,
  GeneratedReportCardItem,
  GenerateClassReportCardsInput,
  ReportCardGenerationSummary,
} from "./generation-types";

export type ReportCardAcademicPeriodInput = {
  classId: number;
  academicYear: string;
  termId: number;
};