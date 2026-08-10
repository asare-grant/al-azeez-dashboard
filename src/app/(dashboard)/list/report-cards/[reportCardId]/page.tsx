// /list/report-cards/[reportCardId]/page.tsx
import { notFound } from "next/navigation";

import { ReportCardViewer } from "@/components/report-cards/viewer";

import { getAccessibleReportCard } from "@/lib/report-cards/queries";

import { auth } from "@clerk/nextjs/server";

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

  const reportCard = await getAccessibleReportCard(id);

  if (!reportCard) {
    notFound();
  }

  const { sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  return (
    <ReportCardViewer
      reportCard={reportCard}
      isAdmin={role === "admin"}
      backHref="/list/report-cards"
      printHref={`/list/report-cards/${reportCard.id}/print`}
      reviewHref={`/list/report-cards/${reportCard.id}/review`}
      canReview={role === "admin" || role === "teacher"}
    />
  );
}
