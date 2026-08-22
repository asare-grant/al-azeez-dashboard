// src/app/(dashboard)/list/results/legacy/page.tsx

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";

import { ITEM_PER_PAGE } from "@/lib/settings";

import { requireResultsManagementAccess } from "@/lib/results/result-access";

import { Prisma } from "@prisma/client";

import Image from "next/image";

export const revalidate = 0;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ResultList = {
  id: number;

  title: string;

  studentName: string;

  studentSurname: string;

  teacherName: string;

  teacherSurname: string;

  score: number;

  totalMarks: number | null;

  percentage: number | null;

  /*
   * Keep `type` because ResultForm expects
   * the normal Result type property.
   */
  type: "EXAM" | "ASSIGNMENT" | "ASSESSMENT";

  /*
   * IDs required by the Result update form.
   */
  studentId: string;

  examId: number | null;

  assignmentId: number | null;

  assessmentId: number | null;

  className: string;

  startTime: Date;
};

/* ========================================================================== */
/* FORMAT PERCENTAGE                                                          */
/* ========================================================================== */

function formatPercentage(
  percentage: number | null,

  score: number,

  totalMarks: number | null,
) {
  if (percentage !== null) {
    return `${Number(percentage.toFixed(1))}%`;
  }

  if (totalMarks !== null && totalMarks > 0) {
    const calculated = (score / totalMarks) * 100;

    return `${Number(calculated.toFixed(1))}%`;
  }

  return "—";
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function ResultListPage(props: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  /* ------------------------------------------------------------------------ */
  /* SEARCH PARAMS                                                            */
  /* ------------------------------------------------------------------------ */

  const searchParams = await props.searchParams;

  /* ------------------------------------------------------------------------ */
  /* AUTHORIZATION                                                            */
  /* ------------------------------------------------------------------------ */

  /*
   * This is now the authorization boundary
   * for the manual Results Entry workspace.
   *
   * Possible scopes:
   *
   * GLOBAL
   * TEACHER_OWNED
   */
  const access = await requireResultsManagementAccess();

  const currentUserId = access.userId;

  const teacherOwned = access.scope === "TEACHER_OWNED";

  /* ------------------------------------------------------------------------ */
  /* COLUMNS                                                                  */
  /* ------------------------------------------------------------------------ */

  const columns = [
    {
      header: "Title",

      accessor: "title",
    },

    {
      header: "Student",

      accessor: "student",
    },

    {
      header: "Score (%)",

      accessor: "score",

      className: "hidden md:table-cell",
    },

    {
      header: "Teacher",

      accessor: "teacher",

      className: "hidden md:table-cell",
    },

    {
      header: "Class",

      accessor: "class",

      className: "hidden md:table-cell",
    },

    {
      header: "Date",

      accessor: "date",

      className: "hidden md:table-cell",
    },

    {
      header: "Actions",

      accessor: "action",
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* ROW RENDERER                                                             */
  /* ------------------------------------------------------------------------ */

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
    >
      {/* TITLE */}

      <td className="flex items-center gap-4 p-4">{item.title}</td>

      {/* STUDENT */}

      <td>{`${item.studentName} ${item.studentSurname}`}</td>

      {/* SCORE */}

      <td className="hidden md:table-cell">
        <div>
          <p className="text-base font-black text-blue-700">
            {formatPercentage(
              item.percentage,

              item.score,

              item.totalMarks,
            )}
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            {item.score}
            {item.totalMarks !== null ? `/${item.totalMarks}` : ""} marks
          </p>
        </div>
      </td>

      {/* TEACHER */}

      <td className="hidden md:table-cell">
        {`${item.teacherName} ${item.teacherSurname}`}
      </td>

      {/* CLASS */}

      <td className="hidden md:table-cell">{item.className}</td>

      {/* DATE */}

      <td className="hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {/* ACTIONS */}

      <td>
        {item.type === "ASSESSMENT" ? (
          /*
           * Assessment results belong to the
           * Assessment subsystem.
           *
           * They are visible here because they
           * contribute to the unified academic
           * result/report-card architecture,
           * but they must not be manually edited
           * or deleted here.
           */
          <span className="text-xs font-semibold text-slate-400">
            <small>Managed in <br/>Assessments </small>
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <FormContainer table="result" type="update" data={item} />

            <FormContainer table="result" type="delete" id={item.id} />
          </div>
        )}
      </td>
    </tr>
  );

  /* ------------------------------------------------------------------------ */
  /* PAGINATION                                                               */
  /* ------------------------------------------------------------------------ */

  const { page, ...queryParams } = searchParams;

  const parsedPage = Number(Array.isArray(page) ? page[0] : page);

  const p = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  /* ------------------------------------------------------------------------ */
  /* QUERY CONDITIONS                                                         */
  /* ------------------------------------------------------------------------ */

  /*
   * IMPORTANT:
   *
   * Search and Teacher ownership are built as
   * separate conditions.
   *
   * The previous implementation assigned query.OR
   * twice, causing Teacher ownership to overwrite
   * the search OR conditions.
   */
  const conditions: Prisma.ResultWhereInput[] = [];

  /* ------------------------------------------------------------------------ */
  /* STUDENT FILTER                                                           */
  /* ------------------------------------------------------------------------ */

  const studentIdParam = queryParams.studentId;

  const studentId = Array.isArray(studentIdParam)
    ? studentIdParam[0]
    : studentIdParam;

  if (studentId) {
    conditions.push({
      studentId,
    });
  }

  /* ------------------------------------------------------------------------ */
  /* SEARCH FILTER                                                            */
  /* ------------------------------------------------------------------------ */

  const searchParam = queryParams.search;

  const search = Array.isArray(searchParam) ? searchParam[0] : searchParam;

  const normalizedSearch = search?.trim();

  if (normalizedSearch) {
    conditions.push({
      OR: [
        {
          exam: {
            title: {
              contains: normalizedSearch,

              mode: "insensitive",
            },
          },
        },

        {
          assignment: {
            title: {
              contains: normalizedSearch,

              mode: "insensitive",
            },
          },
        },

        {
          assessment: {
            title: {
              contains: normalizedSearch,

              mode: "insensitive",
            },
          },
        },

        {
          student: {
            name: {
              contains: normalizedSearch,

              mode: "insensitive",
            },
          },
        },

        {
          student: {
            surname: {
              contains: normalizedSearch,

              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  /* ------------------------------------------------------------------------ */
  /* TEACHER OWNERSHIP                                                        */
  /* ------------------------------------------------------------------------ */

  if (teacherOwned) {
    conditions.push({
      OR: [
        {
          exam: {
            lesson: {
              teacherId: currentUserId,
            },
          },
        },

        {
          assignment: {
            lesson: {
              teacherId: currentUserId,
            },
          },
        },

        {
          assessment: {
            lesson: {
              teacherId: currentUserId,
            },
          },
        },
      ],
    });
  }

  /* ------------------------------------------------------------------------ */
  /* FINAL QUERY                                                              */
  /* ------------------------------------------------------------------------ */

  const query: Prisma.ResultWhereInput =
    conditions.length > 0
      ? {
          AND: conditions,
        }
      : {};

  /* ------------------------------------------------------------------------ */
  /* FETCH RESULTS                                                            */
  /* ------------------------------------------------------------------------ */

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,

      include: {
        student: {
          select: {
            id: true,

            name: true,

            surname: true,
          },
        },

        exam: {
          include: {
            lesson: {
              select: {
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
            },
          },
        },

        assignment: {
          include: {
            lesson: {
              select: {
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
            },
          },
        },

        assessment: {
          include: {
            lesson: {
              include: {
                subject: true,

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
            },
          },
        },

        assessmentAttempt: true,
      },

      take: ITEM_PER_PAGE,

      skip: ITEM_PER_PAGE * (p - 1),

      orderBy: {
        id: "desc",
      },
    }),

    prisma.result.count({
      where: query,
    }),
  ]);

  /* ------------------------------------------------------------------------ */
  /* TRANSFORM TABLE DATA                                                     */
  /* ------------------------------------------------------------------------ */

  const data = dataRes
    .map((item): ResultList | null => {
      const academicItem = item.exam ?? item.assignment ?? item.assessment;

      if (!academicItem) {
        return null;
      }

      let type: "EXAM" | "ASSIGNMENT" | "ASSESSMENT";

      let startTime: Date;

      if (item.exam) {
        type = "EXAM";

        startTime = item.exam.startTime;
      } else if (item.assignment) {
        type = "ASSIGNMENT";

        startTime = item.assignment.startDate;
      } else {
        type = "ASSESSMENT";

        startTime = item.assessment!.startDate;
      }

      return {
        id: item.id,

        title: academicItem.title,

        studentId: item.studentId,

        studentName: item.student.name,

        studentSurname: item.student.surname,

        teacherName: academicItem.lesson.teacher.name,

        teacherSurname: academicItem.lesson.teacher.surname,

        score: item.score,

        totalMarks: item.totalMarks,

        percentage: item.percentage,

        type,

        examId: item.examId,

        assignmentId: item.assignmentId,

        assessmentId: item.assessmentId,

        className: academicItem.lesson.class.name,

        startTime,
      };
    })
    .filter((item): item is ResultList => item !== null);

  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                     */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="hidden md:block text-lg font-semibold">
            Academic Results Entry
          </h1>

          <p className="mt-1 hidden text-xs text-slate-400 md:block">
            Record and manage examination and assignment scores.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>

            {/*
             * Permission-gated manual result creation 
             */}
            <FormContainer table="result" type="create" />
          </div>
        </div>
      </div>

      {/* TABLE */}

      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}

      <Pagination page={p} count={count} />
    </div>
  );
}
