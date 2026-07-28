import prisma from "@/lib/prisma";

export async function synchronizeAssessmentStatuses() {
  const now = new Date();

  const [published, closed] =
    await prisma.$transaction([
      prisma.assessment.updateMany({
        where: {
          status: "SCHEDULED",

          startDate: {
            lte: now,
          },

          dueDate: {
            gt: now,
          },
        },

        data: {
          status: "PUBLISHED",
        },
      }),

      prisma.assessment.updateMany({
        where: {
          status: {
            in: [
              "SCHEDULED",
              "PUBLISHED",
            ],
          },

          dueDate: {
            lte: now,
          },
        },

        data: {
          status: "CLOSED",
          closedAt: now,
        },
      }),
    ]);

  return {
    publishedCount: published.count,
    closedCount: closed.count,
  };
}