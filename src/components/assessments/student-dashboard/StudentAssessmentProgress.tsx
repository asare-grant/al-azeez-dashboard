type StudentAssessmentProgressProps = {
  answered: number;
  total: number;
};

export default function StudentAssessmentProgress({
  answered,
  total,
}: StudentAssessmentProgressProps) {
  const percentage =
    total > 0
      ? Math.min(
          100,
          Math.round(
            (answered / total) * 100
          )
        )
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black text-slate-700">
          {answered}/{total} answered
        </p>

        <p className="text-xs font-black text-blue-600">
          {percentage}%
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}