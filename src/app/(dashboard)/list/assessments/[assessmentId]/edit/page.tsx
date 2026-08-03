import {
  notFound,
} from "next/navigation";

import AssessmentStudio from "@/components/assessments/studio/AssessmentStudio";

import {
  getAssessmentAcademicPeriods,
  getAssessmentBuilderData,
  getAssessmentLessonOptions,
} from "@/lib/assessments/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type EditAssessmentPageProps = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export default async function EditAssessmentPage({
  params,
}: EditAssessmentPageProps) {
  const { assessmentId } = await params;

  const parsedAssessmentId =
    Number(assessmentId);

  if (
    !Number.isInteger(parsedAssessmentId) ||
    parsedAssessmentId <= 0
  ) {
    notFound();
  }

  const [
  assessment,
  lessons,
  terms,
] = await Promise.all([
  getAssessmentBuilderData(
    parsedAssessmentId
  ),

  getAssessmentLessonOptions(),

  getAssessmentAcademicPeriods(),
]);

  if (!assessment) {
    notFound();
  }

  return (
    <AssessmentStudio
      initialAssessment={assessment}
      lessons={lessons}
      terms={terms}
    />
  );
}