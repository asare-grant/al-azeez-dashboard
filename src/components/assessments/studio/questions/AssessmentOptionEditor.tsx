"use client";

import {
  Check,
  ImagePlus,
  Trash2,
} from "lucide-react";

import type {
  AssessmentBuilderOption,
} from "@/lib/assessments";

type AssessmentOptionEditorProps = {
  option: AssessmentBuilderOption;
  optionIndex: number;
  totalOptions: number;

  onChange: (
    option: AssessmentBuilderOption
  ) => void;

  onDelete: () => void;
  onSelectCorrect: () => void;
};

function getOptionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

export default function AssessmentOptionEditor({
  option,
  optionIndex,
  totalOptions,
  onChange,
  onDelete,
  onSelectCorrect,
}: AssessmentOptionEditorProps) {
  const optionLetter =
    getOptionLetter(optionIndex);

  return (
    <div
      className={`group rounded-2xl border p-3 transition ${
        option.isCorrect
          ? "border-emerald-300 bg-emerald-50/60 shadow-[0_10px_30px_rgba(16,185,129,0.08)]"
          : "border-slate-200 bg-white hover:border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onSelectCorrect}
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition ${
            option.isCorrect
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
          }`}
          aria-label={`Mark option ${optionLetter} as correct`}
          title="Set as correct answer"
        >
          {option.isCorrect ? (
            <Check className="h-4 w-4" />
          ) : (
            optionLetter
          )}
        </button>

        <div className="min-w-0 flex-1">
          <textarea
            value={option.optionText}
            onChange={(event) =>
              onChange({
                ...option,
                optionText:
                  event.target.value,
              })
            }
            rows={2}
            placeholder={`Enter option ${optionLetter}`}
            className="min-h-[72px] w-full resize-none border-none bg-transparent px-1 py-1 text-sm font-semibold leading-6 text-slate-900 outline-none placeholder:text-slate-400"
          />

          {option.imageUrl ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs font-semibold text-slate-500">
                  {option.imageUrl}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...option,
                      imageUrl: "",
                    })
                  }
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  Remove image
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const imageUrl =
                window.prompt(
                  "Enter the image URL for this option:"
                );

              if (!imageUrl) return;

              onChange({
                ...option,
                imageUrl,
              });
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
            aria-label="Add option image"
            title="Add image"
          >
            <ImagePlus className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={totalOptions <= 2}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Delete option"
            title={
              totalOptions <= 2
                ? "A question must have at least two options"
                : "Delete option"
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {option.isCorrect ? (
        <div className="mt-2 flex items-center gap-2 pl-12 text-xs font-bold text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          Correct answer
        </div>
      ) : null}
    </div>
  );
}