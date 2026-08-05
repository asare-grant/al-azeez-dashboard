import type {
  AcademicWeightingActionResult,
} from "./types";

export function academicWeightingSuccess<
  T,
>(
  message: string,
  data: T,
): AcademicWeightingActionResult<T> {
  return {
    success: true,
    error: false,
    message,
    data,
  };
}

export function academicWeightingFailure<
  T = never,
>(
  message: string,
  fieldErrors?: Record<
    string,
    string[] | undefined
  >,
): AcademicWeightingActionResult<T> {
  return {
    success: false,
    error: true,
    message,
    fieldErrors,
  };
}