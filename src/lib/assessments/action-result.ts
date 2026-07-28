import type {
  AssessmentActionResult,
} from "./types";

export function assessmentSuccess<T>(
  message: string,
  data: T
): AssessmentActionResult<T> {
  return {
    success: true,
    error: false,
    message,
    data,
  };
}

export function assessmentFailure<T = never>(
  message: string,
  fieldErrors?: Record<
    string,
    string[] | undefined
  >
): AssessmentActionResult<T> {
  return {
    success: false,
    error: true,
    message,
    fieldErrors,
  };
}