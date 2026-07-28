"use client";

import {
    Check,
} from "lucide-react";

import { 
    StudentAssessmentOption 
} from "@/lib/assessments/types";

type AssessmentOptionCardProps = {
  option: StudentAssessmentOption;
  optionIndex: number;
  selected: boolean;
  disabled?: boolean;

  onSelect: () => void;
};

function getOptionLetter(
  index: number
) {
  return String.fromCharCode(
    65 + index
  );
}

export default function AssessmentOptionCard({
  option,
  optionIndex,
  selected,
  disabled = false,
  onSelect,
}: AssessmentOptionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-[0_12px_35px_rgba(37,99,235,0.10)]"
          : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition ${
          selected
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-blue-300 group-hover:text-blue-600"
        }`}
      >
        {selected ? (
          <Check className="h-4 w-4" />
        ) : (
          getOptionLetter(
            optionIndex
          )
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-900 sm:text-base">
          {option.optionText}
        </p>

        {option.imageUrl ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img
              src={option.imageUrl}
              alt=""
              className="max-h-72 w-full object-contain"
            />
          </div>
        ) : null}
      </div>
    </button>
  );
}