import {
  Activity,
  CheckCircle2,
  Circle,
  Gauge,
  Trophy,
} from "lucide-react";

import type {
  TeacherAssessmentSubmissionSummary,
} from "@/lib/assessments/types";

type AssessmentSubmissionMetricsProps = {
  metrics:
    TeacherAssessmentSubmissionSummary["metrics"];
};

export default function AssessmentSubmissionMetrics({
  metrics,
}: AssessmentSubmissionMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Metric
        icon={CheckCircle2}
        label="Submitted"
        value={`${metrics.submittedStudents}/${metrics.totalStudents}`}
        description="Students completed"
      />

      <Metric
        icon={Activity}
        label="Completion Rate"
        value={`${metrics.completionRate}%`}
        description="Class participation"
      />

      <Metric
        icon={Gauge}
        label="Class Average"
        value={
          metrics.averageScore !== null
            ? `${metrics.averageScore}%`
            : "—"
        }
        description="Highest attempt"
      />

      <Metric
        icon={Trophy}
        label="Pass Rate"
        value={
          metrics.passRate !== null
            ? `${metrics.passRate}%`
            : "—"
        }
        description="Submitted students"
      />

      <Metric
        icon={Circle}
        label="Not Started"
        value={String(
          metrics.notStartedStudents
        )}
        description="Awaiting submission"
      />
    </div>
  );
}

function Metric({
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