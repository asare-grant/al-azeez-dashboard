import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import { getCurrentAccessActor } from "@/lib/access-control";

export const revalidate = 0; // ✅ Prevent caching for pagination consistency

type ParentList = Parent & { students: Student[] };

export default async function ParentListPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ Fix for Next.js 15 — unwrap searchParams
  const searchParams = await props.searchParams;

  /* ======================================================================== */
  /* ACCESS                                                                   */
  /* ======================================================================== */

  const accessActor = await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error("UNAUTHENTICATED");
  }

  const canViewParents = accessActor.can("parents.view");

  const canCreateParents = accessActor.can("parents.create");

  const canUpdateParents = accessActor.can("parents.update");

  const canDeleteParents = accessActor.can("parents.delete");

  if (!canViewParents) {
    throw new Error("UNAUTHORIZED");
  }

  const hasParentRowActions = canUpdateParents || canDeleteParents;

  // ✅ Define table columns
  const columns = [
    { header: "Info", accessor: "info" },
    {
      header: "Student Names",
      accessor: "students",
      className: "hidden md:table-cell",
    },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    ...(hasParentRowActions
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  // ✅ Render table row
  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {item.students.map((student) => student.name).join(", ")}
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      {hasParentRowActions ? (
        <td>
          <div className="flex items-center gap-2">
            {canUpdateParents ? (
              <FormContainer table="parent" type="update" data={item} />
            ) : null}

            {canDeleteParents ? (
              <FormContainer table="parent" type="delete" id={item.id} />
            ) : null}
          </div>
        </td>
      ) : null}
    </tr>
  );

  // ✅ Extract page & query params
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page as string) : 1;
  console.log("Rendering parent page:", p);

  // ✅ Build Prisma query dynamically
  const query: Prisma.ParentWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) {
      switch (key) {
        case "search":
          query.name = { contains: value as string, mode: "insensitive" };
          break;
      }
    }
  }

  // ✅ Fetch paginated data
  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: { students: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { id: "desc" },
    }),
    prisma.parent.count({ where: query }),
  ]);

  // ✅ Render UI
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Parents</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            {canCreateParents ? (
              <FormContainer table="parent" type="create" />
            ) : null}
          </div>
        </div>
      </div>

      {/* TABLE LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}
