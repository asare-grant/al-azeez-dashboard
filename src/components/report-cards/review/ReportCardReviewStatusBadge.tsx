import type {
  ReportCardCalculationStatus,
  ReportCardReviewStatus,
  ReportCardStatus,
} from "@prisma/client";

import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock3,
  FileEdit,
  FileText,
  LockKeyhole,
  Send,
  ShieldCheck,
} from "lucide-react";

export function ReportCardReviewStatusBadge({
  status,
}: {
  status: ReportCardReviewStatus;
}) {
  const config = {
    DRAFT: {
      label: "Draft",
      icon: FileEdit,
      className:
        "border-slate-200 bg-slate-50 text-slate-700",
    },

    SUBMITTED: {
      label: "Awaiting Review",
      icon: Send,
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    CHANGES_REQUESTED: {
      label: "Changes Requested",
      icon: AlertTriangle,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    APPROVED: {
      label: "Approved",
      icon: ShieldCheck,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
  } satisfies Record<
    ReportCardReviewStatus,
    {
      label: string;
      icon: typeof FileEdit;
      className: string;
    }
  >;

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${item.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}

export function ReportCardLifecycleStatusBadge({
  status,
}: {
  status: ReportCardStatus;
}) {
  const config = {
    DRAFT: {
      label: "Unpublished",
      icon: FileText,
      className:
        "border-slate-200 bg-white text-slate-600",
    },

    PUBLISHED: {
      label: "Published",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    ARCHIVED: {
      label: "Archived",
      icon: Archive,
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  } satisfies Record<
    ReportCardStatus,
    {
      label: string;
      icon: typeof FileText;
      className: string;
    }
  >;

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${item.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}

export function ReportCardCalculationBadge({
  status,
}: {
  status: ReportCardCalculationStatus;
}) {
  const config = {
    READY: {
      label: "Academically Ready",
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    PARTIAL: {
      label: "Partial Results",
      icon: Clock3,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    BLOCKED: {
      label: "Calculation Blocked",
      icon: LockKeyhole,
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  } satisfies Record<
    ReportCardCalculationStatus,
    {
      label: string;
      icon: typeof Clock3;
      className: string;
    }
  >;

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] ${item.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}