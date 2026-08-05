import type {
  ReportCardActionResult,
} from "./types";

export function reportCardSuccess<T>(
  message: string,
  data: T,
): ReportCardActionResult<T> {
  return {
    success: true,
    error: false,
    message,
    data,
  };
}

export function reportCardFailure<T = never>(
  message: string,
  fieldErrors?: Record<
    string,
    string[] | undefined
  >,
): ReportCardActionResult<T> {
  return {
    success: false,
    error: true,
    message,
    fieldErrors,
  };
}