// import Link from "next/link";

// import {
//   ArrowRight,
//   ClipboardCheck,
//   FileQuestion,
//   Plus,
//   Sparkles,
// } from "lucide-react";

// import {
//   getTeacherAssessmentList,
// } from "@/lib/assessments/queries";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export default async function AssessmentListPage() {
//   const result =
//     await getTeacherAssessmentList({
//       page: 1,
//       pageSize: 20,
//     });

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-[1500px]">
//         <section className="relative overflow-hidden rounded-[32px] bg-blue-950 px-6 py-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] sm:px-8 lg:px-10 lg:py-10">
//           <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
//           <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

//           <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
//             <div className="max-w-3xl">
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
//                 <Sparkles className="h-3.5 w-3.5" />
//                 AAIS Digital Assessment Centre
//               </div>

//               <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
//                 Create meaningful assessments.
//               </h1>

//               <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
//                 Build questions, publish securely,
//                 track submissions and deliver instant
//                 results from one professional workspace.
//               </p>
//             </div>

//             <Link
//               href="/list/assessments/create"
//               className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500"
//             >
//               <Plus className="h-4.5 w-4.5" />
//               Create Assessment
//             </Link>
//           </div>
//         </section>

//         <div className="mt-6 grid gap-4 md:grid-cols-3">
//           <StatCard
//             icon={ClipboardCheck}
//             label="Total Assessments"
//             value={String(result.total)}
//           />

//           <StatCard
//             icon={FileQuestion}
//             label="Page Results"
//             value={String(result.data.length)}
//           />

//           <StatCard
//             icon={Sparkles}
//             label="Assessment Studio"
//             value="Ready"
//           />
//         </div>

//         <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
//                 Assessments
//               </p>

//               <h2 className="mt-2 text-2xl font-black text-slate-950">
//                 Assessment workspace
//               </h2>
//             </div>
//           </div>

//           {result.data.length === 0 ? (
//             <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
//               <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/70">
//                 <FileQuestion className="h-7 w-7" />
//               </div>

//               <h3 className="mt-5 text-xl font-black text-slate-950">
//                 No assessments yet
//               </h3>

//               <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
//                 Create your first assessment and begin
//                 adding professionally structured
//                 multiple-choice questions.
//               </p>

//               <Link
//                 href="/list/assessments/create"
//                 className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white"
//               >
//                 Create Assessment
//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//             </div>
//           ) : (
//             <div className="mt-6 space-y-3">
//               {result.data.map((assessment) => (
//                 <Link
//                   key={assessment.id}
//                   href={`/list/assessments/${assessment.id}/edit`}
//                   className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40 sm:flex-row sm:items-center sm:justify-between"
//                 >
//                   <div>
//                     <h3 className="font-black text-slate-950">
//                       {assessment.title}
//                     </h3>

//                     <p className="mt-1 text-sm text-slate-500">
//                       {
//                         assessment.lesson.subject
//                           .name
//                       }{" "}
//                       •{" "}
//                       {
//                         assessment.lesson.class
//                           .name
//                       }
//                     </p>
//                   </div>

//                   <div className="flex items-center gap-3">
//                     <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
//                       {assessment.questionCount}{" "}
//                       questions
//                     </span>

//                     <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
//                       {assessment.status}
//                     </span>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }

// function StatCard({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: typeof ClipboardCheck;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
//       <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
//         <Icon className="h-5 w-5" />
//       </div>

//       <p className="mt-4 text-2xl font-black text-slate-950">
//         {value}
//       </p>

//       <p className="mt-1 text-sm font-semibold text-slate-500">
//         {label}
//       </p>
//     </div>
//   );
// }

import type { AssessmentStatus } from "@prisma/client";

import { AssessmentCommandCentre } from "@/components/assessments/command-centre";

import {
  getAssessmentDashboardMetrics,
  getAssessmentFilterOptions,
  getTeacherAssessmentList,
} from "@/lib/assessments/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AssessmentListPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    classId?: string;
    subjectId?: string;
  }>;
};

const validStatuses: AssessmentStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
];

export default async function AssessmentListPage({
  searchParams,
}: AssessmentListPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);

  const classId = params.classId ? Number(params.classId) : undefined;

  const subjectId = params.subjectId ? Number(params.subjectId) : undefined;

  const status =
    params.status && validStatuses.includes(params.status as AssessmentStatus)
      ? (params.status as AssessmentStatus)
      : undefined;

  const [listResult, metrics, filterOptions] = await Promise.all([
    getTeacherAssessmentList({
      page,
      pageSize: 10,

      search: params.search?.trim() || undefined,

      classId:
        typeof classId === "number" && Number.isInteger(classId) && classId > 0
          ? classId
          : undefined,

      subjectId:
        typeof subjectId === "number" &&
        Number.isInteger(subjectId) &&
        subjectId > 0
          ? subjectId
          : undefined,

      status,
    }),

    getAssessmentDashboardMetrics(),

    getAssessmentFilterOptions(),
  ]);

  return (
    <AssessmentCommandCentre
      assessments={listResult.data}
      metrics={metrics}
      classes={filterOptions.classes}
      subjects={filterOptions.subjects}
      page={listResult.page}
      totalPages={listResult.totalPages}
      total={listResult.total}
      currentFilters={{
        search: params.search,
        status: params.status,
        classId: params.classId,
        subjectId: params.subjectId,
      }}
    />
  );
}
