import prisma from "@/lib/prisma";

export type DashboardRole =
  | "admin"
  | "teacher"
  | "student"
  | "parent";

export function isAssessmentManager(
  role?: string
): role is "admin" | "teacher" {
  return role === "admin" || role === "teacher";
}

export function isStudentRole(
  role?: string
): role is "student" {
  return role === "student";
}

export async function canManageAssessment({
  assessmentId,
  userId,
  role,
}: {
  assessmentId: number;
  userId: string;
  role?: string;
}): Promise<boolean> {
  if (
    role !== "admin" &&
    role !== "teacher"
  ) {
    return false;
  }

  const assessment =
    await prisma.assessment.findFirst({
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
      },
    });

  return Boolean(assessment);
}

export async function canUseLessonForAssessment({
  lessonId,
  userId,
  role,
}: {
  lessonId: number;
  userId: string;
  role?: string;
}): Promise<boolean> {
  if (role === "admin") {
    const lessonExists = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      select: {
        id: true,
      },
    });

    return Boolean(lessonExists);
  }

  if (role !== "teacher") {
    return false;
  }

  const teacherLesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      teacherId: userId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(teacherLesson);
}

export async function canStudentAccessAssessment({
  assessmentId,
  studentId,
}: {
  assessmentId: number;
  studentId: string;
}): Promise<boolean> {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,

      lesson: {
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
    },
  });

  return Boolean(assessment);
}

export async function ownsAssessmentAttempt({
  attemptId,
  studentId,
}: {
  attemptId: number;
  studentId: string;
}): Promise<boolean> {
  const attempt = await prisma.assessmentAttempt.findFirst({
    where: {
      id: attemptId,
      studentId,
    },
    select: {
      id: true,
    },
  });

  return Boolean(attempt);
}