import type {
  ReportCardCalculationStatus,
} from "@prisma/client";

import {
  CalculationStatusBadge,
} from "../command-centre/ReportCardStatusBadge";

type ReportCardSubjectItem = {
  id: number;

  subjectName: string;

  teacherName:
    | string
    | null;

  assignmentPercentage:
    | number
    | null;

  assignmentScore:
    number;

  assessmentPercentage:
    | number
    | null;

  assessmentScore:
    number;

  examinationPercentage:
    | number
    | null;

  examinationScore:
    number;

  finalScore:
    number;

  grade: string;
  remark: string;

  subjectPosition:
    | number
    | null;

  classAverage:
    | number
    | null;

  calculationStatus:
    ReportCardCalculationStatus;
};

export default function ReportCardSubjectTable({
  subjects,
}: {
  subjects:
    ReportCardSubjectItem[];
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Academic Performance
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Subject results
        </h2>
      </div>

      <div className="overflow-x-auto">
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
                Final
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

                    {subject.teacherName ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {
                          subject.teacherName
                        }
                      </p>
                    ) : null}
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
                    <p className="font-black text-slate-800">
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
                    <p className="max-w-[220px] text-sm font-semibold text-slate-600">
                      {subject.remark}
                    </p>
                  </Cell>

                  <Cell>
                    <CalculationStatusBadge
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
    </section>
  );
}

function ScoreCell({
  percentage,
  weightedScore,
}: {
  percentage:
    | number
    | null;

  weightedScore:
    number;
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
              2,
            )}% raw`}
      </p>
    </Cell>
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