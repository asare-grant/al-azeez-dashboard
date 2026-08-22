// src/app/(dashboard)/list/subjects/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";

import {
  getCurrentAccessContext,
  contextHasPermission,
} from "@/lib/access-control";

import { ITEM_PER_PAGE } from "@/lib/settings";

import {
  Prisma,
  Subject,
  Teacher,
} from "@prisma/client";

import Image from "next/image";
import { redirect } from "next/navigation";

export const revalidate = 0;

type SubjectList = Subject & {
  teachers: Teacher[];
};

export default async function SubjectListPage(props: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  /* ------------------------------------------------------------------------ */
  /* ACCESS CONTEXT                                                           */
  /* ------------------------------------------------------------------------ */

  const accessContext =
    await getCurrentAccessContext();

  if (!accessContext) {
    redirect("/sign-in");
  }

  const canViewSubjects =
    contextHasPermission(
      accessContext,
      "academics.subjects.view",
    ) ||
    contextHasPermission(
      accessContext,
      "academics.subjects.manage",
    );

  const canManageSubjects =
    contextHasPermission(
      accessContext,
      "academics.subjects.manage",
    );

  if (!canViewSubjects) {
    redirect("/unauthorized");
  }

  /* ------------------------------------------------------------------------ */
  /* SEARCH PARAMS                                                            */
  /* ------------------------------------------------------------------------ */

  const searchParams =
    await props.searchParams;

  const {
    page,
    ...queryParams
  } = searchParams;

  const parsedPage =
    typeof page === "string"
      ? Number.parseInt(
          page,
          10,
        )
      : 1;

  const p =
    Number.isInteger(parsedPage) &&
    parsedPage > 0
      ? parsedPage
      : 1;

  /* ------------------------------------------------------------------------ */
  /* TABLE COLUMNS                                                            */
  /* ------------------------------------------------------------------------ */

  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },

    {
      header: "Teachers",
      accessor: "teachers",
      className:
        "hidden md:table-cell",
    },

    ...(canManageSubjects
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  /* ------------------------------------------------------------------------ */
  /* ROW RENDERER                                                             */
  /* ------------------------------------------------------------------------ */

  const renderRow = (
    item: SubjectList,
  ) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center gap-4 p-4">
        {item.name}
      </td>

      <td className="hidden md:table-cell">
        {item.teachers
          .map(
            (teacher) =>
              `${teacher.name} ${teacher.surname}`.trim(),
          )
          .join(", ")}
      </td>

      {canManageSubjects && (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer
              table="subject"
              type="update"
              data={item}
            />

            <FormContainer
              table="subject"
              type="delete"
              id={item.id}
            />
          </div>
        </td>
      )}
    </tr>
  );

  /* ------------------------------------------------------------------------ */
  /* QUERY                                                                    */
  /* ------------------------------------------------------------------------ */

  const query:
    Prisma.SubjectWhereInput = {};

  for (
    const [key, value] of
    Object.entries(queryParams)
  ) {
    if (
      value === undefined
    ) {
      continue;
    }

    switch (key) {
      case "search": {
        const searchValue =
          Array.isArray(value)
            ? value[0]
            : value;

        if (
          searchValue?.trim()
        ) {
          query.name = {
            contains:
              searchValue.trim(),

            mode:
              "insensitive",
          };
        }

        break;
      }

      default:
        break;
    }
  }

  /* ------------------------------------------------------------------------ */
  /* DATA                                                                     */
  /* ------------------------------------------------------------------------ */

  const [
    data,
    count,
  ] =
    await prisma.$transaction([
      prisma.subject.findMany({
        where:
          query,

        include: {
          teachers:
            true,
        },

        orderBy: {
          name:
            "asc",
        },

        take:
          ITEM_PER_PAGE,

        skip:
          ITEM_PER_PAGE *
          (p - 1),
      }),

      prisma.subject.count({
        where:
          query,
      }),
    ]);

  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}

      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Subjects
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]"
            >
              <Image
                src="/filter.png"
                alt="Filter"
                width={14}
                height={14}
              />
            </button>

            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]"
            >
              <Image
                src="/sort.png"
                alt="Sort"
                width={14}
                height={14}
              />
            </button>

            {canManageSubjects && (
              <FormContainer
                table="subject"
                type="create"
              />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}

      <Table
        columns={columns}
        renderRow={renderRow}
        data={data}
      />

      {/* PAGINATION */}

      <Pagination
        page={p}
        count={count}
      />
    </div>
  );
}