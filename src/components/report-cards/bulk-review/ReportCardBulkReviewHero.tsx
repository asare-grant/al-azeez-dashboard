// import Link from "next/link";

// import {
//   ArrowLeft,
//   CheckCircle2,
//   ClipboardCheck,
//   FileCheck2,
//   Send,
//   UsersRound,
// } from "lucide-react";

// import type {
//   ReportCardBulkReviewMetrics,
// } from "@/lib/report-cards/bulk-review-types";

// export default function ReportCardBulkReviewHero({
//   metrics,
// }: {
//   metrics:
//     ReportCardBulkReviewMetrics;
// }) {
//   return (
//     <>
//       <Link
//         href="/list/report-cards"
//         className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
//       >
//         <ArrowLeft className="h-4 w-4" />
//         Report Cards
//       </Link>

//       <section className="relative mt-5 overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:rounded-[36px] sm:p-9 lg:p-11">
//         <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

//         <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

//         <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-end">
//           <div>
//             <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
//               <ClipboardCheck className="h-4 w-4" />
//               Administrative Review
//             </div>

//             <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
//               Bulk Report-Card Review
//             </h1>

//             <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
//               Review an entire class, select
//               multiple submissions, request
//               corrections, approve completed
//               reports and publish final report
//               cards securely.
//             </p>
//           </div>

//           <div className="grid gap-3 sm:grid-cols-2">
//             <HeroMetric
//               icon={UsersRound}
//               label="Filtered Reports"
//               value={String(
//                 metrics.total,
//               )}
//             />

//             <HeroMetric
//               icon={Send}
//               label="Awaiting Review"
//               value={String(
//                 metrics.awaitingReview,
//               )}
//             />

//             <HeroMetric
//               icon={CheckCircle2}
//               label="Approved"
//               value={String(
//                 metrics.approved,
//               )}
//             />

//             <HeroMetric
//               icon={FileCheck2}
//               label="Ready to Publish"
//               value={String(
//                 metrics.publishable,
//               )}
//             />
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

// function HeroMetric({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: typeof UsersRound;
//   label: string;
//   value: string;
// }) {
//   return (
//     <article className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
//       <Icon className="h-5 w-5 text-blue-300" />

//       <p className="mt-3 text-2xl font-black text-white">
//         {value}
//       </p>

//       <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
//         {label}
//       </p>
//     </article>
//   );
// }










import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import type {
  ReportCardBulkReviewMetrics,
} from "@/lib/report-cards/bulk-review-types";

export default function ReportCardBulkReviewHero({
  metrics,
}: {
  metrics:
    ReportCardBulkReviewMetrics;
}) {
  return (
    <>
      <Link
        href="/list/report-cards"
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />

        Report Cards
      </Link>

      <section className="relative mt-5 overflow-hidden rounded-[30px] border border-slate-800/80 bg-[linear-gradient(125deg,#020617_0%,#081329_42%,#0d2552_72%,#172554_100%)] text-white shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:rounded-[36px]">
        {/* BACKGROUND GLOW */}

        <div className="pointer-events-none absolute -right-36 -top-44 h-[480px] w-[480px] rounded-full bg-blue-500/[0.16] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-44 left-[28%] h-[380px] w-[380px] rounded-full bg-cyan-400/[0.08] blur-3xl" />

        <div className="pointer-events-none absolute right-[18%] top-10 h-28 w-28 rounded-full border border-white/[0.04]" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)",

            backgroundSize:
              "46px 46px",
          }}
        />

        <div className="relative p-6 sm:p-8 lg:p-9 xl:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            {/* -------------------------------------------------------------- */}
            {/*                             LEFT                               */}
            {/* -------------------------------------------------------------- */}

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />

                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">
                  Administrative Review
                </span>
              </div>

              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                Report Review Workspace
              </p>

              <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl lg:text-[3rem] lg:leading-[1.04]">
                Bulk Report-Card Review
              </h1>

              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-300 sm:text-[15px]">
                Review multiple report cards, request corrections,
                approve completed records and securely publish final
                student reports from one controlled workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <ReviewFeature
                  icon={ClipboardCheck}
                  label="Bulk approval workflow"
                />

                <ReviewFeature
                  icon={Send}
                  label="Correction requests"
                />

                <ReviewFeature
                  icon={ShieldCheck}
                  label="Controlled publication"
                />
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/*                            RIGHT                               */}
            {/* -------------------------------------------------------------- */}

            <div className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl sm:p-5">
              <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-blue-400/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-300">
                      Review Snapshot
                    </p>

                    <p className="mt-1 text-[11px] font-medium text-slate-400">
                      Current filtered report-card queue
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.06] text-blue-200">
                    <ClipboardCheck className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <HeroMetric
                    icon={UsersRound}
                    label="Filtered Reports"
                    value={String(
                      metrics.total,
                    )}
                  />

                  <HeroMetric
                    icon={Send}
                    label="Awaiting Review"
                    value={String(
                      metrics.awaitingReview,
                    )}
                    state={
                      metrics.awaitingReview >
                      0
                        ? "warning"
                        : "neutral"
                    }
                  />

                  <HeroMetric
                    icon={CheckCircle2}
                    label="Approved"
                    value={String(
                      metrics.approved,
                    )}
                    state={
                      metrics.approved >
                      0
                        ? "success"
                        : "neutral"
                    }
                  />

                  <HeroMetric
                    icon={FileCheck2}
                    label="Ready to Publish"
                    value={String(
                      metrics.publishable,
                    )}
                    state={
                      metrics.publishable >
                      0
                        ? "success"
                        : "neutral"
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                              HERO METRIC                                   */
/* -------------------------------------------------------------------------- */

function HeroMetric({
  icon: Icon,
  label,
  value,
  state = "default",
}: {
  icon:
    typeof UsersRound;

  label:
    string;

  value:
    string;

  state?:
    | "default"
    | "success"
    | "warning"
    | "neutral";
}) {
  const valueClass = {
    default:
      "text-white",

    success:
      "text-emerald-300",

    warning:
      "text-amber-200",

    neutral:
      "text-slate-300",
  }[state];

  return (
    <article className="rounded-[18px] border border-white/[0.07] bg-white/[0.04] p-3.5 transition duration-300 hover:border-blue-400/20 hover:bg-white/[0.06]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-blue-200">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span
          className={`h-1.5 w-1.5 rounded-full ${
            state === "success"
              ? "bg-emerald-400"
              : state === "warning"
                ? "bg-amber-400"
                : "bg-blue-400/80"
          }`}
        />
      </div>

      <p
        className={`mt-3 break-words text-xl font-black tracking-[-0.03em] ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                            HERO FEATURE                                    */
/* -------------------------------------------------------------------------- */

function ReviewFeature({
  icon: Icon,
  label,
}: {
  icon:
    typeof ClipboardCheck;

  label:
    string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-300 backdrop-blur">
      <Icon className="h-3.5 w-3.5 text-blue-300" />

      {label}
    </span>
  );
}