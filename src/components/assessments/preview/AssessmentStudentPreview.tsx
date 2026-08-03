"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Flag,
  Info,
  RotateCcw,
} from "lucide-react";

import {
  toast,
} from "react-toastify";

import type {
  AssessmentBuilderData,
} from "@/lib/assessments/types";

import AssessmentPreviewQuestion from "./AssessmentPreviewQuestion";

type PreviewAnswer = {
  questionClientId: string;

  selectedOptionId:
    | number
    | null;

  flagged: boolean;
};

type AssessmentStudentPreviewProps = {
  assessment: AssessmentBuilderData;
};

export default function AssessmentStudentPreview({
  assessment,
}: AssessmentStudentPreviewProps) {
  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<PreviewAnswer[]>(() =>
      assessment.questions.map(
        (question) => ({
          questionClientId:
            question.clientId,

          selectedOptionId:
            null,

          flagged:
            false,
        }),
      ),
    );

  const currentQuestion =
    assessment.questions[
      currentIndex
    ];

  const currentAnswer =
    answers[currentIndex];

  const answeredCount =
    answers.filter(
      (answer) =>
        answer.selectedOptionId !==
        null,
    ).length;

  const flaggedCount =
    answers.filter(
      (answer) =>
        answer.flagged,
    ).length;

  const totalMarks =
    useMemo(
      () =>
        assessment.questions.reduce(
          (total, question) =>
            total +
            question.marks,
          0,
        ),
      [assessment.questions],
    );

  function updateCurrentAnswer(
    changes: Partial<PreviewAnswer>,
  ) {
    setAnswers((current) =>
      current.map(
        (answer, index) =>
          index === currentIndex
            ? {
                ...answer,
                ...changes,
              }
            : answer,
      ),
    );
  }

  function navigate(
    nextIndex: number,
  ) {
    if (
      nextIndex < 0 ||
      nextIndex >=
        assessment.questions.length
    ) {
      return;
    }

    if (
      !assessment.allowBacktrack &&
      nextIndex < currentIndex
    ) {
      toast.info(
        "Backtracking is disabled for this assessment.",
      );

      return;
    }

    setCurrentIndex(
      nextIndex,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetPreview() {
    setAnswers(
      assessment.questions.map(
        (question) => ({
          questionClientId:
            question.clientId,

          selectedOptionId:
            null,

          flagged:
            false,
        }),
      ),
    );

    setCurrentIndex(0);

    toast.info(
      "Preview answers reset.",
    );
  }

  function simulateSubmission() {
    const unanswered =
      assessment.questions.length -
      answeredCount;

    if (
      !assessment.allowUnanswered &&
      unanswered > 0
    ) {
      toast.error(
        `Answer all ${unanswered} remaining questions before submitting.`,
      );

      return;
    }

    toast.success(
      "Preview submission completed. No result or attempt was saved.",
    );
  }

  if (
    assessment.questions.length ===
    0
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <Info className="mx-auto h-10 w-10 text-amber-500" />

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Nothing to preview
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add at least one assessment
            question before opening student
            preview.
          </p>

          <Link
            href={`/list/assessments/${assessment.id}/edit`}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
          >
            Return to Studio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/list/assessments/${assessment.id}/edit`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 shrink-0 text-blue-600" />

                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Student Preview
                </p>
              </div>

              <h1 className="mt-1 truncate text-lg font-black text-slate-950">
                {assessment.title}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">
              Preview only — no data saved
            </span>

            <button
              type="button"
              onClick={resetPreview}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-5 rounded-[24px] border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <p className="text-sm font-black text-blue-900">
                Teacher simulation mode
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                This preview mirrors the student
                experience but does not create an
                attempt, save answers or generate a
                result.
              </p>
            </div>
          </div>
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <AssessmentPreviewQuestion
              question={
                currentQuestion
              }
              questionNumber={
                currentIndex + 1
              }
              selectedOptionId={
                currentAnswer
                  .selectedOptionId
              }
              flagged={
                currentAnswer.flagged
              }
              onSelectOption={(
                optionId,
              ) =>
                updateCurrentAnswer({
                  selectedOptionId:
                    optionId,
                })
              }
              onClearAnswer={() =>
                updateCurrentAnswer({
                  selectedOptionId:
                    null,
                })
              }
              onToggleFlag={() =>
                updateCurrentAnswer({
                  flagged:
                    !currentAnswer.flagged,
                })
              }
            />

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    currentIndex - 1,
                  )
                }
                disabled={
                  currentIndex === 0 ||
                  !assessment.allowBacktrack
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {currentIndex ===
              assessment.questions.length -
                1 ? (
                <button
                  type="button"
                  onClick={
                    simulateSubmission
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <ClipboardCheck className="h-4 w-4" />
                  Simulate Submit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      currentIndex + 1,
                    )
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Next Question
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[120px] space-y-4">
              <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Assessment Summary
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <PreviewMetric
                    label="Questions"
                    value={String(
                      assessment.questions
                        .length,
                    )}
                  />

                  <PreviewMetric
                    label="Marks"
                    value={String(
                      totalMarks,
                    )}
                  />

                  <PreviewMetric
                    label="Answered"
                    value={String(
                      answeredCount,
                    )}
                  />

                  <PreviewMetric
                    label="Flagged"
                    value={String(
                      flaggedCount,
                    )}
                  />
                </div>
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-white p-5">
                <p className="text-sm font-black text-slate-900">
                  Question Navigator
                </p>

                <div className="mt-4 grid grid-cols-5 gap-2">
                  {assessment.questions.map(
                    (
                      question,
                      index,
                    ) => {
                      const answer =
                        answers[index];

                      const active =
                        index ===
                        currentIndex;

                      const answered =
                        answer
                          .selectedOptionId !==
                        null;

                      return (
                        <button
                          key={
                            question.clientId
                          }
                          type="button"
                          onClick={() =>
                            navigate(index)
                          }
                          disabled={
                            !assessment.allowBacktrack &&
                            index <
                              currentIndex
                          }
                          className={`relative flex h-10 items-center justify-center rounded-xl text-xs font-black transition ${
                            active
                              ? "bg-blue-600 text-white"
                              : answered
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          {index + 1}

                          {answer.flagged ? (
                            <Flag className="absolute -right-1 -top-1 h-3 w-3 fill-amber-500 text-amber-500" />
                          ) : null}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

                  <p className="text-xs font-semibold leading-5 text-emerald-700">
                    Correct answers remain hidden
                    during preview, matching the
                    actual student experience.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function PreviewMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}