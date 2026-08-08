import "server-only";

import { Prisma, type ReportCardCalculationStatus } from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  buildClassTermReport,
  loadClassTermReportData,
} from "@/lib/academic-engine";

import type {
  RankedSubjectResult,
  StudentTermReport,
} from "@/lib/academic-engine";

import { validateReportCardGeneration } from "./generation-validator";

import type {
  GeneratedReportCardItem,
  GenerateClassReportCardsInput,
  ReportCardGenerationSummary,
} from "./generation-types";

/* -------------------------------------------------------------------------- */
/*                              ENGINE TYPES                                  */
/* -------------------------------------------------------------------------- */

type GeneratedStudentReport = StudentTermReport;

type GeneratedSubjectResult = RankedSubjectResult;

/* -------------------------------------------------------------------------- */
/*                     PRESERVED MANUAL REPORT DATA                           */
/* -------------------------------------------------------------------------- */

type PreservedManualReportFields = {
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

  termClosedOn: Date | null;

  nextTermBegins: Date | null;
};

/* -------------------------------------------------------------------------- */
/*                       CONFIGURATION SNAPSHOT TYPE                          */
/* -------------------------------------------------------------------------- */

type GenerationConfiguration = {
  id: number;
  academicYear: string;

  termId: number;
  gradeId: number;

  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;

  assessmentScoreStrategy: string;

  passMark: number;

  gradingScaleId: number;

  gradingScale: {
    id: number;
    name: string;
    description: string | null;

    boundaries: {
      id: number;
      grade: string;

      minimumScore: number;
      maximumScore: number;

      remark: string;

      gradePoint: number | null;

      position: number;
    }[];
  };
};

/* -------------------------------------------------------------------------- */
/*                              JSON HELPERS                                  */
/* -------------------------------------------------------------------------- */

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  /*
   * JSON.parse/stringify removes undefined properties,
   * Date instances and other non-JSON values.
   */
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

/* -------------------------------------------------------------------------- */
/*                           NUMBER UTILITIES                                 */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                            TEXT UTILITIES                                  */
/* -------------------------------------------------------------------------- */

function getStudentDisplayName(report: GeneratedStudentReport): string {
  return [report.student.name, report.student.surname]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/* -------------------------------------------------------------------------- */
/*                      CALCULATION-STATUS RESOLVER                           */
/* -------------------------------------------------------------------------- */

function resolveStudentCalculationStatus(
  report: GeneratedStudentReport,
): ReportCardCalculationStatus {
  if (report.calculationStatus) {
    return report.calculationStatus;
  }

  if (
    report.summary.subjectCount <= 0 ||
    report.summary.completedSubjectCount <= 0
  ) {
    return "BLOCKED";
  }

  if (report.summary.incompleteSubjectCount > 0) {
    return "PARTIAL";
  }

  return "READY";
}

/* -------------------------------------------------------------------------- */
/*                      STUDENT SUMMARY DERIVATION                            */
/* -------------------------------------------------------------------------- */

function deriveStudentMetrics(report: GeneratedStudentReport) {
  return {
    highestSubjectScore: report.summary.highestSubjectScore,

    lowestSubjectScore: report.summary.lowestSubjectScore,

    passedSubjectCount: report.summary.passedSubjectCount,

    failedSubjectCount: report.summary.failedSubjectCount,

    passRate: report.summary.passRate,

    totalGradePoints: report.summary.totalGradePoints,

    averageGradePoint: report.summary.averageGradePoint,

    overallGradePoint: report.overallGradePoint,

    calculationIssues: report.issues,
  };
}

/* -------------------------------------------------------------------------- */
/*                       SUBJECT SNAPSHOT BUILDERS                            */
/* -------------------------------------------------------------------------- */

function buildSubjectSnapshots({
  subject,
  configuration,
}: {
  subject: GeneratedSubjectResult;
  configuration: GenerationConfiguration;
}) {
  return {
    categorySnapshot: toJsonValue({
      assignment: subject.categories.assignment,

      assessment: subject.categories.assessment,

      examination: subject.categories.examination,
    }),

    weightedSnapshot: toJsonValue({
      assignment: subject.weighted.assignment,

      assessment: subject.weighted.assessment,

      examination: subject.weighted.examination,

      finalScore: subject.finalScore,

      totalAvailableWeight: subject.totalAvailableWeight,
    }),

    gradingSnapshot: toJsonValue({
      gradingScaleId: configuration.gradingScale.id,

      gradingScaleName: configuration.gradingScale.name,

      passMark: configuration.passMark,

      grade: subject.grade,

      remark: subject.remark,

      gradePoint: subject.gradePoint,

      passed: subject.passed,

      resolvedBoundary: subject.gradingScaleSnapshot.boundary,

      boundaries: configuration.gradingScale.boundaries,
    }),

    calculationIssues: toJsonValue(subject.issues),
  };
}

function buildSubjectCreateData({
  subject,
  configuration,
}: {
  subject: GeneratedSubjectResult;
  configuration: GenerationConfiguration;
}): Prisma.ReportCardSubjectCreateWithoutReportCardInput {
  const snapshots = buildSubjectSnapshots({
    subject,
    configuration,
  });

  const teacher = subject.subject.teacher;

  return {
    subject: {
      connect: {
        id: subject.subject.id,
      },
    },

    subjectName: subject.subject.name,

    teacherId: teacher?.id ?? null,

    teacherName: teacher ? `${teacher.name} ${teacher.surname}`.trim() : null,

    assignmentPercentage: subject.categories.assignment.percentage,

    assignmentWeight: subject.weighted.assignment.weight,

    assignmentScore: subject.weighted.assignment.weightedScore,

    assessmentPercentage: subject.categories.assessment.percentage,

    assessmentWeight: subject.weighted.assessment.weight,

    assessmentScore: subject.weighted.assessment.weightedScore,

    examinationPercentage: subject.categories.examination.percentage,

    examinationWeight: subject.weighted.examination.weight,

    examinationScore: subject.weighted.examination.weightedScore,

    finalScore: subject.finalScore,

    grade: subject.grade,

    remark: subject.remark,

    gradePoint: subject.gradePoint,

    passed: subject.passed,

    calculationStatus: subject.calculationStatus,

    subjectPosition: subject.position,

    classAverage: subject.classAverage,

    highestScore: subject.highestScore,

    lowestScore: subject.lowestScore,

    ...snapshots,
  };
}

function buildSubjectCreateManyData({
  reportCardId,
  subject,
  configuration,
}: {
  reportCardId: number;
  subject: GeneratedSubjectResult;
  configuration: GenerationConfiguration;
}): Prisma.ReportCardSubjectCreateManyInput {
  const snapshots = buildSubjectSnapshots({
    subject,
    configuration,
  });

  const teacher = subject.subject.teacher;

  return {
    reportCardId,

    subjectId: subject.subject.id,

    subjectName: subject.subject.name,

    teacherId: teacher?.id ?? null,

    teacherName: teacher ? `${teacher.name} ${teacher.surname}`.trim() : null,

    assignmentPercentage: subject.categories.assignment.percentage,

    assignmentWeight: subject.weighted.assignment.weight,

    assignmentScore: subject.weighted.assignment.weightedScore,

    assessmentPercentage: subject.categories.assessment.percentage,

    assessmentWeight: subject.weighted.assessment.weight,

    assessmentScore: subject.weighted.assessment.weightedScore,

    examinationPercentage: subject.categories.examination.percentage,

    examinationWeight: subject.weighted.examination.weight,

    examinationScore: subject.weighted.examination.weightedScore,

    finalScore: subject.finalScore,

    grade: subject.grade,

    remark: subject.remark,

    gradePoint: subject.gradePoint,

    passed: subject.passed,

    calculationStatus: subject.calculationStatus,

    subjectPosition: subject.position,

    classAverage: subject.classAverage,

    highestScore: subject.highestScore,

    lowestScore: subject.lowestScore,

    ...snapshots,
  };
}

/* -------------------------------------------------------------------------- */
/*                      REPORT-CARD SNAPSHOT BUILDERS                         */
/* -------------------------------------------------------------------------- */

function buildWeightingSnapshot(
  configuration: GenerationConfiguration,
): Prisma.InputJsonValue {
  return toJsonValue({
    sourceWeightingId: configuration.id,

    academicYear: configuration.academicYear,

    termId: configuration.termId,

    gradeId: configuration.gradeId,

    assignmentWeight: configuration.assignmentWeight,

    assessmentWeight: configuration.assessmentWeight,

    examinationWeight: configuration.examWeight,

    assessmentScoreStrategy: configuration.assessmentScoreStrategy,

    passMark: configuration.passMark,
  });
}

function buildGradingScaleSnapshot(
  configuration: GenerationConfiguration,
): Prisma.InputJsonValue {
  return toJsonValue({
    id: configuration.gradingScale.id,

    name: configuration.gradingScale.name,

    description: configuration.gradingScale.description,

    boundaries: configuration.gradingScale.boundaries,
  });
}

function buildReportSnapshot({
  report,
  calculationStatus,
  preservedManualFields,
}: {
  report: GeneratedStudentReport;

  calculationStatus: ReportCardCalculationStatus;

  preservedManualFields?: PreservedManualReportFields;
}): Prisma.InputJsonValue {
  const attendance = preservedManualFields
    ? {
        daysSchoolOpened: preservedManualFields.daysSchoolOpened,

        daysPresent: preservedManualFields.daysPresent,

        daysAbsent: preservedManualFields.daysAbsent,

        attendancePercentage: preservedManualFields.attendancePercentage,
      }
    : report.attendance;

  const remarks = preservedManualFields
    ? {
        conduct: preservedManualFields.conduct,

        attitude: preservedManualFields.attitude,

        interest: preservedManualFields.interest,

        classTeacherRemark: preservedManualFields.classTeacherRemark,

        headTeacherRemark: preservedManualFields.headTeacherRemark,

        promotionStatus: preservedManualFields.promotionStatus,

        termClosedOn: preservedManualFields.termClosedOn,

        nextTermBegins: preservedManualFields.nextTermBegins,
      }
    : report.remarks;

  return toJsonValue({
    student: report.student,

    period: report.period,

    calculationStatus,

    summary: report.summary,

    subjectCount: report.summary.subjectCount,

    completedSubjectCount: report.summary.completedSubjectCount,

    incompleteSubjectCount: report.summary.incompleteSubjectCount,

    totalScore: report.summary.totalScore,

    averageScore: report.summary.averageScore,

    overallGrade: report.overallGrade,

    overallRemark: report.overallRemark,

    overallGradePoint: report.overallGradePoint,

    overallPosition: report.overallPosition,

    classStudentCount: report.classStudentCount,

    attendance,

    remarks,

    issues: report.issues,

    subjects: report.subjects,

    generatedAt: report.generatedAt,
  });
}

/* -------------------------------------------------------------------------- */
/*                       REPORT-CARD SCALAR BUILDER                           */
/* -------------------------------------------------------------------------- */

function buildReportCardScalarData({
  report,
  configuration,
  now,
  generatedById,
  preservedManualFields,
}: {
  report: GeneratedStudentReport;

  configuration: GenerationConfiguration;

  now: Date;

  generatedById: string;

  preservedManualFields: PreservedManualReportFields;
}): Prisma.ReportCardUpdateInput {
  const calculationStatus = resolveStudentCalculationStatus(report);

  const metrics = deriveStudentMetrics(report);

  return {
    calculationStatus,

    sourceWeightingId: configuration.id,

    sourceGradingScaleId: configuration.gradingScale.id,

    subjectCount: report.summary.subjectCount,

    completedSubjectCount: report.summary.completedSubjectCount,

    incompleteSubjectCount: report.summary.incompleteSubjectCount,

    totalScore: report.summary.totalScore,

    averageScore: report.summary.averageScore,

    highestSubjectScore: metrics.highestSubjectScore,

    lowestSubjectScore: metrics.lowestSubjectScore,

    passedSubjectCount: metrics.passedSubjectCount,

    failedSubjectCount: metrics.failedSubjectCount,

    passRate: metrics.passRate,

    totalGradePoints: metrics.totalGradePoints,

    averageGradePoint: metrics.averageGradePoint,

    overallGrade: report.overallGrade,

    overallRemark: report.overallRemark,

    overallGradePoint: metrics.overallGradePoint,

    overallPosition: report.overallPosition,

    classStudentCount: report.classStudentCount,

    weightingSnapshot: buildWeightingSnapshot(configuration),

    gradingScaleSnapshot: buildGradingScaleSnapshot(configuration),

    reportSnapshot: buildReportSnapshot({
      report,
      calculationStatus,

      preservedManualFields,
    }),

    calculationIssues: toJsonValue(metrics.calculationIssues),

    regeneratedAt: now,

    generatedById,

    isStale: false,
    staleAt: null,
    staleReason: null,

    reviewStatus: "DRAFT",

    submittedForReviewAt: null,

    submittedForReviewBy: null,

    approvedAt: null,

    approvedBy: null,

    changesRequestedAt: null,

    changesRequestedBy: null,

    reviewNote: null,

    lockedAt: null,

    version: {
      increment: 1,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                  LOAD THE EXACT CONFIGURATION SNAPSHOT                     */
/* -------------------------------------------------------------------------- */

async function loadGenerationConfiguration(
  weightingId: number,
): Promise<GenerationConfiguration> {
  const configuration = await prisma.academicWeighting.findUnique({
    where: {
      id: weightingId,
    },

    select: {
      id: true,
      academicYear: true,

      termId: true,
      gradeId: true,

      assignmentWeight: true,

      assessmentWeight: true,

      examWeight: true,

      assessmentScoreStrategy: true,

      passMark: true,

      gradingScaleId: true,

      gradingScale: {
        select: {
          id: true,
          name: true,
          description: true,

          boundaries: {
            select: {
              id: true,
              grade: true,

              minimumScore: true,

              maximumScore: true,

              remark: true,

              gradePoint: true,

              position: true,
            },

            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });

  if (!configuration) {
    throw new Error(
      "The academic weighting used for generation could not be loaded.",
    );
  }

  return {
    ...configuration,

    assessmentScoreStrategy: String(configuration.assessmentScoreStrategy),
  };
}

/* -------------------------------------------------------------------------- */
/*                        GENERATE CLASS REPORT CARDS                         */
/* -------------------------------------------------------------------------- */

export async function generateClassReportCards(
  input: GenerateClassReportCardsInput,

  generatedById: string,
): Promise<ReportCardGenerationSummary> {
  if (!generatedById.trim()) {
    throw new Error(
      "The authenticated generation actor could not be resolved.",
    );
  }
  const startedAt = new Date();

  const academicYear = input.academicYear.trim();

  /* ------------------------------------------------------------------------ */
  /*                           VALIDATE REQUEST                               */
  /* ------------------------------------------------------------------------ */

  const validation = await validateReportCardGeneration({
    classId: input.classId,

    termId: input.termId,

    academicYear,
  });

  if (!validation.ready) {
    const message = validation.errors.map((check) => check.message).join(" ");

    throw new Error(message || "Report-card generation is blocked.");
  }

  if (validation.warnings.length > 0 && !input.allowPartial) {
    throw new Error(
      "Some student results are incomplete. Enable partial generation to continue.",
    );
  }

  if (!validation.class || !validation.term || !validation.weighting) {
    throw new Error("The report-card generation configuration is incomplete.");
  }

  /*
   * Capture the validated values in stable local constants.
   * TypeScript preserves these non-null types inside nested
   * transaction callbacks and other closures.
   */
  const validatedClass = validation.class;

  const validatedTerm = validation.term;

  const validatedWeighting = validation.weighting;

  const configuration = await loadGenerationConfiguration(
    validatedWeighting.id,
  );

  /* ------------------------------------------------------------------------ */
  /*                         LOAD ACADEMIC DATA                               */
  /* ------------------------------------------------------------------------ */

  const engineData = await loadClassTermReportData({
    classId: input.classId,

    termId: input.termId,

    academicYear,
  });

  /* ------------------------------------------------------------------------ */
  /*                         RUN CALCULATION ENGINE                           */
  /* ------------------------------------------------------------------------ */

  const classReport = buildClassTermReport(engineData);

  if (classReport.students.length === 0) {
    throw new Error("No student reports were produced by the academic engine.");
  }

  const studentIds = classReport.students.map((report) => report.student.id);

  /* ------------------------------------------------------------------------ */
  /*                    LOAD EXISTING PERSISTED CARDS                         */
  /* ------------------------------------------------------------------------ */

  const now = new Date();

  /* ------------------------------------------------------------------------ */
  /*                       PERSIST IN ONE TRANSACTION                         */
  /* ------------------------------------------------------------------------ */

  const transactionResult = await prisma.$transaction(
    async (tx) => {
      /* ---------------------------------------------------------------- */
      /*             LOAD CURRENT PERSISTED REPORT-CARD STATE             */
      /* ---------------------------------------------------------------- */

      const existingCards = await tx.reportCard.findMany({
        where: {
          studentId: {
            in: studentIds,
          },

          classId: validatedClass.id,

          termId: validatedTerm.id,

          academicYear,
        },

        select: {
          id: true,

          studentId: true,

          status: true,

          reviewStatus: true,

          calculationStatus: true,

          isStale: true,

          version: true,

          /* ---------------------------------------------------------- */
          /*                  MANUAL REPORT DATA                        */
          /* ---------------------------------------------------------- */

          daysSchoolOpened: true,

          daysPresent: true,

          daysAbsent: true,

          attendancePercentage: true,

          conduct: true,

          attitude: true,

          interest: true,

          classTeacherRemark: true,

          headTeacherRemark: true,

          promotionStatus: true,

          termClosedOn: true,

          nextTermBegins: true,
        },
      });

      const existingByStudentId = new Map(
        existingCards.map((card) => [card.studentId, card]),
      );

      const generatedItems: GeneratedReportCardItem[] = [];

      let created = 0;
      let regenerated = 0;
      let preserved = 0;
      let skipped = 0;

      let ready = 0;
      let partial = 0;
      let blocked = 0;

      let subjectSnapshotsCreated = 0;

      for (const studentReport of classReport.students) {
        const studentId = studentReport.student.id;

        const studentName = getStudentDisplayName(studentReport);

        const calculationStatus =
          resolveStudentCalculationStatus(studentReport);

        if (calculationStatus === "READY") {
          ready++;
        } else if (calculationStatus === "PARTIAL") {
          partial++;
        } else {
          blocked++;
        }

        const existing = existingByStudentId.get(studentId);

        /* ---------------------------------------------------------------- */
        /*                 PRESERVE PUBLISHED/ARCHIVED CARDS                 */
        /* ---------------------------------------------------------------- */

        if (existing && existing.status !== "DRAFT") {
          preserved++;

          generatedItems.push({
            reportCardId: existing.id,

            studentId,

            studentName,

            action: "PRESERVED",

            calculationStatus: existing.calculationStatus,

            subjectCount: studentReport.summary.subjectCount,

            completedSubjectCount: studentReport.summary.completedSubjectCount,

            incompleteSubjectCount:
              studentReport.summary.incompleteSubjectCount,

            averageScore: studentReport.summary.averageScore,

            overallGrade: studentReport.overallGrade,

            message:
              existing.status === "PUBLISHED"
                ? "Published report card preserved."
                : "Archived report card preserved.",
          });

          continue;
        }

        /* ---------------------------------------------------------------- */
        /*                           UPDATE DRAFT                            */
        /* ---------------------------------------------------------------- */

        if (existing) {
          const updateResult = await tx.reportCard.updateMany({
            where: {
              id: existing.id,

              status: "DRAFT",

              version: existing.version,
            },

            data: 
              buildReportCardScalarData({
                report: 
                  studentReport,

                configuration,

                now,

                generatedById,

                preservedManualFields: {
                  daysSchoolOpened: 
                    existing.daysSchoolOpened,

                  daysPresent: 
                    existing.daysPresent,

                  daysAbsent: 
                    existing.daysAbsent,

                  attendancePercentage: 
                    existing.attendancePercentage,

                  conduct: 
                    existing.conduct,

                  attitude: 
                    existing.attitude,

                  interest: 
                    existing.interest,

                  classTeacherRemark: 
                    existing.classTeacherRemark,

                  headTeacherRemark: 
                    existing.headTeacherRemark,

                  promotionStatus: 
                    existing.promotionStatus,

                  termClosedOn: 
                    existing.termClosedOn,

                  nextTermBegins: 
                    existing.nextTermBegins,
                },
              }),
          });

          if (updateResult.count !== 1) {
            skipped++;

            generatedItems.push({
              reportCardId: existing.id,

              studentId,

              studentName,

              action: "SKIPPED",

              calculationStatus,

              subjectCount: studentReport.summary.subjectCount,

              completedSubjectCount:
                studentReport.summary.completedSubjectCount,

              incompleteSubjectCount:
                studentReport.summary.incompleteSubjectCount,

              averageScore: studentReport.summary.averageScore,

              overallGrade: studentReport.overallGrade,

              message:
                "The draft was changed by another user and was not regenerated.",
            });

            continue;
          }

          await tx.reportCardSubject.deleteMany({
            where: {
              reportCardId: existing.id,
            },
          });

          if (studentReport.subjects.length > 0) {
            await tx.reportCardSubject.createMany({
              data: studentReport.subjects.map((subject) =>
                buildSubjectCreateManyData({
                  reportCardId: existing.id,

                  subject,

                  configuration,
                }),
              ),
            });
          }

          regenerated++;

          subjectSnapshotsCreated += studentReport.subjects.length;

          generatedItems.push({
            reportCardId: existing.id,

            studentId,

            studentName,

            action: "REGENERATED",

            calculationStatus,

            subjectCount: studentReport.summary.subjectCount,

            completedSubjectCount: studentReport.summary.completedSubjectCount,

            incompleteSubjectCount:
              studentReport.summary.incompleteSubjectCount,

            averageScore: studentReport.summary.averageScore,

            overallGrade: studentReport.overallGrade,

            message: "Draft report card regenerated.",
          });

          continue;
        }

        /* ---------------------------------------------------------------- */
        /*                           CREATE DRAFT                            */
        /* ---------------------------------------------------------------- */

        const metrics = deriveStudentMetrics(studentReport);

        const createdCard = await tx.reportCard.create({
          data: {
            student: {
              connect: {
                id: studentId,
              },
            },

            class: {
              connect: {
                id: validatedClass.id,
              },
            },

            grade: {
              connect: {
                id: validatedClass.grade.id,
              },
            },

            term: {
              connect: {
                id: validatedTerm.id,
              },
            },

            academicYear,

            status: "DRAFT",

            reviewStatus: "DRAFT",

            calculationStatus,

            version: 1,

            daysSchoolOpened: studentReport.attendance.daysSchoolOpened,

            daysPresent: studentReport.attendance.daysPresent,

            daysAbsent: studentReport.attendance.daysAbsent,

            attendancePercentage: studentReport.attendance.attendancePercentage,

            conduct: studentReport.remarks.conduct,

            classTeacherRemark: studentReport.remarks.classTeacherRemark,

            headTeacherRemark: studentReport.remarks.headTeacherRemark,

            promotionStatus: studentReport.remarks.promotionStatus,

            nextTermBegins: studentReport.remarks.nextTermBegins
              ? new Date(studentReport.remarks.nextTermBegins)
              : null,

            sourceWeightingId: configuration.id,

            sourceGradingScaleId: configuration.gradingScale.id,

            subjectCount: studentReport.summary.subjectCount,

            completedSubjectCount: studentReport.summary.completedSubjectCount,

            incompleteSubjectCount:
              studentReport.summary.incompleteSubjectCount,

            totalScore: studentReport.summary.totalScore,

            averageScore: studentReport.summary.averageScore,

            highestSubjectScore: metrics.highestSubjectScore,

            lowestSubjectScore: metrics.lowestSubjectScore,

            passedSubjectCount: metrics.passedSubjectCount,

            failedSubjectCount: metrics.failedSubjectCount,

            passRate: metrics.passRate,

            totalGradePoints: metrics.totalGradePoints,

            averageGradePoint: metrics.averageGradePoint,

            overallGrade: studentReport.overallGrade,

            overallRemark: studentReport.overallRemark,

            overallGradePoint: metrics.overallGradePoint,

            overallPosition: studentReport.overallPosition,

            classStudentCount: studentReport.classStudentCount,

            weightingSnapshot: buildWeightingSnapshot(configuration),

            gradingScaleSnapshot: buildGradingScaleSnapshot(configuration),

            reportSnapshot: buildReportSnapshot({
              report: studentReport,

              calculationStatus,
            }),

            calculationIssues: toJsonValue(metrics.calculationIssues),

            generatedAt: now,

            generatedById: generatedById,

            regeneratedAt: null,

            subjects: {
              create: studentReport.subjects.map((subject) =>
                buildSubjectCreateData({
                  subject,

                  configuration,
                }),
              ),
            },
          },

          select: {
            id: true,
          },
        });

        created++;

        subjectSnapshotsCreated += studentReport.subjects.length;

        generatedItems.push({
          reportCardId: createdCard.id,

          studentId,

          studentName,

          action: "CREATED",

          calculationStatus,

          subjectCount: studentReport.summary.subjectCount,

          completedSubjectCount: studentReport.summary.completedSubjectCount,

          incompleteSubjectCount: studentReport.summary.incompleteSubjectCount,

          averageScore: studentReport.summary.averageScore,

          overallGrade: studentReport.overallGrade,

          message: "Draft report card created.",
        });
      }

      return {
        generatedItems,

        created,
        regenerated,
        preserved,
        skipped,

        ready,
        partial,
        blocked,

        subjectSnapshotsCreated,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

      maxWait: 10_000,

      timeout: 60_000,
    },
  );

  const completedAt = new Date();

  return {
    classId: validatedClass.id,

    className: validatedClass.name,

    gradeId: validatedClass.grade.id,

    gradeLevel: validatedClass.grade.level,

    termId: validatedTerm.id,

    termName: validatedTerm.name,

    academicYear,

    studentCount: classReport.students.length,

    subjectCount: validation.summary.subjects,

    created: transactionResult.created,

    regenerated: transactionResult.regenerated,

    preserved: transactionResult.preserved,

    skipped: transactionResult.skipped,

    ready: transactionResult.ready,

    partial: transactionResult.partial,

    blocked: transactionResult.blocked,

    subjectSnapshotsCreated: transactionResult.subjectSnapshotsCreated,

    startedAt,
    completedAt,

    durationMilliseconds: completedAt.getTime() - startedAt.getTime(),

    reportCards: transactionResult.generatedItems,

    warnings: validation.warnings.map((warning) => warning.message),
  };
}
