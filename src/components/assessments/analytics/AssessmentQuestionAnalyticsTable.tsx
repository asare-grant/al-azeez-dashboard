"use client";

import {
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import type {
  AssessmentQuestionAnalytics,
} from "@/lib/assessments/types";

import AssessmentDifficultyBadge from "./AssessmentDifficultyBadge";

type AssessmentQuestionAnalyticsTableProps = {
  questions:
    AssessmentQuestionAnalytics[];
};

export default function AssessmentQuestionAnalyticsTable({
  questions,
}: AssessmentQuestionAnalyticsTableProps) {
  const [expandedQuestionId, setExpandedQuestionId] =
    useState<number | null>(
      null
    );

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
        Question Intelligence
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Question-by-question analysis
      </h2>

      <div className="mt-6 space-y-3">
        {questions.map(
          (question) => {
            const expanded =
              expandedQuestionId ===
              question.questionId;

            return (
              <article
                key={question.questionId}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedQuestionId(
                      expanded
                        ? null
                        : question.questionId
                    )
                  }
                  className="flex w-full items-start gap-4 bg-white p-4 text-left transition hover:bg-slate-50 sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                    {
                      question.questionNumber
                    }
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-black leading-6 text-slate-950">
                      {
                        question.questionText
                      }
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <AssessmentDifficultyBadge
                        difficulty={
                          question.difficulty
                        }
                      />

                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                        {
                          question.correctPercentage
                        }
                        % correct
                      </span>

                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black text-red-700">
                        {
                          question.incorrectPercentage
                        }
                        % incorrect
                      </span>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                        {
                          question.unansweredPercentage
                        }
                        % unanswered
                      </span>
                    </div>
                  </div>

                  {expanded ? (
                    <ChevronUp className="h-5 w-5 shrink-0 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
                  )}
                </button>

                {expanded ? (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                    <div className="grid gap-3 sm:grid-cols-4">
                      <Statistic
                        label="Correct"
                        value={
                          question.correctResponses
                        }
                      />

                      <Statistic
                        label="Incorrect"
                        value={
                          question.incorrectResponses
                        }
                      />

                      <Statistic
                        label="Unanswered"
                        value={
                          question.unansweredResponses
                        }
                      />

                      <Statistic
                        label="Avg Marks"
                        value={
                          question.averageMarksAwarded
                        }
                      />
                    </div>

                    <div className="mt-5 space-y-3">
                      {question.options.map(
                        (option) => (
                          <div
                            key={
                              option.optionId
                            }
                            className={`rounded-xl border p-4 ${
                              option.isCorrect
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-bold text-slate-800">
                                {
                                  option.optionText
                                }
                              </p>

                              <div className="shrink-0 text-right">
                                <p className="text-sm font-black text-slate-950">
                                  {
                                    option.selectionCount
                                  }
                                </p>

                                <p className="text-[10px] text-slate-400">
                                  {
                                    option.selectionPercentage
                                  }
                                  %
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  option.isCorrect
                                    ? "bg-emerald-500"
                                    : "bg-blue-600"
                                }`}
                                style={{
                                  width: `${option.selectionPercentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}

function Statistic({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-white p-4">
      <p className="text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}