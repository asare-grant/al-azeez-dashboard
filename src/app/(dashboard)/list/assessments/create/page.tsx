// src/app/(dashboard)/list/assessments/create/page.tsx

import CreateAssessmentLauncher from "@/components/assessments/create/CreateAssessmentLauncher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CreateAssessmentPage() {
  return <CreateAssessmentLauncher />;
}