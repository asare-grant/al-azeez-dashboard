import {
  Award,
  BarChart3,
  BookOpenCheck,
  Trophy,
  type LucideIcon,
} from "lucide-react";

type StudentResultsMetricsProps = {
  totalResults: number;
  averagePercentage: number | null;
  highestPercentage: number | null;
  passedCount: number;
};

type MetricCardData = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export default function StudentResultsMetrics({
  totalResults,
  averagePercentage,
  highestPercentage,
  passedCount,
}: StudentResultsMetricsProps) {
  const metrics: MetricCardData[] = [
    {
      label: "Total Results",
      value: String(totalResults),
      description:
        "Recorded academic results",
      icon: BookOpenCheck,
    },
    {
      label: "Average Score",
      value:
        averagePercentage === null
          ? "—"
          : `${averagePercentage.toFixed(
              1
            )}%`,
      description:
        "Average across all results",
      icon: BarChart3,
    },
    {
      label: "Highest Score",
      value:
        highestPercentage === null
          ? "—"
          : `${highestPercentage.toFixed(
              1
            )}%`,
      description:
        "Best recorded performance",
      icon: Trophy,
    },
    {
      label: "Passed",
      value: String(passedCount),
      description:
        "Results scoring 50% or above",
      icon: Award,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(
        ({
          label,
          value,
          description,
          icon: Icon,
        }) => (
          <div
            key={label}
            className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>

              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>

            <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">
              {value}
            </p>

            <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        )
      )}
    </div>
  );
}