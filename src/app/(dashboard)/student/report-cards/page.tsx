// import Link from "next/link";

// import {
//   Award,
//   CalendarDays,
//   ChevronRight,
//   FileText,
//   GraduationCap,
//   Trophy,
// } from "lucide-react";

// import {
//   getStudentReportCards,
// } from "@/lib/report-cards/queries";

// export const dynamic =
//   "force-dynamic";

// export const revalidate = 0;

// function formatDate(
//   value: Date | string,
// ) {
//   return new Intl.DateTimeFormat(
//     "en-GH",
//     {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     },
//   ).format(new Date(value));
// }

// export default async function StudentReportCardsPage() {
//   /*
//    * This query must enforce:
//    *
//    * studentId = authenticated student ID
//    * status = PUBLISHED
//    */
//   const reportCards =
//     await getStudentReportCards();

//   const latestReport =
//     reportCards[0] ?? null;

//   const averageScores =
//     reportCards
//       .map(
//         (reportCard) =>
//           reportCard.averageScore,
//       )
//       .filter(
//         (
//           score,
//         ): score is number =>
//           score !== null,
//       );

//   const overallAverage =
//     averageScores.length > 0
//       ? averageScores.reduce(
//           (total, score) =>
//             total + score,
//           0,
//         ) /
//         averageScores.length
//       : null;

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-[1500px]">
//         <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
//           <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

//           <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

//           <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
//             <div>
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
//                 <GraduationCap className="h-4 w-4" />
//                 Student Academic Records
//               </div>

//               <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
//                 My Report Cards
//               </h1>

//               <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
//                 View your published terminal
//                 results, subject performance,
//                 grades, class position and
//                 teacher remarks.
//               </p>
//             </div>

//             <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
//               <HeroMetric
//                 label="Reports"
//                 value={String(
//                   reportCards.length,
//                 )}
//                 icon={FileText}
//               />

//               <HeroMetric
//                 label="Overall Avg."
//                 value={
//                   overallAverage === null
//                     ? "—"
//                     : `${overallAverage.toFixed(
//                         1,
//                       )}%`
//                 }
//                 icon={Award}
//               />

//               <HeroMetric
//                 label="Latest Grade"
//                 value={
//                   latestReport
//                     ?.overallGrade ??
//                   "—"
//                 }
//                 icon={Trophy}
//               />
//             </div>
//           </div>
//         </section>

//         {reportCards.length === 0 ? (
//           <StudentReportCardsEmptyState />
//         ) : (
//           <section className="mt-6">
//             <div className="mb-5">
//               <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
//                 Published Reports
//               </p>

//               <h2 className="mt-2 text-2xl font-black text-slate-950">
//                 Academic report history
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Select a report card to view
//                 the complete academic record.
//               </p>
//             </div>

//             <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
//               {reportCards.map(
//                 (reportCard) => (
//                   <StudentReportCard
//                     key={reportCard.id}
//                     reportCard={
//                       reportCard
//                     }
//                   />
//                 ),
//               )}
//             </div>
//           </section>
//         )}
//       </div>
//     </div>
//   );
// }

// type StudentReportCardProps = {
//   reportCard: Awaited<
//     ReturnType<
//       typeof getStudentReportCards
//     >
//   >[number];
// };

// function StudentReportCard({
//   reportCard,
// }: StudentReportCardProps) {
//   return (
//     <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.1)]">
//       <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white p-5">
//         <div className="flex items-start justify-between gap-4">
//           <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-600 text-white shadow-lg shadow-blue-600/20">
//             <FileText className="h-5 w-5" />
//           </div>

//           <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
//             Published
//           </span>
//         </div>

//         <h3 className="mt-5 text-xl font-black text-slate-950">
//           {reportCard.term.name.replace(
//             /_/g,
//             " ",
//           )}
//         </h3>

//         <p className="mt-1 text-sm font-semibold text-slate-500">
//           {reportCard.academicYear}
//         </p>
//       </div>

//       <div className="p-5">
//         <div className="grid grid-cols-2 gap-3">
//           <CardMetric
//             label="Average"
//             value={
//               reportCard.averageScore ===
//               null
//                 ? "—"
//                 : `${reportCard.averageScore.toFixed(
//                     2,
//                   )}%`
//             }
//           />

//           <CardMetric
//             label="Grade"
//             value={
//               reportCard.overallGrade ??
//               "—"
//             }
//           />

//           <CardMetric
//             label="Position"
//             value={
//               reportCard.overallPosition
//                 ? `${reportCard.overallPosition} of ${
//                     reportCard.classStudentCount ??
//                     "—"
//                   }`
//                 : "—"
//             }
//           />

//           <CardMetric
//             label="Subjects"
//             value={`${reportCard.completedSubjectCount}/${reportCard.subjectCount}`}
//           />
//         </div>

//         <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
//           <DetailRow
//             icon={GraduationCap}
//             label="Class"
//             value={
//               reportCard.class.name
//             }
//           />

//           <DetailRow
//             icon={CalendarDays}
//             label="Published"
//             value={formatDate(
//               reportCard.publishedAt ??
//                 reportCard.generatedAt,
//             )}
//           />
//         </div>

//         <Link
//           href={`/student/report-cards/${reportCard.id}`}
//           className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition group-hover:bg-blue-700"
//         >
//           View Complete Report

//           <ChevronRight className="h-4 w-4" />
//         </Link>
//       </div>
//     </article>
//   );
// }

// function HeroMetric({
//   label,
//   value,
//   icon: Icon,
// }: {
//   label: string;
//   value: string;
//   icon: typeof Award;
// }) {
//   return (
//     <article className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
//       <Icon className="h-5 w-5 text-blue-300" />

//       <p className="mt-3 text-xl font-black text-white">
//         {value}
//       </p>

//       <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
//         {label}
//       </p>
//     </article>
//   );
// }

// function CardMetric({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="rounded-2xl bg-slate-50 p-3">
//       <p className="font-black text-slate-950">
//         {value}
//       </p>

//       <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
//         {label}
//       </p>
//     </div>
//   );
// }

// function DetailRow({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: typeof CalendarDays;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
//         <Icon className="h-4 w-4" />
//       </div>

//       <div>
//         <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
//           {label}
//         </p>

//         <p className="mt-0.5 text-sm font-bold text-slate-700">
//           {value}
//         </p>
//       </div>
//     </div>
//   );
// }

// function StudentReportCardsEmptyState() {
//   return (
//     <section className="mt-6 flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
//       <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
//         <FileText className="h-7 w-7" />
//       </div>

//       <h2 className="mt-5 text-2xl font-black text-slate-950">
//         No published report cards
//       </h2>

//       <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
//         Your published terminal report cards
//         will appear here after they have been
//         reviewed and released by the school.
//       </p>
//     </section>
//   );
// }






import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpenCheck,
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
  getStudentReportCards,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

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

function formatScore(
  value: number | null,
  decimals = 1,
) {
  if (value === null) {
    return "—";
  }

  return `${value.toFixed(
    decimals,
  )}%`;
}

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function StudentReportCardsPage() {
  /*
   * Security is enforced by the query:
   *
   * studentId = authenticated student
   * status = PUBLISHED
   */
  const reportCards =
    await getStudentReportCards();

  const latestReport =
    reportCards[0] ??
    null;

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
    averageScores.length >
    0
      ? averageScores.reduce(
          (
            total,
            score,
          ) =>
            total +
            score,
          0,
        ) /
        averageScores.length
      : null;

  const bestAverage =
    averageScores.length >
    0
      ? Math.max(
          ...averageScores,
        )
      : null;

  const totalCompletedSubjects =
    reportCards.reduce(
      (
        total,
        reportCard,
      ) =>
        total +
        reportCard
          .completedSubjectCount,
      0,
    );

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

            {/* TOP ROW */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

              {/* LEFT */}
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 backdrop-blur-xl">
                  <Sparkles className="h-3.5 w-3.5 text-blue-300" />

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Student Academic Portal
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300 sm:text-xs">
                    Academic Performance Records
                  </p>

                  <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem] lg:leading-[1.05]">
                    My Report Cards
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-[15px] sm:leading-7">
                    Explore your published academic reports,
                    subject performance, grades, class position
                    and teacher feedback across every completed
                    school term.
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
                    Records Status
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

            {/* METRICS */}
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 lg:grid-cols-4">
              <StudentHeroMetric
                icon={FileText}
                label="Published Reports"
                value={String(
                  reportCards.length,
                )}
              />

              <StudentHeroMetric
                icon={Award}
                label="Overall Average"
                value={
                  overallAverage ===
                  null
                    ? "—"
                    : `${overallAverage.toFixed(
                        1,
                      )}%`
                }
              />

              <StudentHeroMetric
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

              <StudentHeroMetric
                icon={
                  BookOpenCheck
                }
                label="Subjects Recorded"
                value={String(
                  totalCompletedSubjects,
                )}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/*                        NO REPORTS STATE                            */}
        {/* ------------------------------------------------------------------ */}

        {reportCards.length ===
        0 ? (
          <StudentReportCardsEmptyState />
        ) : (
          <>
            {/* -------------------------------------------------------------- */}
            {/*                    LATEST REPORT SPOTLIGHT                     */}
            {/* -------------------------------------------------------------- */}

            {latestReport ? (
              <section className="mt-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                      Latest Academic Record
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Your most recent report
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      A quick overview of your latest published
                      academic performance.
                    </p>
                  </div>

                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Officially Published
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
                  <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)]">

                    {/* LEFT */}
                    <div className="relative overflow-hidden p-5 sm:p-7 lg:p-8">
                      <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-blue-50 blur-3xl" />

                      <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_14px_32px_rgba(37,99,235,0.22)]">
                              <GraduationCap className="h-6 w-6" />
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

                    {/* RIGHT */}
                    <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.17em] text-slate-400">
                        Academic Period
                      </p>

                      <div className="mt-5 space-y-4">
                        <LatestDetail
                          icon={School}
                          label="Class"
                          value={
                            latestReport
                              .class
                              .name
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

                        <LatestDetail
                          icon={Award}
                          label="Overall Grade"
                          value={
                            latestReport
                              .overallGrade ??
                            "Not available"
                          }
                        />
                      </div>

                      <Link
                        href={`/student/report-cards/${latestReport.id}`}
                        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
                      >
                        Open Latest Report

                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {/* -------------------------------------------------------------- */}
            {/*                        REPORT HISTORY                          */}
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
                    Review every published terminal report and
                    monitor your academic progress over time.
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
                    <StudentReportCard
                      key={
                        reportCard.id
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
/*                              REPORT CARD                                   */
/* -------------------------------------------------------------------------- */

type StudentReportCardProps = {
  reportCard: Awaited<
    ReturnType<
      typeof getStudentReportCards
    >
  >[number];

  index: number;

  latest: boolean;
};

function StudentReportCard({
  reportCard,
  index,
  latest,
}: StudentReportCardProps) {
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

          {/* SCORE */}
          <div className="mt-6 rounded-[20px] border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#f8fafc)] p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Overall Average
                </p>

                <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">
                  {formatScore(
                    reportCard.averageScore,
                  )}
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
              label="Class Position"
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

          {/* DETAILS */}
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            <ReportDetail
              icon={GraduationCap}
              label="Class"
              value={
                reportCard
                  .class
                  .name
              }
            />

            <ReportDetail
              icon={CalendarDays}
              label="Published"
              value={formatDate(
                reportCard.publishedAt ??
                  reportCard.generatedAt,
              )}
            />
          </div>

          {/* ACTION */}
          <Link
            href={`/student/report-cards/${reportCard.id}`}
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
/*                          STUDENT HERO METRIC                               */
/* -------------------------------------------------------------------------- */

function StudentHeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-[20px] border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-xl transition duration-300 hover:border-blue-400/20 hover:bg-white/[0.075] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-blue-200">
          <Icon className="h-4 w-4" />
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80 opacity-60" />
      </div>

      <p className="mt-4 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             LATEST METRIC                                  */
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
/*                              REPORT METRIC                                 */
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
/*                               DETAIL ROW                                   */
/* -------------------------------------------------------------------------- */

function ReportDetail({
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

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-bold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          LATEST REPORT DETAIL                              */
/* -------------------------------------------------------------------------- */

function LatestDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;
  label: string;
  value: string;
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
/*                              EMPTY STATE                                   */
/* -------------------------------------------------------------------------- */

function StudentReportCardsEmptyState() {
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
          Your official terminal report cards will appear here
          after the school completes the academic review and
          publication process.
        </p>
      </div>
    </section>
  );
}