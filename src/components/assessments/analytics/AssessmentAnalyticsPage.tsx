import type {
  TeacherAssessmentAnalytics,
} from "@/lib/assessments/types";

import AssessmentAnalyticsHeader from "./AssessmentAnalyticsHeader";
import AssessmentAnalyticsMetrics from "./AssessmentAnalyticsMetrics";
import AssessmentQuestionAnalyticsTable from "./AssessmentQuestionAnalyticsTable";
import AssessmentQuestionInsightCards from "./AssessmentQuestionInsightCards";
import AssessmentScoreDistribution from "./AssessmentScoreDistribution";

type AssessmentAnalyticsPageProps = {
  data: TeacherAssessmentAnalytics;
};

export default function AssessmentAnalyticsPage({
  data,
}: AssessmentAnalyticsPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <AssessmentAnalyticsHeader
          assessmentId={
            data.assessment.id
          }
          title={
            data.assessment.title
          }
          subject={
            data.assessment.lesson
              .subject.name
          }
          className={
            data.assessment.lesson
              .class.name
          }
        />

        <div className="mt-6">
          <AssessmentAnalyticsMetrics
            metrics={data.metrics}
          />
        </div>

        {data.metrics.submittedStudents ===
        0 ? (
          <section className="mt-6 rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-black text-slate-950">
              No analytics available yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Analytics will appear after
              students begin submitting this
              assessment.
            </p>
          </section>
        ) : (
          <>
            <div className="mt-6">
              <AssessmentScoreDistribution
                bands={
                  data.scoreBands
                }
              />
            </div>

            <div className="mt-6">
              <AssessmentQuestionInsightCards
                strongest={
                  data.strongestQuestions
                }
                weakest={
                  data.weakestQuestions
                }
              />
            </div>

            <div className="mt-6">
              <AssessmentQuestionAnalyticsTable
                questions={
                  data.questionAnalytics
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}