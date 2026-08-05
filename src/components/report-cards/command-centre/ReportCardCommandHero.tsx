import { Award, ClipboardCheck, FileCheck2, FilePlus2, GraduationCap, ShieldCheck } from "lucide-react";

import GenerateReportCardsButton from "./GenerateReportCardsButton";
import PublishClassReportCardsButton from "./PublishClassReportCardsButton";

import Link from "next/link";

type ReportCardCommandHeroProps = {
  selectedClassId?: number;
  selectedAcademicYear?: string;
  selectedTermId?: number;

  publishableCount: number;

  isAdmin: boolean;
};

export default function ReportCardCommandHero({
  selectedClassId,
  selectedAcademicYear,
  selectedTermId,
  publishableCount,
  isAdmin,
}: ReportCardCommandHeroProps) {
  const selectionComplete = Boolean(
    selectedClassId && selectedAcademicYear && selectedTermId,
  );

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
            <GraduationCap className="h-4 w-4" />
            Academic Reporting
          </div>

          <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Report Card Command Centre
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Generate, review, publish and preserve complete terminal report
            cards using the school&apos;s academic weighting and grading rules.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Feature icon={FileCheck2} label="Calculated subject results" />

            <Feature icon={Award} label="Class and subject positions" />

            <Feature icon={ShieldCheck} label="Locked published records" />
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">
            Generation Workspace
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {selectionComplete
              ? "The selected academic period is ready for report-card generation."
              : "Select a class, academic year and term from the filters below."}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
            <Link
              href={
                selectedClassId && selectedAcademicYear && selectedTermId
                  ? `/list/report-cards/generate?classId=${selectedClassId}&academicYear=${encodeURIComponent(
                      selectedAcademicYear,
                    )}&termId=${selectedTermId}`
                  : "/list/report-cards/generate"
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <FilePlus2 className="h-4 w-4" />
              Generate Reports
            </Link>

            {isAdmin ? (
            <Link
              href="/list/report-cards/review"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 text-sm font-black text-blue-700 transition hover:bg-blue-100"
            >
              <ClipboardCheck className="h-4 w-4" />
              Bulk Review
            </Link>
            ) : null}

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
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Award; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200">
      <Icon className="h-4 w-4 text-blue-300" />
      {label}
    </div>
  );
}
