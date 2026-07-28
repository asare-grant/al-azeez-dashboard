"use client";

import {
  FilePlus2,
  Plus,
} from "lucide-react";

type AddQuestionButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export default function AddQuestionButton({
  onClick,
  disabled,
}: AddQuestionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex min-h-[150px] w-full flex-col items-center justify-center rounded-[26px] border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white text-blue-600 shadow-lg shadow-blue-100 transition group-hover:-translate-y-1">
        <FilePlus2 className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-950">
        Add another question
      </h3>

      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
        Add a new multiple-choice question
        to this assessment.
      </p>

      <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-blue-600/20">
        <Plus className="h-4 w-4" />
        Add Question
      </span>
    </button>
  );
}