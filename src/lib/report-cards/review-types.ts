import type {
    ReportCardCalculationStatus,
  ReportCardReviewStatus,
  ReportCardStatus,
} from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                             REVIEW ACTORS                                  */
/* -------------------------------------------------------------------------- */

export type ReportCardReviewActorRole =
  | "admin"
  | "teacher";

export type ReportCardReviewActor = {
  id: string;
  role: ReportCardReviewActorRole;
  name?: string | null;
};

/* -------------------------------------------------------------------------- */
/*                         EDITABLE REPORT DETAILS                            */
/* -------------------------------------------------------------------------- */

export type ReportCardDetailsInput = {
  reportCardId: number;

  daysSchoolOpened: number | null;
  daysPresent: number | null;

  conduct: string;
  attitude: string;
  interest: string;

  classTeacherRemark: string;
  headTeacherRemark: string;

  promotionStatus: string;

  termClosedOn: Date | string | null;
  nextTermBegins: Date | string | null;
};

/* -------------------------------------------------------------------------- */
/*                           CALCULATED ATTENDANCE                            */
/* -------------------------------------------------------------------------- */

export type ReportCardAttendanceSummary = {
  daysSchoolOpened: number | null;
  daysPresent: number | null;
  daysAbsent: number | null;
  attendancePercentage: number | null;
};

/* -------------------------------------------------------------------------- */
/*                            REVIEW OPERATIONS                               */
/* -------------------------------------------------------------------------- */

export type SubmitReportCardForReviewInput = {
  reportCardId: number;
  note?: string;
};

export type RequestReportCardChangesInput = {
  reportCardId: number;
  reviewNote: string;
};

export type ApproveReportCardInput = {
  reportCardId: number;
  reviewNote?: string;
};

export type ReopenReportCardReviewInput = {
  reportCardId: number;
  reviewNote: string;
};

/* -------------------------------------------------------------------------- */
/*                          REVIEW ACTION RESULTS                             */
/* -------------------------------------------------------------------------- */

export type SaveReportCardDetailsResult = {
  reportCardId: number;

  reviewStatus:
    ReportCardReviewStatus;

  attendance:
    ReportCardAttendanceSummary;

  updatedAt: Date | string;
};

export type SubmitReportCardForReviewResult = {
  reportCardId: number;

  reviewStatus:
    "SUBMITTED";

  submittedForReviewAt:
    Date | string;
};

export type RequestReportCardChangesResult = {
  reportCardId: number;

  reviewStatus:
    "CHANGES_REQUESTED";

  reviewNote: string;

  changesRequestedAt:
    Date | string;
};

export type ApproveReportCardResult = {
  reportCardId: number;

  reviewStatus:
    "APPROVED";

  approvedAt:
    Date | string;
};

export type ReopenReportCardReviewResult = {
  reportCardId: number;

  reviewStatus:
    "DRAFT";

  reviewNote: string;
};

/* -------------------------------------------------------------------------- */
/*                            READINESS CHECKS                                */
/* -------------------------------------------------------------------------- */

export type ReportCardReviewCheckSeverity =
  | "success"
  | "warning"
  | "error";

export type ReportCardReviewCheckSection =
  | "academic"
  | "attendance"
  | "development"
  | "remarks"
  | "promotion"
  | "approval";

export type ReportCardReviewCheck = {
  id: string;
  title: string;
  description: string;

  severity:
    ReportCardReviewCheckSeverity;

  section:
    ReportCardReviewCheckSection;
};

export type ReportCardReviewReadiness = {
  readyForReview: boolean;
  readyForApproval: boolean;
  readyForPublication: boolean;

  completionPercentage: number;

  completedChecks: number;
  totalChecks: number;

  errors:
    ReportCardReviewCheck[];

  warnings:
    ReportCardReviewCheck[];

  successes:
    ReportCardReviewCheck[];
};

/* -------------------------------------------------------------------------- */
/*                         REVIEW WORKSPACE DATA                              */
/* -------------------------------------------------------------------------- */

export type ReportCardReviewWorkspaceData = {
  id: number;

  status: ReportCardStatus;
  reviewStatus:
    ReportCardReviewStatus;

  calculationStatus:
    ReportCardCalculationStatus;

  version: number;
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
    name: string;
    startDate: Date | string;
    endDate: Date | string;
  };

  subjectCount: number;
  completedSubjectCount: number;
  incompleteSubjectCount: number;

  totalScore: number;
  averageScore: number | null;

  overallGrade: string | null;
  overallRemark: string | null;

  overallPosition: number | null;
  classStudentCount: number | null;

  daysSchoolOpened: number | null;
  daysPresent: number | null;
  daysAbsent: number | null;
  attendancePercentage: number | null;

  conduct: string | null;
  attitude: string | null;
  interest: string | null;

  classTeacherRemark: string | null;
  headTeacherRemark: string | null;

  promotionStatus: string | null;

  termClosedOn: Date | string | null;
  nextTermBegins: Date | string | null;

  reviewNote: string | null;

  submittedForReviewAt:
    Date | string | null;

  submittedForReviewBy:
    string | null;

  approvedAt:
    Date | string | null;

  approvedBy:
    string | null;

  changesRequestedAt:
    Date | string | null;

  changesRequestedBy:
    string | null;

  publishedAt:
    Date | string | null;

  subjects: {
    id: number;
    subjectId: number;
    subjectName: string;

    teacherId: string | null;
    teacherName: string | null;

    assignmentPercentage:
      number | null;

    assignmentScore: number;

    assessmentPercentage:
      number | null;

    assessmentScore: number;

    examinationPercentage:
      number | null;

    examinationScore: number;

    finalScore: number;

    grade: string;
    remark: string;
    passed: boolean;

    subjectPosition:
      number | null;

    classAverage:
      number | null;

    calculationStatus:
        ReportCardCalculationStatus;
  }[];

  readiness:
    ReportCardReviewReadiness;

  permissions:
    ReportCardReviewPermissions;

  updatedAt: Date | string;

  lockedAt:
    | Date
    | string
    | null;

  publishedBy:
    | string
    | null;
};


/* -------------------------------------------------------------------------- */
/*                         REVIEW WORKSPACE ACCESS                            */
/* -------------------------------------------------------------------------- */

export type ReportCardReviewPermissions = {
  canEditDetails: boolean;

  canEditHeadTeacherRemark: boolean;

  canSubmitForReview: boolean;

  canRequestChanges: boolean;

  canApprove: boolean;

  canReopen: boolean;

  canPublish: boolean;

  canArchive: boolean;
};