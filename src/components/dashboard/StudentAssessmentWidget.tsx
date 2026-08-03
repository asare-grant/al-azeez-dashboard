import Link from "next/link";

import {
  ArrowRight,
  BookOpenCheck,
  Clock3,
  Play,
  Trophy,
} from "lucide-react";

type StudentAssessmentWidgetProps = {
  data: {
    available: number;
    upcoming: number;

    activeAttempt: {
      id: number;
      assessmentId: number;
      title: string;
      subject: string;
      answeredCount: number;
      questionCount: number;
    } | null;

    recentResults: {
      id: number;
      title: string;
      assessmentId: number | null;
      attemptId: number | null;
      score: number;
      totalMarks: number | null;
      percentage: number | null;
      grade: string | null;
    }[];
  };
};

export default function StudentAssessmentWidget({
  data,
}: StudentAssessmentWidgetProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Assessments
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            My assessment centre
          </h2>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BookOpenCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-2xl font-black text-emerald-700">
            {data.available}
          </p>

          <p className="mt-1 text-xs font-bold text-emerald-700">
            Available now
          </p>
        </div>

        <div className="rounded-2xl bg-violet-50 p-4">
          <p className="text-2xl font-black text-violet-700">
            {data.upcoming}
          </p>

          <p className="mt-1 text-xs font-bold text-violet-700">
            Upcoming
          </p>
        </div>
      </div>

      {data.activeAttempt ? (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Clock3 className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                Continue Assessment
              </p>

              <p className="mt-1 truncate font-black text-blue-950">
                {data.activeAttempt.title}
              </p>

              <p className="mt-1 text-xs text-blue-700">
                {
                  data.activeAttempt
                    .answeredCount
                }
                /
                {
                  data.activeAttempt
                    .questionCount
                }{" "}
                answered
              </p>
            </div>
          </div>

          <Link
            href={`/student/assessments/${data.activeAttempt.assessmentId}/take?attemptId=${data.activeAttempt.id}`}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white"
          >
            <Play className="h-4 w-4" />
            Continue
          </Link>
        </div>
      ) : null}

      {data.recentResults.length > 0 ? (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Recent Results
            </p>

            <Trophy className="h-4 w-4 text-amber-500" />
          </div>

          <div className="mt-3 space-y-2">
            {data.recentResults.map(
              (result) => (
                <Link
                  key={result.id}
                  href={
                    result.assessmentId &&
                    result.attemptId
                      ? `/student/assessments/${result.assessmentId}/result?attemptId=${result.attemptId}`
                      : "/list/results"
                  }
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100"
                >
                  <p className="truncate text-xs font-black text-slate-800">
                    {result.title}
                  </p>

                  <p className="shrink-0 text-sm font-black text-blue-700">
                    {result.percentage !==
                    null
                      ? `${result.percentage}%`
                      : "—"}
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      ) : null}

      <Link
        href="/student/assessments"
        className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600"
      >
        View all assessments
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}