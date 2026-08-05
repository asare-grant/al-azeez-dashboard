import { notFound } from "next/navigation";

import { ReportCardViewer } from "@/components/report-cards/viewer";

import { getTeacherAccessibleReportCard } from "@/lib/report-cards/queries";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type TeacherReportCardPageProps = {
  params: Promise<{
    classId: string;
    reportCardId: string;
  }>;
};

export default async function TeacherReportCardPage({
  params,
}: TeacherReportCardPageProps) {
  const { classId, reportCardId } = await params;

  const parsedClassId = Number(classId);

  const parsedReportCardId = Number(reportCardId);

  if (
    !Number.isInteger(parsedClassId) ||
    parsedClassId <= 0 ||
    !Number.isInteger(parsedReportCardId) ||
    parsedReportCardId <= 0
  ) {
    notFound();
  }

  const reportCard = await getTeacherAccessibleReportCard({
    classId: parsedClassId,

    reportCardId: parsedReportCardId,
  });

  if (!reportCard) {
    notFound();
  }

  return (
    <ReportCardViewer
      reportCard={reportCard}
      isAdmin={false}
      backHref={`/teacher/classes/${parsedClassId}/report-cards`}
      printHref={`/teacher/classes/${parsedClassId}/report-cards/${reportCard.id}/print`}
      reviewHref={`/teacher/classes/${parsedClassId}/report-cards/${reportCard.id}/review`}
      canReview
    />
  );
}
