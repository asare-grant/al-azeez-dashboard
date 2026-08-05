import type {
  GradingScaleStatus,
} from "@prisma/client";

import {
  Archive,
  CircleDashed,
  CircleCheckBig,
} from "lucide-react";

const statusConfig = {
  DRAFT: {
    label: "Draft",
    icon: CircleDashed,
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
  },

  ACTIVE: {
    label: "Active",
    icon: CircleCheckBig,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  ARCHIVED: {
    label: "Archived",
    icon: Archive,
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },
} satisfies Record<
  GradingScaleStatus,
  {
    label: string;
    icon: typeof CircleDashed;
    className: string;
  }
>;

export default function GradingScaleStatusBadge({
  status,
}: {
  status: GradingScaleStatus;
}) {
  const config =
    statusConfig[status];

  const Icon =
    config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
}