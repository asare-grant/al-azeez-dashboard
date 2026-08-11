import "server-only";

import prisma from "@/lib/prisma";

import {
  notifyAssessmentDueSoon,
} from "@/lib/notifications/assessment-notifications";

/* -------------------------------------------------------------------------- */
/*                              REMINDER WINDOWS                              */
/* -------------------------------------------------------------------------- */

const reminderWindows = [
  {
    hours:
      24,

    /*
     * The hourly job may run a little before or
     * after an exact clock boundary.
     *
     * We therefore accept assessments whose due
     * date falls inside this small window.
     */
    minimumHours:
      23,

    maximumHours:
      25,
  },

  {
    hours:
      6,

    minimumHours:
      5,

    maximumHours:
      7,
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                               PROCESSOR                                    */
/* -------------------------------------------------------------------------- */

export async function processAssessmentDueSoonNotifications() {
  const now =
    new Date();

  let scanned =
    0;

  let eventsCreated =
    0;

  let deliveriesCreated =
    0;

  for (
    const window of
    reminderWindows
  ) {
    const windowStart =
      new Date(
        now.getTime() +
          window.minimumHours *
            60 *
            60 *
            1000,
      );

    const windowEnd =
      new Date(
        now.getTime() +
          window.maximumHours *
            60 *
            60 *
            1000,
      );

    const assessments =
      await prisma.assessment.findMany({
        where: {
          status: {
            in: [
              "PUBLISHED",
              "SCHEDULED",
            ],
          },

          dueDate: {
            gte:
              windowStart,

            lte:
              windowEnd,
          },
        },

        select: {
          id:
            true,

          title:
            true,

          dueDate:
            true,

          lesson: {
            select: {
              class: {
                select: {
                  id:
                    true,

                  name:
                    true,
                },
              },

              subject: {
                select: {
                  name:
                    true,
                },
              },
            },
          },
        },
      });

    scanned +=
      assessments.length;

    for (
      const assessment of
      assessments
    ) {
      /*
       * A due-soon reminder only makes sense
       * while the due date is still in the future.
       */
      if (
        !assessment.dueDate ||
        assessment.dueDate <=
          now
      ) {
        continue;
      }

      const result =
        await notifyAssessmentDueSoon({
          assessmentId:
            assessment.id,

          assessmentTitle:
            assessment.title,

          classId:
            assessment.lesson.class.id,

          className:
            assessment.lesson.class.name,

          subjectName:
            assessment.lesson.subject.name,

          hoursRemaining:
            window.hours,

          actorId:
            null,

          actorRole:
            "system",

          actorName:
            "Assessment Scheduler",
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
  }

  return {
    scanned,

    eventsCreated,

    deliveriesCreated,
  };
}