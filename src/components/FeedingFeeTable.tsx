// "use client";

// import { useEffect, useMemo, useState } from "react";
// import moment from "moment";
// import Link from "next/link";
// import { AgGridReact } from "ag-grid-react";
// import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
// import "@/lib/agGridConfig";
// import GradeSelect from "./GradeSelect";
// import { MonthSelection } from "./MonthSelection";
// import { Button } from "./ui/button";
// import GlobalApi from "@/lib/GlobalApi";
// import { toast } from "react-toastify";

// type FeedingFeePayment = {
//   id: number;
//   studentId: string;
//   date: string;
//   amount: number;
//   day: number;
// };

// type RowDataType = {
//   studentId: string;
//   name: string;
//   [key: string]: string | number;
// };

// type StudentLite = {
//   id: string;
//   name: string;
//   surname: string;
//   classId: number;
//   boardingType: string;
// };

// type ClassLite = {
//   id: number;
//   name: string;
// };

// interface Props {
//   students: StudentLite[];
//   classes: ClassLite[];
//   feedingStudents: { studentId: string }[];
// }

// export default function FeedingFeeTable({
//   students,
//   classes,
//   feedingStudents,
// }: Props) {
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date());
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [payments, setPayments] = useState<FeedingFeePayment[]>([]);
//   const [activeStudentIds, setActiveStudentIds] = useState<string[]>(
//     feedingStudents.map((s) => s.studentId),
//   );

//   const getDays = () => {
//     const y = moment(selectedMonth).year();
//     const m = moment(selectedMonth).month();
//     const total = new Date(y, m + 1, 0).getDate();
//     return Array.from({ length: total }, (_, i) => i + 1);
//   };

//   const isSameDay = (a: string, b: Date) => moment(a).isSame(b, "day");

//   const classStudents = useMemo(() => {
//     return students.filter(
//       (s) => !selectedClass || s.classId === Number(selectedClass),
//     );
//   }, [students, selectedClass]);

//   const feedingListStudents = useMemo(() => {
//     return classStudents.filter((s) => activeStudentIds.includes(s.id));
//   }, [classStudents, activeStudentIds]);

//   const fetchPayments = async () => {
//     const month = moment(selectedMonth).format("MM/YYYY");
//     const data: FeedingFeePayment[] = await GlobalApi.GetFeedingFeeList(
//       selectedClass,
//       month,
//     );
//     setPayments(data ?? []);
//   };

//   useEffect(() => {
//     fetchPayments();
//   }, [selectedClass, selectedMonth]);

//   const addStudentToFeeding = async () => {
//     if (!selectedStudent) {
//       toast.error("Please select a student");
//       return;
//     }

//     await GlobalApi.AddFeedingFeeStudent(selectedStudent);

//     setActiveStudentIds((prev) =>
//       prev.includes(selectedStudent) ? prev : [...prev, selectedStudent],
//     );

//     setSelectedStudent("");
//     toast.success("Student added to feeding fee list");
//   };

//   const columnDefs = useMemo<ColDef<RowDataType>[]>(() => {
//     const days = getDays();

//     return [
//       {
//         headerName: "Name",
//         field: "name",
//         width: 220,
//         minWidth: 180,
//         pinned: "left",
//         lockPinned: true,
//         cellClass: "font-semibold bg-white",
//         headerClass: "bg-gray-50 font-semibold text-blue-400",
//       },
//       ...days.map((day) => {
//         const field = String(day);

//         return {
//           headerName: field,
//           field,
//           width: 85,
//           minWidth: 85,
//           editable: true,
//           valueParser: (params) => Number(params.newValue || 0),
//           cellClass: "text-center",
//         } as ColDef<RowDataType>;
//       }),
//     ];
//   }, [selectedMonth]);

//   const onCellValueChanged = async (e: CellValueChangedEvent<RowDataType>) => {
//     if (!e.data) return;

//     const day = Number(e.colDef.field);
//     const amount = Number(e.newValue || 0);

//     const date = new Date(
//       moment(selectedMonth).year(),
//       moment(selectedMonth).month(),
//       day,
//     );

//     try {
//       const saved = await GlobalApi.UpsertFeedingFee({
//         studentId: e.data.studentId,
//         date: date.toISOString(),
//         day,
//         amount,
//       });

//       setPayments((prev) => {
//         const others = prev.filter(
//           (p) =>
//             !(
//               p.studentId === saved.studentId &&
//               isSameDay(p.date, new Date(saved.date))
//             ),
//         );

//         return [...others, saved];
//       });

//       toast.success(`${e.data.name} paid GHS ${amount}`);
//     } catch {
//       toast.error("Failed to save feeding fee");
//       e.node?.setDataValue(e.colDef.field!, e.oldValue);
//     }
//   };

//   const rowData = useMemo<RowDataType[]>(() => {
//     const days = getDays();

//     return feedingListStudents.map((s) => {
//       const row: RowDataType = {
//         studentId: s.id,
//         name: `${s.name} ${s.surname}`,
//       };

//       days.forEach((day) => {
//         const record = payments.find(
//           (p) =>
//             p.studentId === s.id &&
//             isSameDay(
//               p.date,
//               new Date(
//                 moment(selectedMonth).year(),
//                 moment(selectedMonth).month(),
//                 day,
//               ),
//             ),
//         );

//         row[day] = record?.amount ?? "";
//       });

//       return row;
//     });
//   }, [payments, feedingListStudents, selectedMonth]);

//   const totalPerDay = useMemo(() => {
//     const totals: Record<number, number> = {};

//     getDays().forEach((day) => {
//       totals[day] = payments
//         .filter(
//           (p) =>
//             p.day === day &&
//             feedingListStudents.some((s) => s.id === p.studentId),
//         )
//         .reduce((sum, p) => sum + Number(p.amount), 0);
//     });

//     return totals;
//   }, [payments, feedingListStudents, selectedMonth]);

//   return (
//     <div>
//       <div className="my-6 flex flex-col gap-4 rounded-lg border p-5">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
//           <MonthSelection
//             value={selectedMonth}
//             onSelectMonth={setSelectedMonth}
//           />

//           <GradeSelect
//             classes={classes}
//             value={selectedClass}
//             onSelect={setSelectedClass}
//           />

//           <Button onClick={fetchPayments}>Search</Button>

//           <Link
//             href="/list/feeding-fees/dashboard"
//             className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
//           >
//             Dashboard
//           </Link>
//         </div>

//         <div className="flex flex-col gap-3 rounded-md bg-gray-50 p-4 sm:flex-row sm:items-center">
//           <select
//             value={selectedStudent}
//             onChange={(e) => setSelectedStudent(e.target.value)}
//             className="rounded-md border p-2 text-sm"
//           >
//             <option value="">Select day student</option>

//             {classStudents
//               .filter((s) => !activeStudentIds.includes(s.id))
//               .map((s) => (
//                 <option key={s.id} value={s.id}>
//                   {s.name} {s.surname}
//                 </option>
//               ))}
//           </select>

//           <Button onClick={addStudentToFeeding}>Add Student</Button>
//         </div>
//       </div>

//       <div className="w-full overflow-hidden rounded-lg border" style={{ height: 520 }}>
//         <AgGridReact<RowDataType>
//           rowData={rowData}
//           columnDefs={columnDefs}
//           onCellValueChanged={onCellValueChanged}
//         />
//       </div>

//       <div className="mt-4 rounded-lg bg-gray-50 p-3">
//         <h3 className="mb-2 font-semibold">Total Feeding Fee per Day:</h3>

//         <div className="flex flex-wrap gap-2">
//           {Object.entries(totalPerDay).map(([day, amount]) => (
//             <span
//               key={day}
//               className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-400"
//             >
//               Day {day}:{" "}
//               <span className="text-blue-800">GHS {amount.toFixed(2)}</span>
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
// import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, CellValueChangedEvent } from "ag-grid-community";
import "@/lib/agGridConfig";
import GradeSelect from "./GradeSelect";
import { MonthSelection } from "./MonthSelection";
import { Button } from "./ui/button";
import GlobalApi from "@/lib/GlobalApi";
import { toast } from "react-toastify";

type FeedingFeePayment = {
  id: number;
  studentId: string;
  date: string;
  amount: number;
  day: number;
};

type RowDataType = {
  studentId: string;
  name: string;
  [key: string]: string | number;
};

type StudentLite = {
  id: string;
  name: string;
  surname: string;
  classId: number;
  boardingType: string;
};

type ClassLite = {
  id: number;
  name: string;
};

export default function FeedingFeeTable({
  students,
  classes,
  feedingStudents,
}: {
  students: StudentLite[];
  classes: ClassLite[];
  feedingStudents: { studentId: string }[];
}) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState("");
  const [payments, setPayments] = useState<FeedingFeePayment[]>([]);
  const [activeStudentIds, setActiveStudentIds] = useState(
    feedingStudents.map((s) => s.studentId)
  );

  const getDays = () => {
    const y = moment(selectedMonth).year();
    const m = moment(selectedMonth).month();
    const total = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
  };

  const isSameDay = (a: string, b: Date) => moment(a).isSame(b, "day");

  const classStudents = useMemo(() => {
    return students.filter(
      (s) => !selectedClass || s.classId === Number(selectedClass)
    );
  }, [students, selectedClass]);

  const feedingListStudents = useMemo(() => {
    return classStudents.filter((s) => activeStudentIds.includes(s.id));
  }, [classStudents, activeStudentIds]);

  const fetchPayments = async () => {
    const month = moment(selectedMonth).format("MM/YYYY");
    const data = await GlobalApi.GetFeedingFeeList(selectedClass, month);
    setPayments(data ?? []);
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedClass, selectedMonth]);

  const addStudentToFeeding = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    await GlobalApi.AddFeedingFeeStudent(selectedStudent);

    setActiveStudentIds((prev) =>
      prev.includes(selectedStudent) ? prev : [...prev, selectedStudent]
    );

    setSelectedStudent("");
    toast.success("Student added to feeding fee list");
  };

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
        headerClass: "bg-gray-50 font-semibold text-blue-500",
      },
      ...days.map((day) => {
        const field = String(day);

        return {
          headerName: field,
          field,
          width: 80,
          minWidth: 80,
          editable: true,
          valueParser: (params) => Number(params.newValue || 0),
          cellClass: "text-center",
        } as ColDef<RowDataType>;
      }),
    ];
 }, [selectedMonth]);

  const onCellValueChanged = async (e: CellValueChangedEvent<RowDataType>) => {
    if (!e.data) return;

    const day = Number(e.colDef.field);
    const amount = Number(e.newValue || 0);

    const date = new Date(
      moment(selectedMonth).year(),
      moment(selectedMonth).month(),
      day
    );

    try {
      const saved = await GlobalApi.UpsertFeedingFee({
        studentId: e.data.studentId,
        date: date.toISOString(),
        day,
        amount,
      });

      setPayments((prev) => {
        const others = prev.filter(
          (p) =>
            !(
              p.studentId === saved.studentId &&
              isSameDay(p.date, new Date(saved.date))
            )
        );

        return [...others, saved];
      });

      toast.success(`${e.data.name} paid GHS ${amount}`);
    } catch {
      toast.error("Failed to save feeding fee");
      e.node?.setDataValue(e.colDef.field!, e.oldValue);
    }
  };

  const rowData = useMemo<RowDataType[]>(() => {
    const days = getDays();

    return feedingListStudents.map((s) => {
      const row: RowDataType = {
        studentId: s.id,
        name: `${s.name} ${s.surname}`,
      };

      days.forEach((day) => {
        const record = payments.find(
          (p) =>
            p.studentId === s.id &&
            isSameDay(
              p.date,
              new Date(
                moment(selectedMonth).year(),
                moment(selectedMonth).month(),
                day
              )
            )
        );

        row[day] = record?.amount ?? "";
      });

      return row;
    });
  }, [payments, feedingListStudents, selectedMonth]);

  const totalPerDay = useMemo(() => {
    const totals: Record<number, number> = {};

    getDays().forEach((day) => {
      totals[day] = payments
        .filter(
          (p) =>
            p.day === day &&
            feedingListStudents.some((s) => s.id === p.studentId)
        )
        .reduce((sum, p) => sum + Number(p.amount), 0);
    });

    return totals;
  }, [payments, feedingListStudents, selectedMonth]);

  return (
    <div>
      <div className="my-6 flex flex-col gap-4 rounded-lg border p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <MonthSelection value={selectedMonth} onSelectMonth={setSelectedMonth} />

          <GradeSelect
            classes={classes}
            value={selectedClass}
            onSelect={setSelectedClass}
          />

          <Button onClick={fetchPayments}>Search</Button>

          {/* <Link
            href="/list/feeding-fees/dashboard"
            className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
          >
            Dashboard
          </Link> */}
        </div>

        <div className="flex flex-col gap-3 rounded-md bg-gray-50 p-4 sm:flex-row sm:items-center">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="rounded-md border p-2 text-sm"
          >
            <option value="">Select day student</option>
            {classStudents
              .filter((s) => !activeStudentIds.includes(s.id))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.surname}
                </option>
              ))}
          </select>

          <Button onClick={addStudentToFeeding}>Add Student</Button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border" style={{ height: 520 }}>
        <AgGridReact<RowDataType>
          rowData={rowData}
          columnDefs={columnDefs}
          onCellValueChanged={onCellValueChanged}
        />
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <h3 className="mb-2 font-semibold">Total Feeding Fee per Day:</h3>

        <div className="flex flex-wrap gap-2">
          {Object.entries(totalPerDay).map(([day, amount]) => (
            <span
              key={day}
              className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-400"
            >
              Day {day}:{" "}
              <span className="text-blue-800">GHS {amount.toFixed(2)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}