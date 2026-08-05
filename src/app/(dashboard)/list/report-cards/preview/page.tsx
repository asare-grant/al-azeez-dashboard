import {
  generateClassTermReportPreview,
} from "@/lib/academic-engine/server";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type ReportCardPreviewPageProps = {
  searchParams: Promise<{
    classId?: string;
    academicYear?: string;
    termId?: string;
  }>;
};

function parsePositiveInteger(
  value?: string,
) {
  const parsed =
    Number(value);

  return (
    Number.isInteger(parsed) &&
    parsed > 0
      ? parsed
      : null
  );
}

export default async function ReportCardPreviewPage({
  searchParams,
}: ReportCardPreviewPageProps) {
  const params =
    await searchParams;

  const classId =
    parsePositiveInteger(
      params.classId,
    );

  const termId =
    parsePositiveInteger(
      params.termId,
    );

  const academicYear =
    params.academicYear?.trim();

  if (
    !classId ||
    !termId ||
    !academicYear
  ) {
    return (
      <div className="m-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-black text-amber-950">
          Select report parameters
        </h1>

        <p className="mt-2 text-sm text-amber-700">
          Select a class, academic year and term to generate the report preview.
        </p>
      </div>
    );
  }

  const result =
    await generateClassTermReportPreview({
      classId,
      academicYear,
      termId,
    });

  if (!result.success) {
    return (
      <div className="m-4 rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-black text-red-950">
          Report unavailable
        </h1>

        <p className="mt-2 text-sm text-red-700">
          {result.message}
        </p>

        <div className="mt-4 space-y-2">
          {result.errors.map(
            (error, index) => (
              <p
                key={`${error.code}-${index}`}
                className="rounded-xl bg-white/70 p-3 text-xs font-semibold text-red-700"
              >
                {error.message}
              </p>
            ),
          )}
        </div>
      </div>
    );
  }

  const {
    report,
    loader,
  } = result;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <section className="rounded-[30px] bg-slate-950 p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
            Report Card Engine
          </p>

          <h1 className="mt-3 text-3xl font-black">
            {report.period.class?.name}
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            {report.period.academicYear}
            {" • "}
            {report.period.term.name.replace(
              /_/g,
              " ",
            )}
          </p>
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Students"
            value={String(
              loader.statistics
                .studentCount,
            )}
          />

          <Metric
            label="Subjects"
            value={String(
              loader.statistics
                .subjectCount,
            )}
          />

          <Metric
            label="Class Average"
            value={
              report.classAverage ===
              null
                ? "—"
                : `${report.classAverage}%`
            }
          />

          <Metric
            label="Pass Rate"
            value={
              report.passRate === null
                ? "—"
                : `${report.passRate}%`
            }
          />
        </div>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-slate-950">
            Student report preview
          </h2>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-3 text-left text-xs">
                    Position
                  </th>

                  <th className="p-3 text-left text-xs">
                    Student
                  </th>

                  <th className="p-3 text-left text-xs">
                    Subjects
                  </th>

                  <th className="p-3 text-left text-xs">
                    Total
                  </th>

                  <th className="p-3 text-left text-xs">
                    Average
                  </th>

                  <th className="p-3 text-left text-xs">
                    Grade
                  </th>

                  <th className="p-3 text-left text-xs">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.students.map(
                  (studentReport) => (
                    <tr
                      key={
                        studentReport.student
                          .id
                      }
                      className="border-b border-slate-100"
                    >
                      <td className="p-3 font-black">
                        {studentReport.overallPosition ??
                          "—"}
                      </td>

                      <td className="p-3">
                        <p className="font-black text-slate-900">
                          {
                            studentReport.student
                              .name
                          }{" "}
                          {
                            studentReport.student
                              .surname
                          }
                        </p>

                        <p className="text-xs text-slate-400">
                          {
                            studentReport.student
                              .studentId
                          }
                        </p>
                      </td>

                      <td className="p-3">
                        {
                          studentReport.summary
                            .completedSubjectCount
                        }
                        /
                        {
                          studentReport.summary
                            .subjectCount
                        }
                      </td>

                      <td className="p-3 font-bold">
                        {
                          studentReport.summary
                            .totalScore
                        }
                      </td>

                      <td className="p-3 font-black text-blue-700">
                        {studentReport.summary
                          .averageScore === null
                          ? "—"
                          : `${studentReport.summary.averageScore}%`}
                      </td>

                      <td className="p-3 font-black">
                        {studentReport.overallGrade ??
                          "—"}
                      </td>

                      <td className="p-3">
                        {
                          studentReport.calculationStatus
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </article>
  );
}