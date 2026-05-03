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



// "use client";

// import { useEffect, useState } from "react";
// import FinancePagination from "./../FinanceReportPagination";

// const FinanceReport = () => {
//   const [data, setData] = useState<any>(null);
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);

//   const [term, setTerm] = useState("FIRST");
//   const [year, setYear] = useState("2024/2025");

//   // Fetch paginated report
//   useEffect(() => {
//     const params = new URLSearchParams({
//       term,
//       academicYear: year,
//       page: page.toString(),
//       limit: limit.toString(),
//     });

//     fetch(`/api/fees/report?${params.toString()}`)
//       .then((res) => res.json())
//       .then(setData);
//   }, [term, year, page, limit]);

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

//       {/* Pagination */}
//       <FinancePagination
//         page={page}
//         limit={limit}
//         count={data.totalStudents}
//         onPageChange={setPage} // updates local state
//         onLimitChange={(l) => { setLimit(l); setPage(1); }} // reset page
//       />
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

  const [term, setTerm] = useState("THIRD");
  const [year, setYear] = useState("2026/2027");

  useEffect(() => {
    const params = new URLSearchParams({
      term,
      academicYear: year,
      page: page.toString(),
      limit: limit.toString(),
    });

    fetch(`/api/fees/report?${params.toString()}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Finance report fetch error:", err));
  }, [term, year, page, limit]);

  return (
    <div className="bg-white p-4 rounded-md border">
      <h3 className="font-semibold mb-4">Finance Report</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <select
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setPage(1);
          }}
          className="border rounded-md p-2"
        >
          <option value="FIRST">First Term</option>
          <option value="SECOND">Second Term</option>
          <option value="THIRD">Third Term</option>
        </select>

        <input
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setPage(1);
          }}
          className="border rounded-md p-2"
          placeholder="Academic Year e.g. 2025/2026"
        />
      </div>

      {!data || data.error ? (
        <p className="text-sm text-red-500">
          {data?.error || "No finance report data found."}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
            <Stat label="Expected" value={`GHS ${data.totalFees.toFixed(2)}`} />
            <Stat label="Collected" value={`GHS ${data.totalPaid.toFixed(2)}`} />
            <Stat label="Outstanding" value={`GHS ${data.outstanding.toFixed(2)}`} />
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
              {data.studentsOwing.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-3 text-center text-gray-500">
                    No students owing.
                  </td>
                </tr>
              ) : (
                data.studentsOwing.map((s: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{s.student}</td>
                    <td className="p-2 text-red-600">
                      GHS {s.balance.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <FinancePagination
            page={page}
            limit={limit}
            count={data.totalStudents}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </>
      )}
    </div>
  );
};

const Stat = ({ label, value }: any) => (
  <div className="bg-slate-50 p-3 rounded-md border">
    <p className="text-gray-500">{label}</p>
    <p className="font-semibold">{value}</p>
  </div>
);

export default FinanceReport;