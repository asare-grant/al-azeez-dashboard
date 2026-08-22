// src/app/(dashboard)/list/teachers/[id]/page.tsx

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";

import {
  contextHasPermission,
  getCurrentAccessContext,
} from "@/lib/access-control";

import { requireTeacherPermission } from "@/lib/teachers/auth";

import prisma from "@/lib/prisma";

import type { Teacher } from "@prisma/client";

import Image from "next/image";
import Link from "next/link";

import { notFound, redirect } from "next/navigation";

export const revalidate = 0;

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

const SingleTeacherPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  if (!id) {
    return notFound();
  }

  /* ---------------------------------------------------------------------- */
  /* ACCESS                                                                 */
  /* ---------------------------------------------------------------------- */

  const access = await getCurrentAccessContext();

  if (!access.authenticated) {
    redirect("/sign-in");
  }

  if (!contextHasPermission(access, "teachers.view")) {
    redirect("/");
  }

  const { userId, scope: teacherViewScope } =
    await requireTeacherPermission("teachers.view");

  const selfOnlyTeacherView = teacherViewScope === "SELF";

  if (selfOnlyTeacherView && id !== userId) {
    return notFound();
  }

  /* ---------------------------------------------------------------------- */
  /* CAPABILITIES                                                           */
  /* ---------------------------------------------------------------------- */

  const canUpdateTeacher = contextHasPermission(access, "teachers.update");

  const canViewClasses = contextHasPermission(access, "academics.classes.view");

  const canViewStudents = contextHasPermission(access, "students.view");

  const canViewLessons = contextHasPermission(access, "academics.lessons.view");

  const canViewExams = contextHasPermission(access, "exams.view");

  const canViewAssignments = contextHasPermission(access, "assignments.view");

  /* ---------------------------------------------------------------------- */
  /* TEACHER                                                                */
  /* ---------------------------------------------------------------------- */

  const teacher:
    | (Teacher & {
        _count: {
          subjects: number;
          lessons: number;
          classes: number;
        };
      })
    | null = await prisma.teacher.findFirst({
    where: {
      id,
    },

    include: {
      _count: {
        select: {
          subjects: true,

          lessons: true,

          classes: true,
        },
      },
    },
  });

  if (!teacher) {
    return notFound();
  }

  /* ---------------------------------------------------------------------- */
  /* UI                                                                     */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 xl:flex-row">
      {/* ================================================================= */}
      {/* LEFT                                                              */}
      {/* ================================================================= */}

      <div className="w-full xl:w-2/3">
        {/* TOP */}

        <div className="flex flex-col gap-4 lg:flex-row">
          {/* USER INFO CARD */}

          <div className="flex flex-1 gap-4 rounded-md bg-[#C3EBFA] px-4 py-6">
            <div className="w-1/3">
              <Image
                src={teacher.img || "/noAvatar.png"}
                alt={`${teacher.name} ${teacher.surname}`}
                width={144}
                height={144}
                unoptimized={Boolean(teacher.img)}
                className="h-36 w-36 rounded-full object-cover"
              />
            </div>

            <div className="flex w-2/3 flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name} {teacher.surname}
                </h1>

                {canUpdateTeacher && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>

              <p className="text-sm text-gray-500">
                Teaching with passion, leading with purpose.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
                <div className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <Image src="/blood.png" alt="" width={14} height={14} />

                  <span>{teacher.teacherID}</span>
                </div>

                <div className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <Image src="/date.png" alt="" width={14} height={14} />

                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}
                  </span>
                </div>

                <div className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <Image src="/mail.png" alt="" width={14} height={14} />

                  <span>{teacher.email || "-"}</span>
                </div>

                <div className="flex w-full items-center gap-2 md:w-1/3 lg:w-full 2xl:w-1/3">
                  <Image src="/phone.png" alt="" width={14} height={14} />

                  <span>{teacher.phone || "-"}</span>
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

              <div>
                <h1 className="text-xl font-semibold">90%</h1>

                <span className="text-sm text-gray-400">Attendance</span>
              </div>
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
                <h1 className="text-xl font-semibold">
                  {teacher._count.subjects}
                </h1>

                <span className="text-sm text-gray-400">Branches</span>
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
                  {teacher._count.lessons}
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
                <h1 className="text-xl font-semibold">
                  {teacher._count.classes}
                </h1>

                <span className="text-sm text-gray-400">Classes</span>
              </div>
            </div>
          </div>
        </div>

        {/* SCHEDULE */}

        <div className="mt-4 h-[800px] rounded-md bg-white p-4">
          <h1>Teacher&apos;s Schedule</h1>

          <BigCalendarContainer type="teacherId" id={teacher.id} />
        </div>
      </div>

      {/* ================================================================= */}
      {/* RIGHT                                                             */}
      {/* ================================================================= */}

      <div className="flex w-full flex-col gap-4 xl:w-1/3">
        {/* SHORTCUTS */}

        <div className="rounded-md bg-white p-4">
          <h1 className="text-xl font-semibold">Shortcuts</h1>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            {canViewClasses && (
              <Link
                className="rounded-md bg-[#EDF9FD] p-3"
                href={`/list/classes?supervisorId=${teacher.id}`}
              >
                Teacher&apos;s Classes
              </Link>
            )}

            {canViewStudents && (
              <Link
                className="rounded-md bg-[#F1F0FF] p-3"
                href={`/list/students?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Students
              </Link>
            )}

            {canViewLessons && (
              <Link
                className="rounded-md bg-[#FEFCE8] p-3"
                href={`/list/lessons?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Lessons
              </Link>
            )}

            {canViewExams && (
              <Link
                className="rounded-md bg-pink-50 p-3"
                href={`/list/exams?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Exams
              </Link>
            )}

            {canViewAssignments && (
              <Link
                className="rounded-md bg-[#EDF9FD] p-3"
                href={`/list/assignments?teacherId=${teacher.id}`}
              >
                Teacher&apos;s Assignments
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

export default SingleTeacherPage;
