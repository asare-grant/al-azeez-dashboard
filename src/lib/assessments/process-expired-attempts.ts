import crypto from "node:crypto";

import prisma from "@/lib/prisma";

import {
  gradeAttemptForStudent,
} from "./grading-service";

export async function processExpiredAssessmentAttempts({
  batchSize = 50,
}: {
  batchSize?: number;
} = {}) {
  const now = new Date();

  const attempts =
    await prisma.assessmentAttempt.findMany({
      where: {
        status: "IN_PROGRESS",

        expiresAt: {
          lte: now,
        },

        assessment: {
          autoSubmit: true,
        },
      },

      select: {
        id: true,
        assessmentId: true,
        studentId: true,
      },

      orderBy: {
        expiresAt: "asc",
      },

      take: batchSize,
    });

  const summary = {
    found: attempts.length,
    submitted: 0,
    failed: 0,
  };

  for (const attempt of attempts) {
    try {
      const result =
        await gradeAttemptForStudent({
          assessmentId:
            attempt.assessmentId,

          attemptId:
            attempt.id,

          studentId:
            attempt.studentId,

          submissionMode:
            "AUTO",

          submissionToken:
            crypto.randomUUID(),
        });

       
    } catch (error) {
      summary.failed++;

      console.error(
        "EXPIRED ATTEMPT GRADING FAILED:",
        {
          attemptId:
            attempt.id,
          error,
        }
      );
    }
  }

  return summary;
}