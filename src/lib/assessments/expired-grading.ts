import prisma from "@/lib/prisma";

import {
  submitAssessmentAttempt,
} from "./actions";

/**
 * This function is a placeholder for a trusted scheduled
 * server process.
 *
 * The normal student submission action requires Clerk
 * authentication, so a cron process should use a separate
 * internal grading function rather than calling it directly.
 */
export async function findExpiredAutoSubmitAttempts() {
  const now = new Date();

  return prisma.assessmentAttempt.findMany({
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

    take: 100,
  });
}