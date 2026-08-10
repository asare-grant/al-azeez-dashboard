// src/app/(dashboard)//parent/children/[childId]/report-cards/[reportCardId]/page.tsx
import {
  notFound,
} from "next/navigation";

import {
  ReportCardViewer,
} from "@/components/report-cards/viewer";

import {
  getParentAccessibleReportCard,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type ParentReportCardPageProps = {
  params: Promise<{
    childId: string;
    reportCardId: string;
  }>;
};

export default async function ParentReportCardPage({
  params,
}: ParentReportCardPageProps) {
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
    <ReportCardViewer
      reportCard={reportCard}
      isAdmin={false}
      backHref={`/parent/children/${childId}/report-cards`}
      printHref={`/parent/children/${childId}/report-cards/${reportCard.id}/print`}
    />
  );
}