import {
  FileText,
} from "lucide-react";

export default function ReportCardEmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/70">
        <FileText className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        No report cards found
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Adjust the filters or select a class, academic year and term to generate
        the first set of report-card drafts.
      </p>
    </div>
  );
}