// /app/(dashboard)/finance/page.tsx
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Table from "@/components/Table";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { ITEM_PER_PAGE } from "@/lib/settings";

export const revalidate = 0; // Disable caching

export default async function FinanceDashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // -----------------------------
  // PAGINATION
  // -----------------------------
  const { page } = searchParams;
  const p = page ? parseInt(page as string) : 1;

  // ---------------------------------------
  // FETCH DATA — paginated invoices for table
  // ---------------------------------------
  const [invoices, invoiceCount] = await prisma.$transaction([
    prisma.feeMaster.findMany({
      include: {
        student: true,
        details: {
          include: { structure: { include: { type: true } } },
        },
        payments: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { id: "desc" },
    }),
    prisma.feeMaster.count(),
  ]);

  // ---------------------------------------
  // FETCH TOTALS — ALL invoices (not paginated)
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
    .filter((inv) => inv.status !== "PAID")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
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

  // -----------------------------
  // RENDER ROW
  // -----------------------------
  const renderRow = (inv: (typeof invoices)[0]) => {
    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    const pending = inv.totalAmount - paid;

    let status = "PENDING";

    if (paid === 0) {
      status = "PENDING";
    } else if (paid > 0 && pending > 0) {
      status = "PARTIAL";
    } else if (pending <= 0) {
      status = "PAID";
    }

    return (
      <tr
        key={inv.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
      >
        <td className="p-2">
          {inv.student.name} {inv.student.surname}
        </td>
        <td className="p-2 hidden md:table-cell">
          {inv.details[0]?.structure?.classId || "-"}
        </td>
        <td className="p-2 hidden lg:table-cell">{inv.term}</td>
        <td className="p-2">{inv.totalAmount.toFixed(2)}</td>
        <td className="p-2 hidden md:table-cell">{paid.toFixed(2)}</td>
        <td className="p-2 hidden lg:table-cell">{pending.toFixed(2)}</td>
        <td className="p-2">
          <span
            className={`px-2 py-1 rounded-md text-white hidden lg:inline-flex items-center justify-center min-w-20   ${
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

  // -----------------------------
  // DASHBOARD CARDS
  // -----------------------------
  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(num);

  const cards = [
    { title: "Total Invoices", value: formatNumber(totalInvoices) },
    { title: "Total Revenue", value: formatNumber(totalRevenue) },
    { title: "Total Pending", value: formatNumber(totalPending) },
  ];

  return (
    <div className="p-4 flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Finance Dashboard</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-4 rounded-md shadow-sm flex flex-col items-center border-t-blue-300 border-t-2"
          >
            <span className="text-gray-500 text-sm">{card.title}</span>
            <span className="text-2xl font-bold">{card.value}</span>
          </div>
        ))}
      </div>

      {/* INVOICE TABLE */}
      <div className="bg-white rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2">Invoice Breakdown</h2>

        <Table columns={columns} renderRow={renderRow} data={invoices} />

        {/* PAGINATION */}
        <Pagination page={p} count={invoiceCount} />
      </div>
    </div>
  );
}
