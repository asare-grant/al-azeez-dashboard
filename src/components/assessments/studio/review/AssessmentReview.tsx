"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileQuestion,
  Send,
  ShieldCheck,
} from "lucide-react";

import type {
  AssessmentBuilderData,
  AssessmentLessonOption,
} from "@/lib/assessments/types";

import type { AssessmentStudioSectionId } from "../types";

import AssessmentStudioSection from "../AssessmentStudioSection";
import AssessmentReadinessCard from "./AssessmentReadinessCard";
import AssessmentValidationItem from "./AssessmentValidationItem";

import { reviewAssessment } from "./assessment-review";

type AssessmentReviewProps = {
  assessment: AssessmentBuilderData;
  lessons: AssessmentLessonOption[];

  onNavigate: (section: AssessmentStudioSectionId) => void;

  onNavigateToQuestion: (questionIndex: number) => void;

  onRequestPublish: () => void;

  disabled?: boolean;
};

export default function AssessmentReview({
  assessment,
  lessons,
  onNavigate,
  onNavigateToQuestion,
  onRequestPublish,
  disabled = false,
}: AssessmentReviewProps) {
  const review = reviewAssessment(assessment);

  const selectedLesson = lessons.find(
    (lesson) => lesson.id === assessment.lessonId,
  );

  const totalMarks = assessment.questions.reduce(
    (total, question) => total + question.marks,
    0,
  );

  const startDate = assessment.startDate
    ? new Date(assessment.startDate)
    : null;

  const publishingMode =
    startDate &&
    !Number.isNaN(startDate.getTime()) &&
    startDate.getTime() > Date.now()
      ? "Scheduled"
      : "Immediate";

  return (
    <AssessmentStudioSection
      eyebrow="Step 5"
      title="Review and publish"
      description="Complete the final quality checks and confirm how this assessment will appear to students."
      action={
        <button
          type="button"
          onClick={onRequestPublish}
          disabled={disabled || !review.isReady}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          Publish Assessment
        </button>
      }
    >
      <AssessmentReadinessCard
        percentage={review.readinessPercentage}
        errorCount={review.errors.length}
        warningCount={review.warnings.length}
        isReady={review.isReady}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <ReviewMetric
          label="Questions"
          value={String(assessment.questions.length)}
        />

        <ReviewMetric label="Total Marks" value={String(totalMarks)} />

        <ReviewMetric
          label="Class"
          value={selectedLesson?.class.name ?? "Not selected"}
        />

        <ReviewMetric
          label="Subject"
          value={selectedLesson?.subject.name ?? "Not selected"}
        />

        <ReviewMetric 
            label="Publishing" 
            value={publishingMode} 
        />
      </div>

      {review.errors.length > 0 ? (
        <div className="mt-7">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-950">
                Required corrections
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Resolve these items before publishing the assessment.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {review.errors.map((item) => (
              <AssessmentValidationItem
                key={item.id}
                item={item}
                onFix={() => onNavigate(item.section)}
              />
            ))}
          </div>
        </div>
      ) : null}

      {review.warnings.length > 0 ? (
        <div className="mt-7">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-950">
                Recommended improvements
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                These items do not prevent publication but may improve the
                student experience.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {review.warnings.map((item) => (
              <AssessmentValidationItem
                key={item.id}
                item={item}
                onFix={() => onNavigate(item.section)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-7">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Question Readiness
            </p>

            <h3 className="mt-2 text-lg font-black text-slate-950">
              Question-by-question review
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Confirm that each question has complete options, marks and one
              correct answer.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
            {review.questions.filter((question) => question.isComplete).length}/
            {review.questions.length} complete
          </span>
        </div>

        <div className="space-y-3">
          {review.questions.map((question) => (
            <div
              key={question.questionIndex}
              className={`rounded-2xl border p-4 ${
                question.isComplete
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-red-200 bg-red-50/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                    question.isComplete
                      ? "bg-emerald-500 text-white"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {question.questionNumber}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900">
                    {question.title}
                  </p>

                  {question.isComplete ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready for publication
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {question.issues.map((issue) => (
                        <li
                          key={issue}
                          className="text-xs leading-5 text-red-700"
                        >
                          • {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {!question.isComplete ? (
                  <button
                    type="button"
                    onClick={() => onNavigateToQuestion(question.questionIndex)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm"
                  >
                    Fix
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <FileQuestion className="h-5 w-5 shrink-0 text-emerald-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {review.isReady ? (
        <div className="mt-7 rounded-[26px] border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <div className="flex flex-col md:flex-row lg:flex-row xl:flex-col gap-5  sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-emerald-500 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-emerald-950">
                  Assessment is ready
                </h3>

                <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-700">
                  Every required field and question has passed validation. You
                  may now publish or schedule the assessment.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRequestPublish}
              disabled={disabled}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Publish Assessment
            </button>
          </div>
        </div>
      ) : null}
    </AssessmentStudioSection>
  );
}

function ReviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <p className="truncate text-lg font-black text-slate-950">{value}</p>

      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
