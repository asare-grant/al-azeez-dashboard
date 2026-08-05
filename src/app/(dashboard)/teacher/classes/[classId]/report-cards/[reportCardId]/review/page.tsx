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

  const reportCard =
    await getReportCardReviewWorkspace(
      parsedReportCardId,
    );

  if (
    !reportCard ||
    reportCard.class.id !==
      parsedClassId
  ) {
    notFound();
  }

  return (
    <ReportCardReviewWorkspace
      reportCard={
        reportCard
      }
      backHref={`/teacher/classes/${parsedClassId}/report-cards/${reportCard.id}`}
      printHref={`/teacher/classes/${parsedClassId}/report-cards/${reportCard.id}/print`}
    />
  );
}