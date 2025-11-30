import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { FeeType, FeeCategory, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

export const revalidate = 0;

type FeeTypeList = FeeType & { category: FeeCategory };

export default async function FeeTypeListPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Fee Type", accessor: "name" },
    {
      header: "Category",
      accessor: "category",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: FeeTypeList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
    >
      <td className="p-4">{item.name}</td>
      <td className="hidden md:table-cell">
        {item.category?.name ?? "No Category"}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="fee-type" type="update" data={item} />
              <FormContainer table="fee-type" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Pagination
  const { page, search, categoryId } = searchParams;
  const p = page ? parseInt(page as string) : 1;

  // Prisma query
  const query: Prisma.FeeTypeWhereInput = {};
  if (search && typeof search === "string") {
    query.name = { contains: search, mode: "insensitive" };
  }
  if (categoryId) {
    query.categoryId = parseInt(categoryId as string);
  }

  const [data, count] = await prisma.$transaction([
    prisma.feeType.findMany({
      where: query,
      include: { category: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.feeType.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Top */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Fee Types</h1>
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
              <FormContainer table="fee-type" type="create" />
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
