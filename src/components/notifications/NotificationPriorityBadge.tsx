import type {
  NotificationPriority,
} from "@prisma/client";

import {
  AlertTriangle,
  Bell,
  CircleAlert,
  Sparkles,
} from "lucide-react";

export default function NotificationPriorityBadge({
  priority,
}: {
  priority:
    NotificationPriority;
}) {
  const config = {
    LOW: {
      label:
        "Low",

      icon:
        Sparkles,

      className:
        "border-slate-200 bg-slate-50 text-slate-500",
    },

    NORMAL: {
      label:
        "Normal",

      icon:
        Bell,

      className:
        "border-blue-100 bg-blue-50 text-blue-600",
    },

    HIGH: {
      label:
        "High",

      icon:
        CircleAlert,

      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    URGENT: {
      label:
        "Urgent",

      icon:
        AlertTriangle,

      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  }[
    priority
  ];

  const Icon =
    config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.13em] ${config.className}`}
    >
      <Icon className="h-3 w-3" />

      {config.label}
    </span>
  );
}