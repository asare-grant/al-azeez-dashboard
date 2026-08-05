import { Prisma, type ResultType } from "@prisma/client";

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import type {
  ResultsCommandCentreData,
  ResultsCommandCentreFilters,
  ResultsCommandCentreMetrics,
  ResultsCommandCentreRow,
} from "./command-centre-types";

const DEFAULT_PAGE_SIZE = 15;
const MAXIMUM_PAGE_SIZE = 100;

type ResultsManager = {
  userId: string;
  role: "admin" | "teacher";
};

async function requireResultsManager(): Promise<ResultsManager> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error("UNAUTHENTICATED");
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (role !== "admin" && role !== "teacher") {
    throw new Error("UNAUTHORISED");
  }

  return {
    userId,
    role,
  };
}

function getAcademicPeriodWhere({
  academicYear,
  termId,
}: {
  academicYear?: string;
  termId?: number;
}): Prisma.ResultWhereInput[] {
  const conditions: Prisma.ResultWhereInput[] = [];

  if (academicYear) {
    conditions.push({
      OR: [
        {
          assessment: {
            academicYear,
          },
        },

        {
          exam: {
            academicYear,
          },
        },
      ],
    });
  }

  if (termId) {
    conditions.push({
      OR: [
        {
          assessment: {
            termId,
          },
        },

        {
          exam: {
            termId,
          },
        },
      ],
    });
  }

  return conditions;
}

function getOwnershipWhere({
  userId,
  role,
}: ResultsManager): Prisma.ResultWhereInput {
  if (role === "admin") {
    return {};
  }

  return {
    OR: [
      {
        exam: {
          lesson: {
            teacherId: userId,
          },
        },
      },

      {
        assignment: {
          lesson: {
            teacherId: userId,
          },
        },
      },

      {
        assessment: {
          lesson: {
            teacherId: userId,
          },
        },
      },
    ],
  };
}

function buildResultsWhere({
  manager,
  filters,
}: {
  manager: ResultsManager;
  filters: ResultsCommandCentreFilters;
}): Prisma.ResultWhereInput {
  const { search, type, classId, subjectId, studentId, academicYear, termId } =
    filters;

  const andConditions: Prisma.ResultWhereInput[] = [
    getOwnershipWhere(manager),
    ...getAcademicPeriodWhere({
      academicYear,
      termId,
    }),
  ];

  if (type && type !== "ALL") {
    andConditions.push({
      type,
    });
  }

  if (studentId) {
    andConditions.push({
      studentId,
    });
  }

  if (classId) {
    andConditions.push({
      OR: [
        {
          exam: {
            lesson: {
              classId,
            },
          },
        },

        {
          assignment: {
            lesson: {
              classId,
            },
          },
        },

        {
          assessment: {
            lesson: {
              classId,
            },
          },
        },
      ],
    });
  }

  if (subjectId) {
    andConditions.push({
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

  const normalizedSearch = search?.trim();

  if (normalizedSearch) {
    andConditions.push({
      OR: [
        {
          student: {
            name: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        },

        {
          student: {
            surname: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        },

        {
          student: {
            studentID: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        },

        {
          exam: {
            title: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        },

        {
          assignment: {
            title: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        },

        {
          assessment: {
            title: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        },

        {
          exam: {
            lesson: {
              subject: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          },
        },

        {
          assignment: {
            lesson: {
              subject: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          },
        },

        {
          assessment: {
            lesson: {
              subject: {
                name: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ],
    });
  }

  return {
    AND: andConditions,
  };
}

// function formatPercentage(
//   value: number | null,
//   score: number,
//   totalMarks: number | null,
// ): number | null {
//   if (value !== null) {
//     return Number(
//       value.toFixed(2),
//     );
//   }

//   if (
//     totalMarks === null ||
//     totalMarks <= 0
//   ) {
//     return null;
//   }

//   return Number(
//     (
//       (score / totalMarks) *
//       100
//     ).toFixed(2),
//   );
// }

function resolvePercentage({
  percentage,
  score,
  totalMarks,
}: {
  percentage: number | null;
  score: number;
  totalMarks: number | null;
}): number | null {
  if (percentage !== null && Number.isFinite(percentage)) {
    return Number(percentage.toFixed(2));
  }

  if (totalMarks === null || totalMarks <= 0) {
    return null;
  }

  return Number(((score / totalMarks) * 100).toFixed(2));
}

// function buildMetrics(
//   rows: ResultsCommandCentreRow[],
// ): ResultsCommandCentreMetrics {
//   const percentages = rows
//     .map((result) => result.percentage)
//     .filter((percentage): percentage is number => percentage !== null);

//   const passedResults = percentages.filter(
//     (percentage) => percentage >= 50,
//   ).length;

//   const failedResults = percentages.filter(
//     (percentage) => percentage < 50,
//   ).length;

//   const averagePercentage =
//     percentages.length > 0
//       ? Number(
//           (
//             percentages.reduce((total, percentage) => total + percentage, 0) /
//             percentages.length
//           ).toFixed(1),
//         )
//       : null;

//   const passRate =
//     percentages.length > 0
//       ? Number(((passedResults / percentages.length) * 100).toFixed(1))
//       : null;

//   return {
//     totalResults: rows.length,

//     assessmentResults: rows.filter((result) => result.type === "ASSESSMENT")
//       .length,

//     examinationResults: rows.filter((result) => result.type === "EXAM").length,

//     assignmentResults: rows.filter((result) => result.type === "ASSIGNMENT")
//       .length,

//     averagePercentage,

//     highestPercentage: percentages.length > 0 ? Math.max(...percentages) : null,

//     lowestPercentage: percentages.length > 0 ? Math.min(...percentages) : null,

//     passedResults,
//     failedResults,
//     passRate,

//     uniqueStudents: new Set(rows.map((result) => result.student.id)).size,
//   };
// }

async function getGlobalResultsMetrics({
  where,
}: {
  where: Prisma.ResultWhereInput;
}): Promise<ResultsCommandCentreMetrics> {
  const resultRecords = await prisma.result.findMany({
    where,

    select: {
      type: true,

      score: true,
      totalMarks: true,
      percentage: true,

      studentId: true,
    },
  });

  const resolvedResults = resultRecords.map((result) => ({
    type: result.type,

    studentId: result.studentId,

    percentage: resolvePercentage({
      percentage: result.percentage,

      score: result.score,

      totalMarks: result.totalMarks,
    }),
  }));

  const gradedResults = resolvedResults.filter(
    (
      result,
    ): result is typeof result & {
      percentage: number;
    } => result.percentage !== null,
  );

  const percentages = gradedResults.map((result) => result.percentage);

  const passedResults = percentages.filter(
    (percentage) => percentage >= 50,
  ).length;

  const failedResults = percentages.filter(
    (percentage) => percentage < 50,
  ).length;

  const averagePercentage =
    percentages.length > 0
      ? Number(
          (
            percentages.reduce((total, percentage) => total + percentage, 0) /
            percentages.length
          ).toFixed(1),
        )
      : null;

  const passRate =
    percentages.length > 0
      ? Number(((passedResults / percentages.length) * 100).toFixed(1))
      : null;

  return {
    totalResults: resolvedResults.length,

    assessmentResults: resolvedResults.filter(
      (result) => result.type === "ASSESSMENT",
    ).length,

    examinationResults: resolvedResults.filter(
      (result) => result.type === "EXAM",
    ).length,

    assignmentResults: resolvedResults.filter(
      (result) => result.type === "ASSIGNMENT",
    ).length,

    averagePercentage,

    highestPercentage: percentages.length > 0 ? Math.max(...percentages) : null,

    lowestPercentage: percentages.length > 0 ? Math.min(...percentages) : null,

    passedResults,
    failedResults,

    ungradedResults: resolvedResults.length - gradedResults.length,

    passRate,

    uniqueStudents: new Set(resolvedResults.map((result) => result.studentId))
      .size,
  };
}

export async function getResultsCommandCentre({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  type = "ALL",
  classId,
  subjectId,
  studentId,
  academicYear,
  termId,
}: ResultsCommandCentreFilters = {}): Promise<ResultsCommandCentreData> {
  const manager = await requireResultsManager();

  const safePage = Math.max(1, page);

  const safePageSize = Math.min(Math.max(1, pageSize), MAXIMUM_PAGE_SIZE);

  const where = buildResultsWhere({
    manager,

    filters: {
      search,
      type,
      classId,
      subjectId,
      studentId,
      academicYear,
      termId,
    },
  });

  const [
    resultRecords,
    total,
    metrics,
    classes,
    subjects,
    students,
    terms,
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

        student: {
          select: {
            id: true,
            name: true,
            surname: true,
            img: true,
            studentID: true,
          },
        },

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
                    id: true,
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
                    id: true,
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
                    id: true,
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

      skip: (safePage - 1) * safePageSize,

      take: safePageSize,
    }),

    prisma.result.count({
      where,
    }),

    getGlobalResultsMetrics({
      where,
    }),

    prisma.class.findMany({
      where:
        manager.role === "teacher"
          ? {
              lessons: {
                some: {
                  teacherId: manager.userId,
                },
              },
            }
          : undefined,

      select: {
        id: true,
        name: true,
      },

      orderBy: {
        name: "asc",
      },
    }),

    prisma.subject.findMany({
      where:
        manager.role === "teacher"
          ? {
              lessons: {
                some: {
                  teacherId: manager.userId,
                },
              },
            }
          : undefined,

      select: {
        id: true,
        name: true,
      },

      orderBy: {
        name: "asc",
      },
    }),

    prisma.student.findMany({
      where:
        manager.role === "teacher"
          ? {
              class: {
                lessons: {
                  some: {
                    teacherId: manager.userId,
                  },
                },
              },
            }
          : undefined,

      select: {
        id: true,
        name: true,
        surname: true,
        studentID: true,
        classId: true,
      },

      orderBy: [
        {
          surname: "asc",
        },
        {
          name: "asc",
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

    prisma.result.findMany({
      where: getOwnershipWhere(manager),

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

  const rows = resultRecords
    .map((result): ResultsCommandCentreRow | null => {
      if (result.type === "ASSESSMENT" && result.assessment) {
        return {
          id: result.id,

          type: "ASSESSMENT",

          title: result.assessment.title,

          subject: result.assessment.lesson.subject.name,

          className: result.assessment.lesson.class.name,

          student: result.student,

          teacher: result.assessment.lesson.teacher,

          score: result.score,

          totalMarks: result.totalMarks,

          percentage: resolvePercentage({
            percentage: result.percentage,

            score: result.score,

            totalMarks: result.totalMarks,
          }),

          grade: result.grade,

          remarks: result.remarks,

          academicYear: result.assessment.academicYear,

          term: result.assessment.term,

          assessment: {
            id: result.assessment.id,

            attemptId: result.assessmentAttempt?.id ?? null,

            attemptNumber: result.assessmentAttempt?.attemptNumber ?? null,
          },

          exam: null,

          assignment: null,

          date: result.createdAt,
        };
      }

      if (result.type === "EXAM" && result.exam) {
        return {
          id: result.id,

          type: "EXAM",

          title: result.exam.title,

          subject: result.exam.lesson.subject.name,

          className: result.exam.lesson.class.name,

          student: result.student,

          teacher: result.exam.lesson.teacher,

          score: result.score,

          totalMarks: result.totalMarks,

          percentage: resolvePercentage({
            percentage: result.percentage,

            score: result.score,

            totalMarks: result.totalMarks,
          }),

          grade: result.grade,

          remarks: result.remarks,

          academicYear: result.exam.academicYear,

          term: result.exam.term,

          assessment: null,

          exam: {
            id: result.exam.id,
          },

          assignment: null,

          date: result.createdAt,
        };
      }

      if (result.type === "ASSIGNMENT" && result.assignment) {
        return {
          id: result.id,

          type: "ASSIGNMENT",

          title: result.assignment.title,

          subject: result.assignment.lesson.subject.name,

          className: result.assignment.lesson.class.name,

          student: result.student,

          teacher: result.assignment.lesson.teacher,

          score: result.score,

          totalMarks: result.totalMarks,

          percentage: resolvePercentage({
            percentage: result.percentage,

            score: result.score,

            totalMarks: result.totalMarks,
          }),

          grade: result.grade,

          remarks: result.remarks,

          /*
           * The current Assignment model
           * does not yet store its own
           * academic year and term.
           */
          academicYear: null,

          term: null,

          assessment: null,

          exam: null,

          assignment: {
            id: result.assignment.id,
          },

          date: result.createdAt,
        };
      }

      return null;
    })
    .filter((result): result is ResultsCommandCentreRow => result !== null);

  const academicYears = Array.from(
    new Set(
      academicYearRecords.flatMap((result) => [
        result.exam?.academicYear,

        result.assessment?.academicYear,
      ]),
    ),
  )
    .filter((year): year is string => Boolean(year))
    .sort((first, second) => second.localeCompare(first));

  return {
    rows,

    /*
     * These initial metrics describe the
     * currently loaded page. In the analytics
     * step, we will calculate metrics across
     * the complete filtered result set.
     */
    metrics,

    filters: {
      classes,
      subjects,
      students,
      terms,
      academicYears,
    },

    page: safePage,

    pageSize: safePageSize,

    total,

    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
}
