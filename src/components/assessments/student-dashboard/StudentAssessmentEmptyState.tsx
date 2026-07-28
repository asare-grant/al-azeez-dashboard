import {
  BookOpenCheck,
} from "lucide-react";

type StudentAssessmentEmptyStateProps = {
  filtered: boolean;
};

export default function StudentAssessmentEmptyState({
  filtered,
}: StudentAssessmentEmptyStateProps) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/70">
        <BookOpenCheck className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        {filtered
          ? "No assessments in this section"
          : "No assessments assigned yet"}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "Choose another category to view your remaining assessments."
          : "New assessments assigned to your class will appear here."}
      </p>
    </div>
  );
}