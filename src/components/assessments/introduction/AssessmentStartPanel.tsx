import {
  ArrowLeftRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileQuestion,
  ListRestart,
  Repeat2,
  ShieldCheck,
} from "lucide-react";

import type {
  StudentAssessmentIntroductionData,
} from "@/lib/assessments/types";

import StartAssessmentButton from "./StartAssessmentButton";

type AssessmentStartPanelProps = {
  assessment: StudentAssessmentIntroductionData;
};

function formatDateTime(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

export default function AssessmentStartPanel({
  assessment,
}: AssessmentStartPanelProps) {
  return (
    <aside className="space-y-4">
      <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Assessment Summary
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Metric
            icon={FileQuestion}
            label="Questions"
            value={String(
              assessment.questionCount
            )}
          />

          <Metric
            icon={CheckCircle2}
            label="Total Marks"
            value={String(
              assessment.totalMarks
            )}
          />

          <Metric
            icon={Clock3}
            label="Duration"
            value={
              assessment.durationMinutes
                ? `${assessment.durationMinutes} min`
                : "Untimed"
            }
          />

          <Metric
            icon={ShieldCheck}
            label="Pass Mark"
            value={`${assessment.passMarkPercent}%`}
          />
        </div>

        <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
          <Detail
            icon={CalendarClock}
            label="Opens"
            value={formatDateTime(
              assessment.startDate
            )}
          />

          <Detail
            icon={CalendarClock}
            label="Closes"
            value={formatDateTime(
              assessment.dueDate
            )}
          />

          <Detail
            icon={Repeat2}
            label="Attempts"
            value={`${assessment.attemptsUsed}/${assessment.maxAttempts} used`}
          />
        </div>

        <div className="mt-5">
          <StartAssessmentButton
            assessmentId={assessment.id}
            activeAttemptId={
              assessment.activeAttempt?.id
            }
            canStart={
              assessment.canStart
            }
            canContinue={
              assessment.canContinue
            }
            unavailableReason={
              assessment.unavailableReason
            }
          />
        </div>

        {!assessment.canStart &&
        !assessment.canContinue &&
        assessment.unavailableReason ? (
          <p className="mt-3 text-center text-xs font-semibold leading-5 text-slate-500">
            {assessment.unavailableReason}
          </p>
        ) : null}
      </section>

      <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Assessment Behaviour
        </p>

        <div className="mt-4 space-y-3">
          <BehaviourLine
            icon={ListRestart}
            label="Question order"
            value={
              assessment.shuffleQuestions
                ? "Randomised"
                : "Standard"
            }
          />

          <BehaviourLine
            icon={ArrowLeftRight}
            label="Backtracking"
            value={
              assessment.allowBacktrack
                ? "Allowed"
                : "Not allowed"
            }
          />

          <BehaviourLine
            icon={CheckCircle2}
            label="Unanswered submission"
            value={
              assessment.allowUnanswered
                ? "Allowed"
                : "Not allowed"
            }
          />

          <BehaviourLine
            icon={Clock3}
            label="Time expiry"
            value={
              assessment.autoSubmit
                ? "Auto-submit"
                : "Manual submit"
            }
          />
        </div>
      </section>
    </aside>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileQuestion;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-3 text-lg font-black text-slate-950">
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-xs font-black leading-5 text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function BehaviourLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ListRestart;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />

        <p className="text-xs font-bold text-slate-600">
          {label}
        </p>
      </div>

      <p className="text-xs font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}