// src/lib/academic-engine/types.ts

import type {
  AssessmentScoreStrategy,
  ResultType,
  TermName,
} from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                               SHARED VALUES                                */
/* -------------------------------------------------------------------------- */

export type AcademicResultCategory = "ASSIGNMENT" | "ASSESSMENT" | "EXAM";

export type AcademicEngineResultStatus = "COMPLETE" | "MISSING" | "UNUSABLE";

export type AcademicEngineCalculationStatus = "READY" | "PARTIAL" | "BLOCKED";

export type AcademicEngineRankingMode = "COMPETITION" | "DENSE";

export type AcademicEngineSubmissionStrategy =
  | AssessmentScoreStrategy
  | "AVERAGE"
  | "HIGHEST"
  | "FIRST"
  | "LATEST";

/* -------------------------------------------------------------------------- */
/*                          ACADEMIC PERIOD CONTEXT                            */
/* -------------------------------------------------------------------------- */

export type AcademicPeriodContext = {
  academicYear: string;

  term: {
    id: number;
    name: TermName;

    startDate: Date | string;
    endDate: Date | string;
  };

  grade: {
    id: number;
    level: string;
  };

  class?: {
    id: number;
    name: string;
  } | null;
};

/* -------------------------------------------------------------------------- */
/*                            STUDENT INFORMATION                             */
/* -------------------------------------------------------------------------- */

export type AcademicEngineStudent = {
  id: string;

  studentId: string;

  name: string;
  surname: string;

  imageUrl?: string | null;

  sex?: string | null;

  class: {
    id: number;
    name: string;
  };

  grade: {
    id: number;
    level: string;
  };
};

/* -------------------------------------------------------------------------- */
/*                            SUBJECT INFORMATION                             */
/* -------------------------------------------------------------------------- */

export type AcademicEngineSubject = {
  id: number;
  name: string;

  code?: string | null;

  teacher?: {
    id: string;
    name: string;
    surname: string;
  } | null;
};

/* -------------------------------------------------------------------------- */
/*                            RAW RESULT RECORDS                              */
/* -------------------------------------------------------------------------- */

/**
 * A normalized result record consumed by the academic engine.
 *
 * Results from Assignment, Assessment and Exam are transformed into this
 * common structure before calculation begins.
 */
export type AcademicEngineResultRecord = {
  id: number;

  type: ResultType;

  studentId: string;

  subjectId: number;
  subjectName: string;

  lessonId?: number | null;

  academicYear: string | null;

  termId: number | null;

  title: string;

  score: number;

  totalMarks: number | null;

  /**
   * Percentage stored in the database.
   *
   * The calculation engine may derive the percentage from score and
   * totalMarks when this value is null.
   */
  percentage: number | null;

  date: Date | string;

  assignmentId?: number | null;
  assessmentId?: number | null;
  assessmentAttemptId?: number | null;
  examId?: number | null;

  attemptNumber?: number | null;

  createdAt?: Date | string;
  updatedAt?: Date | string;
};

/* -------------------------------------------------------------------------- */
/*                         NORMALIZED RESULT RECORD                           */
/* -------------------------------------------------------------------------- */

export type NormalizedAcademicResult = {
  id: number;

  type: AcademicResultCategory;

  studentId: string;

  subjectId: number;
  subjectName: string;

  title: string;

  rawScore: number;
  totalMarks: number | null;

  percentage: number;

  date: Date | string;

  assignmentId: number | null;
  assessmentId: number | null;
  assessmentAttemptId: number | null;
  examId: number | null;

  attemptNumber: number | null;
};

/* -------------------------------------------------------------------------- */
/*                              WEIGHTING RULE                                */
/* -------------------------------------------------------------------------- */

export type AcademicWeightingRule = {
  id: number;

  academicYear: string;

  termId: number;
  gradeId: number;

  gradingScaleId: number;

  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;

  assessmentScoreStrategy: AssessmentScoreStrategy;

  /**
   * Assignment strategy is not currently stored separately in Prisma.
   *
   * Until the schema supports it, the engine defaults this value to AVERAGE.
   */
  assignmentScoreStrategy?: AcademicEngineSubmissionStrategy;

  /**
   * Exam strategy defaults to LATEST when multiple examination records exist.
   */
  examinationScoreStrategy?: AcademicEngineSubmissionStrategy;

  passMark: number;

  isActive: boolean;
};

export type AcademicWeightingSnapshot = {
  weightingId: number;

  academicYear: string;

  termId: number;
  gradeId: number;

  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;

  assessmentScoreStrategy: AssessmentScoreStrategy;

  assignmentScoreStrategy: AcademicEngineSubmissionStrategy;
  examinationScoreStrategy: AcademicEngineSubmissionStrategy;

  passMark: number;

  totalWeight: number;
};

/* -------------------------------------------------------------------------- */
/*                            GRADING-SCALE TYPES                             */
/* -------------------------------------------------------------------------- */

export type AcademicGradeBoundary = {
  id?: number;

  grade: string;

  minimumScore: number;
  maximumScore: number;

  remark: string;

  gradePoint: number | null;

  position: number;
};

export type AcademicGradingScale = {
  id: number;

  name: string;
  description?: string | null;

  isDefault: boolean;

  boundaries: AcademicGradeBoundary[];
};

export type AcademicGradeResolution = {
  gradingScaleId: number;

  gradingScaleName: string;

  score: number;

  grade: string;

  remark: string;

  gradePoint: number | null;

  minimumScore: number;
  maximumScore: number;

  passed: boolean;
};

/* -------------------------------------------------------------------------- */
/*                        CATEGORY AGGREGATION INPUT                           */
/* -------------------------------------------------------------------------- */

export type CategoryAggregationInput = {
  category: AcademicResultCategory;

  results: NormalizedAcademicResult[];

  strategy: AcademicEngineSubmissionStrategy;
};

export type CategoryAggregationItem = {
  resultId: number;

  title: string;

  percentage: number;

  date: Date | string;

  selected: boolean;

  attemptNumber: number | null;
};

export type CategoryAggregationIssueCode =
  | "NO_RESULTS"
  | "NO_USABLE_RESULTS"
  | "INVALID_PERCENTAGE"
  | "INVALID_DATE"
  | "UNSUPPORTED_STRATEGY";

export type CategoryAggregationIssue = {
  code: CategoryAggregationIssueCode;

  message: string;

  severity: "WARNING" | "ERROR";

  resultId?: number;
};

/* -------------------------------------------------------------------------- */
/*                       CATEGORY AGGREGATION OUTPUT                           */
/* -------------------------------------------------------------------------- */

export type CategoryScoreSummary = {
  category: AcademicResultCategory;

  strategy: AcademicEngineSubmissionStrategy;

  recordCount: number;

  usableRecordCount: number;
  unusableRecordCount: number;

  selectedRecordCount: number;

  /**
   * Average percentage across all usable records,
   * regardless of the selected aggregation strategy.
   */
  rawAverage: number | null;

  /**
   * Final category percentage produced by the
   * selected strategy.
   */
  percentage: number | null;

  status: AcademicEngineResultStatus;

  items: CategoryAggregationItem[];

  issues: CategoryAggregationIssue[];
};

/* -------------------------------------------------------------------------- */
/*                           CATEGORY WEIGHTING                               */
/* -------------------------------------------------------------------------- */

export type WeightedCategoryScore = {
  category: AcademicResultCategory;

  rawPercentage: number | null;

  /**
   * Weight configured by the administrator.
   */
  weight: number;

  /**
   * Weight actually used in the calculation.
   *
   * Normally equal to `weight`. It differs only when
   * available weights are normalized.
   */
  effectiveWeight: number;

  weightedScore: number;

  available: boolean;

  includedInFinalScore: boolean;
};

/* -------------------------------------------------------------------------- */
/*                          SUBJECT CALCULATION INPUT                          */
/* -------------------------------------------------------------------------- */

export type SubjectCalculationInput = {
  student: AcademicEngineStudent;

  subject: AcademicEngineSubject;

  period: AcademicPeriodContext;

  weighting: AcademicWeightingRule;

  gradingScale: AcademicGradingScale;

  assignments: NormalizedAcademicResult[];

  assessments: NormalizedAcademicResult[];

  examinations: NormalizedAcademicResult[];
};

/* -------------------------------------------------------------------------- */
/*                         SUBJECT CALCULATION ISSUES                          */
/* -------------------------------------------------------------------------- */

export type SubjectCalculationIssueCode =
  | "NO_ASSIGNMENT_RESULT"
  | "NO_ASSESSMENT_RESULT"
  | "NO_EXAM_RESULT"
  | "NO_RESULTS"
  | "INVALID_WEIGHTING"
  | "WEIGHTS_DO_NOT_TOTAL_100"
  | "NO_GRADING_BOUNDARY"
  | "MISSING_REQUIRED_CATEGORY"
  | "INVALID_RESULT_PERCENTAGE";

export type SubjectCalculationIssue = {
  code: SubjectCalculationIssueCode;

  message: string;

  severity: "WARNING" | "ERROR";

  category?: AcademicResultCategory;
};

/* -------------------------------------------------------------------------- */
/*                         SUBJECT CALCULATION RESULT                          */
/* -------------------------------------------------------------------------- */

export type SubjectCategoryBreakdown = {
  assignment: CategoryScoreSummary;
  assessment: CategoryScoreSummary;
  examination: CategoryScoreSummary;
};

export type SubjectWeightedBreakdown = {
  assignment: WeightedCategoryScore;
  assessment: WeightedCategoryScore;
  examination: WeightedCategoryScore;
};

export type SubjectFinalResult = {
  studentId: string;

  subject: AcademicEngineSubject;

  academicYear: string;
  termId: number;

  gradeId: number;
  classId: number;

  categories: SubjectCategoryBreakdown;

  weighted: SubjectWeightedBreakdown;

  /**
   * Sum of all weighted category scores.
   */
  finalScore: number;

  totalAvailableWeight: number;

  grade: string;
  remark: string;

  gradePoint: number | null;

  passed: boolean;

  calculationStatus: AcademicEngineCalculationStatus;

  issues: SubjectCalculationIssue[];

  weightingSnapshot: AcademicWeightingSnapshot;

  gradingScaleSnapshot: {
    gradingScaleId: number;
    gradingScaleName: string;

    boundary: AcademicGradeBoundary | null;
  };
};

/* -------------------------------------------------------------------------- */
/*                        SUBJECT CLASS PERFORMANCE                            */
/* -------------------------------------------------------------------------- */

export type SubjectClassPerformance = {
  subject: AcademicEngineSubject;

  studentCount: number;
  gradedStudentCount: number;

  classAverage: number | null;

  highestScore: number | null;
  lowestScore: number | null;

  passCount: number;
  failCount: number;

  passRate: number | null;
};

/* -------------------------------------------------------------------------- */
/*                         SUBJECT RANKING TYPES                              */
/* -------------------------------------------------------------------------- */

export type SubjectRankingEntry = {
  studentId: string;

  studentName: string;

  subjectId: number;

  score: number;

  position: number;

  tied: boolean;
};

export type RankedSubjectResult = SubjectFinalResult & {
  position: number | null;

  classAverage: number | null;

  highestScore: number | null;
  lowestScore: number | null;
};

/* -------------------------------------------------------------------------- */
/*                         STUDENT TERM CALCULATION                            */
/* -------------------------------------------------------------------------- */

export type StudentTermCalculationInput = {
  student: AcademicEngineStudent;

  period: AcademicPeriodContext;

  weighting: AcademicWeightingRule;

  gradingScale: AcademicGradingScale;

  subjects: {
    subject: AcademicEngineSubject;

    assignments: NormalizedAcademicResult[];

    assessments: NormalizedAcademicResult[];

    examinations: NormalizedAcademicResult[];
  }[];

  attendance?: Partial<StudentTermAttendance>;

  remarks?: Partial<StudentReportCardRemarks>;

  classStudentCount?: number | null;
};

/* -------------------------------------------------------------------------- */
/*                        STUDENT REPORT SUMMARY                              */
/* -------------------------------------------------------------------------- */

export type StudentTermSummary = {
  subjectCount: number;

  completedSubjectCount: number;
  incompleteSubjectCount: number;

  totalScore: number;

  averageScore: number | null;

  highestSubjectScore: number | null;
  lowestSubjectScore: number | null;

  passedSubjectCount: number;
  failedSubjectCount: number;

  passRate: number | null;

  totalGradePoints: number | null;
  averageGradePoint: number | null;
};

/* -------------------------------------------------------------------------- */
/*                         ATTENDANCE SUMMARY                                 */
/* -------------------------------------------------------------------------- */

export type StudentTermAttendance = {
  daysSchoolOpened: number | null;

  daysPresent: number | null;
  daysAbsent: number | null;

  attendancePercentage: number | null;
};

/* -------------------------------------------------------------------------- */
/*                          REPORT-CARD REMARKS                               */
/* -------------------------------------------------------------------------- */

export type StudentReportCardRemarks = {
  conduct: string | null;

  classTeacherRemark: string | null;

  headTeacherRemark: string | null;

  promotionStatus: string | null;

  nextTermBegins: Date | string | null;
};

/* -------------------------------------------------------------------------- */
/*                         STUDENT TERM REPORT                                */
/* -------------------------------------------------------------------------- */

export type StudentTermReport = {
  student: AcademicEngineStudent;

  period: AcademicPeriodContext;

  subjects: RankedSubjectResult[];

  summary: StudentTermSummary;

  overallGrade: string | null;
  overallRemark: string | null;

  overallGradePoint: number | null;

  overallPosition: number | null;

  classStudentCount: number | null;

  attendance: StudentTermAttendance;

  remarks: StudentReportCardRemarks;

  calculationStatus: AcademicEngineCalculationStatus;

  issues: StudentReportIssue[];

  generatedAt: Date | string;
};

/* -------------------------------------------------------------------------- */
/*                         REPORT CALCULATION ISSUES                           */
/* -------------------------------------------------------------------------- */

export type StudentReportIssueCode =
  | "NO_ACTIVE_WEIGHTING"
  | "NO_GRADING_SCALE"
  | "NO_SUBJECT_RESULTS"
  | "INCOMPLETE_SUBJECTS"
  | "INVALID_ACADEMIC_PERIOD"
  | "STUDENT_NOT_FOUND"
  | "GRADE_MISMATCH"
  | "CLASS_MISMATCH";

export type StudentReportIssue = {
  code: StudentReportIssueCode;

  message: string;

  severity: "WARNING" | "ERROR";

  subjectId?: number;
};

/* -------------------------------------------------------------------------- */
/*                           CLASS REPORT TYPES                               */
/* -------------------------------------------------------------------------- */

export type ClassTermCalculationInput = {
  period: AcademicPeriodContext;

  weighting: AcademicWeightingRule;

  gradingScale: AcademicGradingScale;

  students: StudentTermCalculationInput[];
};

export type ClassRankingEntry = {
  studentId: string;

  studentName: string;

  averageScore: number;

  totalScore: number;

  completedSubjectCount: number;

  position: number;

  tied: boolean;
};

export type ClassTermReport = {
  period: AcademicPeriodContext;

  students: StudentTermReport[];

  rankings: ClassRankingEntry[];

  subjectRankings: SubjectRankingSummary[];

  classAverage: number | null;

  highestAverage: number | null;
  lowestAverage: number | null;

  passCount: number;
  failCount: number;

  passRate: number | null;

  subjectPerformance: SubjectClassPerformance[];

  calculationStatus: AcademicEngineCalculationStatus;

  issues: ClassReportIssue[];

  generatedAt: Date | string;
};

export type SubjectRankingSummary = {
  subjectId: number;
  subjectName: string;

  rankings: SubjectRankingEntry[];
};

export type ClassReportIssueCode =
  | "NO_STUDENTS"
  | "NO_RANKABLE_STUDENTS"
  | "INCOMPLETE_STUDENT_REPORTS"
  | "PERIOD_MISMATCH"
  | "GRADE_MISMATCH"
  | "CLASS_MISMATCH";

export type ClassReportIssue = {
  code: ClassReportIssueCode;

  message: string;

  severity:
    | "WARNING"
    | "ERROR";

  studentId?: string;
};

/* -------------------------------------------------------------------------- */
/*                           CALCULATION OPTIONS                              */
/* -------------------------------------------------------------------------- */

export type AcademicEngineOptions = {
  roundingDecimalPlaces: number;

  rankingMode: AcademicEngineRankingMode;

  /**
   * When true, a subject calculation is blocked when a category with a
   * positive weight has no result.
   */
  requireEveryWeightedCategory: boolean;

  /**
   * When true, incomplete subjects are excluded from the overall average.
   */
  excludeIncompleteSubjectsFromAverage: boolean;

  /**
   * When true, the final score is clamped between 0 and 100.
   */
  clampFinalScores: boolean;

  normalizeAvailableWeights: boolean;
};

export type AcademicEngineContext = {
  options: AcademicEngineOptions;

  calculatedAt: Date;
};

/* -------------------------------------------------------------------------- */
/*                              ENGINE RESULT                                 */
/* -------------------------------------------------------------------------- */

export type AcademicEngineSuccess<T> = {
  success: true;

  data: T;

  warnings: string[];
};

export type AcademicEngineFailure = {
  success: false;

  message: string;

  code: string;

  errors: string[];
};

export type AcademicEngineResult<T> =
  | AcademicEngineSuccess<T>
  | AcademicEngineFailure;
