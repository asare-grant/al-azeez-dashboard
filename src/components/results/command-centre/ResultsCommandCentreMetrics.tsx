import {
  Award,
  BarChart3,
  BookOpenCheck,
  CircleAlert,
  GraduationCap,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type { ResultsCommandCentreMetrics } from "@/lib/results";

type ResultsCommandCentreMetricsProps = {
  metrics: ResultsCommandCentreMetrics;
};

type MetricConfig = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

function formatPercentage(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

export default function ResultsCommandCentreMetrics({
  metrics,
}: ResultsCommandCentreMetricsProps) {
  const cards: MetricConfig[] = [
    {
      label: "Average Score",
      value: formatPercentage(metrics.averagePercentage),
      description: "Average across filtered results",
      icon: BarChart3,
    },

    {
      label: "Pass Rate",
      value: formatPercentage(metrics.passRate),
      description: `${metrics.passedResults} passed • ${metrics.failedResults} below 50%`,

      icon: Award,
    },

    {
      label: "Highest Score",
      value: formatPercentage(metrics.highestPercentage),
      description: "Best recorded performance",
      icon: Trophy,
    },

    {
      label: "Lowest Score",
      value: formatPercentage(metrics.lowestPercentage),
      description: "Lowest recorded performance",
      icon: CircleAlert,
    },

    {
      label: "Assessments",
      value: String(metrics.assessmentResults),
      description: "Online assessment records",
      icon: BookOpenCheck,
    },

    {
      label: "Examinations",
      value: String(metrics.examinationResults),
      description: "Examination result records",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ label, value, description, icon: Icon }) => (
        <article
          key={label}
          className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>

          <p className="mt-5 text-2xl font-black tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>
        </article>
      ))}
    </div>
  );
}
