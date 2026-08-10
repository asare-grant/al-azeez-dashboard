import type {
  ReportCardReviewCheck,
  ReportCardReviewReadiness,
} from "./review-types";

type ReviewableReportCard = {
  status: string;
  reviewStatus: string;

  isStale: boolean;

  staleReason: string | null;

  subjectCount: number;
  completedSubjectCount: number;
  incompleteSubjectCount: number;

  averageScore: number | null;
  overallGrade: string | null;

  daysSchoolOpened: number | null;
  daysPresent: number | null;
  daysAbsent: number | null;

  conduct: string | null;
  attitude: string | null;
  interest: string | null;

  classTeacherRemark: string | null;

  headTeacherRemark: string | null;

  promotionStatus: string | null;

  termClosedOn: Date | string | null;

  nextTermBegins: Date | string | null;
};

export function reviewReportCardReadiness(
  reportCard: ReviewableReportCard,
): ReportCardReviewReadiness {
  const checks: ReportCardReviewCheck[] = [];

  function addCheck(check: ReportCardReviewCheck) {
    checks.push(check);
  }

  const allSubjectsComplete =
    reportCard.subjectCount > 0 &&
    reportCard.completedSubjectCount === reportCard.subjectCount &&
    reportCard.incompleteSubjectCount === 0;

  addCheck({
    id: "subjects",

    title: "Subject calculations",

    description: allSubjectsComplete
      ? `All ${reportCard.subjectCount} subjects have complete calculated results.`
      : `${reportCard.completedSubjectCount} of ${reportCard.subjectCount} subjects are complete.`,

    severity: allSubjectsComplete ? "success" : "error",

    section: "academic",
  });

  const hasOverallResult =
    reportCard.averageScore !== null &&
    Boolean(reportCard.overallGrade?.trim());

  addCheck({
    id: "overall-result",

    title: "Overall academic result",

    description: hasOverallResult
      ? "The overall average and grade have been calculated."
      : "The report is missing an overall average or grade.",

    severity: hasOverallResult ? "success" : "error",

    section: "academic",
  });

  const attendanceComplete =
    reportCard.daysSchoolOpened !== null &&
    reportCard.daysPresent !== null &&
    reportCard.daysAbsent !== null;

  addCheck({
    id: "attendance",

    title: "Attendance",

    description: attendanceComplete
      ? `${reportCard.daysPresent} of ${reportCard.daysSchoolOpened} official school days attended.`
      : reportCard.daysSchoolOpened !== null
        ? "The attendance register for this student is incomplete for the current term."
        : "Official school days have not been configured for this term.",

    severity: attendanceComplete ? "success" : "error",

    section: "attendance",
  });

  const developmentFields = [
    reportCard.conduct,
    reportCard.attitude,
    reportCard.interest,
  ];

  const completedDevelopmentFields = developmentFields.filter((value) =>
    Boolean(value?.trim()),
  ).length;

  addCheck({
    id: "development",

    title: "Conduct, attitude and interest",

    description:
      completedDevelopmentFields === developmentFields.length
        ? "Student development information is complete."
        : `${completedDevelopmentFields} of ${developmentFields.length} development fields have been completed.`,

    severity:
      completedDevelopmentFields === developmentFields.length
        ? "success"
        : "warning",

    section: "development",
  });

  const hasClassTeacherRemark = Boolean(reportCard.classTeacherRemark?.trim());

  addCheck({
    id: "class-teacher-remark",

    title: "Class-teacher remark",

    description: hasClassTeacherRemark
      ? "A class-teacher remark has been entered."
      : "Enter a class-teacher remark before submitting the card.",

    severity: hasClassTeacherRemark ? "success" : "error",

    section: "remarks",
  });

  const hasHeadTeacherRemark = Boolean(reportCard.headTeacherRemark?.trim());

  addCheck({
    id: "head-teacher-remark",

    title: "Head-teacher remark",

    description: hasHeadTeacherRemark
      ? "A head-teacher remark has been entered."
      : "The head-teacher remark is still missing.",

    severity: hasHeadTeacherRemark ? "success" : "warning",

    section: "remarks",
  });

  const hasPromotionStatus = Boolean(reportCard.promotionStatus?.trim());

  addCheck({
    id: "promotion",

    title: "Promotion decision",

    description: hasPromotionStatus
      ? `Promotion status: ${reportCard.promotionStatus}.`
      : "Select or enter the student's promotion status.",

    severity: hasPromotionStatus ? "success" : "error",

    section: "promotion",
  });

  const termDatesComplete =
    Boolean(reportCard.termClosedOn) && Boolean(reportCard.nextTermBegins);

  addCheck({
    id: "term-dates",

    title: "Term dates",

    description: termDatesComplete
      ? "The closing and reopening dates are configured."
      : "Enter the term closing date and next-term reopening date.",

    severity: termDatesComplete ? "success" : "warning",

    section: "promotion",
  });

  if (reportCard.isStale) {
    addCheck({
      id: "stale-academic-snapshot",

      title: "Academic results changed",

      description:
        reportCard.staleReason ||
        "One or more source results changed after this report card was generated. Regenerate the report card before continuing.",

      severity: "error",

      section: "academic",
    });
  }

  const errors = checks.filter((check) => check.severity === "error");

  const warnings = checks.filter((check) => check.severity === "warning");

  const successes = checks.filter((check) => check.severity === "success");

  const completedChecks = successes.length;

  const totalChecks = checks.length;

  const completionPercentage =
    totalChecks === 0 ? 0 : Math.round((completedChecks / totalChecks) * 100);

  const readyForReview = !reportCard.isStale && errors.length === 0;

  const readyForApproval =
    readyForReview && reportCard.reviewStatus === "SUBMITTED";

  const readyForPublication =
    readyForReview &&
    reportCard.reviewStatus === "APPROVED" &&
    reportCard.status === "DRAFT";

  return {
    readyForReview,
    readyForApproval,
    readyForPublication,

    completionPercentage,

    completedChecks,
    totalChecks,

    errors,
    warnings,
    successes,
  };
}
