import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
  Layers3,
} from "lucide-react";

import type {
  UnifiedStudentResult,
} from "@/lib/results";

import StudentResultTypeBadge from "./StudentResultTypeBadge";

type StudentResultMobileCardProps = {
  result: UnifiedStudentResult;
};

function formatDate(
  value: Date | string
) {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function formatTerm(
  value?: string | null
) {
  if (!value) {
    return "No term";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatPercentage(
  value: number | null
) {
  return value === null
    ? "—"
    : `${value.toFixed(1)}%`;
}

export default function StudentResultMobileCard({
  result,
}: StudentResultMobileCardProps) {
  const resultLink =
    result.type === "ASSESSMENT" &&
    result.assessment?.attemptId
      ? `/student/assessments/${result.assessment.id}/result?attemptId=${result.assessment.attemptId}`
      : null;

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <StudentResultTypeBadge
            type={result.type}
          />

          <h3 className="mt-3 truncate text-lg font-black text-slate-950">
            {result.title}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {result.subject}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-black text-blue-600">
            {formatPercentage(
              result.percentage
            )}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-400">
            {result.score}/
            {result.totalMarks ??
              "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ResultDetail
          icon={GraduationCap}
          label="Class"
          value={result.className}
        />

        <ResultDetail
          icon={Layers3}
          label="Term"
          value={formatTerm(
            result.term?.name
          )}
        />

        <ResultDetail
          icon={CalendarDays}
          label="Academic Year"
          value={
            result.academicYear ||
            "Not assigned"
          }
        />

        <ResultDetail
          icon={CalendarDays}
          label="Date"
          value={formatDate(
            result.date
          )}
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
            Grade
          </p>

          <p className="mt-1 text-sm font-black text-slate-800">
            {result.grade || "—"}
          </p>
        </div>

        {resultLink ? (
          <Link
            href={resultLink}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white transition hover:bg-blue-700"
          >
            Review
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function ResultDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-3.5 w-3.5" />

        <span className="text-[10px] font-black uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}