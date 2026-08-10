import "server-only";

import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type AttendanceRegisterStatus = "COMPLETE" | "INCOMPLETE";

export type StudentTermAttendanceSummary = {
  studentId: string;

  termId: number;

  academicYear: string;

  /*
   * Official number configured by administration.
   */
  daysSchoolOpened: number;

  /*
   * Number of actual attendance dates recorded
   * for this student during the term.
   */
  recordedDays: number;

  missingDays: number;

  registerStatus: AttendanceRegisterStatus;

  /*
   * These are null until the student's attendance
   * register is complete.
   */
  daysPresent: number | null;

  daysAbsent: number | null;

  attendancePercentage: number | null;
};

type AttendanceSummaryOptions = {
  tx?: Prisma.TransactionClient;
};

/* -------------------------------------------------------------------------- */
/*                              NUMBER HELPERS                                */
/* -------------------------------------------------------------------------- */

function roundNumber(value: number, decimalPlaces = 2) {
  const factor = 10 ** decimalPlaces;

  return Math.round(value * factor) / factor;
}

function getAttendanceDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function startOfUtcDay(value: Date) {
  const date = new Date(value);

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function endOfUtcDay(value: Date) {
  const date = new Date(value);

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}
/* -------------------------------------------------------------------------- */
/*                     STUDENT TERM ATTENDANCE SUMMARY                        */
/* -------------------------------------------------------------------------- */

export async function getStudentTermAttendanceSummary(
  {
    studentId,
    termId,
  }: {
    studentId: string;

    termId: number;
  },
  options: AttendanceSummaryOptions = {},
): Promise<StudentTermAttendanceSummary> {
  const normalizedStudentId = studentId.trim();

  if (!normalizedStudentId) {
    throw new Error("The student could not be resolved.");
  }

  if (!Number.isInteger(termId) || termId <= 0) {
    throw new Error("The school term could not be resolved.");
  }

  /*
   * Allow the service to participate in an
   * existing transaction when needed.
   */
  const db = options.tx ?? prisma;

  /* ---------------------------------------------------------------------- */
  /*                         LOAD TERM CONFIGURATION                        */
  /* ---------------------------------------------------------------------- */

  const term = await db.schoolTerm.findUnique({
    where: {
      id: termId,
    },

    select: {
      id: true,

      startDate: true,

      endDate: true,

      daysSchoolOpened: true,

      academicYear: {
        select: {
          id: true,

          name: true,
        },
      },
    },
  });

  if (!term) {
    throw new Error("The selected school term could not be found.");
  }

  if (!term.academicYear) {
    throw new Error(
      "The selected school term is not linked to an academic year.",
    );
  }

  if (
    term.daysSchoolOpened === null ||
    !Number.isInteger(term.daysSchoolOpened) ||
    term.daysSchoolOpened <= 0
  ) {
    throw new Error(
      "Days school opened has not been configured for this term.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                          VERIFY STUDENT                               */
  /* ---------------------------------------------------------------------- */

  const student = await db.student.findUnique({
    where: {
      id: normalizedStudentId,
    },

    select: {
      id: true,

      classId: true,
    },
  });

  if (!student) {
    throw new Error("The selected student could not be found.");
  }

  /* ---------------------------------------------------------------------- */
  /*                         LOAD ATTENDANCE ROWS                           */
  /* ---------------------------------------------------------------------- */

  const attendanceRows = await db.attendance.findMany({
    where: {
      studentId: normalizedStudentId,

      date: {
        gte: startOfUtcDay(term.startDate),

        lte: endOfUtcDay(term.endDate),
      },
    },

    select: {
      date: true,

      present: true,
    },

    orderBy: {
      date: "asc",
    },
  });

  /* ---------------------------------------------------------------------- */
  /*                       DISTINCT REGISTER DAYS                           */
  /* ---------------------------------------------------------------------- */

  const recordedDateKeys = new Set(
    attendanceRows.map((attendance) => getAttendanceDateKey(attendance.date)),
  );

  const presentDateKeys = new Set(
    attendanceRows
      .filter((attendance) => attendance.present)
      .map((attendance) => getAttendanceDateKey(attendance.date)),
  );

  const recordedDays = recordedDateKeys.size;

  const observedPresentDays = presentDateKeys.size;

  /* ---------------------------------------------------------------------- */
  /*                          INTEGRITY CHECKS                              */
  /* ---------------------------------------------------------------------- */

  if (recordedDays > term.daysSchoolOpened) {
    throw new Error(
      `Attendance records contain ${recordedDays} recorded school days, but only ${term.daysSchoolOpened} official school days are configured for this term.`,
    );
  }

  if (observedPresentDays > recordedDays) {
    throw new Error("The student's attendance records are inconsistent.");
  }

  /* ---------------------------------------------------------------------- */
  /*                        COMPLETENESS STATUS                             */
  /* ---------------------------------------------------------------------- */

  const missingDays = Math.max(0, term.daysSchoolOpened - recordedDays);

  const registerStatus: AttendanceRegisterStatus =
    recordedDays === term.daysSchoolOpened ? "COMPLETE" : "INCOMPLETE";

  /* ---------------------------------------------------------------------- */
  /*                        FINAL ATTENDANCE                               */
  /* ---------------------------------------------------------------------- */

  const daysPresent =
    registerStatus === "COMPLETE" ? observedPresentDays : null;

  const daysAbsent =
    registerStatus === "COMPLETE"
      ? term.daysSchoolOpened - observedPresentDays
      : null;

  const attendancePercentage =
    registerStatus === "COMPLETE"
      ? roundNumber((observedPresentDays / term.daysSchoolOpened) * 100)
      : null;

  return {
    studentId: normalizedStudentId,

    termId: term.id,

    academicYear: term.academicYear.name,

    daysSchoolOpened: term.daysSchoolOpened,

    recordedDays,

    missingDays,

    registerStatus,

    daysPresent,

    daysAbsent,

    attendancePercentage,
  };
}

/* -------------------------------------------------------------------------- */
/*                      CLASS TERM ATTENDANCE SUMMARIES                       */
/* -------------------------------------------------------------------------- */

export async function getClassTermAttendanceSummaries(
  {
    studentIds,
    termId,
  }: {
    studentIds: string[];

    termId: number;
  },
  options: AttendanceSummaryOptions = {},
): Promise<Map<string, StudentTermAttendanceSummary>> {
  const normalizedStudentIds = Array.from(
    new Set(studentIds.map((studentId) => studentId.trim()).filter(Boolean)),
  );

  if (normalizedStudentIds.length === 0) {
    return new Map();
  }

  if (!Number.isInteger(termId) || termId <= 0) {
    throw new Error("The school term could not be resolved.");
  }

  const db = options.tx ?? prisma;

  const term = await db.schoolTerm.findUnique({
    where: {
      id: termId,
    },

    select: {
      id: true,

      startDate: true,

      endDate: true,

      daysSchoolOpened: true,

      academicYear: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!term) {
    throw new Error("The selected school term could not be found.");
  }

  if (!term.academicYear) {
    throw new Error(
      "The selected school term is not linked to an academic year.",
    );
  }

  if (
    term.daysSchoolOpened === null ||
    !Number.isInteger(term.daysSchoolOpened) ||
    term.daysSchoolOpened <= 0
  ) {
    throw new Error(
      "Days school opened has not been configured for this term.",
    );
  }

  const students = await db.student.findMany({
    where: {
      id: {
        in: normalizedStudentIds,
      },
    },

    select: {
      id: true,
    },
  });

  const validStudentIds = new Set(students.map((student) => student.id));

  const missingStudentIds = normalizedStudentIds.filter(
    (studentId) => !validStudentIds.has(studentId),
  );

  if (missingStudentIds.length > 0) {
    throw new Error(
      `${missingStudentIds.length} student attendance record${
        missingStudentIds.length === 1 ? "" : "s"
      } could not be resolved.`,
    );
  }

  const attendanceRows = await db.attendance.findMany({
    where: {
      studentId: {
        in: normalizedStudentIds,
      },

      date: {
        gte: startOfUtcDay(term.startDate),

        lte: endOfUtcDay(term.endDate),
      },
    },

    select: {
      studentId: true,

      date: true,

      present: true,
    },

    orderBy: [
      {
        studentId: "asc",
      },

      {
        date: "asc",
      },
    ],
  });

  console.log("REPORT ATTENDANCE SOURCE", {
    termId: term.id,

    startDate: startOfUtcDay(term.startDate),

    endDate: endOfUtcDay(term.endDate),

    daysSchoolOpened: term.daysSchoolOpened,

    rows: attendanceRows.map((row) => ({
      studentId: row.studentId,

      date: row.date.toISOString(),

      present: row.present,
    })),
  });

  const recordedDatesByStudent = new Map<string, Set<string>>();

  const presentDatesByStudent = new Map<string, Set<string>>();

  for (const attendance of attendanceRows) {
    const dateKey = getAttendanceDateKey(attendance.date);

    let recordedDates = recordedDatesByStudent.get(attendance.studentId);

    if (!recordedDates) {
      recordedDates = new Set<string>();

      recordedDatesByStudent.set(attendance.studentId, recordedDates);
    }

    recordedDates.add(dateKey);

    if (attendance.present) {
      let presentDates = presentDatesByStudent.get(attendance.studentId);

      if (!presentDates) {
        presentDates = new Set<string>();

        presentDatesByStudent.set(attendance.studentId, presentDates);
      }

      presentDates.add(dateKey);
    }
  }

  const summaries = new Map<string, StudentTermAttendanceSummary>();

  for (const studentId of normalizedStudentIds) {
    const recordedDays = recordedDatesByStudent.get(studentId)?.size ?? 0;

    const observedPresentDays = presentDatesByStudent.get(studentId)?.size ?? 0;

    console.log("STUDENT ATTENDANCE SUMMARY", {
      studentId,

      recordedDays,

      observedPresentDays,

      daysSchoolOpened: term.daysSchoolOpened,

      recordedDates: Array.from(recordedDatesByStudent.get(studentId) ?? []),

      presentDates: Array.from(presentDatesByStudent.get(studentId) ?? []),
    });

    if (recordedDays > term.daysSchoolOpened) {
      throw new Error(
        `Attendance records for student ${studentId} contain ${recordedDays} recorded days, but only ${term.daysSchoolOpened} official school days are configured for this term.`,
      );
    }

    const missingDays = Math.max(0, term.daysSchoolOpened - recordedDays);

    const registerStatus: AttendanceRegisterStatus =
      recordedDays === term.daysSchoolOpened ? "COMPLETE" : "INCOMPLETE";

    const daysPresent =
      registerStatus === "COMPLETE" ? observedPresentDays : null;

    const daysAbsent =
      registerStatus === "COMPLETE"
        ? term.daysSchoolOpened - observedPresentDays
        : null;

    const attendancePercentage =
      registerStatus === "COMPLETE"
        ? roundNumber((observedPresentDays / term.daysSchoolOpened) * 100)
        : null;

    summaries.set(studentId, {
      studentId,

      termId: term.id,

      academicYear: term.academicYear.name,

      daysSchoolOpened: term.daysSchoolOpened,

      recordedDays,

      missingDays,

      registerStatus,

      daysPresent,

      daysAbsent,

      attendancePercentage,
    });
  }

  return summaries;
}
