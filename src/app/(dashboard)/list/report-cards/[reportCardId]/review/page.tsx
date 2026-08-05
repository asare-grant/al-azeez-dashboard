import {
  notFound,
} from "next/navigation";

import {
  ReportCardReviewWorkspace,
} from "@/components/report-cards/review";

import {
  getReportCardReviewWorkspace,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type ReportCardReviewPageProps = {
  params: Promise<{
    reportCardId: string;
  }>;
};

export default async function ReportCardReviewPage({
  params,
}: ReportCardReviewPageProps) {
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
    await getReportCardReviewWorkspace(
      parsedReportCardId,
    );

  if (!reportCard) {
    notFound();
  }

  return (
    <ReportCardReviewWorkspace
      reportCard={
        reportCard
      }
      backHref={`/list/report-cards/${reportCard.id}`}
      printHref={`/list/report-cards/${reportCard.id}/print`}
    />
  );
}