import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Send,
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

      <section className="relative mt-5 overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:rounded-[36px] sm:p-9 lg:p-11">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              <ClipboardCheck className="h-4 w-4" />
              Administrative Review
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Bulk Report-Card Review
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Review an entire class, select
              multiple submissions, request
              corrections, approve completed
              reports and publish final report
              cards securely.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
            />

            <HeroMetric
              icon={CheckCircle2}
              label="Approved"
              value={String(
                metrics.approved,
              )}
            />

            <HeroMetric
              icon={FileCheck2}
              label="Ready to Publish"
              value={String(
                metrics.publishable,
              )}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
    </article>
  );
}