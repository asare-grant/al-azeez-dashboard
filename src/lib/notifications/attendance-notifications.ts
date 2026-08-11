import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  createNotificationEvent,
} from "./service";

import {
  getParentNotificationRecipientsForStudent,
} from "./recipients";

import {
  getAcademicManagementRecipients,
} from "./recipients";

/* -------------------------------------------------------------------------- */
/*                        PARENT ABSENCE ALERT                                */
/* -------------------------------------------------------------------------- */

export async function notifyParentStudentAbsent({
  studentId,
  studentName,
  classId,
  className,
  attendanceDate,
  tx,
}: {
  studentId:
    string;

  studentName:
    string;

  classId:
    number;

  className:
    string;

  attendanceDate:
    Date;

  tx?:
    Prisma.TransactionClient;
}) {
  const recipients =
    await getParentNotificationRecipientsForStudent(
      studentId,

      {
        tx,
      },
    );

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  const dateKey =
    attendanceDate
      .toISOString()
      .slice(
        0,
        10,
      );

  return createNotificationEvent({
    tx,

    input: {
      type:
        "ATTENDANCE_ABSENT",

      category:
        "ATTENDANCE",

      priority:
        "HIGH",

      title:
        "Attendance Alert",

      message:
        `${studentName} was recorded absent from school today.`,

      actionUrl:
        null,

      entityType:
        "ATTENDANCE",

      entityId:
        `${studentId}:${dateKey}`,

      /*
       * One absence alert per child per date.
       */
      dedupeKey:
        `attendance:absent:${studentId}:${dateKey}`,

      actorId:
        null,

      actorRole:
        "system",

      actorName:
        "Attendance System",

      metadata: {
        studentId,

        studentName,

        classId,

        className,

        attendanceDate:
          dateKey,
      },

      recipients,
    },
  });
}



/* -------------------------------------------------------------------------- */
/*                    ATTENDANCE REGISTER INCOMPLETE                          */
/* -------------------------------------------------------------------------- */

export async function notifyAttendanceRegisterIncomplete({
  classId,
  className,
  attendanceDate,
  studentCount,
  recordedCount,
  missingCount,
  tx,
}: {
  classId:
    number;

  className:
    string;

  attendanceDate:
    Date;

  studentCount:
    number;

  recordedCount:
    number;

  missingCount:
    number;

  tx?:
    Prisma.TransactionClient;
}) {
  if (
    missingCount <=
    0
  ) {
    return null;
  }

  const recipients =
    await getAcademicManagementRecipients(
      classId,

      {
        tx,
      },
    );

  if (
    recipients.length ===
    0
  ) {
    return null;
  }

  const dateKey =
    attendanceDate
      .toISOString()
      .slice(
        0,
        10,
      );

  return createNotificationEvent({
    tx,

    input: {
      type:
        "ATTENDANCE_INCOMPLETE",

      category:
        "ATTENDANCE",

      priority:
        "HIGH",

      title:
        "Attendance Register Incomplete",

      message:
        `${className} attendance is incomplete. ${recordedCount} of ${studentCount} student records have been completed, leaving ${missingCount} outstanding.`,

      actionUrl:
        `/list/attendance`,

      entityType:
        "ATTENDANCE",

      entityId:
        `class:${classId}:${dateKey}`,

      /*
       * One incomplete-register alert per
       * class per school day.
       *
       * Because the cron can run every hour,
       * this prevents repeated alerts about
       * the same day's incomplete register.
       */
      dedupeKey:
        `attendance:incomplete:${classId}:${dateKey}`,

      actorId:
        null,

      actorRole:
        "system",

      actorName:
        "Attendance Monitor",

      metadata: {
        classId,

        className,

        attendanceDate:
          dateKey,

        studentCount,

        recordedCount,

        missingCount,
      },

      recipients,
    },
  });
}