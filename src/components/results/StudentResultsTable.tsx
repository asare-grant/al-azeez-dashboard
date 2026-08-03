import Link from "next/link";

import {
  Eye,
} from "lucide-react";

import type {
  UnifiedStudentResult,
} from "@/lib/results";

import StudentResultTypeBadge from "./StudentResultTypeBadge";

function formatDate(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

export default function StudentResultsTable({
  results,
}: {
  results: UnifiedStudentResult[];
}) {
  return (
    <div className="hidden overflow-x-auto xl:block">
      <table className="w-full min-w-[1050px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <Heading>Academic Item</Heading>
            <Heading>Type</Heading>
            <Heading>Subject</Heading>
            <Heading>Score</Heading>
            <Heading>Percentage</Heading>
            <Heading>Grade</Heading>
            <Heading>Term</Heading>
            <Heading>Date</Heading>
            <Heading align="right">
              Action
            </Heading>
          </tr>
        </thead>

        <tbody>
          {results.map((result) => (
            <tr
              key={result.id}
              className="border-b border-slate-100"
            >
              <Cell>
                <div>
                  <p className="font-black text-slate-950">
                    {result.title}
                  </p>

                  {result.attemptNumber ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Attempt{" "}
                      {result.attemptNumber}
                    </p>
                  ) : null}
                </div>
              </Cell>

              <Cell>
                <StudentResultTypeBadge
                  type={result.type}
                />
              </Cell>

              <Cell>
                <p className="font-bold text-slate-700">
                  {result.subject}
                </p>
              </Cell>

              <Cell>
                <p className="font-black text-slate-950">
                  {result.score}
                  {result.totalMarks !==
                  null
                    ? `/${result.totalMarks}`
                    : ""}
                </p>
              </Cell>

              <Cell>
                <p className="text-lg font-black text-blue-700">
                  {result.percentage !==
                  null
                    ? `${result.percentage}%`
                    : "—"}
                </p>
              </Cell>

              <Cell>
                <p className="font-black text-slate-800">
                  {result.grade ?? "—"}
                </p>
              </Cell>

              <Cell>
                <p className="text-sm font-bold text-slate-700">
                  {result.term
                    ? result.term.name.replace(
                        "_",
                        " "
                      )
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {result.academicYear ??
                    ""}
                </p>
              </Cell>

              <Cell>
                <p className="text-sm font-bold text-slate-600">
                  {formatDate(
                    result.date
                  )}
                </p>
              </Cell>

              <Cell align="right">
                {result.type ===
                  "ASSESSMENT" &&
                result.assessment
                  ?.attemptId ? (
                  <Link
                    href={`/student/assessments/${result.assessment.id}/result?attemptId=${result.assessment.attemptId}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4" />
                    Review
                  </Link>
                ) : (
                  <span className="text-xs font-bold text-slate-300">
                    No review
                  </span>
                )}
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Heading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Cell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-5 align-middle ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}