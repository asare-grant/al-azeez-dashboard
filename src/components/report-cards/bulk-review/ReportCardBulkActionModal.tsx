"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

export type BulkActionType =
  | "approve"
  | "request-changes"
  | "publish";

type ReportCardBulkActionModalProps = {
  open: boolean;

  action:
    BulkActionType | null;

  selectedCount: number;

  note: string;

  isPending: boolean;

  onNoteChange: (
    value: string,
  ) => void;

  onClose: () => void;
  onConfirm: () => void;
};

export default function ReportCardBulkActionModal({
  open,
  action,
  selectedCount,
  note,
  isPending,
  onNoteChange,
  onClose,
  onConfirm,
}: ReportCardBulkActionModalProps) {
  if (
    !open ||
    !action
  ) {
    return null;
  }

  const config = {
    approve: {
      title:
        "Approve report cards",

      description:
        "The selected submissions will be approved when all academic and review requirements are satisfied.",

      confirmLabel:
        "Confirm Approval",

      icon:
        CheckCircle2,

      iconClass:
        "bg-emerald-50 text-emerald-600",

      buttonClass:
        "bg-emerald-600 hover:bg-emerald-700",
    },

    "request-changes": {
      title:
        "Request corrections",

      description:
        "The selected report cards will be returned to teachers for correction.",

      confirmLabel:
        "Return for Corrections",

      icon:
        AlertTriangle,

      iconClass:
        "bg-amber-50 text-amber-600",

      buttonClass:
        "bg-amber-600 hover:bg-amber-700",
    },

    publish: {
      title:
        "Publish report cards",

      description:
        "Approved report cards will become visible to students and parents and will be permanently locked.",

      confirmLabel:
        "Publish and Lock",

      icon:
        ShieldCheck,

      iconClass:
        "bg-blue-50 text-blue-600",

      buttonClass:
        "bg-slate-950 hover:bg-slate-800",
    },
  }[action];

  const Icon =
    config.icon;

  const requiresNote =
    action ===
    "request-changes";

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.35)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${config.iconClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Bulk Action
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {config.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {config.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isPending
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-3xl font-black">
              {selectedCount}
            </p>

            <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
              Selected report card
              {selectedCount === 1
                ? ""
                : "s"}
            </p>
          </div>

          {action !==
          "publish" ? (
            <label className="block">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.13em] text-slate-500">
                {requiresNote
                  ? "Correction Note"
                  : "Approval Note — Optional"}
              </span>

              <textarea
                value={note}
                onChange={(
                  event,
                ) =>
                  onNoteChange(
                    event.target
                      .value,
                  )
                }
                rows={5}
                maxLength={1000}
                placeholder={
                  requiresNote
                    ? "Explain the changes teachers must make..."
                    : "Add an optional approval note..."
                }
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-1 text-right text-[10px] font-semibold text-slate-400">
                {note.length}
                /1000
              </p>
            </label>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <p className="text-sm font-semibold leading-6 text-red-700">
                Publication is final. The
                report cards will be locked
                and made available to
                authorised students and
                parents.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                isPending
              }
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                onConfirm
              }
              disabled={
                isPending ||
                (requiresNote &&
                  note.trim()
                    .length < 5)
              }
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${config.buttonClass}`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : action ===
                "request-changes" ? (
                <Send className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}

              {config.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}