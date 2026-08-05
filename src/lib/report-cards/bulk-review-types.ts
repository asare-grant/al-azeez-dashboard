import type {
  ReportCardCalculationStatus,
  ReportCardReviewStatus,
  ReportCardStatus,
  TermName,
} from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                              FILTER INPUT                                  */
/* -------------------------------------------------------------------------- */

export type ReportCardBulkReviewFilters = {
  classId?: string;
  termId?: string;
  academicYear?: string;

  reviewStatus?: string;
  calculationStatus?: string;

  search?: string;
};

/* -------------------------------------------------------------------------- */
/*                            STUDENT REPORT ITEM                             */
/* -------------------------------------------------------------------------- */

export type ReportCardBulkReviewItem = {
  id: number;

  version: number;

  status: ReportCardStatus;

  reviewStatus:
    ReportCardReviewStatus;

  calculationStatus:
    ReportCardCalculationStatus;

  academicYear: string;

  student: {
    id: string;
    studentId: string;

    name: string;
    surname: string;

    img: string | null;
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
    name: TermName;
  };

  subjectCount: number;
  completedSubjectCount: number;
  incompleteSubjectCount: number;

  averageScore: number | null;
  overallGrade: string | null;

  overallPosition: number | null;
  classStudentCount: number | null;

  daysSchoolOpened: number | null;
  daysPresent: number | null;
  daysAbsent: number | null;

  classTeacherRemark: string | null;
  headTeacherRemark: string | null;

  promotionStatus: string | null;

  reviewNote: string | null;

  submittedForReviewAt:
    | Date
    | string
    | null;

  approvedAt:
    | Date
    | string
    | null;

  publishedAt:
    | Date
    | string
    | null;

  updatedAt: Date | string;

  canApprove: boolean;
  canRequestChanges: boolean;
  canPublish: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                METRICS                                     */
/* -------------------------------------------------------------------------- */

export type ReportCardBulkReviewMetrics = {
  total: number;

  preparing: number;
  awaitingReview: number;
  changesRequested: number;
  approved: number;

  academicallyReady: number;
  partial: number;
  blocked: number;

  publishable: number;
  published: number;

  averageScore: number | null;

  completionPercentage: number;
};

/* -------------------------------------------------------------------------- */
/*                             FILTER OPTIONS                                 */
/* -------------------------------------------------------------------------- */

export type ReportCardBulkReviewOptions = {
  classes: {
    id: number;
    name: string;

    grade: {
      id: number;
      level: string;
    };
  }[];

  terms: {
    id: number;
    name: TermName;
    isActive: boolean;
  }[];

  academicYears: string[];
};

/* -------------------------------------------------------------------------- */
/*                            PAGE QUERY RESULT                               */
/* -------------------------------------------------------------------------- */

export type ReportCardBulkReviewData = {
  items:
    ReportCardBulkReviewItem[];

  metrics:
    ReportCardBulkReviewMetrics;

  options:
    ReportCardBulkReviewOptions;

  selection: {
    classId: number | null;
    termId: number | null;
    academicYear: string | null;
  };

  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

/* -------------------------------------------------------------------------- */
/*                            BULK ACTION INPUTS                              */
/* -------------------------------------------------------------------------- */

export type BulkApproveReportCardsInput = {
  reportCardIds: number[];
  reviewNote?: string;
};

export type BulkRequestReportCardChangesInput = {
  reportCardIds: number[];
  reviewNote: string;
};

export type BulkPublishReportCardsInput = {
  reportCardIds: number[];
};

/* -------------------------------------------------------------------------- */
/*                            BULK ACTION RESULT                              */
/* -------------------------------------------------------------------------- */

export type BulkReportCardActionSummary = {
  requested: number;
  completed: number;
  skipped: number;

  reportCardIds: number[];

  skippedItems: {
    reportCardId: number;
    reason: string;
  }[];
};