import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import prisma from "@/lib/prisma"; // move this to the top

const BigCalendarContainer = async ({
  type,
  id,
  lessons,
}: {
  type?: "teacherId" | "classId";
  id?: string | number;
  lessons?: {
    name: string;
    startTime: Date;
    endTime: Date;
    teacher?: { name: string; surname: string };
    assignments?: { title: string }[];
  }[];
}) => {
  let lessonsData = lessons;

  if (!lessonsData && type && id) {
    const dataRes = await prisma.lesson.findMany({
      where: type === "teacherId" ? { teacherId: id as string } : { classId: id as number },
      include: { teacher: true, assignments: true },
    });

    lessonsData = dataRes;
  }

  const data = lessonsData?.map((lesson) => {
    let title = lesson.name;
    if (lesson.teacher) {
      title += ` - ${lesson.teacher.name} ${lesson.teacher.surname}`;
    }
    if (lesson.assignments?.length) {
      title += ` (${lesson.assignments.map(a => a.title).join(", ")})`;
    }

    return {
      title,
      start: new Date(lesson.startTime),
      end: new Date(lesson.endTime),
    };
  }) || [];

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div>
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
