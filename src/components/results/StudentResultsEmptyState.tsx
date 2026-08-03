import {
  FileSearch,
} from "lucide-react";

type StudentResultsEmptyStateProps = {
  filtered?: boolean;
};

export default function StudentResultsEmptyState({
  filtered = false,
}: StudentResultsEmptyStateProps) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/60">
        <FileSearch className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        {filtered
          ? "No matching results"
          : "No results available"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "No results match the selected academic year, term or result type. Reset the filters and try again."
          : "Exam, assignment and assessment results will appear here after they have been recorded."}
      </p>
    </div>
  );
}