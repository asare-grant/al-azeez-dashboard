"use client";

import {
  BookOpen,
  CheckCircle2,
  Cloud,
  Loader2,
  Send,
} from "lucide-react";

import AssessmentTimer from "./AssessmentTimer";

type AssessmentPlayerHeaderProps = {
  title: string;
  subject: string;

  currentQuestion: number;
  questionCount: number;

  answeredCount: number;

  isSubmitting: boolean;
  globalSaveStatus:
    | "saved"
    | "saving"
    | "error";

  expiresAt:
    | Date
    | string
    | null;

  onSubmit: () => void;
  onExpire: () => void;
};

export default function AssessmentPlayerHeader({
  title,
  subject,
  currentQuestion,
  questionCount,
  answeredCount,
  isSubmitting,
  globalSaveStatus,
  expiresAt,
  onSubmit,
  onExpire,
}: AssessmentPlayerHeaderProps) {
  const progress =
    questionCount > 0
      ? Math.round(
          (answeredCount /
            questionCount) *
            100
        )
      : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1800px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              <BookOpen className="h-4 w-4" />
              {subject}
            </div>

            <h1 className="mt-1 truncate text-base font-black text-slate-950 sm:text-lg">
              {title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SaveStatus
              status={
                globalSaveStatus
              }
            />

            <AssessmentTimer
              expiresAt={expiresAt}
              onExpire={onExpire}
            />

            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              Submit
            </button>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold text-slate-500">
              Question{" "}
              {currentQuestion} of{" "}
              {questionCount}
            </p>

            <p className="text-xs font-black text-blue-600">
              {answeredCount}/
              {questionCount} answered
            </p>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function SaveStatus({
  status,
}: {
  status:
    | "saved"
    | "saving"
    | "error";
}) {
  if (status === "saving") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
        <Loader2 className="h-4 w-4 animate-spin" />
        Saving
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700">
        <Cloud className="h-4 w-4" />
        Save failed
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
      <CheckCircle2 className="h-4 w-4" />
      Saved
    </div>
  );
}