import { Prisma } from "@prisma/client";

import {
  AssessmentError,
} from "./errors";

function isRetryablePrismaError(
  error: unknown
): boolean {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

export async function withSerializableRetry<T>(
  operation: () => Promise<T>,
  options: {
    attempts?: number;
    baseDelayMs?: number;
  } = {}
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs =
    options.baseDelayMs ?? 50;

  for (
    let attempt = 1;
    attempt <= attempts;
    attempt++
  ) {
    try {
      return await operation();
    } catch (error) {
      const shouldRetry =
        isRetryablePrismaError(error) &&
        attempt < attempts;

      if (!shouldRetry) {
        if (
          isRetryablePrismaError(error)
        ) {
          throw new AssessmentError(
            "DATABASE_CONFLICT",
            "Another request changed this assessment at the same time. Please retry.",
            true
          );
        }

        throw error;
      }

      const jitter =
        Math.floor(Math.random() * 50);

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          baseDelayMs *
            2 ** (attempt - 1) +
            jitter
        )
      );
    }
  }

  throw new AssessmentError(
    "DATABASE_CONFLICT",
    "The operation could not be completed because of repeated database conflicts.",
    true
  );
}