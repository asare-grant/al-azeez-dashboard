"use client";

import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  ImagePlus,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  ASSESSMENT_LIMITS,
} from "@/lib/assessments/constants";

import {
  createEmptyAssessmentOption,
} from "@/lib/assessments/factory";

import{ normalizeOptionPositions } from "@/lib/assessments/normalize";

import type {
  AssessmentBuilderQuestion,
} from "@/lib/assessments/types";

import AssessmentOptionEditor from "./AssessmentOptionEditor";
import QuestionCompletionBadge from "./QuestionCompletionBadge";

type AssessmentQuestionCardProps = {
  question: AssessmentBuilderQuestion;
  questionIndex: number;
  totalQuestions: number;

  onChange: (
    question: AssessmentBuilderQuestion
  ) => void;

  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

function isQuestionComplete(
  question: AssessmentBuilderQuestion
) {
  const hasQuestionText =
    question.questionText.trim().length >= 3;

  const hasEnoughOptions =
    question.options.length >= 2;

  const allOptionsComplete =
    question.options.every(
      (option) =>
        option.optionText.trim().length > 0
    );

  const correctOptionCount =
    question.options.filter(
      (option) => option.isCorrect
    ).length;

  return (
    hasQuestionText &&
    hasEnoughOptions &&
    allOptionsComplete &&
    correctOptionCount === 1 &&
    question.marks >= 1
  );
}

export default function AssessmentQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: AssessmentQuestionCardProps) {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const isComplete =
    isQuestionComplete(question);

  function updateOption(
    optionIndex: number,
    updatedOption: typeof question.options[number]
  ) {
    const nextOptions =
      question.options.map(
        (option, index) =>
          index === optionIndex
            ? updatedOption
            : option
      );

    onChange({
      ...question,
      options:
        normalizeOptionPositions(
          nextOptions
        ),
    });
  }

  function selectCorrectOption(
    optionIndex: number
  ) {
    const nextOptions =
      question.options.map(
        (option, index) => ({
          ...option,
          isCorrect:
            index === optionIndex,
        })
      );

    onChange({
      ...question,
      options: nextOptions,
    });
  }

  function addOption() {
    if (
      question.options.length >=
      ASSESSMENT_LIMITS.MAX_OPTIONS
    ) {
      return;
    }

    onChange({
      ...question,
      options: [
        ...question.options,
        createEmptyAssessmentOption(
          question.options.length
        ),
      ],
    });
  }

  function deleteOption(
    optionIndex: number
  ) {
    if (
      question.options.length <=
      ASSESSMENT_LIMITS.MIN_OPTIONS
    ) {
      return;
    }

    const nextOptions =
      question.options.filter(
        (_, index) =>
          index !== optionIndex
      );

    onChange({
      ...question,
      options:
        normalizeOptionPositions(
          nextOptions
        ),
    });
  }

  function handleQuestionImage() {
    const imageUrl =
      window.prompt(
        "Enter the image URL for this question:"
      );

    if (!imageUrl) return;

    onChange({
      ...question,
      imageUrl,
    });
  }

  return (
    <article 
      id={`assessment-question-${questionIndex}`}
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden text-slate-300 sm:block">
            <GripVertical className="h-5 w-5" />
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-600/20">
            {questionIndex + 1}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black text-slate-950 sm:text-base">
                Question{" "}
                {questionIndex + 1}
              </h3>

              <QuestionCompletionBadge
                isComplete={isComplete}
              />
            </div>

            <p className="mt-0.5 truncate text-xs font-medium text-slate-400">
              {question.questionText.trim() ||
                "Question text not entered"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="mr-1 flex items-center rounded-xl border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={questionIndex === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Move question up"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onMoveDown}
              disabled={
                questionIndex ===
                totalQuestions - 1
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Move question down"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onDuplicate}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
            aria-label="Duplicate question"
            title="Duplicate question"
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={totalQuestions <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Delete question"
            title={
              totalQuestions <= 1
                ? "An assessment must contain at least one question"
                : "Delete question"
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              setIsCollapsed(
                (current) => !current
              )
            }
            className="flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            {isCollapsed ? (
              <>
                Expand
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                Collapse
                <ChevronUp className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed ? (
        <div className="space-y-6 p-4 sm:p-6">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-slate-700">
                Question text
              </label>

              <span className="text-xs font-semibold text-slate-400">
                {
                  question.questionText
                    .length
                }
                /5000
              </span>
            </div>

            <textarea
              value={question.questionText}
              onChange={(event) =>
                onChange({
                  ...question,
                  questionText:
                    event.target.value,
                })
              }
              rows={4}
              placeholder="Enter the assessment question..."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={
                  handleQuestionImage
                }
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                <ImagePlus className="h-4 w-4" />
                Add question image
              </button>

              {question.imageUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...question,
                      imageUrl: "",
                    })
                  }
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-red-50 px-3 text-xs font-bold text-red-600 transition hover:bg-red-100"
                >
                  Remove image
                </button>
              ) : null}
            </div>

            {question.imageUrl ? (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="break-all text-xs font-semibold leading-5 text-slate-500">
                  {question.imageUrl}
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Answer options
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Select the correct answer by
                  clicking its letter button.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
                {question.options.length}/
                {
                  ASSESSMENT_LIMITS.MAX_OPTIONS
                }{" "}
                options
              </span>
            </div>

            <div className="space-y-3">
              {question.options.map(
                (option, optionIndex) => (
                  <AssessmentOptionEditor
                    key={option.clientId}
                    option={option}
                    optionIndex={
                      optionIndex
                    }
                    totalOptions={
                      question.options
                        .length
                    }
                    onChange={(
                      updatedOption
                    ) =>
                      updateOption(
                        optionIndex,
                        updatedOption
                      )
                    }
                    onDelete={() =>
                      deleteOption(
                        optionIndex
                      )
                    }
                    onSelectCorrect={() =>
                      selectCorrectOption(
                        optionIndex
                      )
                    }
                  />
                )
              )}
            </div>

            {question.options.length <
            ASSESSMENT_LIMITS.MAX_OPTIONS ? (
              <button
                type="button"
                onClick={addOption}
                className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-4 text-sm font-black text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
                Add answer option
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 border-t border-slate-100 pt-5 lg:grid-cols-[180px_minmax(0,1fr)]">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Marks
              </label>

              <input
                type="number"
                min={
                  ASSESSMENT_LIMITS.MIN_MARKS_PER_QUESTION
                }
                max={
                  ASSESSMENT_LIMITS.MAX_MARKS_PER_QUESTION
                }
                value={question.marks}
                onChange={(event) =>
                  onChange({
                    ...question,
                    marks: Math.max(
                      1,
                      Number(
                        event.target.value
                      )
                    ),
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Answer explanation
              </label>

              <textarea
                value={
                  question.explanation ??
                  ""
                }
                onChange={(event) =>
                  onChange({
                    ...question,
                    explanation:
                      event.target.value,
                  })
                }
                rows={3}
                placeholder="Explain why the selected answer is correct..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}