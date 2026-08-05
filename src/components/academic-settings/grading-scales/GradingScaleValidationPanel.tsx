import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import {
  gradingScaleSchema,
} from "@/lib/academic-weightings/validation";

import type {
  GradingScaleInput,
} from "@/lib/academic-weightings/types";

export default function GradingScaleValidationPanel({
  scale,
}: {
  scale: GradingScaleInput;
}) {
  const validation =
    gradingScaleSchema.safeParse(
      scale,
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
              Grading scale is ready
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700">
              The score ranges are valid, complete and ready to save.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const issues =
    validation.error.issues;

  return (
    <aside className="rounded-[26px] border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="font-black text-amber-950">
            Review required
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-700">
            Correct these issues before saving or activating the grading scale.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {issues
          .slice(0, 8)
          .map(
            (issue, index) => (
              <div
                key={`${issue.path.join(".")}-${index}`}
                className="flex items-start gap-2 rounded-xl bg-white/70 p-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                <p className="text-xs font-semibold leading-5 text-amber-800">
                  {issue.message}
                </p>
              </div>
            ),
          )}
      </div>

      {issues.length > 8 ? (
        <p className="mt-3 text-xs font-bold text-amber-700">
          Plus {issues.length - 8} additional issues.
        </p>
      ) : null}
    </aside>
  );
}