"use client";

import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Loader2,
} from "lucide-react";

import type {
  AssessmentSaveStatus,
} from "./types";

type StudioSaveIndicatorProps = {
  status: AssessmentSaveStatus;
  savedAt?: Date | string | null;
};

function formatSavedTime(
  value?: Date | string | null
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function StudioSaveIndicator({
  status,
  savedAt,
}: StudioSaveIndicatorProps) {
  if (status === "saving") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving changes
      </div>
    );
  }

  if (status === "unsaved") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
        <Cloud className="h-3.5 w-3.5" />
        Unsaved changes
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
        <AlertCircle className="h-3.5 w-3.5" />
        Save failed
      </div>
    );
  }

  const formattedTime = formatSavedTime(savedAt);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />

      {formattedTime
        ? `Saved at ${formattedTime}`
        : "All changes saved"}
    </div>
  );
}