export type AssessmentErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "ASSESSMENT_NOT_FOUND"
  | "ATTEMPT_NOT_FOUND"
  | "ATTEMPT_NOT_ACTIVE"
  | "ATTEMPT_EXPIRED"
  | "ATTEMPT_SUBMITTING"
  | "ATTEMPT_ALREADY_SUBMITTED"
  | "VERSION_CONFLICT"
  | "SESSION_CONFLICT"
  | "BACKTRACKING_BLOCKED"
  | "INVALID_QUESTION"
  | "INVALID_OPTION"
  | "UNANSWERED_NOT_ALLOWED"
  | "DATABASE_CONFLICT"
  | "INTERNAL_ERROR"
  | "COMPLETED_ATTEMPT_WITHOUT_RESULT"
  | "ATTEMPT_NOT_COMPLETED"
  | "AUTO_SUBMIT_DISABLED";

export class AssessmentError extends Error {
  constructor(
    public readonly code: AssessmentErrorCode,
    message: string,
    public readonly retryable = false
  ) {
    super(message);
    this.name = "AssessmentError";
  }
}

export function getAssessmentErrorMessage(
  error: unknown
): string {
  if (error instanceof AssessmentError) {
    return error.message;
  }

  return "Something went wrong while processing the assessment.";
}