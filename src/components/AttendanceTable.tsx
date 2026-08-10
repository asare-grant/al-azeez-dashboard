"use client";

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  CellValueChangedEvent,
  RowStyle,
} from "ag-grid-community";
import "@/lib/agGridConfig";
import GradeSelect from "./GradeSelect";
import { MonthSelection } from "./MonthSelection";
import { Button } from "./ui/button";
import GlobalApi from "@/lib/GlobalApi";
import { toast } from "react-toastify";

/* ---------------- TYPES ---------------- */

type AttendanceRecord = {
  id: number;
  studentId: string;
  date: string;
  present: boolean;
  day: number;
};

type RowDataType = {
  studentId: string;
  name: string;
  [key: string]: boolean | number | string;
};

type StudentLite = {
  id: string;
  name: string;
  surname: string;
  classId: number;
};

type ClassLite = {
  id: number;
  name: string;
  supervisorId: string | null;
};

interface Props {
  students: StudentLite[];
  classes: ClassLite[];
  role: "admin" | "teacher";
  userId: string;
}

/* ---------------- COMPONENT ---------------- */

export default function AttendanceTable({
  students,
  classes,
  role,
  userId,
}: Props) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- PERMISSIONS ---------------- */

  const canEdit = useMemo(() => {
    if (role === "admin") return true;
    const cls = classes.find((c) => c.id === Number(selectedClass));
    return cls?.supervisorId === userId;
  }, [role, userId, selectedClass, classes]);

  /* ---------------- HELPERS ---------------- */

  const getDays = () => {
    const y = moment(selectedMonth).year();
    const m = moment(selectedMonth).month();
    const total = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
  };

  const isSameDay = (attendanceDate: string, calendarDate: Date) => {
    const savedDate = moment.utc(attendanceDate).format("YYYY-MM-DD");

    const selectedDate = moment(calendarDate).format("YYYY-MM-DD");

    return savedDate === selectedDate;
  };

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s) => !selectedClass || s.classId === Number(selectedClass),
      ),
    [students, selectedClass],
  );

  /* ---------------- FETCH ATTENDANCE ---------------- */

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const month = moment(selectedMonth).format("MM/YYYY");
      const data: AttendanceRecord[] = await GlobalApi.GetAttendanceList(
        selectedClass,
        month,
      );
      setAttendance(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedClass, selectedMonth]);

  /* ---------------- CALCULATE TOTAL ATTENDANCE PER DAY ---------------- */

  const totalAttendancePerDay = useMemo(() => {
    const days = getDays();
    const totals: Record<number, number> = {};

    days.forEach((day) => {
      totals[day] = attendance.filter(
        (a) =>
          a.day === day &&
          a.present &&
          filteredStudents.some((s) => s.id === a.studentId),
      ).length;
    });

    return totals;
  }, [attendance, filteredStudents, selectedMonth]);

  /* ---------------- COLUMN DEFINITIONS ---------------- */

  const columnDefs = useMemo<ColDef<RowDataType>[]>(() => {
    const days = getDays();

    return [
      {
        headerName: "Name",
        field: "name",
        width: 220,
        minWidth: 180,
        pinned: "left",
        lockPinned: true,
        cellClass: "font-semibold bg-white",
        headerClass: "bg-gray-50 font-semibold text-blue-400",
      },
      ...days.map((day) => {
        const date = new Date(
          moment(selectedMonth).year(),
          moment(selectedMonth).month(),
          day,
        );

        const isWeekend = [0, 6].includes(moment(date).day());
        const field = String(day);

        return {
          headerName: field,
          field,
          width: 55,
          minWidth: 55,
          editable: (params) => canEdit && !isWeekend,
          cellRenderer: "agCheckboxCellRenderer",
          cellClass: isWeekend ? "bg-gray-100 cursor-not-allowed" : "",
        } as ColDef<RowDataType>;
      }),
    ];
  }, [selectedMonth, canEdit]);

  /* ---------------- CELL VALUE CHANGE ---------------- */

  const onCellValueChanged = async (e: CellValueChangedEvent<RowDataType>) => {
    if (!e.data) return;

    if (!canEdit) {
      toast.error("You are not allowed to edit this class");
      e.node?.setDataValue(e.colDef.field!, e.oldValue);
      return;
    }

    const day = Number(e.colDef.field);
    const present = e.newValue === true;
    const date = new Date(
      moment(selectedMonth).year(),
      moment(selectedMonth).month(),
      day,
    );

    try {
      const attendanceDate = moment({
        year: moment(selectedMonth).year(),

        month: moment(selectedMonth).month(),

        day: day,
      }).format("YYYY-MM-DD");

      const saved = await GlobalApi.UpsertAttendance({
        studentId: e.data.studentId,

        date: attendanceDate,

        day,

        present,
      });
      setAttendance((prev) => {
        const others = prev.filter(
          (a) => !(a.studentId === saved.studentId && a.day === saved.day),
        );

        return [...others, saved];
      });

      toast.success(`${e.data.name} marked ${present ? "present" : "absent"}`);
    } catch {
      toast.error("Failed to save attendance");
      e.node?.setDataValue(e.colDef.field!, e.oldValue);
    }
  };

  /* ---------------- ROW DATA ---------------- */

  const rowData = useMemo<RowDataType[]>(() => {
    const days = getDays();

    return filteredStudents.map((s) => {
      const row: RowDataType = {
        studentId: s.id,
        name: s.name + " " + s.surname,
      };

      days.forEach((d) => {
        const record = attendance.find(
          (a) =>
            a.studentId === s.id &&
            isSameDay(
              a.date,
              new Date(
                moment(selectedMonth).year(),
                moment(selectedMonth).month(),
                d,
              ),
            ),
        );
        row[d] = record?.present ?? false;
      });

      return row;
    });
  }, [attendance, filteredStudents, selectedMonth]);

  /* ---------------- UI ---------------- */

  return (
    <div>
      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 my-6 p-5 border rounded-lg">
        <MonthSelection
          value={selectedMonth}
          onSelectMonth={setSelectedMonth}
        />
        <GradeSelect
          classes={classes}
          value={selectedClass}
          onSelect={setSelectedClass}
        />
        <Button onClick={fetchAttendance}>Search</Button>
      </div>

      {/* ATTENDANCE GRID */}
      <div style={{ height: 520 }}>
        <AgGridReact<RowDataType>
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
          getRowStyle={
            (p): RowStyle | undefined => undefined // No summary row anymore
          }
        />
      </div>

      {/* TOTAL ATTENDANCE PER DAY */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Total Attendance per Day:</h3>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(totalAttendancePerDay).map(([day, count]) => (
            <span
              key={day}
              className="px-2 py-1 bg-blue-100 rounded text-blue-300 font-medium"
            >
              Day {day}: <span className=" text-blue-800 ">{count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
