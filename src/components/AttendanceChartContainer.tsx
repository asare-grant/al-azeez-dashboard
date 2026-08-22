// src/components/AttendanceChartContainer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AttendanceChart from "./AttendanceChart";
import { Button } from "./ui/button";
import GradeSelect from "./GradeSelect";
import { MonthSelection } from "./MonthSelection";
import GlobalApi from "@/lib/GlobalApi";
import moment from "moment";

type ClassLite = {
  id: number;
  name: string;
  supervisorId: string | null;
};

interface AttendanceRecord {
  date: string;
  present: boolean;
}

interface Props {
  classes: ClassLite[];
}

export default function AttendanceChartContainer({ classes }: Props) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Days of the week for display
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Fetch attendance
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const month = moment(selectedMonth).format("MM/YYYY");
      const data: AttendanceRecord[] = await GlobalApi.GetAttendanceList(
        selectedClass,
        month
      );
      setAttendance(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedClass, selectedMonth]);

  // Compute attendance per day
  const chartData = useMemo(() => {
    const map: Record<string, { present: number; absent: number }> = {
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
    };

    attendance.forEach((a) => {
      const dayIndex = moment(a.date).isoWeekday(); // 1 = Mon
      if (dayIndex >= 1 && dayIndex <= 5) {
        const dayName = daysOfWeek[dayIndex - 1];
        if (a.present) map[dayName].present += 1;
        else map[dayName].absent += 1;
      }
    });

    return daysOfWeek.map((day) => ({
      name: day,
      present: map[day].present,
      absent: map[day].absent,
    }));
  }, [attendance]);

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Weekly Attendance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <MonthSelection value={selectedMonth} onSelectMonth={setSelectedMonth} />
        <GradeSelect
          classes={classes}
          value={selectedClass}
          onSelect={setSelectedClass}
        />
        <Button onClick={fetchAttendance} disabled={loading} className="bg-[#CFCEFF] text-gray-700">
          {loading ? "Loading..." : "Search"}
        </Button>
      </div>

      {/* Chart */}
      <AttendanceChart data={chartData} />
    </div>
  );
}
