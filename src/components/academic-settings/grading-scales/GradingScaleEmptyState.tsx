import Link from "next/link";

import {
  Plus,
  Scale,
} from "lucide-react";

export default function GradingScaleEmptyState({
  filtered,
}: {
  filtered: boolean;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/60">
        <Scale className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        {filtered
          ? "No matching grading scales"
          : "Create the first grading scale"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "No grading scale matches the current search and status filters."
          : "Define the grade boundaries that will power student results and term report cards."}
      </p>

      <Link
        href={
          filtered
            ? "/list/academic-settings/grading-scales"
            : "/list/academic-settings/grading-scales/create"
        }
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700"
      >
        <Plus className="h-4 w-4" />

        {filtered
          ? "Clear Filters"
          : "Create Grading Scale"}
      </Link>
    </div>
  );
}