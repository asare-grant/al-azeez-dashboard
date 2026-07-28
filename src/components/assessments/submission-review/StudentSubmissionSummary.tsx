import {
  CheckCircle2,
  Clock3,
  FileQuestion,
  Flag,
  HelpCircle,
  Target,
  XCircle,
} from "lucide-react";


import { 
    formatAssessmentDuration 
} from "@/lib/assessments/grading";

import type {
  TeacherStudentSubmissionReview,
} from "@/lib/assessments/types";


type StudentSubmissionSummaryProps = {
  data: TeacherStudentSubmissionReview;
};

export default function StudentSubmissionSummary({
  data,
}: StudentSubmissionSummaryProps) {
  const attempt =
    data.selectedAttempt;

  if (!attempt) {
    return null;
  }

  return (
    <section className="print:shadow-none rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Selected Attempt
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Attempt {attempt.attemptNumber}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {attempt.status ===
            "AUTO_SUBMITTED"
              ? "Automatically submitted when time expired."
              : attempt.status ===
                "SUBMITTED"
              ? "Submitted successfully by the student."
              : "This attempt has not been fully submitted."}
          </p>
        </div>

        <div
          className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-[8px] ${
            attempt.passed
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-slate-100 bg-slate-50 text-slate-700"
          }`}
        >
          <p className="text-2xl font-black">
            {attempt.percentage !==
            null
              ? `${Math.round(
                  attempt.percentage
                )}%`
              : "—"}
          </p>

          <p className="mt-1 text-[9px] font-black uppercase tracking-wide">
            Score
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <SummaryMetric
          icon={Target}
          label="Marks"
          value={
            attempt.score !== null
              ? `${attempt.score}/${attempt.totalMarks ?? data.assessment.totalMarks}`
              : "—"
          }
        />

        <SummaryMetric
          icon={CheckCircle2}
          label="Correct"
          value={String(
            attempt.correctCount
          )}
        />

        <SummaryMetric
          icon={XCircle}
          label="Incorrect"
          value={String(
            attempt.incorrectCount
          )}
        />

        <SummaryMetric
          icon={HelpCircle}
          label="Unanswered"
          value={String(
            attempt.unansweredCount
          )}
        />

        <SummaryMetric
          icon={FileQuestion}
          label="Answered"
          value={String(
            attempt.answeredCount
          )}
        />

        <SummaryMetric
          icon={Flag}
          label="Flagged"
          value={String(
            attempt.flaggedCount
          )}
        />

        <SummaryMetric
          icon={Clock3}
          label="Time"
          value={formatAssessmentDuration(
            attempt.timeSpentSeconds
          )}
        />
      </div>
    </section>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-3 text-lg font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}