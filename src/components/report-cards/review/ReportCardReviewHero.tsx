// import Link from "next/link";

// import {
//   ArrowLeft,
//   Award,
//   BookOpenCheck,
//   CalendarDays,
//   FileDown,
//   GraduationCap,
//   School,
//   Trophy,
//   UserRound,
// } from "lucide-react";

// import type {
//   ReportCardReviewWorkspaceData,
// } from "@/lib/report-cards/review-types";

// import {
//   ReportCardCalculationBadge,
//   ReportCardLifecycleStatusBadge,
//   ReportCardReviewStatusBadge,
// } from "./ReportCardReviewStatusBadge";

// type ReportCardReviewHeroProps = {
//   reportCard:
//     ReportCardReviewWorkspaceData;

//   backHref: string;
//   printHref: string;
// };

// function formatTermName(
//   value: string,
// ) {
//   return value.replace(
//     /_/g,
//     " ",
//   );
// }

// export default function ReportCardReviewHero({
//   reportCard,
//   backHref,
//   printHref,
// }: ReportCardReviewHeroProps) {
//   return (
//     <>
//       <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
//         <Link
//           href={backHref}
//           className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Back to Report
//         </Link>

//         <Link
//           href={printHref}
//           target="_blank"
//           className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
//         >
//           <FileDown className="h-4 w-4" />
//           Print Preview
//         </Link>
//       </div>

//       <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:rounded-[34px] sm:p-8 lg:p-10">
//         <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

//         <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

//         <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_500px] xl:items-end">
//           <div>
//             <div className="flex flex-wrap gap-2">
//               <ReportCardLifecycleStatusBadge
//                 status={
//                   reportCard.status
//                 }
//               />

//               <ReportCardReviewStatusBadge
//                 status={
//                   reportCard.reviewStatus
//                 }
//               />

//               <ReportCardCalculationBadge
//                 status={
//                   reportCard
//                     .calculationStatus
//                 }
//               />
//             </div>

//             <div className="mt-6 flex items-start gap-4">
//               <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/10 text-blue-200">
//                 {reportCard.student.img ? (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img
//                     src={
//                       reportCard.student.img
//                     }
//                     alt={`${reportCard.student.name} ${reportCard.student.surname}`}
//                     className="h-full w-full object-cover"
//                   />
//                 ) : (
//                   <UserRound className="h-7 w-7" />
//                 )}
//               </div>

//               <div className="min-w-0">
//                 <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
//                   Report Card Review
//                 </p>

//                 <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
//                   {reportCard.student.name}{" "}
//                   {
//                     reportCard.student
//                       .surname
//                   }
//                 </h1>

//                 <p className="mt-2 text-sm font-semibold text-slate-300">
//                   {
//                     reportCard.student
//                       .studentId
//                   }
//                 </p>
//               </div>
//             </div>

//             <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
//               Review academic calculations,
//               attendance, student development,
//               remarks and approval readiness
//               before this report card is
//               published.
//             </p>
//           </div>

//           <div className="grid gap-3 sm:grid-cols-2">
//             <HeroDetail
//               icon={School}
//               label="Class"
//               value={
//                 reportCard.class.name
//               }
//             />

//             <HeroDetail
//               icon={
//                 GraduationCap
//               }
//               label="Grade"
//               value={
//                 reportCard.grade.level
//               }
//             />

//             <HeroDetail
//               icon={
//                 CalendarDays
//               }
//               label="Academic Period"
//               value={`${formatTermName(
//                 reportCard.term.name,
//               )} • ${
//                 reportCard.academicYear
//               }`}
//             />

//             <HeroDetail
//               icon={Trophy}
//               label="Class Position"
//               value={
//                 reportCard.overallPosition
//                   ? `${
//                       reportCard
//                         .overallPosition
//                     } of ${
//                       reportCard
//                         .classStudentCount ??
//                       "—"
//                     }`
//                   : "Not calculated"
//               }
//             />

//             <HeroDetail
//               icon={Award}
//               label="Overall Grade"
//               value={
//                 reportCard.overallGrade ??
//                 "Not calculated"
//               }
//             />

//             <HeroDetail
//               icon={
//                 BookOpenCheck
//               }
//               label="Subjects Complete"
//               value={`${reportCard.completedSubjectCount}/${reportCard.subjectCount}`}
//             />
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// function HeroDetail({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: typeof School;
//   label: string;
//   value: string;
// }) {
//   return (
//     <article className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
//       <Icon className="h-5 w-5 text-blue-300" />

//       <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
//         {label}
//       </p>

//       <p className="mt-1 break-words text-sm font-black text-white">
//         {value}
//       </p>
//     </article>
//   );
// }

import Link from "next/link";

import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  FileText,
  RefreshCcw,
  GraduationCap,
  Layers3,
  School,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

import type { ReportCardReviewWorkspaceData } from "@/lib/report-cards/review-types";

import {
  ReportCardCalculationBadge,
  ReportCardLifecycleStatusBadge,
  ReportCardReviewStatusBadge,
} from "./ReportCardReviewStatusBadge";

type ReportCardReviewHeroProps = {
  reportCard: ReportCardReviewWorkspaceData;

  backHref: string;
  printHref: string;
};

function formatTermName(value: string) {
  return value.replace(/_/g, " ");
}

export default function ReportCardReviewHero({
  reportCard,
  backHref,
  printHref,
}: ReportCardReviewHeroProps) {
  const studentName = `${reportCard.student.name} ${reportCard.student.surname}`;

  const completionPercentage =
    reportCard.subjectCount > 0
      ? Math.min(
          100,
          Math.round(
            (reportCard.completedSubjectCount / reportCard.subjectCount) * 100,
          ),
        )
      : 0;

  const readinessPercentage = reportCard.readiness.completionPercentage;

  return (
    <>
      {/* ================================================================ */}
      {/*                          TOOLBAR                                 */}
      {/* ================================================================ */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={backHref}
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Report
        </Link>

        <Link
          href={printHref}
          target="_blank"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <FileDown className="h-4 w-4" />
          Print Preview
        </Link>
      </div>

      {/* ================================================================ */}
      {/*                          HERO                                    */}
      {/* ================================================================ */}

      <section className="relative overflow-hidden rounded-[30px] border border-slate-800/80 bg-[linear-gradient(125deg,#020617_0%,#07152d_38%,#0d2758_70%,#172554_100%)] text-white shadow-[0_34px_110px_rgba(15,23,42,0.25)] sm:rounded-[36px]">
        {/* BACKGROUND EFFECTS */}

        <div className="pointer-events-none absolute -right-44 -top-52 h-[560px] w-[560px] rounded-full bg-blue-500/[0.16] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-56 left-[20%] h-[480px] w-[480px] rounded-full bg-cyan-400/[0.08] blur-3xl" />

        <div className="pointer-events-none absolute right-[13%] top-10 h-36 w-36 rounded-full border border-white/[0.04]" />

        <div className="pointer-events-none absolute right-[16%] top-16 h-20 w-20 rounded-full border border-white/[0.025]" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.027]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",

            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative p-5 sm:p-7 lg:p-8 xl:p-9">
          {/* ============================================================ */}
          {/*                   REVIEW COMMAND BAR                         */}
          {/* ============================================================ */}

          <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.10] px-3 py-1.5 backdrop-blur-xl">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">
                  Administrative Review Workspace
                </span>
              </div>

              <ReportCardLifecycleStatusBadge status={reportCard.status} />

              <ReportCardReviewStatusBadge status={reportCard.reviewStatus} />

              <ReportCardCalculationBadge
                status={reportCard.calculationStatus}
              />

              {reportCard.isStale ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-amber-200 backdrop-blur">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Needs Regeneration
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Review Record
              <span className="text-slate-600">/</span>#{reportCard.id}
            </div>
          </div>

          {/* ============================================================ */}
          {/*                      MAIN HERO                               */}
          {/* ============================================================ */}

          <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_470px] xl:items-stretch">
            {/* ---------------------------------------------------------- */}
            {/*                         LEFT                               */}
            {/* ---------------------------------------------------------- */}

            <div className="flex min-w-0 flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                  Report Review Profile
                </p>

                <div className="mt-4 flex items-start gap-4 sm:gap-5">
                  {/* STUDENT PHOTO */}
                  <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[23px] border border-white/10 bg-white/[0.07] text-blue-200 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:h-[80px] sm:w-[80px]">
                    {reportCard.student.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={reportCard.student.img}
                        alt={studentName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-8 w-8" />
                    )}

                    <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="break-words text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl lg:text-[2.9rem] lg:leading-[1.02]">
                      {reportCard.student.name} {reportCard.student.surname}
                    </h1>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <ReviewHeroChip>
                        {reportCard.student.studentId}
                      </ReviewHeroChip>

                      <ReviewHeroChip>{reportCard.class.name}</ReviewHeroChip>

                      <ReviewHeroChip accent>
                        {formatTermName(reportCard.term.name)}
                      </ReviewHeroChip>

                      <ReviewHeroChip>{reportCard.academicYear}</ReviewHeroChip>
                    </div>
                  </div>
                </div>

                <p className="mt-6 max-w-3xl text-sm font-medium leading-7 text-slate-300 sm:text-[15px]">
                  Verify academic calculations, attendance, development records,
                  teacher remarks and workflow readiness before approving this
                  report for official publication.
                </p>
              </div>

              {/* RECORD DETAILS */}

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <ReviewRecordDetail
                  icon={School}
                  label="Class"
                  value={reportCard.class.name}
                />

                <ReviewRecordDetail
                  icon={GraduationCap}
                  label="Grade Level"
                  value={reportCard.grade.level}
                />

                <ReviewRecordDetail
                  icon={CalendarDays}
                  label="Academic Period"
                  value={`${formatTermName(reportCard.term.name)} • ${
                    reportCard.academicYear
                  }`}
                />
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/*                    READINESS CONSOLE                       */}
            {/* ---------------------------------------------------------- */}

            <div className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl sm:p-5">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-blue-300" />

                      <p className="text-[9px] font-black uppercase tracking-[0.17em] text-blue-300">
                        Review Intelligence
                      </p>
                    </div>

                    <h2 className="mt-1.5 text-lg font-black tracking-tight text-white">
                      Approval readiness
                    </h2>

                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      Live report quality and workflow state
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.06] text-blue-200">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                </div>

                {/* READINESS SCORE */}

                <div className="mt-5 rounded-[20px] border border-blue-400/[0.12] bg-blue-400/[0.07] p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                        Review Completion
                      </p>

                      <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-white">
                        {readinessPercentage}%
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
                        Checks Complete
                      </p>

                      <p className="mt-1 text-2xl font-black text-blue-200">
                        {reportCard.readiness.completedChecks}/
                        {reportCard.readiness.totalChecks}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.11em]">
                      <span className="text-slate-400">Approval readiness</span>

                      <span className="text-blue-200">
                        {readinessPercentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 transition-all"
                        style={{
                          width: `${Math.min(100, readinessPercentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* SNAPSHOT METRICS */}

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <ReviewMetric
                    icon={Award}
                    label="Overall Grade"
                    value={reportCard.overallGrade ?? "—"}
                  />

                  <ReviewMetric
                    icon={Trophy}
                    label="Class Position"
                    value={
                      reportCard.overallPosition
                        ? `${reportCard.overallPosition} of ${
                            reportCard.classStudentCount ?? "—"
                          }`
                        : "—"
                    }
                  />

                  <ReviewMetric
                    icon={BookOpenCheck}
                    label="Subjects"
                    value={`${reportCard.completedSubjectCount}/${reportCard.subjectCount}`}
                  />

                  <ReviewMetric
                    icon={Layers3}
                    label="Academic Completion"
                    value={`${completionPercentage}%`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/*                    READINESS STRIP                           */}
          {/* ============================================================ */}

          <div className="mt-7 grid gap-3 border-t border-white/[0.08] pt-5 md:grid-cols-3">
            <ReviewIndicator
              icon={CheckCircle2}
              label="Review Submission"
              title={
                reportCard.readiness.readyForReview
                  ? "Ready for review"
                  : "Preparation incomplete"
              }
              description={
                reportCard.readiness.readyForReview
                  ? "The report has satisfied the minimum requirements for formal review."
                  : `${reportCard.readiness.errors.length} blocking issue${
                      reportCard.readiness.errors.length === 1 ? "" : "s"
                    } currently require attention.`
              }
              state={
                reportCard.readiness.readyForReview ? "success" : "warning"
              }
            />

            <ReviewIndicator
              icon={ShieldCheck}
              label="Approval Gate"
              title={
                reportCard.readiness.readyForApproval
                  ? "Approval ready"
                  : "Approval restricted"
              }
              description={
                reportCard.readiness.readyForApproval
                  ? "This report has satisfied the checks required for approval."
                  : "The report must complete the review requirements before approval."
              }
              state={
                reportCard.readiness.readyForApproval ? "success" : "warning"
              }
            />

            <ReviewIndicator
              icon={FileText}
              label="Publication Gate"
              title={
                reportCard.readiness.readyForPublication
                  ? "Publication ready"
                  : "Publication protected"
              }
              description={
                reportCard.readiness.readyForPublication
                  ? "The report is ready to enter the official publication workflow."
                  : "Publication remains locked until all required review controls are satisfied."
              }
              state={
                reportCard.readiness.readyForPublication ? "success" : "neutral"
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HERO CHIP                                     */
/* -------------------------------------------------------------------------- */

function ReviewHeroChip({
  children,
  accent = false,
}: {
  children: React.ReactNode;

  accent?: boolean;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] backdrop-blur ${
        accent
          ? "border-blue-400/20 bg-blue-400/10 text-blue-200"
          : "border-white/[0.09] bg-white/[0.055] text-slate-300"
      }`}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                          RECORD DETAIL                                     */
/* -------------------------------------------------------------------------- */

function ReviewRecordDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;

  label: string;

  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-blue-200">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-black text-slate-200 sm:text-sm">
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              METRIC                                        */
/* -------------------------------------------------------------------------- */

function ReviewMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-blue-200">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80" />
      </div>

      <p className="mt-3 break-words text-lg font-black tracking-[-0.025em] text-white">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         READINESS INDICATOR                                */
/* -------------------------------------------------------------------------- */

function ReviewIndicator({
  icon: Icon,
  label,
  title,
  description,
  state,
}: {
  icon: typeof CheckCircle2;

  label: string;

  title: string;

  description: string;

  state: "success" | "warning" | "error" | "neutral";
}) {
  const iconClass = {
    success: "border-emerald-400/10 bg-emerald-400/10 text-emerald-300",

    warning: "border-amber-400/10 bg-amber-400/10 text-amber-300",

    error: "border-red-400/10 bg-red-400/10 text-red-300",

    neutral: "border-slate-400/10 bg-slate-400/10 text-slate-300",
  }[state];

  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-xs font-black text-white">{title}</p>

        <p className="mt-1 text-[10px] font-medium leading-4 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
