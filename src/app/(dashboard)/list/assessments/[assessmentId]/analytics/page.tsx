import {
  notFound,
} from "next/navigation";

import {
  AssessmentAnalyticsPage,
} from "@/components/assessments/analytics";

import {
  getTeacherAssessmentAnalytics,
} from "@/lib/assessments/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type AssessmentAnalyticsRouteProps = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export default async function AssessmentAnalyticsRoute({
  params,
}: AssessmentAnalyticsRouteProps) {
  const { assessmentId } =
    await params;

  const parsedAssessmentId =
    Number(assessmentId);

  if (
    !Number.isInteger(
      parsedAssessmentId
    ) ||
    parsedAssessmentId <= 0
  ) {
    notFound();
  }

  const data =
    await getTeacherAssessmentAnalytics(
      parsedAssessmentId
    );

  if (!data) {
    notFound();
  }

  return (
    <AssessmentAnalyticsPage
      data={data}
    />
  );
}