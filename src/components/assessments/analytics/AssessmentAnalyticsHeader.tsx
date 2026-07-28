import Link from "next/link";

import {
  ArrowLeft,
  Download,
  Sparkles,
  Users,
} from "lucide-react";

type AssessmentAnalyticsHeaderProps = {
  assessmentId: number;
  title: string;
  subject: string;
  className: string;
};

export default function AssessmentAnalyticsHeader({
  assessmentId,
  title,
  subject,
  className,
}: AssessmentAnalyticsHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <Link
          href="/list/assessments"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Assessments
        </Link>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Performance Intelligence
            </div>

            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
              {title}
            </h1>

            <p className="mt-3 text-sm font-semibold text-slate-300">
              {subject} • {className}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/list/assessments/${assessmentId}/submissions`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white"
            >
              <Users className="h-4 w-4" />
              Submissions
            </Link>

            <a
              href={`/api/assessments/${assessmentId}/analytics/export`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white"
            >
              <Download className="h-4 w-4" />
              Export Analytics
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}