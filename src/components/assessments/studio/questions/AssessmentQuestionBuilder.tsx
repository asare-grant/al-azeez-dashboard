"use client";

import {
  AlertTriangle,
  FileQuestion,
  Plus,
} from "lucide-react";

import {
  ASSESSMENT_LIMITS,
} from "@/lib/assessments/constants";

import {
  createEmptyAssessmentQuestion,
  duplicateAssessmentQuestion,
} from "@/lib/assessments/factory";

import {
  calculateAssessmentTotals,
  normalizeQuestionPositions,
} from "@/lib/assessments/normalize";

import type {
  AssessmentBuilderQuestion,
} from "@/lib/assessments/types";

import AssessmentStudioSection from "../AssessmentStudioSection";
import AddQuestionButton from "./AddQuestionButton";
import AssessmentQuestionCard from "./AssessmentQuestionCard";

type AssessmentQuestionBuilderProps = {
  questions: AssessmentBuilderQuestion[];

  onChange: (
    questions: AssessmentBuilderQuestion[]
  ) => void;
};

export default function AssessmentQuestionBuilder({
  questions,
  onChange,
}: AssessmentQuestionBuilderProps) {
  const totals =
    calculateAssessmentTotals(questions);

  function updateQuestion(
    questionIndex: number,
    updatedQuestion: AssessmentBuilderQuestion
  ) {
    const nextQuestions =
      questions.map(
        (question, index) =>
          index === questionIndex
            ? updatedQuestion
            : question
      );

    onChange(
      normalizeQuestionPositions(
        nextQuestions
      )
    );
  }

  function addQuestion() {
    if (
      questions.length >=
      ASSESSMENT_LIMITS.MAX_QUESTIONS
    ) {
      return;
    }

    const newQuestion =
      createEmptyAssessmentQuestion(
        questions.length
      );

    onChange([
      ...questions,
      newQuestion,
    ]);
  }

  function duplicateQuestion(
    questionIndex: number
  ) {
    if (
      questions.length >=
      ASSESSMENT_LIMITS.MAX_QUESTIONS
    ) {
      return;
    }

    const sourceQuestion =
      questions[questionIndex];

    const duplicate =
      duplicateAssessmentQuestion(
        sourceQuestion,
        questionIndex + 1
      );

    const nextQuestions = [
      ...questions.slice(
        0,
        questionIndex + 1
      ),
      duplicate,
      ...questions.slice(
        questionIndex + 1
      ),
    ];

    onChange(
      normalizeQuestionPositions(
        nextQuestions
      )
    );
  }

  function deleteQuestion(
    questionIndex: number
  ) {
    if (
      questions.length <=
      ASSESSMENT_LIMITS.MIN_QUESTIONS
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete Question ${
          questionIndex + 1
        }?`
      );

    if (!confirmed) {
      return;
    }

    const nextQuestions =
      questions.filter(
        (_, index) =>
          index !== questionIndex
      );

    onChange(
      normalizeQuestionPositions(
        nextQuestions
      )
    );
  }

  function moveQuestion(
    fromIndex: number,
    toIndex: number
  ) {
    if (
      toIndex < 0 ||
      toIndex >= questions.length
    ) {
      return;
    }

    const nextQuestions = [
      ...questions,
    ];

    const [movedQuestion] =
      nextQuestions.splice(
        fromIndex,
        1
      );

    nextQuestions.splice(
      toIndex,
      0,
      movedQuestion
    );

    onChange(
      normalizeQuestionPositions(
        nextQuestions
      )
    );
  }

  return (
    <AssessmentStudioSection
      eyebrow="Step 2"
      title="Build assessment questions"
      description="Create multiple-choice questions, assign marks and select the correct response."
      action={
        <button
          type="button"
          onClick={addQuestion}
          disabled={
            questions.length >=
            ASSESSMENT_LIMITS.MAX_QUESTIONS
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </button>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <BuilderMetric
          label="Questions"
          value={String(
            totals.questionCount
          )}
        />

        <BuilderMetric
          label="Total Marks"
          value={String(
            totals.totalMarks
          )}
        />

        <BuilderMetric
          label="Maximum"
          value={String(
            ASSESSMENT_LIMITS.MAX_QUESTIONS
          )}
        />
      </div>

      {questions.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/70">
            <FileQuestion className="h-7 w-7" />
          </div>

          <h3 className="mt-5 text-xl font-black text-slate-950">
            Start building your assessment
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add the first question and
            provide possible answer options.
          </p>

          <button
            type="button"
            onClick={addQuestion}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
          >
            <Plus className="h-4 w-4" />
            Add First Question
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map(
            (
              question,
              questionIndex
            ) => (
              <AssessmentQuestionCard
                key={question.clientId}
                question={question}
                questionIndex={
                  questionIndex
                }
                totalQuestions={
                  questions.length
                }
                onChange={(
                  updatedQuestion
                ) =>
                  updateQuestion(
                    questionIndex,
                    updatedQuestion
                  )
                }
                onDuplicate={() =>
                  duplicateQuestion(
                    questionIndex
                  )
                }
                onDelete={() =>
                  deleteQuestion(
                    questionIndex
                  )
                }
                onMoveUp={() =>
                  moveQuestion(
                    questionIndex,
                    questionIndex - 1
                  )
                }
                onMoveDown={() =>
                  moveQuestion(
                    questionIndex,
                    questionIndex + 1
                  )
                }
              />
            )
          )}

          <AddQuestionButton
            onClick={addQuestion}
            disabled={
              questions.length >=
              ASSESSMENT_LIMITS.MAX_QUESTIONS
            }
          />
        </div>
      )}

      {questions.length >=
      ASSESSMENT_LIMITS.MAX_QUESTIONS ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <p className="text-sm font-black text-amber-900">
              Question limit reached
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              This assessment has reached
              the maximum of{" "}
              {
                ASSESSMENT_LIMITS.MAX_QUESTIONS
              }{" "}
              questions.
            </p>
          </div>
        </div>
      ) : null}
    </AssessmentStudioSection>
  );
}

function BuilderMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}