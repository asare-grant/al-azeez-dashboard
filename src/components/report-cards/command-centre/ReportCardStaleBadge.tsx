import {
  RefreshCcw,
} from "lucide-react";

type ReportCardStaleBadgeProps = {
  isStale:
    boolean;

  staleAt?:
    | Date
    | string
    | null;

  staleReason?:
    string | null;
};

function formatDateTime(
  value:
    | Date
    | string,
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(
    new Date(value),
  );
}

export default function ReportCardStaleBadge({
  isStale,
  staleAt,
  staleReason,
}: ReportCardStaleBadgeProps) {
  if (!isStale) {
    return null;
  }

  const title = [
    staleReason ||
      "Academic source results changed after this report card was generated.",

    staleAt
      ? `Detected ${formatDateTime(
          staleAt,
        )}`
      : null,

    "Regenerate the report card before continuing with review or publication.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <span
      title={title}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-amber-700 shadow-sm"
    >
      <RefreshCcw className="h-3.5 w-3.5 shrink-0" />

      <span className="truncate">
        Needs Regeneration
      </span>
    </span>
  );
}