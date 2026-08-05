import type {
  ReportCardCalculationStatus,
  ReportCardStatus,
} from "@prisma/client";

export function ReportCardStatusBadge({
  status,
}: {
  status: ReportCardStatus;
}) {
  const config = {
    DRAFT: {
      label: "Draft",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    },

    PUBLISHED: {
      label: "Published",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    ARCHIVED: {
      label: "Archived",
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
    },
  }[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function CalculationStatusBadge({
  status,
}: {
  status:
    ReportCardCalculationStatus;
}) {
  const config = {
    READY: {
      label: "Ready",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
    },

    PARTIAL: {
      label: "Partial",
      className:
        "border-orange-200 bg-orange-50 text-orange-700",
    },

    BLOCKED: {
      label: "Blocked",
      className:
        "border-red-200 bg-red-50 text-red-700",
    },
  }[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${config.className}`}
    >
      {config.label}
    </span>
  );
}