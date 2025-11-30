import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { FeeStructure, FeeType, Class, Grade, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

export const revalidate = 0;

type FeeStructureList = FeeStructure & {
  type: FeeType;
  class: Class | null;
  grade: Grade | null;
};

export default async function FeeStructureListPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Fetch search params
  const searchParams = await props.searchParams;

  // Fetch Clerk auth on server
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Pagination & filters
  const { page, classId, gradeId, typeId } = searchParams;
  const p = page ? parseInt(page as string) : 1;

  // Build Prisma query
  const query: Prisma.FeeStructureWhereInput = {};
  if (classId) query.classId = parseInt(classId as string);
  if (gradeId) query.gradeId = parseInt(gradeId as string);
  if (typeId) query.typeId = parseInt(typeId as string);

  // Fetch fee structures with relations
  const [data, count] = await prisma.$transaction([
    prisma.feeStructure.findMany({
      where: query,
      include: { type: true, class: true, grade: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.feeStructure.count({ where: query }),
  ]);

  // Table columns
  const columns = [
    { header: "Grade", accessor: "classGrade" },
    { header: "Fee Type", accessor: "type", className: "hidden lg:table-cell", },
    {
      header: "Student Type",
      accessor: "studentType",
      className: "hidden lg:table-cell",
    },
    {
      header: "Boarding Type",
      accessor: "boardingType",
      className: "hidden lg:table-cell",
    },
    { header: "Amount", accessor: "amount" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // Row renderer
  const renderRow = (item: FeeStructureList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
    >
      <td className="p-4">{item.class?.name ?? item.grade?.level ?? "N/A"}</td>
      <td className="hidden lg:table-cell">{item.type?.name}</td>
      <td className="hidden lg:table-cell">{item.studentType}</td>
      <td className="hidden lg:table-cell">{item.boardingType}</td>
      <td>{item.amount.toFixed(2)}</td>
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="fee-structure" type="update" data={item} />
            <FormContainer table="fee-structure" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Fee Structures
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="fee-structure" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* Pagination */}
      <Pagination page={p} count={count} />
    </div>
  );
}
