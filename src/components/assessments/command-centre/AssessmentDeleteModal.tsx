"use client";

import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

type AssessmentDeleteModalProps = {
  open: boolean;
  assessmentTitle: string;
  isDeleting: boolean;

  onCancel: () => void;
  onConfirm: () => void;
};

export default function AssessmentDeleteModal({
  open,
  assessmentTitle,
  isDeleting,
  onCancel,
  onConfirm,
}: AssessmentDeleteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_40px_100px_rgba(15,23,42,0.3)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h2 className="mt-5 text-xl font-black text-slate-950">
          Delete assessment?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          You are about to permanently delete{" "}
          <span className="font-black text-slate-800">
            {assessmentTitle}
          </span>
          . This action cannot be reversed.
        </p>

        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs leading-5 text-red-700">
          Only draft assessments without
          student attempts or results can be
          deleted.
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-black text-white disabled:opacity-60"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}

            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}