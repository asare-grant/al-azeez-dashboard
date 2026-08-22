// src/app/(dashboard)/list/classes/page.tsx

import type {
  Class,
  Grade,
  Prisma,
  Teacher,
} from "@prisma/client";

import Image from "next/image";
import {
  redirect,
} from "next/navigation";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import {
  contextHasPermission,
  getCurrentAccessContext,
} from "@/lib/access-control";

import prisma from "@/lib/prisma";

import {
  ITEM_PER_PAGE,
} from "@/lib/settings";

export const revalidate =
  0;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ClassList =
  Class & {
    supervisor:
      Teacher | null;

    grade:
      Grade;
  };

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function ClassListPage(
  props: {
    searchParams: Promise<{
      [key: string]:
        | string
        | string[]
        | undefined;
    }>;
  },
) {
  const searchParams =
    await props.searchParams;

  /* ------------------------------------------------------------------------ */
  /* ACCESS                                                                   */
  /* ------------------------------------------------------------------------ */

  const access =
    await getCurrentAccessContext();

  if (
    !access.authenticated
  ) {
    redirect(
      "/sign-in",
    );
  }

  if (
    !contextHasPermission(
      access,
      "academics.classes.view",
    )
  ) {
    redirect(
      "/",
    );
  }

  const canManageClasses =
    contextHasPermission(
      access,
      "academics.classes.manage",
    );

  const userId =
    access.userId!;

  /* ------------------------------------------------------------------------ */
  /* SCOPE                                                                    */
  /* ------------------------------------------------------------------------ */

  /*
   * A pure Teacher assignment remains ownership-scoped.
   *
   * If the actor also has another active role such as
   * Academic Director or Administrator, that additional
   * role gives them the broader class workspace.
   */
  const teacherOnlyScope =
    access.roleKeys.has(
      "teacher",
    ) &&
    access.roleKeys.size ===
      1;

  const classScope:
    Prisma.ClassWhereInput =
    teacherOnlyScope
      ? {
          OR: [
            {
              supervisorId:
                userId,
            },

            {
              lessons: {
                some: {
                  teacherId:
                    userId,
                },
              },
            },
          ],
        }
      : {};

  /* ------------------------------------------------------------------------ */
  /* COLUMNS                                                                  */
  /* ------------------------------------------------------------------------ */

  const columns = [
    {
      header:
        "Class Name",

      accessor:
        "name",
    },

    {
      header:
        "Capacity",

      accessor:
        "capacity",

      className:
        "hidden md:table-cell",
    },

    {
      header:
        "Grade",

      accessor:
        "grade",

      className:
        "hidden md:table-cell",
    },

    {
      header:
        "Supervisor",

      accessor:
        "supervisor",

      className:
        "hidden md:table-cell",
    },

    ...(canManageClasses
      ? [
          {
            header:
              "Actions",

            accessor:
              "action",
          },
        ]
      : []),
  ];

  /* ------------------------------------------------------------------------ */
  /* ROW                                                                      */
  /* ------------------------------------------------------------------------ */

  const renderRow =
    (
      item:
        ClassList,
    ) => (
      <tr
        key={
          item.id
        }
        className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[#F1F0FF]"
      >
        <td className="flex items-center gap-4 p-4">
          {
            item.name
          }
        </td>

        <td className="hidden md:table-cell">
          {
            item.capacity
          }
        </td>

        <td className="hidden md:table-cell">
          {
            item.grade.level
          }
        </td>

        <td className="hidden md:table-cell">
          {item.supervisor
            ? `${item.supervisor.name} ${item.supervisor.surname}`
            : "No Supervisor"}
        </td>

        {canManageClasses && (
          <td>
            <div className="flex items-center gap-2">
              <FormContainer
                table="class"
                type="update"
                data={
                  item
                }
              />

              <FormContainer
                table="class"
                type="delete"
                id={
                  item.id
                }
              />
            </div>
          </td>
        )}
      </tr>
    );

  /* ------------------------------------------------------------------------ */
  /* PAGINATION / SEARCH                                                      */
  /* ------------------------------------------------------------------------ */

  const {
    page,
    ...queryParams
  } =
    searchParams;

  const p =
    Math.max(
      1,
      page
        ? parseInt(
            page as string,
            10,
          ) || 1
        : 1,
    );

  const searchQuery:
    Prisma.ClassWhereInput =
    {};

  for (
    const [
      key,
      value,
    ] of Object.entries(
      queryParams,
    )
  ) {
    if (
      value ===
      undefined
    ) {
      continue;
    }

    const resolvedValue =
      Array.isArray(
        value,
      )
        ? value[0]
        : value;

    if (
      !resolvedValue
    ) {
      continue;
    }

    switch (
      key
    ) {
      case "supervisorId":
        searchQuery.supervisorId =
          resolvedValue;

        break;

      case "search":
        searchQuery.name = {
          contains:
            resolvedValue.trim(),

          mode:
            "insensitive",
        };

        break;

      default:
        break;
    }
  }

  const query:
    Prisma.ClassWhereInput = {
    AND: [
      classScope,
      searchQuery,
    ],
  };

  /* ------------------------------------------------------------------------ */
  /* DATA                                                                     */
  /* ------------------------------------------------------------------------ */

  const [
    data,
    count,
  ] =
    await prisma.$transaction([
      prisma.class.findMany({
        where:
          query,

        include: {
          supervisor:
            true,

          grade:
            true,
        },

        take:
          ITEM_PER_PAGE,

        skip:
          ITEM_PER_PAGE *
          (p - 1),

        orderBy: [
          {
            grade: {
              level:
                "asc",
            },
          },

          {
            name:
              "asc",
          },
        ],
      }),

      prisma.class.count({
        where:
          query,
      }),
    ]);

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">
          All Classes
        </h1>

        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]"
            >
              <Image
                src="/filter.png"
                alt=""
                width={14}
                height={14}
              />
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]"
            >
              <Image
                src="/sort.png"
                alt=""
                width={14}
                height={14}
              />
            </button>

            {canManageClasses && (
              <FormContainer
                table="class"
                type="create"
              />
            )}
          </div>
        </div>
      </div>

      <Table
        columns={
          columns
        }
        renderRow={
          renderRow
        }
        data={
          data
        }
      />

      <Pagination
        page={p}
        count={count}
      />
    </div>
  );
}