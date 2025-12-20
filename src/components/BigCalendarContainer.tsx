// import BigCalendar from "./BigCalender";
// import { adjustScheduleToCurrentWeek } from "@/lib/utils";
// import prisma from "@/lib/prisma"; // move this to the top

// const BigCalendarContainer = async ({
//   type,
//   id,
//   lessons,
// }: {
//   type?: "teacherId" | "classId";
//   id?: string | number;
//   lessons?: {
//     name: string;
//     startTime: Date;
//     endTime: Date;
//     teacher?: { name: string; surname: string };
//     assignments?: { title: string }[];
//   }[];
// }) => {
//   let lessonsData = lessons;

//   if (!lessonsData && type && id) {
//     const dataRes = await prisma.lesson.findMany({
//       where:
//         type === "teacherId"
//           ? { teacherId: id as string }
//           : { classId: id as number },
//       include: { teacher: true, assignments: true },
//     });

//     lessonsData = dataRes;
//   }

//   const data =
//     lessonsData?.map((lesson) => {
//       let title = lesson.name;
//       if (lesson.teacher) {
//         title += ` - ${lesson.teacher.name}`;
//         // title += ` - ${lesson.teacher.name} ${lesson.teacher.surname}`;
//       }
//       if (lesson.assignments?.length) {
//         title += ` (${lesson.assignments.map((a) => a.title).join(", ")})`;
//       }

//       return {
//         title,
//         start: new Date(lesson.startTime),
//         end: new Date(lesson.endTime),
//       };
//     }) || [];

//   const schedule = adjustScheduleToCurrentWeek(data);

//   return (
//     <div className="w-full overflow-x-auto scroll-smooth">
//       {/* Custom Header */}
//       {/* <div className="min-w-[1020px] grid grid-cols-5 text-center font-semibold bg-gray-100 py-2 rounded-md border border-gray-200 mb-2 pl-12">
//         <div>Monday</div>
//         <div>Tuesday</div>
//         <div>Wednesday</div>
//         <div>Thursday</div>
//         <div>Friday</div>
//       </div> */}
//       {/* Calendar */}
//       <div className="min-w-[1020px]">
//         <BigCalendar data={schedule} />
//       </div>
//     </div>
//   );
// };

// export default BigCalendarContainer;






import BigCalendar from "./BigCalender";
import prisma from "@/lib/prisma";
import { buildWeeklySchedule } from "@/lib/utils";
import { getActiveTerm } from "@/lib/getActiveTerm";

const BigCalendarContainer = async ({
  type,
  id,
  lessons,
}: {
  type?: "teacherId" | "classId";
  id?: string | number;
  lessons?: any[];
}) => {
  let lessonsData = lessons ?? [];

  if (!lessons && type && id) {
    lessonsData = await prisma.lesson.findMany({
      where:
        type === "teacherId"
          ? { teacherId: id as string }
          : { classId: id as number },
      include: {
        teacher: true,
        assignments: true,
      },
    });
  }

  const term = await getActiveTerm();

  if (!term) {
    return (
      <div className="text-center text-sm text-gray-500">
        No active term set
      </div>
    );
  }

  const calendarData = buildWeeklySchedule(
    lessonsData.map((lesson) => {
      let title = lesson.name;

      if (lesson.teacher) {
        title += ` - ${lesson.teacher.name}`;
      }

      if (lesson.assignments?.length) {
        title += ` (${lesson.assignments
          .map((a: any) => a.title)
          .join(", ")})`;
      }

      return {
        title,
        day: lesson.day,
        startTime: new Date(lesson.startTime),
        endTime: new Date(lesson.endTime),
      };
    }),
    {
      startDate: term.startDate,
      endDate: term.endDate,
    }
  );

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1020px]">
        <BigCalendar data={calendarData} />
      </div>
    </div>
  );
};

export default BigCalendarContainer;
