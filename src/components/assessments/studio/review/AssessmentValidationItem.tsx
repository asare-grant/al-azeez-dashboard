"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

import type {
  AssessmentValidationItemData,
} from "./assessment-review";

type AssessmentValidationItemProps = {
  item: AssessmentValidationItemData;
  onFix: () => void;
};

export default function AssessmentValidationItem({
  item,
  onFix,
}: AssessmentValidationItemProps) {
  const styles = {
    success: {
      container:
        "border-emerald-200 bg-emerald-50/60",
      icon: "bg-emerald-100 text-emerald-700",
      title: "text-emerald-950",
      description: "text-emerald-700",
    },

    warning: {
      container:
        "border-amber-200 bg-amber-50/60",
      icon: "bg-amber-100 text-amber-700",
      title: "text-amber-950",
      description: "text-amber-700",
    },

    error: {
      container:
        "border-red-200 bg-red-50/60",
      icon: "bg-red-100 text-red-700",
      title: "text-red-950",
      description: "text-red-700",
    },
  }[item.severity];

  const Icon =
    item.severity === "success"
      ? CheckCircle2
      : item.severity === "warning"
      ? AlertTriangle
      : AlertCircle;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${styles.container}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-black ${styles.title}`}
        >
          {item.title}
        </p>

        <p
          className={`mt-1 text-xs leading-5 ${styles.description}`}
        >
          {item.description}
        </p>
      </div>

      {item.severity !== "success" ? (
        <button
          type="button"
          onClick={onFix}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white/80 px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-white"
        >
          Fix
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}