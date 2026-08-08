// src/components/report-cards/command-centre/ReportCardMobileCard.tsx
import Link from "next/link";

import { ClipboardCheck, Eye, FileDown, RefreshCcw } from "lucide-react";

import type { ReportCardCommandItem } from "../types";

import {
  CalculationStatusBadge,
  ReportCardStatusBadge,
} from "./ReportCardStatusBadge";

import ReportCardStaleBadge from "./ReportCardStaleBadge";

import { ReportCardReviewStatusBadge } from "@/components/report-cards/review";

export default function ReportCardMobileCard({
  item,
  detailsHref = (reportCardId) => `/list/report-cards/${reportCardId}`,
  printHref = (reportCardId) => `/list/report-cards/${reportCardId}/print`,
  reviewHref = (reportCardId) => `/list/report-cards/${reportCardId}/review`,
}: {
  item: ReportCardCommandItem;

  detailsHref?: (reportCardId: number) => string;

  printHref?: (reportCardId: number) => string;

  reviewHref?: (reportCardId: number) => string;
}) {
  return (
    <article
      className={`rounded-[24px] border bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)] xl:hidden ${
        item.isStale
          ? "border-amber-200 ring-1 ring-amber-100"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">
            {item.student.name} {item.student.surname}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {item.student.studentId}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <ReportCardStatusBadge status={item.status} />

          <ReportCardReviewStatusBadge status={item.reviewStatus} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric
          label="Average"
          value={
            item.averageScore === null
              ? "—"
              : `${item.averageScore.toFixed(2)}%`
          }
        />

        <Metric
          label="Position"
          value={
            item.overallPosition
              ? `${item.overallPosition}/${item.classStudentCount ?? "—"}`
              : "—"
          }
        />

        <Metric label="Grade" value={item.overallGrade ?? "—"} />

        <Metric
          label="Subjects"
          value={`${item.completedSubjectCount}/${item.subjectCount}`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <CalculationStatusBadge status={item.calculationStatus} />

        <ReportCardStaleBadge
          isStale={item.isStale}
          staleAt={item.staleAt}
          staleReason={item.staleReason}
        />
      </div>

      {/* <div className="mt-5 flex gap-2"> */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Link
          href={detailsHref(item.id)}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>

        <Link
          href={reviewHref(item.id)}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-black transition ${
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
          className="col-span-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-50 sm:col-span-1"
        >
          <FileDown className="h-4 w-4" />
          PDF
        </Link>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="font-black text-slate-900">{value}</p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}
