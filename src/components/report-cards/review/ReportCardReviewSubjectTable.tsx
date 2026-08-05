import type {
  ReportCardReviewWorkspaceData,
} from "@/lib/report-cards/review-types";

import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Subject =
  ReportCardReviewWorkspaceData["subjects"][number];

export default function ReportCardReviewSubjectTable({
  subjects,
}: {
  subjects: Subject[];
}) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/30 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Academic Review
        </p>

        <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
          Subject performance
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Review the weighted academic
          components and final subject
          outcomes.
        </p>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1250px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <Heading>
                Subject
              </Heading>

              <Heading>
                Assignment
              </Heading>

              <Heading>
                Assessment
              </Heading>

              <Heading>
                Examination
              </Heading>

              <Heading>
                Final Score
              </Heading>

              <Heading>
                Grade
              </Heading>

              <Heading>
                Position
              </Heading>

              <Heading>
                Class Avg.
              </Heading>

              <Heading>
                Remark
              </Heading>

              <Heading>
                Status
              </Heading>
            </tr>
          </thead>

          <tbody>
            {subjects.map(
              (subject) => (
                <tr
                  key={subject.id}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <Cell>
                    <p className="font-black text-slate-950">
                      {
                        subject.subjectName
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {subject.teacherName ??
                        "Teacher not assigned"}
                    </p>
                  </Cell>

                  <ScoreCell
                    percentage={
                      subject.assignmentPercentage
                    }
                    weightedScore={
                      subject.assignmentScore
                    }
                  />

                  <ScoreCell
                    percentage={
                      subject.assessmentPercentage
                    }
                    weightedScore={
                      subject.assessmentScore
                    }
                  />

                  <ScoreCell
                    percentage={
                      subject.examinationPercentage
                    }
                    weightedScore={
                      subject.examinationScore
                    }
                  />

                  <Cell>
                    <p className="text-lg font-black text-blue-700">
                      {subject.finalScore.toFixed(
                        2,
                      )}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="font-black text-slate-900">
                      {subject.grade}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="font-black text-slate-700">
                      {subject.subjectPosition ??
                        "—"}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="font-bold text-slate-700">
                      {subject.classAverage ===
                      null
                        ? "—"
                        : subject.classAverage.toFixed(
                            2,
                          )}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="max-w-[220px] text-sm font-semibold leading-5 text-slate-600">
                      {subject.remark}
                    </p>
                  </Cell>

                  <Cell>
                    <SubjectStatus
                      status={
                        subject.calculationStatus
                      }
                    />
                  </Cell>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      {/* RESPONSIVE CARDS */}
      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:hidden">
        {subjects.map(
          (subject) => (
            <SubjectMobileCard
              key={subject.id}
              subject={subject}
            />
          ),
        )}
      </div>
    </section>
  );
}

function SubjectMobileCard({
  subject,
}: {
  subject: Subject;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words font-black text-slate-950">
            {subject.subjectName}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {subject.teacherName ??
              "Teacher not assigned"}
          </p>
        </div>

        <SubjectStatus
          status={
            subject.calculationStatus
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MobileMetric
          label="Assignment"
          value={subject.assignmentScore.toFixed(
            2,
          )}
          subvalue={
            subject.assignmentPercentage ===
            null
              ? "No result"
              : `${subject.assignmentPercentage.toFixed(
                  1,
                )}% raw`
          }
        />

        <MobileMetric
          label="Assessment"
          value={subject.assessmentScore.toFixed(
            2,
          )}
          subvalue={
            subject.assessmentPercentage ===
            null
              ? "No result"
              : `${subject.assessmentPercentage.toFixed(
                  1,
                )}% raw`
          }
        />

        <MobileMetric
          label="Examination"
          value={subject.examinationScore.toFixed(
            2,
          )}
          subvalue={
            subject.examinationPercentage ===
            null
              ? "No result"
              : `${subject.examinationPercentage.toFixed(
                  1,
                )}% raw`
          }
        />

        <MobileMetric
          label="Final Score"
          value={subject.finalScore.toFixed(
            2,
          )}
          subvalue={`Grade ${subject.grade}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
        <MobileMetric
          label="Position"
          value={String(
            subject.subjectPosition ??
              "—",
          )}
        />

        <MobileMetric
          label="Class Average"
          value={
            subject.classAverage ===
            null
              ? "—"
              : subject.classAverage.toFixed(
                  2,
                )
          }
        />
      </div>

      <p className="mt-4 rounded-xl bg-white p-3 text-xs font-semibold leading-5 text-slate-600">
        {subject.remark}
      </p>
    </article>
  );
}

function ScoreCell({
  percentage,
  weightedScore,
}: {
  percentage:
    | number
    | null;
  weightedScore: number;
}) {
  return (
    <Cell>
      <p className="font-black text-slate-800">
        {weightedScore.toFixed(
          2,
        )}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {percentage === null
          ? "No result"
          : `${percentage.toFixed(
              1,
            )}% raw`}
      </p>
    </Cell>
  );
}

function SubjectStatus({
  status,
}: {
  status: string;
}) {
  if (status === "READY") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Ready
      </span>
    );
  }

  if (status === "PARTIAL") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-amber-700">
        <AlertTriangle className="h-3 w-3" />
        Partial
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-red-700">
      <XCircle className="h-3 w-3" />
      Blocked
    </span>
  );
}

function MobileMetric({
  label,
  value,
  subvalue,
}: {
  label: string;
  value: string;
  subvalue?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-slate-900">
        {value}
      </p>

      {subvalue ? (
        <p className="mt-1 text-[10px] text-slate-400">
          {subvalue}
        </p>
      ) : null}
    </div>
  );
}

function Heading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
      {children}
    </th>
  );
}

function Cell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="px-4 py-5 align-middle">
      {children}
    </td>
  );
}