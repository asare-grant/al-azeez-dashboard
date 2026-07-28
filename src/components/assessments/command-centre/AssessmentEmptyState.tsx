import Link from "next/link";

import {
  ArrowRight,
  FileQuestion,
} from "lucide-react";

type AssessmentEmptyStateProps = {
  hasFilters: boolean;
};

export default function AssessmentEmptyState({
  hasFilters,
}: AssessmentEmptyStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/70">
        <FileQuestion className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        {hasFilters
          ? "No matching assessments"
          : "No assessments yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing or clearing the current filters."
          : "Create your first digital assessment and begin adding professionally structured questions."}
      </p>

      {!hasFilters ? (
        <Link
          href="/list/assessments/create"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white"
        >
          Create Assessment
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}