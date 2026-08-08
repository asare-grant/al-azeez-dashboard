// src/components/report-cards/command-centre/ReportCardTable.tsx
import { ClipboardCheck, Eye, FileDown, RefreshCcw } from "lucide-react";

import Link from "next/link";

import type { ReportCardCommandItem } from "../types";

import {
  CalculationStatusBadge,
  ReportCardStatusBadge,
} from "./ReportCardStatusBadge";

import ReportCardStaleBadge from "./ReportCardStaleBadge";

import { ReportCardReviewStatusBadge } from "../review";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ReportCardTable({
  items,
  detailsHref = (reportCardId) => `/list/report-cards/${reportCardId}`,
  printHref = (reportCardId) => `/list/report-cards/${reportCardId}/print`,
  reviewHref = (reportCardId) => `/list/report-cards/${reportCardId}/review`,
}: {
  items: ReportCardCommandItem[];

  detailsHref?: (reportCardId: number) => string;

  printHref?: (reportCardId: number) => string;

  reviewHref?: (reportCardId: number) => string;
}) {
  return (
    <div className="hidden overflow-x-auto xl:block">
      <table className="w-full min-w-[1200px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <Heading>Student</Heading>
            <Heading>Class</Heading>
            <Heading>Period</Heading>
            <Heading>Completion</Heading>
            <Heading>Average</Heading>
            <Heading>Grade</Heading>
            <Heading>Position</Heading>
            <Heading>Status</Heading>
            <Heading>Generated</Heading>
            <Heading>Review Stage</Heading>
            <Heading align="right">Actions</Heading>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={`border-b transition ${
                item.isStale
                  ? "border-amber-100 bg-amber-50/30 hover:bg-amber-50/60"
                  : "border-slate-100 hover:bg-slate-50/70"
              }`}
            >
              <Cell>
                <p className="font-black text-slate-950">
                  {item.student.name} {item.student.surname}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {item.student.studentId}
                </p>
              </Cell>

              <Cell>
                <p className="font-bold text-slate-700">{item.class.name}</p>

                <p className="mt-1 text-xs text-slate-400">
                  {item.grade.level}
                </p>
              </Cell>

              <Cell>
                <p className="font-bold text-slate-700">
                  {item.term.name.replace(/_/g, " ")}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {item.academicYear}
                </p>
              </Cell>

              <Cell>
                <p className="font-black text-slate-900">
                  {item.completedSubjectCount}/{item.subjectCount}
                </p>

                {item.incompleteSubjectCount > 0 ? (
                  <p className="mt-1 text-xs font-bold text-red-500">
                    {item.incompleteSubjectCount} incomplete
                  </p>
                ) : null}
              </Cell>

              <Cell>
                <p className="text-lg font-black text-blue-700">
                  {item.averageScore === null
                    ? "—"
                    : `${item.averageScore.toFixed(2)}%`}
                </p>
              </Cell>

              <Cell>
                <p className="font-black text-slate-800">
                  {item.overallGrade ?? "—"}
                </p>
              </Cell>

              <Cell>
                <p className="font-black text-slate-800">
                  {item.overallPosition ?? "—"}
                </p>

                {item.classStudentCount ? (
                  <p className="mt-1 text-xs text-slate-400">
                    of {item.classStudentCount}
                  </p>
                ) : null}
              </Cell>

              <Cell>
                <div className="flex flex-col items-start gap-2">
                  <ReportCardStatusBadge status={item.status} />

                  <CalculationStatusBadge status={item.calculationStatus} />

                  <ReportCardStaleBadge
                    isStale={item.isStale}
                    staleAt={item.staleAt}
                    staleReason={item.staleReason}
                  />
                </div>
              </Cell>

              <Cell>
                <p className="text-sm font-bold text-slate-600">
                  {formatDate(item.generatedAt)}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Version {item.version}
                </p>
              </Cell>

              <Cell>
                <ReportCardReviewStatusBadge status={item.reviewStatus} />
              </Cell>

              <Cell align="right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={detailsHref(item.id)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>

                  <Link
                    href={reviewHref(item.id)}
                    className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-black transition ${
                      item.isStale
                        ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {item.isStale ? (
                      <RefreshCcw className="h-4 w-4" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4" />
                    )}

                    {item.isStale ? "Attention" : "Review"}
                  </Link>

                  <Link
                    href={printHref(item.id)}
                    target="_blank"
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    <FileDown className="h-4 w-4" />
                    PDF
                  </Link>
                </div>
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
        align === "right" ? "text-right" : "text-left"
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
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}
