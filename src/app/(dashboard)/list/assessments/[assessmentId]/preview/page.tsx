import {
  notFound,
} from "next/navigation";


import AssessmentStudentPreview from "@/components/assessments/preview/AssessmentStudentPreview";

import {
  getAssessmentBuilderData,
} from "@/lib/assessments/queries";


export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type AssessmentPreviewPageProps = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export default async function AssessmentPreviewPage({
  params,
}: AssessmentPreviewPageProps) {
  const { assessmentId } =
    await params;

  const parsedAssessmentId =
    Number(assessmentId);

  if (
    !Number.isInteger(
      parsedAssessmentId,
    ) ||
    parsedAssessmentId <= 0
  ) {
    notFound();
  }

  /*
   * This query already enforces admin/teacher
   * access through getManageableAssessment().
   */
  const assessment =
    await getAssessmentBuilderData(
      parsedAssessmentId,
    );

  if (!assessment) {
    notFound();
  }

  return (
    <AssessmentStudentPreview
      assessment={assessment}
    />
  );
}