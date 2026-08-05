import {
  BookOpen,
  TrendingUp,
} from "lucide-react";

import type {
  StudentSubjectPerformance as SubjectPerformance,
} from "@/lib/results";

function formatPercentage(
  value: number | null,
) {
  return value === null
    ? "—"
    : `${value.toFixed(1)}%`;
}

export default function StudentSubjectPerformance({
  subjects,
}: {
  subjects:
    SubjectPerformance[];
}) {
  if (subjects.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BookOpen className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Subject Intelligence
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            Performance by subject
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map(
          (subject) => (
            <article
              key={
                subject.subjectId
              }
              className="rounded-[24px] border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-950">
                    {
                      subject.subjectName
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      subject.resultCount
                    }{" "}
                    recorded result
                    {subject.resultCount ===
                    1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <SubjectMetric
                  label="Average"
                  value={formatPercentage(
                    subject.averagePercentage,
                  )}
                />

                <SubjectMetric
                  label="Highest"
                  value={formatPercentage(
                    subject.highestPercentage,
                  )}
                />

                <SubjectMetric
                  label="Latest"
                  value={formatPercentage(
                    subject.latestPercentage,
                  )}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                <span>
                  {
                    subject.assessmentCount
                  }{" "}
                  Assessments
                </span>

                <span>•</span>

                <span>
                  {
                    subject.examinationCount
                  }{" "}
                  Exams
                </span>

                <span>•</span>

                <span>
                  {
                    subject.assignmentCount
                  }{" "}
                  Assignments
                </span>
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}

function SubjectMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-lg font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}