import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Gauge,
  History,
  Trophy,
} from "lucide-react";

import {
  formatAssessmentDuration,
} from "@/lib/assessments/grading";

import type {
  TeacherStudentSubmissionReview,
} from "@/lib/assessments/types";

type StudentAttemptComparisonProps = {
  comparison:
    TeacherStudentSubmissionReview["comparison"];
};

export default function StudentAttemptComparison({
  comparison,
}: StudentAttemptComparisonProps) {
  const improvement =
    comparison.improvement;

  return (
    <section className="print:shadow-none rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
        Attempt Comparison
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-950">
        Performance over time
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ComparisonMetric
          icon={History}
          label="Completed"
          value={`${comparison.completedAttempts}/${comparison.totalAttempts}`}
        />

        <ComparisonMetric
          icon={Trophy}
          label="Highest"
          value={
            comparison.highestScore !==
            null
              ? `${comparison.highestScore}%`
              : "—"
          }
        />

        <ComparisonMetric
          icon={Gauge}
          label="Average"
          value={
            comparison.averageScore !==
            null
              ? `${comparison.averageScore}%`
              : "—"
          }
        />

        <ComparisonMetric
          icon={Clock3}
          label="Avg Time"
          value={
            comparison.averageTimeSeconds !==
            null
              ? formatAssessmentDuration(
                  comparison.averageTimeSeconds
                )
              : "—"
          }
        />
      </div>

      {improvement !== null ? (
        <div
          className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 ${
            improvement >= 0
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              improvement >= 0
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {improvement >= 0 ? (
              <ArrowUpRight className="h-5 w-5" />
            ) : (
              <ArrowDownRight className="h-5 w-5" />
            )}
          </div>

          <div>
            <p
              className={`text-sm font-black ${
                improvement >= 0
                  ? "text-emerald-900"
                  : "text-red-900"
              }`}
            >
              {improvement >= 0
                ? "Performance improved"
                : "Performance declined"}
            </p>

            <p
              className={`mt-1 text-xs leading-5 ${
                improvement >= 0
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              The latest completed
              attempt changed by{" "}
              {Math.abs(improvement)}{" "}
              percentage points compared
              with the first attempt.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ComparisonMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon className="h-4 w-4 text-blue-600" />

      <p className="mt-3 text-lg font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}