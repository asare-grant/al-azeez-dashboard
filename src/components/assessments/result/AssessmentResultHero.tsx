import {
  Award,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type {
  AssessmentResultSummary,
} from "@/lib/assessments/types";

type AssessmentResultHeroProps = {
  result: AssessmentResultSummary;
};

export default function AssessmentResultHero({
  result,
}: AssessmentResultHeroProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[32px] px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10 lg:py-10 ${
        result.passed
          ? "bg-emerald-950"
          : "bg-slate-950"
      }`}
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
            <Sparkles className="h-3.5 w-3.5" />
            Assessment Result
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
            {result.assessmentTitle}
          </h1>

          <p className="mt-3 text-sm text-slate-300">
            {result.subject} •{" "}
            {result.className}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <ResultTag
              icon={Award}
              value={`Grade ${result.grade}`}
            />

            <ResultTag
              icon={TrendingUp}
              value={result.remarks}
            />

            <ResultTag
              icon={CheckCircle2}
              value={
                result.passed
                  ? "Passed"
                  : "Completed"
              }
            />
          </div>
        </div>

        <div className="flex h-40 w-40 shrink-0 flex-col items-center justify-center rounded-full border-[10px] border-white/10 bg-white/10 backdrop-blur">
          <p className="text-4xl font-black">
            {Math.round(
              result.percentage
            )}
            %
          </p>

          <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-300">
            Final Score
          </p>
        </div>
      </div>
    </section>
  );
}

function ResultTag({
  icon: Icon,
  value,
}: {
  icon: typeof Award;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-200">
      <Icon className="h-4 w-4 text-blue-300" />
      {value}
    </span>
  );
}