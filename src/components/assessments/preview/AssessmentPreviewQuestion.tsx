"use client";

import { Bookmark, BookmarkCheck, Check, CircleX } from "lucide-react";

import type { AssessmentBuilderQuestion } from "@/lib/assessments/types";

type AssessmentPreviewQuestionProps = {
  question: AssessmentBuilderQuestion;
  questionNumber: number;

  selectedOptionId: number | null;

  flagged: boolean;

  onSelectOption: (optionId: number) => void;

  onClearAnswer: () => void;
  onToggleFlag: () => void;
};

export default function AssessmentPreviewQuestion({
  question,
  questionNumber,
  selectedOptionId,
  flagged,
  onSelectOption,
  onClearAnswer,
  onToggleFlag,
}: AssessmentPreviewQuestionProps) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.07)]">
      <div className="border-b border-slate-100 p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Question {questionNumber}
            </p>

            <p className="mt-2 text-xs font-bold text-slate-400">
              {question.marks} {question.marks === 1 ? "mark" : "marks"}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleFlag}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${
              flagged
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {flagged ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}

            {flagged ? "Flagged" : "Flag Question"}
          </button>
        </div>

        <h2 className="mt-5 whitespace-pre-wrap text-lg font-black leading-8 text-slate-950 sm:text-xl">
          {question.questionText}
        </h2>

        {question.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={question.imageUrl}
            alt={`Question ${questionNumber}`}
            className="mt-5 max-h-[420px] w-full rounded-[22px] border border-slate-200 object-contain"
          />
        ) : null}
      </div>

      <div className="space-y-3 p-5 sm:p-7">
        {question.options.map((option, optionIndex) => {
          const previewOptionId = option.id ?? option.position + 1_000_000;

          const selected = selectedOptionId === previewOptionId;

          return (
            <button
              key={option.clientId}
              type="button"
              onClick={() => onSelectOption(previewOptionId)}
              className={`group flex w-full items-start gap-4 rounded-[20px] border p-4 text-left transition ${
                selected
                  ? "border-blue-500 bg-blue-50 shadow-[0_12px_35px_rgba(37,99,235,0.12)]"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700"
                }`}
              >
                {selected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  String.fromCharCode(65 + optionIndex)
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm font-bold leading-6 text-slate-800">
                  {option.optionText}
                </p>

                {option.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={option.imageUrl}
                    alt={`Option ${optionIndex + 1}`}
                    className="mt-3 max-h-[220px] max-w-full rounded-xl border border-slate-200 object-contain"
                  />
                ) : null}
              </div>
            </button>
          );
        })}

        {selectedOptionId !== null ? (
          <button
            type="button"
            onClick={onClearAnswer}
            className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <CircleX className="h-4 w-4" />
            Clear answer
          </button>
        ) : null}
      </div>
    </section>
  );
}
