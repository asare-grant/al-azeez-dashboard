import type {
  ReportCardAttendanceSummary,
} from "./review-types";

function roundAttendancePercentage(
  value: number,
): number {
  return Math.round(
    value * 100,
  ) / 100;
}

export function calculateReportCardAttendance({
  daysSchoolOpened,
  daysPresent,
}: {
  daysSchoolOpened:
    number | null;

  daysPresent:
    number | null;
}): ReportCardAttendanceSummary {
  if (
    daysSchoolOpened === null ||
    daysPresent === null
  ) {
    return {
      daysSchoolOpened,
      daysPresent,
      daysAbsent: null,
      attendancePercentage:
        null,
    };
  }

  const safeOpened =
    Math.max(
      0,
      Math.trunc(
        daysSchoolOpened,
      ),
    );

  const safePresent =
    Math.min(
      safeOpened,
      Math.max(
        0,
        Math.trunc(
          daysPresent,
        ),
      ),
    );

  const daysAbsent =
    safeOpened -
    safePresent;

  const attendancePercentage =
    safeOpened > 0
      ? roundAttendancePercentage(
          (safePresent /
            safeOpened) *
            100,
        )
      : null;

  return {
    daysSchoolOpened:
      safeOpened,

    daysPresent:
      safePresent,

    daysAbsent,

    attendancePercentage,
  };
}