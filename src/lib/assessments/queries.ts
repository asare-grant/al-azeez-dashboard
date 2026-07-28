import prisma from "@/lib/prisma";
import type { Prisma, AssessmentStatus } from "@prisma/client";

import { synchronizeAssessmentStatuses } from "./status";

import { requireAssessmentManager, requireAssessmentStudent } from "./auth";

import type {
  AssessmentBuilderData,
  AssessmentLessonOption,
  StudentAssessmentIntroductionData,
  StudentAssessmentPlayerData,
  TeacherAssessmentAnalytics,
  TeacherAssessmentSubmissionStatus,
  TeacherAssessmentSubmissionSummary,
  TeacherStudentSubmissionReview,
} from "./types";

import { deterministicShuffle } from "./shuffle";

import { hasAttemptExpired } from "./timing";
import { synchronizeExpiredAttempts } from "./attempt-status";

/* -------------------------------------------------------------------------- */
/*                           TEACHER LESSON OPTIONS                           */
/* -------------------------------------------------------------------------- */

export async function getAssessmentLessonOptions(): Promise<
  AssessmentLessonOption[]
> {
  const { userId, role } = await requireAssessmentManager();

  const lessons = await prisma.lesson.findMany({
    where:
      role === "teacher"
        ? {
            teacherId: userId,
          }
        : undefined,

    select: {
      id: true,
      name: true,

      subject: {
        select: {
          id: true,
          name: true,
        },
      },

      class: {
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

    orderBy: [
      {
        class: {
          name: "asc",
        },
      },
      {
        subject: {
          name: "asc",
        },
      },
    ],
  });

  return lessons;
}

/* -------------------------------------------------------------------------- */
/*                          ASSESSMENT OWNERSHIP QUERY                         */
/* -------------------------------------------------------------------------- */

export async function getManageableAssessment(assessmentId: number) {
  const { userId, role } = await requireAssessmentManager();

  return prisma.assessment.findFirst({
    where: {
      id: assessmentId,

      ...(role === "teacher"
        ? {
            lesson: {
              teacherId: userId,
            },
          }
        : {}),
    },

    include: {
      lesson: {
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      },

      questions: {
        orderBy: {
          position: "asc",
        },

        include: {
          options: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },

      _count: {
        select: {
          attempts: true,
          results: true,
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                      LOAD ASSESSMENT FOR TEACHER EDITING                    */
/* -------------------------------------------------------------------------- */

export async function getAssessmentBuilderData(
  assessmentId: number,
): Promise<AssessmentBuilderData | null> {
  const assessment = await getManageableAssessment(assessmentId);

  if (!assessment) {
    return null;
  }

  return {
    id: assessment.id,
    title: assessment.title,
    instructions: assessment.instructions ?? "",

    lessonId: assessment.lessonId,

    startDate: assessment.startDate,
    dueDate: assessment.dueDate,

    durationMinutes: assessment.durationMinutes,
    passMarkPercent: assessment.passMarkPercent,
    maxAttempts: assessment.maxAttempts,

    shuffleQuestions: assessment.shuffleQuestions,
    shuffleOptions: assessment.shuffleOptions,
    allowBacktrack: assessment.allowBacktrack,
    allowUnanswered: assessment.allowUnanswered,

    showInstantResult: assessment.showInstantResult,
    showCorrectAnswers: assessment.showCorrectAnswers,
    showExplanations: assessment.showExplanations,

    autoSubmit: assessment.autoSubmit,

    status: assessment.status,

    questions: assessment.questions.map((question) => ({
      id: question.id,
      clientId: `question-${question.id}`,
      questionText: question.questionText,
      imageUrl: question.imageUrl ?? "",
      explanation: question.explanation ?? "",
      marks: question.marks,
      position: question.position,

      options: question.options.map((option) => ({
        id: option.id,
        clientId: `option-${option.id}`,
        optionText: option.optionText,
        imageUrl: option.imageUrl ?? "",
        isCorrect: option.isCorrect,
        position: option.position,
      })),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/*                       TEACHER ASSESSMENT LIST QUERY                         */
/* -------------------------------------------------------------------------- */

export type AssessmentListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;

  classId?: number;
  subjectId?: number;
  lessonId?: number;

  status?: AssessmentStatus;
};

export async function getTeacherAssessmentList({
  page = 1,
  pageSize = 10,
  search,
  classId,
  subjectId,
  lessonId,
  status,
}: AssessmentListFilters = {}) {
  await synchronizeAssessmentStatuses();

  const { userId, role } = await requireAssessmentManager();

  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 50);

  const lessonFilter: Prisma.LessonWhereInput = {
    ...(role === "teacher"
      ? {
          teacherId: userId,
        }
      : {}),

    ...(classId
      ? {
          classId,
        }
      : {}),
    ...(subjectId
      ? {
          subjectId,
        }
      : {}),
  };

  const where: Prisma.AssessmentWhereInput = {
    ...(Object.keys(lessonFilter).length > 0
      ? {
          lesson: lessonFilter,
        }
      : {}),

    ...(lessonId
      ? {
          lessonId,
        }
      : {}),

    ...(status
      ? {
          status,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },

            {
              lesson: {
                subject: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },

            {
              lesson: {
                class: {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [assessments, total] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,

      select: {
        id: true,
        title: true,
        status: true,

        startDate: true,
        dueDate: true,

        durationMinutes: true,
        totalMarks: true,
        questionCount: true,
        passMarkPercent: true,

        createdAt: true,
        updatedAt: true,
        publishedAt: true,

        lesson: {
          select: {
            id: true,

            subject: {
              select: {
                id: true,
                name: true,
              },
            },

            class: {
              select: {
                id: true,
                name: true,

                _count: {
                  select: {
                    students: true,
                  },
                },
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

        attempts: {
          where: {
            status: {
              in: ["SUBMITTED", "AUTO_SUBMITTED"],
            },
          },

          select: {
            percentage: true,
            studentId: true,
          },
        },

        _count: {
          select: {
            attempts: true,
            results: true,
          },
        },
      },

      orderBy: [
        {
          updatedAt: "desc",
        },
      ],

      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),

    prisma.assessment.count({
      where,
    }),
  ]);

  const data = assessments.map((assessment) => {
    const completedAttempts = assessment.attempts.filter(
      (attempt) => attempt.percentage !== null,
    );

    const uniqueSubmittedStudents = new Set(
      completedAttempts.map((attempt) => attempt.studentId),
    ).size;

    const averagePercentage =
      completedAttempts.length > 0
        ? Number(
            (
              completedAttempts.reduce(
                (totalPercentage, attempt) =>
                  totalPercentage + (attempt.percentage ?? 0),
                0,
              ) / completedAttempts.length
            ).toFixed(2),
          )
        : null;

    return {
      ...assessment,
      submittedStudents: uniqueSubmittedStudents,
      classStudentCount: assessment.lesson.class._count.students,
      averagePercentage,
    };
  });

  return {
    data,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT ASSESSMENT ACCESS                           */
/* -------------------------------------------------------------------------- */

export async function getStudentAccessibleAssessment(assessmentId: number) {
  const { userId } = await requireAssessmentStudent();

  return prisma.assessment.findFirst({
    where: {
      id: assessmentId,

      lesson: {
        class: {
          students: {
            some: {
              id: userId,
            },
          },
        },
      },

      status: {
        in: ["SCHEDULED", "PUBLISHED", "CLOSED"],
      },
    },

    include: {
      lesson: {
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      },

      _count: {
        select: {
          questions: true,
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                       ASSESSMENT DASHBOARD METRICS                          */
/* -------------------------------------------------------------------------- */

export async function getAssessmentDashboardMetrics() {
  await synchronizeAssessmentStatuses();

  const { userId, role } = await requireAssessmentManager();

  const ownershipWhere: Prisma.AssessmentWhereInput =
    role === "teacher"
      ? {
          lesson: {
            teacherId: userId,
          },
        }
      : {};

  const [
    total,
    draft,
    scheduled,
    active,
    closed,
    archived,
    submittedAttempts,
    eligibleStudents,
  ] = await prisma.$transaction([
    prisma.assessment.count({
      where: ownershipWhere,
    }),

    prisma.assessment.count({
      where: {
        ...ownershipWhere,
        status: "DRAFT",
      },
    }),

    prisma.assessment.count({
      where: {
        ...ownershipWhere,
        status: "SCHEDULED",
      },
    }),

    prisma.assessment.count({
      where: {
        ...ownershipWhere,
        status: "PUBLISHED",
      },
    }),

    prisma.assessment.count({
      where: {
        ...ownershipWhere,
        status: "CLOSED",
      },
    }),

    prisma.assessment.count({
      where: {
        ...ownershipWhere,
        status: "ARCHIVED",
      },
    }),

    prisma.assessmentAttempt.findMany({
      where: {
        assessment: ownershipWhere,

        status: {
          in: ["SUBMITTED", "AUTO_SUBMITTED"],
        },

        percentage: {
          not: null,
        },
      },

      select: {
        percentage: true,
        studentId: true,
        assessmentId: true,
      },
    }),

    prisma.assessment.findMany({
      where: {
        ...ownershipWhere,

        status: {
          in: ["SCHEDULED", "PUBLISHED", "CLOSED"],
        },
      },

      select: {
        lesson: {
          select: {
            class: {
              select: {
                _count: {
                  select: {
                    students: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const totalEligibleSubmissions = eligibleStudents.reduce(
    (sum, assessment) => sum + assessment.lesson.class._count.students,
    0,
  );

  const uniqueSubmissions = new Set(
    submittedAttempts.map(
      (attempt) => `${attempt.assessmentId}-${attempt.studentId}`,
    ),
  ).size;

  const submissionRate =
    totalEligibleSubmissions > 0
      ? Number(
          ((uniqueSubmissions / totalEligibleSubmissions) * 100).toFixed(1),
        )
      : 0;

  const averageScore =
    submittedAttempts.length > 0
      ? Number(
          (
            submittedAttempts.reduce(
              (sum, attempt) => sum + (attempt.percentage ?? 0),
              0,
            ) / submittedAttempts.length
          ).toFixed(1),
        )
      : null;

  return {
    total,
    draft,
    scheduled,
    active,
    closed,
    archived,
    submissionRate,
    averageScore,
  };
}

/* -------------------------------------------------------------------------- */
/*                         ASSESSMENT FILTER OPTIONS                           */
/* -------------------------------------------------------------------------- */

export async function getAssessmentFilterOptions() {
  const { userId, role } = await requireAssessmentManager();

  const lessons = await prisma.lesson.findMany({
    where:
      role === "teacher"
        ? {
            teacherId: userId,
          }
        : undefined,

    select: {
      class: {
        select: {
          id: true,
          name: true,
        },
      },

      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      id: "asc",
    },
  });

  const classMap = new Map<
    number,
    {
      id: number;
      name: string;
    }
  >();

  const subjectMap = new Map<
    number,
    {
      id: number;
      name: string;
    }
  >();

  for (const lesson of lessons) {
    classMap.set(lesson.class.id, lesson.class);

    subjectMap.set(lesson.subject.id, lesson.subject);
  }

  return {
    classes: Array.from(classMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),

    subjects: Array.from(subjectMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
}

/* -------------------------------------------------------------------------- */
/*                       STUDENT ASSESSMENT DASHBOARD                          */
/* -------------------------------------------------------------------------- */

export async function getStudentAssessmentDashboard() {
  await synchronizeAssessmentStatuses();

  const { userId } = await requireAssessmentStudent();

  await synchronizeExpiredAttempts({
    studentId: userId,
  });

  const now = new Date();

  const assessments = await prisma.assessment.findMany({
    where: {
      lesson: {
        class: {
          students: {
            some: {
              id: userId,
            },
          },
        },
      },

      status: {
        in: ["SCHEDULED", "PUBLISHED", "CLOSED"],
      },
    },

    select: {
      id: true,
      title: true,
      instructions: true,

      status: true,

      startDate: true,
      dueDate: true,

      durationMinutes: true,
      totalMarks: true,
      questionCount: true,
      passMarkPercent: true,
      maxAttempts: true,

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
      },

      attempts: {
        where: {
          studentId: userId,
        },

        orderBy: {
          attemptNumber: "desc",
        },

        select: {
          id: true,
          attemptNumber: true,
          status: true,

          startedAt: true,
          submittedAt: true,
          expiresAt: true,

          score: true,
          totalMarks: true,
          percentage: true,

          answers: {
            where: {
              selectedOptionId: {
                not: null,
              },
            },

            select: {
              id: true,
            },
          },
        },
      },

      results: {
        where: {
          studentId: userId,
          type: "ASSESSMENT",
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 1,

        select: {
          score: true,
          totalMarks: true,
          percentage: true,
          grade: true,
          remarks: true,
          createdAt: true,

          assessmentAttemptId: true,
        },
      },
    },

    orderBy: [
      {
        dueDate: "asc",
      },
    ],
  });

  const items = assessments.map((assessment) => {
    const attemptsUsed = assessment.attempts.length;

    const attemptsRemaining = Math.max(
      0,
      assessment.maxAttempts - attemptsUsed,
    );

    const activeAttempt = assessment.attempts.find(
      (attempt) =>
        attempt.status === "IN_PROGRESS" &&
        (!attempt.expiresAt || attempt.expiresAt > now),
    );

    const completedAttempts = assessment.attempts.filter(
      (attempt) =>
        attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
    );

    const latestCompletedAttempt = completedAttempts[0];

    const result = assessment.results[0];

    let dashboardStatus:
      | "AVAILABLE"
      | "IN_PROGRESS"
      | "UPCOMING"
      | "COMPLETED"
      | "MISSED"
      | "CLOSED";

    if (activeAttempt) {
      dashboardStatus = "IN_PROGRESS";
    } else if (latestCompletedAttempt) {
      dashboardStatus = "COMPLETED";
    } else if (assessment.startDate > now) {
      dashboardStatus = "UPCOMING";
    } else if (assessment.dueDate <= now && attemptsUsed === 0) {
      dashboardStatus = "MISSED";
    } else if (assessment.status === "CLOSED" || attemptsRemaining <= 0) {
      dashboardStatus = "CLOSED";
    } else {
      dashboardStatus = "AVAILABLE";
    }

    return {
      id: assessment.id,
      title: assessment.title,
      instructions: assessment.instructions,

      status: dashboardStatus,

      startDate: assessment.startDate,

      dueDate: assessment.dueDate,

      durationMinutes: assessment.durationMinutes,

      totalMarks: assessment.totalMarks,

      questionCount: assessment.questionCount,

      passMarkPercent: assessment.passMarkPercent,

      maxAttempts: assessment.maxAttempts,

      attemptsUsed,
      attemptsRemaining,

      lesson: assessment.lesson,

      activeAttempt: activeAttempt
        ? {
            id: activeAttempt.id,

            startedAt: activeAttempt.startedAt,

            expiresAt: activeAttempt.expiresAt,

            answeredCount: activeAttempt.answers.length,
          }
        : null,

      latestResult:
        result && result.assessmentAttemptId
          ? {
              attemptId: result.assessmentAttemptId,

              score: result.score,

              totalMarks: result.totalMarks ?? assessment.totalMarks,

              percentage: result.percentage ?? 0,

              grade: result.grade,

              remarks: result.remarks,

              submittedAt: result.createdAt,
            }
          : latestCompletedAttempt
            ? {
                attemptId: latestCompletedAttempt.id,

                score: latestCompletedAttempt.score ?? 0,

                totalMarks:
                  latestCompletedAttempt.totalMarks ?? assessment.totalMarks,

                percentage: latestCompletedAttempt.percentage ?? 0,

                grade: null,
                remarks: null,

                submittedAt:
                  latestCompletedAttempt.submittedAt ??
                  latestCompletedAttempt.startedAt,
              }
            : null,
    };
  });

  const completedItems = items.filter((item) => item.latestResult !== null);

  const averageScore =
    completedItems.length > 0
      ? Number(
          (
            completedItems.reduce(
              (sum, item) => sum + (item.latestResult?.percentage ?? 0),
              0,
            ) / completedItems.length
          ).toFixed(1),
        )
      : null;

  return {
    items,

    metrics: {
      available: items.filter((item) => item.status === "AVAILABLE").length,

      inProgress: items.filter((item) => item.status === "IN_PROGRESS").length,

      upcoming: items.filter((item) => item.status === "UPCOMING").length,

      completed: items.filter((item) => item.status === "COMPLETED").length,

      missed: items.filter((item) => item.status === "MISSED").length,

      averageScore,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                    STUDENT ASSESSMENT INTRODUCTION                         */
/* -------------------------------------------------------------------------- */

export async function getStudentAssessmentIntroduction(
  assessmentId: number,
): Promise<StudentAssessmentIntroductionData | null> {
  await synchronizeAssessmentStatuses();

  const { userId } = await requireAssessmentStudent();

  const now = new Date();

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,

      lesson: {
        class: {
          students: {
            some: {
              id: userId,
            },
          },
        },
      },

      status: {
        in: ["SCHEDULED", "PUBLISHED", "CLOSED"],
      },
    },

    select: {
      id: true,
      title: true,
      instructions: true,

      status: true,

      startDate: true,
      dueDate: true,

      durationMinutes: true,
      totalMarks: true,
      questionCount: true,
      passMarkPercent: true,
      maxAttempts: true,

      shuffleQuestions: true,
      shuffleOptions: true,
      allowBacktrack: true,
      allowUnanswered: true,
      autoSubmit: true,

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
      },

      attempts: {
        where: {
          studentId: userId,
        },

        orderBy: {
          attemptNumber: "desc",
        },

        select: {
          id: true,
          attemptNumber: true,
          status: true,

          startedAt: true,
          submittedAt: true,
          expiresAt: true,

          score: true,
          totalMarks: true,
          percentage: true,

          answers: {
            where: {
              selectedOptionId: {
                not: null,
              },
            },

            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    return null;
  }

  /*
   * A started attempt consumes one attempt unless
   * an administrator explicitly cancels it.
   */
  const countedAttempts = assessment.attempts.filter(
    (attempt) => attempt.status !== "CANCELLED",
  );

  const activeAttempt = countedAttempts.find(
    (attempt) =>
      attempt.status === "IN_PROGRESS" &&
      (!attempt.expiresAt || attempt.expiresAt > now),
  );

  const completedAttempt = countedAttempts.find(
    (attempt) =>
      attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
  );

  const latestAttempt = countedAttempts[0] ?? null;

  const attemptsUsed = countedAttempts.length;

  const attemptsRemaining = Math.max(0, assessment.maxAttempts - attemptsUsed);

  let status:
    | "AVAILABLE"
    | "IN_PROGRESS"
    | "UPCOMING"
    | "COMPLETED"
    | "CLOSED"
    | "MISSED";

  let unavailableReason: string | null = null;

  if (activeAttempt) {
    status = "IN_PROGRESS";
  } else if (assessment.startDate > now) {
    status = "UPCOMING";

    unavailableReason = "This assessment has not opened yet.";
  } else if (assessment.dueDate <= now && attemptsUsed === 0) {
    status = "MISSED";

    unavailableReason = "The assessment closing time has passed.";
  } else if (assessment.status === "CLOSED") {
    status = completedAttempt ? "COMPLETED" : "CLOSED";

    unavailableReason = completedAttempt ? null : "This assessment is closed.";
  } else if (attemptsRemaining <= 0) {
    status = completedAttempt ? "COMPLETED" : "CLOSED";

    unavailableReason = "You have used all available attempts.";
  } else if (completedAttempt) {
    /*
     * The student has completed an attempt but
     * may still have a retake available.
     */
    status = "COMPLETED";
  } else {
    status = "AVAILABLE";
  }

  const canContinue = Boolean(activeAttempt);

  const canStart =
    !activeAttempt &&
    assessment.status === "PUBLISHED" &&
    assessment.startDate <= now &&
    assessment.dueDate > now &&
    attemptsRemaining > 0;

  const canReviewResult = Boolean(completedAttempt);

  return {
    id: assessment.id,
    title: assessment.title,
    instructions: assessment.instructions,

    status,

    startDate: assessment.startDate,

    dueDate: assessment.dueDate,

    durationMinutes: assessment.durationMinutes,

    totalMarks: assessment.totalMarks,

    questionCount: assessment.questionCount,

    passMarkPercent: assessment.passMarkPercent,

    maxAttempts: assessment.maxAttempts,

    attemptsUsed,
    attemptsRemaining,

    shuffleQuestions: assessment.shuffleQuestions,

    shuffleOptions: assessment.shuffleOptions,

    allowBacktrack: assessment.allowBacktrack,

    allowUnanswered: assessment.allowUnanswered,

    autoSubmit: assessment.autoSubmit,

    lesson: assessment.lesson,

    activeAttempt: activeAttempt
      ? {
          id: activeAttempt.id,

          attemptNumber: activeAttempt.attemptNumber,

          startedAt: activeAttempt.startedAt,

          expiresAt: activeAttempt.expiresAt,

          answeredCount: activeAttempt.answers.length,
        }
      : null,

    latestAttempt: latestAttempt
      ? {
          id: latestAttempt.id,
          status: latestAttempt.status,

          score: latestAttempt.score,

          totalMarks: latestAttempt.totalMarks,

          percentage: latestAttempt.percentage,

          submittedAt: latestAttempt.submittedAt,
        }
      : null,

    canStart,
    canContinue,
    canReviewResult,

    unavailableReason,
  };
}

/* -------------------------------------------------------------------------- */
/*                      STUDENT-SAFE ASSESSMENT PLAYER                        */
/* -------------------------------------------------------------------------- */

export async function getStudentAssessmentPlayerData({
  assessmentId,
  attemptId,
}: {
  assessmentId: number;
  attemptId: number;
}): Promise<StudentAssessmentPlayerData | null> {
  const { userId } = await requireAssessmentStudent();

  const now = new Date();

  const attempt = await prisma.assessmentAttempt.findFirst({
    where: {
      id: attemptId,
      assessmentId,
      studentId: userId,

      status: "IN_PROGRESS",

      assessment: {
        lesson: {
          class: {
            students: {
              some: {
                id: userId,
              },
            },
          },
        },
      },
    },

    select: {
      id: true,
      attemptNumber: true,
      status: true,

      startedAt: true,
      expiresAt: true,
      lastActivityAt: true,

      assessment: {
        select: {
          id: true,
          title: true,
          instructions: true,

          status: true,

          dueDate: true,

          durationMinutes: true,

          shuffleQuestions: true,
          shuffleOptions: true,
          allowBacktrack: true,
          allowUnanswered: true,
          autoSubmit: true,

          questionCount: true,
          totalMarks: true,

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
                  name: true,
                  surname: true,
                },
              },
            },
          },

          questions: {
            orderBy: {
              position: "asc",
            },

            select: {
              id: true,
              questionText: true,
              imageUrl: true,
              marks: true,
              position: true,

              options: {
                orderBy: {
                  position: "asc",
                },

                select: {
                  id: true,
                  optionText: true,
                  imageUrl: true,
                  position: true,

                  /*
                   * Deliberately exclude:
                   * isCorrect
                   */
                },
              },
            },
          },
        },
      },

      answers: {
        select: {
          questionId: true,
          selectedOptionId: true,
          flagged: true,
        },
      },
    },
  });

  if (!attempt) {
    return null;
  }

  if (
    hasAttemptExpired({
      expiresAt: attempt.expiresAt,
      now,
    })
  ) {
    return null;
  }

  if (attempt.assessment.dueDate <= now) {
    return null;
  }

  let questions = attempt.assessment.questions.map((question) => {
    const options = attempt.assessment.shuffleOptions
      ? deterministicShuffle(
          question.options,
          `assessment:${assessmentId}:attempt:${attemptId}:question:${question.id}:options`,
        )
      : question.options;

    return {
      id: question.id,

      questionText: question.questionText,

      imageUrl: question.imageUrl,

      marks: question.marks,

      position: question.position,

      options,
    };
  });

  if (attempt.assessment.shuffleQuestions) {
    questions = deterministicShuffle(
      questions,
      `assessment:${assessmentId}:attempt:${attemptId}:questions`,
    );
  }

  return {
    assessment: {
      id: attempt.assessment.id,
      title: attempt.assessment.title,

      instructions: attempt.assessment.instructions,

      durationMinutes: attempt.assessment.durationMinutes,

      shuffleQuestions: attempt.assessment.shuffleQuestions,

      shuffleOptions: attempt.assessment.shuffleOptions,

      allowBacktrack: attempt.assessment.allowBacktrack,

      allowUnanswered: attempt.assessment.allowUnanswered,

      autoSubmit: attempt.assessment.autoSubmit,

      questionCount: attempt.assessment.questionCount,

      totalMarks: attempt.assessment.totalMarks,

      lesson: attempt.assessment.lesson,
    },

    attempt: {
      id: attempt.id,

      attemptNumber: attempt.attemptNumber,

      status: attempt.status,

      startedAt: attempt.startedAt,

      expiresAt: attempt.expiresAt,

      lastActivityAt: attempt.lastActivityAt,
    },

    questions,

    savedAnswers: attempt.answers.map((answer) => ({
      questionId: answer.questionId,

      selectedOptionId: answer.selectedOptionId,

      flagged: answer.flagged,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT ASSESSMENT RESULT                           */
/* -------------------------------------------------------------------------- */

export async function getStudentAssessmentResult({
  assessmentId,
  attemptId,
}: {
  assessmentId: number;
  attemptId: number;
}) {
  const { userId } = await requireAssessmentStudent();

  const attempt = await prisma.assessmentAttempt.findFirst({
    where: {
      id: attemptId,
      assessmentId,
      studentId: userId,

      status: {
        in: ["SUBMITTED", "AUTO_SUBMITTED"],
      },
    },

    select: {
      id: true,
      attemptNumber: true,

      status: true,

      startedAt: true,
      submittedAt: true,

      timeSpentSeconds: true,

      score: true,
      totalMarks: true,
      percentage: true,

      correctCount: true,
      incorrectCount: true,
      unansweredCount: true,

      assessment: {
        select: {
          id: true,
          title: true,

          passMarkPercent: true,

          showInstantResult: true,
          showCorrectAnswers: true,
          showExplanations: true,

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
                  name: true,
                  surname: true,
                },
              },
            },
          },

          questions: {
            orderBy: {
              position: "asc",
            },

            select: {
              id: true,
              questionText: true,
              imageUrl: true,
              marks: true,
              position: true,

              explanation: true,

              options: {
                orderBy: {
                  position: "asc",
                },

                select: {
                  id: true,
                  optionText: true,
                  imageUrl: true,
                  isCorrect: true,
                  position: true,
                },
              },
            },
          },
        },
      },

      result: {
        select: {
          grade: true,
          remarks: true,
        },
      },

      answers: {
        select: {
          questionId: true,
          selectedOptionId: true,

          isCorrect: true,
          marksAwarded: true,
        },
      },
      teacherFeedback: true,
      reviewedAt: true,

      reviewedBy: {
        select: {
          name: true,
          surname: true,
        },
      },
    },
  });

  if (!attempt || !attempt.result || !attempt.submittedAt) {
    return null;
  }

  if (attempt.status !== "SUBMITTED" && attempt.status !== "AUTO_SUBMITTED") {
    return null;
  }

  const percentage = attempt.percentage ?? 0;

  const passed = percentage >= attempt.assessment.passMarkPercent;

  const answerMap = new Map(
    attempt.answers.map((answer) => [answer.questionId, answer]),
  );

  const mayReviewAnswers = attempt.assessment.showCorrectAnswers;

  const mayReviewExplanations =
    mayReviewAnswers && attempt.assessment.showExplanations;

  const questions = mayReviewAnswers
    ? attempt.assessment.questions.map((question) => {
        const answer = answerMap.get(question.id);

        return {
          id: question.id,

          questionText: question.questionText,

          imageUrl: question.imageUrl,

          marks: question.marks,

          marksAwarded: answer?.marksAwarded ?? 0,

          isCorrect: answer?.isCorrect ?? false,

          explanation: mayReviewExplanations ? question.explanation : null,

          options: question.options.map((option) => ({
            id: option.id,

            optionText: option.optionText,

            imageUrl: option.imageUrl,

            isCorrect: option.isCorrect,

            wasSelected: answer?.selectedOptionId === option.id,
          })),
        };
      })
    : [];

  return {
    summary: {
      attemptId: attempt.id,

      assessmentId: attempt.assessment.id,

      assessmentTitle: attempt.assessment.title,

      subject: attempt.assessment.lesson.subject.name,

      className: attempt.assessment.lesson.class.name,

      teacherName: `${attempt.assessment.lesson.teacher.name} ${attempt.assessment.lesson.teacher.surname}`,

      attemptNumber: attempt.attemptNumber,

      submissionStatus: attempt.status,

      score: attempt.score ?? 0,

      totalMarks: attempt.totalMarks ?? 0,

      percentage,

      grade: attempt.result.grade ?? "N/A",

      remarks: attempt.result.remarks ?? "Assessment completed",

      passed,

      correctCount: attempt.correctCount ?? 0,

      incorrectCount: attempt.incorrectCount ?? 0,

      unansweredCount: attempt.unansweredCount ?? 0,

      timeSpentSeconds: attempt.timeSpentSeconds,

      submittedAt: attempt.submittedAt,

      showInstantResult: attempt.assessment.showInstantResult,

      showCorrectAnswers: mayReviewAnswers,

      showExplanations: mayReviewExplanations,
      teacherFeedback: attempt.teacherFeedback,

      reviewedAt: attempt.reviewedAt,

      reviewedByName: attempt.reviewedBy
        ? `${attempt.reviewedBy.name} ${attempt.reviewedBy.surname}`
        : null,
    },

    questions,
  };
}

/* -------------------------------------------------------------------------- */
/*                     TEACHER ASSESSMENT SUBMISSIONS                         */
/* -------------------------------------------------------------------------- */

export async function getTeacherAssessmentSubmissions(
  assessmentId: number,
): Promise<TeacherAssessmentSubmissionSummary | null> {
  await synchronizeAssessmentStatuses();

  const { userId, role } = await requireAssessmentManager();

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,

      ...(role === "teacher"
        ? {
            lesson: {
              teacherId: userId,
            },
          }
        : {}),
    },

    select: {
      id: true,
      title: true,
      status: true,

      totalMarks: true,
      questionCount: true,
      passMarkPercent: true,
      maxAttempts: true,

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
              id: true,
              name: true,

              students: {
                orderBy: [
                  {
                    surname: "asc",
                  },
                  {
                    name: "asc",
                  },
                ],

                select: {
                  id: true,
                  studentID: true,
                  name: true,
                  surname: true,
                  img: true,

                  assessmentAttempts: {
                    where: {
                      assessmentId,
                      status: {
                        not: "CANCELLED",
                      },
                    },

                    orderBy: {
                      attemptNumber: "desc",
                    },

                    select: {
                      id: true,
                      attemptNumber: true,
                      status: true,

                      startedAt: true,
                      submittedAt: true,

                      score: true,
                      totalMarks: true,
                      percentage: true,

                      timeSpentSeconds: true,

                      result: {
                        select: {
                          grade: true,
                          remarks: true,
                        },
                      },
                    },
                  },
                },
              },
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
  });

  if (!assessment) {
    return null;
  }

  const submissions = assessment.lesson.class.students.map((student) => {
    const attempts = student.assessmentAttempts;

    const latestAttempt = attempts[0] ?? null;

    const completedAttempts = attempts.filter(
      (attempt) =>
        attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
    );

    const highestAttempt =
      completedAttempts.length > 0
        ? [...completedAttempts].sort(
            (a, b) => (b.percentage ?? 0) - (a.percentage ?? 0),
          )[0]
        : null;

    let status: TeacherAssessmentSubmissionStatus = "NOT_STARTED";

    if (latestAttempt) {
      if (
        latestAttempt.status === "SUBMITTED" ||
        latestAttempt.status === "AUTO_SUBMITTED"
      ) {
        status = latestAttempt.status;
      } else if (
        latestAttempt.status === "IN_PROGRESS" ||
        latestAttempt.status === "SUBMITTING"
      ) {
        status = "IN_PROGRESS";
      } else if (latestAttempt.status === "EXPIRED") {
        status = "EXPIRED";
      }
    }

    const passed =
      highestAttempt?.percentage !== null &&
      highestAttempt?.percentage !== undefined
        ? highestAttempt.percentage >= assessment.passMarkPercent
        : null;

    return {
      student: {
        id: student.id,
        studentID: student.studentID,
        name: student.name,
        surname: student.surname,
        img: student.img,
      },

      status,

      attemptsUsed: attempts.length,

      maxAttempts: assessment.maxAttempts,

      latestAttempt: latestAttempt
        ? {
            id: latestAttempt.id,

            attemptNumber: latestAttempt.attemptNumber,

            status: latestAttempt.status,

            startedAt: latestAttempt.startedAt,

            submittedAt: latestAttempt.submittedAt,

            score: latestAttempt.score,

            totalMarks: latestAttempt.totalMarks,

            percentage: latestAttempt.percentage,

            grade: latestAttempt.result?.grade ?? null,

            remarks: latestAttempt.result?.remarks ?? null,

            timeSpentSeconds: latestAttempt.timeSpentSeconds,
          }
        : null,

      highestScore: highestAttempt
        ? {
            attemptId: highestAttempt.id,

            score: highestAttempt.score ?? 0,

            totalMarks: highestAttempt.totalMarks ?? assessment.totalMarks,

            percentage: highestAttempt.percentage ?? 0,

            grade: highestAttempt.result?.grade ?? null,
          }
        : null,

      passed,
    };
  });

  const submittedStudents = submissions.filter(
    (submission) =>
      submission.status === "SUBMITTED" ||
      submission.status === "AUTO_SUBMITTED",
  );

  const inProgressStudents = submissions.filter(
    (submission) => submission.status === "IN_PROGRESS",
  );

  const notStartedStudents = submissions.filter(
    (submission) => submission.status === "NOT_STARTED",
  );

  const expiredStudents = submissions.filter(
    (submission) => submission.status === "EXPIRED",
  );

  const scoredStudents = submissions.filter(
    (submission) => submission.highestScore !== null,
  );

  const averageScore =
    scoredStudents.length > 0
      ? Number(
          (
            scoredStudents.reduce(
              (total, submission) =>
                total + (submission.highestScore?.percentage ?? 0),
              0,
            ) / scoredStudents.length
          ).toFixed(1),
        )
      : null;

  const passedStudents = scoredStudents.filter(
    (submission) => submission.passed === true,
  );

  const passRate =
    scoredStudents.length > 0
      ? Number(
          ((passedStudents.length / scoredStudents.length) * 100).toFixed(1),
        )
      : null;

  const percentages = scoredStudents
    .map((submission) => submission.highestScore?.percentage)
    .filter(
      (percentage): percentage is number => typeof percentage === "number",
    );

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      status: assessment.status,

      totalMarks: assessment.totalMarks,

      questionCount: assessment.questionCount,

      passMarkPercent: assessment.passMarkPercent,

      maxAttempts: assessment.maxAttempts,

      lesson: {
        subject: assessment.lesson.subject,

        class: {
          id: assessment.lesson.class.id,
          name: assessment.lesson.class.name,
        },

        teacher: assessment.lesson.teacher,
      },
    },

    submissions,

    metrics: {
      totalStudents: submissions.length,

      submittedStudents: submittedStudents.length,

      inProgressStudents: inProgressStudents.length,

      notStartedStudents: notStartedStudents.length,

      expiredStudents: expiredStudents.length,

      completionRate:
        submissions.length > 0
          ? Number(
              ((submittedStudents.length / submissions.length) * 100).toFixed(
                1,
              ),
            )
          : 0,

      averageScore,

      passRate,

      highestScore: percentages.length > 0 ? Math.max(...percentages) : null,

      lowestScore: percentages.length > 0 ? Math.min(...percentages) : null,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                      TEACHER ASSESSMENT ANALYTICS                          */
/* -------------------------------------------------------------------------- */

function calculateMedian(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Number(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(1));
  }

  return Number(sorted[middle].toFixed(1));
}

function getQuestionDifficulty(
  correctPercentage: number,
): "VERY_EASY" | "EASY" | "MODERATE" | "DIFFICULT" | "VERY_DIFFICULT" {
  if (correctPercentage >= 85) {
    return "VERY_EASY";
  }

  if (correctPercentage >= 70) {
    return "EASY";
  }

  if (correctPercentage >= 50) {
    return "MODERATE";
  }

  if (correctPercentage >= 30) {
    return "DIFFICULT";
  }

  return "VERY_DIFFICULT";
}

export async function getTeacherAssessmentAnalytics(
  assessmentId: number,
): Promise<TeacherAssessmentAnalytics | null> {
  await synchronizeAssessmentStatuses();

  const { userId, role } = await requireAssessmentManager();

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,

      ...(role === "teacher"
        ? {
            lesson: {
              teacherId: userId,
            },
          }
        : {}),
    },

    select: {
      id: true,
      title: true,
      status: true,

      totalMarks: true,
      questionCount: true,
      passMarkPercent: true,

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

              _count: {
                select: {
                  students: true,
                },
              },
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

      questions: {
        orderBy: {
          position: "asc",
        },

        select: {
          id: true,
          questionText: true,
          marks: true,
          position: true,

          options: {
            orderBy: {
              position: "asc",
            },

            select: {
              id: true,
              optionText: true,
              isCorrect: true,
            },
          },
        },
      },

      attempts: {
        where: {
          status: {
            in: ["SUBMITTED", "AUTO_SUBMITTED"],
          },
        },

        select: {
          id: true,
          studentId: true,
          percentage: true,
          timeSpentSeconds: true,

          answers: {
            select: {
              questionId: true,
              selectedOptionId: true,
              isCorrect: true,
              marksAwarded: true,
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    return null;
  }

  const completedAttempts = assessment.attempts;

  const submittedStudents = new Set(
    completedAttempts.map((attempt) => attempt.studentId),
  ).size;

  const percentages = completedAttempts
    .map((attempt) => attempt.percentage)
    .filter(
      (percentage): percentage is number => typeof percentage === "number",
    );

  const averageScore =
    percentages.length > 0
      ? Number(
          (
            percentages.reduce((total, score) => total + score, 0) /
            percentages.length
          ).toFixed(1),
        )
      : null;

  const passedAttempts = percentages.filter(
    (percentage) => percentage >= assessment.passMarkPercent,
  );

  const passRate =
    percentages.length > 0
      ? Number(((passedAttempts.length / percentages.length) * 100).toFixed(1))
      : null;

  const validTimeValues = completedAttempts
    .map((attempt) => attempt.timeSpentSeconds)
    .filter((value) => value >= 0);

  const averageTimeSeconds =
    validTimeValues.length > 0
      ? Math.round(
          validTimeValues.reduce((total, value) => total + value, 0) /
            validTimeValues.length,
        )
      : null;

  const questionAnalytics = assessment.questions.map((question) => {
    const responses = completedAttempts.map((attempt) =>
      attempt.answers.find((answer) => answer.questionId === question.id),
    );

    const answeredResponses = responses.filter(
      (answer) => answer && answer.selectedOptionId !== null,
    );

    const correctResponses = responses.filter(
      (answer) => answer?.isCorrect === true,
    ).length;

    const incorrectResponses = responses.filter(
      (answer) =>
        answer &&
        answer.selectedOptionId !== null &&
        answer.isCorrect === false,
    ).length;

    const unansweredResponses =
      completedAttempts.length - answeredResponses.length;

    const correctPercentage =
      completedAttempts.length > 0
        ? Number(
            ((correctResponses / completedAttempts.length) * 100).toFixed(1),
          )
        : 0;

    const incorrectPercentage =
      completedAttempts.length > 0
        ? Number(
            ((incorrectResponses / completedAttempts.length) * 100).toFixed(1),
          )
        : 0;

    const unansweredPercentage =
      completedAttempts.length > 0
        ? Number(
            ((unansweredResponses / completedAttempts.length) * 100).toFixed(1),
          )
        : 0;

    const optionAnalytics = question.options.map((option) => {
      const selectionCount = responses.filter(
        (answer) => answer?.selectedOptionId === option.id,
      ).length;

      return {
        optionId: option.id,
        optionText: option.optionText,

        isCorrect: option.isCorrect,

        selectionCount,

        selectionPercentage:
          completedAttempts.length > 0
            ? Number(
                ((selectionCount / completedAttempts.length) * 100).toFixed(1),
              )
            : 0,
      };
    });

    const totalMarksAwarded = responses.reduce(
      (total, answer) => total + (answer?.marksAwarded ?? 0),
      0,
    );

    return {
      questionId: question.id,

      questionNumber: question.position + 1,

      questionText: question.questionText,

      marks: question.marks,

      totalResponses: completedAttempts.length,

      correctResponses,
      incorrectResponses,
      unansweredResponses,

      correctPercentage,
      incorrectPercentage,
      unansweredPercentage,

      difficulty: getQuestionDifficulty(correctPercentage),

      averageMarksAwarded:
        completedAttempts.length > 0
          ? Number((totalMarksAwarded / completedAttempts.length).toFixed(2))
          : 0,

      options: optionAnalytics,
    };
  });

  const strongestQuestions = [...questionAnalytics]
    .sort((a, b) => b.correctPercentage - a.correctPercentage)
    .slice(0, 5);

  const weakestQuestions = [...questionAnalytics]
    .sort((a, b) => a.correctPercentage - b.correctPercentage)
    .slice(0, 5);

  const scoreBandDefinitions = [
    {
      label: "0–39%",
      minimum: 0,
      maximum: 39.99,
    },
    {
      label: "40–49%",
      minimum: 40,
      maximum: 49.99,
    },
    {
      label: "50–59%",
      minimum: 50,
      maximum: 59.99,
    },
    {
      label: "60–69%",
      minimum: 60,
      maximum: 69.99,
    },
    {
      label: "70–79%",
      minimum: 70,
      maximum: 79.99,
    },
    {
      label: "80–100%",
      minimum: 80,
      maximum: 100,
    },
  ];

  const scoreBands = scoreBandDefinitions.map((band) => {
    const count = percentages.filter(
      (percentage) => percentage >= band.minimum && percentage <= band.maximum,
    ).length;

    return {
      ...band,
      count,

      percentage:
        percentages.length > 0
          ? Number(((count / percentages.length) * 100).toFixed(1))
          : 0,
    };
  });

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      status: assessment.status,

      totalMarks: assessment.totalMarks,

      questionCount: assessment.questionCount,

      passMarkPercent: assessment.passMarkPercent,

      lesson: {
        subject: assessment.lesson.subject,

        class: {
          name: assessment.lesson.class.name,
        },

        teacher: assessment.lesson.teacher,
      },
    },

    metrics: {
      totalStudents: assessment.lesson.class._count.students,

      submittedStudents,

      completionRate:
        assessment.lesson.class._count.students > 0
          ? Number(
              (
                (submittedStudents / assessment.lesson.class._count.students) *
                100
              ).toFixed(1),
            )
          : 0,

      averageScore,

      medianScore: calculateMedian(percentages),

      passRate,

      highestScore: percentages.length > 0 ? Math.max(...percentages) : null,

      lowestScore: percentages.length > 0 ? Math.min(...percentages) : null,

      averageTimeSeconds,
    },

    scoreBands,
    questionAnalytics,
    strongestQuestions,
    weakestQuestions,
  };
}

/* -------------------------------------------------------------------------- */
/*                  TEACHER INDIVIDUAL SUBMISSION REVIEW                      */
/* -------------------------------------------------------------------------- */

export async function getTeacherStudentSubmissionReview({
  assessmentId,
  studentId,
  attemptId,
}: {
  assessmentId: number;
  studentId: string;
  attemptId?: number;
}): Promise<TeacherStudentSubmissionReview | null> {
  await synchronizeAssessmentStatuses();

  const { userId, role } = await requireAssessmentManager();

  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,

      ...(role === "teacher"
        ? {
            lesson: {
              teacherId: userId,
            },
          }
        : {}),

      lesson: {
        ...(role === "teacher"
          ? {
              teacherId: userId,
            }
          : {}),

        class: {
          students: {
            some: {
              id: studentId,
            },
          },
        },
      },
    },

    select: {
      id: true,
      title: true,
      status: true,

      totalMarks: true,
      questionCount: true,
      passMarkPercent: true,
      maxAttempts: true,

      startDate: true,
      dueDate: true,

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
      },

      questions: {
        orderBy: {
          position: "asc",
        },

        select: {
          id: true,
          questionText: true,
          imageUrl: true,
          explanation: true,
          marks: true,
          position: true,

          options: {
            orderBy: {
              position: "asc",
            },

            select: {
              id: true,
              optionText: true,
              imageUrl: true,
              isCorrect: true,
              position: true,
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    return null;
  }

  const student = await prisma.student.findFirst({
    where: {
      id: studentId,

      classId: assessment.lesson.class.id,
    },

    select: {
      id: true,
      studentID: true,
      name: true,
      surname: true,
      img: true,

      class: {
        select: {
          name: true,
        },
      },

      grade: {
        select: {
          level: true,
        },
      },

      assessmentAttempts: {
        where: {
          assessmentId,
        },

        orderBy: {
          attemptNumber: "asc",
        },

        select: {
          id: true,
          attemptNumber: true,
          status: true,

          startedAt: true,
          submittedAt: true,

          score: true,
          totalMarks: true,
          percentage: true,

          correctCount: true,
          incorrectCount: true,
          unansweredCount: true,

          timeSpentSeconds: true,

          teacherFeedback: true,
          reviewedAt: true,

          reviewedBy: {
            select: {
              id: true,
              name: true,
              surname: true,
            },
          },

          result: {
            select: {
              grade: true,
              remarks: true,
            },
          },

          answers: {
            select: {
              id: true,
              questionId: true,
              selectedOptionId: true,

              isCorrect: true,
              marksAwarded: true,

              flagged: true,
              timeSpentSeconds: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  const mappedAttempts = student.assessmentAttempts.map((attempt) => {
    const answeredCount = attempt.answers.filter(
      (answer) => answer.selectedOptionId !== null,
    ).length;

    const flaggedCount = attempt.answers.filter(
      (answer) => answer.flagged,
    ).length;

    const percentage = attempt.percentage;

    const passed =
      typeof percentage === "number"
        ? percentage >= assessment.passMarkPercent
        : null;

    return {
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,

      status: attempt.status,

      startedAt: attempt.startedAt,

      submittedAt: attempt.submittedAt,

      score: attempt.score,
      totalMarks: attempt.totalMarks,

      percentage,

      grade: attempt.result?.grade ?? null,

      remarks: attempt.result?.remarks ?? null,

      passed,

      correctCount: attempt.correctCount ?? 0,

      incorrectCount: attempt.incorrectCount ?? 0,

      unansweredCount:
        attempt.unansweredCount ??
        Math.max(0, assessment.questionCount - answeredCount),

      answeredCount,
      flaggedCount,

      timeSpentSeconds: attempt.timeSpentSeconds,

      teacherFeedback: attempt.teacherFeedback,

      reviewedAt: attempt.reviewedAt,

      reviewedBy: attempt.reviewedBy,
    };
  });

  const completedAttempts = mappedAttempts.filter(
    (attempt) =>
      attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
  );

  const requestedAttempt = attemptId
    ? student.assessmentAttempts.find((attempt) => attempt.id === attemptId)
    : undefined;

  const latestCompletedAttempt = [...student.assessmentAttempts]
    .reverse()
    .find(
      (attempt) =>
        attempt.status === "SUBMITTED" || attempt.status === "AUTO_SUBMITTED",
    );

  const selectedAttemptRecord =
    requestedAttempt ??
    latestCompletedAttempt ??
    student.assessmentAttempts.at(-1) ??
    null;

  /*
   * Prevent loading an attempt that does not
   * belong to this student and assessment.
   */
  if (attemptId && !requestedAttempt) {
    return null;
  }

  const selectedAttempt = selectedAttemptRecord
    ? (mappedAttempts.find(
        (attempt) => attempt.id === selectedAttemptRecord.id,
      ) ?? null)
    : null;

  const answerMap = new Map(
    selectedAttemptRecord?.answers.map((answer) => [
      answer.questionId,
      answer,
    ]) ?? [],
  );

  const questions = selectedAttemptRecord
    ? assessment.questions.map((question) => {
        const answer = answerMap.get(question.id);

        const selectedOptionId = answer?.selectedOptionId ?? null;

        return {
          id: question.id,

          questionNumber: question.position + 1,

          questionText: question.questionText,

          imageUrl: question.imageUrl,

          marksAvailable: question.marks,

          marksAwarded: answer?.marksAwarded ?? 0,

          selectedOptionId,

          isCorrect: answer?.isCorrect ?? false,

          wasAnswered: selectedOptionId !== null,

          wasFlagged: answer?.flagged ?? false,

          timeSpentSeconds: answer?.timeSpentSeconds ?? 0,

          explanation: question.explanation,

          options: question.options.map((option) => ({
            id: option.id,

            optionText: option.optionText,

            imageUrl: option.imageUrl,

            isCorrect: option.isCorrect,

            wasSelected: selectedOptionId === option.id,
          })),
        };
      })
    : [];

  const completedPercentages = completedAttempts
    .map((attempt) => attempt.percentage)
    .filter(
      (percentage): percentage is number => typeof percentage === "number",
    );

  const completedTimes = completedAttempts.map(
    (attempt) => attempt.timeSpentSeconds,
  );

  const firstScore = completedPercentages.at(0) ?? null;

  const latestScore = completedPercentages.at(-1) ?? null;

  const highestScore =
    completedPercentages.length > 0 ? Math.max(...completedPercentages) : null;

  const lowestScore =
    completedPercentages.length > 0 ? Math.min(...completedPercentages) : null;

  const improvement =
    firstScore !== null &&
    latestScore !== null &&
    completedPercentages.length > 1
      ? Number((latestScore - firstScore).toFixed(1))
      : null;

  const averageScore =
    completedPercentages.length > 0
      ? Number(
          (
            completedPercentages.reduce((total, value) => total + value, 0) /
            completedPercentages.length
          ).toFixed(1),
        )
      : null;

  const averageTimeSeconds =
    completedTimes.length > 0
      ? Math.round(
          completedTimes.reduce((total, value) => total + value, 0) /
            completedTimes.length,
        )
      : null;

  return {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      status: assessment.status,

      totalMarks: assessment.totalMarks,

      questionCount: assessment.questionCount,

      passMarkPercent: assessment.passMarkPercent,

      maxAttempts: assessment.maxAttempts,

      startDate: assessment.startDate,

      dueDate: assessment.dueDate,

      lesson: assessment.lesson,
    },

    student: {
      id: student.id,

      studentID: student.studentID,

      name: student.name,
      surname: student.surname,
      img: student.img,

      className: student.class.name,

      gradeLevel: student.grade.level,
    },

    attempts: mappedAttempts,

    selectedAttempt,

    questions,

    comparison: {
      totalAttempts: mappedAttempts.length,

      completedAttempts: completedAttempts.length,

      firstScore,
      latestScore,
      highestScore,
      lowestScore,

      improvement,
      averageScore,
      averageTimeSeconds,
    },
  };
}
