"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type AssessmentReadinessCardProps = {
  percentage: number;
  errorCount: number;
  warningCount: number;
  isReady: boolean;
};

export default function AssessmentReadinessCard({
  percentage,
  errorCount,
  warningCount,
  isReady,
}: AssessmentReadinessCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border p-6 sm:p-7 ${
        isReady
          ? "border-emerald-200 bg-emerald-950 text-white"
          : "border-slate-200 bg-slate-950 text-white"
      }`}
    >
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between xl:flex-col">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] ${
              isReady
                ? "bg-emerald-100 text-emerald-300"
                : "bg-white/10 text-blue-300"
            }`}
          >
            {isReady ? (
              <ShieldCheck className="h-7 w-7" />
            ) : (
              <Sparkles className="h-7 w-7" />
            )}
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
              Publishing Readiness
            </p>

            <h3 className="mt-2 text-2xl text-black font-black">
              {isReady
                ? "Ready to publish"
                : "Complete the final checks"}
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              {isReady
                ? "The assessment has passed every required validation check."
                : "Resolve all required issues before making the assessment available to students."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div
            className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(rgb(37 99 235) ${
                percentage * 3.6
              }deg, rgba(255,255,255,0.12) 0deg)`,
            }}
          >
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-slate-950">
              <span className="text-2xl font-black">
                {percentage}%
              </span>

              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Ready
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              {errorCount} required{" "}
              {errorCount === 1
                ? "issue"
                : "issues"}
            </div>

            <div className="flex items-center gap-2 text-sm font-bold">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              {warningCount}{" "}
              {warningCount === 1
                ? "warning"
                : "warnings"}
            </div>

            <div className="flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Validation complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}