// src/lib/academic-engine/report-defaults.ts

import type {
  StudentReportCardRemarks,
  StudentTermAttendance,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                          DEFAULT ATTENDANCE                                */
/* -------------------------------------------------------------------------- */

export const DEFAULT_STUDENT_TERM_ATTENDANCE: StudentTermAttendance =
  {
    daysSchoolOpened: null,

    daysPresent: null,
    daysAbsent: null,

    attendancePercentage: null,
  };

/* -------------------------------------------------------------------------- */
/*                            DEFAULT REMARKS                                 */
/* -------------------------------------------------------------------------- */

export const DEFAULT_STUDENT_REPORT_REMARKS: StudentReportCardRemarks =
  {
    conduct: null,

    classTeacherRemark: null,

    headTeacherRemark: null,

    promotionStatus: null,

    nextTermBegins: null,
  };