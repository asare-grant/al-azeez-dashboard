// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { MonthSelection } from "./MonthSelection";
// import GradeSelect from "./GradeSelect";
// import axios from "axios";

// interface ClassLite {
//   id: number;
//   name: string;
// }

// interface FinanceRecord {
//   month: string;
//   paid: number;
//   balance: number;
// }

// interface Props {
//   classes: ClassLite[];
// }

// const FinanceChart = ({ classes }: Props) => {
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(new Date());
//   const [data, setData] = useState<FinanceRecord[]>([]);

//   const fetchFinance = async () => {
//     try {
//       const monthParam = selectedMonth.toISOString();
//       const res = await axios.get("/api/finance", {
//         params: { classId: selectedClass, month: monthParam },
//       });
//       setData(res.data);
//     } catch (error) {
//       console.error("Failed to fetch finance data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchFinance();
//   }, [selectedClass, selectedMonth]);

//   return (
//     <div className="bg-white rounded-xl w-full h-full p-4 flex flex-col gap-4">
//       <div className="flex justify-between items-center">
//         <h1 className="text-lg font-semibold">Finance</h1>
//         <Image src="/moreDark.png" alt="" width={20} height={20} />
//       </div>

//       {/* Filters */}
//       <div className="flex gap-4 mb-4">
//         <MonthSelection value={selectedMonth} onSelectMonth={setSelectedMonth} />
//         <GradeSelect
//           classes={classes}
//           value={selectedClass}
//           onSelect={setSelectedClass}
//         />
//       </div>

//       <ResponsiveContainer width="100%" height="80%">
//         <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
//           <XAxis dataKey="month" axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
//           <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
//           <Tooltip />
//           <Legend align="center" verticalAlign="top" wrapperStyle={{ paddingTop: "10px" }} />
//           <Line type="monotone" dataKey="paid" stroke="#C3EBFA" strokeWidth={4} />
//           <Line type="monotone" dataKey="balance" stroke="#CFCEFF" strokeWidth={4} />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default FinanceChart;



"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { MonthSelection } from "./MonthSelection";
import GradeSelect from "./GradeSelect";
import axios from "axios";

interface ClassLite {
  id: number;
  name: string;
}

interface FinanceRecord {
  month: string;
  paid: number;
  balance: number;
}

interface Props {
  classes: ClassLite[];
}

const FinanceChart = ({ classes }: Props) => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [data, setData] = useState<FinanceRecord[]>([]);

  const fetchFinance = async () => {
    try {
      const monthParam = selectedMonth ? selectedMonth.toISOString() : undefined;
      const res = await axios.get("/api/finance", {
        params: { classId: selectedClass, month: monthParam },
      });
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch finance data:", error);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [selectedClass, selectedMonth]);

  return (
    <div className="bg-white rounded-xl w-full h-full p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Finance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <MonthSelection value={selectedMonth} onSelectMonth={setSelectedMonth} />
        <GradeSelect
          classes={classes}
          value={selectedClass}
          onSelect={setSelectedClass}
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tick={{ fill: "#bbb" }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#bbb" }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toLocaleString("en-US", { style: "currency", currency: "USD" }),
              name.charAt(0).toUpperCase() + name.slice(1),
            ]}
          />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: 10 }}
          />
          {/* Stacked Bars */}
          <Bar dataKey="paid" stackId="a" fill="#C3EBFA" radius={[10, 10, 0, 0]} />
          <Bar dataKey="balance" stackId="a" fill="#CFCEFF" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinanceChart;
