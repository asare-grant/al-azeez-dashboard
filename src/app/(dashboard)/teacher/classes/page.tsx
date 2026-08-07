import Link from "next/link";

import {
  ArrowUpRight,
  BookOpenCheck,
  ChevronRight,
  GraduationCap,
  Layers3,
  School,
  Sparkles,
  Users,
} from "lucide-react";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  redirect,
} from "next/navigation";

import prisma from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function TeacherClassesPage() {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (
    role !== "teacher" &&
    role !== "admin"
  ) {
    redirect("/");
  }

  const classes =
    await prisma.class.findMany({
      where:
        role === "teacher"
          ? {
              lessons: {
                some: {
                  teacherId:
                    userId,
                },
              },
            }
          : undefined,

      select: {
        id: true,
        name: true,

        grade: {
          select: {
            id: true,
            level: true,
          },
        },

        _count: {
          select: {
            students: true,
            lessons: true,
          },
        },

        lessons: {
          where:
            role === "teacher"
              ? {
                  teacherId:
                    userId,
                }
              : undefined,

          select: {
            id: true,

            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: [
        {
          grade: {
            level: "asc",
          },
        },
        {
          name: "asc",
        },
      ],
    });

  const classData =
    classes.map(
      (classItem) => {
        const uniqueSubjects =
          Array.from(
            new Map(
              classItem.lessons.map(
                (lesson) => [
                  lesson.subject.id,
                  lesson.subject,
                ],
              ),
            ).values(),
          );

        return {
          ...classItem,
          uniqueSubjects,
        };
      },
    );

  const totalStudents =
    classData.reduce(
      (
        total,
        classItem,
      ) =>
        total +
        classItem._count
          .students,
      0,
    );

  const totalLessons =
    classData.reduce(
      (
        total,
        classItem,
      ) =>
        total +
        classItem._count
          .lessons,
      0,
    );

  const uniqueSubjectMap =
    new Map<
      number,
      {
        id: number;
        name: string;
      }
    >();

  classData.forEach(
    (classItem) => {
      classItem.uniqueSubjects.forEach(
        (subject) => {
          uniqueSubjectMap.set(
            subject.id,
            subject,
          );
        },
      );
    },
  );

  const totalUniqueSubjects =
    uniqueSubjectMap.size;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_32%),linear-gradient(to_bottom,_#f8fafc,_#f1f5f9)] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1700px]">

        {/* ------------------------------------------------------------------ */}
        {/*                              HERO                                  */}
        {/* ------------------------------------------------------------------ */}

       <section className="relative overflow-hidden rounded-[30px] border border-slate-800/70 bg-[linear-gradient(120deg,#07111f_0%,#0b1730_48%,#172554_100%)] shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:rounded-[34px]">
  {/* Decorative glow */}
  <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-blue-500/15 blur-3xl" />

  <div className="pointer-events-none absolute -bottom-48 left-[35%] h-[380px] w-[380px] rounded-full bg-cyan-400/10 blur-3xl" />

  {/* Subtle grid texture */}
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.035]"
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
      backgroundSize:
        "42px 42px",
    }}
  />

  <div className="relative p-5 sm:p-7 lg:p-8 xl:p-9">
    {/* TOP ROW */}
    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
      {/* LEFT */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 backdrop-blur-xl">
          <Sparkles className="h-3.5 w-3.5 text-blue-300" />

          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
            Teacher Academic Workspace
          </span>
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300 sm:text-xs">
            Report Card Command Access
          </p>

          <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem] lg:leading-[1.05]">
            My Assigned Classes
          </h1>

          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-[15px] sm:leading-7">
            Access your assigned classes, review student performance,
            monitor report readiness and manage academic report operations
            from one workspace.
          </p>
        </div>
      </div>

      {/* RIGHT STATUS */}
      <div className="flex shrink-0 items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-3 pr-5 backdrop-blur-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
          <BookOpenCheck className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
            Workspace Status
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <p className="text-sm font-black text-white">
              Academic access active
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* METRICS */}
    <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
      <PremiumHeroMetric
        icon={School}
        label="Assigned Classes"
        value={classData.length}
      />

      <PremiumHeroMetric
        icon={Users}
        label="Total Students"
        value={totalStudents}
      />

      <PremiumHeroMetric
        icon={BookOpenCheck}
        label="Subjects"
        value={totalUniqueSubjects}
      />

      <PremiumHeroMetric
        icon={Layers3}
        label="Lessons"
        value={totalLessons}
      />
    </div>
  </div>
</section>

        {/* ------------------------------------------------------------------ */}
        {/*                          SECTION HEADER                             */}
        {/* ------------------------------------------------------------------ */}

        <section className="mt-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                Assigned Teaching Portfolio
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Select a class
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Each class opens its dedicated report-card command centre with
                student records, review status and report operations.
              </p>
            </div>

            {classData.length >
            0 ? (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                {classData.length}{" "}
                {classData.length ===
                1
                  ? "class"
                  : "classes"}{" "}
                available
              </div>
            ) : null}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/*                          EMPTY STATE                             */}
          {/* ---------------------------------------------------------------- */}

          {classData.length ===
          0 ? (
            <div className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
              <div className="relative p-8 text-center sm:p-12">
                <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-50 blur-3xl" />

                <div className="relative">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-200 bg-slate-50 text-slate-500 shadow-sm">
                    <School className="h-7 w-7" />
                  </div>

                  <h3 className="mt-5 text-2xl font-black text-slate-950">
                    No assigned classes yet
                  </h3>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                    You currently do not have any lessons connected to a class.
                    Once an administrator assigns your lessons, the relevant
                    classes will automatically appear here.
                  </p>
                </div>
              </div>
            </div>
          ) : (

            /* -------------------------------------------------------------- */
            /*                          CLASS CARDS                           */
            /* -------------------------------------------------------------- */

            <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {classData.map(
                (
                  classItem,
                  index,
                ) => (
                  <Link
                    key={
                      classItem.id
                    }
                    href={`/teacher/classes/${classItem.id}/report-cards`}
                    className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_32px_90px_rgba(37,99,235,0.12)]"
                  >
                    {/* TOP ACCENT */}
                    <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-80" />

                    <div className="relative p-5 sm:p-6">

                      <div className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full bg-blue-50 transition duration-500 group-hover:scale-125" />

                      <div className="relative">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)]">
                              <GraduationCap className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                                {
                                  classItem
                                    .grade
                                    .level
                                }
                              </p>

                              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                                {
                                  classItem.name
                                }
                              </h3>
                            </div>
                          </div>

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm transition duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>

                        {/* ---------------------------------------------------- */}
                        {/*                          METRICS                    */}
                        {/* ---------------------------------------------------- */}

                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <ClassMetric
                            icon={Users}
                            label="Students"
                            value={
                              classItem
                                ._count
                                .students
                            }
                          />

                          <ClassMetric
                            icon={
                              BookOpenCheck
                            }
                            label="My Subjects"
                            value={
                              classItem
                                .uniqueSubjects
                                .length
                            }
                          />
                        </div>

                        {/* ---------------------------------------------------- */}
                        {/*                         SUBJECTS                    */}
                        {/* ---------------------------------------------------- */}

                        <div className="mt-6">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                              Teaching subjects
                            </p>

                            <span className="text-[10px] font-black text-slate-400">
                              {
                                classItem
                                  .uniqueSubjects
                                  .length
                              }{" "}
                              total
                            </span>
                          </div>

                          {classItem
                            .uniqueSubjects
                            .length >
                          0 ? (
                            <div className="mt-3 flex min-h-[58px] flex-wrap content-start gap-2">
                              {classItem
                                .uniqueSubjects
                                .slice(
                                  0,
                                  5,
                                )
                                .map(
                                  (
                                    subject,
                                  ) => (
                                    <span
                                      key={
                                        subject.id
                                      }
                                      className="inline-flex h-7 items-center rounded-full border border-blue-100 bg-blue-50/70 px-3 text-[10px] font-black text-blue-700"
                                    >
                                      {
                                        subject.name
                                      }
                                    </span>
                                  ),
                                )}

                              {classItem
                                .uniqueSubjects
                                .length >
                              5 ? (
                                <span className="inline-flex h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-[10px] font-black text-slate-500">
                                  +
                                  {classItem
                                    .uniqueSubjects
                                    .length -
                                    5}{" "}
                                  more
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-400">
                              No subject assignments
                            </div>
                          )}
                        </div>

                        {/* ---------------------------------------------------- */}
                        {/*                         FOOTER                      */}
                        {/* ---------------------------------------------------- */}

                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                              Report workspace
                            </p>

                            <p className="mt-1 text-sm font-black text-slate-800">
                              Open class reports
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.20)] transition duration-300 group-hover:translate-x-1 group-hover:bg-blue-700">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SMALL CLASS INDEX */}
                    <div className="absolute bottom-4 right-5 text-[10px] font-black text-slate-200">
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HERO METRIC                                   */
/* -------------------------------------------------------------------------- */

function PremiumHeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;
  label: string;
  value: number;
}) {
  return (
    <div className="group rounded-[20px] border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-xl transition duration-300 hover:border-blue-400/20 hover:bg-white/[0.075] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-blue-200">
          <Icon className="h-4 w-4" />
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80 opacity-60" />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 sm:text-[10px]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/*                              CLASS METRIC                                  */
/* -------------------------------------------------------------------------- */

function ClassMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof Users;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-slate-50/80 p-4 transition duration-300 group-hover:bg-slate-50">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />

        <span className="text-[9px] font-black uppercase tracking-[0.13em]">
          {label}
        </span>
      </div>

      <p className="mt-3 text-xl font-black tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}