import {
  notFound,
} from "next/navigation";

import {
  AssessmentIntroduction,
} from "@/components/assessments/introduction";

import {
  getStudentAssessmentIntroduction,
} from "@/lib/assessments/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type StudentAssessmentIntroductionPageProps = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export default async function StudentAssessmentIntroductionPage({
  params,
}: StudentAssessmentIntroductionPageProps) {
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

  const assessment =
    await getStudentAssessmentIntroduction(
      parsedAssessmentId
    );

  if (!assessment) {
    notFound();
  }

  return (
    <AssessmentIntroduction
      assessment={assessment}
    />
  );
}