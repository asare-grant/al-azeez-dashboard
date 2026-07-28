import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  Play,
  RotateCcw,
  Trophy,
  UserRound,
} from "lucide-react";

import type {
  StudentAssessmentDashboardItem,
} from "@/lib/assessments/types";

import StudentAssessmentProgress from "./StudentAssessmentProgress";
import StudentAssessmentStatusBadge from "./StudentAssessmentStatusBadge";

type StudentAssessmentCardProps = {
  assessment: StudentAssessmentDashboardItem;
};

function formatDateTime(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

export default function StudentAssessmentCard({
  assessment,
}: StudentAssessmentCardProps) {
  const action =
    getAssessmentAction(assessment);

  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_24px_65px_rgba(15,23,42,0.08)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <StudentAssessmentStatusBadge
              status={assessment.status}
            />

            <h2 className="mt-3 text-xl font-black leading-7 text-slate-950">
              {assessment.title}
            </h2>

            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-blue-700">
              <BookOpen className="h-4 w-4" />

              {
                assessment.lesson.subject
                  .name
              }
            </p>
          </div>

          {assessment.latestResult ? (
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[20px] bg-emerald-50 text-emerald-700">
              <span className="text-lg font-black">
                {Math.round(
                  assessment.latestResult
                    .percentage
                )}
                %
              </span>

              <span className="text-[9px] font-black uppercase tracking-wide">
                Score
              </span>
            </div>
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-blue-50 text-blue-600">
              <FileQuestion className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Detail
            icon={GraduationCap}
            label="Class"
            value={
              assessment.lesson.class.name
            }
          />

          <Detail
            icon={UserRound}
            label="Teacher"
            value={`${assessment.lesson.teacher.name} ${assessment.lesson.teacher.surname}`}
          />

          <Detail
            icon={FileQuestion}
            label="Questions"
            value={`${assessment.questionCount} questions`}
          />

          <Detail
            icon={CheckCircle2}
            label="Marks"
            value={`${assessment.totalMarks} marks`}
          />

          <Detail
            icon={Clock3}
            label="Duration"
            value={
              assessment.durationMinutes
                ? `${assessment.durationMinutes} minutes`
                : "Untimed"
            }
          />

          <Detail
            icon={CalendarClock}
            label="Due Date"
            value={formatDateTime(
              assessment.dueDate
            )}
          />
        </div>

        {assessment.activeAttempt ? (
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
            <StudentAssessmentProgress
              answered={
                assessment.activeAttempt
                  .answeredCount
              }
              total={
                assessment.questionCount
              }
            />

            <p className="mt-3 text-xs leading-5 text-blue-700">
              Your answers have been saved.
              Continue before the attempt expires.
            </p>
          </div>
        ) : null}

        {assessment.latestResult ? (
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                  Latest Result
                </p>

                <p className="mt-2 text-2xl font-black text-emerald-950">
                  {
                    assessment.latestResult
                      .score
                  }
                  /
                  {
                    assessment.latestResult
                      .totalMarks
                  }
                </p>

                <p className="mt-1 text-sm font-bold text-emerald-700">
                  {assessment.latestResult
                    .remarks ??
                    "Assessment completed"}
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-white text-emerald-600 shadow-sm">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              Attempts
            </p>

            <p className="mt-1 text-sm font-black text-slate-800">
              {assessment.attemptsUsed}/
              {assessment.maxAttempts} used
            </p>
          </div>

          {action ? (
            <Link
              href={action.href}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black shadow-md transition hover:-translate-y-0.5 ${action.className}`}
            >
              <action.icon className="h-4 w-4" />

              {action.label}

              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 px-5 text-sm font-black text-slate-500">
              Not available
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function getAssessmentAction(
  assessment: StudentAssessmentDashboardItem
) {
  if (
    assessment.status ===
      "IN_PROGRESS" &&
    assessment.activeAttempt
  ) {
    return {
      label: "Continue Assessment",
      href: `/student/assessments/${assessment.id}/take?attemptId=${assessment.activeAttempt.id}`,
      icon: RotateCcw,
      className:
        "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700",
    };
  }

  if (
    assessment.status ===
    "AVAILABLE"
  ) {
    return {
      label: "Start Assessment",
      href: `/student/assessments/${assessment.id}`,
      icon: Play,
      className:
        "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700",
    };
  }

  if (
    assessment.status ===
      "COMPLETED" &&
    assessment.latestResult
  ) {
    return {
      label: "View Result",
      href: `/student/assessments/${assessment.id}/result?attemptId=${assessment.latestResult.attemptId}`,
      icon: Trophy,
      className:
        "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700",
    };
  }

  return null;
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-xs font-black leading-5 text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}