// src/app/(dashboard)/parent/children/[childId]/report-cards/page.tsx
import Link from "next/link";

import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  History,
  School,
  Sparkles,
  Trophy,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  getParentChildReportCards,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ParentChildReportCardsPageProps = {
  params: Promise<{
    childId: string;
  }>;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: Date | string,
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function formatTermName(
  value: string,
) {
  return value.replace(
    /_/g,
    " ",
  );
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function ParentChildReportCardsPage({
  params,
}: ParentChildReportCardsPageProps) {
  const {
    childId,
  } = await params;

  if (!childId.trim()) {
    notFound();
  }

  const data =
    await getParentChildReportCards(
      childId,
    );

  if (!data) {
    notFound();
  }

  const {
    child,
    reportCards,
  } = data;

  const latestReport =
    reportCards[0] ??
    null;

  const scoredReports =
    reportCards
      .map(
        (reportCard) =>
          reportCard.averageScore,
      )
      .filter(
        (
          score,
        ): score is number =>
          score !== null,
      );

  const overallAverage =
    scoredReports.length >
    0
      ? scoredReports.reduce(
          (
            total,
            score,
          ) =>
            total +
            score,
          0,
        ) /
        scoredReports.length
      : null;

  const bestAverage =
    scoredReports.length >
    0
      ? Math.max(
          ...scoredReports,
        )
      : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_32%),linear-gradient(to_bottom,_#f8fafc,_#f1f5f9)] p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-[1700px]">

        {/* ------------------------------------------------------------------ */}
        {/*                             BACK LINK                              */}
        {/* ------------------------------------------------------------------ */}

        <div className="mb-5">
          <Link
            href="/parent/children"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />

            My Children
          </Link>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/*                               HERO                                 */}
        {/* ------------------------------------------------------------------ */}

        <section className="relative overflow-hidden rounded-[30px] border border-slate-800/70 bg-[linear-gradient(120deg,#07111f_0%,#0b1730_48%,#172554_100%)] shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:rounded-[34px]">

          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-blue-500/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-48 left-[35%] h-[380px] w-[380px] rounded-full bg-cyan-400/10 blur-3xl" />

          {/* Grid texture */}
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

            {/* TOP */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

              {/* CHILD IDENTITY */}
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5 text-blue-300" />

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Parent Academic Portal
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300 sm:text-xs">
                    Student Academic Profile
                  </p>

                  <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem] lg:leading-[1.05]">
                    {child.name}{" "}
                    {child.surname}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-slate-300">
                      {child.studentId}
                    </span>

                    <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-blue-200">
                      {child.class.name}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-slate-300">
                      {child.grade.level}
                    </span>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-[15px] sm:leading-7">
                    Review your child&apos;s officially published
                    academic reports, terminal grades, class
                    standing and historical performance from this
                    secure academic profile.
                  </p>
                </div>
              </div>

              {/* STATUS */}
              <div className="flex shrink-0 items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-3 pr-5 backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Academic Records
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />

                    <p className="text-sm font-black text-white">
                      Published records only
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO METRICS */}
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 lg:grid-cols-4">
              <ParentChildHeroMetric
                icon={FileText}
                label="Published Reports"
                value={String(
                  reportCards.length,
                )}
              />

              <ParentChildHeroMetric
                icon={Award}
                label="Latest Average"
                value={
                  latestReport
                    ?.averageScore ===
                    null ||
                  latestReport
                    ?.averageScore ===
                    undefined
                    ? "—"
                    : `${latestReport.averageScore.toFixed(
                        1,
                      )}%`
                }
              />

              <ParentChildHeroMetric
                icon={Trophy}
                label="Best Average"
                value={
                  bestAverage ===
                  null
                    ? "—"
                    : `${bestAverage.toFixed(
                        1,
                      )}%`
                }
              />

              <ParentChildHeroMetric
                icon={GraduationCap}
                label="Current Grade"
                value={
                  child.grade.level
                }
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/*                            EMPTY STATE                              */}
        {/* ------------------------------------------------------------------ */}

        {reportCards.length ===
        0 ? (
          <EmptyReportState
            childName={
              child.name
            }
          />
        ) : (
          <>
            {/* -------------------------------------------------------------- */}
            {/*                        LATEST REPORT                           */}
            {/* -------------------------------------------------------------- */}

            {latestReport ? (
              <section className="mt-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                      Latest Academic Record
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Most recent published report
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      A quick overview of your child&apos;s most
                      recent officially published terminal report.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Officially Published
                  </span>
                </div>

                <div className="mt-5 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
                  <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">

                    {/* MAIN */}
                    <div className="relative overflow-hidden p-5 sm:p-7 lg:p-8">
                      <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-blue-50 blur-3xl" />

                      <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_14px_32px_rgba(37,99,235,0.22)]">
                              <FileText className="h-6 w-6" />
                            </div>

                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-blue-600">
                                Latest Terminal Report
                              </p>

                              <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                                {formatTermName(
                                  latestReport
                                    .term
                                    .name,
                                )}
                              </h3>

                              <p className="mt-1 text-sm font-bold text-slate-500">
                                {
                                  latestReport.academicYear
                                }
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-700">
                            Published
                          </span>
                        </div>

                        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <LatestMetric
                            label="Average"
                            value={
                              latestReport
                                .averageScore ===
                              null
                                ? "—"
                                : `${latestReport.averageScore.toFixed(
                                    1,
                                  )}%`
                            }
                          />

                          <LatestMetric
                            label="Grade"
                            value={
                              latestReport
                                .overallGrade ??
                              "—"
                            }
                          />

                          <LatestMetric
                            label="Position"
                            value={
                              latestReport.overallPosition
                                ? `${latestReport.overallPosition}/${latestReport.classStudentCount ?? "—"}`
                                : "—"
                            }
                          />

                          <LatestMetric
                            label="Subjects"
                            value={`${latestReport.completedSubjectCount}/${latestReport.subjectCount}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SIDE */}
                    <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-400">
                        Report Details
                      </p>

                      <div className="mt-5 space-y-4">
                        <LatestDetail
                          icon={School}
                          label="Class"
                          value={
                            child.class
                              .name
                          }
                        />

                        <LatestDetail
                          icon={
                            GraduationCap
                          }
                          label="Grade"
                          value={
                            child.grade
                              .level
                          }
                        />

                        <LatestDetail
                          icon={
                            CalendarDays
                          }
                          label="Published"
                          value={formatDate(
                            latestReport.publishedAt ??
                              latestReport.generatedAt,
                          )}
                        />
                      </div>

                      <Link
                        href={`/parent/children/${child.id}/report-cards/${latestReport.id}`}
                        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
                      >
                        Open Latest Report

                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {/* -------------------------------------------------------------- */}
            {/*                         REPORT ARCHIVE                         */}
            {/* -------------------------------------------------------------- */}

            <section className="mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-blue-600" />

                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                      Academic History
                    </p>
                  </div>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Published report archive
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Review every terminal report officially
                    released by the school for this student.
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />

                  {reportCards.length}{" "}
                  {reportCards.length ===
                  1
                    ? "report"
                    : "reports"}{" "}
                  available
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {reportCards.map(
                  (
                    reportCard,
                    index,
                  ) => (
                    <ParentReportCard
                      key={
                        reportCard.id
                      }
                      childId={
                        child.id
                      }
                      reportCard={
                        reportCard
                      }
                      index={
                        index
                      }
                      latest={
                        reportCard.id ===
                        latestReport?.id
                      }
                    />
                  ),
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                           REPORT CARD                                      */
/* -------------------------------------------------------------------------- */

type ParentChildReportCardsData =
  NonNullable<
    Awaited<
      ReturnType<
        typeof getParentChildReportCards
      >
    >
  >;

type ParentReportCardItem =
  ParentChildReportCardsData[
    "reportCards"
  ][number];

type ParentReportCardProps = {
  childId: string;

  reportCard:
    ParentReportCardItem;

  index: number;

  latest: boolean;
};

function ParentReportCard({
  childId,
  reportCard,
  index,
  latest,
}: ParentReportCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_32px_90px_rgba(37,99,235,0.12)]">

      {/* Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-80" />

      <div className="relative p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-blue-50 transition duration-500 group-hover:scale-125" />

        <div className="relative">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)]">
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-600">
                  {
                    reportCard.academicYear
                  }
                </p>

                <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  {formatTermName(
                    reportCard
                      .term
                      .name,
                  )}
                </h3>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">
                Published
              </span>

              {latest ? (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-blue-700">
                  Latest
                </span>
              ) : null}
            </div>
          </div>

          {/* AVERAGE */}
          <div className="mt-6 rounded-[20px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#f8fafc)] p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Overall Average
                </p>

                <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
                  {reportCard.averageScore ===
                  null
                    ? "—"
                    : `${reportCard.averageScore.toFixed(
                        1,
                      )}%`}
                </p>
              </div>

              <div className="flex h-11 min-w-11 items-center justify-center rounded-2xl bg-white px-3 text-lg font-black text-blue-700 shadow-sm">
                {reportCard.overallGrade ??
                  "—"}
              </div>
            </div>
          </div>

          {/* METRICS */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ReportMetric
              label="Position"
              value={
                reportCard.overallPosition
                  ? `${reportCard.overallPosition} of ${reportCard.classStudentCount ?? "—"}`
                  : "—"
              }
            />

            <ReportMetric
              label="Subjects"
              value={`${reportCard.completedSubjectCount}/${reportCard.subjectCount}`}
            />
          </div>

          {/* PUBLISHED */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
              <CalendarDays className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                Published
              </p>

              <p className="mt-0.5 text-xs font-black text-slate-700">
                {formatDate(
                  reportCard.publishedAt ??
                    reportCard.generatedAt,
                )}
              </p>
            </div>
          </div>

          {/* ACTION */}
          <Link
            href={`/parent/children/${childId}/report-cards/${reportCard.id}`}
            className="mt-5 flex h-11 w-full items-center justify-between rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition duration-300 group-hover:bg-blue-600"
          >
            <span>
              View complete report
            </span>

            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </div>

      <span className="absolute bottom-3 right-5 text-[9px] font-black text-slate-200">
        {String(
          index + 1,
        ).padStart(
          2,
          "0",
        )}
      </span>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                           HERO METRIC                                      */
/* -------------------------------------------------------------------------- */

function ParentChildHeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof FileText;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="group rounded-[20px] border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-xl transition duration-300 hover:border-blue-400/20 hover:bg-white/[0.075] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-blue-200">
          <Icon className="h-4 w-4" />
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80 opacity-60" />
      </div>

      <p className="mt-4 break-words text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           LATEST METRIC                                    */
/* -------------------------------------------------------------------------- */

function LatestMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-slate-50 p-4">
      <p className="text-xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            REPORT METRIC                                   */
/* -------------------------------------------------------------------------- */

function ReportMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-slate-50/80 p-4">
      <p className="font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            LATEST DETAIL                                   */
/* -------------------------------------------------------------------------- */

function LatestDetail({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof School;

  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-black text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               EMPTY STATE                                  */
/* -------------------------------------------------------------------------- */

function EmptyReportState({
  childName,
}: {
  childName: string;
}) {
  return (
    <section className="relative mt-7 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative flex min-h-[430px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
          <FileText className="h-7 w-7" />
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
          <GraduationCap className="h-3.5 w-3.5" />
          Student Academic Records
        </div>

        <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          No published report cards yet
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
          There are currently no officially published terminal
          reports for {childName}. New reports will appear here
          after the school completes its academic review and
          publication process.
        </p>
      </div>
    </section>
  );
}