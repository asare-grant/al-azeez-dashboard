// "use client";

// import { useEffect, useState } from "react";

// const FinanceReport = () => {
//   const [data, setData] = useState<any>(null);
//   const [term, setTerm] = useState("FIRST");
//   const [year, setYear] = useState("2024/2025");

//   useEffect(() => {
//     fetch(`/api/fees/report?term=${term}&academicYear=${year}`)
//       .then((res) => res.json())
//       .then(setData);
//   }, [term, year]);

//   if (!data) return null;

//   return (
//     <div className="bg-white p-4 rounded-md border">
//       <h3 className="font-semibold mb-4">Finance Report</h3>

//       <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
//         <Stat label="Expected" value={data.totalFees} />
//         <Stat label="Collected" value={data.totalPaid} />
//         <Stat label="Outstanding" value={data.outstanding} />
//         <Stat label="Collection %" value={`${data.collectionRate}%`} />
//       </div>

//       <h4 className="font-medium mb-2">Students Owing</h4>

//       <table className="w-full text-sm">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 text-left">Student</th>
//             <th className="p-2 text-left">Balance</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.studentsOwing.map((s: any, i: number) => (
//             <tr key={i} className="border-t">
//               <td className="p-2">{s.student}</td>
//               <td className="p-2 text-red-600">
//                 GHS {s.balance.toFixed(2)}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const Stat = ({ label, value }: any) => (
//   <div>
//     <p className="text-gray-500">{label}</p>
//     <p className="font-semibold">GHS {value}</p>
//   </div>
// );

// export default FinanceReport;



"use client";

import { useEffect, useState } from "react";
import FinancePagination from "./../FinanceReportPagination";

const FinanceReport = () => {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [term, setTerm] = useState("FIRST");
  const [year, setYear] = useState("2024/2025");

  // Fetch paginated report
  useEffect(() => {
    const params = new URLSearchParams({
      term,
      academicYear: year,
      page: page.toString(),
      limit: limit.toString(),
    });

    fetch(`/api/fees/report?${params.toString()}`)
      .then((res) => res.json())
      .then(setData);
  }, [term, year, page, limit]);

  if (!data) return null;

  return (
    <div className="bg-white p-4 rounded-md border">
      <h3 className="font-semibold mb-4">Finance Report</h3>

      <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
        <Stat label="Expected" value={data.totalFees} />
        <Stat label="Collected" value={data.totalPaid} />
        <Stat label="Outstanding" value={data.outstanding} />
        <Stat label="Collection %" value={`${data.collectionRate}%`} />
      </div>

      <h4 className="font-medium mb-2">Students Owing</h4>

      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Student</th>
            <th className="p-2 text-left">Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.studentsOwing.map((s: any, i: number) => (
            <tr key={i} className="border-t">
              <td className="p-2">{s.student}</td>
              <td className="p-2 text-red-600">
                GHS {s.balance.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <FinancePagination
        page={page}
        limit={limit}
        count={data.totalStudents}
        onPageChange={setPage} // updates local state
        onLimitChange={(l) => { setLimit(l); setPage(1); }} // reset page
      />
    </div>
  );
};

const Stat = ({ label, value }: any) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-semibold">GHS {value}</p>
  </div>
);

export default FinanceReport;
