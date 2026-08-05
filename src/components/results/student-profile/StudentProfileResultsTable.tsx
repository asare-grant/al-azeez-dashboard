import Link from "next/link";

import {
  Eye,
} from "lucide-react";

import type {
  StudentResultProfileRecord,
} from "@/lib/results";

import ResultsCommandCentreTypeBadge from "../command-centre/ResultsCommandCentreTypeBadge";

function formatDate(
  value: Date | string,
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function formatPercentage(
  value: number | null,
) {
  return value === null
    ? "—"
    : `${value.toFixed(1)}%`;
}

export default function StudentProfileResultsTable({
  studentId,
  records,
}: {
  studentId: string;

  records:
    StudentResultProfileRecord[];
}) {
  return (
    <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 xl:block">
      <div className="hide-scrollbar overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <Heading>
                Academic Item
              </Heading>

              <Heading>
                Subject
              </Heading>

              <Heading>
                Score
              </Heading>

              <Heading>
                Percentage
              </Heading>

              <Heading>
                Grade
              </Heading>

              <Heading>
                Period
              </Heading>

              <Heading>
                Teacher
              </Heading>

              <Heading>
                Date
              </Heading>

              <Heading align="right">
                Action
              </Heading>
            </tr>
          </thead>

          <tbody>
            {records.map(
              (record) => {
                const reviewHref =
                  record.type ===
                    "ASSESSMENT" &&
                  record.assessment
                    ?.attemptId
                    ? `/list/assessments/${record.assessment.id}/submissions/${studentId}?attemptId=${record.assessment.attemptId}`
                    : null;

                return (
                  <tr
                    key={record.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                  >
                    <Cell>
                      <ResultsCommandCentreTypeBadge
                        type={
                          record.type
                        }
                      />

                      <p className="mt-2 max-w-[240px] truncate font-black text-slate-950">
                        {record.title}
                      </p>
                    </Cell>

                    <Cell>
                      <p className="font-bold text-slate-700">
                        {
                          record.subject
                            .name
                        }
                      </p>
                    </Cell>

                    <Cell>
                      <p className="font-black text-slate-950">
                        {record.score}
                        {record.totalMarks !==
                        null
                          ? `/${record.totalMarks}`
                          : ""}
                      </p>
                    </Cell>

                    <Cell>
                      <p className="text-lg font-black text-blue-700">
                        {formatPercentage(
                          record.percentage,
                        )}
                      </p>
                    </Cell>

                    <Cell>
                      <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-800">
                        {record.grade ??
                          "—"}
                      </span>
                    </Cell>

                    <Cell>
                      <p className="text-sm font-bold text-slate-700">
                        {record.term
                          ?.name.replace(
                            /_/g,
                            " ",
                          ) ?? "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {record.academicYear ??
                          "Not assigned"}
                      </p>
                    </Cell>

                    <Cell>
                      <p className="text-sm font-bold text-slate-700">
                        {
                          record.teacherName
                        }
                      </p>
                    </Cell>

                    <Cell>
                      <p className="whitespace-nowrap text-sm font-semibold text-slate-600">
                        {formatDate(
                          record.date,
                        )}
                      </p>
                    </Cell>

                    <Cell align="right">
                      {reviewHref ? (
                        <Link
                          href={
                            reviewHref
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 hover:bg-blue-100"
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
                );
              },
            )}
          </tbody>
        </table>
      </div>
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
      className={`whitespace-nowrap px-4 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 ${
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