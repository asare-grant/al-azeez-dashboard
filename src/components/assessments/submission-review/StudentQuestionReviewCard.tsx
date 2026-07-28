import {
  Check,
  CheckCircle2,
  Clock3,
  Flag,
  HelpCircle,
  X,
  XCircle,
} from "lucide-react";

import {
  formatAssessmentDuration,
} from "@/lib/assessments/grading";

import type {
  TeacherSubmissionReviewQuestion,
} from "@/lib/assessments/types";

type StudentQuestionReviewCardProps = {
  question: TeacherSubmissionReviewQuestion;
};

export default function StudentQuestionReviewCard({
  question,
}: StudentQuestionReviewCardProps) {
  return (
    <article
      className={`print:break-inside-avoid rounded-[24px] border p-5 ${
        !question.wasAnswered
          ? "border-amber-200 bg-amber-50/30"
          : question.isCorrect
          ? "border-emerald-200 bg-emerald-50/30"
          : "border-red-200 bg-red-50/30"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white ${
            !question.wasAnswered
              ? "bg-amber-500"
              : question.isCorrect
              ? "bg-emerald-500"
              : "bg-red-500"
          }`}
        >
          {question.questionNumber}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="whitespace-pre-wrap text-base font-black leading-7 text-slate-950">
              {question.questionText}
            </h3>

            <div className="flex shrink-0 flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                  !question.wasAnswered
                    ? "bg-amber-100 text-amber-700"
                    : question.isCorrect
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {!question.wasAnswered ? (
                  <HelpCircle className="h-3.5 w-3.5" />
                ) : question.isCorrect ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}

                {question.marksAwarded}/
                {question.marksAvailable}
              </span>

              {question.wasFlagged ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                  <Flag className="h-3.5 w-3.5" />
                  Flagged
                </span>
              ) : null}

              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                <Clock3 className="h-3.5 w-3.5" />
                {formatAssessmentDuration(
                  question.timeSpentSeconds
                )}
              </span>
            </div>
          </div>

          {question.imageUrl ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
              <img
                src={question.imageUrl}
                alt=""
                className="mx-auto max-h-[360px] w-full object-contain"
              />
            </div>
          ) : null}

          <div className="mt-5 space-y-2">
            {question.options.map(
              (option) => {
                const selected =
                  option.wasSelected;

                const correct =
                  option.isCorrect;

                return (
                  <div
                    key={option.id}
                    className={`rounded-xl border p-3 ${
                      correct
                        ? "border-emerald-300 bg-emerald-50"
                        : selected
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
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

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-6 text-slate-800">
                          {option.optionText}
                        </p>

                        {option.imageUrl ? (
                          <img
                            src={option.imageUrl}
                            alt=""
                            className="mt-3 max-h-48 rounded-xl object-contain"
                          />
                        ) : null}

                        <div className="mt-2 flex flex-wrap gap-2">
                          {correct ? (
                            <span className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                              Correct Answer
                            </span>
                          ) : null}

                          {selected ? (
                            <span
                              className={`text-[10px] font-black uppercase tracking-wide ${
                                correct
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }`}
                            >
                              Student Selected
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {!question.wasAnswered ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-black text-amber-900">
                No answer was submitted
              </p>
            </div>
          ) : null}

          {question.explanation ? (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-blue-600">
                Teacher Explanation
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-blue-900">
                {question.explanation}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}