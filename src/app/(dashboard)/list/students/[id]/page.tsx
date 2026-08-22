// src/app/(dashboard)/list/students/[id]/page.tsx

import FeeStatementForm from "@/components/admin/FeeStatementForm";
import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";

import {
  contextHasPermission,
  getCurrentAccessContext,
} from "@/lib/access-control";

import { requireStudentPermission } from "@/lib/students/auth";

import prisma from "@/lib/prisma";

import { Class, Grade, Student } from "@prisma/client";

import Image from "next/image";
import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { Suspense } from "react";

export const revalidate = 0;

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

const SingleStudentPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  if (!id) {
    return notFound();
  }

  /* ====================================================================== */
  /* ACCESS                                                                 */
  /* ====================================================================== */

  const access = await getCurrentAccessContext();

  if (!access.authenticated) {
    redirect("/sign-in");
  }

  if (!contextHasPermission(access, "students.view")) {
    redirect("/");
  }

  const canUpdateStudent = contextHasPermission(access, "students.update");

  const canGenerateFeeStatement = contextHasPermission(
    access,
    "finance.statements.generate",
  );

  const canViewAttendance = contextHasPermission(access, "attendance.view");

  const canViewLessons = contextHasPermission(access, "academics.lessons.view");

  const canViewTeachers = contextHasPermission(access, "teachers.view");

  const canViewExams = contextHasPermission(access, "exams.view");

  const canViewAssignments = contextHasPermission(access, "assignments.view");

  const canViewResults = contextHasPermission(access, "results.view");

  const { userId, scope: studentViewScope } =
    await requireStudentPermission("students.view");

  const teacherOnlyScope = studentViewScope === "TEACHER_OWNED";

  /* ====================================================================== */
  /* STUDENT                                                                */
  /* ====================================================================== */

  const student:
    | (Student & {
        class: Class & {
          _count: {
            lessons: number;
          };
        };

        grade: Grade;
      })
    | null = await prisma.student.findFirst({
    where: {
      id,

      ...(teacherOnlyScope
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
        : {}),
    },

    include: {
      class: {
        include: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },

      grade: true,
    },
  });

  /*
   * notFound() rather than "Forbidden" prevents
   * ownership-scoped users from learning whether an
   * inaccessible Student ID actually exists.
   */
  if (!student) {
    return notFound();
  }

  /* ====================================================================== */
  /* UI                                                                     */
  /* ====================================================================== */

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 xl:flex-row">
      {/* LEFT */}

      <div className="w-full xl:w-2/3">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* USER INFO */}

          <div className="flex flex-1 gap-4 rounded-md bg-[#C3EBFA] px-4 py-6">
            <div className="w-1/3">
              <Image
                src={student.img || "/noAvatar.png"}
                alt={`${student.name} ${student.surname}`}
                width={144}
                height={144}
                unoptimized={Boolean(student.img)}
                className="h-36 w-36 rounded-full object-cover"
              />
            </div>

            <div className="flex w-2/3 flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {student.name} {student.surname}
                </h1>

                {canUpdateStudent && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>

              <p className="text-sm text-gray-500">
                A young achiever inspired by Knowledge, Faith, and Perseverance.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
                <div className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <Image src="/blood.png" alt="" width={14} height={14} />

                  <span>{student.studentID}</span>
                </div>

                <div className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <Image src="/date.png" alt="" width={14} height={14} />

                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(student.birthday)}
                  </span>
                </div>

                <div className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <Image src="/mail.png" alt="" width={14} height={14} />

                  <span>{student.email || "-"}</span>
                </div>

                <div className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <Image src="/phone.png" alt="" width={14} height={14} />

                  <span>{student.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SMALL CARDS */}

          <div className="flex flex-1 flex-wrap justify-between gap-4">
            <div className="flex w-full gap-4 rounded-md bg-white p-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
              />

              {canViewAttendance ? (
                <Suspense fallback="loading...">
                  <StudentAttendanceCard id={student.id} />
                </Suspense>
              ) : (
                <div>
                  <h1 className="text-sm font-semibold text-gray-400">
                    Restricted
                  </h1>

                  <span className="text-sm text-gray-400">Attendance</span>
                </div>
              )}
            </div>

            <div className="flex w-full gap-4 rounded-md bg-white p-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleBranch.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
              />

              <div>
                <h1 className="text-[16px] font-semibold">
                  {student.grade.level}
                </h1>

                <span className="text-sm text-gray-400">Grade</span>
              </div>
            </div>

            <div className="flex w-full gap-4 rounded-md bg-white p-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleLesson.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
              />

              <div>
                <h1 className="text-xl font-semibold">
                  {student.class._count.lessons}
                </h1>

                <span className="text-sm text-gray-400">Lessons</span>
              </div>
            </div>

            <div className="flex w-full gap-4 rounded-md bg-white p-4 md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleClass.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6"
              />

              <div>
                <h1 className="text-[16px] font-semibold">
                  {student.class.name}
                </h1>

                <span className="text-sm text-gray-400">Class</span>
              </div>
            </div>
          </div>
        </div>

        {/* SCHEDULE */}

        {canViewLessons && (
          <div className="mt-4 h-[800px] rounded-md bg-white p-4">
            <h1>Student&apos;s Schedule</h1>

            <BigCalendarContainer type="classId" id={student.class.id} />
          </div>
        )}
      </div>

      {/* RIGHT */}

      <div className="flex w-full flex-col gap-4 xl:w-1/3">
        {canGenerateFeeStatement && <FeeStatementForm studentId={student.id} />}

        <div className="rounded-md bg-white p-4">
          <h1 className="text-xl font-semibold">Shortcuts</h1>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            {canViewLessons && (
              <Link
                className="rounded-md bg-[#EDF9FD] p-3"
                href={`/list/lessons?classId=${student.class.id}`}
              >
                Student&apos;s Lessons
              </Link>
            )}

            {canViewTeachers && (
              <Link
                className="rounded-md bg-[#F1F0FF] p-3"
                href={`/list/teachers?classId=${student.class.id}`}
              >
                Student&apos;s Teachers
              </Link>
            )}

            {canViewExams && (
              <Link
                className="rounded-md bg-pink-50 p-3"
                href={`/list/exams?classId=${student.class.id}`}
              >
                Student&apos;s Exams
              </Link>
            )}

            {canViewAssignments && (
              <Link
                className="rounded-md bg-[#EDF9FD] p-3"
                href={`/list/assignments?classId=${student.class.id}`}
              >
                Student&apos;s Assignments
              </Link>
            )}

            {canViewResults && (
              <Link
                className="rounded-md bg-[#FEFCE8] p-3"
                href={`/list/results?studentId=${student.id}`}
              >
                Student&apos;s Results
              </Link>
            )}
          </div>
        </div>

        <Performance />

        <Announcements />
      </div>
    </div>
  );
};

export default SingleStudentPage;
