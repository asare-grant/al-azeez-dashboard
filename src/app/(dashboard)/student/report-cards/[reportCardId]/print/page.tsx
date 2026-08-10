// src/app/(dashboard)/student/report-cards/[reportCardId]/print
import {
  notFound,
} from "next/navigation";

import {
  PrintReportCardButton,
  ReportCardDocument,
} from "@/components/report-cards/viewer";

import {
  getStudentAccessibleReportCard,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type StudentPrintReportCardPageProps = {
  params: Promise<{
    reportCardId: string;
  }>;
};

export default async function StudentPrintReportCardPage({
  params,
}: StudentPrintReportCardPageProps) {
  const {
    reportCardId,
  } = await params;

  const parsedReportCardId =
    Number(reportCardId);

  if (
    !Number.isInteger(
      parsedReportCardId,
    ) ||
    parsedReportCardId <= 0
  ) {
    notFound();
  }

  const reportCard =
    await getStudentAccessibleReportCard(
      parsedReportCardId,
    );

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
        reportCard={
          reportCard
        }
      />
    </div>
  );
}