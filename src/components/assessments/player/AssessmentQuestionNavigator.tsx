"use client";

import {
  Bookmark,
  CheckCircle2,
  Circle,
  ListChecks,
} from "lucide-react";

import type {
  AssessmentPlayerAnswerState,
} from "./types";

type AssessmentQuestionNavigatorProps = {
  answers: AssessmentPlayerAnswerState[];
  currentIndex: number;
  allowBacktrack: boolean;

  onNavigate: (
    index: number
  ) => void;
};

export default function AssessmentQuestionNavigator({
  answers,
  currentIndex,
  allowBacktrack,
  onNavigate,
}: AssessmentQuestionNavigatorProps) {
  const answeredCount =
    answers.filter(
      (answer) =>
        answer.selectedOptionId !==
        null
    ).length;

  const flaggedCount =
    answers.filter(
      (answer) =>
        answer.flagged
    ).length;

  return (
    <aside className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ListChecks className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Navigator
          </p>

          <h3 className="mt-1 text-lg font-black text-slate-950">
            Questions
          </h3>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-2">
        {answers.map(
          (answer, index) => {
            const current =
              index === currentIndex;

            const answered =
              answer.selectedOptionId !==
              null;

            const flagged =
              answer.flagged;

            const inaccessible =
              !allowBacktrack &&
              index < currentIndex;

            return (
              <button
                key={answer.questionId}
                type="button"
                disabled={
                  inaccessible
                }
                onClick={() =>
                  onNavigate(index)
                }
                className={`relative flex h-10 items-center justify-center rounded-xl text-xs font-black transition ${
                  current
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : flagged
                    ? "border border-amber-300 bg-amber-50 text-amber-700"
                    : answered
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-blue-50"
                } disabled:cursor-not-allowed disabled:opacity-30`}
              >
                {index + 1}

                {flagged ? (
                  <Bookmark className="absolute -right-1 -top-1 h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                ) : null}
              </button>
            );
          }
        )}
      </div>

      <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
        <LegendRow
          icon={CheckCircle2}
          label="Answered"
          value={answeredCount}
          className="text-emerald-600"
        />

        <LegendRow
          icon={Circle}
          label="Unanswered"
          value={
            answers.length -
            answeredCount
          }
          className="text-slate-400"
        />

        <LegendRow
          icon={Bookmark}
          label="Flagged"
          value={flaggedCount}
          className="text-amber-500"
        />
      </div>

      {!allowBacktrack ? (
        <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-700">
          Backtracking is disabled. Once
          you move forward, previous
          questions cannot be reopened.
        </div>
      ) : null}
    </aside>
  );
}

function LegendRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Circle;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${className}`}
        />

        <p className="text-xs font-bold text-slate-500">
          {label}
        </p>
      </div>

      <p className="text-xs font-black text-slate-900">
        {value}
      </p>
    </div>
  );
}