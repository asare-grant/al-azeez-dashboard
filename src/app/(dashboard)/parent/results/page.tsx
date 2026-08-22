import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  GraduationCap,
  LayoutDashboard,
  School,
  UsersRound,
} from "lucide-react";

import { auth } from "@clerk/nextjs/server";
import { requirePermission } from "@/lib/access-control";

import {
  redirect,
} from "next/navigation";

import prisma from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function ParentResultsPage() {

 const { userId } = await auth();

if (!userId) {
  redirect("/sign-in");
}

await requirePermission("results.view");

  const children =
    await prisma.student.findMany({
      where: {
        parentId:
          userId,
      },

      select: {
        id:
          true,

        studentID:
          true,

        name:
          true,

        surname:
          true,

        img:
          true,

        class: {
          select: {
            id:
              true,

            name:
              true,
          },
        },

        grade: {
          select: {
            id:
              true,

            level:
              true,
          },
        },

        results: {
          select: {
            id:
              true,
          },
        },

        assessmentAttempts: {
          where: {
            status:
              "SUBMITTED",
          },

          select: {
            id:
              true,
          },
        },
      },

      orderBy: [
        {
          surname:
            "asc",
        },

        {
          name:
            "asc",
        },
      ],
    });

  const totalResultRecords =
    children.reduce(
      (
        total,
        child,
      ) =>
        total +
        child.results.length +
        child.assessmentAttempts.length,
      0,
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href="/parent/assessments"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Assessments
          </Link>

          {/* <Link
            href="/list/results/legacy"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <BarChart3 className="h-4 w-4" />
            Legacy Results
          </Link> */}

          <Link
            href="/parent"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[34px] border border-slate-800 bg-[linear-gradient(135deg,#020617_0%,#0f172a_52%,#172554_100%)] p-6 text-white shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-[28%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
                <UsersRound className="h-3.5 w-3.5" />

                Parent Academic Portal
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                Academic Results
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                My Children&apos;s Results
              </h1>

              <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                Select a child to review their examination, assignment and
                assessment results across the current and previous academic
                periods.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroMetric
                icon={
                  UsersRound
                }
                label="Children"
                value={
                  children.length
                }
              />

              <HeroMetric
                icon={
                  BookOpenCheck
                }
                label="Result Records"
                value={
                  totalResultRecords
                }
              />
            </div>
          </div>
        </section>

        {/* CHILDREN */}
        {children.length ===
        0 ? (
          <section className="mt-6 flex min-h-[380px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
              <UsersRound className="h-7 w-7" />
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No student profiles found
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              No students are currently connected to this parent account.
              Contact the school administrator if this appears to be
              incorrect.
            </p>
          </section>
        ) : (
          <section className="mt-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Student Profiles
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Select a child
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Open a student profile to view their academic result history.
              </p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {children.map(
                (
                  child,
                ) => {
                  const resultCount =
                    child.results.length +
                    child.assessmentAttempts.length;

                  return (
                    <article
                      key={
                        child.id
                      }
                      className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_26px_70px_rgba(37,99,235,0.10)]"
                    >
                      <div className="bg-gradient-to-br from-blue-50 to-white p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[20px] bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                            {child.img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={
                                  child.img
                                }
                                alt={`${child.name} ${child.surname}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <GraduationCap className="h-6 w-6" />
                            )}
                          </div>

                          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-700">
                            {
                              resultCount
                            }{" "}
                            {resultCount ===
                            1
                              ? "record"
                              : "records"}
                          </span>
                        </div>

                        <h3 className="mt-5 text-xl font-black text-slate-950">
                          {
                            child.name
                          }{" "}
                          {
                            child.surname
                          }
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {
                            child.studentID
                          }
                        </p>
                      </div>

                      <div className="p-5">
                        <div className="grid grid-cols-2 gap-3">
                          <Metric
                            label="Class"
                            value={
                              child.class
                                .name
                            }
                          />

                          <Metric
                            label="Grade"
                            value={
                              child.grade
                                .level
                            }
                          />
                        </div>

                        <Link
                          href={`/parent/results/${child.id}`}
                          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition group-hover:bg-blue-700"
                        >
                          View Results

                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof UsersRound;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}