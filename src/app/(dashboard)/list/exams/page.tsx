import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import { requireExamListAccess } from "@/lib/exams/auth";

import prisma from "@/lib/prisma";

import { ITEM_PER_PAGE } from "@/lib/settings";

import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";

import Image from "next/image";

export const revalidate = 0;

type ExamList = Exam & {
  lesson: {
    subject: Subject;

    class: Class;

    teacher: Teacher;
  };
};

export default async function ExamListPage(props: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const searchParams = await props.searchParams;

  /* ======================================================================== */
  /* ACCESS                                                                   */
  /* ======================================================================== */

  const access = await requireExamListAccess();

  const { userId, canManage } = access;

  /* ======================================================================== */
  /* COLUMNS                                                                  */
  /* ======================================================================== */

  const columns = [
    {
      header: "Subject Name",

      accessor: "name",
    },

    {
      header: "Class",

      accessor: "class",
    },

    {
      header: "Teacher",

      accessor: "teacher",

      className: "hidden md:table-cell",
    },

    {
      header: "Date",

      accessor: "date",

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

  /* ======================================================================== */
  /* PAGINATION + FILTERS                                                     */
  /* ======================================================================== */

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page as string) : 1;

  const query: Prisma.ExamWhereInput = {
    lesson: {},
  };

  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined) {
      continue;
    }

    switch (key) {
      case "classId":
        query.lesson!.classId = parseInt(value as string);
        break;

      case "teacherId":
        query.lesson!.teacherId = value as string;
        break;

      case "search":
        query.lesson!.subject = {
          name: {
            contains: value as string,

            mode: "insensitive",
          },
        };
        break;

      default:
        break;
    }
  }

  /* ======================================================================== */
  /* RBAC / OWNERSHIP SCOPE                                                   */
  /* ======================================================================== */

  if (!access.global) {
    const scopeFilters: Prisma.ExamWhereInput[] = [];

    if (access.ownLessons) {
      scopeFilters.push({
        lesson: {
          teacherId: userId,
        },
      });
    }

    if (access.ownStudentClass) {
      scopeFilters.push({
        lesson: {
          class: {
            students: {
              some: {
                id: userId,
              },
            },
          },
        },
      });
    }

    if (access.ownChildrenClasses) {
      scopeFilters.push({
        lesson: {
          class: {
            students: {
              some: {
                parentId: userId,
              },
            },
          },
        },
      });
    }

    query.AND = [
      {
        OR: scopeFilters,
      },
    ];
  }

  /* ======================================================================== */
  /* DATA                                                                     */
  /* ======================================================================== */

  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,

      include: {
        lesson: {
          select: {
            subject: {
              select: {
                name: true,
              },
            },

            teacher: {
              select: {
                name: true,

                surname: true,
              },
            },

            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },

      take: ITEM_PER_PAGE,

      skip: ITEM_PER_PAGE * (p - 1),
    }),

    prisma.exam.count({
      where: query,
    }),
  ]);

  /* ======================================================================== */
  /* ROW                                                                      */
  /* ======================================================================== */

  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center gap-4 p-4">
        {item.lesson.subject.name}
      </td>

      <td>{item.lesson.class.name}</td>

      <td className="hidden md:table-cell">
        {`${item.lesson.teacher.name} ${item.lesson.teacher.surname}`}
      </td>

      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {canManage ? (
        <td>
          <div className="flex items-center gap-2">
            <FormContainer table="exam" type="update" data={item} />

            <FormContainer table="exam" type="delete" id={item.id} />
          </div>
        </td>
      ) : null}
    </tr>
  );

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">All Exams</h1>

        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>

            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>

            {canManage ? <FormContainer table="exam" type="create" /> : null}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={p} count={count} />
    </div>
  );
}
