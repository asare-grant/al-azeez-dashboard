import type {
  ReportCardCalculationStatus,
  TermName,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  requireReportCardUser,
} from "./auth";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type ReportCardGenerationCheckSeverity =
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export type ReportCardGenerationCheckStatus =
  | "READY"
  | "PARTIAL"
  | "BLOCKED";

export type ReportCardGenerationCheck = {
  id: string;
  title: string;

  status:
    ReportCardGenerationCheckStatus;

  severity:
    ReportCardGenerationCheckSeverity;

  message: string;

  count?: number;
};

export type ReportCardGenerationValidationSummary = {
  students: number;
  subjects: number;

  assignments: number;
  assessments: number;
  examinations: number;

  assignmentResults: number;
  assessmentResults: number;
  examinationResults: number;

  existingReportCards: number;
  existingDrafts: number;
  publishedCards: number;
  archivedCards: number;
};


export type ReportCardGenerationSubjectSummary = {
  subjectId: number;
  subjectName: string;

  studentCount: number;

  assignmentCount: number;
  assessmentCount: number;
  examinationCount: number;

  assignmentResultCount: number;
  assessmentResultCount: number;
  examinationResultCount: number;

  missingAssignmentResults: number;
  missingAssessmentResults: number;
  missingExaminationResults: number;

  calculationStatus:
    ReportCardCalculationStatus;
};

export type ReportCardGenerationValidation = {
  ready: boolean;
  canGeneratePartialReports: boolean;

  completionPercentage: number;

  class: {
    id: number;
    name: string;

    grade: {
      id: number;
      level: string;
    };
  } | null;

  term: {
    id: number;
    name: TermName;
    isActive: boolean;
  } | null;

  academicYear: string;

  weighting: {
    id: number;

    assignmentWeight: number;
    assessmentWeight: number;
    examWeight: number;

    passMark: number;

    gradingScale: {
      id: number;
      name: string;
    };
  } | null;

  summary:
    ReportCardGenerationValidationSummary;

  subjects:
    ReportCardGenerationSubjectSummary[];

  checks:
    ReportCardGenerationCheck[];

  errors:
    ReportCardGenerationCheck[];

  warnings:
    ReportCardGenerationCheck[];

  successes:
    ReportCardGenerationCheck[];
};

/* -------------------------------------------------------------------------- */
/*                                VALIDATION                                  */
/* -------------------------------------------------------------------------- */

export async function validateReportCardGeneration({
  classId,
  academicYear,
  termId,
}: {
  classId: number;
  academicYear: string;
  termId: number;
}): Promise<ReportCardGenerationValidation> {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (
    role !== "admin" &&
    role !== "teacher"
  ) {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  const normalizedAcademicYear =
    academicYear.trim();

  const emptySummary:
    ReportCardGenerationValidationSummary = {
    students: 0,
    subjects: 0,

    assignments: 0,
    assessments: 0,
    examinations: 0,

    assignmentResults: 0,
    assessmentResults: 0,
    examinationResults: 0,

    existingReportCards: 0,
    existingDrafts: 0,
    publishedCards: 0,
    archivedCards: 0,
  };

  if (
    !Number.isInteger(classId) ||
    classId <= 0 ||
    !Number.isInteger(termId) ||
    termId <= 0 ||
    !normalizedAcademicYear
  ) {
    const check:
      ReportCardGenerationCheck = {
      id: "selection",
      title: "Academic selection",
      status: "BLOCKED",
      severity: "ERROR",
      message:
        "Select a valid class, academic year, and school term.",
    };

    return {
      ready: false,
      canGeneratePartialReports: false,
      completionPercentage: 0,

      class: null,
      term: null,

      academicYear:
        normalizedAcademicYear,

      weighting: null,

      summary:
        emptySummary,

      subjects: [],

      checks: [check],
      errors: [check],
      warnings: [],
      successes: [],
    };
  }

  const [
    classRecord,
    term,
  ] = await Promise.all([
    prisma.class.findFirst({
      where: {
        id: classId,

        ...(role === "teacher"
          ? {
              lessons: {
                some: {
                  teacherId:
                    userId,
                },
              },
            }
          : {}),
      },

      select: {
        id: true,
        name: true,

        grade: {
          select: {
            id: true,
            level: true,
          },
        },

        students: {
          select: {
            id: true,
          },
        },

        lessons: {
          select: {
            id: true,

            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),

    prisma.schoolTerm.findUnique({
      where: {
        id: termId,
      },

      select: {
        id: true,
        name: true,
        isActive: true,
      },
    }),
  ]);

  const checks:
    ReportCardGenerationCheck[] = [];

  function addCheck(
    check:
      ReportCardGenerationCheck,
  ) {
    checks.push(check);
  }

  if (!classRecord) {
    addCheck({
      id: "class",
      title: "Class access",
      status: "BLOCKED",
      severity: "ERROR",
      message:
        "The selected class could not be found or you do not have permission to manage it.",
    });
  }

  if (!term) {
    addCheck({
      id: "term",
      title: "School term",
      status: "BLOCKED",
      severity: "ERROR",
      message:
        "The selected school term could not be found.",
    });
  }

  if (
    !classRecord ||
    !term
  ) {
    const errors =
      checks.filter(
        (check) =>
          check.severity ===
          "ERROR",
      );

    return {
      ready: false,
      canGeneratePartialReports: false,
      completionPercentage: 0,

      class: classRecord
        ? {
            id:
              classRecord.id,

            name:
              classRecord.name,

            grade:
              classRecord.grade,
          }
        : null,

      term,

      academicYear:
        normalizedAcademicYear,

      weighting: null,

      summary:
        emptySummary,

      subjects: [],

      checks,
      errors,
      warnings: [],
      successes: [],
    };
  }

  const studentIds =
    classRecord.students.map(
      (student) =>
        student.id,
    );

  const lessonIds =
    classRecord.lessons.map(
      (lesson) =>
        lesson.id,
    );

  const [
     gradeWeighting,

    assignments,
    assessments,
    examinations,

    existingStatusGroups,
  ] = await prisma.$transaction([
    prisma.academicWeighting.findFirst({
      where: {
        academicYear:
          normalizedAcademicYear,

        termId:
          term.id,

        gradeId:
          classRecord.grade.id,

        isActive: true,
      },

      select: {
        id: true,

        assignmentWeight: true,
        assessmentWeight: true,
        examWeight: true,

        passMark: true,

        gradingScale: {
          select: {
            id: true,
            name: true,

            boundaries: {
              select: {
                id: true,
              },
            },
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    }),

    prisma.assignment.findMany({
      where: {
        lessonId: {
          in: lessonIds,
        },

        academicYear:
          normalizedAcademicYear,

        termId:
          term.id,
      },

      select: {
        id: true,
        lessonId: true,

        results: {
          where: {
            studentId: {
              in: studentIds,
            },
          },

          select: {
            id: true,
            studentId: true,
          },
        },
      },
    }),

    prisma.assessment.findMany({
      where: {
        lessonId: {
          in: lessonIds,
        },

        academicYear:
          normalizedAcademicYear,

        termId:
          term.id,
      },

      select: {
        id: true,
        lessonId: true,

        results: {
          where: {
            studentId: {
              in: studentIds,
            },
          },

          select: {
            id: true,
            studentId: true,
          },
        },
      },
    }),

    prisma.exam.findMany({
      where: {
        lessonId: {
          in: lessonIds,
        },

        academicYear:
          normalizedAcademicYear,

        termId:
          term.id,
      },

      select: {
        id: true,
        lessonId: true,

        results: {
          where: {
            studentId: {
              in: studentIds,
            },
          },

          select: {
            id: true,
            studentId: true,
          },
        },
      },
    }),

    prisma.reportCard.groupBy({
      by: ["status"],

      where: {
        classId:
          classRecord.id,

        academicYear:
          normalizedAcademicYear,

        termId:
          term.id,
      },

      _count: {
        _all: true,
      },
    }),
  ]);

  const selectedWeighting =
    gradeWeighting;

  /* ------------------------------------------------------------------------ */
  /*                          FOUNDATION CHECKS                               */
  /* ------------------------------------------------------------------------ */

  if (
    classRecord.students.length >
    0
  ) {
    addCheck({
      id: "students",
      title: "Students",
      status: "READY",
      severity: "SUCCESS",
      count:
        classRecord.students.length,
      message: `${classRecord.students.length} student${
        classRecord.students.length ===
        1
          ? ""
          : "s"
      } found in ${classRecord.name}.`,
    });
  } else {
    addCheck({
      id: "students",
      title: "Students",
      status: "BLOCKED",
      severity: "ERROR",
      count: 0,
      message:
        "The selected class has no students.",
    });
  }

  if (
    classRecord.lessons.length >
    0
  ) {
    addCheck({
      id: "subjects",
      title: "Subjects",
      status: "READY",
      severity: "SUCCESS",
      count:
        classRecord.lessons.length,
      message: `${classRecord.lessons.length} subject${
        classRecord.lessons.length ===
        1
          ? ""
          : "s"
      } found for the class.`,
    });
  } else {
    addCheck({
      id: "subjects",
      title: "Subjects",
      status: "BLOCKED",
      severity: "ERROR",
      count: 0,
      message:
        "The selected class has no lessons or subjects.",
    });
  }

  if (!selectedWeighting) {
    addCheck({
      id: "weighting",
      title: "Academic weighting",
      status: "BLOCKED",
      severity: "ERROR",
      message:
        "No active academic weighting is configured for this grade, year, and term.",
    });
  } else {
    const totalWeight =
      selectedWeighting
        .assignmentWeight +
      selectedWeighting
        .assessmentWeight +
      selectedWeighting
        .examWeight;

    if (
      Math.abs(
        totalWeight - 100,
      ) <= 0.001
    ) {
      addCheck({
        id: "weighting",
        title: "Academic weighting",
        status: "READY",
        severity: "SUCCESS",
        message:
          `Academic weighting is configured: ` +
          `${selectedWeighting.assignmentWeight}% assignment, ` +
          `${selectedWeighting.assessmentWeight}% assessment, and ` +
          `${selectedWeighting.examWeight}% examination.`,
      });
    } else {
      addCheck({
        id: "weighting",
        title: "Academic weighting",
        status: "BLOCKED",
        severity: "ERROR",
        message:
          `The configured academic weights total ${totalWeight}% instead of 100%.`,
      });
    }

    if (
      selectedWeighting
        .gradingScale &&
      selectedWeighting
        .gradingScale
        .boundaries.length >
        0
    ) {
      addCheck({
        id: "grading-scale",
        title: "Grading scale",
        status: "READY",
        severity: "SUCCESS",
        message:
          `${selectedWeighting.gradingScale.name} is connected and contains grade boundaries.`,
      });
    } else {
      addCheck({
        id: "grading-scale",
        title: "Grading scale",
        status: "BLOCKED",
        severity: "ERROR",
        message:
          "The academic weighting does not have a valid grading scale with grade boundaries.",
      });
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                          SUBJECT ANALYSIS                                */
  /* ------------------------------------------------------------------------ */

  const subjectSummaries:
    ReportCardGenerationSubjectSummary[] =
    classRecord.lessons.map(
      (lesson) => {
        const lessonAssignments =
          assignments.filter(
            (item) =>
              item.lessonId ===
              lesson.id,
          );

        const lessonAssessments =
          assessments.filter(
            (item) =>
              item.lessonId ===
              lesson.id,
          );

        const lessonExaminations =
          examinations.filter(
            (item) =>
              item.lessonId ===
              lesson.id,
          );

        const assignmentStudentIds =
          new Set(
            lessonAssignments.flatMap(
              (item) =>
                item.results.map(
                  (result) =>
                    result.studentId,
                ),
            ),
          );

        const assessmentStudentIds =
          new Set(
            lessonAssessments.flatMap(
              (item) =>
                item.results.map(
                  (result) =>
                    result.studentId,
                ),
            ),
          );

        const examinationStudentIds =
          new Set(
            lessonExaminations.flatMap(
              (item) =>
                item.results.map(
                  (result) =>
                    result.studentId,
                ),
            ),
          );

        const assignmentRequired =
          (selectedWeighting
            ?.assignmentWeight ??
            0) > 0;

        const assessmentRequired =
          (selectedWeighting
            ?.assessmentWeight ??
            0) > 0;

        const examinationRequired =
          (selectedWeighting
            ?.examWeight ??
            0) > 0;

        const missingAssignmentResults =
          assignmentRequired
            ? studentIds.filter(
                (studentId) =>
                  !assignmentStudentIds.has(
                    studentId,
                  ),
              ).length
            : 0;

        const missingAssessmentResults =
          assessmentRequired
            ? studentIds.filter(
                (studentId) =>
                  !assessmentStudentIds.has(
                    studentId,
                  ),
              ).length
            : 0;

        const missingExaminationResults =
          examinationRequired
            ? studentIds.filter(
                (studentId) =>
                  !examinationStudentIds.has(
                    studentId,
                  ),
              ).length
            : 0;

        const hasBlockingConfiguration =
          (assignmentRequired &&
            lessonAssignments.length ===
              0) ||
          (assessmentRequired &&
            lessonAssessments.length ===
              0) ||
          (examinationRequired &&
            lessonExaminations.length ===
              0);

        const hasMissingResults =
          missingAssignmentResults >
            0 ||
          missingAssessmentResults >
            0 ||
          missingExaminationResults >
            0;

        const calculationStatus:
          ReportCardCalculationStatus =
          hasBlockingConfiguration
            ? "BLOCKED"
            : hasMissingResults
              ? "PARTIAL"
              : "READY";

        return {
          subjectId:
            lesson.subject.id,

          subjectName:
            lesson.subject.name,

          studentCount:
            studentIds.length,

          assignmentCount:
            lessonAssignments.length,

          assessmentCount:
            lessonAssessments.length,

          examinationCount:
            lessonExaminations.length,

          assignmentResultCount:
            lessonAssignments.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.results.length,

              0,
            ),

          assessmentResultCount:
            lessonAssessments.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.results.length,

              0,
            ),

          examinationResultCount:
            lessonExaminations.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.results.length,

              0,
            ),

          missingAssignmentResults,
          missingAssessmentResults,
          missingExaminationResults,

          calculationStatus,
        };
      },
    );

  for (
    const subject of
    subjectSummaries
  ) {
    if (
      subject.calculationStatus ===
      "READY"
    ) {
      addCheck({
        id:
          `subject-${subject.subjectId}`,

        title:
          subject.subjectName,

        status: "READY",
        severity: "SUCCESS",

        message:
          "All required academic result categories are available for this subject.",
      });

      continue;
    }

    if (
      subject.calculationStatus ===
      "BLOCKED"
    ) {
      const missingCategories:
        string[] = [];

      if (
        selectedWeighting &&
        selectedWeighting
          .assignmentWeight >
          0 &&
        subject.assignmentCount ===
          0
      ) {
        missingCategories.push(
          "assignment",
        );
      }

      if (
        selectedWeighting &&
        selectedWeighting
          .assessmentWeight >
          0 &&
        subject.assessmentCount ===
          0
      ) {
        missingCategories.push(
          "assessment",
        );
      }

      if (
        selectedWeighting &&
        selectedWeighting
          .examWeight >
          0 &&
        subject.examinationCount ===
          0
      ) {
        missingCategories.push(
          "examination",
        );
      }

      addCheck({
        id:
          `subject-${subject.subjectId}`,

        title:
          subject.subjectName,

        status: "BLOCKED",
        severity: "ERROR",

        message:
          `Required ${missingCategories.join(
            ", ",
          )} records have not been created for this subject.`,
      });

      continue;
    }

    const missingParts:
      string[] = [];

    if (
      subject
        .missingAssignmentResults >
      0
    ) {
      missingParts.push(
        `${subject.missingAssignmentResults} assignment`,
      );
    }

    if (
      subject
        .missingAssessmentResults >
      0
    ) {
      missingParts.push(
        `${subject.missingAssessmentResults} assessment`,
      );
    }

    if (
      subject
        .missingExaminationResults >
      0
    ) {
      missingParts.push(
        `${subject.missingExaminationResults} examination`,
      );
    }

    addCheck({
      id:
        `subject-${subject.subjectId}`,

      title:
        subject.subjectName,

      status: "PARTIAL",
      severity: "WARNING",

      message:
        `${missingParts.join(
          ", ",
        )} student result${
          missingParts.length ===
          1
            ? " is"
            : "s are"
        } missing.`,
    });
  }

  /* ------------------------------------------------------------------------ */
  /*                                 SUMMARY                                  */
  /* ------------------------------------------------------------------------ */

  const lifecycleCount =
    new Map(
      existingStatusGroups.map(
        (group) => [
          group.status,
          group._count._all,
        ],
      ),
    );

  const existingReportCards =
  existingStatusGroups.reduce(
    (
      total,
      group,
    ) =>
      total +
      group._count._all,

    0,
  );

  const summary:
    ReportCardGenerationValidationSummary = {
    students:
      classRecord.students.length,

    subjects:
      classRecord.lessons.length,

    assignments:
      assignments.length,

    assessments:
      assessments.length,

    examinations:
      examinations.length,

    assignmentResults:
      assignments.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.results.length,

        0,
      ),

    assessmentResults:
      assessments.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.results.length,

        0,
      ),

    examinationResults:
      examinations.reduce(
        (
          total,
          item,
        ) =>
          total +
          item.results.length,

        0,
      ),

    existingReportCards,

    existingDrafts:
      lifecycleCount.get(
        "DRAFT",
      ) ?? 0,

    publishedCards:
      lifecycleCount.get(
        "PUBLISHED",
      ) ?? 0,

    archivedCards:
      lifecycleCount.get(
        "ARCHIVED",
      ) ?? 0,
  };

  const errors =
    checks.filter(
      (check) =>
        check.severity ===
        "ERROR",
    );

  const warnings =
    checks.filter(
      (check) =>
        check.severity ===
        "WARNING",
    );

  const successes =
    checks.filter(
      (check) =>
        check.severity ===
        "SUCCESS",
    );

  const completionPercentage =
    checks.length === 0
      ? 0
      : Math.round(
          (successes.length /
            checks.length) *
            100,
        );

  const ready =
    errors.length === 0;

  return {
    ready,

    /*
     * Partial reports may be generated when the
     * underlying class configuration is valid but
     * individual students are missing some results.
     */
    canGeneratePartialReports:
      ready &&
      warnings.length > 0,

    completionPercentage,

    class: {
      id:
        classRecord.id,

      name:
        classRecord.name,

      grade:
        classRecord.grade,
    },

    term,

    academicYear:
      normalizedAcademicYear,

    weighting:
      selectedWeighting &&
      selectedWeighting
        .gradingScale
        ? {
            id:
              selectedWeighting.id,

            assignmentWeight:
              selectedWeighting
                .assignmentWeight,

            assessmentWeight:
              selectedWeighting
                .assessmentWeight,

            examWeight:
              selectedWeighting
                .examWeight,

            passMark:
              selectedWeighting
                .passMark,

            gradingScale: {
              id:
                selectedWeighting
                  .gradingScale.id,

              name:
                selectedWeighting
                  .gradingScale.name,
            },
          }
        : null,

    summary,

    subjects:
      subjectSummaries,

    checks,

    errors,
    warnings,
    successes,
  };
}

