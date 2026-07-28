import {
  BookOpenCheck,
  GraduationCap,
  Sparkles,
  UserRound,
} from "lucide-react";

import type {
  StudentAssessmentIntroductionData,
} from "@/lib/assessments/types";

type AssessmentIntroductionHeroProps = {
  assessment: StudentAssessmentIntroductionData;
};

export default function AssessmentIntroductionHero({
  assessment,
}: AssessmentIntroductionHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
          <Sparkles className="h-3.5 w-3.5" />
          Assessment Briefing
        </div>

        <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
          {assessment.title}
        </h1>

        <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-slate-300">
          <HeroTag
            icon={BookOpenCheck}
            value={
              assessment.lesson.subject
                .name
            }
          />

          <HeroTag
            icon={GraduationCap}
            value={
              assessment.lesson.class.name
            }
          />

          <HeroTag
            icon={UserRound}
            value={`${assessment.lesson.teacher.name} ${assessment.lesson.teacher.surname}`}
          />
        </div>
      </div>
    </section>
  );
}

function HeroTag({
  icon: Icon,
  value,
}: {
  icon: typeof BookOpenCheck;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <Icon className="h-4 w-4 text-blue-300" />
      {value}
    </div>
  );
}