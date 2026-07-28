"use client";

import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

type QuestionCompletionBadgeProps = {
  isComplete: boolean;
};

export default function QuestionCompletionBadge({
  isComplete,
}: QuestionCompletionBadgeProps) {
  if (isComplete) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Complete
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
      <AlertCircle className="h-3.5 w-3.5" />
      Incomplete
    </div>
  );
}