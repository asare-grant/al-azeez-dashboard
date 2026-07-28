import {
  Activity,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Gauge,
} from "lucide-react";

type StudentAssessmentMetricsProps = {
  metrics: {
    available: number;
    inProgress: number;
    upcoming: number;
    completed: number;
    missed: number;
    averageScore: number | null;
  };
};

export default function StudentAssessmentMetrics({
  metrics,
}: StudentAssessmentMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        icon={Activity}
        label="Available"
        value={String(metrics.available)}
        description="Ready to begin"
      />

      <MetricCard
        icon={Clock3}
        label="In Progress"
        value={String(metrics.inProgress)}
        description="Saved attempts"
      />

      <MetricCard
        icon={CalendarClock}
        label="Upcoming"
        value={String(metrics.upcoming)}
        description="Opening later"
      />

      <MetricCard
        icon={CheckCircle2}
        label="Completed"
        value={String(metrics.completed)}
        description="Submitted assessments"
      />

      <MetricCard
        icon={Gauge}
        label="Average Score"
        value={
          metrics.averageScore !== null
            ? `${metrics.averageScore}%`
            : "—"
        }
        description="Across completed work"
      />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-black text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}