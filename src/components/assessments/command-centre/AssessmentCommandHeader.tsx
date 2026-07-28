import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  Plus,
  Sparkles,
} from "lucide-react";

type AssessmentCommandHeaderProps = {
  totalAssessments: number;
};

export default function AssessmentCommandHeader({
  totalAssessments,
}: AssessmentCommandHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
            <BadgeCheck className="h-3.5 w-3.5" />
            AAIS Digital Assessment Centre
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Assessment Command Centre
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Create, schedule, monitor and
            analyse every digital assessment
            from one beautifully organised
            workspace.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-300">
            <span className="text-2xl font-black text-white">
              {totalAssessments}
            </span>

            total{" "}
            {totalAssessments === 1
              ? "assessment"
              : "assessments"}

            <ArrowRight className="h-4 w-4 text-blue-400" />
          </div>
        </div>

        <Link
          href="/list/assessments/create"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Assessment
        </Link>
      </div>
    </section>
  );
}