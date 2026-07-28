// import Link from "next/link";

// import {
//   ArrowLeft,
//   FileQuestion,
//   ShieldCheck,
// } from "lucide-react";

// import {
//   notFound,
//   redirect,
// } from "next/navigation";

// import {
//   getStudentAssessmentPlayerData,
// } from "@/lib/assessments/queries";

// export const dynamic =
//   "force-dynamic";

// export const revalidate = 0;

// type StudentAssessmentTakePageProps = {
//   params: Promise<{
//     assessmentId: string;
//   }>;

//   searchParams: Promise<{
//     attemptId?: string;
//   }>;
// };

// export default async function StudentAssessmentTakePage({
//   params,
//   searchParams,
// }: StudentAssessmentTakePageProps) {
//   const [
//     resolvedParams,
//     resolvedSearchParams,
//   ] = await Promise.all([
//     params,
//     searchParams,
//   ]);

//   const assessmentId = Number(
//     resolvedParams.assessmentId
//   );

//   const attemptId = Number(
//     resolvedSearchParams.attemptId
//   );

//   if (
//     !Number.isInteger(
//       assessmentId
//     ) ||
//     assessmentId <= 0 ||
//     !Number.isInteger(attemptId) ||
//     attemptId <= 0
//   ) {
//     notFound();
//   }

//   const playerData =
//     await getStudentAssessmentPlayerData({
//       assessmentId,
//       attemptId,
//     });

//   if (!playerData) {
//     redirect(
//       `/student/assessments/${assessmentId}`
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-5xl">
//         <Link
//           href={`/student/assessments/${assessmentId}`}
//           className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           Assessment Briefing
//         </Link>

//         <section className="mt-5 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
//           <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
//             <ShieldCheck className="h-7 w-7" />
//           </div>

//           <h1 className="mt-5 text-3xl font-black text-slate-950">
//             Secure attempt created
//           </h1>

//           <p className="mt-3 text-sm leading-7 text-slate-500">
//             The student-safe assessment data
//             has loaded successfully. The full
//             test player will replace this
//             temporary screen in the next step.
//           </p>

//           <div className="mt-6 grid gap-3 sm:grid-cols-3">
//             <Metric
//               label="Attempt"
//               value={String(
//                 playerData.attempt
//                   .attemptNumber
//               )}
//             />

//             <Metric
//               label="Questions"
//               value={String(
//                 playerData.questions.length
//               )}
//             />

//             <Metric
//               label="Saved Answers"
//               value={String(
//                 playerData.savedAnswers
//                   .length
//               )}
//             />
//           </div>

//           <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
//             <div className="flex items-center gap-3">
//               <FileQuestion className="h-5 w-5 text-blue-300" />

//               <p className="font-black">
//                 {playerData.assessment.title}
//               </p>
//             </div>

//             <p className="mt-3 text-sm text-slate-300">
//               Correct-answer information has
//               not been sent to this page.
//             </p>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// function Metric({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="rounded-2xl bg-slate-50 p-4">
//       <p className="text-2xl font-black text-slate-950">
//         {value}
//       </p>

//       <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
//         {label}
//       </p>
//     </div>
//   );
// }




import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AssessmentPlayer,
} from "@/components/assessments/player";

import { getStudentAssessmentPlayerData } from "@/lib/assessments/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type StudentAssessmentTakePageProps = {
  params: Promise<{
    assessmentId: string;
  }>;

  searchParams: Promise<{
    attemptId?: string;
  }>;
};

export default async function StudentAssessmentTakePage({
  params,
  searchParams,
}: StudentAssessmentTakePageProps) {
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
    !Number.isInteger(attemptId) ||
    attemptId <= 0
  ) {
    notFound();
  }

  const playerData =
    await getStudentAssessmentPlayerData({
      assessmentId,
      attemptId,
    });

  if (!playerData) {
    redirect(
      `/student/assessments/${assessmentId}`
    );
  }

  return (
    <AssessmentPlayer
      data={playerData}
    />
  );
}