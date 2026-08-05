import {
  Award,
  BarChart3,
  BookOpenCheck,
  Medal,
  TrendingUp,
  Trophy,
} from "lucide-react";

type ReportCardSummaryProps = {
  totalScore: number;
  averageScore: number | null;

  overallGrade: string | null;
  overallPosition: number | null;
  classStudentCount: number | null;

  completedSubjectCount: number;
  subjectCount: number;

  passRate: number | null;
};

export default function ReportCardSummary({
  totalScore,
  averageScore,
  overallGrade,
  overallPosition,
  classStudentCount,
  completedSubjectCount,
  subjectCount,
  passRate,
}: ReportCardSummaryProps) {
  const metrics = [
    {
      label:
        "Total Score",

      value:
        totalScore.toFixed(2),

      icon:
        BarChart3,
    },

    {
      label:
        "Average",

      value:
        averageScore === null
          ? "—"
          : `${averageScore.toFixed(
              2,
            )}%`,

      icon:
        TrendingUp,
    },

    {
      label:
        "Overall Grade",

      value:
        overallGrade ?? "—",

      icon:
        Award,
    },

    {
      label:
        "Class Position",

      value:
        overallPosition
          ? `${overallPosition} of ${classStudentCount ?? "—"}`
          : "—",

      icon:
        Trophy,
    },

    {
      label:
        "Subjects",

      value:
        `${completedSubjectCount}/${subjectCount}`,

      icon:
        BookOpenCheck,
    },

    {
      label:
        "Subject Pass Rate",

      value:
        passRate === null
          ? "—"
          : `${passRate.toFixed(
              1,
            )}%`,

      icon:
        Medal,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {metrics.map((metric) => {
        const Icon =
          metric.icon;

        return (
          <article
            key={metric.label}
            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>

            <p className="mt-4 text-xl font-black text-slate-950">
              {metric.value}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
              {metric.label}
            </p>
          </article>
        );
      })}
    </section>
  );
}