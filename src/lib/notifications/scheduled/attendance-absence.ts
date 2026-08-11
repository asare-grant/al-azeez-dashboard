import "server-only";

import prisma from "@/lib/prisma";

import {
  notifyParentStudentAbsent,
} from "@/lib/notifications/attendance-notifications";

function startOfUtcDay(
  value:
    Date,
) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),

      value.getUTCMonth(),

      value.getUTCDate(),

      0,
      0,
      0,
      0,
    ),
  );
}

function endOfUtcDay(
  value:
    Date,
) {
  return new Date(
    Date.UTC(
      value.getUTCFullYear(),

      value.getUTCMonth(),

      value.getUTCDate(),

      23,
      59,
      59,
      999,
    ),
  );
}

export async function processAttendanceAbsenceNotifications() {
  const now =
    new Date();

  const dayStart =
    startOfUtcDay(
      now,
    );

  const dayEnd =
    endOfUtcDay(
      now,
    );

  const absentRecords =
    await prisma.attendance.findMany({
      where: {
        date: {
          gte:
            dayStart,

          lte:
            dayEnd,
        },

        present:
          false,
      },

      select: {
        id:
          true,

        date:
          true,

        student: {
          select: {
            id:
              true,

            name:
              true,

            surname:
              true,

            class: {
              select: {
                id:
                  true,

                name:
                  true,
              },
            },
          },
        },
      },
    });

  let eventsCreated =
    0;

  let deliveriesCreated =
    0;

  for (
    const record of
    absentRecords
  ) {
    const result =
      await notifyParentStudentAbsent({
        studentId:
          record.student.id,

        studentName:
          `${record.student.name} ${record.student.surname}`.trim(),

        classId:
          record.student.class.id,

        className:
          record.student.class.name,

        attendanceDate:
          record.date,
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
    scanned:
      absentRecords.length,

    eventsCreated,

    deliveriesCreated,
  };
}