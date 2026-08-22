// src/app/(dashboard)/list/teachers/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";

import {
  getCurrentAccessContext,
  contextHasPermission,
} from "@/lib/access-control";

import {
  requireTeacherPermission,
} from "@/lib/teachers/auth";

import {
  Class,
  Prisma,
  Subject,
  Teacher,
} from "@prisma/client";

import Image from "next/image";
import Link from "next/link";

import { ITEM_PER_PAGE } from "@/lib/settings";

export const revalidate = 0;

type TeacherList =
  Teacher & {
    subjects: Subject[];
    classes: Class[];
  };

export default async function TeacherListPage(props: {
  searchParams: Promise<{
    [key: string]:
      | string
      | string[]
      | undefined;
  }>;
}) {
  /* ------------------------------------------------------------------------ */
  /* ACCESS CONTEXT                                                           */
  /* ------------------------------------------------------------------------ */

  const access =
    await getCurrentAccessContext();

  if (
    !access ||
    !contextHasPermission(
      access,
      "teachers.view",
    )
  ) {
    throw new Error("UNAUTHORISED");
  }

  const {
  userId,
  scope:
    teacherViewScope,
} =
  await requireTeacherPermission(
    "teachers.view",
  );

const selfOnlyTeacherView =
  teacherViewScope ===
  "SELF";

  const canCreateTeacher =
    contextHasPermission(
      access,
      "teachers.create",
    );

  const canUpdateTeacher =
    contextHasPermission(
      access,
      "teachers.update",
    );

  const canDeleteTeacher =
    contextHasPermission(
      access,
      "teachers.delete",
    );

  const hasTeacherActions =
    contextHasPermission(
      access,
      "teachers.view",
    ) ||
    canUpdateTeacher ||
    canDeleteTeacher;

  /* ------------------------------------------------------------------------ */
  /* SEARCH PARAMS                                                            */
  /* ------------------------------------------------------------------------ */

  const searchParams =
    await props.searchParams;

  const {
    page,
    ...queryParams
  } = searchParams;

  const p =
    page &&
    typeof page === "string"
      ? Math.max(
          1,
          Number.parseInt(
            page,
            10,
          ) || 1,
        )
      : 1;

  /* ------------------------------------------------------------------------ */
  /* TABLE COLUMNS                                                            */
  /* ------------------------------------------------------------------------ */

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Teacher ID",
      accessor: "teacherId",
      className:
        "hidden md:table-cell",
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className:
        "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className:
        "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className:
        "hidden lg:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className:
        "hidden lg:table-cell",
    },

    ...(hasTeacherActions
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  /* ------------------------------------------------------------------------ */
  /* QUERY                                                                    */
  /* ------------------------------------------------------------------------ */

  const query:
    Prisma.TeacherWhereInput =
    selfOnlyTeacherView
      ? {
          id:
            userId,
        }
      : {};

  for (
    const [
      key,
      value,
    ] of Object.entries(
      queryParams,
    )
  ) {
    if (
      value === undefined ||
      Array.isArray(value)
    ) {
      continue;
    }

    switch (key) {
      case "classId": {
        const classId =
          Number.parseInt(
            value,
            10,
          );

        if (
          Number.isInteger(
            classId,
          )
        ) {
          query.lessons = {
            some: {
              classId,
            },
          };
        }

        break;
      }

      case "search":
        query.name = {
          contains: value,
          mode: "insensitive",
        };

        break;

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
      prisma.teacher.findMany({
        where: query,

        include: {
          subjects: true,
          classes: true,
        },

        take: ITEM_PER_PAGE,

        skip:
          ITEM_PER_PAGE *
          (p - 1),

        orderBy: {
          id: "desc",
        },
      }),

      prisma.teacher.count({
        where: query,
      }),
    ]);

  /* ------------------------------------------------------------------------ */
  /* ROW                                                                      */
  /* ------------------------------------------------------------------------ */

  const renderRow = (
    item: TeacherList,
  ) => (
    <tr
      key={item.id}
      className="
        border-b
        border-gray-200
        even:bg-slate-50
        text-sm
        hover:bg-[#F1F0FF]
      "
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={
            item.img ||
            "/noAvatar.png"
          }
          alt={`${item.name} ${item.surname}`}
          width={40}
          height={40}
          unoptimized={Boolean(
            item.img,
          )}
          className="
            md:hidden
            xl:block
            w-10
            h-10
            rounded-full
            object-cover
          "
        />

        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.name}{" "}
            {item.surname}
          </h3>

          <p className="hidden md:table-cell text-xs text-gray-500">
            {item.email}
          </p>
        </div>
      </td>

      <td className="hidden md:table-cell">
        {item.username}
      </td>

      <td className="hidden md:table-cell">
        {item.subjects
          .map(
            (subject) =>
              subject.name,
          )
          .join(", ")}
      </td>

      <td className="hidden md:table-cell">
        {item.classes
          .map(
            (classItem) =>
              classItem.name,
          )
          .join(", ")}
      </td>

      <td className="hidden lg:table-cell">
        {item.phone}
      </td>

      <td className="hidden lg:table-cell">
        {item.address}
      </td>

      {hasTeacherActions && (
        <td>
          <div className="flex items-center gap-2">
            
              <Link
                href={`/list/teachers/${item.id}`}
              >
                <button
                  type="button"
                  className="
                    w-7
                    h-7
                    flex
                    items-center
                    justify-center
                    rounded-full
                    bg-[#C3EBFA]
                  "
                  title="View teacher"
                >
                  <Image
                    src="/view.png"
                    alt=""
                    width={16}
                    height={16}
                  />
                </button>
              </Link>

            {canDeleteTeacher && (
              <FormContainer
                table="teacher"
                type="delete"
                id={item.id}
              />
            )}
          </div>
        </td>
      )}
    </tr>
  );

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Teachers
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button
              type="button"
              className="
                w-8
                h-8
                flex
                items-center
                justify-center
                rounded-full
                bg-[#FAE27C]
              "
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
              className="
                w-8
                h-8
                flex
                items-center
                justify-center
                rounded-full
                bg-[#FAE27C]
              "
            >
              <Image
                src="/sort.png"
                alt=""
                width={14}
                height={14}
              />
            </button>

            {canCreateTeacher && (
              <FormContainer
                table="teacher"
                type="create"
              />
            )}
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        renderRow={renderRow}
        data={data}
      />

      <Pagination
        page={p}
        count={count}
      />
    </div>
  );
}