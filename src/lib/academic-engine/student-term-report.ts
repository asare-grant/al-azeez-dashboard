// src/lib/academic-engine/student-term-report.ts

import type {
  AcademicEngineCalculationStatus,
  AcademicEngineOptions,
  RankedSubjectResult,
  StudentReportCardRemarks,
  StudentTermAttendance,
  StudentTermCalculationInput,
  StudentTermReport,
  SubjectFinalResult,
} from "./types";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "./constants";

import {
  DEFAULT_STUDENT_REPORT_REMARKS,
  DEFAULT_STUDENT_TERM_ATTENDANCE,
} from "./report-defaults";

import {
  buildSubjectFinalResult,
} from "./subject-result";

import {
  calculateStudentTermSummary,
} from "./student-term-summary";

import {
  buildStudentReportIssues,
} from "./student-report-issues";

import {
  resolveAcademicGrade,
} from "./grading-scale";

import {
  calculatePercentage,
} from "./numeric";

/* -------------------------------------------------------------------------- */
/*                          ATTENDANCE NORMALIZATION                          */
/* -------------------------------------------------------------------------- */

export function normalizeStudentTermAttendance(
  attendance?: Partial<StudentTermAttendance>,
): StudentTermAttendance {
  const daysSchoolOpened =
    attendance?.daysSchoolOpened ??
    null;

  const daysPresent =
    attendance?.daysPresent ??
    null;

  const daysAbsent =
    attendance?.daysAbsent ??
    (
      daysSchoolOpened !== null &&
      daysPresent !== null
        ? Math.max(
            0,
            daysSchoolOpened -
              daysPresent,
          )
        : null
    );

  const derivedPercentage =
    daysSchoolOpened !== null &&
    daysPresent !== null
      ? calculatePercentage({
          score:
            daysPresent,

          totalMarks:
            daysSchoolOpened,

          decimalPlaces: 2,

          clamp: true,
        })
      : null;

  return {
    daysSchoolOpened,

    daysPresent,

    daysAbsent,

    attendancePercentage:
      attendance
        ?.attendancePercentage ??
      derivedPercentage,
  };
}

/* -------------------------------------------------------------------------- */
/*                           REMARK NORMALIZATION                              */
/* -------------------------------------------------------------------------- */

export function normalizeStudentReportRemarks(
  remarks?: Partial<StudentReportCardRemarks>,
): StudentReportCardRemarks {
  return {
    ...DEFAULT_STUDENT_REPORT_REMARKS,
    ...remarks,
  };
}

/* -------------------------------------------------------------------------- */
/*                          SUBJECT CONVERSION                                */
/* -------------------------------------------------------------------------- */

function convertToRankedSubject(
  subject: SubjectFinalResult,
): RankedSubjectResult {
  return {
    ...subject,

    /*
     * These values are populated by the class-ranking
     * engine in the next calculation layer.
     */
    position: null,

    classAverage: null,

    highestScore: null,

    lowestScore: null,
  };
}

/* -------------------------------------------------------------------------- */
/*                          REPORT STATUS                                     */
/* -------------------------------------------------------------------------- */

function resolveStudentReportStatus({
  subjectStatuses,
  hasReportErrors,
}: {
  subjectStatuses:
    AcademicEngineCalculationStatus[];

  hasReportErrors: boolean;
}): AcademicEngineCalculationStatus {
  if (
    hasReportErrors ||
    subjectStatuses.some(
      (status) =>
        status === "BLOCKED",
    )
  ) {
    return "BLOCKED";
  }

  if (
    subjectStatuses.some(
      (status) =>
        status === "PARTIAL",
    )
  ) {
    return "PARTIAL";
  }

  return "READY";
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT TERM REPORT                                */
/* -------------------------------------------------------------------------- */

export function buildStudentTermReport(
  input: StudentTermCalculationInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): StudentTermReport {
  const subjectResults =
    input.subjects.map(
      (subjectInput) =>
        buildSubjectFinalResult(
          {
            student:
              input.student,

            subject:
              subjectInput.subject,

            period:
              input.period,

            weighting:
              input.weighting,

            gradingScale:
              input.gradingScale,

            assignments:
              subjectInput.assignments,

            assessments:
              subjectInput.assessments,

            examinations:
              subjectInput.examinations,
          },

          options,
        ),
    );

  const summary =
    calculateStudentTermSummary(
      subjectResults,
      options,
    );

  const reportIssues =
    buildStudentReportIssues({
      period:
        input.period,

      weighting:
        input.weighting,

      gradingScale:
        input.gradingScale,

      subjects:
        subjectResults,

      summary,

      options,
    });

  const overallGradeResolution =
    summary.averageScore === null
      ? null
      : resolveAcademicGrade(
          {
            score:
              summary.averageScore,

            gradingScale:
              input.gradingScale,

            passMark:
              input.weighting
                .passMark,
          },

          options,
        );

  if (
    overallGradeResolution &&
    !overallGradeResolution.success
  ) {
    reportIssues.push({
      code:
        "NO_GRADING_SCALE",

      message:
        overallGradeResolution.errors
          .map(
            (error) =>
              error.message,
          )
          .join(" "),

      severity:
        "ERROR",
    });
  }

  const hasReportErrors =
    reportIssues.some(
      (issue) =>
        issue.severity ===
        "ERROR",
    );

  const calculationStatus =
    resolveStudentReportStatus({
      subjectStatuses:
        subjectResults.map(
          (subject) =>
            subject.calculationStatus,
        ),

      hasReportErrors,
    });

  const rankedSubjects =
    subjectResults.map(
      convertToRankedSubject,
    );

  return {
    student:
      input.student,

    period:
      input.period,

    subjects:
      rankedSubjects,

    summary,

    overallGrade:
      overallGradeResolution
        ?.success
        ? overallGradeResolution
            .data.grade
        : null,

    overallRemark:
      overallGradeResolution
        ?.success
        ? overallGradeResolution
            .data.remark
        : null,

    overallGradePoint:
      overallGradeResolution
        ?.success
        ? overallGradeResolution
            .data.gradePoint
        : null,

    /*
     * Overall position is assigned by the class-ranking
     * engine after all student reports have been built.
     */
    overallPosition: null,

    classStudentCount:
      input.classStudentCount ??
      null,

    attendance:
      normalizeStudentTermAttendance(
        input.attendance,
      ),

    remarks:
      normalizeStudentReportRemarks(
        input.remarks,
      ),

    calculationStatus,

    issues:
      reportIssues,

    generatedAt:
      new Date(),
  };
}

export type BuildStudentTermReportOutcome =
  | {
      success: true;

      data: StudentTermReport;

      warnings:
        StudentTermReport["issues"];
    }
  | {
      success: false;

      data: StudentTermReport;

      message: string;

      errors:
        StudentTermReport["issues"];
    };

export function calculateCompleteStudentTermReport(
  input: StudentTermCalculationInput,

  options: AcademicEngineOptions =
    DEFAULT_ACADEMIC_ENGINE_OPTIONS,
): BuildStudentTermReportOutcome {
  const report =
    buildStudentTermReport(
      input,
      options,
    );

  const errors =
    report.issues.filter(
      (issue) =>
        issue.severity ===
        "ERROR",
    );

  const warnings =
    report.issues.filter(
      (issue) =>
        issue.severity ===
        "WARNING",
    );

  if (
    report.calculationStatus ===
      "BLOCKED" ||
    errors.length > 0
  ) {
    return {
      success: false,

      data:
        report,

      message:
        errors[0]?.message ??
        "The student term report could not be completed.",

      errors,
    };
  }

  return {
    success: true,

    data:
      report,

    warnings,
  };
}