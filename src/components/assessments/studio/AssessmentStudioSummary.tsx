"use client";

import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type {
  AssessmentBuilderData,
  AssessmentLessonOption,
} from "@/lib/assessments/types";

import { calculateAssessmentTotals } from "@/lib/assessments/normalize";

type AssessmentStudioSummaryProps = {
  assessment: AssessmentBuilderData;
  lessons: AssessmentLessonOption[];
};

function formatDateTime(value?: string | Date): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function AssessmentStudioSummary({
  assessment,
  lessons,
}: AssessmentStudioSummaryProps) {
  const totals = calculateAssessmentTotals(assessment.questions);

  const selectedLesson = lessons.find(
    (lesson) => lesson.id === assessment.lessonId,
  );

  const completedQuestions = assessment.questions.filter((question) => {
    const hasQuestion = question.questionText.trim().length >= 3;

    const hasCorrectAnswer =
      question.options.filter((option) => option.isCorrect).length === 1;

    const hasCompleteOptions =
      question.options.length >= 2 &&
      question.options.every((option) => option.optionText.trim().length > 0);

    return hasQuestion && hasCorrectAnswer && hasCompleteOptions;
  }).length;

  const completionPercentage =
    totals.questionCount === 0
      ? 0
      : Math.round((completedQuestions / totals.questionCount) * 100);

  return (
    <aside className="space-y-4">
      <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Live Summary
            </p>

            <h3 className="mt-2 text-lg font-black text-slate-950">
              Assessment overview
            </h3>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <SummaryMetric
            icon={FileQuestion}
            label="Questions"
            value={String(totals.questionCount)}
          />

          <SummaryMetric
            icon={CheckCircle2}
            label="Total Marks"
            value={String(totals.totalMarks)}
          />

          <SummaryMetric
            icon={Clock3}
            label="Duration"
            value={
              assessment.durationMinutes
                ? `${assessment.durationMinutes} min`
                : "Untimed"
            }
          />

          <SummaryMetric
            icon={ShieldCheck}
            label="Pass Mark"
            value={`${assessment.passMarkPercent}%`}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">
              Builder completion
            </p>

            <span className="text-sm font-black text-blue-600">
              {completionPercentage}%
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {completedQuestions} of {totals.questionCount} questions are
            complete.
          </p>
        </div>
      </div>

      {/* ASSESSMENT DETAIL CARD */}

      <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Assessment Details
        </p>

        <div className="mt-4 space-y-4">
          <SummaryRow
            icon={BookOpen}
            label="Subject"
            value={selectedLesson?.subject.name ?? "Select a lesson"}
          />

          <SummaryRow
            icon={GraduationCap}
            label="Class"
            value={selectedLesson?.class.name ?? "Not selected"}
          />

          <SummaryRow
            icon={CalendarClock}
            label="Opens"
            value={formatDateTime(assessment.startDate)}
          />

          <SummaryRow
            icon={CalendarClock}
            label="Closes"
            value={formatDateTime(assessment.dueDate)}
          />
        </div>
      </div>

      {/* STUDENT EXPERIENCE CARD */}
      <div className="rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
          Student Experience
        </p>

        <div className="mt-4 space-y-3">
          <ExperienceRow
            label="Attempts"
            value={String(assessment.maxAttempts)}
            enabled
          />

          <ExperienceRow
            label="Question Shuffle"
            value={assessment.shuffleQuestions ? "Enabled" : "Disabled"}
            enabled={assessment.shuffleQuestions}
          />

          <ExperienceRow
            label="Option Shuffle"
            value={assessment.shuffleOptions ? "Enabled" : "Disabled"}
            enabled={assessment.shuffleOptions}
          />

          <ExperienceRow
            label="Instant Result"
            value={assessment.showInstantResult ? "Visible" : "Hidden"}
            enabled={assessment.showInstantResult}
          />
        </div>
      </div>
    </aside>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileQuestion;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-3 text-lg font-black text-slate-950">{value}</p>

      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">{label}</p>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}


function ExperienceRow({
  label,
  value,
  enabled,
}: {
  label: string;
  value: string;
  enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-xs font-bold text-slate-500">
        {label}
      </p>

      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
          enabled
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {value}
      </span>
    </div>
  );
}