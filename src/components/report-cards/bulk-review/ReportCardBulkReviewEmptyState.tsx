import {
  ClipboardX,
} from "lucide-react";

export default function ReportCardBulkReviewEmptyState() {
  return (
    <div className="rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <ClipboardX className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-xl font-black text-slate-950">
        No report cards found
      </h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        Change the class, academic period,
        review stage or search filters to
        locate report cards requiring action.
      </p>
    </div>
  );
}