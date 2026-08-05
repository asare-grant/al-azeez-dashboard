import Link from "next/link";

import {
  Eye,
} from "lucide-react";

import type {
  StudentResultProfileRecord,
} from "@/lib/results";

import ResultsCommandCentreTypeBadge from "../command-centre/ResultsCommandCentreTypeBadge";

export default function StudentProfileResultCard({
  studentId,
  result,
}: {
  studentId: string;

  result:
    StudentResultProfileRecord;
}) {
  const reviewHref =
    result.type ===
      "ASSESSMENT" &&
    result.assessment?.attemptId
      ? `/list/assessments/${result.assessment.id}/submissions/${studentId}?attemptId=${result.assessment.attemptId}`
      : null;

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <ResultsCommandCentreTypeBadge
            type={result.type}
          />

          <h3 className="mt-3 truncate text-lg font-black text-slate-950">
            {result.title}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {result.subject.name}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black text-blue-700">
            {result.percentage ===
            null
              ? "—"
              : `${result.percentage.toFixed(1)}%`}
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

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Detail
          label="Grade"
          value={
            result.grade ?? "—"
          }
        />

        <Detail
          label="Teacher"
          value={
            result.teacherName
          }
        />

        <Detail
          label="Academic Year"
          value={
            result.academicYear ??
            "Not assigned"
          }
        />

        <Detail
          label="Term"
          value={
            result.term?.name.replace(
              /_/g,
              " ",
            ) ?? "—"
          }
        />
      </div>

      {reviewHref ? (
        <Link
          href={reviewHref}
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-50 text-xs font-black text-blue-700 transition hover:bg-blue-100"
        >
          <Eye className="h-4 w-4" />
          Review Assessment
        </Link>
      ) : null}
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
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}