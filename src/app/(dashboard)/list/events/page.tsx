// src/app/(dashboard)/list/events/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import {
  getEventVisibilityWhere,
  requireEventViewer,
} from "@/lib/events/visibility";

export const revalidate = 0; // ✅ Disable caching for live updates

type EventList = Event & { class: Class | null };

export default async function EventListPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ Fix for Next.js 15 — unwrap searchParams
  const searchParams = await props.searchParams;

  const { userId, scope, canManage } = await requireEventViewer();

  // ✅ Define table columns
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "End Time",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    ...(canManage
      ? [
          {
            header: "Actions",

            accessor: "action",
          },
        ]
      : []),
  ];

  // ✅ Row Renderer
  const renderRow = (item: EventList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>{item.class?.name ?? "School-wide"}</td>
      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-GH", {
          day: "numeric",

          month: "short",

          year: "numeric",
        }).format(item.startTime)}
      </td>
      <td className="hidden md:table-cell">
        {item.startTime.toLocaleTimeString("en-GH", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td className="hidden md:table-cell">
        {item.endTime.toLocaleTimeString("en-GH", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      {canManage && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="event" type="update" data={item} />

            <FormContainer table="event" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // ✅ Handle pagination
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page as string) : 1;
  console.log("Rendering events page:", p);

  // ✅ Build dynamic search query
  // ✅ Build dynamic search query
  const searchQuery: Prisma.EventWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (value !== undefined) {
      switch (key) {
        case "search":
          searchQuery.title = {
            contains: value as string,

            mode: "insensitive",
          };

          break;

        default:
          break;
      }
    }
  }

  const visibility = getEventVisibilityWhere({
    userId,

    scope,
  });

  const query: Prisma.EventWhereInput = {
    AND: [visibility, searchQuery],
  };

  // ✅ Fetch paginated data
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,

      include: {
        class: true,
      },

      take: ITEM_PER_PAGE,

      skip: ITEM_PER_PAGE * (p - 1),

      orderBy: {
        startTime: "asc",
      },
    }),

    prisma.event.count({
      where: query,
    }),
  ]);

  // ✅ Page Layout
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP SECTION */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {canManage && <FormContainer table="event" type="create" />}
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}
