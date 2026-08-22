import Link from "next/link";

import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FilePlus2,
  GraduationCap,
  Layers3,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import GenerateReportCardsButton from "./GenerateReportCardsButton";
import PublishClassReportCardsButton from "./PublishClassReportCardsButton";

type ReportCardCommandHeroProps = {
  selectedClassId?: number;
  selectedAcademicYear?: string;
  selectedTermId?: number;

  publishableCount: number;

  canReview: boolean;
  canPublish: boolean;
};

export default function ReportCardCommandHero({
  selectedClassId,
  selectedAcademicYear,
  selectedTermId,
  publishableCount,
  canReview,
  canPublish,
}: ReportCardCommandHeroProps) {
  const selectionComplete = Boolean(
    selectedClassId && selectedAcademicYear && selectedTermId,
  );

  const generateHref = selectionComplete
    ? `/list/report-cards/generate?classId=${selectedClassId}&academicYear=${encodeURIComponent(
        selectedAcademicYear!,
      )}&termId=${selectedTermId}`
    : "/list/report-cards/generate";

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-800/80 bg-[linear-gradient(125deg,#020617_0%,#07152d_38%,#0c2757_72%,#172554_100%)] text-white shadow-[0_34px_110px_rgba(15,23,42,0.26)] sm:rounded-[36px]">
      {/* ================================================================ */}
      {/*                         ATMOSPHERE                               */}
      {/* ================================================================ */}

      <div className="pointer-events-none absolute -right-44 -top-52 h-[560px] w-[560px] rounded-full bg-blue-500/[0.17] blur-3xl" />

      <div className="pointer-events-none absolute -bottom-60 left-[18%] h-[500px] w-[500px] rounded-full bg-cyan-400/[0.08] blur-3xl" />

      <div className="pointer-events-none absolute right-[12%] top-12 h-40 w-40 rounded-full border border-white/[0.04]" />

      <div className="pointer-events-none absolute right-[15%] top-20 h-24 w-24 rounded-full border border-white/[0.025]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.027]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative p-5 sm:p-7 lg:p-8 xl:p-9">
        {/* ================================================================ */}
        {/*                         COMMAND BAR                              */}
        {/* ================================================================ */}

        <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.10] px-3 py-1.5 backdrop-blur-xl">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />

            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">
              Academic Reporting Command
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <HeroCapability icon={FileCheck2} label="Calculated Results" />

            <HeroCapability icon={Trophy} label="Ranked Performance" />

            <HeroCapability icon={ShieldCheck} label="Protected Records" />
          </div>
        </div>

        {/* ================================================================ */}
        {/*                           MAIN                                   */}
        {/* ================================================================ */}

        <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1fr)_470px] xl:items-stretch">
          {/* ------------------------------------------------------------- */}
          {/*                            LEFT                               */}
          {/* ------------------------------------------------------------- */}

          <div className="flex min-w-0 flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                School Academic Records
              </p>

              <div className="mt-3 flex items-start gap-4 sm:gap-5">
                <div className="hidden h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[22px] border border-white/[0.09] bg-white/[0.06] text-blue-200 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:flex">
                  <GraduationCap className="h-7 w-7" />
                </div>

                <div className="min-w-0">
                  <h1 className="max-w-4xl text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl lg:text-[3rem] lg:leading-[1.02]">
                    Report Card Command Centre
                  </h1>

                  <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-300 sm:text-[15px]">
                    Control the complete terminal reporting lifecycle from one
                    authoritative workspace. Generate, review, publish and
                    preserve complete terminal report cards using the
                    school&apos;s academic weighting and grading rules.
                  </p>
                </div>
              </div>

              {/* --------------------------------------------------------- */}
              {/*                    WORKFLOW STRIP                         */}
              {/* --------------------------------------------------------- */}

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <WorkflowStep
                  number="01"
                  icon={FilePlus2}
                  title="Generate"
                  description="Build draft reports from verified academic results."
                />

                <WorkflowStep
                  number="02"
                  icon={ClipboardCheck}
                  title="Review"
                  description="Inspect readiness, remarks and calculations."
                />

                <WorkflowStep
                  number="03"
                  icon={CheckCircle2}
                  title="Approve"
                  description="Move validated records through approval gates."
                />

                <WorkflowStep
                  number="04"
                  icon={ShieldCheck}
                  title="Publish"
                  description="Lock and release official student records."
                />
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/*                     PRIMARY ACTIONS                        */}
            {/* ----------------------------------------------------------- */}

            <div className="mt-7 flex flex-wrap gap-3 border-t border-white/[0.08] pt-5">
              <Link
                href={generateHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-[0_14px_32px_rgba(37,99,235,0.24)] transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                <FilePlus2 className="h-4 w-4" />
                Generate Reports
              </Link>

              {canReview ? (
                <Link
                  href="/list/report-cards/review"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.06] px-5 text-sm font-black text-slate-200 backdrop-blur-xl transition hover:border-blue-400/20 hover:bg-blue-400/10 hover:text-blue-200"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Open Bulk Review
                </Link>
              ) : null}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/*                     OPERATIONS CONSOLE                       */}
          {/* ------------------------------------------------------------- */}

          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl sm:p-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative">
              {/* PANEL HEADER */}

              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-blue-300" />

                    <p className="text-[9px] font-black uppercase tracking-[0.17em] text-blue-300">
                      Executive Operations
                    </p>
                  </div>

                  <h2 className="mt-1.5 text-lg font-black tracking-tight text-white">
                    Reporting workspace
                  </h2>

                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {selectionComplete
                      ? "The selected academic period is ready for operations."
                      : "Select a class, academic year and term below."}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                    selectionComplete
                      ? "border-emerald-400/10 bg-emerald-400/10 text-emerald-300"
                      : "border-amber-400/10 bg-amber-400/10 text-amber-300"
                  }`}
                >
                  {selectionComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Layers3 className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* WORKSPACE STATUS */}

              <div className="mt-5 rounded-[20px] border border-blue-400/[0.12] bg-blue-400/[0.07] p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Period Status
                    </p>

                    <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                      {selectionComplete ? "Ready" : "Awaiting Selection"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
                      Publishable
                    </p>

                    <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-blue-200">
                      {publishableCount}
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectionComplete
                        ? "w-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300"
                        : "w-1/3 bg-amber-300/80"
                    }`}
                  />
                </div>
              </div>

              {/* CONTEXT METRICS */}

              <div className="mt-3 grid grid-cols-2 gap-3">
                <CommandMetric
                  icon={GraduationCap}
                  label="Academic Period"
                  value={
                    selectedAcademicYear ? selectedAcademicYear : "Not selected"
                  }
                />

                <CommandMetric
                  icon={Award}
                  label="Ready to Publish"
                  value={String(publishableCount)}
                />
              </div>

              {/* PERIOD OPERATIONS */}

              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <p className="mb-3 text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Period Operations
                </p>

                <div className="space-y-2.5 flex gap-3">
                  <GenerateReportCardsButton
                    classId={selectedClassId}
                    academicYear={selectedAcademicYear}
                    termId={selectedTermId}
                  />

                  <PublishClassReportCardsButton
                    classId={selectedClassId}
                    academicYear={selectedAcademicYear}
                    termId={selectedTermId}
                    publishableCount={publishableCount}
                    canPublish={canPublish}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/*                         BOTTOM STRIP                             */}
        {/* ================================================================ */}

        <div className="mt-7 grid gap-3 border-t border-white/[0.08] pt-5 md:grid-cols-3">
          <CommandIndicator
            icon={BookOpenCheck}
            label="Academic Engine"
            title="Weighted calculations"
            description="Subject results follow the configured weighting and grading rules."
          />

          <CommandIndicator
            icon={Award}
            label="Performance Intelligence"
            title="Ranking and grading"
            description="Class positions, subject positions and final grades are calculated consistently."
          />

          <CommandIndicator
            icon={ShieldCheck}
            label="Record Protection"
            title="Publication safeguards"
            description="Published records are protected from accidental academic changes."
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                          HERO CAPABILITY                                   */
/* -------------------------------------------------------------------------- */

function HeroCapability({
  icon: Icon,
  label,
}: {
  icon: typeof Award;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] text-slate-400">
      <Icon className="h-3.5 w-3.5 text-blue-300" />

      {label}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            WORKFLOW STEP                                   */
/* -------------------------------------------------------------------------- */

function WorkflowStep({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: typeof FilePlus2;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5 transition hover:border-blue-400/20 hover:bg-white/[0.055]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-blue-200">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span className="text-[8px] font-black tracking-[0.14em] text-slate-600">
          {number}
        </span>
      </div>

      <p className="mt-3 text-xs font-black text-white">{title}</p>

      <p className="mt-1 text-[9px] font-medium leading-4 text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            COMMAND METRIC                                  */
/* -------------------------------------------------------------------------- */

function CommandMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-blue-200">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80" />
      </div>

      <p className="mt-3 break-words text-lg font-black tracking-[-0.025em] text-white">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           COMMAND INDICATOR                                */
/* -------------------------------------------------------------------------- */

function CommandIndicator({
  icon: Icon,
  label,
  title,
  description,
}: {
  icon: typeof BookOpenCheck;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/10 text-blue-300">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-xs font-black text-white">{title}</p>

        <p className="mt-1 text-[10px] font-medium leading-4 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
