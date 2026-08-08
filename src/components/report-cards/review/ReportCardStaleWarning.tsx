import Link from "next/link";

import {
  AlertTriangle,
  Clock3,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

type ReportCardStaleWarningProps = {
  isStale:
    boolean;

  staleAt:
    | Date
    | string
    | null;

  staleReason:
    string | null;

  regenerationHref:
    string;
};

function formatDateTime(
  value:
    Date | string,
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

export default function ReportCardStaleWarning({
  isStale,
  staleAt,
  staleReason,
  regenerationHref,
}: ReportCardStaleWarningProps) {
  if (!isStale) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-[0_18px_55px_rgba(245,158,11,0.08)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-amber-700">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
                Academic Integrity Alert
              </p>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white/80 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-amber-700">
                <AlertTriangle className="h-3 w-3" />

                Needs Regeneration
              </span>
            </div>

            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Academic snapshot is outdated
            </h2>

            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
              {staleReason ||
                "One or more academic source results changed after this report card was generated. The report must be regenerated before review, approval or publication can continue."}
            </p>

            {staleAt ? (
              <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                <Clock3 className="h-3.5 w-3.5 text-amber-600" />

                Detected{" "}
                {formatDateTime(
                  staleAt,
                )}
              </div>
            ) : null}
          </div>
        </div>

        <Link
          href={
            regenerationHref
          }
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-black text-white shadow-lg shadow-amber-600/20 transition hover:-translate-y-0.5 hover:bg-amber-700"
        >
          <RefreshCcw className="h-4 w-4" />

          Regenerate Report
        </Link>
      </div>
    </section>
  );
}