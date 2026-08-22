// src/lib/assessments/permissions.ts

import "server-only";

import prisma from "@/lib/prisma";

import type {
  AssessmentAccessScope,
} from "./auth";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AssessmentOwnershipContext = {
  userId:
    string;

  scope:
    AssessmentAccessScope;
};

/* ========================================================================== */
/* MANAGE ASSESSMENT OWNERSHIP                                                */
/* ========================================================================== */

export async function canManageAssessment({
  assessmentId,
  userId,
  scope,
}: {
  assessmentId:
    number;

  userId:
    string;

  scope:
    AssessmentAccessScope;
}): Promise<boolean> {
  const assessment =
    await prisma.assessment.findFirst({
      where: {
        id:
          assessmentId,

        ...(scope ===
        "OWN_LESSONS"
          ? {
              lesson: {
                teacherId:
                  userId,
              },
            }
          : {}),
      },

      select: {
        id:
          true,
      },
    });

  return Boolean(
    assessment,
  );
}

/* ========================================================================== */
/* LESSON OWNERSHIP                                                           */
/* ========================================================================== */

export async function canUseLessonForAssessment({
  lessonId,
  userId,
  scope,
}: {
  lessonId:
    number;

  userId:
    string;

  scope:
    AssessmentAccessScope;
}): Promise<boolean> {
  const lesson =
    await prisma.lesson.findFirst({
      where: {
        id:
          lessonId,

        ...(scope ===
        "OWN_LESSONS"
          ? {
              teacherId:
                userId,
            }
          : {}),
      },

      select: {
        id:
          true,
      },
    });

  return Boolean(
    lesson,
  );
}

/* ========================================================================== */
/* STUDENT ASSESSMENT OWNERSHIP                                               */
/* ========================================================================== */

export async function canStudentAccessAssessment({
  assessmentId,
  studentId,
}: {
  assessmentId:
    number;

  studentId:
    string;
}): Promise<boolean> {
  const assessment =
    await prisma.assessment.findFirst({
      where: {
        id:
          assessmentId,

        lesson: {
          class: {
            students: {
              some: {
                id:
                  studentId,
              },
            },
          },
        },
      },

      select: {
        id:
          true,
      },
    });

  return Boolean(
    assessment,
  );
}

/* ========================================================================== */
/* STUDENT ATTEMPT OWNERSHIP                                                  */
/* ========================================================================== */

export async function ownsAssessmentAttempt({
  attemptId,
  studentId,
}: {
  attemptId:
    number;

  studentId:
    string;
}): Promise<boolean> {
  const attempt =
    await prisma.assessmentAttempt.findFirst({
      where: {
        id:
          attemptId,

        studentId,
      },

      select: {
        id:
          true,
      },
    });

  return Boolean(
    attempt,
  );
}