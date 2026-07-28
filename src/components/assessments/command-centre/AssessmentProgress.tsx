type AssessmentProgressProps = {
  submitted: number;
  total: number;
};

export default function AssessmentProgress({
  submitted,
  total,
}: AssessmentProgressProps) {
  const percentage =
    total > 0
      ? Math.min(
          100,
          Math.round(
            (submitted / total) * 100
          )
        )
      : 0;

  return (
    <div className="min-w-[150px]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black text-slate-700">
          {submitted}/{total}
        </span>

        <span className="text-[10px] font-bold text-slate-400">
          {percentage}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
        Students submitted
      </p>
    </div>
  );
}