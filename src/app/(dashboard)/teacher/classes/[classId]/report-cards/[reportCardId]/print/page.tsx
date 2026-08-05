import {
  notFound,
} from "next/navigation";

import {
  PrintReportCardButton,
  ReportCardDocument,
} from "@/components/report-cards/viewer";

import {
  getTeacherAccessibleReportCard,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type TeacherPrintReportCardPageProps = {
  params: Promise<{
    classId: string;
    reportCardId: string;
  }>;
};

export default async function TeacherPrintReportCardPage({
  params,
}: TeacherPrintReportCardPageProps) {
  const {
    classId,
    reportCardId,
  } = await params;

  const parsedClassId =
    Number(classId);

  const parsedReportCardId =
    Number(reportCardId);

  if (
    !Number.isInteger(
      parsedClassId,
    ) ||
    parsedClassId <= 0 ||
    !Number.isInteger(
      parsedReportCardId,
    ) ||
    parsedReportCardId <= 0
  ) {
    notFound();
  }

  const reportCard =
    await getTeacherAccessibleReportCard({
      classId:
        parsedClassId,

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
        reportCard={
          reportCard
        }
      />
    </div>
  );
}