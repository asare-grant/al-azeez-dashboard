// import prisma from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import Table from "@/components/Table";
// import FormContainer from "@/components/FormContainer";
// import Pagination from "@/components/Pagination";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { Prisma } from "@prisma/client";
// import FinanceTableSearch from "@/components/FinanceTableSearch";
// import FilterDropdown from "@/components/FilterDropdown";
// import Image from "next/image";

// export const revalidate = 0; // Disable caching

// export default async function FinanceDashboardPage(props: {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// }) {
//   const searchParams = await props.searchParams;

//   const { sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   // -----------------------------
//   // PAGINATION
//   // -----------------------------
//   const { page, ...queryParams } = searchParams;
//   const p = page ? parseInt(page as string) : 1;

//   // -----------------------------
//   // BUILD DYNAMIC PRISMA QUERY
//   // -----------------------------
//   const query: Prisma.FeeMasterWhereInput = {};

//   for (const [key, value] of Object.entries(queryParams)) {
//     if (!value) continue;

//     switch (key) {
//       case "student":
//         query.student = {
//           OR: [
//             { name: { contains: value as string, mode: "insensitive" } },
//             { surname: { contains: value as string, mode: "insensitive" } },
//           ],
//         };
//         break;

//       case "class":
//         query.details = {
//           some: {
//             structure: {
//               class:  { name: { contains: value as string, mode: "insensitive" } },
//               // classId: parseInt(value as string) || undefined,
//             },
//           },
//         };
//         break;

//       case "term":
//         query.term = { contains: value as string, mode: "insensitive" };
//         break;

//       case "search":
//         query.OR = [
//           { term: { contains: value as string, mode: "insensitive" } },
//           { studentId: { contains: value as string, mode: "insensitive" } },
//           { academicYear: { contains: value as string, mode: "insensitive" } },
//         ];
//         break;

//       default:
//         break;
//     }
//   }

//   // ---------------------------------------
//   // FETCH DATA — paginated invoices for table
//   // ---------------------------------------
//   const [invoices, invoiceCount] = await prisma.$transaction([
//     prisma.feeMaster.findMany({
//       where: query,
//       include: {
//         student: true,
//         details: {
//           include: { structure: { include: { type: true, class: true } } },
//         },
//         payments: true,
//       },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (p - 1),
//       orderBy: { id: "desc" },
//     }),
//     prisma.feeMaster.count({ where: query }),
//   ]);

//   // ---------------------------------------
//   // FETCH TOTALS — ALL invoices (not paginated)
//   // ---------------------------------------
//   const allInvoices = await prisma.feeMaster.findMany({
//     include: { payments: true },
//   });

//   const totalInvoices = allInvoices.length;
//   const totalRevenue = allInvoices.reduce(
//     (sum, inv) => sum + inv.payments.reduce((s, p) => s + p.amount, 0),
//     0
//   );
//   const totalPending = allInvoices
//     .filter((inv) => {
//       const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
//       return paid < inv.totalAmount;
//     })
//     .reduce((sum, inv) => sum + inv.totalAmount, 0);

//   // -----------------------------
//   // TABLE COLUMNS
//   // -----------------------------
//   const columns = [
//     { header: "Student", accessor: "student" },
//     { header: "Class", accessor: "class", className: "hidden lg:table-cell" },
//     { header: "Term", accessor: "term", className: "hidden lg:table-cell" },
//     { header: "Total Fee", accessor: "totalAmount" },
//     { header: "Paid", accessor: "paid", className: "hidden md:table-cell" },
//     { header: "Balance", accessor: "balance", className: "hidden lg:table-cell" },
//     { header: "Status", accessor: "status", className: "hidden lg:table-cell" },
//     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
//   ];

//   // -----------------------------
//   // RENDER ROW
//   // -----------------------------
//   const renderRow = (inv: (typeof invoices)[0]) => {
//     const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
//     const pending = inv.totalAmount - paid;

//     let status = "PENDING";
//     if (paid === 0) status = "PENDING";
//     else if (paid > 0 && pending > 0) status = "PARTIAL";
//     else if (pending <= 0) status = "PAID";

//     return (
//       <tr
//         key={inv.id}
//         className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
//       >
//         <td className="p-2">
//           {inv.student.name} {inv.student.surname}
//         </td>
//         <td className="p-2 hidden lg:table-cell">
//           {inv.details[0]?.structure?.class?.name || "-"}
//         </td>
//         <td className="p-2 hidden lg:table-cell">{inv.term}</td>
//         <td className="p-2">{inv.totalAmount.toFixed(2)}</td>
//         <td className="p-2 hidden md:table-cell">{paid.toFixed(2)}</td>
//         <td className="p-2 hidden lg:table-cell">{pending.toFixed(2)}</td>
//         <td className="p-2">
//           <span
//             className={`px-2 py-1 rounded-md text-white hidden lg:inline-flex items-center justify-center min-w-20 ${
//               status === "PAID"
//                 ? "bg-green-500"
//                 : status === "PARTIAL"
//                 ? "bg-yellow-300"
//                 : "bg-red-500"
//             }`}
//           >
//             {status}
//           </span>
//         </td>
//         {role === "admin" && (
//           <td className="p-2 flex gap-2">
//             <FormContainer table="fee-payment" type="create" data={{ masterId: inv.id }} />
//           </td>
//         )}
//       </tr>
//     );
//   };

//   // -----------------------------
//   // DASHBOARD CARDS
//   // -----------------------------
//   const formatNumber = (num: number) =>
//     new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(num);

//   const cards = [
//     { title: "Total Invoices", value: formatNumber(totalInvoices) },
//     { title: "Total Revenue", value: formatNumber(totalRevenue) },
//     { title: "Total Pending", value: formatNumber(totalPending) },
//   ];

//   return (
//     <div className="p-4 flex flex-col gap-6">
//       <h1 className="text-xl font-semibold">Finance Dashboard</h1>

//       {/* SUMMARY CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {cards.map((card) => (
//           <div
//             key={card.title}
//             className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center border-t-blue-300 border-t-2"
//           >
//             <span className="text-gray-500 text-sm">{card.title}</span>
//             <span className="text-2xl font-bold">{card.value}</span>
//           </div>
//         ))}
//       </div>

//       {/* SEARCH & FILTER */}
//       <div className="flex flex-col md:flex-row items-center justify-end gap-4 w-full md:w-auto">
//         <FinanceTableSearch placeholder="Search..." /> {/* general search */}
//         <div className="flex items-center gap-4 self-end">
//           <FilterDropdown /> {/* filters for student/class/term */}
//           <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
//             <Image src="/sort.png" alt="" width={14} height={14} />
//           </button>
//         </div>
//       </div>

//       {/* INVOICE TABLE */}
//       <div className="bg-white rounded-md p-4">
//         <h2 className="text-lg font-semibold mb-2">Invoice Breakdown</h2>
//         <Table columns={columns} renderRow={renderRow} data={invoices} />
//         <Pagination page={p} count={invoiceCount} />
//       </div>
//     </div>
//   );
// }



import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Table from "@/components/Table";
import FormContainer from "@/components/FormContainer";
import FinancePagination from "@/components/FinancePagination";
import FinanceTableSearch from "@/components/FinanceTableSearch";
import FilterDropdown from "@/components/FilterDropdown";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import BulkFeeStatementForm from "@/components/admin/BulkFeeStatementForm";
import FinanceReport from "@/components/admin/FinanceReport";

export const revalidate = 0;

export default async function FinanceDashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const { page, limit, ...filters } = searchParams;

  const p = page ? Number(page) : 1;
  const perPage = limit ? Number(limit) : 10; // default 10

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // -----------------------------
  // BUILD DYNAMIC QUERY
  // -----------------------------
  const query: Prisma.FeeMasterWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    switch (key) {
      case "student":
        query.student = {
          OR: [
            { name: { contains: value as string, mode: "insensitive" } },
            { surname: { contains: value as string, mode: "insensitive" } },
          ],
        };
        break;

      case "grade":
        query.details = {
          some: {
            structure: {
              grade: {
                level: { contains: value as string, mode: "insensitive" },
              },
            },
          },
        };
        break;

      case "term":
        query.term = { contains: value as string, mode: "insensitive" };
        break;

      case "search":
        query.OR = [
          { term: { contains: value as string, mode: "insensitive" } },
          { studentId: { contains: value as string, mode: "insensitive" } },
          { academicYear: { contains: value as string, mode: "insensitive" } },
        ];
        break;

      default:
        break;
    }
  }

  // ---------------------------------------
  // FETCH PAGINATED DATA
  // ---------------------------------------
  const [invoices, invoiceCount] = await prisma.$transaction([
    prisma.feeMaster.findMany({
      where: query,
      include: {
        student: true,
        details: {
          include: { structure: { include: { type: true, class: true, grade: true } } },
        },
        payments: true,
      },
      take: perPage,
      skip: perPage * (p - 1),
      orderBy: { id: "desc" },
    }),
    prisma.feeMaster.count({ where: query }),
  ]);

  // ---------------------------------------
  // TOTALS (all invoices)
  // ---------------------------------------
  const allInvoices = await prisma.feeMaster.findMany({
    include: { payments: true },
  });

  const totalInvoices = allInvoices.length;
  const totalRevenue = allInvoices.reduce(
    (sum, inv) => sum + inv.payments.reduce((s, p) => s + p.amount, 0),
    0
  );
  const totalPending = allInvoices
    .filter((inv) => {
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      return paid < inv.totalAmount;
    })
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  // ---------------------------------------
  // TABLE CONFIG
  // ---------------------------------------
  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Grade", accessor: "grade", className: "hidden lg:table-cell" },
    // { header: "Class", accessor: "class", className: "hidden lg:table-cell" },
    { header: "Term", accessor: "term", className: "hidden lg:table-cell" },
    { header: "Total Fee", accessor: "totalAmount" },
    { header: "Paid", accessor: "paid", className: "hidden md:table-cell" },
    {
      header: "Balance",
      accessor: "balance",
      className: "hidden lg:table-cell",
    },
    { header: "Status", accessor: "status", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (inv: (typeof invoices)[0]) => {
    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    const pending = inv.totalAmount - paid;

    let status = "PENDING";
    if (paid === 0) status = "PENDING";
    else if (paid > 0 && pending > 0) status = "PARTIAL";
    else if (pending <= 0) status = "PAID";

    return (
      <tr
        key={inv.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
      >
        <td className="p-2">
          {inv.student.name} {inv.student.surname}
        </td>
        <td className="p-2 hidden lg:table-cell">
          {inv.details[0]?.structure?.grade?.level || "-"}
        </td>
        <td className="p-2 hidden lg:table-cell">{inv.term}</td>
        <td className="p-2">{inv.totalAmount.toFixed(2)}</td>
        <td className="p-2 hidden md:table-cell">{paid.toFixed(2)}</td>
        <td className="p-2 hidden lg:table-cell">{pending.toFixed(2)}</td>
        <td className="p-2">
          <span
            className={`px-2 py-1 rounded-md text-white hidden lg:inline-flex items-center min-w-20 justify-center ${
              status === "PAID"
                ? "bg-green-500"
                : status === "PARTIAL"
                ? "bg-yellow-300"
                : "bg-red-500"
            }`}
          >
            {status}
          </span>
        </td>
        {role === "admin" && (
          <td className="p-2 flex gap-2">
            <FormContainer
              table="fee-payment"
              type="create"
              data={{ masterId: inv.id }}
            />
          </td>
        )}
      </tr>
    );
  };

  // ---------------------------------------
  // CARDS
  // ---------------------------------------
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(num);

  const cards = [
    { title: "Total Invoices", value: formatNumber(totalInvoices) },
    { title: "Total Revenue", value: formatNumber(totalRevenue) },
    { title: "Total Pending", value: formatNumber(totalPending) },
  ];

  // ---------------------------------------
  // PAGE UI
  // ---------------------------------------
  return (
    <div className="p-4 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Finance Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center border-2 border-blue-300"
          >
            <span className="text-gray-500 text-sm">{card.title}</span>
            <span className="text-2xl font-bold">{card.value}</span>
          </div>
        ))}
      </div>

      

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row items-center justify-end gap-4 w-full">
        <FinanceTableSearch placeholder="Search..." />
        <div className="flex items-center gap-4">
          <FilterDropdown />
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
            <Image src="/sort.png" alt="" width={14} height={14} />
          </button>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-white rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2">Invoice Breakdown</h2>
        <Table columns={columns} renderRow={renderRow} data={invoices} />

        {/* Pagination */}
        <FinancePagination page={p} count={invoiceCount} limit={perPage} />
      </div>
      <BulkFeeStatementForm />
      <FinanceReport />
    </div>
  );
}
