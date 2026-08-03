import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

import type {
  UnifiedStudentResult,
} from "./types";

export async function getStudentUnifiedResults({
  studentId,
  academicYear,
  termId,
}: {
  studentId?: string;
  academicYear?: string;
  termId?: number;
} = {}): Promise<UnifiedStudentResult[]> {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    throw new Error(
      "UNAUTHENTICATED"
    );
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  const resolvedStudentId =
    role === "student"
      ? userId
      : studentId;

  if (!resolvedStudentId) {
    throw new Error(
      "STUDENT_ID_REQUIRED"
    );
  }

  const results =
    await prisma.result.findMany({
      where: {
        studentId:
          resolvedStudentId,

        AND: [
          ...(academicYear
            ? [
                {
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
                },
              ]
            : []),

          ...(termId
            ? [
                {
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
                },
              ]
            : []),
        ],
      },

      orderBy: {
        createdAt:
          "desc",
      },

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
                    name: true,
                  },
                },

                class: {
                  select: {
                    name: true,
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
    });

  return results.map(
    (
      result
    ): UnifiedStudentResult => {
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
              .lesson.subject
              .name,

          className:
            result.assessment
              .lesson.class.name,

          score:
            result.score,

          totalMarks:
            result.totalMarks,

          percentage:
            result.percentage,

          grade:
            result.grade,

          remarks:
            result.remarks,

          academicYear:
            result.assessment
              .academicYear,

          term:
            result.assessment
              .term
              ? {
                  id:
                    result.assessment
                      .term.id,

                  name:
                    result.assessment
                      .term.name,
                }
              : null,

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
              .subject.name,

          className:
            result.exam.lesson
              .class.name,

          score:
            result.score,

          totalMarks:
            result.totalMarks,

          percentage:
            result.percentage,

          grade:
            result.grade,

          remarks:
            result.remarks,

          academicYear:
            result.exam
              .academicYear,

          term:
            result.exam.term
              ? {
                  id:
                    result.exam
                      .term.id,

                  name:
                    result.exam
                      .term.name,
                }
              : null,

          attemptNumber:
            null,

          date:
            result.createdAt,

          assessment:
            null,
        };
      }

      return {
        id:
          result.id,

        type:
          "ASSIGNMENT",

        title:
          result.assignment
            ?.title ??
          "Assignment",

        subject:
          result.assignment
            ?.lesson.subject
            .name ??
          "Unknown Subject",

        className:
          result.assignment
            ?.lesson.class.name ??
          "Unknown Class",

        score:
          result.score,

        totalMarks:
          result.totalMarks,

        percentage:
          result.percentage,

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
  );
}