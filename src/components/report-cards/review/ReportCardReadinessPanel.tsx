"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import type {
  ReportCardReviewCheck,
  ReportCardReviewReadiness,
} from "@/lib/report-cards/review-types";

type ReportCardReadinessPanelProps = {
  readiness:
    ReportCardReviewReadiness;
};

export default function ReportCardReadinessPanel({
  readiness,
}: ReportCardReadinessPanelProps) {
  const [
    expanded,
    setExpanded,
  ] = useState(true);

  const checks = useMemo(
    () => [
      ...readiness.errors,
      ...readiness.warnings,
      ...readiness.successes,
    ],
    [readiness],
  );

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
      <button
        type="button"
        onClick={() =>
          setExpanded(
            (current) => !current,
          )
        }
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/40 p-5 text-left sm:p-6"
      >
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Review Readiness
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
              {
                readiness.completionPercentage
              }
              % complete
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {
                readiness.completedChecks
              }{" "}
              of {readiness.totalChecks}{" "}
              review checks have been
              completed.
            </p>
          </div>
        </div>

        <ChevronDown
          className={`mt-2 h-5 w-5 shrink-0 text-slate-400 transition-transform ${
            expanded
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      <div className="p-5 sm:p-6">
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  readiness
                    .completionPercentage,
                ),
              )}%`,
            }}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ReadinessMetric
            label="Errors"
            value={
              readiness.errors.length
            }
            className="border-red-200 bg-red-50 text-red-700"
          />

          <ReadinessMetric
            label="Warnings"
            value={
              readiness.warnings.length
            }
            className="border-amber-200 bg-amber-50 text-amber-700"
          />

          <ReadinessMetric
            label="Completed"
            value={
              readiness.successes.length
            }
            className="border-emerald-200 bg-emerald-50 text-emerald-700"
          />
        </div>

        {expanded ? (
          <div className="mt-5 space-y-3">
            {checks.map(
              (check) => (
                <ReadinessItem
                  key={check.id}
                  check={check}
                />
              ),
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ReadinessMetric({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${className}`}
    >
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
        {label}
      </p>
    </div>
  );
}

function ReadinessItem({
  check,
}: {
  check:
    ReportCardReviewCheck;
}) {
  const config = {
    success: {
      icon: CheckCircle2,
      className:
        "border-emerald-200 bg-emerald-50",
      iconClass:
        "text-emerald-600",
      titleClass:
        "text-emerald-900",
      descriptionClass:
        "text-emerald-700",
    },

    warning: {
      icon: AlertTriangle,
      className:
        "border-amber-200 bg-amber-50",
      iconClass:
        "text-amber-600",
      titleClass:
        "text-amber-900",
      descriptionClass:
        "text-amber-700",
    },

    error: {
      icon: CircleAlert,
      className:
        "border-red-200 bg-red-50",
      iconClass:
        "text-red-600",
      titleClass:
        "text-red-900",
      descriptionClass:
        "text-red-700",
    },
  }[check.severity];

  const Icon = config.icon;

  return (
    <article
      className={`flex items-start gap-3 rounded-2xl border p-4 ${config.className}`}
    >
      <Icon
        className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClass}`}
      />

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`text-sm font-black ${config.titleClass}`}
          >
            {check.title}
          </h3>

          <span className="rounded-full bg-white/70 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
            {check.section}
          </span>
        </div>

        <p
          className={`mt-1 text-xs leading-5 ${config.descriptionClass}`}
        >
          {check.description}
        </p>
      </div>
    </article>
  );
}