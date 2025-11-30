// /app/(dashboard)/list/fee/page.tsx
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Fee, FeeMaster, FeeStructure, Student } from "@prisma/client";
import React from "react";
import Image from "next/image";

export const revalidate = 0; // no caching

type FeeListItem = Fee & {
  master: FeeMaster & { student: Student };
  structure: FeeStructure & { type: { name: string } }; // ✅ include type
};

export default async function FeeListPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // server-side auth
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "";

  // pagination
  const { page, search } = searchParams;
  const p = page ? parseInt(page as string, 10) : 1;

  // build query
  const query: any = {};
  if (search) {
    query.OR = [
      {
        master: {
          student: {
            name: { contains: search as string, mode: "insensitive" },
          },
        },
      },
      {
        master: {
          student: {
            surname: { contains: search as string, mode: "insensitive" },
          },
        },
      },
      {
        master: {
          term: { contains: search as string, mode: "insensitive" },
        },
      },
      {
        structure: {
          studentType: { contains: search as string, mode: "insensitive" },
        },
      },
      {
        structure: {
          boardingType: { contains: search as string, mode: "insensitive" },
        },
      },
      {
        structure: {
          type: {
            name: { contains: search as string, mode: "insensitive" },
          },
        },
      },
      {
        structure: {
          type: {
            category: {
              name: { contains: search as string, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  // fetch data with transaction for pagination
  const [data, count] = await prisma.$transaction([
    prisma.fee.findMany({
      where: query,
      include: {
        master: { include: { student: true } },
        structure: { include: { type: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { id: "desc" },
    }),
    prisma.fee.count({ where: query }),
  ]);

  // table columns
  const columns = [
    { header: "Student", accessor: "student" },
    {
      header: "Fee Type",
      accessor: "feeType",
      className: "hidden md:table-cell",
    },
    { header: "Term", accessor: "term", className: "hidden md:table-cell" },
    {
      header: "Academic Year",
      accessor: "academicYear",
      className: "hidden lg:table-cell",
    },
    { header: "Amount", accessor: "amount" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  // render row
  const renderRow = (item: FeeListItem) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
    >
      <td className="p-4">
        {item.master.student.name} {item.master.student.surname}
      </td>
      <td className="hidden md:table-cell">
        {item.structure?.type?.name ?? "NA"}
      </td>
      <td className="hidden md:table-cell">{item.master.term}</td>
      <td className="hidden lg:table-cell">{item.master.academicYear}</td>
      <td>{item.amount.toFixed(2)}</td>
      {role === "admin" && (
        <td className="p-2 flex gap-2">
          <FormContainer table="fee" type="update" data={item} />
          <FormContainer table="fee" type="delete" id={item.id} />
        </td>
      )}
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Top header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Fees</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="fee" type="create" />}
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
