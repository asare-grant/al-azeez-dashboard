import {
  Award,
  GraduationCap,
  Sparkles,
} from "lucide-react";

type StudentResultsHeroProps = {
  studentName: string;
  totalResults: number;
  academicYear?: string | null;
  termName?: string | null;
};

function formatTermName(
  value?: string | null
) {
  if (!value) {
    return "All Terms";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function StudentResultsHero({
  studentName,
  totalResults,
  academicYear,
  termName,
}: StudentResultsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            Academic Performance
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {studentName}&apos;s Results
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Review exam, assignment and
            assessment performance from
            one unified academic results
            centre.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <HeroTag
              label={
                academicYear ||
                "All Academic Years"
              }
            />

            <HeroTag
              label={formatTermName(
                termName
              )}
            />
          </div>
        </div>

        <div className="grid min-w-[260px] grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <GraduationCap className="h-5 w-5 text-blue-300" />

            <p className="mt-4 text-3xl font-black">
              {totalResults}
            </p>

            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Results
            </p>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <Award className="h-5 w-5 text-amber-300" />

            <p className="mt-4 text-3xl font-black">
              3
            </p>

            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Result Types
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroTag({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300">
      {label}
    </span>
  );
}