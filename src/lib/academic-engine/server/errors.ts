// src/lib/academic-engine/server/errors.ts

import type {
  AcademicEngineLoaderIssueCode,
} from "./types";

export class AcademicEngineLoaderError extends Error {
  readonly code:
    AcademicEngineLoaderIssueCode;

  readonly retryable: boolean;

  constructor(
    code:
      AcademicEngineLoaderIssueCode,

    message: string,

    retryable = false,
  ) {
    super(message);

    this.name =
      "AcademicEngineLoaderError";

    this.code =
      code;

    this.retryable =
      retryable;
  }
}

export function getAcademicEngineLoaderErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof
    AcademicEngineLoaderError
  ) {
    return error.message;
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return (
    "The academic report data could not be loaded."
  );
}