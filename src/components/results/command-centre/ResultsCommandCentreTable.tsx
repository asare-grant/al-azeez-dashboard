import Image from "next/image";
import Link from "next/link";

import {
  Eye,
  FileText,
  GraduationCap,
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

function formatTerm(
  value?: string | null,
) {
  if (!value) {
    return "Not assigned";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function ResultsCommandCentreTable({
  rows,
}: {
  rows: ResultsCommandCentreRow[];
}) {
  return (
    <div className="hidden overflow-hidden rounded-[26px] border border-slate-200 xl:block">
      <div className="hide-scrollbar overflow-x-auto">
        <table className="w-full min-w-[1320px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              <Heading>
                Student
              </Heading>

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
                Academic Period
              </Heading>

              <Heading>
                Teacher
              </Heading>

              <Heading>
                Date
              </Heading>

              <Heading align="right">
                Actions
              </Heading>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const assessmentReviewHref =
                row.type ===
                  "ASSESSMENT" &&
                row.assessment
                  ?.attemptId
                  ? `/list/assessments/${row.assessment.id}/submissions/${row.student.id}?attemptId=${row.assessment.attemptId}`
                  : null;

              return (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50/80"
                >
                  <Cell>
                    <div className="flex items-center gap-3">
                      {row.student.img ? (
                        <Image
                          src={
                            row.student.img
                          }
                          alt={`${row.student.name} ${row.student.surname}`}
                          width={42}
                          height={42}
                          className="h-11 w-11 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xs font-black text-blue-700">
                          {row.student.name
                            .charAt(0)}
                          {row.student.surname
                            .charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="max-w-[180px] truncate font-black text-slate-950">
                          {
                            row.student
                              .name
                          }{" "}
                          {
                            row.student
                              .surname
                          }
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {
                            row.student
                              .studentID
                          }{" "}
                          •{" "}
                          {row.className}
                        </p>
                      </div>
                    </div>
                  </Cell>

                  <Cell>
                    <div className="max-w-[230px]">
                      <ResultsCommandCentreTypeBadge
                        type={
                          row.type
                        }
                      />

                      <p className="mt-2 truncate text-sm font-black text-slate-900">
                        {row.title}
                      </p>

                      {row.assessment
                        ?.attemptNumber ? (
                        <p className="mt-1 text-xs text-slate-400">
                          Attempt{" "}
                          {
                            row.assessment
                              .attemptNumber
                          }
                        </p>
                      ) : null}
                    </div>
                  </Cell>

                  <Cell>
                    <p className="font-bold text-slate-700">
                      {row.subject}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="font-black text-slate-950">
                      {row.score}
                      {row.totalMarks !==
                      null
                        ? `/${row.totalMarks}`
                        : ""}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="text-lg font-black text-blue-700">
                      {formatPercentage(
                        row.percentage,
                      )}
                    </p>
                  </Cell>

                  <Cell>
                    <span className="inline-flex min-w-11 items-center justify-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-800">
                      {row.grade ??
                        "—"}
                    </span>
                  </Cell>

                  <Cell>
                    <p className="text-sm font-bold text-slate-700">
                      {formatTerm(
                        row.term?.name,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {row.academicYear ??
                        "No academic year"}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="text-sm font-bold text-slate-700">
                      {
                        row.teacher
                          .name
                      }{" "}
                      {
                        row.teacher
                          .surname
                      }
                    </p>
                  </Cell>

                  <Cell>
                    <p className="whitespace-nowrap text-sm font-semibold text-slate-600">
                      {formatDate(
                        row.date,
                      )}
                    </p>
                  </Cell>

                  <Cell align="right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/list/results/students/${row.student.id}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <UserRound className="h-3.5 w-3.5" />

                        Student
                      </Link>

                      {assessmentReviewHref ? (
                        <Link
                          href={
                            assessmentReviewHref
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                        >
                          <Eye className="h-3.5 w-3.5" />

                          Review
                        </Link>
                      ) : null}

                      <Link
                        href={`/list/report-cards/create?studentId=${row.student.id}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-slate-800"
                      >
                        <FileText className="h-3.5 w-3.5" />

                        Report
                      </Link>
                    </div>
                  </Cell>
                </tr>
              );
            })}
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