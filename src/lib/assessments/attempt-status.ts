import prisma from "@/lib/prisma";

export async function synchronizeExpiredAttempts({
  studentId,
}: {
  studentId?: string;
} = {}) {
  const now = new Date();

  const result =
    await prisma.assessmentAttempt.updateMany({
      where: {
        status: "IN_PROGRESS",

        expiresAt: {
          lte: now,
        },

        assessment: {
          autoSubmit: false,
        },

        ...(studentId
          ? {
              studentId,
            }
          : {}),
      },

      data: {
        status: "EXPIRED",
        submittedAt: now,
      },
    });

  return {
    expiredCount: result.count,
  };
}