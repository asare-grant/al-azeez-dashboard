import type {
  AssessmentScoreBand,
} from "@/lib/assessments/types";

type AssessmentScoreDistributionProps = {
  bands: AssessmentScoreBand[];
};

export default function AssessmentScoreDistribution({
  bands,
}: AssessmentScoreDistributionProps) {
  const maximumCount =
    Math.max(
      1,
      ...bands.map(
        (band) => band.count
      )
    );

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
        Score Distribution
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Student performance bands
      </h2>

      <div className="mt-7 grid h-[300px] grid-cols-6 items-end gap-3">
        {bands.map((band) => {
          const height =
            band.count > 0
              ? Math.max(
                  12,
                  (band.count /
                    maximumCount) *
                    230
                )
              : 4;

          return (
            <div
              key={band.label}
              className="flex h-full flex-col items-center justify-end"
            >
              <p className="mb-2 text-sm font-black text-slate-800">
                {band.count}
              </p>

              <div
                className="w-full rounded-t-xl bg-blue-600 transition-all"
                style={{
                  height,
                }}
              />

              <p className="mt-3 text-center text-[10px] font-black text-slate-500">
                {band.label}
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                {band.percentage}%
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}