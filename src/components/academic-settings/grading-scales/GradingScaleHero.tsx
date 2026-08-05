import Link from "next/link";

import {
  ArrowLeft,
  CircleCheckBig,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Scale,
  Sparkles,
} from "lucide-react";

type GradingScaleHeroProps = {
  total: number;
  active: number;
};

export default function GradingScaleHero({
  total,
  active,
}: GradingScaleHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,0.24)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
            <Sparkles className="h-3.5 w-3.5" />

            Academic Configuration
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Grading Scale Command Centre
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Design, validate and manage the grading standards used by academic
            weightings, result calculations and student report cards.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/list/academic-settings/grading-scales/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />

              New Grading Scale
            </Link>

            <Link
              href="/list/academic-settings/weightings"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
            >
              <Scale className="h-4 w-4" />

              Academic Weightings
            </Link>

            <Link
              href="/admin"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-transparent px-5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <LayoutDashboard className="h-4 w-4" />

              Dashboard
            </Link>
          </div>
        </div>

        <div className="grid min-w-[290px] grid-cols-2 gap-3">
          <HeroMetric
            icon={GraduationCap}
            value={total}
            label="Total Scales"
          />

          <HeroMetric
            icon={CircleCheckBig}
            value={active}
            label="Active Scales"
          />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof GraduationCap;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}