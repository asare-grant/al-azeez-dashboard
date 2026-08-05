import {
  BarChart3,
  CheckCircle2,
  FileClock,
  FileText,
  LockKeyhole,
  TriangleAlert,
} from "lucide-react";

import type {
  ReportCardCommandMetrics,
} from "../types";

export default function ReportCardMetrics({
  metrics,
}: {
  metrics: ReportCardCommandMetrics;
}) {
  const items = [
    {
      label: "Total Cards",
      value: metrics.total,
      description:
        "Complete filtered result set",
      icon: FileText,
    },

    {
      label: "Draft Cards",
      value: metrics.draft,
      description:
        `${metrics.publishable} ready to publish`,
      icon: FileClock,
    },

    {
      label: "Published",
      value: metrics.published,
      description:
        "Locked academic records",
      icon: LockKeyhole,
    },

    {
      label: "Ready",
      value: metrics.ready,
      description:
        "Calculation complete",
      icon: CheckCircle2,
    },

    {
      label: "Needs Attention",
      value:
        metrics.partial +
        metrics.blocked,
      description:
        `${metrics.blocked} blocked`,
      icon: TriangleAlert,
    },

    {
      label: "Average Score",
      value:
        metrics.averageScore ===
        null
          ? "—"
          : `${metrics.averageScore.toFixed(
              1,
            )}%`,
      description:
        "Across filtered cards",
      icon: BarChart3,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>

            <p className="mt-4 text-2xl font-black text-slate-950">
              {item.value}
            </p>

            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              {item.label}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {item.description}
            </p>
          </article>
        );
      })}
    </section>
  );
}