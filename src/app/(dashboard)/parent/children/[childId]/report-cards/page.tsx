import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  FileText,
  GraduationCap,
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

type ParentChildReportCardsPageProps = {
  params: Promise<{
    childId: string;
  }>;
};

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/parent/children"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          My Children
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.2)] sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                <GraduationCap className="h-4 w-4" />
                Published Academic Records
              </div>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                {child.name}{" "}
                {child.surname}
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-300">
                {child.studentId}
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-400">
                {child.class.name} •{" "}
                {child.grade.level}
              </p>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-3xl font-black">
                {reportCards.length}
              </p>

              <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                Published Report Cards
              </p>
            </div>
          </div>
        </section>

        {reportCards.length === 0 ? (
          <section className="mt-6 flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
            <FileText className="h-12 w-12 text-blue-600" />

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              No published report cards
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Report cards will appear here
              after they have been reviewed
              and published by the school.
            </p>
          </section>
        ) : (
          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reportCards.map(
              (reportCard) => (
                <article
                  key={reportCard.id}
                  className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition hover:-translate-y-1"
                >
                  <div className="border-b border-slate-100 bg-blue-50/60 p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                        <FileText className="h-5 w-5" />
                      </div>

                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                        Published
                      </span>
                    </div>

                    <h2 className="mt-5 text-xl font-black text-slate-950">
                      {reportCard.term.name.replace(
                        /_/g,
                        " ",
                      )}
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {
                        reportCard.academicYear
                      }
                    </p>
                  </div>

                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <Metric
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

                      <Metric
                        label="Grade"
                        value={
                          reportCard.overallGrade ??
                          "—"
                        }
                      />

                      <Metric
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

                      <Metric
                        label="Subjects"
                        value={`${reportCard.completedSubjectCount}/${reportCard.subjectCount}`}
                      />
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                      <CalendarDays className="h-4 w-4 text-slate-400" />

                      <p className="text-xs font-bold text-slate-600">
                        Published{" "}
                        {formatDate(
                          reportCard.publishedAt ??
                            reportCard.generatedAt,
                        )}
                      </p>
                    </div>

                    <Link
                      href={`/parent/children/${child.id}/report-cards/${reportCard.id}`}
                      className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white transition group-hover:bg-blue-700"
                    >
                      View Complete Report

                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ),
            )}
          </section>
        )}
      </div>
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