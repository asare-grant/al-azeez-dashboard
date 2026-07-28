import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CirclePlay,
  Clock3,
  Lock,
} from "lucide-react";

import type {
  StudentAssessmentCardStatus,
} from "@/lib/assessments/types";

type StudentAssessmentStatusBadgeProps = {
  status: StudentAssessmentCardStatus;
};

export default function StudentAssessmentStatusBadge({
  status,
}: StudentAssessmentStatusBadgeProps) {
  const config = {
    AVAILABLE: {
      label: "Available",
      icon: CirclePlay,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    IN_PROGRESS: {
      label: "In Progress",
      icon: Clock3,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    UPCOMING: {
      label: "Upcoming",
      icon: CalendarClock,
      className:
        "border-violet-200 bg-violet-50 text-violet-700",
    },

    COMPLETED: {
      label: "Completed",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    MISSED: {
      label: "Missed",
      icon: AlertCircle,
      className:
        "border-red-200 bg-red-50 text-red-700",
    },

    CLOSED: {
      label: "Closed",
      icon: Lock,
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
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