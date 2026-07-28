import {
  FileQuestion,
} from "lucide-react";

export default function SubmissionReviewEmptyState() {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
        <FileQuestion className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-2xl font-black text-slate-950">
        No assessment attempt
      </h2>

      <p className="mt-2 max-w-lg text-sm leading-7 text-slate-500">
        This student has not started the
        assessment, so there are no responses
        available for review.
      </p>
    </section>
  );
}