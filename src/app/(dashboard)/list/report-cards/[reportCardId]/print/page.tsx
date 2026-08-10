// src/app/(dashboard)/list/report-cards/[reportCardId]/print
import {
  notFound,
} from "next/navigation";

import {
  PrintReportCardButton,
  ReportCardDocument,
} from "@/components/report-cards/viewer";

import {
  getAccessibleReportCard,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type PrintReportCardPageProps = {
  params: Promise<{
    reportCardId: string;
  }>;
};

export default async function PrintReportCardPage({
  params,
}: PrintReportCardPageProps) {
  const {
    reportCardId,
  } = await params;

  const id =
    Number(reportCardId);

  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    notFound();
  }

  const reportCard =
    await getAccessibleReportCard(
      id,
    );

  if (!reportCard) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-[210mm] justify-end print:hidden">
        <PrintReportCardButton />
      </div>

      <ReportCardDocument
        reportCard={reportCard}
      />
    </div>
  );
}