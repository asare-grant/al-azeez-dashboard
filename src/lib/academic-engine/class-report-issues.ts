// src/lib/academic-engine/class-report-issues.ts

import type {
  AcademicPeriodContext,
  ClassReportIssue,
  StudentTermReport,
} from "./types";

export function buildClassReportIssues({
  period,
  reports,
}: {
  period: AcademicPeriodContext;

  reports: StudentTermReport[];
}): ClassReportIssue[] {
  const issues:
    ClassReportIssue[] = [];

  if (reports.length === 0) {
    issues.push({
      code:
        "NO_STUDENTS",

      message:
        "No students were available for the class term report.",

      severity:
        "ERROR",
    });

    return issues;
  }

  const rankableReports =
    reports.filter(
      (report) =>
        report.calculationStatus ===
          "READY" &&
        report.summary
          .averageScore !== null,
    );

  if (
    rankableReports.length === 0
  ) {
    issues.push({
      code:
        "NO_RANKABLE_STUDENTS",

      message:
        "No complete student reports were available for class ranking.",

      severity:
        "ERROR",
    });
  }

  const incompleteReports =
    reports.filter(
      (report) =>
        report.calculationStatus !==
        "READY",
    );

  if (
    incompleteReports.length > 0
  ) {
    issues.push({
      code:
        "INCOMPLETE_STUDENT_REPORTS",

      message:
        `${incompleteReports.length} ${
          incompleteReports.length ===
          1
            ? "student report is"
            : "student reports are"
        } incomplete and will not receive an official class position.`,

      severity:
        "WARNING",
    });
  }

  for (const report of reports) {
    if (
      report.period.academicYear !==
        period.academicYear ||
      report.period.term.id !==
        period.term.id
    ) {
      issues.push({
        code:
          "PERIOD_MISMATCH",

        message:
          `${report.student.name} ${report.student.surname} belongs to a different academic period.`,

        severity:
          "ERROR",

        studentId:
          report.student.id,
      });
    }

    if (
      report.period.grade.id !==
      period.grade.id
    ) {
      issues.push({
        code:
          "GRADE_MISMATCH",

        message:
          `${report.student.name} ${report.student.surname} belongs to a different grade.`,

        severity:
          "ERROR",

        studentId:
          report.student.id,
      });
    }

    if (
      period.class &&
      report.period.class &&
      report.period.class.id !==
        period.class.id
    ) {
      issues.push({
        code:
          "CLASS_MISMATCH",

        message:
          `${report.student.name} ${report.student.surname} belongs to a different class.`,

        severity:
          "ERROR",

        studentId:
          report.student.id,
      });
    }
  }

  return issues;
}