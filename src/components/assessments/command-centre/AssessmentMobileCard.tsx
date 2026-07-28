import Link from "next/link";

import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Edit3,
  FileQuestion,
  GraduationCap,
} from "lucide-react";

import type {
  AssessmentCommandItem,
} from "./types";

import AssessmentActionsMenu from "./AssessmentActionsMenu";
import AssessmentProgress from "./AssessmentProgress";
import AssessmentStatusBadge from "./AssessmentStatusBadge";

type AssessmentMobileCardProps = {
  assessment: AssessmentCommandItem;
};

function formatDate(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

export default function AssessmentMobileCard({
  assessment,
}: AssessmentMobileCardProps) {
  const primaryHref =
    assessment.status === "DRAFT"
      ? `/list/assessments/${assessment.id}/edit`
      : `/list/assessments/${assessment.id}/analytics`;

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <AssessmentStatusBadge
            status={assessment.status}
          />

          <Link
            href={primaryHref}
            className="mt-3 block text-lg font-black leading-6 text-slate-950"
          >
            {assessment.title}
          </Link>
        </div>

        <AssessmentActionsMenu
          assessment={assessment}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <CardDetail
          icon={BookOpen}
          label="Subject"
          value={
            assessment.lesson.subject.name
          }
        />

        <CardDetail
          icon={GraduationCap}
          label="Class"
          value={
            assessment.lesson.class.name
          }
        />

        <CardDetail
          icon={FileQuestion}
          label="Questions"
          value={`${assessment.questionCount} questions`}
        />

        <CardDetail
          icon={CheckCircle2}
          label="Marks"
          value={`${assessment.totalMarks} marks`}
        />

        <CardDetail
          icon={Clock3}
          label="Duration"
          value={
            assessment.durationMinutes
              ? `${assessment.durationMinutes} minutes`
              : "Untimed"
          }
        />

        <CardDetail
          icon={CalendarClock}
          label="Due"
          value={formatDate(
            assessment.dueDate
          )}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <AssessmentProgress
          submitted={
            assessment.submittedStudents
          }
          total={
            assessment.classStudentCount
          }
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            Class Average
          </p>

          <p className="mt-1 text-xl font-black text-slate-950">
            {assessment.averagePercentage !==
            null
              ? `${assessment.averagePercentage}%`
              : "—"}
          </p>
        </div>

        <Link
          href={primaryHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-md shadow-blue-600/20"
        >
          {assessment.status ===
          "DRAFT" ? (
            <>
              <Edit3 className="h-4 w-4" />
              Continue Editing
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </>
          )}
        </Link>
      </div>
    </article>
  );
}

function CardDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-xs font-black text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}