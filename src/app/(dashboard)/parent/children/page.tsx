// import Link from "next/link";

// import {
//   Award,
//   ChevronRight,
//   FileText,
//   GraduationCap,
//   UsersRound,
// } from "lucide-react";

// import {
//   getParentChildrenForReportCards,
// } from "@/lib/report-cards/queries";

// export const dynamic =
//   "force-dynamic";

// export const revalidate = 0;

// export default async function ParentChildrenPage() {
//   const children =
//     await getParentChildrenForReportCards();

//   const publishedReportCount =
//     children.reduce(
//       (total, child) =>
//         total +
//         child.publishedReportCount,
//       0,
//     );

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-[1500px]">
//         <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
//           <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

//           <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
//             <div>
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
//                 <UsersRound className="h-4 w-4" />
//                 Parent Academic Portal
//               </div>

//               <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
//                 My Children
//               </h1>

//               <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
//                 Select a child to view their
//                 published terminal report cards,
//                 grades, subject performance,
//                 attendance and teacher remarks.
//               </p>
//             </div>

//             <div className="grid grid-cols-2 gap-3">
//               <HeroMetric
//                 label="Children"
//                 value={String(
//                   children.length,
//                 )}
//                 icon={UsersRound}
//               />

//               <HeroMetric
//                 label="Published Reports"
//                 value={String(
//                   publishedReportCount,
//                 )}
//                 icon={FileText}
//               />
//             </div>
//           </div>
//         </section>

//         {children.length === 0 ? (
//           <EmptyChildrenState />
//         ) : (
//           <section className="mt-6">
//             <div>
//               <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
//                 Student Profiles
//               </p>

//               <h2 className="mt-2 text-2xl font-black text-slate-950">
//                 Select a child
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Each profile contains only
//                 report cards officially
//                 published by the school.
//               </p>
//             </div>

//             <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
//               {children.map(
//                 (child) => (
//                   <article
//                     key={child.id}
//                     className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.1)]"
//                   >
//                     <div className="bg-gradient-to-br from-blue-50 to-white p-5">
//                       <div className="flex items-start justify-between gap-4">
//                         <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-600 text-white shadow-lg shadow-blue-600/20">
//                           <GraduationCap className="h-6 w-6" />
//                         </div>

//                         <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-blue-700">
//                           {
//                             child.publishedReportCount
//                           }{" "}
//                           report
//                           {child.publishedReportCount ===
//                           1
//                             ? ""
//                             : "s"}
//                         </span>
//                       </div>

//                       <h3 className="mt-5 text-xl font-black text-slate-950">
//                         {child.name}{" "}
//                         {child.surname}
//                       </h3>

//                       <p className="mt-1 text-sm font-semibold text-slate-500">
//                         {child.studentId}
//                       </p>
//                     </div>

//                     <div className="p-5">
//                       <div className="grid grid-cols-2 gap-3">
//                         <Metric
//                           label="Class"
//                           value={
//                             child.class.name
//                           }
//                         />

//                         <Metric
//                           label="Grade"
//                           value={
//                             child.grade.level
//                           }
//                         />

//                         <Metric
//                           label="Latest Average"
//                           value={
//                             child.latestReport
//                               ?.averageScore ===
//                             null ||
//                             child.latestReport
//                               ?.averageScore ===
//                             undefined
//                               ? "—"
//                               : `${child.latestReport.averageScore.toFixed(
//                                   1,
//                                 )}%`
//                           }
//                         />

//                         <Metric
//                           label="Latest Grade"
//                           value={
//                             child.latestReport
//                               ?.overallGrade ??
//                             "—"
//                           }
//                         />
//                       </div>

//                       <Link
//                         href={`/parent/children/${child.id}/report-cards`}
//                         className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition group-hover:bg-blue-700"
//                       >
//                         View Report Cards

//                         <ChevronRight className="h-4 w-4" />
//                       </Link>
//                     </div>
//                   </article>
//                 ),
//               )}
//             </div>
//           </section>
//         )}
//       </div>
//     </div>
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
//     <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
//       <Icon className="h-5 w-5 text-blue-300" />

//       <p className="mt-3 text-2xl font-black">
//         {value}
//       </p>

//       <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
//         {label}
//       </p>
//     </div>
//   );
// }

// function Metric({
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

//       <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
//         {label}
//       </p>
//     </div>
//   );
// }

// function EmptyChildrenState() {
//   return (
//     <section className="mt-6 flex min-h-[400px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
//       <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
//         <UsersRound className="h-7 w-7" />
//       </div>

//       <h2 className="mt-5 text-2xl font-black text-slate-950">
//         No student profiles found
//       </h2>

//       <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
//         No students are currently connected
//         to this parent account. Contact the
//         school administrator if this appears
//         to be incorrect.
//       </p>
//     </section>
//   );
// }






import Link from "next/link";

import {
  ArrowUpRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  School,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";

import {
  getParentChildrenForReportCards,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

/* -------------------------------------------------------------------------- */
/*                                   PAGE                                     */
/* -------------------------------------------------------------------------- */

export default async function ParentChildrenPage() {
  const children =
    await getParentChildrenForReportCards();

  const publishedReportCount =
    children.reduce(
      (
        total,
        child,
      ) =>
        total +
        child.publishedReportCount,
      0,
    );

  const childrenWithReports =
    children.filter(
      (child) =>
        child.publishedReportCount >
        0,
    ).length;

  const latestAverages =
    children
      .map(
        (child) =>
          child.latestReport
            ?.averageScore,
      )
      .filter(
        (
          score,
        ): score is number =>
          score !== null &&
          score !== undefined,
      );

  const familyAverage =
    latestAverages.length >
    0
      ? latestAverages.reduce(
          (
            total,
            score,
          ) =>
            total +
            score,
          0,
        ) /
        latestAverages.length
      : null;

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
                    Parent Academic Portal
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300 sm:text-xs">
                    Family Academic Records
                  </p>

                  <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem] lg:leading-[1.05]">
                    My Children
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-[15px] sm:leading-7">
                    Access the official published academic records
                    of your children, review performance, grades,
                    attendance and teacher feedback from one secure
                    family workspace.
                  </p>
                </div>
              </div>

              {/* RIGHT STATUS */}
              <div className="flex shrink-0 items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-3 pr-5 backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Portal Status
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
              <ParentHeroMetric
                icon={UsersRound}
                label="Children"
                value={String(
                  children.length,
                )}
              />

              <ParentHeroMetric
                icon={FileText}
                label="Published Reports"
                value={String(
                  publishedReportCount,
                )}
              />

              <ParentHeroMetric
                icon={BookOpenCheck}
                label="Profiles With Reports"
                value={String(
                  childrenWithReports,
                )}
              />

              <ParentHeroMetric
                icon={Award}
                label="Latest Family Avg."
                value={
                  familyAverage ===
                  null
                    ? "—"
                    : `${familyAverage.toFixed(
                        1,
                      )}%`
                }
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/*                           CHILDREN AREA                             */}
        {/* ------------------------------------------------------------------ */}

        {children.length ===
        0 ? (
          <EmptyChildrenState />
        ) : (
          <section className="mt-7">

            {/* SECTION HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                  Student Profiles
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Select a child
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Each profile provides access only to terminal
                  report cards officially reviewed and published
                  by the school.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-500 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                {children.length}{" "}
                {children.length ===
                1
                  ? "student profile"
                  : "student profiles"}
              </div>
            </div>

            {/* CARDS */}
            <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {children.map(
                (
                  child,
                  index,
                ) => {
                  const latestAverage =
                    child.latestReport
                      ?.averageScore ??
                    null;

                  const latestGrade =
                    child.latestReport
                      ?.overallGrade ??
                    null;

                  const hasReports =
                    child.publishedReportCount >
                    0;

                  return (
                    <article
                      key={
                        child.id
                      }
                      className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.055)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_32px_90px_rgba(37,99,235,0.12)]"
                    >
                      {/* TOP ACCENT */}
                      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-80" />

                      <div className="relative p-5 sm:p-6">
                        <div className="pointer-events-none absolute -right-14 -top-16 h-36 w-36 rounded-full bg-blue-50 transition duration-500 group-hover:scale-125" />

                        <div className="relative">

                          {/* ------------------------------------------------ */}
                          {/*                     HEADER                       */}
                          {/* ------------------------------------------------ */}

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_14px_32px_rgba(37,99,235,0.22)]">
                                <GraduationCap className="h-6 w-6" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.17em] text-blue-600">
                                  Student Profile
                                </p>

                                <h3 className="mt-1 break-words text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                                  {child.name}{" "}
                                  {child.surname}
                                </h3>

                                <p className="mt-1 text-xs font-bold text-slate-400">
                                  {
                                    child.studentId
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm transition duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                          </div>

                          {/* ------------------------------------------------ */}
                          {/*                REPORT STATUS                     */}
                          {/* ------------------------------------------------ */}

                          <div className="mt-6 flex items-center justify-between gap-3 rounded-[18px] border border-slate-100 bg-slate-50/80 p-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                                  hasReports
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                <FileText className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                                  Published Reports
                                </p>

                                <p className="mt-0.5 text-lg font-black text-slate-950">
                                  {
                                    child.publishedReportCount
                                  }
                                </p>
                              </div>
                            </div>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                                hasReports
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-slate-200 bg-white text-slate-400"
                              }`}
                            >
                              {hasReports
                                ? "Available"
                                : "Awaiting"}
                            </span>
                          </div>

                          {/* ------------------------------------------------ */}
                          {/*                     METRICS                      */}
                          {/* ------------------------------------------------ */}

                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <ChildMetric
                              icon={School}
                              label="Class"
                              value={
                                child.class
                                  .name
                              }
                            />

                            <ChildMetric
                              icon={
                                GraduationCap
                              }
                              label="Grade"
                              value={
                                child.grade
                                  .level
                              }
                            />

                            <ChildMetric
                              icon={Award}
                              label="Latest Average"
                              value={
                                latestAverage ===
                                null
                                  ? "—"
                                  : `${latestAverage.toFixed(
                                      1,
                                    )}%`
                              }
                            />

                            <ChildMetric
                              icon={Trophy}
                              label="Latest Grade"
                              value={
                                latestGrade ??
                                "—"
                              }
                            />
                          </div>

                          {/* ------------------------------------------------ */}
                          {/*                     FOOTER                       */}
                          {/* ------------------------------------------------ */}

                          <div className="mt-6 border-t border-slate-100 pt-5">
                            <Link
                              href={`/parent/children/${child.id}/report-cards`}
                              className="flex h-11 w-full items-center justify-between rounded-2xl bg-slate-950 px-4 text-sm font-black text-white transition duration-300 group-hover:bg-blue-600"
                            >
                              <span>
                                View academic reports
                              </span>

                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* CARD NUMBER */}
                      <span className="absolute bottom-3 right-5 text-[9px] font-black text-slate-200">
                        {String(
                          index +
                            1,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>
                    </article>
                  );
                },
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                            HERO METRIC                                     */
/* -------------------------------------------------------------------------- */

function ParentHeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof UsersRound;

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
/*                            CHILD METRIC                                    */
/* -------------------------------------------------------------------------- */

function ChildMetric({
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
    <div className="rounded-[18px] border border-slate-100 bg-slate-50/80 p-4 transition duration-300 group-hover:bg-slate-50">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />

        <span className="text-[9px] font-black uppercase tracking-[0.13em]">
          {label}
        </span>
      </div>

      <p className="mt-3 break-words text-sm font-black text-slate-950 sm:text-base">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              EMPTY STATE                                   */
/* -------------------------------------------------------------------------- */

function EmptyChildrenState() {
  return (
    <section className="relative mt-7 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative flex min-h-[430px] flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
          <UsersRound className="h-7 w-7" />
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
          <GraduationCap className="h-3.5 w-3.5" />
          Parent Academic Portal
        </div>

        <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          No student profiles found
        </h2>

        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">
          No students are currently connected to this parent
          account. Please contact the school administrator if
          you believe a student profile should appear here.
        </p>
      </div>
    </section>
  );
}