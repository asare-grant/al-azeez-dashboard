"use client";

import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { CalendarDays } from "lucide-react";
import { addMonths } from "date-fns";
import moment from "moment";
import { Calendar } from "@/components/ui/calendar";

export const MonthSelection = ({ value, onSelectMonth }: any) => {
  const [month, setMonth] = useState(value || addMonths(new Date(), 0));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex gap-2 items-center text-slate-500"
        >
          <CalendarDays className="h-5 w-5" />
          {moment(month).format("MMM yyyy")}
        </Button>
      </PopoverTrigger>

      <PopoverContent>
        <Calendar
          mode="single"
          month={month}
          onMonthChange={(newMonth) => {
            setMonth(newMonth);
            onSelectMonth(newMonth);
          }}
          className="flex flex-1 justify-center"
        />
      </PopoverContent>
    </Popover>
  );
};




// "use client";

// import React, { useState } from "react";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Button } from "./ui/button";
// import { CalendarDays } from "lucide-react";
// import { addMonths } from "date-fns";
// import moment from "moment";
// import { Calendar } from "@/components/ui/calendar";

// export const MonthSelection = ({selectedMonth}: any) => {
//   const today = new Date();
//   const nextMonths = addMonths(new Date(), 0);
//   const [month, setMonth] = useState(nextMonths);

//   return (
//     <div>
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button
//             variant="outline"
//             className="flex gap-2 items-center text-slate-500"
//           >
//             <CalendarDays className="h-5 w-5" />
//             {moment(month).format("MMM yyyy")}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent>
//           <Calendar
//             mode="single"
//             month={month}
//             onMonthChange={(value) => {
//             setMonth(value);
//             selectedMonth && selectedMonth(value);
//           }}
//             className="flex flex-1 justify-center"
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   );
// };
