// "use client";

// import { useEffect, useState } from "react";
// import GradeSelect from "./GradeSelect";
// import { MonthSelection } from "./MonthSelection";
// import { Button } from "./ui/button";
// import moment from "moment";
// import "@/lib/agGridConfig";
// import { AgGridReact } from "ag-grid-react";
// import GlobalApi from "@/lib/GlobalApi";
// import { toast } from "react-toastify";

// type AttendanceRecord = {
//   id: number; // Prisma auto-increment Int
//   studentId: string;
//   date: string | Date;
//   present: boolean;
//   day: number;
// };

// type RowDataType = {
//   studentId: string;
//   name: string;
//   [key: number]: boolean; // dynamic day columns
// };

// interface AttendanceTableProps {
//   students: { id: string; name: string; classId: number }[];
//   classes: { id: number; name: string }[];
// }

// const AttendanceTable = ({ students, classes }: AttendanceTableProps) => {
//   const [selectedClass, setSelectedClass] = useState<string>("");
//   const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

//   const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
//   const [rowData, setRowData] = useState<RowDataType[]>([]);
//   const [columnDefs, setColumnDefs] = useState<any[]>([
//     // { headerName: "Student ID", field: "studentId", width: 120 },
//     { headerName: "Name", field: "name", width: 200 },
//   ]);

//   // FILTER STUDENTS BY CLASS
//   const filteredStudents = students.filter(
//     (s) => !selectedClass || s.classId === Number(selectedClass)
//   );

//   // GET DAYS IN SELECTED MONTH
//   const getDays = (): number[] => {
//     if (!selectedMonth) return [];
//     const year = moment(selectedMonth).year();
//     const month = moment(selectedMonth).month();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     return Array.from({ length: daysInMonth }, (_, i) => i + 1);
//   };

//   // FETCH ATTENDANCE DATA
//   const onSearchHandler = async () => {
//     if (!selectedClass || !selectedMonth) return;

//     const month = moment(selectedMonth).format("MM/YYYY");
//     const res = await GlobalApi.GetAttendanceList(selectedClass, month);
//     setAttendance(res.data || []);
//   };

//   // BUILD ROW DATA FOR GRID
//   useEffect(() => {
//     const days = getDays();

//     const rows: RowDataType[] = filteredStudents.map((s) => {
//       const row: RowDataType = { studentId: s.id, name: s.name };
//       days.forEach((d) => {
//         const att = attendance.find(
//           (a) => a.studentId === s.id && new Date(a.date).getDate() === d // day of the month
//         );
//         row[d] = att ? att.present : false;
//       });
//       return row;
//     });

//     setRowData(rows);
//   }, [attendance, filteredStudents, selectedMonth]);

//   // BUILD COLUMN DEFINITIONS
//   useEffect(() => {
//     const days = getDays();
//     const dynamicCols = days.map((d) => ({
//       headerName: d.toString(),
//       field: d.toString(),
//       editable: true,
//       width: 50,
//       cellEditor: "agCheckboxCellEditor",
//     }));
//     setColumnDefs([
//       // { headerName: "Student ID", field: "studentId", width: 120 },
//       { headerName: "Name", field: "name", width: 200 },
//       ...dynamicCols,
//     ]);
//   }, [selectedMonth]);

//   // At the top of the component
//   useEffect(() => {
//     if (selectedClass && selectedMonth) {
//       onSearchHandler();
//     }
//   }, [selectedClass, selectedMonth]);

//   // HANDLE CELL CHANGE (CREATE/UPDATE ATTENDANCE)
//   const onCellValueChanged = async (params: any) => {
//     const { data, colDef, newValue } = params;
//     const day = Number(colDef.field);
//     if (!selectedMonth || !day) return;

//     // Sanitize studentId
//     const studentId = String(data.studentId).replace(/\0/g, "").trim();
//     const date = new Date(
//       moment(selectedMonth).year(),
//       moment(selectedMonth).month(),
//       day
//     );

//     // Find existing attendance for this student & day
//     const existing = attendance.find(
//       (a) => a.studentId === studentId && new Date(a.date).getDate() === day
//     );

//     try {
//       if (!existing) {
//         await GlobalApi.CreateAttendance({
//           studentId,
//           date,
//           day,
//           present: Boolean(newValue),
//         });
//       } else {
//         await GlobalApi.UpdateAttendance({
//           id: existing.id,
//           studentId,
//           date,
//           day,
//           present: Boolean(newValue),
//         });
//       }

//       // Show toast
//       if (newValue) {
//         toast.success(`${data.name} has been marked present`);
//       } else {
//         toast.info(`${data.name} has been marked absent`);
//       }

//       // Refresh list
//       onSearchHandler();
//     } catch (err) {
//       console.error("Error saving attendance:", err);
//     }
//   };
//   // const onCellValueChanged = async (params: any) => {
//   //   const { data, colDef, newValue } = params;
//   //   const day = Number(colDef.field);
//   //   if (!selectedMonth || !day) return;

//   //   const studentId = data.studentId;
//   //   const date = moment(selectedMonth).date(day).toDate();

//   //   // Check if attendance exists
//   //   const existing = attendance.find(
//   //     (a) => a.studentId === studentId && new Date(a.date).getDate() === day
//   //   );

//   //   try {
//   //     if (!existing) {
//   //       await GlobalApi.CreateAttendance({ studentId, date, day, present: newValue });
//   //     } else {
//   //       await GlobalApi.UpdateAttendance({
//   //         id: existing.id,
//   //         studentId,
//   //         date,
//   //         day,
//   //         present: newValue,
//   //       });
//   //     }

//   //     // Refresh list
//   //     onSearchHandler();
//   //   } catch (err) {
//   //     console.error("Error saving attendance:", err);
//   //   }
//   // };

//   return (
//     <div>
//       {/* FILTER SECTION */}
//       <div className="flex gap-4 flex-col lg:flex-row my-6 p-5 shadow-sm border rounded-lg">
//         <div className="flex  gap-2 items-center text-gray-600">
//           <label>Select Month:</label>
//           <MonthSelection
//             value={selectedMonth}
//             onSelectMonth={setSelectedMonth}
//           />
//         </div>

//         <div className="flex gap-2 items-center text-gray-600">
//           <label>Select Class:</label>
//           <GradeSelect
//             classes={classes}
//             value={selectedClass}
//             onSelect={setSelectedClass}
//           />
//         </div>

//         <Button
//           onClick={onSearchHandler}
//           className="bg-blue-500 text-white max-w-fit"
//         >
//           Search
//         </Button>
//       </div>

//       {/* ATTENDANCE GRID */}
//       <div style={{ height: 500 }}>
//         <AgGridReact
//           rowData={rowData}
//           columnDefs={columnDefs}
//           onCellValueChanged={onCellValueChanged}
//         />
//       </div>
//     </div>
//   );
// };

// export default AttendanceTable;




// "use client";

// import { useEffect, useState, useMemo } from "react";
// import GradeSelect from "./GradeSelect";
// import { MonthSelection } from "./MonthSelection";
// import { Button } from "./ui/button";
// import moment from "moment";
// import "@/lib/agGridConfig";
// import { AgGridReact } from "ag-grid-react";
// import type { ColDef } from "ag-grid-community";
// import GlobalApi from "@/lib/GlobalApi";
// import { toast } from "react-toastify";

// /* ---------------- TYPES ---------------- */

// type AttendanceRecord = {
//   id: number;
//   studentId: string;
//   date: string | Date;
//   present: boolean;
//   day: number;
// };

// type RowDataType = {
//   studentId: string;
//   name: string;
//   [key: number]: boolean;
// };

// interface AttendanceTableProps {
//   students: { id: string; name: string; classId: number }[];
//   classes: { id: number; name: string }[];
// }

// /* ---------------- COMPONENT ---------------- */

// export default function AttendanceTable({
//   students,
//   classes,
// }: AttendanceTableProps) {
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
//   const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

//   /* ---------------- HELPERS ---------------- */

//   const isSameDate = (a: Date | string, b: Date) => {
//     const d = new Date(a);
//     return (
//       d.getFullYear() === b.getFullYear() &&
//       d.getMonth() === b.getMonth() &&
//       d.getDate() === b.getDate()
//     );
//   };

//   const getDays = () => {
//     const y = moment(selectedMonth).year();
//     const m = moment(selectedMonth).month();
//     const total = new Date(y, m + 1, 0).getDate();
//     return Array.from({ length: total }, (_, i) => i + 1);
//   };

//   /* ---------------- DATA ---------------- */

//   const filteredStudents = useMemo(
//     () =>
//       students.filter(
//         (s) => !selectedClass || s.classId === Number(selectedClass)
//       ),
//     [students, selectedClass]
//   );

//   const fetchAttendance = async () => {
//     if (!selectedClass) return;
//     const month = moment(selectedMonth).format("MM/YYYY");
//     const res = await GlobalApi.GetAttendanceList(selectedClass, month);
//     setAttendance(res.data || []);
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, [selectedClass, selectedMonth]);

//   /* ---------------- GRID ---------------- */

//   const columnDefs = useMemo<ColDef<RowDataType>[]>(() => {
//     const days = getDays();

//     return [
//       {
//         headerName: "Name",
//         field: "name",
//         width: 220,
//       },
//       ...days.map((day): ColDef<RowDataType> => ({
//         headerName: String(day),
//         field: String(day) as any,
//         width: 55,
//         editable: true,
//         cellRenderer: "agCheckboxCellRenderer",

//         valueSetter: (params) => {
//           const newValue = params.newValue === true;
//           const oldValue = params.oldValue === true;

//           if (newValue === oldValue) return false;

//           const studentId = params.data.studentId;
//           const date = new Date(
//             moment(selectedMonth).year(),
//             moment(selectedMonth).month(),
//             day
//           );

//           const existing = attendance.find(
//             (a) => a.studentId === studentId && isSameDate(a.date, date)
//           );

//           // optimistic UI update
//           params.data[params.colDef.field as any] = newValue;

//           (async () => {
//             try {
//               let saved: AttendanceRecord;

//               if (!existing) {
//                 saved = await GlobalApi.CreateAttendance({
//                   studentId,
//                   date: date.toISOString(),
//                   day,
//                   present: newValue,
//                 });
//                 setAttendance((prev) => [...prev, saved]);
//               } else {
//                 saved = await GlobalApi.UpdateAttendance({
//                   id: existing.id,
//                   present: newValue,
//                 });
//                 setAttendance((prev) =>
//                   prev.map((a) => (a.id === existing.id ? saved : a))
//                 );
//               }

//               toast.success(
//                 `${params.data.name} marked ${
//                   newValue ? "present" : "absent"
//                 }`
//               );
//             } catch (err) {
//               console.error(err);
//               toast.error("Failed to save attendance");

//               // rollback
//               params.node?.setDataValue(
//                 params.colDef.field!,
//                 oldValue
//               );
//             }
//           })();

//           return true;
//         },
//       })),
//     ];
//   }, [attendance, selectedMonth]);

//   const rowData = useMemo<RowDataType[]>(() => {
//     const days = getDays();

//     return filteredStudents.map((s) => {
//       const row: RowDataType = {
//         studentId: s.id,
//         name: s.name,
//       };

//       days.forEach((d) => {
//         const record = attendance.find(
//           (a) =>
//             a.studentId === s.id &&
//             isSameDate(
//               a.date,
//               new Date(
//                 moment(selectedMonth).year(),
//                 moment(selectedMonth).month(),
//                 d
//               )
//             )
//         );
//         row[d] = record?.present ?? false;
//       });

//       return row;
//     });
//   }, [filteredStudents, attendance, selectedMonth]);

//   /* ---------------- UI ---------------- */

//   return (
//     <div>
//       <div className="flex gap-4 flex-col lg:flex-row my-6 p-5 shadow-sm border rounded-lg">
//         <MonthSelection value={selectedMonth} onSelectMonth={setSelectedMonth} />
//         <GradeSelect
//           classes={classes}
//           value={selectedClass}
//           onSelect={setSelectedClass}
//         />
//         <Button onClick={fetchAttendance}>Search</Button>
//       </div>

//       <div style={{ height: 520 }}>
//         <AgGridReact
//           rowData={rowData}
//           columnDefs={columnDefs}
//           stopEditingWhenCellsLoseFocus
//         />
//       </div>
//     </div>
//   );
// }





// "use client";

// import { useEffect, useMemo, useState } from "react";
// import moment from "moment";
// import { AgGridReact } from "ag-grid-react";
// import type {
//   ColDef,
//   CellValueChangedEvent,
//   RowStyle
// } from "ag-grid-community";
// import "@/lib/agGridConfig";
// import GradeSelect from "./GradeSelect";
// import { MonthSelection } from "./MonthSelection";
// import { Button } from "./ui/button";
// import GlobalApi from "@/lib/GlobalApi";
// import { toast } from "react-toastify";

// /* ---------------- TYPES ---------------- */

// type AttendanceRecord = {
//   id: number;
//   studentId: string;
//   date: string;
//   present: boolean;
//   day: number;
// };

// type RowDataType = {
//   studentId: string;
//   name: string;
//   [key: number]: boolean | number | string;
// };

// type StudentLite = {
//   id: string;
//   name: string;
//   classId: number;
// };

// type ClassLite = {
//   id: number;
//   name: string;
//   supervisorId: string | null;
// };

// interface Props {
//   students: StudentLite[];
//   classes: ClassLite[];
//   role: "admin" | "teacher";
//   userId: string;
// }

// /* ---------------- COMPONENT ---------------- */

// export default function AttendanceTable({
//   students,
//   classes,
//   role,
//   userId,
// }: Props) {
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date());
//   const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

//   /* ---------------- PERMISSIONS ---------------- */

//   const canEdit = useMemo(() => {
//     if (role === "admin") return true;
//     const cls = classes.find((c) => c.id === Number(selectedClass));
//     return cls?.supervisorId === userId;
//   }, [role, userId, selectedClass, classes]);

//   /* ---------------- HELPERS ---------------- */

//   const getDays = () => {
//     const y = moment(selectedMonth).year();
//     const m = moment(selectedMonth).month();
//     const total = new Date(y, m + 1, 0).getDate();
//     return Array.from({ length: total }, (_, i) => i + 1);
//   };

//   const sameDate = (a: string, b: Date) =>
//     moment(a).isSame(b, "day");

//   /* ---------------- DATA ---------------- */

//   const filteredStudents = useMemo(
//     () =>
//       students.filter(
//         (s) => !selectedClass || s.classId === Number(selectedClass)
//       ),
//     [students, selectedClass]
//   );

//   const fetchAttendance = async () => {
//     if (!selectedClass) return;
//     const month = moment(selectedMonth).format("MM/YYYY");
//     const res = await GlobalApi.GetAttendanceList(selectedClass, month);
//     setAttendance(res.data ?? []);
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, [selectedClass, selectedMonth]);

//   /* ---------------- GRID COLUMNS ---------------- */

//   const columnDefs = useMemo<ColDef<RowDataType>[]>(() => {
//     const days = getDays();

//     return [
//       { headerName: "Name", field: "name", width: 220 },
//       ...days.map((day) => {
//         const date = new Date(
//           moment(selectedMonth).year(),
//           moment(selectedMonth).month(),
//           day
//         );

//         const isWeekend = [0, 6].includes(moment(date).day());

//         return {
//           headerName: String(day),
//           field: String(day),
//           width: 55,
//           editable: canEdit && !isWeekend,
//           cellRenderer: "agCheckboxCellRenderer",
//           cellClass: isWeekend
//             ? "bg-gray-100 cursor-not-allowed"
//             : "",
//         } as ColDef<RowDataType>;
//       }),
//     ];
//   }, [selectedMonth, canEdit]);

//   /* ---------------- CELL UPDATE ---------------- */

//   const onCellValueChanged = async (
//     e: CellValueChangedEvent<RowDataType>
//   ) => {
//     if (!e.data) return; // ✅ TS-safe guard

//     if (!canEdit) {
//       toast.error("You are not allowed to edit this class");
//       e.node?.setDataValue(e.colDef.field!, e.oldValue);
//       return;
//     }

//     const day = Number(e.colDef.field);
//     const present = Boolean(e.newValue);

//     const date = new Date(
//       moment(selectedMonth).year(),
//       moment(selectedMonth).month(),
//       day
//     );

//     const existing = attendance.find(
//       (a) => a.studentId === e.data!.studentId && sameDate(a.date, date)
//     );

//     try {
//       let saved: AttendanceRecord;

//       if (!existing) {
//         saved = await GlobalApi.CreateAttendance({
//           studentId: e.data.studentId,
//           date: date.toISOString(),
//           day,
//           present,
//         });
//         setAttendance((p) => [...p, saved]);
//       } else {
//         saved = await GlobalApi.UpdateAttendance({
//           id: existing.id,
//           present,
//         });
//         setAttendance((p) =>
//           p.map((a) => (a.id === existing.id ? saved : a))
//         );
//       }

//       toast.success(
//         `${e.data.name} marked ${present ? "present" : "absent"}`
//       );
//     } catch {
//       toast.error("Failed to save attendance");
//       e.node?.setDataValue(e.colDef.field!, e.oldValue);
//     }
//   };

//   /* ---------------- ROW DATA + SUMMARY ---------------- */

//   const rowData = useMemo<RowDataType[]>(() => {
//     const days = getDays();

//     const rows = filteredStudents.map((s) => {
//       const row: RowDataType = { studentId: s.id, name: s.name };

//       days.forEach((d) => {
//         const record = attendance.find(
//           (a) =>
//             a.studentId === s.id &&
//             sameDate(
//               a.date,
//               new Date(
//                 moment(selectedMonth).year(),
//                 moment(selectedMonth).month(),
//                 d
//               )
//             )
//         );
//         row[d] = record?.present ?? false;
//       });

//       return row;
//     });

//     const summary: RowDataType = {
//       studentId: "__summary__",
//       name: "TOTAL",
//     };

//     days.forEach((d) => {
//       summary[d] = attendance.filter(
//         (a) =>
//           a.day === d &&
//           a.present &&
//           filteredStudents.some((s) => s.id === a.studentId)
//       ).length;
//     });

//     return [...rows, summary];
//   }, [attendance, filteredStudents, selectedMonth]);

//   /* ---------------- UI ---------------- */

//   return (
//     <div>
//       <div className="flex gap-4 my-6 p-5 border rounded-lg">
//         <MonthSelection value={selectedMonth} onSelectMonth={setSelectedMonth} />
//         <GradeSelect
//           classes={classes}
//           value={selectedClass}
//           onSelect={setSelectedClass}
//         />
//         <Button onClick={fetchAttendance}>Search</Button>
//       </div>

//       <div style={{ height: 520 }}>
//         <AgGridReact<RowDataType>
//           rowData={rowData}
//           columnDefs={columnDefs}
//           onCellValueChanged={onCellValueChanged}
//           getRowStyle={(p): RowStyle | undefined => {
//             if (!p.data) return undefined; // ✅ TS-safe
//             return p.data.studentId === "__summary__"
//               ? { fontWeight: "bold", background: "#f8fafc" }
//               : undefined;
//           }}
//         />
//       </div>
//     </div>
//   );
// }





"use client";

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellValueChangedEvent, RowStyle } from "ag-grid-community";
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

  const isSameDay = (a: string, b: Date) => moment(a).isSame(b, "day");

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s) => !selectedClass || s.classId === Number(selectedClass)
      ),
    [students, selectedClass]
  );

  /* ---------------- FETCH ATTENDANCE ---------------- */

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const month = moment(selectedMonth).format("MM/YYYY");
      const data: AttendanceRecord[] = await GlobalApi.GetAttendanceList(selectedClass, month);
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
          filteredStudents.some((s) => s.id === a.studentId)
      ).length;
    });

    return totals;
  }, [attendance, filteredStudents, selectedMonth]);

  /* ---------------- COLUMN DEFINITIONS ---------------- */

  const columnDefs = useMemo<ColDef<RowDataType>[]>(() => {
    const days = getDays();

    return [
      { headerName: "Name", field: "name", width: 270 },
      ...days.map((day) => {
        const date = new Date(
          moment(selectedMonth).year(),
          moment(selectedMonth).month(),
          day
        );

        const isWeekend = [0, 6].includes(moment(date).day());
        const field = String(day);

        return {
          headerName: field,
          field,
          width: 55,
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
    const present = Boolean(e.newValue);
    const date = new Date(
      moment(selectedMonth).year(),
      moment(selectedMonth).month(),
      day
    );

    try {
      const saved = await GlobalApi.UpsertAttendance({
        studentId: e.data.studentId,
        date: date.toISOString(),
        day,
        present,
      });

      setAttendance((prev) => {
        const others = prev.filter(
          (a) =>
            !(a.studentId === saved.studentId && isSameDay(a.date, new Date(saved.date)))
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
      const row: RowDataType = { studentId: s.id, name: s.name + " " + s.surname};

      days.forEach((d) => {
        const record = attendance.find(
          (a) =>
            a.studentId === s.id &&
            isSameDay(
              a.date,
              new Date(
                moment(selectedMonth).year(),
                moment(selectedMonth).month(),
                d
              )
            )
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
      <div className="flex gap-4 my-6 p-5 border rounded-lg">
        <MonthSelection value={selectedMonth} onSelectMonth={setSelectedMonth} />
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
          getRowStyle={(p): RowStyle | undefined =>
            undefined // No summary row anymore
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
