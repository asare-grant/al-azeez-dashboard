"use client";

import {
  Bookmark,
  BookmarkCheck,
  Eraser,
} from "lucide-react";

import AssessmentOptionCard from "./AssessmentOptionCard";
import { 
    StudentAssessmentQuestion 
} from "@/lib/assessments/types";

type AssessmentQuestionPanelProps = {
  question: StudentAssessmentQuestion;
  questionNumber: number;

  selectedOptionId:
    | number
    | null;

  flagged: boolean;
  isSaving: boolean;

  onSelectOption: (
    optionId: number
  ) => void;

  onClearAnswer: () => void;
  onToggleFlag: () => void;
};

export default function AssessmentQuestionPanel({
  question,
  questionNumber,
  selectedOptionId,
  flagged,
  isSaving,
  onSelectOption,
  onClearAnswer,
  onToggleFlag,
}: AssessmentQuestionPanelProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-600/20">
            {questionNumber}
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Question{" "}
              {questionNumber}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              {question.marks}{" "}
              {question.marks === 1
                ? "mark"
                : "marks"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedOptionId ? (
            <button
              type="button"
              onClick={onClearAnswer}
              disabled={isSaving}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Eraser className="h-4 w-4" />
              Clear Answer
            </button>
          ) : null}

          <button
            type="button"
            onClick={onToggleFlag}
            disabled={isSaving}
            className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition ${
              flagged
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-700"
            }`}
          >
            {flagged ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}

            {flagged
              ? "Flagged"
              : "Flag for Review"}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <h2 className="whitespace-pre-wrap text-lg font-black leading-8 text-slate-950 sm:text-xl">
          {question.questionText}
        </h2>

        {question.imageUrl ? (
          <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 p-3">
            <img
              src={question.imageUrl}
              alt=""
              className="mx-auto max-h-[420px] w-full object-contain"
            />
          </div>
        ) : null}

        <div className="mt-7 space-y-3">
          {question.options.map(
            (
              option,
              optionIndex
            ) => (
              <AssessmentOptionCard
                key={option.id}
                option={option}
                optionIndex={
                  optionIndex
                }
                selected={
                  selectedOptionId ===
                  option.id
                }
                disabled={isSaving}
                onSelect={() =>
                  onSelectOption(
                    option.id
                  )
                }
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}