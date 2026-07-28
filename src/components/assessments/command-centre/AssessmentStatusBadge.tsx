import type {
  AssessmentStatus,
} from "@prisma/client";

import {
  Archive,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  FileEdit,
} from "lucide-react";

type AssessmentStatusBadgeProps = {
  status: AssessmentStatus;
};

export default function AssessmentStatusBadge({
  status,
}: AssessmentStatusBadgeProps) {
  const config = {
    DRAFT: {
      label: "Draft",
      icon: FileEdit,
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
    },

    SCHEDULED: {
      label: "Scheduled",
      icon: CalendarClock,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    PUBLISHED: {
      label: "Live",
      icon: CircleDot,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    CLOSED: {
      label: "Closed",
      icon: CheckCircle2,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    ARCHIVED: {
      label: "Archived",
      icon: Archive,
      className:
        "border-violet-200 bg-violet-50 text-violet-700",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}