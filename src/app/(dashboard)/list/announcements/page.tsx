// src/app/(dashboard)/list/announcements/page.tsx

import type {
  Announcement,
  Class,
  Prisma,
} from "@prisma/client";

import Image from "next/image";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import {
  getAnnouncementVisibilityWhere,
  requireAnnouncementViewer,
} from "@/lib/announcements/visibility";

import prisma from "@/lib/prisma";

import {
  ITEM_PER_PAGE,
} from "@/lib/settings";

export const revalidate =
  0;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type AnnouncementList =
  Announcement & {
    class:
      Class | null;
  };

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function AnnouncementListPage(
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

  const {
    userId,
    scope,
    canManage,
  } =
    await requireAnnouncementViewer();

  /* ------------------------------------------------------------------------ */
  /* COLUMNS                                                                  */
  /* ------------------------------------------------------------------------ */

  const columns = [
    {
      header:
        "Title",

      accessor:
        "title",
    },

    {
      header:
        "Class",

      accessor:
        "class",
    },

    {
      header:
        "Date",

      accessor:
        "date",

      className:
        "hidden md:table-cell",
    },

    ...(canManage
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
        AnnouncementList,
    ) => (
      <tr
        key={
          item.id
        }
        className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[#F1F0FF]"
      >
        <td className="flex items-center gap-4 p-4">
          {
            item.title
          }
        </td>

        <td>
          {item.class
            ?.name ??
            "School-wide"}
        </td>

        <td className="hidden md:table-cell">
          {new Intl.DateTimeFormat(
            "en-US",
          ).format(
            item.date,
          )}
        </td>

        {canManage && (
          <td>
            <div className="flex items-center gap-2">
              <FormContainer
                table="announcement"
                type="update"
                data={
                  item
                }
              />

              <FormContainer
                table="announcement"
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
  /* PAGINATION                                                               */
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

  console.log(
    "Rendering announcements page:",
    p,
  );

  /* ------------------------------------------------------------------------ */
  /* SEARCH                                                                   */
  /* ------------------------------------------------------------------------ */

  const searchQuery:
    Prisma.AnnouncementWhereInput =
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

    switch (
      key
    ) {
      case "search": {
        const search =
          Array.isArray(
            value,
          )
            ? value[0]
            : value;

        if (
          search?.trim()
        ) {
          searchQuery.title = {
            contains:
              search.trim(),

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
  /* VISIBILITY                                                               */
  /* ------------------------------------------------------------------------ */

  const visibility =
    getAnnouncementVisibilityWhere({
      userId,

      scope,
    });

  const query:
    Prisma.AnnouncementWhereInput = {
    AND: [
      visibility,
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
      prisma.announcement.findMany({
        where:
          query,

        include: {
          class:
            true,
        },

        take:
          ITEM_PER_PAGE,

        skip:
          ITEM_PER_PAGE *
          (p - 1),

        orderBy: {
          date:
            "desc",
        },
      }),

      prisma.announcement.count({
        where:
          query,
      }),
    ]);

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      {/* TOP */}

      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">
          All Announcements
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

            {canManage && (
              <FormContainer
                table="announcement"
                type="create"
              />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}

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

      {/* PAGINATION */}

      <Pagination
        page={p}
        count={count}
      />
    </div>
  );
}