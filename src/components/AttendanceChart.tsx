// "use client";
// import Image from "next/image";
// import {
//   BarChart,
//   Bar,
//   Rectangle,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const AttendanceChart = ({
//   data,
// }: {
//   data: { name: string; present: number; absent: number }[];
// }) => {
//   return (
//     <ResponsiveContainer width="100%" height="90%">
//       <BarChart width={500} height={300} data={data} barSize={20}>
//         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
//         <XAxis
//           dataKey="name"
//           axisLine={false}
//           tick={{ fill: "#d1d5db" }}
//           tickLine={false}
//         />
//         <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
//         <Tooltip
//           contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
//         />
//         <Legend
//           align="left"
//           verticalAlign="top"
//           wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
//         />
//         <Bar
//           dataKey="present"
//           fill="#FAE27C"
//           legendType="circle"
//           radius={[10, 10, 0, 0]}
//         />
//         <Bar
//           dataKey="absent"
//           fill="#C3EBFA"
//           legendType="circle"
//           radius={[10, 10, 0, 0]}
//         />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// };

// export default AttendanceChart;


"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AttendanceChartProps {
  data: { name: string; present: number; absent: number }[];
}

const AttendanceChart = ({ data }: AttendanceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }} barSize={25}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
        <XAxis dataKey="name" axisLine={false} tick={{ fill: "#ccc" }} tickLine={false} />
        <YAxis axisLine={false} tick={{ fill: "#ccc" }} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, borderColor: "lightgray" }} />
        <Legend
          verticalAlign="top"
          align="left"
          wrapperStyle={{ paddingBottom: 20 }}
        />
        <Bar dataKey="present" fill="#FAE27C" legendType="circle" radius={[10, 10, 0, 0]} />
        <Bar dataKey="absent" fill="#C3EBFA" legendType="circle" radius={[10, 10, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;
