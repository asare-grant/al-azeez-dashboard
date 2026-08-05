"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  X,
} from "lucide-react";

import type {
  BulkActionType,
} from "./ReportCardBulkActionModal";

type ReportCardBulkActionBarProps = {
  selectedCount: number;

  selectableApproveCount:
    number;

  selectableCorrectionCount:
    number;

  selectablePublishCount:
    number;

  onClear: () => void;

  onAction: (
    action:
      BulkActionType,
  ) => void;
};

export default function ReportCardBulkActionBar({
  selectedCount,
  selectableApproveCount,
  selectableCorrectionCount,
  selectablePublishCount,
  onClear,
  onAction,
}: ReportCardBulkActionBarProps) {
  if (
    selectedCount === 0
  ) {
    return null;
  }

  return (
    <div className="sticky bottom-4 z-40 mt-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[24px] border border-slate-700 bg-slate-950 p-4 text-white shadow-[0_25px_70px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-black">
              {selectedCount}
            </p>

            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Selected
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClear
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() =>
              onAction(
                "request-changes",
              )
            }
            disabled={
              selectableCorrectionCount ===
              0
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 text-xs font-black text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AlertTriangle className="h-4 w-4" />
            Corrections (
            {
              selectableCorrectionCount
            }
            )
          </button>

          <button
            type="button"
            onClick={() =>
              onAction(
                "approve",
              )
            }
            disabled={
              selectableApproveCount ===
              0
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve (
            {
              selectableApproveCount
            }
            )
          </button>

          <button
            type="button"
            onClick={() =>
              onAction(
                "publish",
              )
            }
            disabled={
              selectablePublishCount ===
              0
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShieldCheck className="h-4 w-4" />
            Publish (
            {
              selectablePublishCount
            }
            )
          </button>
        </div>
      </div>
    </div>
  );
}