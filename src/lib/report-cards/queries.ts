// src/lib/report-cards/queries.ts
import "server-only";

import prisma from "@/lib/prisma";

import {
  requireReportCardUser,
} from "./auth";

import type {
  Prisma,
  ReportCardCalculationStatus,
  ReportCardReviewStatus,
  ReportCardStatus,
} from "@prisma/client";

import type {
  ReportCardCommandFilters,
} from "@/components/report-cards/types";

import {
  mapStudentIdentity,
} from "@/lib/students/student-identity";

import {
  resolveReportCardReviewPermissions,
} from "./review-permissions";

import {
  reviewReportCardReadiness,
} from "./review-readiness";

import type {
  ReportCardReviewWorkspaceData,
} from "./review-types";

import {
  validateReportCardGeneration,
} from "./generation-validator";

/* -------------------------------------------------------------------------- */
/*                      ADMIN AND TEACHER REPORT LIST                         */
/* -------------------------------------------------------------------------- */

export async function getManagedReportCards({
  classId,
  academicYear,
  termId,
  status,
}: {
  classId?: number;
  academicYear?: string;
  termId?: number;
  status?:
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";
} = {}) {
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

  const reportCards =
  await prisma.reportCard.findMany({
    where: {
      ...(classId
        ? {
            classId,
          }
        : {}),

      ...(academicYear
        ? {
            academicYear,
          }
        : {}),

      ...(termId
        ? {
            termId,
          }
        : {}),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(role === "teacher"
        ? {
            class: {
              lessons: {
                some: {
                  teacherId:
                    userId,
                },
              },
            },
          }
        : {}),
    },

    select: {
      id: true,

      status: true,
      calculationStatus:
        true,

      academicYear: true,

      student: {
        select: {
          id: true,
          studentID: true,
          name: true,
          surname: true,
          img: true,
        },
      },

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

      term: {
        select: {
          id: true,
          name: true,
        },
      },

      subjectCount: true,
      completedSubjectCount:
        true,

      totalScore: true,
      averageScore: true,

      overallGrade: true,
      overallPosition: true,

      generatedAt: true,
      publishedAt: true,
    },

    orderBy: [
      {
        class: {
          name: "asc",
        },
      },
      {
        overallPosition:
          "asc",
      },
      {
        student: {
          surname: "asc",
        },
      },
    ],
  });

  return reportCards.map(
  (reportCard) => ({
    ...reportCard,

    student:
      mapStudentIdentity(
        reportCard.student,
      ),
      img:
        reportCard.student.img,
  }),
);
}

/* -------------------------------------------------------------------------- */
/*                           STUDENT REPORT CARDS                             */
/* -------------------------------------------------------------------------- */

export async function getStudentReportCards() {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (role !== "student") {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  return prisma.reportCard.findMany({
    where: {
      studentId:
        userId,

      status:
        "PUBLISHED",
    },

    include: {
      class: true,
      grade: true,
      term: true,

      subjects: {
        include: {
          subject: true,
        },

        orderBy: {
          subjectName:
            "asc",
        },
      },
    },

    orderBy: [
      {
        academicYear:
          "desc",
      },
      {
        termId:
          "desc",
      },
    ],
  });
}

/* -------------------------------------------------------------------------- */
/*                       PARENT CHILD REPORT CARDS                            */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                       PARENT CHILD REPORT CARDS                            */
/* -------------------------------------------------------------------------- */

export async function getParentChildReportCards(
  childId: string,
) {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (role !== "parent") {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  if (!childId.trim()) {
    return null;
  }

  /*
   * First prove that the selected child belongs
   * to the authenticated parent.
   */
  const child =
    await prisma.student.findFirst({
      where: {
        id: childId,
        parentId: userId,
      },

      select: {
        id: true,
        studentID: true,
        name: true,
        surname: true,
        img: true,

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
    });

  if (!child) {
    return null;
  }

  const reportCards =
    await prisma.reportCard.findMany({
      where: {
        studentId: child.id,

        /*
         * Parents must never receive drafts or
         * archived cards.
         */
        status: "PUBLISHED",
      },

      select: {
        id: true,

        status: true,
        calculationStatus: true,

        academicYear: true,

        term: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },

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

        subjectCount: true,
        completedSubjectCount: true,

        totalScore: true,
        averageScore: true,

        overallGrade: true,
        overallRemark: true,

        overallPosition: true,
        classStudentCount: true,

        publishedAt: true,
        generatedAt: true,
      },

      orderBy: [
        {
          academicYear: "desc",
        },
        {
          term: {
            startDate: "desc",
          },
        },
      ],
    });

  return {
    child: {
    ...mapStudentIdentity(
        child,
    ),

    class:
        child.class,

    grade:
        child.grade,
    },

    reportCards,
  };
}

// export async function getParentChildReportCards(
//   childId: string,
// ) {
//   const {
//     userId,
//     role,
//   } = await requireReportCardUser();

//   if (role !== "parent") {
//     throw new Error(
//       "UNAUTHORISED",
//     );
//   }

//   const child =
//     await prisma.student.findFirst({
//       where: {
//         id:
//           childId,

//         parentId:
//           userId,
//       },

//       select: {
//         id: true,
//       },
//     });

//   if (!child) {
//     return [];
//   }

//   return prisma.reportCard.findMany({
//     where: {
//       studentId:
//         child.id,

//       status:
//         "PUBLISHED",
//     },

//     include: {
//       class: true,
//       grade: true,
//       term: true,

//       subjects: {
//         include: {
//           subject: true,
//         },

//         orderBy: {
//           subjectName:
//             "asc",
//         },
//       },
//     },

//     orderBy: [
//       {
//         academicYear:
//           "desc",
//       },
//       {
//         termId:
//           "desc",
//       },
//     ],
//   });
// }

/* -------------------------------------------------------------------------- */
/*                      SECURE SINGLE REPORT-CARD QUERY                       */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                      SECURE SINGLE REPORT-CARD QUERY                       */
/* -------------------------------------------------------------------------- */

export async function getAccessibleReportCard(
  reportCardId: number,
) {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (
    !Number.isInteger(reportCardId) ||
    reportCardId <= 0
  ) {
    return null;
  }

  const where: Prisma.ReportCardWhereInput = {
    id: reportCardId,
  };

  switch (role) {
    case "student":
      where.studentId = userId;
      where.status = "PUBLISHED";
      break;

    case "parent":
      where.student = {
        parentId: userId,
      };

      where.status = "PUBLISHED";
      break;

    case "teacher":
      where.class = {
        lessons: {
          some: {
            teacherId: userId,
          },
        },
      };
      break;

    case "admin":
      break;

    default:
      return null;
  }

  const reportCard =
    await prisma.reportCard.findFirst({
      where,

      select: {
        id: true,

        status: true,
        calculationStatus: true,

        version: true,
        academicYear: true,

        student: {
          select: {
            id: true,

            studentID: true,
            name: true,
            surname: true,
            img: true,
          },
        },

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

        term: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },

        subjectCount: true,
        completedSubjectCount: true,
        incompleteSubjectCount: true,

        totalScore: true,
        averageScore: true,

        highestSubjectScore: true,
        lowestSubjectScore: true,

        passedSubjectCount: true,
        failedSubjectCount: true,
        passRate: true,

        totalGradePoints: true,
        averageGradePoint: true,

        overallGrade: true,
        overallRemark: true,
        overallGradePoint: true,

        overallPosition: true,
        classStudentCount: true,

        daysSchoolOpened: true,
        daysPresent: true,
        daysAbsent: true,
        attendancePercentage: true,

        conduct: true,
        classTeacherRemark: true,
        headTeacherRemark: true,
        promotionStatus: true,
        nextTermBegins: true,

        generatedAt: true,
        regeneratedAt: true,
        publishedAt: true,

        subjects: {
          select: {
            id: true,

            subjectId: true,
            subjectName: true,

            teacherId: true,
            teacherName: true,

            assignmentPercentage: true,
            assignmentWeight: true,
            assignmentScore: true,

            assessmentPercentage: true,
            assessmentWeight: true,
            assessmentScore: true,

            examinationPercentage: true,
            examinationWeight: true,
            examinationScore: true,

            finalScore: true,

            grade: true,
            remark: true,
            gradePoint: true,

            passed: true,

            calculationStatus: true,

            subjectPosition: true,
            classAverage: true,
            highestScore: true,
            lowestScore: true,
          },

          orderBy: {
            subjectName: "asc",
          },
        },
      },
    });

  if (!reportCard) {
    return null;
  }

  /*
   * Convert the database field `username` into the
   * `studentId` property expected by the report-card UI.
   */
  return {
    ...reportCard,

    student:
        mapStudentIdentity(
            reportCard.student,
        ),
  };
}




/* -------------------------------------------------------------------------- */
/*                      REPORT-CARD COMMAND CENTRE                            */
/* -------------------------------------------------------------------------- */

function parsePositiveInteger(
  value?: string,
): number | undefined {
  const parsed = Number(value);

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : undefined;
}

function parseReportCardStatus(
  value?: string,
): ReportCardStatus | undefined {
  const statuses: ReportCardStatus[] = [
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
  ];

  return statuses.includes(
    value as ReportCardStatus,
  )
    ? (value as ReportCardStatus)
    : undefined;
}

function parseCalculationStatus(
  value?: string,
): ReportCardCalculationStatus | undefined {
  const statuses:
    ReportCardCalculationStatus[] = [
      "READY",
      "PARTIAL",
      "BLOCKED",
    ];

  return statuses.includes(
    value as ReportCardCalculationStatus,
  )
    ? (value as ReportCardCalculationStatus)
    : undefined;
}

export async function getReportCardCommandCentre({
  filters = {},
  page = 1,
  pageSize = 15,
}: {
  filters?: ReportCardCommandFilters;
  page?: number;
  pageSize?: number;
} = {}) {
  const { userId, role } =
    await requireReportCardUser();

  if (
    role !== "admin" &&
    role !== "teacher"
  ) {
    throw new Error("UNAUTHORISED");
  }

  const safePage =
    Math.max(1, page);

  const safePageSize =
    Math.min(
      Math.max(1, pageSize),
      50,
    );

  const classId =
    parsePositiveInteger(
      filters.classId,
    );

  const termId =
    parsePositiveInteger(
      filters.termId,
    );

  const status =
    parseReportCardStatus(
      filters.status,
    );

  const calculationStatus =
    parseCalculationStatus(
      filters.calculationStatus,
    );

  const reviewStatus =
    parseReportCardReviewStatus(
      filters.reviewStatus,
    );

  const search =
    filters.search?.trim();

  const academicYear =
    filters.academicYear?.trim();

  const ownershipWhere:
    Prisma.ReportCardWhereInput =
    role === "teacher"
      ? {
          class: {
            lessons: {
              some: {
                teacherId: userId,
              },
            },
          },
        }
      : {};

  const where:
    Prisma.ReportCardWhereInput = {
    ...ownershipWhere,

    ...(classId
      ? { classId }
      : {}),

    ...(termId
      ? { termId }
      : {}),

    ...(academicYear
      ? { academicYear }
      : {}),

    ...(status
      ? { status }
      : {}),

    ...(calculationStatus
      ? { calculationStatus }
      : {}),

    ...(reviewStatus
      ? {
          reviewStatus,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              student: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              student: {
                surname: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              student: {
                studentID: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              class: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  /*
   * Metrics use the complete filtered set,
   * not only the current page.
   */
  const [
    reportCards,
    total,
    statusGroups,
    calculationGroups,
    reviewGroups,
    scoreAggregate,
    classes,
    terms,
    academicYearRows,
  ] = await prisma.$transaction([
    prisma.reportCard.findMany({
      where,

      select: {
        id: true,

        status: true,

        reviewStatus:
          true,

        calculationStatus:
          true,

        isStale:
          true,

        staleAt:
          true,

        staleReason:
          true,

        version:
          true,

        academicYear:
          true,

        student: {
          select: {
            id: true,
            studentID: true,
            name: true,
            surname: true,

            // Rename this if needed.
            img: true,
          },
        },

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

        term: {
          select: {
            id: true,
            name: true,
          },
        },

        subjectCount: true,
        completedSubjectCount: true,
        incompleteSubjectCount: true,

        totalScore: true,
        averageScore: true,

        overallGrade: true,
        overallPosition: true,
        classStudentCount: true,

        generatedAt: true,
        regeneratedAt: true,

        publishedAt: true,

        submittedForReviewAt:
          true,

        approvedAt:
          true,

        changesRequestedAt:
          true,
      },

      orderBy: [
        {
          updatedAt: "desc",
        },
        {
          student: {
            surname: "asc",
          },
        },
      ],

      skip:
        (safePage - 1) *
        safePageSize,

      take: safePageSize,
    }),

    prisma.reportCard.count({
      where,
    }),

    prisma.reportCard.groupBy({
      by: ["status"],
      where,

      _count: {
        _all: true,
      },
    }),

    prisma.reportCard.groupBy({
      by: [
        "calculationStatus",
      ],
      where,

      _count: {
        _all: true,
      },
    }),

    prisma.reportCard.groupBy({
      by: [
        "reviewStatus",
      ],

      where,

      _count: {
        _all: true,
      },
    }),

    prisma.reportCard.aggregate({
      where: {
        ...where,

        averageScore: {
          not: null,
        },
      },

      _avg: {
        averageScore: true,
      },
    }),

    prisma.class.findMany({
      where:
        role === "teacher"
          ? {
              lessons: {
                some: {
                  teacherId: userId,
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

    prisma.schoolTerm.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
      },

      orderBy: {
        startDate: "desc",
      },
    }),

    prisma.reportCard.findMany({
      where: ownershipWhere,

      distinct: [
        "academicYear",
      ],

      select: {
        academicYear: true,
      },

      orderBy: {
        academicYear: "desc",
      },
    }),
  ]);

  const statusCount =
    new Map(
      statusGroups.map(
        (group) => [
          group.status,
          group._count._all,
        ],
      ),
    );

  const calculationCount =
    new Map(
      calculationGroups.map(
        (group) => [
          group.calculationStatus,
          group._count._all,
        ],
      ),
    );

  const reviewCount =
    new Map(
      reviewGroups.map(
        (group) => [
          group.reviewStatus,
          group._count._all,
        ],
      ),
    );

  const draft =
    statusCount.get("DRAFT") ??
    0;

  const ready =
    calculationCount.get(
      "READY",
    ) ?? 0;

  const publishable =
    await prisma.reportCard.count({
      where: {
        ...where,

        status:
          "DRAFT",

        reviewStatus:
          "APPROVED",

        calculationStatus:
          "READY",

        isStale:
          false,

        subjectCount: {
          gt: 0,
        },

        incompleteSubjectCount:
          0,
      },
    });

    const commandItems =
        reportCards.map(
            (reportCard) => ({
            ...reportCard,

            student:
                mapStudentIdentity(
                reportCard.student,
                ),
            }),
        );

  return {
     data: commandItems,

    metrics: {
      total,

      draft,

      published:
        statusCount.get(
          "PUBLISHED",
        ) ?? 0,

      archived:
        statusCount.get(
          "ARCHIVED",
        ) ?? 0,

      ready,

      partial:
        calculationCount.get(
          "PARTIAL",
        ) ?? 0,

      blocked:
        calculationCount.get(
          "BLOCKED",
        ) ?? 0,

      averageScore:
        scoreAggregate._avg
          .averageScore,
      
      preparing:
        reviewCount.get(
          "DRAFT",
        ) ?? 0,

      awaitingReview:
        reviewCount.get(
          "SUBMITTED",
        ) ?? 0,

      changesRequested:
        reviewCount.get(
          "CHANGES_REQUESTED",
        ) ?? 0,

      approved:
        reviewCount.get(
          "APPROVED",
        ) ?? 0,

      publishable,
    },

    filters: {
      classes,

      terms,

      academicYears:
        academicYearRows.map(
          (item) =>
            item.academicYear,
        ),
    },

    pagination: {
      page: safePage,

      pageSize:
        safePageSize,

      total,

      totalPages:
        Math.max(
          1,
          Math.ceil(
            total /
              safePageSize,
          ),
        ),
    },
  };
}


/* -------------------------------------------------------------------------- */
/*                    PARENT CHILDREN FOR REPORT CARDS                        */
/* -------------------------------------------------------------------------- */

export async function getParentChildrenForReportCards() {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (role !== "parent") {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  const children =
    await prisma.student.findMany({
      where: {
        parentId: userId,
      },

      select: {
        id: true,

        /*
         * Your actual Prisma field is studentID,
         * not studentId.
         */
        studentID: true,

        name: true,
        surname: true,
        img: true,

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

        reportCards: {
          where: {
            status: "PUBLISHED",
          },

          select: {
            id: true,
            averageScore: true,
            overallGrade: true,
            publishedAt: true,
          },

          orderBy: {
            publishedAt: "desc",
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
    });

  return children.map(
    (child) => ({
        ...mapStudentIdentity(
        child,
        ),

        class:
        child.class,

        grade:
        child.grade,

        publishedReportCount:
        child.reportCards.length,

        latestReport:
        child.reportCards[0] ??
        null,
        }),
    );
}




/* -------------------------------------------------------------------------- */
/*                    PARENT ACCESSIBLE SINGLE REPORT                         */
/* -------------------------------------------------------------------------- */

export async function getParentAccessibleReportCard({
  childId,
  reportCardId,
}: {
  childId: string;
  reportCardId: number;
}) {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (role !== "parent") {
    return null;
  }

  if (
    !childId.trim() ||
    !Number.isInteger(reportCardId) ||
    reportCardId <= 0
  ) {
    return null;
  }

  const reportCard =
    await prisma.reportCard.findFirst({
      where: {
        id: reportCardId,

        studentId: childId,

        status: "PUBLISHED",

        student: {
          parentId: userId,
        },
      },

      select: {
        id: true,

        status: true,
        calculationStatus: true,

        version: true,
        academicYear: true,

        student: {
          select: {
            id: true,
            studentID: true,
            name: true,
            surname: true,
            img: true,
          },
        },

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

        term: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },

        subjectCount: true,
        completedSubjectCount: true,
        incompleteSubjectCount: true,

        totalScore: true,
        averageScore: true,

        highestSubjectScore: true,
        lowestSubjectScore: true,

        passedSubjectCount: true,
        failedSubjectCount: true,
        passRate: true,

        totalGradePoints: true,
        averageGradePoint: true,

        overallGrade: true,
        overallRemark: true,
        overallGradePoint: true,

        overallPosition: true,
        classStudentCount: true,

        daysSchoolOpened: true,
        daysPresent: true,
        daysAbsent: true,
        attendancePercentage: true,

        conduct: true,
        classTeacherRemark: true,
        headTeacherRemark: true,
        promotionStatus: true,
        nextTermBegins: true,

        generatedAt: true,
        regeneratedAt: true,
        publishedAt: true,

        subjects: {
          select: {
            id: true,

            subjectId: true,
            subjectName: true,

            teacherId: true,
            teacherName: true,

            assignmentPercentage: true,
            assignmentWeight: true,
            assignmentScore: true,

            assessmentPercentage: true,
            assessmentWeight: true,
            assessmentScore: true,

            examinationPercentage: true,
            examinationWeight: true,
            examinationScore: true,

            finalScore: true,

            grade: true,
            remark: true,
            gradePoint: true,

            passed: true,

            calculationStatus: true,

            subjectPosition: true,
            classAverage: true,
            highestScore: true,
            lowestScore: true,
          },

          orderBy: {
            subjectName: "asc",
          },
        },
      },
    });

  if (!reportCard) {
    return null;
  }

  return {
    ...reportCard,

    student:
        mapStudentIdentity(
            reportCard.student,
        ),
  };
}




/* -------------------------------------------------------------------------- */
/*                        TEACHER MANAGEABLE CLASS                            */
/* -------------------------------------------------------------------------- */

export async function getTeacherManageableClass(
  classId: number,
) {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (
    role !== "teacher" ||
    !Number.isInteger(classId) ||
    classId <= 0
  ) {
    return null;
  }

  return prisma.class.findFirst({
    where: {
      id: classId,

      lessons: {
        some: {
          teacherId: userId,
        },
      },
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

      _count: {
        select: {
          students: true,
          lessons: true,
        },
      },
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                  TEACHER CLASS REPORT-CARD COMMAND CENTRE                  */
/* -------------------------------------------------------------------------- */

type TeacherReportCardFilters = {
  search?: string;
  academicYear?: string;
  termId?: string;
  status?: string;
  calculationStatus?: string;
  reviewStatus?: string;
};

function parseTeacherPositiveInteger(
  value?: string,
): number | undefined {
  const parsed =
    Number(value);

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : undefined;
}

function parseTeacherReportStatus(
  value?: string,
): ReportCardStatus | undefined {
  const allowed:
    ReportCardStatus[] = [
      "DRAFT",
      "PUBLISHED",
      "ARCHIVED",
    ];

  return allowed.includes(
    value as ReportCardStatus,
  )
    ? (value as ReportCardStatus)
    : undefined;
}

function parseTeacherCalculationStatus(
  value?: string,
): ReportCardCalculationStatus | undefined {
  const allowed:
    ReportCardCalculationStatus[] = [
      "READY",
      "PARTIAL",
      "BLOCKED",
    ];

  return allowed.includes(
    value as ReportCardCalculationStatus,
  )
    ? (
        value as
          ReportCardCalculationStatus
      )
    : undefined;
}

function parseReportCardReviewStatus(
  value?: string,
): ReportCardReviewStatus | undefined {
  const allowed:
    ReportCardReviewStatus[] = [
      "DRAFT",
      "SUBMITTED",
      "CHANGES_REQUESTED",
      "APPROVED",
    ];

  return allowed.includes(
    value as ReportCardReviewStatus,
  )
    ? (
        value as
          ReportCardReviewStatus
      )
    : undefined;
}

function parseTeacherReviewStatus(
  value?: string,
): ReportCardReviewStatus | undefined {
  const allowed: ReportCardReviewStatus[] = [
    "DRAFT",
    "SUBMITTED",
    "CHANGES_REQUESTED",
    "APPROVED",
  ];

  return allowed.includes(
    value as ReportCardReviewStatus,
  )
    ? (value as ReportCardReviewStatus)
    : undefined;
}

export async function getTeacherClassReportCardCommandCentre({
  classId,
  filters = {},
  page = 1,
  pageSize = 15,
}: {
  classId: number;
  filters?: TeacherReportCardFilters;
  page?: number;
  pageSize?: number;
}) {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (role !== "teacher") {
    throw new Error(
      "UNAUTHORISED",
    );
  }

  const manageableClass =
    await prisma.class.findFirst({
      where: {
        id: classId,

        lessons: {
          some: {
            teacherId: userId,
          },
        },
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
      },
    });

  if (!manageableClass) {
    return null;
  }

  const safePage =
    Math.max(1, page);

  const safePageSize =
    Math.min(
      Math.max(1, pageSize),
      50,
    );

  const termId =
    parseTeacherPositiveInteger(
      filters.termId,
    );

  const status =
    parseTeacherReportStatus(
      filters.status,
    );

  const calculationStatus =
    parseTeacherCalculationStatus(
      filters.calculationStatus,
    );

  const reviewStatus =
  parseTeacherReviewStatus(
    filters.reviewStatus,
  );

  const search =
    filters.search?.trim();

  const academicYear =
    filters.academicYear?.trim();

  const where:
    Prisma.ReportCardWhereInput = {
    classId,

    /*
     * The class must still be connected to at least
     * one lesson taught by the authenticated teacher.
     */
    class: {
      lessons: {
        some: {
          teacherId: userId,
        },
      },
    },

    ...(termId
      ? {
          termId,
        }
      : {}),

    ...(academicYear
      ? {
          academicYear,
        }
      : {}),

    ...(status
      ? {
          status,
        }
      : {}),

    ...(calculationStatus
      ? {
          calculationStatus,
        }
      : {}),

    ...(reviewStatus
      ? {
          reviewStatus,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              student: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },

            {
              student: {
                surname: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },

            {
              student: {
                studentID: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [
    reportCards,
    total,
    statusGroups,
    calculationGroups,
    reviewGroups,
    scoreAggregate,
    terms,
    academicYearRows,
    publishable,
  ] = await prisma.$transaction([
    prisma.reportCard.findMany({
      where,

      select: {
        id: true,
        version: true,
        academicYear: true,

        status:
          true,

        reviewStatus:
          true,

        calculationStatus:
          true,

        isStale:
          true,

        staleAt:
          true,

        staleReason:
          true,

        student: {
          select: {
            id: true,
            studentID: true,
            name: true,
            surname: true,
            img: true,
          },
        },

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

        term: {
          select: {
            id: true,
            name: true,
          },
        },

        subjectCount: true,
        completedSubjectCount: true,
        incompleteSubjectCount: true,

        totalScore: true,
        averageScore: true,

        overallGrade: true,
        overallPosition: true,
        classStudentCount: true,

        generatedAt: true,
        regeneratedAt: true,
        publishedAt: true,

        submittedForReviewAt: true,
        approvedAt: true,
        changesRequestedAt: true,
      },

      orderBy: [
        {
          updatedAt: "desc",
        },

        {
          student: {
            surname: "asc",
          },
        },
      ],

      skip:
        (safePage - 1) *
        safePageSize,

      take:
        safePageSize,
    }),

    prisma.reportCard.count({
      where,
    }),

    prisma.reportCard.groupBy({
      by: ["status"],
      where,

      _count: {
        _all: true,
      },
    }),

    prisma.reportCard.groupBy({
      by: [
        "calculationStatus",
      ],

      where,

      _count: {
        _all: true,
      },
    }),

    prisma.reportCard.groupBy({
      by: [
        "reviewStatus",
      ],

      where,

      _count: {
        _all: true,
      },
    }),

    prisma.reportCard.aggregate({
      where: {
        ...where,

        averageScore: {
          not: null,
        },
      },

      _avg: {
        averageScore: true,
      },
    }),

    prisma.schoolTerm.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
      },

      orderBy: {
        startDate: "desc",
      },
    }),

    prisma.reportCard.findMany({
      where: {
        classId,

        class: {
          lessons: {
            some: {
              teacherId: userId,
            },
          },
        },
      },

      distinct: [
        "academicYear",
      ],

      select: {
        academicYear: true,
      },

      orderBy: {
        academicYear: "desc",
      },
    }),

    prisma.reportCard.count({
      where: {
        ...where,

        status: "DRAFT",

        calculationStatus:
          "READY",

        reviewStatus:
          "APPROVED",

        isStale:
          false,

        subjectCount: {
          gt: 0,
        },

        incompleteSubjectCount:
          0,
      },
    }),
  ]);

  const statusCount =
    new Map(
      statusGroups.map(
        (group) => [
          group.status,
          group._count._all,
        ],
      ),
    );

  const calculationCount =
    new Map(
      calculationGroups.map(
        (group) => [
          group.calculationStatus,
          group._count._all,
        ],
      ),
    );

  const reviewCount =
  new Map(
    reviewGroups.map(
      (group) => [
        group.reviewStatus,
        group._count._all,
      ],
    ),
  );

  const items =
    reportCards.map(
      (reportCard) => ({
        ...reportCard,

        student:
          mapStudentIdentity(
            reportCard.student,
          ),
      }),
    );

  return {
    manageableClass,

    data: items,

    metrics: {
      total,

      draft:
        statusCount.get(
          "DRAFT",
        ) ?? 0,

      published:
        statusCount.get(
          "PUBLISHED",
        ) ?? 0,

      archived:
        statusCount.get(
          "ARCHIVED",
        ) ?? 0,

      ready:
        calculationCount.get(
          "READY",
        ) ?? 0,

      partial:
        calculationCount.get(
          "PARTIAL",
        ) ?? 0,

      blocked:
        calculationCount.get(
          "BLOCKED",
        ) ?? 0,

      preparing:
        reviewCount.get(
          "DRAFT",
        ) ?? 0,

      awaitingReview:
        reviewCount.get(
          "SUBMITTED",
        ) ?? 0,

      changesRequested:
        reviewCount.get(
          "CHANGES_REQUESTED",
        ) ?? 0,

      approved:
        reviewCount.get(
          "APPROVED",
        ) ?? 0,

      averageScore:
        scoreAggregate._avg
          .averageScore,

      publishable,
    },

    filters: {
      /*
       * The teacher route is locked to one class,
       * so only that class is returned.
       */
      classes: [
        {
          id:
            manageableClass.id,

          name:
            manageableClass.name,
        },
      ],

      terms,

      academicYears:
        academicYearRows.map(
          (row) =>
            row.academicYear,
        ),
    },

    pagination: {
      page:
        safePage,

      pageSize:
        safePageSize,

      total,

      totalPages:
        Math.max(
          1,
          Math.ceil(
            total /
              safePageSize,
          ),
        ),
    },
  };
}


/* -------------------------------------------------------------------------- */
/*                    TEACHER ACCESSIBLE REPORT CARD                          */
/* -------------------------------------------------------------------------- */

export async function getTeacherAccessibleReportCard({
  classId,
  reportCardId,
}: {
  classId: number;
  reportCardId: number;
}) {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (
    role !== "teacher" ||
    !Number.isInteger(classId) ||
    classId <= 0 ||
    !Number.isInteger(
      reportCardId,
    ) ||
    reportCardId <= 0
  ) {
    return null;
  }

  const reportCard =
    await prisma.reportCard.findFirst({
      where: {
        id:
          reportCardId,

        classId,

        class: {
          lessons: {
            some: {
              teacherId:
                userId,
            },
          },
        },
      },

      select: {
        id: true,

        status: true,
        calculationStatus: true,

        version: true,
        academicYear: true,

        student: {
          select: {
            id: true,
            studentID: true,
            name: true,
            surname: true,
            img: true,
          },
        },

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

        term: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },

        subjectCount: true,
        completedSubjectCount: true,
        incompleteSubjectCount: true,

        totalScore: true,
        averageScore: true,

        highestSubjectScore: true,
        lowestSubjectScore: true,

        passedSubjectCount: true,
        failedSubjectCount: true,
        passRate: true,

        totalGradePoints: true,
        averageGradePoint: true,

        overallGrade: true,
        overallRemark: true,
        overallGradePoint: true,

        overallPosition: true,
        classStudentCount: true,

        daysSchoolOpened: true,
        daysPresent: true,
        daysAbsent: true,
        attendancePercentage: true,

        conduct: true,
        classTeacherRemark: true,
        headTeacherRemark: true,
        promotionStatus: true,
        nextTermBegins: true,

        generatedAt: true,
        regeneratedAt: true,
        publishedAt: true,

        subjects: {
          select: {
            id: true,

            subjectId: true,
            subjectName: true,

            teacherId: true,
            teacherName: true,

            assignmentPercentage: true,
            assignmentWeight: true,
            assignmentScore: true,

            assessmentPercentage: true,
            assessmentWeight: true,
            assessmentScore: true,

            examinationPercentage: true,
            examinationWeight: true,
            examinationScore: true,

            finalScore: true,

            grade: true,
            remark: true,
            gradePoint: true,

            passed: true,

            calculationStatus: true,

            subjectPosition: true,
            classAverage: true,
            highestScore: true,
            lowestScore: true,
          },

          orderBy: {
            subjectName:
              "asc",
          },
        },
      },
    });

  if (!reportCard) {
    return null;
  }

  return {
    ...reportCard,

    student:
      mapStudentIdentity(
        reportCard.student,
      ),
  };
}



/* -------------------------------------------------------------------------- */
/*                    REPORT-CARD GENERATION OPTIONS                          */
/* -------------------------------------------------------------------------- */

export async function getReportCardGenerationOptions() {
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

  const [
    classes,
    terms,
    weightingYears,
  ] = await prisma.$transaction([
    prisma.class.findMany({
      where:
        role === "teacher"
          ? {
              lessons: {
                some: {
                  teacherId:
                    userId,
                },
              },
            }
          : undefined,

      select: {
        id: true,
        name: true,

        grade: {
          select: {
            id: true,
            level: true,
          },
        },

        _count: {
          select: {
            students: true,
            lessons: true,
          },
        },
      },

      orderBy: [
        {
          grade: {
            level: "asc",
          },
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

        startDate: true,
        endDate: true,

        isActive: true,
      },

      orderBy: {
        startDate: "desc",
      },
    }),

    prisma.academicWeighting.findMany({
      where: {
        isActive: true,

        ...(role === "teacher"
          ? {
              grade: {
                classess: {
                  some: {
                    lessons: {
                      some: {
                        teacherId:
                          userId,
                      },
                    },
                  },
                },
              },
            }
          : {}),
      },

      distinct: [
        "academicYear",
      ],

      select: {
        academicYear: true,
      },

      orderBy: {
        academicYear: "desc",
      },
    }),
  ]);

  const activeTerm =
    terms.find(
      (term) =>
        term.isActive,
    ) ?? null;

  return {
    classes:
      classes.map(
        (classOption) => ({
          id:
            classOption.id,

          name:
            classOption.name,

          grade:
            classOption.grade,

          studentCount:
            classOption._count
              .students,

          lessonCount:
            classOption._count
              .lessons,
        }),
      ),

    terms,

    academicYears:
      weightingYears.map(
        (weighting) =>
          weighting.academicYear,
      ),

    defaultAcademicYear:
      weightingYears[0]
        ?.academicYear ??
      null,

    defaultTermId:
      activeTerm?.id ??
      null,
  };
}




/* -------------------------------------------------------------------------- */
/*                    REPORT-CARD GENERATION READINESS                        */
/* -------------------------------------------------------------------------- */

export async function getReportCardGenerationReadiness({
  classId,
  academicYear,
  termId,
}: {
  classId: number;
  academicYear: string;
  termId: number;
}) {
  return validateReportCardGeneration({
    classId,
    academicYear,
    termId,
  });
}

/* -------------------------------------------------------------------------- */
/*                     REPORT-CARD REVIEW WORKSPACE                           */
/* -------------------------------------------------------------------------- */

export async function getReportCardReviewWorkspace(
  reportCardId: number,
): Promise<
  ReportCardReviewWorkspaceData | null
> {
  const {
    userId,
    role,
  } =
    await requireReportCardUser();

  if (
    role !== "admin" &&
    role !== "teacher"
  ) {
    return null;
  }

  if (
    !Number.isInteger(
      reportCardId,
    ) ||
    reportCardId <= 0
  ) {
    return null;
  }

  const reportCard =
    await prisma.reportCard.findFirst({
      where: {
        id:
          reportCardId,

        ...(role === "teacher"
          ? {
              class: {
                lessons: {
                  some: {
                    teacherId:
                      userId,
                  },
                },
              },
            }
          : {}),
      },

      select: {
        id: true,

        status: true,
        reviewStatus: true,
        calculationStatus: true,

        version: true,
        academicYear: true,

        student: {
          select: {
            id: true,
            studentID: true,
            name: true,
            surname: true,
            img: true,
          },
        },

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

        term: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },

        subjectCount: true,
        completedSubjectCount:
          true,
        incompleteSubjectCount:
          true,

        totalScore: true,
        averageScore: true,

        overallGrade: true,
        overallRemark: true,

        overallPosition: true,
        classStudentCount: true,

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

        reviewNote: true,

        submittedForReviewAt:
          true,

        submittedForReviewBy:
          true,

        approvedAt: true,
        approvedBy: true,

        changesRequestedAt:
          true,

        changesRequestedBy:
          true,

        publishedAt: true,
        publishedBy: true,

        lockedAt: true,

        updatedAt: true,

        subjects: {
          select: {
            id: true,

            subjectId: true,
            subjectName: true,

            teacherId: true,
            teacherName: true,

            assignmentPercentage:
              true,

            assignmentScore:
              true,

            assessmentPercentage:
              true,

            assessmentScore:
              true,

            examinationPercentage:
              true,

            examinationScore:
              true,

            finalScore: true,

            grade: true,
            remark: true,
            passed: true,

            subjectPosition:
              true,

            classAverage: true,

            calculationStatus:
              true,
          },

          orderBy: {
            subjectName:
              "asc",
          },
        },
      },
    });

  if (!reportCard) {
    return null;
  }

  const readiness =
    reviewReportCardReadiness(
      reportCard,
    );

  const permissions =
    resolveReportCardReviewPermissions({
      role,

      status:
        reportCard.status,

      reviewStatus:
        reportCard.reviewStatus,

      calculationStatus:
        reportCard.calculationStatus,
    });

  return {
    id:
      reportCard.id,

    status:
      reportCard.status,

    reviewStatus:
      reportCard.reviewStatus,

    calculationStatus:
      reportCard.calculationStatus,

    version:
      reportCard.version,

    academicYear:
      reportCard.academicYear,

    student:
      mapStudentIdentity(
        reportCard.student,
      ),

    class:
      reportCard.class,

    grade:
      reportCard.grade,

    term:
      reportCard.term,

    subjectCount:
      reportCard.subjectCount,

    completedSubjectCount:
      reportCard.completedSubjectCount,

    incompleteSubjectCount:
      reportCard.incompleteSubjectCount,

    totalScore:
      reportCard.totalScore,

    averageScore:
      reportCard.averageScore,

    overallGrade:
      reportCard.overallGrade,

    overallRemark:
      reportCard.overallRemark,

    overallPosition:
      reportCard.overallPosition,

    classStudentCount:
      reportCard.classStudentCount,

    daysSchoolOpened:
      reportCard.daysSchoolOpened,

    daysPresent:
      reportCard.daysPresent,

    daysAbsent:
      reportCard.daysAbsent,

    attendancePercentage:
      reportCard.attendancePercentage,

    conduct:
      reportCard.conduct,

    attitude:
      reportCard.attitude,

    interest:
      reportCard.interest,

    classTeacherRemark:
      reportCard.classTeacherRemark,

    headTeacherRemark:
      reportCard.headTeacherRemark,

    promotionStatus:
      reportCard.promotionStatus,

    termClosedOn:
      reportCard.termClosedOn,

    nextTermBegins:
      reportCard.nextTermBegins,

    reviewNote:
      reportCard.reviewNote,

    submittedForReviewAt:
      reportCard.submittedForReviewAt,

    submittedForReviewBy:
      reportCard.submittedForReviewBy,

    approvedAt:
      reportCard.approvedAt,

    approvedBy:
      reportCard.approvedBy,

    changesRequestedAt:
      reportCard.changesRequestedAt,

    changesRequestedBy:
      reportCard.changesRequestedBy,

    publishedAt:
      reportCard.publishedAt,

    publishedBy:
      reportCard.publishedBy,

    lockedAt:
      reportCard.lockedAt,

    updatedAt:
      reportCard.updatedAt,

    subjects:
      reportCard.subjects,

    readiness,

    permissions,
  };
}





function parseBulkReviewStatus(
  value?: string,
): ReportCardReviewStatus | undefined {
  const statuses:
    ReportCardReviewStatus[] = [
      "DRAFT",
      "SUBMITTED",
      "CHANGES_REQUESTED",
      "APPROVED",
    ];

  return statuses.includes(
    value as ReportCardReviewStatus,
  )
    ? value as ReportCardReviewStatus
    : undefined;
}

function parseBulkCalculationStatus(
  value?: string,
):
  | ReportCardCalculationStatus
  | undefined {
  const statuses:
    ReportCardCalculationStatus[] = [
      "READY",
      "PARTIAL",
      "BLOCKED",
    ];

  return statuses.includes(
    value as
      ReportCardCalculationStatus,
  )
    ? value as
        ReportCardCalculationStatus
    : undefined;
}

function parseBulkPositiveInteger(
  value?: string,
): number | undefined {
  const parsed = Number(value);

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : undefined;
}



/* -------------------------------------------------------------------------- */
/*                  ADMINISTRATOR BULK REVIEW WORKSPACE                       */
/* -------------------------------------------------------------------------- */

export async function getReportCardBulkReviewWorkspace({
  filters = {},
  page = 1,
  pageSize = 30,
}: {
  filters?: {
    classId?: string;
    termId?: string;
    academicYear?: string;

    reviewStatus?: string;
    calculationStatus?: string;

    search?: string;
  };

  page?: number;
  pageSize?: number;
} = {}) {
  const {
    userId,
    role,
  } = await requireReportCardUser();

  if (role !== "admin") {
    throw new Error(
      "ADMIN_REQUIRED",
    );
  }

  const safePage =
    Math.max(
      1,
      page,
    );

  const safePageSize =
    Math.min(
      Math.max(
        1,
        pageSize,
      ),
      100,
    );

  const classId =
    parseBulkPositiveInteger(
      filters.classId,
    );

  const termId =
    parseBulkPositiveInteger(
      filters.termId,
    );

  const academicYear =
    filters.academicYear?.trim();

  const reviewStatus =
    parseBulkReviewStatus(
      filters.reviewStatus,
    );

  const calculationStatus =
    parseBulkCalculationStatus(
      filters.calculationStatus,
    );

  const search =
    filters.search?.trim();

  const where:
    Prisma.ReportCardWhereInput = {
    ...(classId
      ? {
          classId,
        }
      : {}),

    ...(termId
      ? {
          termId,
        }
      : {}),

    ...(academicYear
      ? {
          academicYear,
        }
      : {}),

    ...(reviewStatus
      ? {
          reviewStatus,
        }
      : {}),

    ...(calculationStatus
      ? {
          calculationStatus,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              student: {
                name: {
                  contains:
                    search,

                  mode:
                    "insensitive",
                },
              },
            },

            {
              student: {
                surname: {
                  contains:
                    search,

                  mode:
                    "insensitive",
                },
              },
            },

            {
              student: {
                studentID: {
                  contains:
                    search,

                  mode:
                    "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  };

  const [
  reportCards,
  total,
  completeReportCount,
  reviewGroups,
  calculationGroups,
  lifecycleGroups,
  averageAggregate,
  classes,
  terms,
  academicYearRows,
  publishable,
] = await prisma.$transaction([
  prisma.reportCard.findMany({
    where,

    select: {
      id: true,
      version: true,

      status: true,
      reviewStatus: true,
      calculationStatus: true,

      academicYear: true,

      student: {
        select: {
          id: true,
          studentID: true,
          name: true,
          surname: true,
          img: true,
        },
      },

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

      term: {
        select: {
          id: true,
          name: true,
        },
      },

      subjectCount: true,
      completedSubjectCount: true,
      incompleteSubjectCount: true,

      averageScore: true,
      overallGrade: true,

      overallPosition: true,
      classStudentCount: true,

      daysSchoolOpened: true,
      daysPresent: true,
      daysAbsent: true,

      classTeacherRemark: true,
      headTeacherRemark: true,
      promotionStatus: true,

      reviewNote: true,

      submittedForReviewAt: true,
      approvedAt: true,
      publishedAt: true,

      updatedAt: true,
    },

    orderBy: [
      {
        class: {
          name: "asc",
        },
      },
      {
        overallPosition: "asc",
      },
      {
        student: {
          surname: "asc",
        },
      },
    ],

    skip:
      (safePage - 1) *
      safePageSize,

    take: safePageSize,
  }),

  // All filtered report cards
  prisma.reportCard.count({
    where,
  }),

  // Complete report cards across the full filtered set
  prisma.reportCard.count({
    where: {
      ...where,

      subjectCount: {
        gt: 0,
      },

      incompleteSubjectCount: 0,
    },
  }),

  prisma.reportCard.groupBy({
    by: ["reviewStatus"],
    where,

    _count: {
      _all: true,
    },
  }),

  prisma.reportCard.groupBy({
    by: ["calculationStatus"],
    where,

    _count: {
      _all: true,
    },
  }),

  prisma.reportCard.groupBy({
    by: ["status"],
    where,

    _count: {
      _all: true,
    },
  }),

  prisma.reportCard.aggregate({
    where: {
      ...where,

      averageScore: {
        not: null,
      },
    },

    _avg: {
      averageScore: true,
    },
  }),

  prisma.class.findMany({
    select: {
      id: true,
      name: true,

      grade: {
        select: {
          id: true,
          level: true,
        },
      },
    },

    orderBy: [
      {
        grade: {
          level: "asc",
        },
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

    orderBy: {
      startDate: "desc",
    },
  }),

  prisma.reportCard.findMany({
    distinct: ["academicYear"],

    select: {
      academicYear: true,
    },

    orderBy: {
      academicYear: "desc",
    },
  }),

  // Approved and academically ready drafts
  prisma.reportCard.count({
    where: {
      ...where,

      status: "DRAFT",
      reviewStatus: "APPROVED",
      calculationStatus: "READY",
    },
  }),
]);

  const reviewCount =
    new Map(
      reviewGroups.map(
        (group) => [
          group.reviewStatus,
          group._count._all,
        ],
      ),
    );

  const calculationCount =
    new Map(
      calculationGroups.map(
        (group) => [
          group.calculationStatus,
          group._count._all,
        ],
      ),
    );

  const lifecycleCount =
    new Map(
      lifecycleGroups.map(
        (group) => [
          group.status,
          group._count._all,
        ],
      ),
    );

  const items =
    reportCards.map(
      (reportCard) => ({
        ...reportCard,

        student:
          mapStudentIdentity(
            reportCard.student,
          ),

        canApprove:
          reportCard.status ===
            "DRAFT" &&
          reportCard.reviewStatus ===
            "SUBMITTED" &&
          reportCard.calculationStatus ===
            "READY",

        canRequestChanges:
          reportCard.status ===
            "DRAFT" &&
          reportCard.reviewStatus ===
            "SUBMITTED",

        canPublish:
          reportCard.status ===
            "DRAFT" &&
          reportCard.reviewStatus ===
            "APPROVED" &&
          reportCard.calculationStatus ===
            "READY",
      }),
    );

  const completionPercentage =
  total > 0
    ? Math.round(
        (
          completeReportCount /
          total
        ) * 100,
      )
    : 0;

    await prisma.reportCard.count({
      where: {
        ...where,

        status:
          "DRAFT",

        reviewStatus:
          "APPROVED",

        calculationStatus:
          "READY",
      },
    });

  return {
    items,

    metrics: {
      total,

      preparing:
        reviewCount.get(
          "DRAFT",
        ) ?? 0,

      awaitingReview:
        reviewCount.get(
          "SUBMITTED",
        ) ?? 0,

      changesRequested:
        reviewCount.get(
          "CHANGES_REQUESTED",
        ) ?? 0,

      approved:
        reviewCount.get(
          "APPROVED",
        ) ?? 0,

      academicallyReady:
        calculationCount.get(
          "READY",
        ) ?? 0,

      partial:
        calculationCount.get(
          "PARTIAL",
        ) ?? 0,

      blocked:
        calculationCount.get(
          "BLOCKED",
        ) ?? 0,

      publishable,

      published:
        lifecycleCount.get(
          "PUBLISHED",
        ) ?? 0,

      averageScore:
        averageAggregate._avg
          .averageScore,

      completionPercentage,
    },

    options: {
      classes,
      terms,

      academicYears:
        academicYearRows.map(
          (item) =>
            item.academicYear,
        ),
    },

    selection: {
      classId:
        classId ?? null,

      termId:
        termId ?? null,

      academicYear:
        academicYear ?? null,
    },

    pagination: {
      page:
        safePage,

      pageSize:
        safePageSize,

      total,

      totalPages:
        Math.max(
          1,
          Math.ceil(
            total /
              safePageSize,
          ),
        ),
    },
  };
}