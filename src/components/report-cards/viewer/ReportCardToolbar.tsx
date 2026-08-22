import Link from "next/link";

import { ArrowLeft, FileDown, ClipboardCheck } from "lucide-react";

import type {
  ReportCardCalculationStatus,
  ReportCardStatus,
} from "@prisma/client";

import {
  CalculationStatusBadge,
  ReportCardStatusBadge,
} from "../command-centre/ReportCardStatusBadge";

import ArchiveReportCardButton from "./ArchiveReportCardButton";
import PublishReportCardButton from "./PublishReportCardButton";

type ReportCardToolbarProps = {
  reportCardId: number;

  status: ReportCardStatus;

  calculationStatus: ReportCardCalculationStatus;

  canPublish: boolean;

  backHref?: string;

  printHref?: string;

  reviewHref?: string;

  canReview?: boolean;
};

export default function ReportCardToolbar({
  reportCardId,
  status,
  calculationStatus,
  canPublish,
  backHref = "/list/report-cards",
  printHref = `/list/report-cards/${reportCardId}/print`,
  reviewHref,
  canReview = false,
}: ReportCardToolbarProps) {
  const publishDisabled = status !== "DRAFT" || calculationStatus !== "READY";

  return (
    <div className="mb-5 flex flex-col gap-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={backHref}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Report Cards
        </Link>

        <ReportCardStatusBadge status={status} />

        <CalculationStatusBadge status={calculationStatus} />
      </div>

      {canReview && reviewHref ? (
        <Link
          href={reviewHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-700 transition hover:bg-blue-100"
        >
          <ClipboardCheck className="h-4 w-4" />
          Review
        </Link>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Link
          href={printHref}
          target="_blank"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          <FileDown className="h-4 w-4" />
          Print / PDF
        </Link>

        {canPublish ? (
          <>
            <PublishReportCardButton
              reportCardId={reportCardId}
              disabled={publishDisabled}
            />

            <ArchiveReportCardButton
              reportCardId={reportCardId}
              disabled={status === "ARCHIVED"}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
