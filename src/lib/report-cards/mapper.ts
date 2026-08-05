import type {
  ReportCardCalculationStatus,
} from "@prisma/client";

import type {
  StudentTermReport,
} from "@/lib/academic-engine";

import {
  toPrismaJson,
} from "./json";

export function mapCalculationStatus(
  status:
    StudentTermReport["calculationStatus"],
): ReportCardCalculationStatus {
  return status;
}

export function mapReportCardData({
  report,
  generatedById,
}: {
  report: StudentTermReport;
  generatedById: string;
}) {
  const firstSubject =
    report.subjects[0];

  return {
    studentId:
      report.student.id,

    classId:
      report.period.class?.id ??
      report.student.class.id,

    gradeId:
      report.period.grade.id,

    termId:
      report.period.term.id,

    academicYear:
      report.period.academicYear,

    calculationStatus:
      mapCalculationStatus(
        report.calculationStatus,
      ),

    sourceWeightingId:
      firstSubject?.weightingSnapshot
        .weightingId ?? null,

    sourceGradingScaleId:
      firstSubject
        ?.gradingScaleSnapshot
        .gradingScaleId ?? null,

    subjectCount:
      report.summary.subjectCount,

    completedSubjectCount:
      report.summary
        .completedSubjectCount,

    incompleteSubjectCount:
      report.summary
        .incompleteSubjectCount,

    totalScore:
      report.summary.totalScore,

    averageScore:
      report.summary.averageScore,

    highestSubjectScore:
      report.summary
        .highestSubjectScore,

    lowestSubjectScore:
      report.summary
        .lowestSubjectScore,

    passedSubjectCount:
      report.summary
        .passedSubjectCount,

    failedSubjectCount:
      report.summary
        .failedSubjectCount,

    passRate:
      report.summary.passRate,

    totalGradePoints:
      report.summary
        .totalGradePoints,

    averageGradePoint:
      report.summary
        .averageGradePoint,

    overallGrade:
      report.overallGrade,

    overallRemark:
      report.overallRemark,

    overallGradePoint:
      report.overallGradePoint,

    overallPosition:
      report.overallPosition,

    classStudentCount:
      report.classStudentCount,

    daysSchoolOpened:
      report.attendance
        .daysSchoolOpened,

    daysPresent:
      report.attendance.daysPresent,

    daysAbsent:
      report.attendance.daysAbsent,

    attendancePercentage:
      report.attendance
        .attendancePercentage,

    conduct:
      report.remarks.conduct,

    classTeacherRemark:
      report.remarks
        .classTeacherRemark,

    headTeacherRemark:
      report.remarks
        .headTeacherRemark,

    promotionStatus:
      report.remarks
        .promotionStatus,

    nextTermBegins:
      report.remarks.nextTermBegins
        ? new Date(
            report.remarks
              .nextTermBegins,
          )
        : null,

    weightingSnapshot:
      toPrismaJson(
        firstSubject
          ?.weightingSnapshot ?? {},
      ),

    gradingScaleSnapshot:
      toPrismaJson(
        firstSubject
          ?.gradingScaleSnapshot ?? {},
      ),

    reportSnapshot:
      toPrismaJson(report),

    calculationIssues:
      toPrismaJson(
        report.issues,
      ),

    generatedById,

    generatedAt:
      new Date(),
  };
}

export function mapReportCardSubjectData({
  reportCardId,
  subject,
}: {
  reportCardId: number;
  subject:
    StudentTermReport["subjects"][number];
}) {
  const teacher =
    subject.subject.teacher;

  return {
    reportCardId,

    subjectId:
      subject.subject.id,

    subjectName:
      subject.subject.name,

    teacherId:
      teacher?.id ?? null,

    teacherName:
      teacher
        ? `${teacher.name} ${teacher.surname}`.trim()
        : null,

    assignmentPercentage:
      subject.categories.assignment
        .percentage,

    assignmentWeight:
      subject.weighted.assignment
        .weight,

    assignmentScore:
      subject.weighted.assignment
        .weightedScore,

    assessmentPercentage:
      subject.categories.assessment
        .percentage,

    assessmentWeight:
      subject.weighted.assessment
        .weight,

    assessmentScore:
      subject.weighted.assessment
        .weightedScore,

    examinationPercentage:
      subject.categories.examination
        .percentage,

    examinationWeight:
      subject.weighted.examination
        .weight,

    examinationScore:
      subject.weighted.examination
        .weightedScore,

    finalScore:
      subject.finalScore,

    grade:
      subject.grade,

    remark:
      subject.remark,

    gradePoint:
      subject.gradePoint,

    passed:
      subject.passed,

    calculationStatus:
      mapCalculationStatus(
        subject.calculationStatus,
      ),

    subjectPosition:
      subject.position,

    classAverage:
      subject.classAverage,

    highestScore:
      subject.highestScore,

    lowestScore:
      subject.lowestScore,

    categorySnapshot:
      toPrismaJson(
        subject.categories,
      ),

    weightedSnapshot:
      toPrismaJson(
        subject.weighted,
      ),

    gradingSnapshot:
      toPrismaJson(
        subject.gradingScaleSnapshot,
      ),

    calculationIssues:
      toPrismaJson(
        subject.issues,
      ),
  };
}