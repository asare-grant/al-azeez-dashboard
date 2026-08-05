import { notFound } from "next/navigation";

import { ReportCardViewer } from "@/components/report-cards/viewer";

import { getAccessibleReportCard } from "@/lib/report-cards/queries";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type StudentReportCardPageProps = {
  params: Promise<{
    reportCardId: string;
  }>;
};

export default async function StudentReportCardPage({
  params,
}: StudentReportCardPageProps) {
  const { reportCardId } = await params;

  const parsedReportCardId = Number(reportCardId);

  if (!Number.isInteger(parsedReportCardId) || parsedReportCardId <= 0) {
    notFound();
  }

  /*
   * getAccessibleReportCard() must verify:
   *
   * 1. authenticated role is student;
   * 2. reportCard.studentId equals the current user ID;
   * 3. reportCard.status equals PUBLISHED.
   */
  const reportCard = await getAccessibleReportCard(parsedReportCardId);

  if (!reportCard) {
    notFound();
  }

  return (
    <ReportCardViewer
      reportCard={reportCard}
      isAdmin={false}
      backHref="/student/report-cards"
      printHref={`/student/report-cards/${reportCard.id}/print`}
    />
  );
}
