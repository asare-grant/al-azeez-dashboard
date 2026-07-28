// import Link from "next/link";

// import {
//   ArrowLeft,
//   FileSearch,
// } from "lucide-react";

// type SubmissionReviewPageProps = {
//   params: Promise<{
//     assessmentId: string;
//     studentId: string;
//   }>;

//   searchParams: Promise<{
//     attemptId?: string;
//   }>;
// };

// export default async function SubmissionReviewPage({
//   params,
//   searchParams,
// }: SubmissionReviewPageProps) {
//   const [
//     resolvedParams,
//     resolvedSearchParams,
//   ] = await Promise.all([
//     params,
//     searchParams,
//   ]);

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-4xl">
//         <Link
//           href={`/list/assessments/${resolvedParams.assessmentId}/submissions`}
//           className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Submissions
//         </Link>

//         <section className="mt-5 rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
//           <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
//             <FileSearch className="h-7 w-7" />
//           </div>

//           <h1 className="mt-5 text-3xl font-black text-slate-950">
//             Individual submission review
//           </h1>

//           <p className="mt-3 text-sm leading-7 text-slate-500">
//             Student:{" "}
//             {resolvedParams.studentId}
//             <br />
//             Attempt:{" "}
//             {resolvedSearchParams.attemptId ??
//               "Not selected"}
//           </p>
//         </section>
//       </div>
//     </div>
//   );
// }




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