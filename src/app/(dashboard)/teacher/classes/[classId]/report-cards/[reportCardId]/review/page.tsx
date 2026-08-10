import {
  notFound,
} from "next/navigation";

import {
  ReportCardReviewWorkspace,
} from "@/components/report-cards/review";

import {
  getReportCardReviewWorkspace,
  getTeacherAccessibleReportCard,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type TeacherReportCardReviewPageProps = {
  params: Promise<{
    classId: string;
    reportCardId: string;
  }>;
};

export default async function TeacherReportCardReviewPage({
  params,
}: TeacherReportCardReviewPageProps) {
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

  /*
   * First prove that the report belongs to
   * this teacher AND to the class in the URL.
   */
  const accessibleReport =
    await getTeacherAccessibleReportCard({
      classId:
        parsedClassId,

      reportCardId:
        parsedReportCardId,
    });

  if (!accessibleReport) {
    notFound();
  }

  /*
   * Only after route ownership is proven do
   * we load the full review workspace.
   */
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
      backHref={`/teacher/classes/${parsedClassId}/report-cards/${parsedReportCardId}`}
      printHref={`/teacher/classes/${parsedClassId}/report-cards/${parsedReportCardId}/print`}
    />
  );
}