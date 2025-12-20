import { EventProps } from "react-big-calendar";
import { CalendarLessonEvent } from "./types/calendar";

const CalendarEvent = ({
  event,
}: EventProps<CalendarLessonEvent>) => {
  return (
    <div className="flex flex-col">
      {/* TIME */}
      {/* <div className="text-[11px] font-semibold text-gray-700">
        {event.start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        –{" "}
        {event.end.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div> */}

      {/* TITLE */}
      <div className="text-[12px] font-medium text-gray-900 truncate">
        {event.title}
      </div>
    </div>
  );
};

export default CalendarEvent;
