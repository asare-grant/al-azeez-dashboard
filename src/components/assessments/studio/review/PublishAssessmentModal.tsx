"use client";

import {
  CalendarClock,
  CheckCircle2,
  Loader2,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

import type {
  AssessmentBuilderData,
  AssessmentLessonOption,
} from "@/lib/assessments/types";

type PublishAssessmentModalProps = {
  open: boolean;
  assessment: AssessmentBuilderData;
  selectedLesson?: AssessmentLessonOption;
  isPublishing: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function formatDateTime(
  value?: Date | string
) {
  if (!value) return "Not configured";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function PublishAssessmentModal({
  open,
  assessment,
  selectedLesson,
  isPublishing,
  onClose,
  onConfirm,
}: PublishAssessmentModalProps) {
  if (!open) {
    return null;
  }

  const totalMarks =
    assessment.questions.reduce(
      (total, question) =>
        total + question.marks,
      0
    );

  const startDate = assessment.startDate
    ? new Date(assessment.startDate)
    : null;

  const willBeScheduled =
    startDate &&
    !Number.isNaN(startDate.getTime()) &&
    startDate.getTime() >
      Date.now();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="hide-scrollbar max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.3)]">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-blue-600">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Final Confirmation
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {willBeScheduled
                  ? "Schedule assessment"
                  : "Publish assessment"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Review the final details before
                releasing this assessment.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            aria-label="Close publish confirmation"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="rounded-[24px] bg-slate-950 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
              Assessment
            </p>

            <h3 className="mt-2 text-xl font-black">
              {assessment.title}
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              {selectedLesson
                ? `${selectedLesson.subject.name} • ${selectedLesson.class.name}`
                : "Lesson not selected"}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <PublishMetric
              label="Questions"
              value={String(
                assessment.questions.length
              )}
            />

            <PublishMetric
              label="Total Marks"
              value={String(totalMarks)}
            />

            <PublishMetric
              label="Pass Mark"
              value={`${assessment.passMarkPercent}%`}
            />
          </div>

          <div className="space-y-3 rounded-[24px] border border-slate-200 p-5">
            <PublishDetail
              icon={CalendarClock}
              label="Opening date"
              value={formatDateTime(
                assessment.startDate
              )}
            />

            <PublishDetail
              icon={CalendarClock}
              label="Closing date"
              value={formatDateTime(
                assessment.dueDate
              )}
            />

            <PublishDetail
              icon={CheckCircle2}
              label="Student result"
              value={
                assessment.showInstantResult
                  ? "Shown immediately"
                  : "Hidden after submission"
              }
            />

            <PublishDetail
              icon={ShieldCheck}
              label="Attempt limit"
              value={`${assessment.maxAttempts} ${
                assessment.maxAttempts === 1
                  ? "attempt"
                  : "attempts"
              }`}
            />
          </div>

          <div
            className={`rounded-2xl border p-4 ${
              willBeScheduled
                ? "border-blue-200 bg-blue-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <p
              className={`text-sm font-black ${
                willBeScheduled
                  ? "text-blue-900"
                  : "text-emerald-900"
              }`}
            >
              {willBeScheduled
                ? "This assessment will be scheduled."
                : "This assessment will become available immediately."}
            </p>

            <p
              className={`mt-1 text-xs leading-5 ${
                willBeScheduled
                  ? "text-blue-700"
                  : "text-emerald-700"
              }`}
            >
              {willBeScheduled
                ? "Students will see the assessment as upcoming until its opening date."
                : "Eligible students will be able to begin after publication."}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPublishing}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Continue Editing
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isPublishing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              {willBeScheduled
                ? "Confirm Schedule"
                : "Confirm Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublishMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function PublishDetail({
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
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-black text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}