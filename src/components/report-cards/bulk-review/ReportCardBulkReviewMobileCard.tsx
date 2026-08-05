import Link from "next/link";

import {
  ClipboardCheck,
  Eye,
} from "lucide-react";

import type {
  ReportCardBulkReviewItem,
} from "@/lib/report-cards/bulk-review-types";

import {
  ReportCardCalculationBadge,
  ReportCardReviewStatusBadge,
} from "@/components/report-cards/review";

type ReportCardBulkReviewMobileCardProps = {
  item:
    ReportCardBulkReviewItem;

  selected: boolean;

  onToggle: () => void;
};

export default function ReportCardBulkReviewMobileCard({
  item,
  selected,
  onToggle,
}: ReportCardBulkReviewMobileCardProps) {
  return (
    <article
      className={`rounded-[24px] border p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)] xl:hidden ${
        selected
          ? "border-blue-300 bg-blue-50/50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={
            onToggle
          }
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          aria-label={`Select ${item.student.name} ${item.student.surname}`}
        />

        <div className="min-w-0 flex-1">
          <h3 className="break-words font-black text-slate-950">
            {
              item.student.name
            }{" "}
            {
              item.student.surname
            }
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {
              item.student.studentId
            }{" "}
            • {item.class.name}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ReportCardReviewStatusBadge
          status={
            item.reviewStatus
          }
        />

        <ReportCardCalculationBadge
          status={
            item.calculationStatus
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric
          label="Average"
          value={
            item.averageScore ===
            null
              ? "—"
              : `${item.averageScore.toFixed(
                  2,
                )}%`
          }
        />

        <Metric
          label="Grade"
          value={
            item.overallGrade ??
            "—"
          }
        />

        <Metric
          label="Subjects"
          value={`${item.completedSubjectCount}/${item.subjectCount}`}
        />

        <Metric
          label="Attendance"
          value={`${item.daysPresent ?? "—"}/${item.daysSchoolOpened ?? "—"}`}
        />
      </div>

      {item.reviewNote ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
            Review Note
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-700">
            {item.reviewNote}
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link
          href={`/list/report-cards/${item.id}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700"
        >
          <Eye className="h-4 w-4" />
          View
        </Link>

        <Link
          href={`/list/report-cards/${item.id}/review`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-black text-white"
        >
          <ClipboardCheck className="h-4 w-4" />
          Review
        </Link>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}