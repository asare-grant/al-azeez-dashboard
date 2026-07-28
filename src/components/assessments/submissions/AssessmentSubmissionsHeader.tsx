import Link from "next/link";

import {
  ArrowLeft,
  BarChart3,
  Download,
  Sparkles,
} from "lucide-react";

type AssessmentSubmissionsHeaderProps = {
  assessmentId: number;
  title: string;
  subject: string;
  className: string;
};

export default function AssessmentSubmissionsHeader({
  assessmentId,
  title,
  subject,
  className,
}: AssessmentSubmissionsHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <Link
          href="/list/assessments"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/15"
        >
          <ArrowLeft className="h-4 w-4" />
          Assessments
        </Link>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Submission Centre
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
              href={`/list/assessments/${assessmentId}/analytics`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>

            <a
              href={`/api/assessments/${assessmentId}/submissions/export`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}