// src/app/(dashboard)/parent/children/[childId]/report-cards/[reportCardId]/print/page.tsx
import {
  notFound,
} from "next/navigation";

import {
  PrintReportCardButton,
  ReportCardDocument,
} from "@/components/report-cards/viewer";

import {
  getParentAccessibleReportCard,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type ParentPrintReportCardPageProps = {
  params: Promise<{
    childId: string;
    reportCardId: string;
  }>;
};

export default async function ParentPrintReportCardPage({
  params,
}: ParentPrintReportCardPageProps) {
  const {
    childId,
    reportCardId,
  } = await params;

  const parsedReportCardId =
    Number(reportCardId);

  if (
    !childId.trim() ||
    !Number.isInteger(
      parsedReportCardId,
    ) ||
    parsedReportCardId <= 0
  ) {
    notFound();
  }

  const reportCard =
    await getParentAccessibleReportCard({
      childId,

      reportCardId:
        parsedReportCardId,
    });

  if (!reportCard) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:bg-white print:p-0">
      <div
        data-hide-on-print="true"
        className="mx-auto mb-5 flex max-w-[210mm] justify-end print:hidden"
      >
        <PrintReportCardButton />
      </div>

      <ReportCardDocument
        reportCard={reportCard}
      />
    </div>
  );
}