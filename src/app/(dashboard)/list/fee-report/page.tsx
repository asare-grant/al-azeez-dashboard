// // src/app/(dashboard)/list/fee-report/page.tsx
// import Table from "@/components/Table";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import Pagination from "@/components/Pagination";
// import {
//   getClassReport,
//   getStudentReport,
//   getTermReport,
// } from "@/lib/reports";

// export const revalidate = 0; // always fresh
// export const dynamic = "force-dynamic";

// const PER_PAGE = 10;

// export default async function FeeReportsPage({
//   searchParams,
// }: {
//   searchParams: Record<string, string | string[] | undefined>;
// }) {
//   const params = searchParams ?? {};

//   // --- Parse query params ---
//   const classPage =
//     params.classPage && typeof params.classPage === "string"
//       ? parseInt(params.classPage, 10)
//       : 1;
//   const studentPage =
//     params.studentPage && typeof params.studentPage === "string"
//       ? parseInt(params.studentPage, 10)
//       : 1;
//   const termPage =
//     params.termPage && typeof params.termPage === "string"
//       ? parseInt(params.termPage, 10)
//       : 1;

//   // --- Fetch data server-side ---
//   const [classReport, studentReport, termReport] = await Promise.all([
//     getClassReport(classPage, PER_PAGE),
//     getStudentReport(studentPage, PER_PAGE),
//     getTermReport(termPage, PER_PAGE),
//   ]);

//   // --- Helper to build URL with updated page ---
//   const buildHref = (key: string, pageNum: number) => {
//     const qp = new URLSearchParams();

//     Object.entries(params).forEach(([k, v]) => {
//       if (!v) return;
//       if (Array.isArray(v)) {
//         v.forEach((val) => qp.append(k, val));
//       } else {
//         qp.set(k, v);
//       }
//     });

//     qp.set(key, String(pageNum));
//     return `?${qp.toString()}`;
//   };

//   // --- Table column definitions ---
//   const classColumns = [
//     { header: "Class", accessor: "className" },
//     { header: "Total Invoiced", accessor: "totalInvoiced", className: "hidden md:table-cell" },
//     { header: "Total Paid", accessor: "totalPaid" },
//     { header: "Total Pending", accessor: "totalPending" },
//     { header: "Avg Fee / Student", accessor: "avgFeePerStudent", className: "hidden md:table-cell" },
//   ];

//   const studentColumns = [
//     { header: "Invoice ID", accessor: "invoiceId" },
//     { header: "Student", accessor: "studentName" },
//     { header: "Term", accessor: "term", className: "hidden md:table-cell" },
//     { header: "Academic Year", accessor: "academicYear", className: "hidden md:table-cell" },
//     { header: "Total Amount", accessor: "totalAmount" },
//     { header: "Paid", accessor: "paid" },
//     { header: "Pending", accessor: "pending", className: "hidden md:table-cell" },
//     { header: "Status", accessor: "status", className: "hidden md:table-cell" },
//   ];

//   const termColumns = [
//     { header: "Term", accessor: "term" },
//     { header: "Academic Year", accessor: "academicYear" },
//     { header: "Total Invoiced", accessor: "totalInvoiced" },
//     { header: "Total Invoices", accessor: "totalInvoices" },
//   ];

//   // --- Row renderers ---
//   const renderClassRow = (item: any) => (
//     <tr key={item.classId} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]">
//       <td className="p-4">{item.className}</td>
//       <td className= "hidden md:table-cell" >{(item.totalInvoiced ?? 0).toFixed(2)}</td>
//       <td>{(item.totalPaid ?? 0).toFixed(2)}</td>
//       <td>{(item.totalPending ?? 0).toFixed(2)}</td>
//       <td className="hidden md:table-cell">{(item.avgFeePerStudent ?? 0).toFixed(2)}</td>
//     </tr>
//   );

//   const renderStudentRow = (h: any) => (
//     <tr key={h.invoiceId} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]">
//       <td className="p-4">{h.invoiceId}</td>
//       <td>{h.studentName}</td>
//       <td className="hidden md:table-cell">{h.term}</td>
//       <td className="hidden md:table-cell">{h.academicYear}</td>
//       <td>{(h.totalAmount ?? 0).toFixed(2)}</td>
//       <td>{(h.paid ?? 0).toFixed(2)}</td>
//       <td className="hidden md:table-cell">{(h.pending ?? 0).toFixed(2)}</td>
//       <td className="hidden md:table-cell">
//         <span
//           className={`px-2 py-1 rounded-md text-white inline-flex items-center justify-center min-w-[70px] ${
//             h.status === "PAID"
//               ? "bg-green-500"
//               : h.status === "PARTIAL"
//               ? "bg-yellow-300 text-black"
//               : "bg-red-500"
//           }`}
//         >
//           {h.status}
//         </span>
//       </td>
//     </tr>
//   );

//   const renderTermRow = (item: any) => (
//     <tr key={`${item.term}-${item.academicYear}`} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]">
//       <td className="p-4">{item.term}</td>
//       <td>{item.academicYear}</td>
//       <td className="hidden md:table-cell">{(item.totalInvoiced ?? 0).toFixed(2)}</td>
//       <td>{item.totalInvoices}</td>
//     </tr>
//   );

//   return (
//     <div className="p-4 bg-white rounded-md flex flex-col gap-8">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-semibold">Fee Reports</h1>
//         <Link href="/list/FinanceDashboardPage">
//           <Button className="bg-[rgb(24,101,243)] text-white" variant="outline">
//             Financial Dashboard
//           </Button>
//         </Link>
//       </div>

//       {/* --- BY CLASS --- */}
//       <div>
//         <h2 className="text-lg font-semibold mb-2">By Class</h2>
//         <Table columns={classColumns} data={classReport.result} renderRow={renderClassRow} />
//         <Pagination page={classPage} count={classReport.count} key="class" />
//       </div>

//       {/* --- BY STUDENT --- */}
//       <div className="mt-8">
//         <h2 className="text-lg font-semibold mb-2">By Student</h2>
//         <Table columns={studentColumns} data={studentReport.result} renderRow={renderStudentRow} />
//         <Pagination page={studentPage} count={studentReport.count} key="student" />
//       </div>

//       {/* --- BY TERM --- */}
//       <div className="mt-8">
//         <h2 className="text-lg font-semibold mb-2">By Term / Academic Year</h2>
//         <Table columns={termColumns} data={termReport.result} renderRow={renderTermRow} />
//         <Pagination page={termPage} count={termReport.count} key="term" />
//       </div>
//     </div>
//   );
// }





"use client";

import { useState, useEffect } from "react";
import Table from "@/components/Table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FinancePagination from "@/components/FinanceReportPagination";

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function FeeReportsPage() {
  // --- Class report state ---
  const [classData, setClassData] = useState<any[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [classPage, setClassPage] = useState(1);
  const [classLimit, setClassLimit] = useState(10);

  // --- Student report state ---
  const [studentData, setStudentData] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit, setStudentLimit] = useState(10);

  // --- Term report state ---
  const [termData, setTermData] = useState<any[]>([]);
  const [termCount, setTermCount] = useState(0);
  const [termPage, setTermPage] = useState(1);
  const [termLimit, setTermLimit] = useState(10);

  // --- Column definitions ---
  const classColumns = [
    { header: "Class", accessor: "className" },
    { header: "Total Invoiced", accessor: "totalInvoiced", className: "hidden md:table-cell" },
    { header: "Total Paid", accessor: "totalPaid" },
    { header: "Total Pending", accessor: "totalPending" },
    { header: "Avg Fee / Student", accessor: "avgFeePerStudent", className: "hidden md:table-cell" },
  ];

  const studentColumns = [
    { header: "Invoice ID", accessor: "invoiceId" },
    { header: "Student", accessor: "studentName" },
    { header: "Term", accessor: "term", className: "hidden md:table-cell" },
    { header: "Academic Year", accessor: "academicYear", className: "hidden md:table-cell" },
    { header: "Total Amount", accessor: "totalAmount" },
    { header: "Paid", accessor: "paid" },
    { header: "Pending", accessor: "pending", className: "hidden md:table-cell" },
    { header: "Status", accessor: "status", className: "hidden md:table-cell" },
  ];

  const termColumns = [
    { header: "Term", accessor: "term" },
    { header: "Academic Year", accessor: "academicYear" },
    { header: "Total Invoiced", accessor: "totalInvoiced" },
    { header: "Total Invoices", accessor: "totalInvoices" },
  ];

  // --- Row renderers ---
  const renderClassRow = (item: any) => (
    <tr key={item.classId} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]">
      <td className="p-4">{item.className}</td>
      <td className="hidden md:table-cell">{(item.totalInvoiced ?? 0).toFixed(2)}</td>
      <td>{(item.totalPaid ?? 0).toFixed(2)}</td>
      <td>{(item.totalPending ?? 0).toFixed(2)}</td>
      <td className="hidden md:table-cell">{(item.avgFeePerStudent ?? 0).toFixed(2)}</td>
    </tr>
  );

  const renderStudentRow = (h: any) => (
    <tr key={h.invoiceId} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]">
      <td className="p-4">{h.invoiceId}</td>
      <td>{h.studentName}</td>
      <td className="hidden md:table-cell">{h.term}</td>
      <td className="hidden md:table-cell">{h.academicYear}</td>
      <td>{(h.totalAmount ?? 0).toFixed(2)}</td>
      <td>{(h.paid ?? 0).toFixed(2)}</td>
      <td className="hidden md:table-cell">{(h.pending ?? 0).toFixed(2)}</td>
      <td className="hidden md:table-cell">
        <span
          className={`px-2 py-1 rounded-md text-white inline-flex items-center justify-center min-w-[70px] ${
            h.status === "PAID" ? "bg-green-500" : h.status === "PARTIAL" ? "bg-yellow-300 text-black" : "bg-red-500"
          }`}
        >
          {h.status}
        </span>
      </td>
    </tr>
  );

  const renderTermRow = (item: any) => (
    <tr key={`${item.term}-${item.academicYear}`} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]">
      <td className="p-4">{item.term}</td>
      <td>{item.academicYear}</td>
      <td className="hidden md:table-cell">{(item.totalInvoiced ?? 0).toFixed(2)}</td>
      <td>{item.totalInvoices}</td>
    </tr>
  );

  // --- Fetch data whenever page or limit changes ---
  useEffect(() => {
    const fetchClass = async () => {
      const res = await fetch(`/api/reports/class?page=${classPage}&limit=${classLimit}`);
      const json = await res.json();
      setClassData(json.result);
      setClassCount(json.count);
    };
    fetchClass();
  }, [classPage, classLimit]);

  useEffect(() => {
    const fetchStudent = async () => {
      const res = await fetch(`/api/reports/student?page=${studentPage}&limit=${studentLimit}`);
      const json = await res.json();
      setStudentData(json.result);
      setStudentCount(json.count);
    };
    fetchStudent();
  }, [studentPage, studentLimit]);

  useEffect(() => {
    const fetchTerm = async () => {
      const res = await fetch(`/api/reports/term?page=${termPage}&limit=${termLimit}`);
      const json = await res.json();
      setTermData(json.result);
      setTermCount(json.count);
    };
    fetchTerm();
  }, [termPage, termLimit]);

  return (
    <div className="p-4 bg-white rounded-md flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Fee Reports</h1>
        <Link href="/list/FinanceDashboardPage">
          <Button className="bg-[rgb(24,101,243)] text-white hover: cursor-pointer" variant="outline">
            Financial Dashboard
          </Button>
        </Link>
      </div>

      {/* --- By Class --- */}
      <div>
        <h2 className="text-lg font-semibold mb-2">By Class</h2>
        <Table columns={classColumns} data={classData} renderRow={renderClassRow} />
        <FinancePagination
          page={classPage}
          limit={classLimit}
          count={classCount}
          onPageChange={setClassPage}
          onLimitChange={(l) => { setClassLimit(l); setClassPage(1); }}
        />
      </div>

      {/* --- By Student --- */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">By Student</h2>
        <Table columns={studentColumns} data={studentData} renderRow={renderStudentRow} />
        <FinancePagination
          page={studentPage}
          limit={studentLimit}
          count={studentCount}
          onPageChange={setStudentPage}
          onLimitChange={(l) => { setStudentLimit(l); setStudentPage(1); }}
        />
      </div>

      {/* --- By Term --- */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">By Term / Academic Year</h2>
        <Table columns={termColumns} data={termData} renderRow={renderTermRow} />
        <FinancePagination
          page={termPage}
          limit={termLimit}
          count={termCount}
          onPageChange={setTermPage}
          onLimitChange={(l) => { setTermLimit(l); setTermPage(1); }}
        />
      </div>
    </div>
  );
}
