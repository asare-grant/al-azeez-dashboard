import {
  BookOpenCheck,
  User,
} from "lucide-react";

type StudentAssessmentHeroProps = {
  studentName?: string;
  availableCount: number;
};

export default function StudentAssessmentHero({
  studentName,
  availableCount,
}: StudentAssessmentHeroProps) {
  const firstName =
    studentName?.trim().split(" ")[0];

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
            <User className="h-3.5 w-3.5" />
            Student Assessment Centre
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {firstName
              ? `Welcome back, ${firstName}.`
              : "Your assessments are ready."}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Complete available assessments,
            continue saved attempts and review
            your performance from one focused
            workspace.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <BookOpenCheck className="h-7 w-7" />
            </div>

            <div>
              <p className="text-3xl font-black">
                {availableCount}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-300">
                available now
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}