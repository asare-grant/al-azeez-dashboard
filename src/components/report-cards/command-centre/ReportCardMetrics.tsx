import {
  BarChart3,
  CheckCircle2,
  FileClock,
  FileText,
  LockKeyhole,
  RefreshCcw,
} from "lucide-react";

import Link from "next/link";

import type {
  ReportCardCommandFilters,
  ReportCardCommandMetrics,
} from "../types";

function buildFreshnessHref({
  currentFilters,
  freshness,
}: {
  currentFilters:
    ReportCardCommandFilters;

  freshness:
    "FRESH" | "STALE";
}) {
  const params =
    new URLSearchParams();

  if (
    currentFilters.search
  ) {
    params.set(
      "search",
      currentFilters.search,
    );
  }

  if (
    currentFilters.classId
  ) {
    params.set(
      "classId",
      currentFilters.classId,
    );
  }

  if (
    currentFilters.academicYear
  ) {
    params.set(
      "academicYear",
      currentFilters.academicYear,
    );
  }

  if (
    currentFilters.termId
  ) {
    params.set(
      "termId",
      currentFilters.termId,
    );
  }

  if (
    currentFilters.status
  ) {
    params.set(
      "status",
      currentFilters.status,
    );
  }

  if (
    currentFilters.calculationStatus
  ) {
    params.set(
      "calculationStatus",
      currentFilters.calculationStatus,
    );
  }

  if (
    currentFilters.reviewStatus
  ) {
    params.set(
      "reviewStatus",
      currentFilters.reviewStatus,
    );
  }

  params.set(
    "freshness",
    freshness,
  );

  return `/list/report-cards?${params.toString()}`;
}

export default function ReportCardMetrics({
  metrics,
  currentFilters,
}: {
  metrics:
    ReportCardCommandMetrics;

  currentFilters:
    ReportCardCommandFilters;
}) {
  const staleHref =
    buildFreshnessHref({
      currentFilters,

      freshness:
        "STALE",
    });

  const items = [
    {
      label:
        "Total Cards",

      value:
        metrics.total,

      description:
        "Complete filtered result set",

      icon:
        FileText,
    },

    {
      label:
        "Draft Cards",

      value:
        metrics.draft,

      description:
        `${metrics.publishable} ready to publish`,

      icon:
        FileClock,
    },

    {
      label:
        "Published",

      value:
        metrics.published,

      description:
        "Locked academic records",

      icon:
        LockKeyhole,
    },

    {
      label:
        "Ready",

      value:
        metrics.ready,

      description:
        "Calculation complete",

      icon:
        CheckCircle2,
    },

    {
      label:
        "Needs Regeneration",

      value:
        metrics.needsRegeneration,

      description:
        metrics.needsRegeneration > 0
          ? "Academic snapshots outdated"
          : "All academic snapshots current",

      icon:
        RefreshCcw,

      href:
        staleHref,

      warning:
        metrics.needsRegeneration >
        0,
    },

    {
      label:
        "Average Score",

      value:
        metrics.averageScore ===
        null
          ? "—"
          : `${metrics.averageScore.toFixed(
              1,
            )}%`,

      description:
        "Across filtered cards",

      icon:
        BarChart3,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {items.map(
        (item) => {
          const Icon =
            item.icon;

          const isWarning =
            item.warning ===
            true;

          const content = (
            <>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                  isWarning
                    ? "border border-amber-200 bg-amber-100 text-amber-700"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <p className="mt-4 text-2xl font-black text-slate-950">
                {
                  item.value
                }
              </p>

              <p
                className={`mt-1 text-xs font-black uppercase tracking-[0.12em] ${
                  isWarning
                    ? "text-amber-700"
                    : "text-slate-500"
                }`}
              >
                {
                  item.label
                }
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                {
                  item.description
                }
              </p>
            </>
          );

          /*
           * Needs Regeneration remains clickable
           * even when zero, but visually becomes
           * a normal metric card.
           */
          if (
            item.href
          ) {
            return (
              <Link
                key={
                  item.label
                }
                href={
                  item.href
                }
                className={`group relative overflow-hidden rounded-[22px] border p-5 transition duration-300 hover:-translate-y-1 ${
                  isWarning
                    ? "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-[0_18px_50px_rgba(245,158,11,0.08)] hover:shadow-[0_24px_65px_rgba(245,158,11,0.14)]"
                    : "border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)] hover:border-blue-200 hover:shadow-[0_22px_55px_rgba(37,99,235,0.08)]"
                }`}
              >
                {isWarning ? (
                  <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />
                ) : null}

                <div className="relative">
                  {
                    content
                  }

                  <p
                    className={`mt-3 text-[10px] font-black uppercase tracking-[0.12em] transition ${
                      isWarning
                        ? "text-amber-600 opacity-80 group-hover:opacity-100"
                        : "text-blue-600 opacity-60 group-hover:opacity-100"
                    }`}
                  >
                    {isWarning
                      ? "View affected reports"
                      : "View freshness status"}
                  </p>
                </div>
              </Link>
            );
          }

          return (
            <article
              key={
                item.label
              }
              className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
            >
              {
                content
              }
            </article>
          );
        },
      )}
    </section>
  );
}