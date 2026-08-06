export type {
  AcademicEngineCalculationStatus,
  AcademicEngineContext,
  AcademicEngineFailure,
  AcademicEngineOptions,
  AcademicEngineRankingMode,
  AcademicEngineResult,
  AcademicEngineResultRecord,
  AcademicEngineResultStatus,
  AcademicEngineStudent,
  AcademicEngineSubject,
  AcademicEngineSubmissionStrategy,
  AcademicEngineSuccess,
  AcademicGradeBoundary,
  AcademicGradeResolution,
  AcademicGradingScale,
  AcademicPeriodContext,
  AcademicResultCategory,
  AcademicWeightingRule,
  AcademicWeightingSnapshot,
  CategoryAggregationInput,
  CategoryAggregationItem,
  CategoryScoreSummary,
  ClassRankingEntry,
  ClassTermCalculationInput,
  ClassTermReport,
  NormalizedAcademicResult,
  RankedSubjectResult,
  StudentReportCardRemarks,
  StudentReportIssue,
  StudentReportIssueCode,
  StudentTermAttendance,
  StudentTermCalculationInput,
  StudentTermReport,
  StudentTermSummary,
  SubjectCalculationInput,
  SubjectCalculationIssue,
  SubjectCalculationIssueCode,
  SubjectCategoryBreakdown,
  SubjectClassPerformance,
  SubjectFinalResult,
  SubjectRankingEntry,
  SubjectWeightedBreakdown,
  WeightedCategoryScore,
} from "./types";




export {
  ACADEMIC_ENGINE_LIMITS,
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

export {
  approximatelyEqual,
  calculateAverage,
  calculatePercentage,
  calculateSum,
  clampNumber,
  clampPercentage,
  isFiniteNumber,
  normalizeDecimalPlaces,
  normalizePercentage,
  percentageIsValid,
  roundNumber,
  toFiniteNumber,
} from "./numeric";

export {
  mapResultTypeToCategory,
  normalizeAcademicResult,
  normalizeAcademicResults,
  normalizeResultDate,
} from "./normalize-result";

export type {
  NormalizeAcademicResultFailure,
  NormalizeAcademicResultOutcome,
  NormalizeAcademicResultSuccess,
  NormalizeAcademicResultsResult,
  ResultNormalizationIssue,
  ResultNormalizationIssueCode,
} from "./normalize-result";

export {
  getCategoryResults,
  groupResultsByCategory,
  groupResultsByStudent,
  groupResultsBySubject,
  sortResultsByDateAscending,
  sortResultsByDateDescending,
  sortResultsByPercentageDescending,
} from "./group-results";

export type {
  AcademicCategoryGroups,
  StudentResultGroup,
  SubjectResultGroup,
} from "./group-results";


export type {
  CategoryAggregationIssue,
  CategoryAggregationIssueCode,
} from "./types";


export {
  aggregateCategoryResults,
} from "./category-aggregation";

export {
  aggregateSubjectCategories,
} from "./subject-category-aggregation";

export {
  categoryIsComplete,
  categoryIsMissing,
  categoryIsUnusable,
  getCategoryStatuses,
  getIncompleteCategories,
  subjectCategoriesAreComplete,
} from "./category-status";


export {
  calculateWeightedCategoryScore,
  categoryCarriesWeight,
  isValidCategoryWeight,
} from "./weighted-category";

export type {
  CalculateWeightedCategoryInput,
} from "./weighted-category";

export {
  buildSubjectCategoryIssues,
} from "./subject-issues";

export {
  calculateConfiguredWeightTotal,
  calculateSubjectScore,
  weightingIsValid,
} from "./subject-score";

export type {
  SubjectScoreCalculationInput,
  SubjectScoreCalculationResult,
} from "./subject-score";


export {
  findGradeBoundary,
  resolveAcademicGrade,
  sortGradeBoundaries,
  validateGradingScale,
} from "./grading-scale";

export type {
  GradingScaleIssue,
  GradingScaleIssueCode,
  GradingScaleValidationResult,
  ResolveAcademicGradeInput,
  ResolveAcademicGradeResult,
} from "./grading-scale";

export {
  createAcademicWeightingSnapshot,
} from "./weighting-snapshot";

export {
  buildSubjectFinalResult,
  calculateCompleteSubjectResult,
} from "./subject-result";

export type {
  BuildSubjectFinalResultOutcome,
} from "./subject-result";


export {
  DEFAULT_STUDENT_REPORT_REMARKS,
  DEFAULT_STUDENT_TERM_ATTENDANCE,
} from "./report-defaults";

export {
  calculateStudentTermSummary,
  getSubjectsIncludedInAverage,
  subjectIsComplete,
  subjectIsIncomplete,
} from "./student-term-summary";

export {
  buildStudentReportIssues,
} from "./student-report-issues";

export {
  buildStudentTermReport,
  calculateCompleteStudentTermReport,
  normalizeStudentReportRemarks,
  normalizeStudentTermAttendance,
} from "./student-term-report";

export type {
  BuildStudentTermReportOutcome,
} from "./student-term-report";


export {
  createClassRankings,
  createSubjectRankings,
  rankValues,
} from "./ranking";

export {
  buildSubjectPerformance,
  buildSubjectRankings,
  calculateSubjectClassPerformance,
  groupClassResultsBySubject,
} from "./subject-performance";

export type {
  ClassSubjectResultGroup,
} from "./subject-performance";

export {
  buildClassReportIssues,
} from "./class-report-issues";

export {
  buildClassTermReport,
  calculateCompleteClassTermReport,
} from "./class-term-report";

export type {
  BuildClassTermReportOutcome,
} from "./class-term-report";

export type {
  ClassReportIssue,
  ClassReportIssueCode,
  SubjectRankingSummary,
} from "./types";

export {
  loadClassTermReportData,
} from "./data-loader";

export type {
  LoadClassTermReportDataInput,
} from "./data-loader";