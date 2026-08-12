import "server-only";

import prisma from "@/lib/prisma";

import {
  notifyEventStartingSoon,
  notifyEventUpcoming,
} from "../event-notifications";

/* -------------------------------------------------------------------------- */
/*                               CONSTANTS                                    */
/* -------------------------------------------------------------------------- */

const ONE_HOUR = 60 * 60 * 1000;

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type UpcomingEventProcessorResult = {
  scanned24Hours: number;

  scanned2Hours: number;

  created24Hours: number;

  created2Hours: number;
};

/* -------------------------------------------------------------------------- */
/*                              PROCESSOR                                     */
/* -------------------------------------------------------------------------- */

export async function processUpcomingEventNotifications({
  now = new Date(),
}: {
  now?: Date;
} = {}): Promise<UpcomingEventProcessorResult> {
  /*
   * The scheduler will eventually run hourly.
   *
   * 24-hour notifications:
   * events beginning between 23h and 24h from now.
   *
   * 2-hour notifications:
   * events beginning between 1h and 2h from now.
   *
   * Using an hour-wide window means an hourly scheduler
   * can discover each event reliably.
   */

  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * ONE_HOUR);

  const twoHoursFromNow = new Date(now.getTime() + 2 * ONE_HOUR);

  const upcoming24Hours = await prisma.event.findMany({
    where: {
      startTime: {
        gt: twoHoursFromNow,

        lte: twentyFourHoursFromNow,
      },
    },

    select: {
      id: true,

      title: true,

      description: true,

      startTime: true,

      endTime: true,

      classId: true,

      class: {
        select: {
          name: true,
        },
      },
      notificationRevision: true,
    },
  });

  const upcoming2Hours = await prisma.event.findMany({
    where: {
      startTime: {
        gt: now,

        lte: twoHoursFromNow,
      },
    },

    select: {
      id: true,

      title: true,

      description: true,

      startTime: true,

      endTime: true,

      classId: true,

      class: {
        select: {
          name: true,
        },
      },
      notificationRevision: true,
    },
  });

  let created24Hours = 0;

  let created2Hours = 0;

  for (const event of upcoming24Hours) {
    const result = await notifyEventUpcoming({
      eventId: event.id,

      title: event.title,

      description: event.description,

      startTime: event.startTime,

      endTime: event.endTime,

      classId: event.classId,

      className: event.class?.name ?? null,

      notificationRevision: event.notificationRevision,
    });

    if (result?.createdEvent) {
      created24Hours++;
    }
  }

  for (const event of upcoming2Hours) {
    const result = await notifyEventStartingSoon({
      eventId: event.id,

      title: event.title,

      description: event.description,

      startTime: event.startTime,

      endTime: event.endTime,

      classId: event.classId,

      className: event.class?.name ?? null,

      notificationRevision: event.notificationRevision,
    });

    if (result?.createdEvent) {
      created2Hours++;
    }
  }

  return {
    scanned24Hours: upcoming24Hours.length,

    scanned2Hours: upcoming2Hours.length,

    created24Hours,

    created2Hours,
  };
}
