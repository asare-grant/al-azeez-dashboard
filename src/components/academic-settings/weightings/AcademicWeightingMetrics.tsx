import {
  BarChart3,
  CalendarRange,
  CheckCircle2,
  GraduationCap,
  Target,
} from "lucide-react";

import type {
  AcademicWeightingMetrics as Metrics,
} from "@/lib/academic-weightings/types";

export default function AcademicWeightingMetrics({
  metrics,
}: {
  metrics: Metrics;
}) {
  const cards = [
    {
      label:
        "Total Configurations",

      value:
        String(metrics.total),

      description:
        "All academic weighting rules",

      icon:
        BarChart3,
    },

    {
      label:
        "Active",

      value:
        String(metrics.active),

      description:
        "Available for calculation",

      icon:
        CheckCircle2,
    },

    {
      label:
        "Grades Configured",

      value:
        String(
          metrics.gradesConfigured,
        ),

      description:
        "Grades with weighting rules",

      icon:
        GraduationCap,
    },

    {
      label:
        "Academic Years",

      value:
        String(
          metrics.academicYearsConfigured,
        ),

      description:
        "Configured academic periods",

      icon:
        CalendarRange,
    },

    {
      label:
        "Average Pass Mark",

      value:
        metrics.averagePassMark ===
        null
          ? "—"
          : `${metrics.averagePassMark}%`,

      description:
        "Across all configurations",

      icon:
        Target,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(
        ({
          label,
          value,
          description,
          icon: Icon,
        }) => (
          <article
            key={label}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>

            <p className="mt-5 text-2xl font-black text-slate-950">
              {value}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </article>
        ),
      )}
    </div>
  );
}