import prisma from "@/lib/prisma";

export async function recoverStaleAssessmentSubmissions() {
  const threshold =
    new Date(
      Date.now() -
        10 * 60 * 1000
    );

  const result =
    await prisma.assessmentAttempt.updateMany({
      where: {
        status: "SUBMITTING",

        submissionStartedAt: {
          lte: threshold,
        },

        result: null,
      },

      data: {
        status: "IN_PROGRESS",

        submissionToken: null,
        submissionStartedAt: null,

        failureReason:
          "Recovered from stale submission lock.",
      },
    });

  return {
    recovered: result.count,
  };
}