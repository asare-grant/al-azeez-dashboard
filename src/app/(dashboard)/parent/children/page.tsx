import Link from "next/link";

import {
  Award,
  ChevronRight,
  FileText,
  GraduationCap,
  UsersRound,
} from "lucide-react";

import {
  getParentChildrenForReportCards,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function ParentChildrenPage() {
  const children =
    await getParentChildrenForReportCards();

  const publishedReportCount =
    children.reduce(
      (total, child) =>
        total +
        child.publishedReportCount,
      0,
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                <UsersRound className="h-4 w-4" />
                Parent Academic Portal
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                My Children
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Select a child to view their
                published terminal report cards,
                grades, subject performance,
                attendance and teacher remarks.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroMetric
                label="Children"
                value={String(
                  children.length,
                )}
                icon={UsersRound}
              />

              <HeroMetric
                label="Published Reports"
                value={String(
                  publishedReportCount,
                )}
                icon={FileText}
              />
            </div>
          </div>
        </section>

        {children.length === 0 ? (
          <EmptyChildrenState />
        ) : (
          <section className="mt-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Student Profiles
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Select a child
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Each profile contains only
                report cards officially
                published by the school.
              </p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {children.map(
                (child) => (
                  <article
                    key={child.id}
                    className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.1)]"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-white p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                          <GraduationCap className="h-6 w-6" />
                        </div>

                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-blue-700">
                          {
                            child.publishedReportCount
                          }{" "}
                          report
                          {child.publishedReportCount ===
                          1
                            ? ""
                            : "s"}
                        </span>
                      </div>

                      <h3 className="mt-5 text-xl font-black text-slate-950">
                        {child.name}{" "}
                        {child.surname}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {child.studentId}
                      </p>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-3">
                        <Metric
                          label="Class"
                          value={
                            child.class.name
                          }
                        />

                        <Metric
                          label="Grade"
                          value={
                            child.grade.level
                          }
                        />

                        <Metric
                          label="Latest Average"
                          value={
                            child.latestReport
                              ?.averageScore ===
                            null ||
                            child.latestReport
                              ?.averageScore ===
                            undefined
                              ? "—"
                              : `${child.latestReport.averageScore.toFixed(
                                  1,
                                )}%`
                          }
                        />

                        <Metric
                          label="Latest Grade"
                          value={
                            child.latestReport
                              ?.overallGrade ??
                            "—"
                          }
                        />
                      </div>

                      <Link
                        href={`/parent/children/${child.id}/report-cards`}
                        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition group-hover:bg-blue-700"
                      >
                        View Report Cards

                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Award;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
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

function EmptyChildrenState() {
  return (
    <section className="mt-6 flex min-h-[400px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
        <UsersRound className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-2xl font-black text-slate-950">
        No student profiles found
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        No students are currently connected
        to this parent account. Contact the
        school administrator if this appears
        to be incorrect.
      </p>
    </section>
  );
}