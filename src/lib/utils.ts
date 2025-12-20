import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DAY_INDEX: Record<string, number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
};

const getMondayOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const buildWeeklySchedule = (
  lessons: {
    title: string;
    day: keyof typeof DAY_INDEX;
    startTime: Date;
    endTime: Date;
  }[],
  term: {
    startDate: Date;
    endDate: Date;
  }
) => {
  const today = new Date();

  // ❌ Outside term → empty calendar
  if (today < term.startDate || today > term.endDate) {
    return [];
  }

  const monday = getMondayOfWeek(today);

  return lessons.map((lesson) => {
    const baseDate = new Date(monday);
    baseDate.setDate(monday.getDate() + DAY_INDEX[lesson.day]);

    const start = new Date(baseDate);
    start.setHours(
      lesson.startTime.getHours(),
      lesson.startTime.getMinutes(),
      0
    );

    const end = new Date(baseDate);
    end.setHours(
      lesson.endTime.getHours(),
      lesson.endTime.getMinutes(),
      0
    );

    return {
      title: lesson.title,
      start,
      end,
    };
  });
};


// const getLatestMonday = (): Date => {
//   const today = new Date();
//   const dayOfWeek = today.getDay();
//   const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
//   const latestMonday = today;
//   latestMonday.setDate(today.getDate() - daysSinceMonday);
//   return latestMonday;
// };

// export const adjustScheduleToCurrentWeek = (
//   lessons: { title: string; start: Date; end: Date }[]
// ): { title: string; start: Date; end: Date }[] => {
//   const latestMonday = getLatestMonday();

//   return lessons.map((lesson) => {
//     const lessonDayOfWeek = lesson.start.getDay();

//     const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

//     const adjustedStartDate = new Date(latestMonday);

//     adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
//     adjustedStartDate.setHours(
//       lesson.start.getHours(),
//       lesson.start.getMinutes(),
//       lesson.start.getSeconds()
//     );
//     const adjustedEndDate = new Date(adjustedStartDate);
//     adjustedEndDate.setHours(
//       lesson.end.getHours(),
//       lesson.end.getMinutes(),
//       lesson.end.getSeconds()
//     );

//     return {
//       title: lesson.title,
//       start: adjustedStartDate,
//       end: adjustedEndDate,
//     };
//   });
// };


// lib/utils.ts

// export const DAY_INDEX: Record<
//   "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY",
//   number
// > = {
//   MONDAY: 0,
//   TUESDAY: 1,
//   WEDNESDAY: 2,
//   THURSDAY: 3,
//   FRIDAY: 4,
// };

// const getLatestMonday = () => {
//   const today = new Date();
//   const day = today.getDay();
//   const diff = day === 0 ? -6 : 1 - day;
//   const monday = new Date(today);
//   monday.setDate(today.getDate() + diff);
//   monday.setHours(0, 0, 0, 0);
//   return monday;
// };

// export const buildWeeklySchedule = (
//   lessons: {
//     title: string;
//     day: keyof typeof DAY_INDEX;
//     startTime: Date;
//     endTime: Date;
//   }[]
// ) => {
//   const monday = getLatestMonday();

//   return lessons.map((lesson) => {
//     const baseDate = new Date(monday);
//     baseDate.setDate(monday.getDate() + DAY_INDEX[lesson.day]);

//     const start = new Date(baseDate);
//     start.setHours(
//       lesson.startTime.getHours(),
//       lesson.startTime.getMinutes(),
//       0,
//       0
//     );

//     const end = new Date(baseDate);
//     end.setHours(
//       lesson.endTime.getHours(),
//       lesson.endTime.getMinutes(),
//       0,
//       0
//     );

//     return {
//       title: lesson.title,
//       start,
//       end,
//     };
//   });
// };
