import {
  notFound,
} from "next/navigation";

import {
  AssessmentResultPage,
} from "@/components/assessments/result";
import { 
    getStudentAssessmentResult 
} from "@/lib/assessments/queries";



export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type StudentAssessmentResultPageProps = {
  params: Promise<{
    assessmentId: string;
  }>;

  searchParams: Promise<{
    attemptId?: string;
  }>;
};

export default async function StudentAssessmentResultRoute({
  params,
  searchParams,
}: StudentAssessmentResultPageProps) {
  const [
    resolvedParams,
    resolvedSearchParams,
  ] = await Promise.all([
    params,
    searchParams,
  ]);

  const assessmentId =
    Number(
      resolvedParams.assessmentId
    );

  const attemptId =
    Number(
      resolvedSearchParams.attemptId
    );

  if (
    !Number.isInteger(
      assessmentId
    ) ||
    assessmentId <= 0 ||
    !Number.isInteger(
      attemptId
    ) ||
    attemptId <= 0
  ) {
    notFound();
  }

  const result =
    await getStudentAssessmentResult({
      assessmentId,
      attemptId,
    });

  if (!result) {
    notFound();
  }

  return (
    <AssessmentResultPage
      result={result}
    />
  );
}