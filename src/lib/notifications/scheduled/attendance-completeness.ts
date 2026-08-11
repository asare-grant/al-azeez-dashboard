import "server-only";

import prisma from "@/lib/prisma";

import {
  notifyAttendanceRegisterIncomplete,
} from "@/lib/notifications/attendance-notifications";

/* -------------------------------------------------------------------------- */
/*                         SCHOOL TIME HELPERS                                */
/* -------------------------------------------------------------------------- */

const SCHOOL_TIME_ZONE =
  "Africa/Accra";

/*
 * Default attendance deadline.
 *
 * You can override this in .env:
 *
 * ATTENDANCE_NOTIFICATION_CUTOFF_HOUR=10
 */
const DEFAULT_CUTOFF_HOUR =
  10;

function getSchoolDateParts(
  value:
    Date,
) {
  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          SCHOOL_TIME_ZONE,

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        hour:
          "2-digit",

        hourCycle:
          "h23",

        weekday:
          "short",
      },
    );

  const parts =
    formatter.formatToParts(
      value,
    );

  const values =
    Object.fromEntries(
      parts.map(
        (
          part,
        ) => [
          part.type,
          part.value,
        ],
      ),
    );

  return {
    year:
      Number(
        values.year,
      ),

    month:
      Number(
        values.month,
      ),

    day:
      Number(
        values.day,
      ),

    hour:
      Number(
        values.hour,
      ),

    weekday:
      values.weekday,
  };
}

function getAttendanceCutoffHour() {
  const configured =
    Number(
      process.env
        .ATTENDANCE_NOTIFICATION_CUTOFF_HOUR,
    );

  if (
    Number.isInteger(
      configured,
    ) &&
    configured >=
      0 &&
    configured <=
      23
  ) {
    return configured;
  }

  return DEFAULT_CUTOFF_HOUR;
}

/* -------------------------------------------------------------------------- */
/*                              PROCESSOR                                     */
/* -------------------------------------------------------------------------- */

export async function processAttendanceCompletenessNotifications() {
  const now =
    new Date();

  const schoolDate =
    getSchoolDateParts(
      now,
    );

  const cutoffHour =
    getAttendanceCutoffHour();

  /*
   * Do not evaluate the register before
   * the school's attendance deadline.
   */
  if (
    schoolDate.hour <
    cutoffHour
  ) {
    return {
      skipped:
        true,

      reason:
        "BEFORE_CUTOFF",

      classesScanned:
        0,

      incompleteClasses:
        0,

      eventsCreated:
        0,

      deliveriesCreated:
        0,
    };
  }

  /*
   * The current attendance UI deliberately
   * disables Saturday and Sunday.
   *
   * Therefore no completeness alert should
   * run on weekends.
   */
  if (
    schoolDate.weekday ===
      "Sat" ||
    schoolDate.weekday ===
      "Sun"
  ) {
    return {
      skipped:
        true,

      reason:
        "WEEKEND",

      classesScanned:
        0,

      incompleteClasses:
        0,

      eventsCreated:
        0,

      deliveriesCreated:
        0,
    };
  }

  /*
   * Attendance rows are stored at UTC midnight,
   * using YYYY-MM-DD as the school calendar day.
   */
  const attendanceDate =
    new Date(
      Date.UTC(
        schoolDate.year,

        schoolDate.month -
          1,

        schoolDate.day,

        0,
        0,
        0,
        0,
      ),
    );

  /* ---------------------------------------------------------------------- */
  /*               CONFIRM TODAY BELONGS TO A SCHOOL TERM                  */
  /* ---------------------------------------------------------------------- */

  const matchingTerms =
    await prisma.schoolTerm.findMany({
      where: {
        startDate: {
          lte:
            attendanceDate,
        },

        endDate: {
          gte:
            attendanceDate,
        },

        academicYear: {
          isNot:
            null,
        },
      },

      select: {
        id:
          true,

        name:
          true,

        academicYearId:
          true,
      },

      take:
        2,
    });

  /*
   * If school is outside a configured term,
   * attendance completeness should not run.
   */
  if (
    matchingTerms.length ===
    0
  ) {
    return {
      skipped:
        true,

      reason:
        "NO_ACTIVE_TERM_FOR_DATE",

      classesScanned:
        0,

      incompleteClasses:
        0,

      eventsCreated:
        0,

      deliveriesCreated:
        0,
    };
  }

  /*
   * This uses the same integrity principle as
   * your attendance upsert route.
   *
   * One school date must not belong to two terms.
   */
  if (
    matchingTerms.length >
    1
  ) {
    throw new Error(
      "More than one academic term contains today's attendance date. Check the academic calendar configuration.",
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                             STUDENTS                                   */
  /* ---------------------------------------------------------------------- */

  const students =
    await prisma.student.findMany({
      select: {
        id:
          true,

        classId:
          true,
      },
    });

  if (
    students.length ===
    0
  ) {
    return {
      skipped:
        false,

      reason:
        null,

      classesScanned:
        0,

      incompleteClasses:
        0,

      eventsCreated:
        0,

      deliveriesCreated:
        0,
    };
  }

  /*
   * Build the class/student relationship
   * independently from attendance.
   */
  const studentsByClass =
    new Map<
      number,
      string[]
    >();

  for (
    const student of
    students
  ) {
    const current =
      studentsByClass.get(
        student.classId,
      ) ??
      [];

    current.push(
      student.id,
    );

    studentsByClass.set(
      student.classId,
      current,
    );
  }

  const classIds =
    Array.from(
      studentsByClass.keys(),
    );

  const classes =
    await prisma.class.findMany({
      where: {
        id: {
          in:
            classIds,
        },
      },

      select: {
        id:
          true,

        name:
          true,
      },
    });

  /* ---------------------------------------------------------------------- */
  /*                          TODAY'S ATTENDANCE                             */
  /* ---------------------------------------------------------------------- */

  const attendance =
    await prisma.attendance.findMany({
      where: {
        date:
          attendanceDate,

        studentId: {
          in:
            students.map(
              (
                student,
              ) =>
                student.id,
            ),
        },
      },

      select: {
        studentId:
          true,

        /*
         * We deliberately do not filter on
         * present.
         *
         * present=true and present=false are
         * BOTH completed register entries.
         */
        present:
          true,
      },
    });

  const recordedStudentIds =
    new Set(
      attendance.map(
        (
          record,
        ) =>
          record.studentId,
      ),
    );

  let incompleteClasses =
    0;

  let eventsCreated =
    0;

  let deliveriesCreated =
    0;

  /* ---------------------------------------------------------------------- */
  /*                         CHECK EACH CLASS                               */
  /* ---------------------------------------------------------------------- */

  for (
    const classRecord of
    classes
  ) {
    const classStudentIds =
      studentsByClass.get(
        classRecord.id,
      ) ??
      [];

    const studentCount =
      classStudentIds.length;

    if (
      studentCount ===
      0
    ) {
      continue;
    }

    const recordedCount =
      classStudentIds.filter(
        (
          studentId,
        ) =>
          recordedStudentIds.has(
            studentId,
          ),
      ).length;

    const missingCount =
      Math.max(
        0,

        studentCount -
          recordedCount,
      );

    if (
      missingCount ===
      0
    ) {
      continue;
    }

    incompleteClasses++;

    const result =
      await notifyAttendanceRegisterIncomplete({
        classId:
          classRecord.id,

        className:
          classRecord.name,

        attendanceDate,

        studentCount,

        recordedCount,

        missingCount,
      });

    if (
      !result
    ) {
      continue;
    }

    if (
      result.createdEvent
    ) {
      eventsCreated++;
    }

    deliveriesCreated +=
      result.deliveredCount;
  }

  return {
    skipped:
      false,

    reason:
      null,

    classesScanned:
      classes.length,

    incompleteClasses,

    eventsCreated,

    deliveriesCreated,
  };
}