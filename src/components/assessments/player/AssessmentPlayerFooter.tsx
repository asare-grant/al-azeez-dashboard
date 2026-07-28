"use client";

import {
  ArrowLeft,
  ArrowRight,
  Send,
} from "lucide-react";

type AssessmentPlayerFooterProps = {
  currentIndex: number;
  questionCount: number;

  allowBacktrack: boolean;
  hasCurrentAnswer: boolean;

  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

export default function AssessmentPlayerFooter({
  currentIndex,
  questionCount,
  allowBacktrack,
  hasCurrentAnswer,
  onPrevious,
  onNext,
  onSubmit,
}: AssessmentPlayerFooterProps) {
  const isFirst =
    currentIndex === 0;

  const isLast =
    currentIndex ===
    questionCount - 1;

  return (
    <div className="sticky bottom-0 z-30 mt-5 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-12px_35px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:rounded-[22px] sm:border sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={
            isFirst ||
            !allowBacktrack
          }
          onClick={onPrevious}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">
            Previous
          </span>
        </button>

        <p className="text-xs font-bold text-slate-400">
          {hasCurrentAnswer
            ? "Answer selected"
            : "No answer selected"}
        </p>

        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
            Submit
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <span className="hidden sm:inline">
              Next Question
            </span>

            <span className="sm:hidden">
              Next
            </span>

            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}