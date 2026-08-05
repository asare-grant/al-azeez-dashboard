import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileClock,
  FileWarning,
  ShieldCheck,
} from "lucide-react";

import type {
  ReportCardBulkReviewMetrics,
} from "@/lib/report-cards/bulk-review-types";

export default function ReportCardBulkReviewMetrics({
  metrics,
}: {
  metrics:
    ReportCardBulkReviewMetrics;
}) {
  const cards = [
    {
      label:
        "Academically Ready",

      value:
        metrics.academicallyReady,

      description:
        "All subject calculations completed.",

      icon:
        CheckCircle2,

      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    {
      label:
        "Awaiting Review",

      value:
        metrics.awaitingReview,

      description:
        "Submitted for administrator review.",

      icon:
        FileClock,

      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    {
      label:
        "Changes Requested",

      value:
        metrics.changesRequested,

      description:
        "Returned for teacher corrections.",

      icon:
        AlertTriangle,

      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    {
      label:
        "Approved",

      value:
        metrics.approved,

      description:
        "Approved and awaiting publication.",

      icon:
        ShieldCheck,

      className:
        "border-violet-200 bg-violet-50 text-violet-700",
    },

    {
      label:
        "Blocked",

      value:
        metrics.blocked,

      description:
        "Academic calculation cannot proceed.",

      icon:
        FileWarning,

      className:
        "border-red-200 bg-red-50 text-red-700",
    },

    {
      label:
        "Average Score",

      value:
        metrics.averageScore ===
        null
          ? "—"
          : `${metrics.averageScore.toFixed(
              1,
            )}%`,

      description:
        `${metrics.completionPercentage}% academically complete.`,

      icon:
        BarChart3,

      className:
        "border-slate-200 bg-white text-slate-700",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map(
        (card) => {
          const Icon =
            card.icon;

          return (
            <article
              key={card.label}
              className={`rounded-[22px] border p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] ${card.className}`}
            >
              <Icon className="h-5 w-5" />

              <p className="mt-4 text-2xl font-black">
                {card.value}
              </p>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] opacity-75">
                {card.label}
              </p>

              <p className="mt-3 text-xs leading-5 opacity-70">
                {card.description}
              </p>
            </article>
          );
        },
      )}
    </section>
  );
}