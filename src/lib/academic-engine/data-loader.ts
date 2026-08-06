import "server-only";

import type {
  NormalizedAcademicResult,
  ClassTermCalculationInput,
  StudentTermCalculationInput,
} from "./types";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                              INPUT TYPE                                    */
/* -------------------------------------------------------------------------- */

export type LoadClassTermReportDataInput = {
  classId: number;
  termId: number;
  academicYear: string;
};

/* -------------------------------------------------------------------------- */
/*                         RESULT NORMALIZATION                               */
/* -------------------------------------------------------------------------- */

function normalizeResultPercentage({
  score,
  totalMarks,
  percentage,
}: {
  score: number;
  totalMarks: number | null;
  percentage: number | null;
}): number | null {
  if (
    percentage !== null &&
    Number.isFinite(percentage)
  ) {
    return Math.min(
      100,
      Math.max(0, percentage),
    );
  }

  if (
    totalMarks === null ||
    totalMarks <= 0 ||
    !Number.isFinite(score)
  ) {
    return null;
  }

  const calculated =
    (score / totalMarks) * 100;

  return Math.round(
    Math.min(
      100,
      Math.max(0, calculated),
    ) * 100,
  ) / 100;
}

type SourceResult = {
  id: number;
  studentId: string;

  score: number;
  totalMarks: number | null;
  percentage: number | null;

  createdAt: Date;

  assessmentAttempt?: {
    id: number;
    attemptNumber: number;
  } | null;
};

function toNormalizedResult({
  result,
  type,
  subjectId,
  subjectName,
  title,
  sourceId,
}: {
  result: SourceResult;

  type:
    | "ASSIGNMENT"
    | "ASSESSMENT"
    | "EXAM";

  subjectId: number;
  subjectName: string;

  title: string;
  sourceId: number;
}): NormalizedAcademicResult | null {
  const percentage =
    normalizeResultPercentage({
      score: result.score,
      totalMarks:
        result.totalMarks,
      percentage:
        result.percentage,
    });

  if (percentage === null) {
    return null;
  }

  return {
    id: result.id,

    type,

    studentId:
      result.studentId,

    subjectId,
    subjectName,

    title,

    rawScore:
      result.score,

    totalMarks:
      result.totalMarks,

    percentage,

    date:
      result.createdAt,

    assignmentId:
      type === "ASSIGNMENT"
        ? sourceId
        : null,

    assessmentId:
      type === "ASSESSMENT"
        ? sourceId
        : null,

    assessmentAttemptId:
      type === "ASSESSMENT"
        ? result.assessmentAttempt
            ?.id ?? null
        : null,

    examId:
      type === "EXAM"
        ? sourceId
        : null,

    attemptNumber:
      type === "ASSESSMENT"
        ? result.assessmentAttempt
            ?.attemptNumber ?? null
        : null,
  };
}

/* -------------------------------------------------------------------------- */
/*                        DATABASE INTEGRATION                                */
/* -------------------------------------------------------------------------- */

export async function loadClassTermReportData({
  classId,
  termId,
  academicYear,
}: LoadClassTermReportDataInput): Promise<ClassTermCalculationInput> {
  const normalizedAcademicYear =
    academicYear.trim();

  if (
    !Number.isInteger(classId) ||
    classId <= 0 ||
    !Number.isInteger(termId) ||
    termId <= 0 ||
    !normalizedAcademicYear
  ) {
    throw new Error(
      "Select a valid class, academic year and school term.",
    );
  }

  const [
    classRecord,
    term,
  ] = await Promise.all([
    prisma.class.findUnique({
      where: {
        id: classId,
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
            studentID: true,

            name: true,
            surname: true,

            img: true,
            sex: true,

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

        lessons: {
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

            assignments: {
              where: {
                academicYear:
                  normalizedAcademicYear,

                termId,
              },

              select: {
                id: true,
                title: true,

                results: {
                  select: {
                    id: true,
                    studentId: true,

                    score: true,
                    totalMarks: true,
                    percentage: true,

                    createdAt: true,
                  },
                },
              },
            },

            assessments: {
              where: {
                academicYear:
                  normalizedAcademicYear,

                termId,
              },

              select: {
                id: true,
                title: true,

                results: {
                  select: {
                    id: true,
                    studentId: true,

                    score: true,
                    totalMarks: true,
                    percentage: true,

                    createdAt: true,

                    assessmentAttempt: {
                      select: {
                        id: true,
                        attemptNumber: true,
                      },
                    },
                  },
                },
              },
            },

            exams: {
              where: {
                academicYear:
                  normalizedAcademicYear,

                termId,
              },

              select: {
                id: true,
                title: true,

                results: {
                  select: {
                    id: true,
                    studentId: true,

                    score: true,
                    totalMarks: true,
                    percentage: true,

                    createdAt: true,
                  },
                },
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

        startDate: true,
        endDate: true,
      },
    }),
  ]);

  if (!classRecord) {
    throw new Error(
      "The selected class could not be found.",
    );
  }

  if (!term) {
    throw new Error(
      "The selected school term could not be found.",
    );
  }

  console.log(
  "REPORT GENERATION PERIOD:",
  {
    classId,
    termId,
    academicYear:
      normalizedAcademicYear,
  },
);

  const weighting =
    await prisma.academicWeighting.findFirst({
      where: {
        academicYear:
          normalizedAcademicYear,

        termId,

        gradeId:
          classRecord.grade.id,

        isActive: true,
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

        gradingScale: {
          select: {
            id: true,
            name: true,
            description: true,
            isDefault: true,

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

      orderBy: {
        updatedAt: "desc",
      },
    });

  if (!weighting) {
    throw new Error(
      "No active academic weighting is configured for this class, term and academic year.",
    );
  }

  if (!weighting.gradingScale) {
    throw new Error(
      "The academic weighting has no grading scale.",
    );
  }

  /*
   * A timetable may contain several Lesson records for
   * the same subject. Grouping them prevents the report
   * card from displaying the same subject more than once.
   */
  const subjectGroups =
    new Map<
      number,
      {
        subject: {
          id: number;
          name: string;

          teacher: {
            id: string;
            name: string;
            surname: string;
          } | null;
        };

        assignments:
          NormalizedAcademicResult[];

        assessments:
          NormalizedAcademicResult[];

        examinations:
          NormalizedAcademicResult[];
      }
    >();

  for (
    const lesson of
    classRecord.lessons
  ) {
    const existing =
      subjectGroups.get(
        lesson.subject.id,
      );

    const group =
      existing ?? {
        subject: {
          id:
            lesson.subject.id,

          name:
            lesson.subject.name,

          teacher:
            lesson.teacher
              ? {
                  id:
                    lesson.teacher.id,

                  name:
                    lesson.teacher.name,

                  surname:
                    lesson.teacher.surname,
                }
              : null,
        },

        assignments: [],
        assessments: [],
        examinations: [],
      };

    for (
      const assignment of
      lesson.assignments
    ) {
      for (
        const result of
        assignment.results
      ) {
        const normalized =
          toNormalizedResult({
            result,

            type: "ASSIGNMENT",

            subjectId:
              lesson.subject.id,

            subjectName:
              lesson.subject.name,

            title:
              assignment.title,

            sourceId:
              assignment.id,
          });

        if (normalized) {
          group.assignments.push(
            normalized,
          );
        }
      }
    }

    for (
      const assessment of
      lesson.assessments
    ) {
      for (
        const result of
        assessment.results
      ) {
        const normalized =
          toNormalizedResult({
            result,

            type: "ASSESSMENT",

            subjectId:
              lesson.subject.id,

            subjectName:
              lesson.subject.name,

            title:
              assessment.title,

            sourceId:
              assessment.id,
          });

        if (normalized) {
          group.assessments.push(
            normalized,
          );
        }
      }
    }

    for (
      const exam of
      lesson.exams
    ) {
      for (
        const result of
        exam.results
      ) {
        const normalized =
          toNormalizedResult({
            result,

            type: "EXAM",

            subjectId:
              lesson.subject.id,

            subjectName:
              lesson.subject.name,

            title:
              exam.title,

            sourceId:
              exam.id,
          });

        if (normalized) {
          group.examinations.push(
            normalized,
          );
        }
      }
    }

    subjectGroups.set(
      lesson.subject.id,
      group,
    );
  }

  const period = {
    academicYear:
      normalizedAcademicYear,

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
        classRecord.grade.id,

      level:
        classRecord.grade.level,
    },

    class: {
      id:
        classRecord.id,

      name:
        classRecord.name,
    },
  };

  const students:
    StudentTermCalculationInput[] =
    classRecord.students.map(
      (student) => ({
        student: {
          id:
            student.id,

          studentId:
            student.studentID,

          name:
            student.name,

          surname:
            student.surname,

          imageUrl:
            student.img,

          sex:
            String(student.sex),

          class: {
            id:
              student.class.id,

            name:
              student.class.name,
          },

          grade: {
            id:
              student.grade.id,

            level:
              student.grade.level,
          },
        },

        period,

        weighting: {
          id:
            weighting.id,

          academicYear:
            weighting.academicYear,

          termId:
            weighting.termId,

          gradeId:
            weighting.gradeId,

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
        },

        gradingScale: {
          id:
            weighting.gradingScale.id,

          name:
            weighting.gradingScale.name,

          description:
            weighting.gradingScale
              .description,

          isDefault:
            weighting.gradingScale
              .isDefault,

          boundaries:
            weighting.gradingScale
              .boundaries,
        },

        subjects:
          Array.from(
            subjectGroups.values(),
          ).map(
            (group) => ({
              subject:
                group.subject,

              assignments:
                group.assignments.filter(
                  (result) =>
                    result.studentId ===
                    student.id,
                ),

              assessments:
                group.assessments.filter(
                  (result) =>
                    result.studentId ===
                    student.id,
                ),

              examinations:
                group.examinations.filter(
                  (result) =>
                    result.studentId ===
                    student.id,
                ),
            }),
          ),
      }),
    );

    console.log(
  "REPORT SOURCE RECORDS:",
  classRecord.lessons.map(
    (lesson) => ({
      lessonId:
        lesson.id,

      subject:
        lesson.subject.name,

      assignments:
        lesson.assignments.map(
          (assignment) => ({
            id:
              assignment.id,

            title:
              assignment.title,

            resultCount:
              assignment.results.length,
          }),
        ),

      assessments:
        lesson.assessments.map(
          (assessment) => ({
            id:
              assessment.id,

            title:
              assessment.title,

            resultCount:
              assessment.results.length,
          }),
        ),

      examinations:
        lesson.exams.map(
          (exam) => ({
            id:
              exam.id,

            title:
              exam.title,

            resultCount:
              exam.results.length,
          }),
        ),
    }),
  ),
);

  return {
    period,

    weighting: {
      id:
        weighting.id,

      academicYear:
        weighting.academicYear,

      termId:
        weighting.termId,

      gradeId:
        weighting.gradeId,

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
    },

    gradingScale: {
      id:
        weighting.gradingScale.id,

      name:
        weighting.gradingScale.name,

      description:
        weighting.gradingScale
          .description,

      isDefault:
        weighting.gradingScale
          .isDefault,

      boundaries:
        weighting.gradingScale
          .boundaries,
    },

    students,
  };
}