import {
  ClipboardCheck,
  FilePenLine,
  GraduationCap,
} from "lucide-react";

import {
    calculateWeightTotal
} from "@/lib/academic-weightings/utils";

export default function AcademicWeightDistribution({
  assignmentWeight,
  assessmentWeight,
  examWeight,
}: {
  assignmentWeight: number;
  assessmentWeight: number;
  examWeight: number;
}) {
  const total =
    calculateWeightTotal({
      assignmentWeight,
      assessmentWeight,
      examWeight,
    });

  const valid =
    Math.abs(total - 100) <=
    0.01;

  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
            Weight Distribution
          </p>

          <h3 className="mt-2 text-lg font-black text-slate-950">
            Final-score composition
          </h3>
        </div>

        <div
          className={`rounded-2xl px-4 py-3 text-center ${
            valid
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <p className="text-2xl font-black">
            {total}%
          </p>

          <p className="text-[9px] font-black uppercase tracking-wide">
            Total
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <DistributionRow
          icon={FilePenLine}
          label="Assignment"
          value={assignmentWeight}
        />

        <DistributionRow
          icon={ClipboardCheck}
          label="Assessment"
          value={assessmentWeight}
        />

        <DistributionRow
          icon={GraduationCap}
          label="Examination"
          value={examWeight}
        />
      </div>
    </section>
  );
}

function DistributionRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FilePenLine;
  label: string;
  value: number;
}) {
  const safeValue =
    Math.min(
      100,
      Math.max(0, value),
    );

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
          <Icon className="h-4 w-4 text-blue-600" />

          {label}
        </span>

        <span className="text-sm font-black text-slate-950">
          {value}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width:
              `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}