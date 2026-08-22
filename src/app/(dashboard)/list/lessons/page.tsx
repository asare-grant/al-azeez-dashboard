// src/app/(dashboard)/list/lessons/page.tsx

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import {
  requireLessonListAccess,
} from "@/lib/lessons/auth";

import prisma from "@/lib/prisma";

import { ITEM_PER_PAGE } from "@/lib/settings";

import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";

import Image from "next/image";

export const revalidate = 0;

type LessonList = Lesson & {
  subject: Subject;

  class: Class;

  teacher: Teacher;
};

export default async function LessonListPage(props: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const searchParams = await props.searchParams;

/* ======================================================================== */
/* ACCESS                                                                   */
/* ======================================================================== */

const lessonAccess =
  await requireLessonListAccess();

const {
  userId,
  canManage: canManageLessons,
  global: globalLessonView,
  ownLessons,
  ownStudentClass,
  ownChildrenClasses,
} = lessonAccess;

/*
 * A lesson manager may modify:
 *
 * - every lesson when they have global management authority;
 * - only their own lessons when management authority comes solely
 *   from the Teacher role.
 */
const canManageLessonRow = (
  item: LessonList,
) =>
  canManageLessons &&
  (
    globalLessonView ||
    (
      ownLessons &&
      item.teacherId ===
        userId
    )
  );
  /* ======================================================================== */
  /* TABLE COLUMNS                                                            */
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

    ...(canManageLessons
      ? [
          {
            header: "Actions",

            accessor: "action",
          },
        ]
      : []),
  ];

  /* ======================================================================== */
  /* ROW                                                                      */
  /* ======================================================================== */

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center gap-4 p-4">{item.subject.name}</td>

      <td>{item.class.name}</td>

      <td className="hidden md:table-cell">
        {`${item.teacher.name} ${item.teacher.surname}`}
      </td>

      {canManageLessons ? (
        <td>
          {canManageLessonRow(item) ? (
            <div className="flex items-center gap-2">
              <FormContainer table="lesson" type="update" data={item} />

              <FormContainer table="lesson" type="delete" id={item.id} />
            </div>
          ) : null}
        </td>
      ) : null}
    </tr>
  );

  /* ======================================================================== */
  /* PAGINATION + FILTERS                                                     */
  /* ======================================================================== */

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page as string) : 1;

/* ======================================================================== */
/* ACCESS SCOPE                                                             */
/* ======================================================================== */

const accessConditions:
  Prisma.LessonWhereInput[] = [];

if (!globalLessonView) {
  /*
   * Teacher
   * -------
   * View lessons taught by the authenticated teacher.
   */
  if (ownLessons) {
    accessConditions.push({
      teacherId:
        userId,
    });
  }

  /*
   * Student
   * -------
   * View every lesson belonging to the student's own class.
   */
  if (ownStudentClass) {
    accessConditions.push({
      class: {
        students: {
          some: {
            id:
              userId,
          },
        },
      },
    });
  }

  /*
   * Parent
   * ------
   * View every lesson belonging to any class containing
   * one of the parent's linked children.
   *
   * This naturally supports parents with children in
   * multiple classes.
   */
  if (ownChildrenClasses) {
    accessConditions.push({
      class: {
        students: {
          some: {
            parentId:
              userId,
          },
        },
      },
    });
  }
}

const accessScope:
  Prisma.LessonWhereInput =
  globalLessonView
    ? {}
    : {
        OR:
          accessConditions,
      };

/* ======================================================================== */
/* USER FILTERS                                                             */
/* ======================================================================== */

const filterQuery:
  Prisma.LessonWhereInput = {};

for (
  const [
    key,
    value,
  ] of Object.entries(
    queryParams,
  )
) {
  if (
    value === undefined
  ) {
    continue;
  }

  const resolvedValue =
    Array.isArray(value)
      ? value[0]
      : value;

  if (
    !resolvedValue?.trim()
  ) {
    continue;
  }

  switch (key) {
    case "classId": {
      const classId =
        Number.parseInt(
          resolvedValue,
          10,
        );

      if (
        Number.isInteger(
          classId,
        ) &&
        classId > 0
      ) {
        filterQuery.classId =
          classId;
      }

      break;
    }

    case "teacherId":
      filterQuery.teacherId =
        resolvedValue;

      break;

    case "search":
      filterQuery.OR = [
        {
          subject: {
            name: {
              contains:
                resolvedValue,

              mode:
                "insensitive",
            },
          },
        },

        {
          teacher: {
            name: {
              contains:
                resolvedValue,

              mode:
                "insensitive",
            },
          },
        },

        {
          teacher: {
            surname: {
              contains:
                resolvedValue,

              mode:
                "insensitive",
            },
          },
        },

        {
          class: {
            name: {
              contains:
                resolvedValue,

              mode:
                "insensitive",
            },
          },
        },
      ];

      break;

    default:
      break;
  }
}

/* ======================================================================== */
/* FINAL QUERY                                                              */
/* ======================================================================== */

/*
 * Access authority and user-supplied filters are deliberately
 * combined with AND.
 *
 * Therefore query-string manipulation can narrow permitted data,
 * but can never broaden the actor's permitted lesson scope.
 */
const query:
  Prisma.LessonWhereInput = {
    AND: [
      accessScope,
      filterQuery,
    ],
  };

  /* ======================================================================== */
  /* DATA                                                                     */
  /* ======================================================================== */

  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,

      include: {
        subject: {
          select: {
            name: true,
          },
        },

        class: {
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
      },

      take: ITEM_PER_PAGE,

      skip: ITEM_PER_PAGE * (p - 1),
    }),

    prisma.lesson.count({
      where: query,
    }),
  ]);

  /* ======================================================================== */
  /* PAGE                                                                     */
  /* ======================================================================== */

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <div className="flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">All Lessons</h1>

        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>

            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>

            {canManageLessons ? (
              <FormContainer table="lesson" type="create" />
            ) : null}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={p} count={count} />
    </div>
  );
}
