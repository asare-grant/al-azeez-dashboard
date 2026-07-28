import {
  CheckCircle2,
  EyeOff,
} from "lucide-react";

export default function AssessmentResultHidden() {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-50 text-blue-600">
        <EyeOff className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-2xl font-black text-slate-950">
        Assessment submitted
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
        Your responses have been saved and
        marked successfully. Your teacher has
        chosen not to display the result
        immediately.
      </p>

      <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Submission complete
      </div>
    </section>
  );
}