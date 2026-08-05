import Image from "next/image";
import Link from "next/link";

import {
  Eye,
  FileText,
  UserRound,
} from "lucide-react";

import type {
  ResultsCommandCentreRow,
} from "@/lib/results";

import ResultsCommandCentreTypeBadge from "./ResultsCommandCentreTypeBadge";

function formatDate(
  value: Date | string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatPercentage(
  value: number | null,
) {
  return value === null
    ? "—"
    : `${Number(
        value.toFixed(1),
      )}%`;
}

export default function ResultsCommandCentreMobileCard({
  result,
}: {
  result: ResultsCommandCentreRow;
}) {
  const reviewHref =
    result.type ===
      "ASSESSMENT" &&
    result.assessment?.attemptId
      ? `/list/assessments/${result.assessment.id}/submissions/${result.student.id}?attemptId=${result.assessment.attemptId}`
      : null;

  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start gap-3">
          {result.student.img ? (
            <Image
              src={
                result.student.img
              }
              alt={`${result.student.name} ${result.student.surname}`}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
              {result.student.name.charAt(
                0,
              )}
              {result.student.surname.charAt(
                0,
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-black text-slate-950">
              {result.student.name}{" "}
              {
                result.student
                  .surname
              }
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              {
                result.student
                  .studentID
              }{" "}
              • {result.className}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-2xl font-black text-blue-700">
              {formatPercentage(
                result.percentage,
              )}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              {result.score}
              {result.totalMarks !==
              null
                ? `/${result.totalMarks}`
                : ""}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ResultsCommandCentreTypeBadge
            type={result.type}
          />

          <h3 className="mt-3 text-lg font-black text-slate-950">
            {result.title}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {result.subject}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <Detail
          label="Grade"
          value={
            result.grade ?? "—"
          }
        />

        <Detail
          label="Teacher"
          value={`${result.teacher.name} ${result.teacher.surname}`}
        />

        <Detail
          label="Academic Year"
          value={
            result.academicYear ??
            "Not assigned"
          }
        />

        <Detail
          label="Date"
          value={formatDate(
            result.date,
          )}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4">
        <Link
          href={`/list/results/students/${result.student.id}`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-black text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <UserRound className="h-4 w-4" />

          Student
        </Link>

        {reviewHref ? (
          <Link
            href={reviewHref}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 text-xs font-black text-blue-700 transition hover:bg-blue-100"
          >
            <Eye className="h-4 w-4" />

            Review
          </Link>
        ) : null}

        <Link
          href={`/list/report-cards/create?studentId=${result.student.id}`}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 text-xs font-black text-white transition hover:bg-slate-800"
        >
          <FileText className="h-4 w-4" />

          Report
        </Link>
      </div>
    </article>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}