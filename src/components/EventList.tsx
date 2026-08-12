// src/components/EventList.tsx

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import { CalendarDays, Clock3 } from "lucide-react";

import {
  getEventVisibilityWhere,
  type EventViewerRole,
} from "@/lib/events/visibility";

/* -------------------------------------------------------------------------- */
/*                              DATE RANGE                                    */
/* -------------------------------------------------------------------------- */

function getSelectedDateRange(dateParam?: string) {
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return null;
  }

  return {
    start: new Date(`${dateParam}T00:00:00.000Z`),

    end: new Date(`${dateParam}T23:59:59.999Z`),
  };
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

export default async function EventList({
  dateParam,
}: {
  dateParam: string | undefined;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return null;
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role as EventViewerRole | undefined;

  if (!role) {
    return null;
  }

  /* ---------------------------------------------------------------------- */
  /*                            VISIBILITY                                  */
  /* ---------------------------------------------------------------------- */

  const visibility = getEventVisibilityWhere({
    userId,

    role,
  });

  /* ---------------------------------------------------------------------- */
  /*                           DATE FILTER                                  */
  /* ---------------------------------------------------------------------- */

  const selectedDateRange = getSelectedDateRange(dateParam);

  const now = new Date();

  /* ---------------------------------------------------------------------- */
  /*                              EVENTS                                    */
  /* ---------------------------------------------------------------------- */

  const data = await prisma.event.findMany({
    where: {
      AND: [
        visibility,

        selectedDateRange
          ? {
              startTime: {
                gte: selectedDateRange.start,

                lte: selectedDateRange.end,
              },
            }
          : {
              /*
               * When no calendar date is selected,
               * show current and future events.
               */
              endTime: {
                gte: now,
              },
            },
      ],
    },

    include: {
      class: {
        select: {
          id: true,

          name: true,
        },
      },
    },

    orderBy: {
      startTime: "asc",
    },

    /*
     * Keep dashboard widgets compact.
     */
    take: selectedDateRange ? undefined : 6,
  });

  console.log("EVENT LIST DEBUG:", {
    userId,

    role,

    dateParam,

    selectedDate: selectedDateRange
      ? {
          start: selectedDateRange.start,

          end: selectedDateRange.end,
        }
      : null,

    now,

    eventCount: data.length,

    events: data.map((event) => ({
      id: event.id,

      title: event.title,

      classId: event.classId,

      className: event.class?.name,

      startTime: event.startTime,

      endTime: event.endTime,
    })),
  });

  /* ---------------------------------------------------------------------- */
  /*                            EMPTY STATE                                 */
  /* ---------------------------------------------------------------------- */

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
        <CalendarDays className="mx-auto h-6 w-6 text-slate-300" />

        <p className="mt-3 text-sm font-bold text-slate-500">
          {selectedDateRange
            ? "No events scheduled for this date."
            : "No upcoming events at the moment."}
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                               LIST                                     */
  /* ---------------------------------------------------------------------- */

  return data.map((event) => (
    <article
      key={event.id}
      className="rounded-2xl border border-slate-200 border-t-4 bg-white p-4 transition odd:border-t-[#C3EBFA] even:border-t-[#CFCEFF] hover:border-blue-200 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-black text-slate-900">{event.title}</h3>

          <p className="mt-1 text-xs font-bold text-blue-600">
            {event.class?.name ?? "School-wide"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />

          {event.startTime.toLocaleTimeString("en-GH", {
            hour: "2-digit",

            minute: "2-digit",

            hour12: false,

            timeZone: "UTC",
          })}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {event.description}
      </p>
    </article>
  ));
}
