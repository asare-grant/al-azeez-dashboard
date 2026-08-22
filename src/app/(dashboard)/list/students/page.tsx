// src/app/(dashboard)/list/students/page.tsx

import FormContainer from "@/components/FormContainer";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FinancePagination from "@/components/FinancePagination";

import {
  contextHasPermission,
  getCurrentAccessContext,
} from "@/lib/access-control";

import { requireStudentPermission } from "@/lib/students/auth";

import prisma from "@/lib/prisma";

import { Class, Prisma, Student } from "@prisma/client";

import Image from "next/image";
import Link from "next/link";

import { redirect } from "next/navigation";

export const revalidate = 0;

type StudentList = Student & {
  class: Class;
};

export default async function StudentListPage(props: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const searchParams = await props.searchParams;

  /* ======================================================================== */
  /* ACCESS                                                                   */
  /* ======================================================================== */

  const access = await getCurrentAccessContext();

  if (!access.authenticated) {
    redirect("/sign-in");
  }

  const canViewStudents = contextHasPermission(access, "students.view");

  const canCreateStudent = contextHasPermission(access, "students.create");

  const canUpdateStudent = contextHasPermission(access, "students.update");

  const canDeleteStudent = contextHasPermission(access, "students.delete");

  if (!canViewStudents) {
    redirect("/");
  }

  const { userId, scope: studentViewScope } =
    await requireStudentPermission("students.view");

  const teacherOnlyScope = studentViewScope === "TEACHER_OWNED";

  const studentScope: Prisma.StudentWhereInput = teacherOnlyScope
    ? {
        class: {
          OR: [
            {
              supervisorId: userId,
            },

            {
              lessons: {
                some: {
                  teacherId: userId,
                },
              },
            },
          ],
        },
      }
    : {};

  /* ======================================================================== */
  /* PAGINATION                                                               */
  /* ======================================================================== */

  const { page, limit, ...queryParams } = searchParams;

  const rawPage = typeof page === "string" ? Number(page) : 1;

  const rawLimit = typeof limit === "string" ? Number(limit) : 10;

  const p = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const perPage =
    Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;

  /* ======================================================================== */
  /* SEARCH                                                                   */
  /* ======================================================================== */

  const searchQuery: Prisma.StudentWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined) {
      continue;
    }

    const resolvedValue = Array.isArray(value) ? value[0] : value;

    if (!resolvedValue?.trim()) {
      continue;
    }

    switch (key) {
      case "teacherId":
        searchQuery.class = {
          lessons: {
            some: {
              teacherId: resolvedValue,
            },
          },
        };

        break;

      case "search":
        searchQuery.OR = [
          {
            name: {
              contains: resolvedValue,

              mode: "insensitive",
            },
          },

          {
            surname: {
              contains: resolvedValue,

              mode: "insensitive",
            },
          },

          {
            studentType: {
              contains: resolvedValue,

              mode: "insensitive",
            },
          },

          {
            boardingType: {
              contains: resolvedValue,

              mode: "insensitive",
            },
          },

          {
            class: {
              name: {
                contains: resolvedValue,

                mode: "insensitive",
              },
            },
          },
        ];

        break;

      default:
        break;
    }
  }

  const query: Prisma.StudentWhereInput = {
    AND: [studentScope, searchQuery],
  };

  /* ======================================================================== */
  /* DATA                                                                     */
  /* ======================================================================== */

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,

      include: {
        class: true,
      },

      take: perPage,

      skip: perPage * (p - 1),

      orderBy: {
        id: "desc",
      },
    }),

    prisma.student.count({
      where: query,
    }),
  ]);

  /* ======================================================================== */
  /* TABLE                                                                    */
  /* ======================================================================== */

  const columns = [
    {
      header: "Info",

      accessor: "info",
    },

    {
      header: "Student Type",

      accessor: "studentType",

      className: "hidden md:table-cell",
    },

    {
      header: "Boarding Type",

      accessor: "boardingType",

      className: "hidden md:table-cell",
    },

    {
      header: "Phone",

      accessor: "phone",

      className: "hidden lg:table-cell",
    },

    {
      header: "Address",

      accessor: "address",

      className: "hidden lg:table-cell",
    },

    /*
     * View is authorized by students.view, so every
     * actor on this page can legitimately open a
     * student profile.
     */
    {
      header: "Actions",

      accessor: "action",
    },
  ];

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt={`${item.name} ${item.surname}`}
          width={40}
          height={40}
          unoptimized={Boolean(item.img)}
          className="h-10 w-10 rounded-full object-cover md:hidden xl:block"
        />

        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.name} {item.surname}
          </h3>

          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.studentType}</td>

      <td className="hidden md:table-cell">{item.boardingType}</td>

      <td className="hidden lg:table-cell">{item.phone}</td>

      <td className="hidden lg:table-cell">{item.address}</td>

      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${item.id}`}>
            <button
              type="button"
              title="View student"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C3EBFA]"
            >
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>

          {canDeleteStudent && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  /* ======================================================================== */
  /* UI                                                                       */
  /* ======================================================================== */

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">All Students</h1>

        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]"
            >
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]"
            >
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>

            {canCreateStudent && (
              <FormContainer table="student" type="create" />
            )}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />

      <FinancePagination page={p} count={count} limit={perPage} />
    </div>
  );
}
