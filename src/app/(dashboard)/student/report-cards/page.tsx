import Link from "next/link";

import {
  Award,
  CalendarDays,
  ChevronRight,
  FileText,
  GraduationCap,
  Trophy,
} from "lucide-react";

import {
  getStudentReportCards,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

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
  ).format(new Date(value));
}

export default async function StudentReportCardsPage() {
  /*
   * This query must enforce:
   *
   * studentId = authenticated student ID
   * status = PUBLISHED
   */
  const reportCards =
    await getStudentReportCards();

  const latestReport =
    reportCards[0] ?? null;

  const averageScores =
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
    averageScores.length > 0
      ? averageScores.reduce(
          (total, score) =>
            total + score,
          0,
        ) /
        averageScores.length
      : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                <GraduationCap className="h-4 w-4" />
                Student Academic Records
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                My Report Cards
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                View your published terminal
                results, subject performance,
                grades, class position and
                teacher remarks.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <HeroMetric
                label="Reports"
                value={String(
                  reportCards.length,
                )}
                icon={FileText}
              />

              <HeroMetric
                label="Overall Avg."
                value={
                  overallAverage === null
                    ? "—"
                    : `${overallAverage.toFixed(
                        1,
                      )}%`
                }
                icon={Award}
              />

              <HeroMetric
                label="Latest Grade"
                value={
                  latestReport
                    ?.overallGrade ??
                  "—"
                }
                icon={Trophy}
              />
            </div>
          </div>
        </section>

        {reportCards.length === 0 ? (
          <StudentReportCardsEmptyState />
        ) : (
          <section className="mt-6">
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Published Reports
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Academic report history
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select a report card to view
                the complete academic record.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reportCards.map(
                (reportCard) => (
                  <StudentReportCard
                    key={reportCard.id}
                    reportCard={
                      reportCard
                    }
                  />
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

type StudentReportCardProps = {
  reportCard: Awaited<
    ReturnType<
      typeof getStudentReportCards
    >
  >[number];
};

function StudentReportCard({
  reportCard,
}: StudentReportCardProps) {
  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.1)]">
      <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <FileText className="h-5 w-5" />
          </div>

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
            Published
          </span>
        </div>

        <h3 className="mt-5 text-xl font-black text-slate-950">
          {reportCard.term.name.replace(
            /_/g,
            " ",
          )}
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {reportCard.academicYear}
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <CardMetric
            label="Average"
            value={
              reportCard.averageScore ===
              null
                ? "—"
                : `${reportCard.averageScore.toFixed(
                    2,
                  )}%`
            }
          />

          <CardMetric
            label="Grade"
            value={
              reportCard.overallGrade ??
              "—"
            }
          />

          <CardMetric
            label="Position"
            value={
              reportCard.overallPosition
                ? `${reportCard.overallPosition} of ${
                    reportCard.classStudentCount ??
                    "—"
                  }`
                : "—"
            }
          />

          <CardMetric
            label="Subjects"
            value={`${reportCard.completedSubjectCount}/${reportCard.subjectCount}`}
          />
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
          <DetailRow
            icon={GraduationCap}
            label="Class"
            value={
              reportCard.class.name
            }
          />

          <DetailRow
            icon={CalendarDays}
            label="Published"
            value={formatDate(
              reportCard.publishedAt ??
                reportCard.generatedAt,
            )}
          />
        </div>

        <Link
          href={`/student/report-cards/${reportCard.id}`}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition group-hover:bg-blue-700"
        >
          View Complete Report

          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
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
    <article className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </article>
  );
}

function CardMetric({
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

      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function StudentReportCardsEmptyState() {
  return (
    <section className="mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
        <FileText className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-2xl font-black text-slate-950">
        No published report cards
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your published terminal report cards
        will appear here after they have been
        reviewed and released by the school.
      </p>
    </section>
  );
}