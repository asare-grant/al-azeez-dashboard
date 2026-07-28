import {
  notFound,
} from "next/navigation";

import {
  AssessmentSubmissionsPage,
} from "@/components/assessments/submissions";

import { 
    getTeacherAssessmentSubmissions 
} from "@/lib/assessments/queries";



export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type AssessmentSubmissionsRouteProps = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export default async function AssessmentSubmissionsRoute({
  params,
}: AssessmentSubmissionsRouteProps) {
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
    await getTeacherAssessmentSubmissions(
      parsedAssessmentId
    );

  if (!data) {
    notFound();
  }

  return (
    <AssessmentSubmissionsPage
      data={data}
    />
  );
}