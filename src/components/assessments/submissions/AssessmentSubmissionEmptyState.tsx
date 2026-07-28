import {
  Users,
} from "lucide-react";

export default function AssessmentSubmissionEmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/70">
        <Users className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        No matching submissions
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Change the search term or status
        filter to view other students.
      </p>
    </div>
  );
}