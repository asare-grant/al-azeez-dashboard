import {
  notFound,
} from "next/navigation";

import {
  StudentSubmissionReviewPage,
} from "@/components/assessments/submission-review";

import {
  getTeacherStudentSubmissionReview,
} from "@/lib/assessments/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type SubmissionReviewPageProps = {
  params: Promise<{
    assessmentId: string;
    studentId: string;
  }>;

  searchParams: Promise<{
    attemptId?: string;
  }>;
};

export default async function SubmissionReviewPage({
  params,
  searchParams,
}: SubmissionReviewPageProps) {
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
    resolvedSearchParams.attemptId
      ? Number(
          resolvedSearchParams.attemptId
        )
      : undefined;

  if (
    !Number.isInteger(
      assessmentId
    ) ||
    assessmentId <= 0
  ) {
    notFound();
  }

  if (
    attemptId !== undefined &&
    (!Number.isInteger(attemptId) ||
      attemptId <= 0)
  ) {
    notFound();
  }

  const data =
    await getTeacherStudentSubmissionReview({
      assessmentId,

      studentId:
        resolvedParams.studentId,

      attemptId,
    });

  if (!data) {
    notFound();
  }

  return (
    <StudentSubmissionReviewPage
      data={data}
    />
  );
}