// src/components/EventCalendarContainer.tsx

import Image from "next/image";

import prisma from "@/lib/prisma";

import EventCalendar from "./EventCalendar";

import EventList from "./EventList";

import {
  getEventVisibilityWhere,
  requireEventViewer,
} from "@/lib/events/visibility";

import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*                              DATE HELPERS                                  */
/* -------------------------------------------------------------------------- */

function getMonthRange(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));

  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  return {
    start,
    end,
  };
}

function currentMonthKey() {
  const now = new Date();

  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

export default async function EventCalendarContainer({
  searchParams,
}: {
  searchParams: Promise<{
    [key: string]: string | undefined;
  }>;
}) {
  let viewer;

  try {
    viewer = await requireEventViewer();
  } catch {
    return null;
  }

  const { userId, scope } = viewer;

  const params = await searchParams;

  const selectedDate = params.date;

  const monthKey =
    params.month ?? selectedDate?.slice(0, 7) ?? currentMonthKey();

  const visibility =
  getEventVisibilityWhere({
    userId,

    scope,
  });

  const { start, end } = getMonthRange(monthKey);

  const monthEvents = await prisma.event.findMany({
    where: {
      AND: [
        visibility,

        {
          startTime: {
            gte: start,

            lt: end,
          },
        },
      ],
    },

    select: {
      startTime: true,
    },

    orderBy: {
      startTime: "asc",
    },
  });

  const eventDates = Array.from(
    new Set(
      monthEvents.map((event) => event.startTime.toISOString().slice(0, 10)),
    ),
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <EventCalendar eventDates={eventDates} initialDate={selectedDate} />

      <div className="my-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-950">Events</h1>

          <p className="mt-1 text-xs text-slate-400">
            {selectedDate
              ? `Events scheduled for ${selectedDate}`
              : "Upcoming school events"}
          </p>
        </div>

        {selectedDate ? (
          <Link
            href={`?month=${monthKey}`}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-3 text-[10px] font-black uppercase tracking-[0.1em] text-blue-700 transition hover:bg-blue-100"
          >
            View Upcoming
          </Link>
        ) : (
          <Image src="/moreDark.png" alt="" width={20} height={20} />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <EventList dateParam={selectedDate} />
      </div>
    </div>
  );
}
