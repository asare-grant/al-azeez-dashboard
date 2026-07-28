import Link from "next/link";

import type {
  ReactNode,
} from "react";

import {
  BarChart3,
  Clock3,
  Edit3,
} from "lucide-react";

import type {
  AssessmentCommandItem,
} from "./types";

import AssessmentActionsMenu from "./AssessmentActionsMenu";
import AssessmentProgress from "./AssessmentProgress";
import AssessmentStatusBadge from "./AssessmentStatusBadge";

type AssessmentDesktopTableProps = {
  assessments: AssessmentCommandItem[];
};

function formatDate(
  value: Date | string
) {
  const date = new Date(value);

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

export default function AssessmentDesktopTable({
  assessments,
}: AssessmentDesktopTableProps) {
  return (
    <div className="hidden overflow-x-auto xl:block">
      <table className="w-full min-w-[1100px] border-separate border-spacing-0">
        <thead>
          <tr className="text-left">
            <TableHeading>
              Assessment
            </TableHeading>

            <TableHeading>
              Class
            </TableHeading>

            <TableHeading>
              Structure
            </TableHeading>

            <TableHeading>
              Submissions
            </TableHeading>

            <TableHeading>
              Average
            </TableHeading>

            <TableHeading>
              Status
            </TableHeading>

            <TableHeading>
              Due Date
            </TableHeading>

            <TableHeading align="right">
              Actions
            </TableHeading>
          </tr>
        </thead>

        <tbody>
          {assessments.map(
            (assessment) => (
              <tr
                key={assessment.id}
                className="group"
              >
                <TableCell>
                  <div className="max-w-[260px]">
                    <Link
                      href={
                        assessment.status ===
                        "DRAFT"
                          ? `/list/assessments/${assessment.id}/edit`
                          : `/list/assessments/${assessment.id}/analytics`
                      }
                      className="font-black text-slate-950 transition group-hover:text-blue-700"
                    >
                      {assessment.title}
                    </Link>

                    <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                      {
                        assessment.lesson
                          .subject.name
                      }
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <p className="text-sm font-black text-slate-800">
                    {
                      assessment.lesson
                        .class.name
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      assessment
                        .classStudentCount
                    }{" "}
                    students
                  </p>
                </TableCell>

                <TableCell>
                  <p className="text-sm font-black text-slate-800">
                    {
                      assessment.questionCount
                    }{" "}
                    questions
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {assessment.totalMarks}{" "}
                    marks
                  </p>
                </TableCell>

                <TableCell>
                  <AssessmentProgress
                    submitted={
                      assessment.submittedStudents
                    }
                    total={
                      assessment.classStudentCount
                    }
                  />
                </TableCell>

                <TableCell>
                  <p className="text-lg font-black text-slate-900">
                    {assessment.averagePercentage !==
                    null
                      ? `${assessment.averagePercentage}%`
                      : "—"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Class average
                  </p>
                </TableCell>

                <TableCell>
                  <AssessmentStatusBadge
                    status={
                      assessment.status
                    }
                  />
                </TableCell>

                <TableCell>
                  <div className="flex items-start gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {formatDate(
                          assessment.dueDate
                        )}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell align="right">
                  <div className="flex justify-end gap-2">
                    {assessment.status ===
                    "DRAFT" ? (
                      <Link
                        href={`/list/assessments/${assessment.id}/edit`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        title="Edit assessment"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link
                        href={`/list/assessments/${assessment.id}/analytics`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        title="View analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Link>
                    )}

                    <AssessmentActionsMenu
                      assessment={
                        assessment
                      }
                    />
                  </div>
                </TableCell>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

function TableHeading({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`border-b border-slate-200 bg-slate-50/80 px-4 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`border-b border-slate-100 px-4 py-5 align-middle ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}