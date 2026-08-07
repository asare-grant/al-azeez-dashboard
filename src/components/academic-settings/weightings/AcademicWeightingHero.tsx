// import Link from "next/link";

// import {
//   Calculator,
//   GraduationCap,
//   LayoutDashboard,
//   Plus,
//   Scale,
//   Sparkles,
// } from "lucide-react";

// export default function AcademicWeightingHero({
//   total,
//   active,
// }: {
//   total: number;
//   active: number;
// }) {
//   return (
//     <section className="relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,0.24)] sm:p-8 lg:p-10">
//       <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

//       <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
//         <div className="max-w-3xl">
//           <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
//             <Sparkles className="h-3.5 w-3.5" />

//             Academic Configuration
//           </div>

//           <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
//             Academic Weighting Command Centre
//           </h1>

//           <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
//             Configure how assignments, assessments and examinations contribute
//             to each grade’s final term results.
//           </p>

//           <div className="mt-7 flex flex-wrap gap-3">
//             <Link
//               href="/list/academic-settings/weightings/create"
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
//             >
//               <Plus className="h-4 w-4" />

//               New Weighting
//             </Link>

//             <Link
//               href="/list/academic-settings/grading-scales"
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
//             >
//               <Scale className="h-4 w-4" />

//               Grading Scales
//             </Link>

//             <Link
//               href="/admin"
//               className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
//             >
//               <LayoutDashboard className="h-4 w-4" />

//               Dashboard
//             </Link>
//           </div>
//         </div>

//         <div className="grid min-w-[290px] grid-cols-2 gap-3">
//           <HeroMetric
//             icon={Calculator}
//             value={total}
//             label="Configurations"
//           />

//           <HeroMetric
//             icon={GraduationCap}
//             value={active}
//             label="Active Rules"
//           />
//         </div>
//       </div>
//     </section>
//   );
// }

// function HeroMetric({
//   icon: Icon,
//   value,
//   label,
// }: {
//   icon: typeof Calculator;
//   value: number;
//   label: string;
// }) {
//   return (
//     <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
//       <Icon className="h-5 w-5 text-blue-300" />

//       <p className="mt-4 text-3xl font-black">
//         {value}
//       </p>

//       <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
//         {label}
//       </p>
//     </div>
//   );
// }





import Link from "next/link";

import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  Plus,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function AcademicWeightingHero({
  total,
  active,
}: {
  total: number;
  active: number;
}) {
  const inactive =
    Math.max(
      0,
      total - active,
    );

  const activePercentage =
    total > 0
      ? Math.round(
          (active / total) * 100,
        )
      : 0;

  const engineConfigured =
    active > 0;

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-800/80 bg-[linear-gradient(125deg,#020617_0%,#081329_38%,#0d2552_70%,#172554_100%)] text-white shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:rounded-[36px]">
      {/* ================================================================ */}
      {/*                    BACKGROUND ATMOSPHERE                         */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute -right-40 -top-52 h-[540px] w-[540px] rounded-full bg-blue-500/[0.16] blur-3xl" />

      <div className="pointer-events-none absolute -bottom-56 left-[22%] h-[460px] w-[460px] rounded-full bg-cyan-400/[0.08] blur-3xl" />

      <div className="pointer-events-none absolute right-[14%] top-8 h-36 w-36 rounded-full border border-white/[0.04]" />

      <div className="pointer-events-none absolute right-[18%] top-16 h-20 w-20 rounded-full border border-white/[0.03]" />

      {/* GRID TEXTURE */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",

          backgroundSize:
            "44px 44px",
        }}
      />

      <div className="relative p-5 sm:p-7 lg:p-8 xl:p-9">
        {/* ================================================================ */}
        {/*                         COMMAND BAR                              */}
        {/* ================================================================ */}

        <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.10] px-3 py-1.5 backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />

              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">
                Academic Configuration Control
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] ${
                engineConfigured
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : "border-amber-400/20 bg-amber-400/10 text-amber-200"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />

              {engineConfigured
                ? "Calculation Engine Ready"
                : "Configuration Required"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
            <Calculator className="h-3.5 w-3.5" />

            Academic Rules

            <span className="text-slate-600">
              /
            </span>

            Weighting
          </div>
        </div>

        {/* ================================================================ */}
        {/*                           MAIN HERO                              */}
        {/* ================================================================ */}

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-stretch">
          {/* ============================================================= */}
          {/*                           LEFT                               */}
          {/* ============================================================= */}

          <div className="flex min-w-0 flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                Academic Calculation Framework
              </p>

              <div className="mt-4 flex items-start gap-4 sm:gap-5">
                {/* MAIN ICON */}

                <div className="relative hidden h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.07] text-blue-200 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:flex">
                  <Calculator className="h-7 w-7" />

                  <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                </div>

                <div className="min-w-0">
                  <h1 className="max-w-4xl text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl lg:text-[2.9rem] lg:leading-[1.02]">
                    Academic Weighting
                    Command Centre
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-300 sm:text-[15px]">
                    Define how assignments,
                    assessments and examinations
                    contribute to final term
                    performance and control the
                    calculation rules used by the
                    school&apos;s reporting engine.
                  </p>
                </div>
              </div>

              {/* --------------------------------------------------------- */}
              {/*                      FEATURE CHIPS                        */}
              {/* --------------------------------------------------------- */}

              <div className="mt-6 flex flex-wrap gap-2">
                <WeightingChip
                  icon={Scale}
                >
                  Score Composition
                </WeightingChip>

                <WeightingChip
                  icon={
                    GraduationCap
                  }
                  accent
                >
                  Grading Integration
                </WeightingChip>

                <WeightingChip
                  icon={ShieldCheck}
                >
                  Controlled Rules
                </WeightingChip>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/*                        ACTIONS                              */}
            {/* ----------------------------------------------------------- */}

            <div className="mt-7 flex flex-wrap gap-3 border-t border-white/[0.08] pt-5">
              <Link
                href="/list/academic-settings/weightings/create"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-[0_14px_32px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />

                New Weighting
              </Link>

              <Link
                href="/list/academic-settings/grading-scales"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.06] px-5 text-sm font-black text-slate-200 backdrop-blur-xl transition hover:border-blue-400/20 hover:bg-blue-400/10 hover:text-blue-200"
              >
                <Scale className="h-4 w-4" />

                Grading Scales
              </Link>

              <Link
                href="/admin"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-5 text-sm font-bold text-slate-400 transition hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
              >
                <LayoutDashboard className="h-4 w-4" />

                Dashboard
              </Link>
            </div>
          </div>

          {/* ============================================================= */}
          {/*                     EXECUTIVE SNAPSHOT                       */}
          {/* ============================================================= */}

          <div className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl sm:p-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative">
              {/* SNAPSHOT HEADER */}

              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-blue-300" />

                    <p className="text-[9px] font-black uppercase tracking-[0.17em] text-blue-300">
                      Executive Snapshot
                    </p>
                  </div>

                  <h2 className="mt-1.5 text-lg font-black tracking-tight text-white">
                    Weighting framework
                  </h2>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    Current academic
                    configuration coverage
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.06] text-blue-200">
                  <Scale className="h-4 w-4" />
                </div>
              </div>

              {/* PRIMARY METRIC */}

              <div className="mt-5 rounded-[20px] border border-blue-400/[0.12] bg-blue-400/[0.07] p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Configurations
                    </p>

                    <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-white">
                      {total}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
                      Active Rules
                    </p>

                    <p className="mt-1 text-2xl font-black text-blue-200">
                      {active}
                    </p>
                  </div>
                </div>

                {/* COVERAGE BAR */}

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.11em]">
                    <span className="text-slate-400">
                      Active coverage
                    </span>

                    <span className="text-blue-200">
                      {activePercentage}%
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all"
                      style={{
                        width:
                          `${activePercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECONDARY METRICS */}

              <div className="mt-3 grid grid-cols-2 gap-3">
                <ExecutiveMetric
                  icon={
                    CheckCircle2
                  }
                  label="Active"
                  value={String(
                    active,
                  )}
                  state="success"
                />

                <ExecutiveMetric
                  icon={Layers3}
                  label="Inactive"
                  value={String(
                    inactive,
                  )}
                />
              </div>

              {/* ENGINE STATE */}

              <div className="mt-3 flex items-start gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                    engineConfigured
                      ? "border-emerald-400/10 bg-emerald-400/10 text-emerald-300"
                      : "border-amber-400/10 bg-amber-400/10 text-amber-300"
                  }`}
                >
                  {engineConfigured ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
                    Academic Engine
                  </p>

                  <p className="mt-1 text-xs font-black text-white">
                    {engineConfigured
                      ? "Calculation rules available"
                      : "Configuration required"}
                  </p>

                  <p className="mt-1 text-[10px] font-medium leading-4 text-slate-400">
                    {engineConfigured
                      ? "Active weighting rules are available for report-card calculations."
                      : "Create and activate a weighting rule before generating official reports."}
                  </p>
                </div>
              </div>

              {/* QUICK LINK */}

              <Link
                href="/list/academic-settings/weightings/create"
                className="mt-4 flex h-10 items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-xs font-black text-slate-300 transition hover:border-blue-400/20 hover:bg-blue-400/10 hover:text-blue-200"
              >
                Configure academic rules

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                             WEIGHTING CHIP                                 */
/* -------------------------------------------------------------------------- */

function WeightingChip({
  icon: Icon,
  children,
  accent = false,
}: {
  icon: typeof Scale;

  children: React.ReactNode;

  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] backdrop-blur ${
        accent
          ? "border-blue-400/20 bg-blue-400/10 text-blue-200"
          : "border-white/[0.08] bg-white/[0.045] text-slate-300"
      }`}
    >
      <Icon className="h-3.5 w-3.5 text-blue-300" />

      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                           EXECUTIVE METRIC                                 */
/* -------------------------------------------------------------------------- */

function ExecutiveMetric({
  icon: Icon,
  label,
  value,
  state = "default",
}: {
  icon: typeof Layers3;

  label: string;

  value: string;

  state?:
    | "default"
    | "success";
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-blue-200">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span
          className={`h-1.5 w-1.5 rounded-full ${
            state === "success"
              ? "bg-emerald-400"
              : "bg-blue-400/80"
          }`}
        />
      </div>

      <p
        className={`mt-3 break-words text-lg font-black tracking-[-0.025em] ${
          state === "success"
            ? "text-emerald-300"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}