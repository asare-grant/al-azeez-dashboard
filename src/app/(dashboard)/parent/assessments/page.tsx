import {
  ParentAssessmentDashboard,
} from "@/components/assessments/parent";

import {
  getParentChildrenAssessmentSummary,
} from "@/lib/assessments/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function ParentAssessmentsPage() {
  const children =
    await getParentChildrenAssessmentSummary();

  return (
    <ParentAssessmentDashboard
      children={children}
    />
  );
}