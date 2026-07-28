import {
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

type AssessmentInstructionCardProps = {
  instructions: string | null;
};

export default function AssessmentInstructionCard({
  instructions,
}: AssessmentInstructionCardProps) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-blue-600">
          <ClipboardList className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Before You Begin
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Assessment instructions
          </h2>
        </div>
      </div>

      {instructions ? (
        <div className="mt-6 whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm font-medium leading-7 text-slate-700">
          {instructions}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          Answer each question carefully and
          review your responses before final
          submission.
        </div>
      )}

      <div className="mt-6 space-y-3">
        <InstructionLine>
          Your answers will be saved as you work.
        </InstructionLine>

        <InstructionLine>
          Do not refresh or close the assessment unnecessarily.
        </InstructionLine>

        <InstructionLine>
          Submit only when you are satisfied with your responses.
        </InstructionLine>
      </div>
    </section>
  );
}

function InstructionLine({
  children,
}: {
 children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

      <p className="text-sm leading-6 text-slate-600">
        {children}
      </p>
    </div>
  );
}