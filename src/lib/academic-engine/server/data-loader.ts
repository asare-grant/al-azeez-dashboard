// src/lib/academic-engine/server/data-loader.ts

import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  normalizeAcademicResults,
} from "../normalize-result";

import {
  groupResultsByStudent,
} from "../group-results";

import {
  validateGradingScale,
} from "../grading-scale";

import type {
  AcademicEngineResultRecord,
  AcademicEngineStudent,
  AcademicEngineSubject,
  AcademicGradingScale,
  AcademicPeriodContext,
  AcademicWeightingRule,
  ClassTermCalculationInput,
  NormalizedAcademicResult,
  StudentTermCalculationInput,
} from "../types";

import {
  adaptDatabaseResults,
} from "./result-adapter";

import type {
  AcademicResultDatabaseRow,
} from "./result-adapter";

import {
  AcademicEngineLoaderError,
  getAcademicEngineLoaderErrorMessage,
} from "./errors";

import type {
  AcademicEngineLoaderIssue,
  LoadClassTermEngineInput,
  LoadClassTermEngineResult,
  LoadedClassTermEngineData,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                            INPUT VALIDATION                                */
/* -------------------------------------------------------------------------- */

function validateLoadInput(
  input: LoadClassTermEngineInput,
) {
  if (
    !Number.isInteger(
      input.classId,
    ) ||
    input.classId <= 0
  ) {
    throw new AcademicEngineLoaderError(
      "CLASS_NOT_FOUND",
      "Select a valid class.",
    );
  }

  if (
    !Number.isInteger(
      input.termId,
    ) ||
    input.termId <= 0
  ) {
    throw new AcademicEngineLoaderError(
      "TERM_NOT_FOUND",
      "Select a valid school term.",
    );
  }

  if (
    !input.academicYear.trim()
  ) {
    throw new AcademicEngineLoaderError(
      "TERM_YEAR_MISMATCH",
      "Select a valid academic year.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                            RESULT FILTER                                   */
/* -------------------------------------------------------------------------- */

function createResultWhereInput({
  classId,
  academicYear,
  termId,
  studentIds,
}: LoadClassTermEngineInput & {
  studentIds: string[];
}): Prisma.ResultWhereInput {
  return {
    studentId: {
      in: studentIds,
    },

    OR: [
      {
        type:
          "ASSIGNMENT",

        assignment: {
          is: {
            academicYear,
            termId,

            lesson: {
              classId,
            },
          },
        },
      },

      {
        type:
          "ASSESSMENT",

        assessment: {
          is: {
            academicYear,
            termId,

            lesson: {
              classId,
            },
          },
        },
      },

      {
        type:
          "EXAM",

        exam: {
          is: {
            academicYear,
            termId,

            lesson: {
              classId,
            },
          },
        },
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*                       STUDENT TRANSFORMATION                               */
/* -------------------------------------------------------------------------- */

type LoadedStudentRow = {
  id: string;
  studentId: string;

  name: string;
  surname: string;

  class: {
    id: number;
    name: string;
  };

  grade: {
    id: number;
    level: string;
  };
};

function mapStudent(
  student: LoadedStudentRow,
): AcademicEngineStudent {
  return {
    id:
      student.id,

    studentId:
      student.studentId,

    name:
      student.name,

    surname:
      student.surname,

    class:
      student.class,

    grade:
      student.grade,
  };
}

/* -------------------------------------------------------------------------- */
/*                         SUBJECT TRANSFORMATION                             */
/* -------------------------------------------------------------------------- */

type LoadedLessonRow = {
  id: number;

  subject: {
    id: number;
    name: string;
  };

  teacher: {
    id: string;
    name: string;
    surname: string;
  };
};

function createUniqueSubjects(
  lessons: LoadedLessonRow[],
): AcademicEngineSubject[] {
  const subjects =
    new Map<
      number,
      AcademicEngineSubject
    >();

  for (const lesson of lessons) {
    if (
      subjects.has(
        lesson.subject.id,
      )
    ) {
      continue;
    }

    subjects.set(
      lesson.subject.id,
      {
        id:
          lesson.subject.id,

        name:
          lesson.subject.name,

        teacher: {
          id:
            lesson.teacher.id,

          name:
            lesson.teacher.name,

          surname:
            lesson.teacher.surname,
        },
      },
    );
  }

  return Array.from(
    subjects.values(),
  ).sort(
    (first, second) =>
      first.name.localeCompare(
        second.name,
      ),
  );
}

/* -------------------------------------------------------------------------- */
/*                     CONFIGURATION TRANSFORMATION                           */
/* -------------------------------------------------------------------------- */

function mapWeighting({
  weighting,
  gradeId,
}: {
  weighting: {
    id: number;

    academicYear: string;

    termId: number;
    gradeId: number | null;

    gradingScaleId: number | null;

    assignmentWeight: number;
    assessmentWeight: number;
    examWeight: number;

    assessmentScoreStrategy:
      AcademicWeightingRule["assessmentScoreStrategy"];

    passMark: number;

    isActive: boolean;
  };

  gradeId: number;
}): AcademicWeightingRule {
  if (!weighting.gradingScaleId) {
    throw new AcademicEngineLoaderError(
      "NO_GRADING_SCALE",
      "The active academic weighting has no grading scale.",
    );
  }

  return {
    id:
      weighting.id,

    academicYear:
      weighting.academicYear,

    termId:
      weighting.termId,

    /*
     * A school-wide weighting may have gradeId = null.
     * The engine resolves it to the selected class grade.
     */
    gradeId:
      weighting.gradeId ??
      gradeId,

    gradingScaleId:
      weighting.gradingScaleId,

    assignmentWeight:
      weighting.assignmentWeight,

    assessmentWeight:
      weighting.assessmentWeight,

    examWeight:
      weighting.examWeight,

    assessmentScoreStrategy:
      weighting.assessmentScoreStrategy,

    assignmentScoreStrategy:
      "AVERAGE",

    examinationScoreStrategy:
      "LATEST",

    passMark:
      weighting.passMark,

    isActive:
      weighting.isActive,
  };
}

function mapGradingScale(
  scale: {
    id: number;
    name: string;
    description: string | null;
    isDefault: boolean;

    boundaries: {
      id: number;
      grade: string;

      minimumScore: number;
      maximumScore: number;

      remark: string;
      gradePoint: number | null;

      position: number;
    }[];
  },
): AcademicGradingScale {
  return {
    id:
      scale.id,

    name:
      scale.name,

    description:
      scale.description,

    isDefault:
      scale.isDefault,

    boundaries:
      scale.boundaries.map(
        (boundary) => ({
          id:
            boundary.id,

          grade:
            boundary.grade,

          minimumScore:
            boundary.minimumScore,

          maximumScore:
            boundary.maximumScore,

          remark:
            boundary.remark,

          gradePoint:
            boundary.gradePoint,

          position:
            boundary.position,
        }),
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT INPUT BUILDER                              */
/* -------------------------------------------------------------------------- */

function filterSubjectResults({
  results,
  subjectId,
  type,
}: {
  results:
    NormalizedAcademicResult[];

  subjectId: number;

  type:
    NormalizedAcademicResult["type"];
}) {
  return results.filter(
    (result) =>
      result.subjectId ===
        subjectId &&
      result.type === type,
  );
}

function buildStudentInputs({
  students,
  subjects,
  normalizedResults,
  period,
  weighting,
  gradingScale,
}: {
  students:
    AcademicEngineStudent[];

  subjects:
    AcademicEngineSubject[];

  normalizedResults:
    NormalizedAcademicResult[];

  period:
    AcademicPeriodContext;

  weighting:
    AcademicWeightingRule;

  gradingScale:
    AcademicGradingScale;
}): StudentTermCalculationInput[] {
  const groupedByStudent =
    groupResultsByStudent(
      normalizedResults,
    );

  return students.map(
    (student) => {
      const studentResults =
        groupedByStudent.get(
          student.id,
        )?.all ?? [];

      return {
        student,

        period,

        weighting,

        gradingScale,

        subjects:
          subjects.map(
            (subject) => ({
              subject,

              assignments:
                filterSubjectResults({
                  results:
                    studentResults,

                  subjectId:
                    subject.id,

                  type:
                    "ASSIGNMENT",
                }),

              assessments:
                filterSubjectResults({
                  results:
                    studentResults,

                  subjectId:
                    subject.id,

                  type:
                    "ASSESSMENT",
                }),

              examinations:
                filterSubjectResults({
                  results:
                    studentResults,

                  subjectId:
                    subject.id,

                  type:
                    "EXAM",
                }),
            }),
          ),
      };
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                          MAIN DATA LOADER                                  */
/* -------------------------------------------------------------------------- */

export async function loadClassTermEngineData(
  input:
    LoadClassTermEngineInput,
): Promise<LoadClassTermEngineResult> {
  try {
    validateLoadInput(input);

    const academicYear =
      input.academicYear.trim();

    /*
     * Load the class and term first because their IDs
     * determine every subsequent query.
     */
    const [
      selectedClass,
      term,
    ] = await Promise.all([
      prisma.class.findUnique({
        where: {
          id:
            input.classId,
        },

        select: {
          id: true,
          name: true,
          gradeId: true,

          grade: {
            select: {
              id: true,
              level: true,
            },
          },

          students: {
            select: {
              id: true,
              studentId: true,

              name: true,
              surname: true,

              class: {
                select: {
                  id: true,
                  name: true,
                },
              },

              grade: {
                select: {
                  id: true,
                  level: true,
                },
              },
            },

            orderBy: [
              {
                surname: "asc",
              },

              {
                name: "asc",
              },
            ],
          },
        },
      }),

      prisma.schoolTerm.findUnique({
        where: {
          id:
            input.termId,
        },

        select: {
          id: true,
          name: true,

          startDate: true,
          endDate: true,

          isActive: true,
        },
      }),
    ]);

    if (!selectedClass) {
      throw new AcademicEngineLoaderError(
        "CLASS_NOT_FOUND",
        "The selected class could not be found.",
      );
    }

    if (!term) {
      throw new AcademicEngineLoaderError(
        "TERM_NOT_FOUND",
        "The selected school term could not be found.",
      );
    }

    const issues:
      AcademicEngineLoaderIssue[] =
      [];

    if (
      selectedClass.students
        .length === 0
    ) {
      issues.push({
        code:
          "NO_STUDENTS",

        message:
          `${selectedClass.name} has no students.`,

        severity:
          "ERROR",
      });
    }

    const [
      lessons,
      exactWeighting,
      generalWeighting,
    ] = await Promise.all([
      prisma.lesson.findMany({
        where: {
          classId:
            selectedClass.id,
        },

        select: {
          id: true,

          subject: {
            select: {
              id: true,
              name: true,
            },
          },

          teacher: {
            select: {
              id: true,
              name: true,
              surname: true,
            },
          },
        },

        orderBy: {
          subject: {
            name: "asc",
          },
        },
      }),

      /*
       * Prefer a weighting configured specifically
       * for the selected grade.
       */
      prisma.academicWeighting.findFirst({
        where: {
          academicYear,

          termId:
            term.id,

          gradeId:
            selectedClass.grade.id,

          isActive:
            true,
        },

        orderBy: {
          updatedAt:
            "desc",
        },

        select: {
          id: true,

          academicYear: true,

          termId: true,
          gradeId: true,

          gradingScaleId: true,

          assignmentWeight: true,
          assessmentWeight: true,
          examWeight: true,

          assessmentScoreStrategy:
            true,

          passMark: true,

          isActive: true,
        },
      }),

      /*
       * Optional school-wide fallback.
       */
      prisma.academicWeighting.findFirst({
        where: {
          academicYear,

          termId:
            term.id,

          gradeId: selectedClass.grade.id,

          isActive:
            true,
        },

        orderBy: {
          updatedAt:
            "desc",
        },

        select: {
          id: true,

          academicYear: true,

          termId: true,
          gradeId: true,

          gradingScaleId: true,

          assignmentWeight: true,
          assessmentWeight: true,
          examWeight: true,

          assessmentScoreStrategy:
            true,

          passMark: true,

          isActive: true,
        },
      }),
    ]);

    if (
      lessons.length === 0
    ) {
      issues.push({
        code:
          "NO_LESSONS",

        message:
          `${selectedClass.name} has no configured lessons or subjects.`,

        severity:
          "ERROR",
      });
    }

    const selectedWeighting =
      exactWeighting ??
      generalWeighting;

    if (!selectedWeighting) {
      throw new AcademicEngineLoaderError(
        "NO_ACTIVE_WEIGHTING",

        `No active academic weighting exists for ${academicYear}, ${term.name.replace(
          /_/g,
          " ",
        )} and ${selectedClass.grade.level}.`,
      );
    }

    if (
      !selectedWeighting
        .gradingScaleId
    ) {
      throw new AcademicEngineLoaderError(
        "NO_GRADING_SCALE",
        "The selected weighting has no grading scale.",
      );
    }

    const gradingScaleRow =
      await prisma.gradingScale.findUnique({
        where: {
          id:
            selectedWeighting
              .gradingScaleId,
        },

        select: {
          id: true,
          name: true,
          description: true,
          isDefault: true,

          boundaries: {
            select: {
              id: true,
              grade: true,

              minimumScore:
                true,

              maximumScore:
                true,

              remark: true,
              gradePoint: true,

              position: true,
            },

            orderBy: {
              position: "asc",
            },
          },
        },
      });

    if (!gradingScaleRow) {
      throw new AcademicEngineLoaderError(
        "NO_GRADING_SCALE",
        "The grading scale connected to this weighting could not be found.",
      );
    }

    const gradingScale =
      mapGradingScale(
        gradingScaleRow,
      );

    const gradingValidation =
      validateGradingScale(
        gradingScale,
      );

    if (
      !gradingValidation.valid
    ) {
      throw new AcademicEngineLoaderError(
        "INVALID_GRADING_SCALE",

        gradingValidation.errors
          .map(
            (error) =>
              error.message,
          )
          .join(" "),
      );
    }

    const students =
      selectedClass.students.map(
        mapStudent,
      );

    const subjects =
      createUniqueSubjects(
        lessons,
      );

    const studentIds =
      students.map(
        (student) =>
          student.id,
      );

    const databaseResults =
      studentIds.length === 0
        ? []
        : await prisma.result.findMany({
            where:
              createResultWhereInput({
                classId:
                  selectedClass.id,

                academicYear,

                termId:
                  term.id,

                studentIds,
              }),

            select: {
              id: true,

              type: true,

              studentId: true,

              score: true,
              totalMarks: true,
              percentage: true,

              createdAt: true,

              assignmentId: true,
              assessmentId: true,
              assessmentAttemptId:
                true,
              examId: true,

              assignment: {
                select: {
                  id: true,
                  title: true,

                  academicYear:
                    true,

                  termId: true,

                  startDate: true,
                  dueDate: true,

                  lesson: {
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
              },

              assessment: {
                select: {
                  id: true,
                  title: true,

                  academicYear:
                    true,

                  termId: true,

                  startDate: true,
                  dueDate: true,

                  lesson: {
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
              },

              exam: {
                select: {
                  id: true,
                  title: true,

                  academicYear:
                    true,

                  termId: true,

                  startTime: true,

                  lesson: {
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
              },

              assessmentAttempt: {
                select: {
                  id: true,

                  attemptNumber:
                    true,

                  submittedAt:
                    true,

                  startedAt:
                    true,
                },
              },
            },

            orderBy: {
              createdAt:
                "asc",
            },
          });

    const adapted =
      adaptDatabaseResults(
        databaseResults as
          AcademicResultDatabaseRow[],
      );

    issues.push(
      ...adapted.issues,
    );

    const normalization =
      normalizeAcademicResults(
        adapted.records,
      );

    for (
      const rejected of
      normalization.rejected
    ) {
      issues.push({
        code:
          "RESULT_REJECTED",

        message:
          rejected.errors
            .map(
              (error) =>
                error.message,
            )
            .join(" "),

        severity:
          "WARNING",

        resultId:
          rejected.record.id,

        studentId:
          rejected.record
            .studentId,

        subjectId:
          rejected.record
            .subjectId,
      });
    }

    const period:
      AcademicPeriodContext =
      {
        academicYear,

        term: {
          id:
            term.id,

          name:
            term.name,

          startDate:
            term.startDate,

          endDate:
            term.endDate,
        },

        grade: {
          id:
            selectedClass.grade.id,

          level:
            selectedClass.grade.level,
        },

        class: {
          id:
            selectedClass.id,

          name:
            selectedClass.name,
        },
      };

    const weighting =
      mapWeighting({
        weighting:
          selectedWeighting,

        gradeId:
          selectedClass.grade.id,
      });

    const studentInputs =
      buildStudentInputs({
        students,

        subjects,

        normalizedResults:
          normalization.results,

        period,

        weighting,

        gradingScale,
      });

    const engineInput:
      ClassTermCalculationInput =
      {
        period,

        weighting,

        gradingScale,

        students:
          studentInputs,
      };

    const loaderData:
      LoadedClassTermEngineData =
      {
        input:
          engineInput,

        configuration: {
          period,

          weighting,

          gradingScale,
        },

        rawResults:
          adapted.records,

        normalization,

        issues,

        statistics: {
          studentCount:
            students.length,

          lessonCount:
            lessons.length,

          subjectCount:
            subjects.length,

          rawResultCount:
            adapted.records.length,

          acceptedResultCount:
            normalization
              .acceptedCount,

          rejectedResultCount:
            normalization
              .rejectedCount,
        },
      };

    const errors =
      issues.filter(
        (issue) =>
          issue.severity ===
          "ERROR",
      );

    if (errors.length > 0) {
      return {
        success: false,

        code:
          errors[0].code,

        message:
          errors[0].message,

        errors,
      };
    }

    return {
      success: true,

      data:
        loaderData,

      warnings:
        issues.filter(
          (issue) =>
            issue.severity ===
            "WARNING",
        ),
    };
  } catch (error) {
    console.error(
      "LOAD CLASS TERM ENGINE DATA ERROR:",
      error,
    );

    const code =
      error instanceof
      AcademicEngineLoaderError
        ? error.code
        : "RESULT_REJECTED";

    return {
      success: false,

      code,

      message:
        getAcademicEngineLoaderErrorMessage(
          error,
        ),

      errors: [
        {
          code,

          message:
            getAcademicEngineLoaderErrorMessage(
              error,
            ),

          severity:
            "ERROR",
        },
      ],
    };
  }
}