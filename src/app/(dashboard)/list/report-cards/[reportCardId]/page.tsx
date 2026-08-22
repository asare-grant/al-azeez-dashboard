// /list/report-cards/[reportCardId]/page.tsx
import { notFound } from "next/navigation";

import { ReportCardViewer } from "@/components/report-cards/viewer";

import { getAccessibleReportCard } from "@/lib/report-cards/queries";

import {
  requireReportCardManager,
} from "@/lib/report-cards/auth";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type ReportCardPageProps = {
  params: Promise<{
    reportCardId: string;
  }>;
};

export default async function ReportCardPage({ params }: ReportCardPageProps) {
  const { reportCardId } = await params;

  const id = Number(reportCardId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

 const [
    reportCard,
    manager,
  ] =
    await Promise.all([
      getAccessibleReportCard(
        id,
      ),

      requireReportCardManager(),
    ]);

  if (
    !reportCard
  ) {
    notFound();
  }

  return (
    <ReportCardViewer
      reportCard={reportCard}
      canPublish={ manager.canPublish}
      backHref="/list/report-cards"
      printHref={`/list/report-cards/${reportCard.id}/print`}
      reviewHref={`/list/report-cards/${reportCard.id}/review`}
      canReview={ manager.canReview}
    />
  );
}
