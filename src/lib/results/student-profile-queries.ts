import {
  Prisma,
  type ResultType,
} from "@prisma/client";

import {
  auth,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import type {
  StudentResultProfileData,
  StudentResultProfileMetrics,
  StudentResultProfileRecord,
  StudentSubjectPerformance,
} from "./student-profile-types";

type StudentResultProfileFilters = {
  academicYear?: string;
  termId?: number;
  subjectId?: number;
  type?: ResultType;
};

async function requireStudentProfileManager() {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (
    role !== "admin" &&
    role !== "teacher"
  ) {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  return {
    userId,
    role,
  } as const;
}

function resolveProfilePercentage({
  percentage,
  score,
  totalMarks,
}: {
  percentage: number | null;
  score: number;
  totalMarks: number | null;
}) {
  if (
    percentage !== null &&
    Number.isFinite(percentage)
  ) {
    return Number(
      percentage.toFixed(2),
    );
  }

  if (
    totalMarks === null ||
    totalMarks <= 0
  ) {
    return null;
  }

  return Number(
    (
      (score / totalMarks) *
      100
    ).toFixed(2),
  );
}

function buildStudentMetrics(
  records: StudentResultProfileRecord[],
): StudentResultProfileMetrics {
  const percentages =
    records
      .map(
        (record) =>
          record.percentage,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== null,
      );

  const passedResults =
    percentages.filter(
      (percentage) =>
        percentage >= 50,
    ).length;

  const failedResults =
    percentages.filter(
      (percentage) =>
        percentage < 50,
    ).length;

  return {
    totalResults:
      records.length,

    averagePercentage:
      percentages.length > 0
        ? Number(
            (
              percentages.reduce(
                (
                  total,
                  percentage,
                ) =>
                  total +
                  percentage,
                0,
              ) /
              percentages.length
            ).toFixed(1),
          )
        : null,

    highestPercentage:
      percentages.length > 0
        ? Math.max(
            ...percentages,
          )
        : null,

    lowestPercentage:
      percentages.length > 0
        ? Math.min(
            ...percentages,
          )
        : null,

    passedResults,
    failedResults,

    passRate:
      percentages.length > 0
        ? Number(
            (
              (passedResults /
                percentages.length) *
              100
            ).toFixed(1),
          )
        : null,

    assessmentResults:
      records.filter(
        (record) =>
          record.type ===
          "ASSESSMENT",
      ).length,

    examinationResults:
      records.filter(
        (record) =>
          record.type ===
          "EXAM",
      ).length,

    assignmentResults:
      records.filter(
        (record) =>
          record.type ===
          "ASSIGNMENT",
      ).length,

    subjectsCovered:
      new Set(
        records.map(
          (record) =>
            record.subject.id,
        ),
      ).size,
  };
}

function buildSubjectPerformance(
  records: StudentResultProfileRecord[],
): StudentSubjectPerformance[] {
  const groups =
    new Map<
      number,
      StudentResultProfileRecord[]
    >();

  for (const record of records) {
    const existing =
      groups.get(
        record.subject.id,
      ) ?? [];

    existing.push(record);

    groups.set(
      record.subject.id,
      existing,
    );
  }

  return Array.from(
    groups.entries(),
  )
    .map(
      ([
        subjectId,
        subjectRecords,
      ]) => {
        const percentages =
          subjectRecords
            .map(
              (record) =>
                record.percentage,
            )
            .filter(
              (
                value,
              ): value is number =>
                value !== null,
            );

        const latestRecord =
          [...subjectRecords].sort(
            (first, second) =>
              new Date(
                second.date,
              ).getTime() -
              new Date(
                first.date,
              ).getTime(),
          )[0];

        return {
          subjectId,

          subjectName:
            subjectRecords[0]
              .subject.name,

          resultCount:
            subjectRecords.length,

          assessmentCount:
            subjectRecords.filter(
              (record) =>
                record.type ===
                "ASSESSMENT",
            ).length,

          examinationCount:
            subjectRecords.filter(
              (record) =>
                record.type ===
                "EXAM",
            ).length,

          assignmentCount:
            subjectRecords.filter(
              (record) =>
                record.type ===
                "ASSIGNMENT",
            ).length,

          averagePercentage:
            percentages.length >
            0
              ? Number(
                  (
                    percentages.reduce(
                      (
                        total,
                        percentage,
                      ) =>
                        total +
                        percentage,
                      0,
                    ) /
                    percentages.length
                  ).toFixed(1),
                )
              : null,

          highestPercentage:
            percentages.length >
            0
              ? Math.max(
                  ...percentages,
                )
              : null,

          lowestPercentage:
            percentages.length >
            0
              ? Math.min(
                  ...percentages,
                )
              : null,

          latestPercentage:
            latestRecord
              ?.percentage ??
            null,
        };
      },
    )
    .sort(
      (first, second) =>
        first.subjectName.localeCompare(
          second.subjectName,
        ),
    );
}

export async function getStudentResultProfile({
  studentId,
  academicYear,
  termId,
  subjectId,
  type,
}: {
  studentId: string;
} & StudentResultProfileFilters): Promise<
  StudentResultProfileData | null
> {
  const manager =
    await requireStudentProfileManager();

  const student =
    await prisma.student.findFirst({
      where: {
        id: studentId,

        ...(manager.role ===
        "teacher"
          ? {
              class: {
                lessons: {
                  some: {
                    teacherId:
                      manager.userId,
                  },
                },
              },
            }
          : {}),
      },

      select: {
        id: true,
        name: true,
        surname: true,

        img: true,
        studentID: true,

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

        parent: {
          select: {
            id: true,
            name: true,
            surname: true,
            phone: true,
          },
        },
      },
    });

  if (!student) {
    return null;
  }

  const academicItemConditions: Prisma.ResultWhereInput[] =
    [];

  if (academicYear) {
    academicItemConditions.push({
      OR: [
        {
          exam: {
            academicYear,
          },
        },

        {
          assessment: {
            academicYear,
          },
        },
      ],
    });
  }

  if (termId) {
    academicItemConditions.push({
      OR: [
        {
          exam: {
            termId,
          },
        },

        {
          assessment: {
            termId,
          },
        },
      ],
    });
  }

  if (subjectId) {
    academicItemConditions.push({
      OR: [
        {
          exam: {
            lesson: {
              subjectId,
            },
          },
        },

        {
          assignment: {
            lesson: {
              subjectId,
            },
          },
        },

        {
          assessment: {
            lesson: {
              subjectId,
            },
          },
        },
      ],
    });
  }

  const where: Prisma.ResultWhereInput = {
    studentId,

    ...(type
      ? {
          type,
        }
      : {}),

    ...(academicItemConditions.length >
    0
      ? {
          AND:
            academicItemConditions,
        }
      : {}),
  };

  const [
    resultRecords,
    terms,
    subjects,
    academicYearRecords,
  ] = await Promise.all([
    prisma.result.findMany({
      where,

      select: {
        id: true,
        type: true,

        score: true,
        totalMarks: true,
        percentage: true,

        grade: true,
        remarks: true,

        createdAt: true,

        exam: {
          select: {
            id: true,
            title: true,
            academicYear: true,

            term: {
              select: {
                id: true,
                name: true,
              },
            },

            lesson: {
              select: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },

                class: {
                  select: {
                    name: true,
                  },
                },

                teacher: {
                  select: {
                    name: true,
                    surname: true,
                  },
                },
              },
            },
          },
        },

        assignment: {
          select: {
            id: true,
            title: true,

            lesson: {
              select: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },

                class: {
                  select: {
                    name: true,
                  },
                },

                teacher: {
                  select: {
                    name: true,
                    surname: true,
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
            academicYear: true,

            term: {
              select: {
                id: true,
                name: true,
              },
            },

            lesson: {
              select: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },

                class: {
                  select: {
                    name: true,
                  },
                },

                teacher: {
                  select: {
                    name: true,
                    surname: true,
                  },
                },
              },
            },
          },
        },

        assessmentAttempt: {
          select: {
            id: true,
            attemptNumber: true,
          },
        },
      },

      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
    }),

    prisma.schoolTerm.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
      },

      orderBy: [
        {
          isActive: "desc",
        },
        {
          startDate: "desc",
        },
      ],
    }),

    prisma.subject.findMany({
      where: {
        lessons: {
          some: {
            classId:
              student.class.id,

            ...(manager.role ===
            "teacher"
              ? {
                  teacherId:
                    manager.userId,
                }
              : {}),
          },
        },
      },

      select: {
        id: true,
        name: true,
      },

      orderBy: {
        name: "asc",
      },
    }),

    prisma.result.findMany({
      where: {
        studentId,
      },

      select: {
        exam: {
          select: {
            academicYear: true,
          },
        },

        assessment: {
          select: {
            academicYear: true,
          },
        },
      },
    }),
  ]);

  const records =
    resultRecords
      .map(
        (
          result,
        ): StudentResultProfileRecord | null => {
          if (
            result.type ===
              "ASSESSMENT" &&
            result.assessment
          ) {
            return {
              id:
                result.id,

              type:
                "ASSESSMENT",

              title:
                result.assessment
                  .title,

              subject:
                result.assessment
                  .lesson.subject,

              className:
                result.assessment
                  .lesson.class
                  .name,

              teacherName:
                `${result.assessment.lesson.teacher.name} ${result.assessment.lesson.teacher.surname}`,

              score:
                result.score,

              totalMarks:
                result.totalMarks,

              percentage:
                resolveProfilePercentage({
                  percentage:
                    result.percentage,

                  score:
                    result.score,

                  totalMarks:
                    result.totalMarks,
                }),

              grade:
                result.grade,

              remarks:
                result.remarks,

              academicYear:
                result.assessment
                  .academicYear,

              term:
                result.assessment
                  .term,

              attemptNumber:
                result
                  .assessmentAttempt
                  ?.attemptNumber ??
                null,

              date:
                result.createdAt,

              assessment: {
                id:
                  result.assessment
                    .id,

                attemptId:
                  result
                    .assessmentAttempt
                    ?.id ??
                  null,
              },
            };
          }

          if (
            result.type ===
              "EXAM" &&
            result.exam
          ) {
            return {
              id:
                result.id,

              type:
                "EXAM",

              title:
                result.exam.title,

              subject:
                result.exam.lesson
                  .subject,

              className:
                result.exam.lesson
                  .class.name,

              teacherName:
                `${result.exam.lesson.teacher.name} ${result.exam.lesson.teacher.surname}`,

              score:
                result.score,

              totalMarks:
                result.totalMarks,

              percentage:
                resolveProfilePercentage({
                  percentage:
                    result.percentage,

                  score:
                    result.score,

                  totalMarks:
                    result.totalMarks,
                }),

              grade:
                result.grade,

              remarks:
                result.remarks,

              academicYear:
                result.exam
                  .academicYear,

              term:
                result.exam.term,

              attemptNumber:
                null,

              date:
                result.createdAt,

              assessment:
                null,
            };
          }

          if (
            result.type ===
              "ASSIGNMENT" &&
            result.assignment
          ) {
            return {
              id:
                result.id,

              type:
                "ASSIGNMENT",

              title:
                result.assignment
                  .title,

              subject:
                result.assignment
                  .lesson.subject,

              className:
                result.assignment
                  .lesson.class
                  .name,

              teacherName:
                `${result.assignment.lesson.teacher.name} ${result.assignment.lesson.teacher.surname}`,

              score:
                result.score,

              totalMarks:
                result.totalMarks,

              percentage:
                resolveProfilePercentage({
                  percentage:
                    result.percentage,

                  score:
                    result.score,

                  totalMarks:
                    result.totalMarks,
                }),

              grade:
                result.grade,

              remarks:
                result.remarks,

              academicYear:
                null,

              term:
                null,

              attemptNumber:
                null,

              date:
                result.createdAt,

              assessment:
                null,
            };
          }

          return null;
        },
      )
      .filter(
        (
          record,
        ): record is StudentResultProfileRecord =>
          record !== null,
      );

  const academicYears =
    Array.from(
      new Set(
        academicYearRecords.flatMap(
          (result) => [
            result.exam
              ?.academicYear,

            result.assessment
              ?.academicYear,
          ],
        ),
      ),
    )
      .filter(
        (
          value,
        ): value is string =>
          Boolean(value),
      )
      .sort(
        (first, second) =>
          second.localeCompare(
            first,
          ),
      );

  return {
    student,

    records,

    subjectPerformance:
      buildSubjectPerformance(
        records,
      ),

    metrics:
      buildStudentMetrics(
        records,
      ),

    filterOptions: {
      academicYears,
      terms,
      subjects,
    },

    selectedFilters: {
      academicYear:
        academicYear ?? null,

      termId:
        termId ?? null,

      subjectId:
        subjectId ?? null,

      type:
        type ?? null,
    },
  };
}