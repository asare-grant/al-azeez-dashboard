import {
  Check,
  CheckCircle2,
  X,
  XCircle,
} from "lucide-react";

import type {
  AssessmentReviewQuestion,
} from "@/lib/assessments/types";

type AssessmentQuestionReviewProps = {
  questions: AssessmentReviewQuestion[];
};

export default function AssessmentQuestionReview({
  questions,
}: AssessmentQuestionReviewProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Answer Review
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Review your responses
        </h2>
      </div>

      <div className="mt-6 space-y-5">
        {questions.map(
          (question, index) => (
            <article
              key={question.id}
              className={`rounded-[24px] border p-5 ${
                question.isCorrect
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-red-200 bg-red-50/40"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${
                    question.isCorrect
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-base font-black leading-7 text-slate-950">
                      {question.questionText}
                    </h3>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                        question.isCorrect
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {question.isCorrect ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}

                      {question.marksAwarded}/
                      {question.marks}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {question.options.map(
                      (option) => {
                        const correct =
                          option.isCorrect;

                        const selected =
                          option.wasSelected;

                        return (
                          <div
                            key={option.id}
                            className={`flex items-start gap-3 rounded-xl border p-3 ${
                              correct
                                ? "border-emerald-300 bg-emerald-50"
                                : selected
                                ? "border-red-300 bg-red-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                correct
                                  ? "bg-emerald-500 text-white"
                                  : selected
                                  ? "bg-red-500 text-white"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {correct ? (
                                <Check className="h-4 w-4" />
                              ) : selected ? (
                                <X className="h-4 w-4" />
                              ) : null}
                            </div>

                            <p className="text-sm font-semibold leading-6 text-slate-800">
                              {option.optionText}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {question.explanation ? (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                        Explanation
                      </p>

                      <p className="mt-2 text-sm leading-6 text-blue-900">
                        {question.explanation}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}