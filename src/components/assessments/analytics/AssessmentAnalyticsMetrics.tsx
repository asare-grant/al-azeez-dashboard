import {
  Activity,
  Clock3,
  Gauge,
  Target,
  Trophy,
} from "lucide-react";

import {
  formatAssessmentDuration,
} from "@/lib/assessments/grading";

import type {
  TeacherAssessmentAnalytics,
} from "@/lib/assessments/types";

type AssessmentAnalyticsMetricsProps = {
  metrics:
    TeacherAssessmentAnalytics["metrics"];
};

export default function AssessmentAnalyticsMetrics({
  metrics,
}: AssessmentAnalyticsMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <Metric
        icon={Activity}
        label="Completion"
        value={`${metrics.completionRate}%`}
      />

      <Metric
        icon={Gauge}
        label="Average"
        value={
          metrics.averageScore !== null
            ? `${metrics.averageScore}%`
            : "—"
        }
      />

      <Metric
        icon={Target}
        label="Median"
        value={
          metrics.medianScore !== null
            ? `${metrics.medianScore}%`
            : "—"
        }
      />

      <Metric
        icon={Trophy}
        label="Pass Rate"
        value={
          metrics.passRate !== null
            ? `${metrics.passRate}%`
            : "—"
        }
      />

      <Metric
        icon={Trophy}
        label="Highest"
        value={
          metrics.highestScore !== null
            ? `${metrics.highestScore}%`
            : "—"
        }
      />

      <Metric
        icon={Clock3}
        label="Average Time"
        value={
          metrics.averageTimeSeconds !==
          null
            ? formatAssessmentDuration(
                metrics.averageTimeSeconds
              )
            : "—"
        }
      />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-500">
        {label}
      </p>
    </div>
  );
}