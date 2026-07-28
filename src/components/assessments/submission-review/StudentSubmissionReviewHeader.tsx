import Link from "next/link";

import {
  ArrowLeft,
  BarChart3,
  Sparkles,
  Users,
} from "lucide-react";

import type {
  TeacherStudentSubmissionReview,
} from "@/lib/assessments/types";

import SubmissionPrintButton from "./SubmissionPrintButton";

type StudentSubmissionReviewHeaderProps = {
  data: TeacherStudentSubmissionReview;
};

export default function StudentSubmissionReviewHeader({
  data,
}: StudentSubmissionReviewHeaderProps) {
  return (
    <section className="print:shadow-none print:rounded-none relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10">
      <div className="print:hidden pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <div className="print:hidden flex flex-wrap gap-3">
          <Link
            href={`/list/assessments/${data.assessment.id}/submissions`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Submissions
          </Link>

          <Link
            href={`/list/assessments/${data.assessment.id}/analytics`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/15"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="print:hidden inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Individual Submission Review
            </div>

            <p className="hidden print:block text-sm font-bold uppercase tracking-widest text-slate-300">
              Individual Assessment Report
            </p>

            <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl">
              {data.student.name}{" "}
              {data.student.surname}
            </h1>

            <p className="mt-3 text-sm font-semibold text-slate-300">
              {data.assessment.title}
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <Users className="h-4 w-4 text-blue-300" />
                {data.student.studentID}
              </span>

              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                {data.assessment.lesson.subject.name}
              </span>

              <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                {data.student.className}
              </span>
            </div>
          </div>

          <SubmissionPrintButton />
        </div>
      </div>
    </section>
  );
}