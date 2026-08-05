import {
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

import {
  academicWeightingSchema,
} from "@/lib/academic-weightings/validation";

import type {
  AcademicWeightingInput,
} from "@/lib/academic-weightings/types";

export default function AcademicWeightingValidationPanel({
  weighting,
}: {
  weighting: AcademicWeightingInput;
}) {
  const validation =
    academicWeightingSchema.safeParse(
      weighting,
    );

  if (validation.success) {
    return (
      <aside className="rounded-[26px] border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <p className="font-black text-emerald-950">
              Configuration is ready
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700">
              All selections are valid and the weighting total equals 100%.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-[26px] border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div>
          <p className="font-black text-amber-950">
            Review required
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-700">
            Correct these issues before saving.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {validation.error.issues
          .slice(0, 8)
          .map(
            (issue, index) => (
              <p
                key={`${issue.path.join(".")}-${index}`}
                className="rounded-xl bg-white/70 p-3 text-xs font-semibold leading-5 text-amber-800"
              >
                {issue.message}
              </p>
            ),
          )}
      </div>
    </aside>
  );
}