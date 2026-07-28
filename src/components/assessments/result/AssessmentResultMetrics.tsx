import {
  CheckCircle2,
  Clock3,
  HelpCircle,
  Target,
  XCircle,
} from "lucide-react";



import type {
  AssessmentResultSummary,
} from "@/lib/assessments/types";
import { 
    formatAssessmentDuration 
} from "@/lib/assessments/grading";

type AssessmentResultMetricsProps = {
  result: AssessmentResultSummary;
};

export default function AssessmentResultMetrics({
  result,
}: AssessmentResultMetricsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Metric
        icon={Target}
        label="Score"
        value={`${result.score}/${result.totalMarks}`}
      />

      <Metric
        icon={CheckCircle2}
        label="Correct"
        value={String(
          result.correctCount
        )}
      />

      <Metric
        icon={XCircle}
        label="Incorrect"
        value={String(
          result.incorrectCount
        )}
      />

      <Metric
        icon={HelpCircle}
        label="Unanswered"
        value={String(
          result.unansweredCount
        )}
      />

      <Metric
        icon={Clock3}
        label="Time Used"
        value={formatAssessmentDuration(
          result.timeSpentSeconds
        )}
      />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
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