import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

import { 
    AssessmentQuestionAnalytics 
} from "@/lib/assessments/types";


type AssessmentQuestionInsightCardsProps = {
  strongest:
    AssessmentQuestionAnalytics[];

  weakest:
    AssessmentQuestionAnalytics[];
};

export default function AssessmentQuestionInsightCards({
  strongest,
  weakest,
}: AssessmentQuestionInsightCardsProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <InsightCard
        title="Strongest Questions"
        description="Questions with the highest correct-response rate."
        questions={strongest}
        type="strong"
      />

      <InsightCard
        title="Weakest Questions"
        description="Questions requiring reteaching or review."
        questions={weakest}
        type="weak"
      />
    </div>
  );
}

function InsightCard({
  title,
  description,
  questions,
  type,
}: {
  title: string;
  description: string;
  questions:
    AssessmentQuestionAnalytics[];
  type: "strong" | "weak";
}) {
  const Icon =
    type === "strong"
      ? ArrowUpRight
      : ArrowDownRight;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            type === "strong"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {questions.map(
          (question) => (
            <div
              key={question.questionId}
              className="rounded-2xl bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Question{" "}
                    {
                      question.questionNumber
                    }
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm font-black leading-6 text-slate-900">
                    {
                      question.questionText
                    }
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
                    type === "strong"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {
                    question.correctPercentage
                  }
                  %
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}