import type {
  ReportCardCalculationStatus,
  ReportCardReviewStatus,
  ReportCardStatus,
  TermName,
} from "@prisma/client";

export type ReportCardCommandItem = {
  id: number;

  version: number;
  academicYear: string;

  status:
    ReportCardStatus;

  reviewStatus:
    ReportCardReviewStatus;

  calculationStatus:
    ReportCardCalculationStatus;

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

  totalScore: number;
  averageScore: number | null;

  overallGrade: string | null;

  overallPosition: number | null;
  classStudentCount: number | null;

  generatedAt: Date | string;
  regeneratedAt: Date | string | null;
  publishedAt: Date | string | null;

  submittedForReviewAt:
    | Date
    | string
    | null;

  approvedAt:
    | Date
    | string
    | null;

  changesRequestedAt:
    | Date
    | string
    | null;
};

export type ReportCardCommandMetrics = {
  total: number;

  draft: number;
  published: number;
  archived: number;

  ready: number;
  partial: number;
  blocked: number;

  preparing: number;
  awaitingReview: number;
  changesRequested: number;
  approved: number;

  averageScore:
    number | null;

  publishable: number;
};

export type ReportCardCommandFilters = {
  search?: string;
  classId?: string;
  termId?: string;
  academicYear?: string;
  status?: string;
  calculationStatus?: string;

  reviewStatus?: string;
};

export type ReportCardFilterOptions = {
  classes: {
    id: number;
    name: string;
  }[];

  terms: {
    id: number;
    name: TermName;
    isActive: boolean;
  }[];

  academicYears: string[];
};