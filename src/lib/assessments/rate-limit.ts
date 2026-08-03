import {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  withSerializableRetry,
} from "@/lib/assessments/transaction";
import {
  AssessmentError,
} from "@/lib/assessments/errors";

type RateLimitInput = {
  key: string;
  limit: number;
  windowSeconds: number;
};

export async function enforceAssessmentRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitInput) {
  const now = new Date();

  const expiresAt =
    new Date(
      now.getTime() +
        windowSeconds *
          1000
    );

  const record =
    await withSerializableRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const existing =
            await tx.assessmentRateLimit.findUnique({
              where: {
                key,
              },
            });

          if (
            !existing ||
            existing.expiresAt <= now
          ) {
            return tx.assessmentRateLimit.upsert({
              where: {
                key,
              },

              create: {
                key,
                count: 1,
                windowStart: now,
                expiresAt,
              },

              update: {
                count: 1,
                windowStart: now,
                expiresAt,
              },
            });
          }

          return tx.assessmentRateLimit.update({
            where: {
              key,
            },

            data: {
              count: {
                increment: 1,
              },
            },
          });
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel
              .Serializable,
        }
      )
    );

  if (record.count > limit) {
    throw new AssessmentError(
      "RATE_LIMITED",
      "Too many assessment requests were sent. Wait briefly and try again.",
      true
    );
  }

  return {
    remaining:
      Math.max(
        0,
        limit - record.count
      ),

    expiresAt:
      record.expiresAt,
  };
}