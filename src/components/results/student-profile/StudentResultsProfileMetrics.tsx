import {
  Award,
  BarChart3,
  BookOpenCheck,
  Layers3,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type {
  StudentResultProfileMetrics,
} from "@/lib/results";

function formatPercentage(
  value: number | null,
) {
  return value === null
    ? "—"
    : `${value.toFixed(1)}%`;
}

export default function StudentResultsProfileMetrics({
  metrics,
}: {
  metrics: StudentResultProfileMetrics;
}) {
  const cards: {
    label: string;
    value: string;
    description: string;
    icon: LucideIcon;
  }[] = [
    {
      label:
        "Average Score",

      value:
        formatPercentage(
          metrics.averagePercentage,
        ),

      description:
        "Average across filtered records",

      icon:
        BarChart3,
    },

    {
      label:
        "Highest Score",

      value:
        formatPercentage(
          metrics.highestPercentage,
        ),

      description:
        "Best recorded performance",

      icon:
        Trophy,
    },

    {
      label:
        "Pass Rate",

      value:
        formatPercentage(
          metrics.passRate,
        ),

      description:
        `${metrics.passedResults} passed results`,

      icon:
        Award,
    },

    {
      label:
        "Subjects",

      value:
        String(
          metrics.subjectsCovered,
        ),

      description:
        "Subjects represented",

      icon:
        Layers3,
    },

    {
      label:
        "Assessments",

      value:
        String(
          metrics.assessmentResults,
        ),

      description:
        "Online assessment results",

      icon:
        BookOpenCheck,
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