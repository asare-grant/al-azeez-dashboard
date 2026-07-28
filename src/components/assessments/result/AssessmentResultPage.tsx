import Link from "next/link";

import { ArrowLeft, LayoutDashboard } from "lucide-react";

import type { AssessmentResultReview } from "@/lib/assessments/types";

import AssessmentQuestionReview from "./AssessmentQuestionReview";
import AssessmentResultHero from "./AssessmentResultHero";
import AssessmentResultHidden from "./AssessmentResultHidden";
import AssessmentResultMetrics from "./AssessmentResultMetrics";
import AssessmentTeacherFeedback from "./AssessmentTeacherFeedback";

type AssessmentResultPageProps = {
  result: AssessmentResultReview;
};

export default function AssessmentResultPage({
  result,
}: AssessmentResultPageProps) {
  const { summary } = result;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-4 flex flex-wrap gap-3">
          <Link
            href="/student/assessments"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Assessments
          </Link>

          <Link
            href="/student"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        {summary.showInstantResult ? (
          <>
            <AssessmentResultHero result={summary} />

            <div className="mt-6">
              <AssessmentResultMetrics result={summary} />
            </div>

            {summary.teacherFeedback ? (
              <div className="mt-6">
                <AssessmentTeacherFeedback
                  feedback={summary.teacherFeedback}
                  reviewedByName={summary.reviewedByName}
                  reviewedAt={summary.reviewedAt}
                />
              </div>
            ) : null}

            {summary.showCorrectAnswers && result.questions.length > 0 ? (
              <div className="mt-6">
                <AssessmentQuestionReview questions={result.questions} />
              </div>
            ) : (
              <section className="mt-6 rounded-[26px] border border-slate-200 bg-white p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                <h2 className="text-xl font-black text-slate-950">
                  Answer review is unavailable
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your teacher has chosen not to display the correct answers for
                  this assessment.
                </p>
              </section>
            )}
          </>
        ) : (
          <AssessmentResultHidden />
        )}
      </div>
    </div>
  );
}
