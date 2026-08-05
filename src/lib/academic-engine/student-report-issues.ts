// src/lib/academic-engine/student-report-issues.ts

import type {
  AcademicEngineOptions,
  AcademicGradingScale,
  AcademicPeriodContext,
  AcademicWeightingRule,
  StudentReportIssue,
  StudentTermSummary,
  SubjectFinalResult,
} from "./types";

import {
  validateGradingScale,
} from "./grading-scale";

import {
  weightingIsValid,
} from "./subject-score";

/* -------------------------------------------------------------------------- */
/*                        REPORT-LEVEL VALIDATION                             */
/* -------------------------------------------------------------------------- */

export function buildStudentReportIssues({
  period,
  weighting,
  gradingScale,
  subjects,
  summary,
  options,
}: {
  period: AcademicPeriodContext;

  weighting: AcademicWeightingRule;

  gradingScale: AcademicGradingScale;

  subjects: SubjectFinalResult[];

  summary: StudentTermSummary;

  options: AcademicEngineOptions;
}): StudentReportIssue[] {
  const issues:
    StudentReportIssue[] =
    [];

  if (
    !period.academicYear.trim() ||
    !Number.isInteger(
      period.term.id,
    ) ||
    period.term.id <= 0 ||
    !Number.isInteger(
      period.grade.id,
    ) ||
    period.grade.id <= 0
  ) {
    issues.push({
      code:
        "INVALID_ACADEMIC_PERIOD",

      message:
        "The academic year, term or grade is invalid.",

      severity:
        "ERROR",
    });
  }

  if (
    !weighting.isActive ||
    weighting.academicYear !==
      period.academicYear ||
    weighting.termId !==
      period.term.id ||
    weighting.gradeId !==
      period.grade.id ||
    !weightingIsValid(
      weighting,
    )
  ) {
    issues.push({
      code:
        "NO_ACTIVE_WEIGHTING",

      message:
        "A valid active academic weighting is not configured for this academic year, term and grade.",

      severity:
        "ERROR",
    });
  }

  const gradingValidation =
    validateGradingScale(
      gradingScale,
    );

  if (
    !gradingValidation.valid
  ) {
    issues.push({
      code:
        "NO_GRADING_SCALE",

      message:
        gradingValidation.errors
          .map(
            (error) =>
              error.message,
          )
          .join(" "),

      severity:
        "ERROR",
    });
  }

  if (subjects.length === 0) {
    issues.push({
      code:
        "NO_SUBJECT_RESULTS",

      message:
        "No subjects were available for the student’s term report.",

      severity:
        "ERROR",
    });
  }

  if (
    summary.incompleteSubjectCount >
    0
  ) {
    issues.push({
      code:
        "INCOMPLETE_SUBJECTS",

      message:
        `${summary.incompleteSubjectCount} ${
          summary.incompleteSubjectCount ===
          1
            ? "subject is"
            : "subjects are"
        } incomplete.`,

      severity:
        options.requireEveryWeightedCategory
          ? "ERROR"
          : "WARNING",
    });
  }

  for (
    const subject of subjects
  ) {
    if (
      subject.calculationStatus !==
      "READY"
    ) {
      issues.push({
        code:
          "INCOMPLETE_SUBJECTS",

        message:
          `${subject.subject.name} is ${subject.calculationStatus.toLowerCase()} and cannot yet be treated as a complete result.`,

        severity:
          subject.calculationStatus ===
          "BLOCKED"
            ? "ERROR"
            : "WARNING",

        subjectId:
          subject.subject.id,
      });
    }
  }

  return issues;
}