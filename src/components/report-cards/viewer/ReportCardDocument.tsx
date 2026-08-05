type ReportCardDocumentProps = {
  reportCard: {
    student: {
      studentId: string;
      name: string;
      surname: string;
    };

    class: {
      name: string;
    };

    grade: {
      level: string;
    };

    term: {
      name: string;
    };

    academicYear: string;

    subjects: {
      id: number;
      subjectName: string;

      assignmentScore: number;
      assessmentScore: number;
      examinationScore: number;

      finalScore: number;

      grade: string;
      remark: string;

      subjectPosition: number | null;
      classAverage: number | null;
    }[];

    totalScore: number;
    averageScore: number | null;

    overallGrade: string | null;
    overallRemark: string | null;

    overallPosition: number | null;
    classStudentCount: number | null;

    daysSchoolOpened: number | null;
    daysPresent: number | null;
    daysAbsent: number | null;

    conduct: string | null;
    classTeacherRemark: string | null;
    headTeacherRemark: string | null;
    promotionStatus: string | null;
    nextTermBegins: Date | null;
  };
};

export default function ReportCardDocument({
  reportCard,
}: ReportCardDocumentProps) {
  return (
    <article
      id="report-card-document"
      className="mx-auto min-h-[297mm] w-full max-w-[210mm] bg-white p-[12mm] text-slate-950 shadow-[0_30px_80px_rgba(15,23,42,0.12)] print:min-h-0 print:max-w-none print:p-0 print:shadow-none"
    >
      <header className="border-b-4 border-blue-700 pb-5 text-center">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-700">
          Al-Azeez International School
        </p>

        <h1 className="mt-2 text-3xl font-black uppercase">
          Terminal Report Card
        </h1>

        <p className="mt-2 text-sm font-bold text-slate-500">
          Knowledge, Faith and Perseverance
        </p>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <Detail
          label="Student"
          value={`${reportCard.student.name} ${reportCard.student.surname}`}
        />

        <Detail
          label="Student ID"
          value={
            reportCard.student
              .studentId
          }
        />

        <Detail
          label="Class"
          value={
            reportCard.class.name
          }
        />

        <Detail
          label="Grade"
          value={
            reportCard.grade.level
          }
        />

        <Detail
          label="Academic Year"
          value={
            reportCard.academicYear
          }
        />

        <Detail
          label="Term"
          value={reportCard.term.name.replace(
            /_/g,
            " ",
          )}
        />
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-slate-300">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              <Th>Subject</Th>
              <Th>Assignment</Th>
              <Th>Assessment</Th>
              <Th>Exam</Th>
              <Th>Total</Th>
              <Th>Grade</Th>
              <Th>Position</Th>
              <Th>Remark</Th>
            </tr>
          </thead>

          <tbody>
            {reportCard.subjects.map(
              (subject) => (
                <tr
                  key={subject.id}
                  className="border-b border-slate-200 last:border-b-0"
                >
                  <Td strong>
                    {subject.subjectName}
                  </Td>

                  <Td>
                    {subject.assignmentScore.toFixed(
                      2,
                    )}
                  </Td>

                  <Td>
                    {subject.assessmentScore.toFixed(
                      2,
                    )}
                  </Td>

                  <Td>
                    {subject.examinationScore.toFixed(
                      2,
                    )}
                  </Td>

                  <Td strong>
                    {subject.finalScore.toFixed(
                      2,
                    )}
                  </Td>

                  <Td strong>
                    {subject.grade}
                  </Td>

                  <Td>
                    {subject.subjectPosition ??
                      "—"}
                  </Td>

                  <Td>
                    {subject.remark}
                  </Td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4">
        <SummaryBox
          label="Total Score"
          value={String(
            reportCard.totalScore,
          )}
        />

        <SummaryBox
          label="Average"
          value={
            reportCard.averageScore ===
            null
              ? "—"
              : `${reportCard.averageScore.toFixed(
                  2,
                )}%`
          }
        />

        <SummaryBox
          label="Overall Grade"
          value={
            reportCard.overallGrade ??
            "—"
          }
        />

        <SummaryBox
          label="Class Position"
          value={
            reportCard.overallPosition
              ? `${reportCard.overallPosition} of ${reportCard.classStudentCount ?? "—"}`
              : "—"
          }
        />
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <SummaryBox
          label="School Opened"
          value={
            reportCard.daysSchoolOpened?.toString() ??
            "—"
          }
        />

        <SummaryBox
          label="Present"
          value={
            reportCard.daysPresent?.toString() ??
            "—"
          }
        />

        <SummaryBox
          label="Absent"
          value={
            reportCard.daysAbsent?.toString() ??
            "—"
          }
        />
      </section>

      <section className="mt-6 space-y-4">
        <RemarkLine
          label="Conduct"
          value={
            reportCard.conduct
          }
        />

        <RemarkLine
          label="Class Teacher's Remark"
          value={
            reportCard.classTeacherRemark
          }
        />

        <RemarkLine
          label="Head Teacher's Remark"
          value={
            reportCard.headTeacherRemark
          }
        />

        <RemarkLine
          label="Promotion Status"
          value={
            reportCard.promotionStatus
          }
        />
      </section>

      <footer className="mt-10 grid grid-cols-2 gap-16 text-center text-xs">
        <SignatureLine label="Class Teacher" />

        <SignatureLine label="Head Teacher" />
      </footer>
    </article>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex border-b border-slate-200 pb-2">
      <span className="w-32 font-black text-slate-500">
        {label}:
      </span>

      <span className="font-bold">
        {value}
      </span>
    </div>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-slate-50 p-3 text-center">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>
    </div>
  );
}

function RemarkLine({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="border-b border-slate-300 pb-2 text-sm">
      <span className="font-black">
        {label}:{" "}
      </span>

      <span>
        {value || "—"}
      </span>
    </div>
  );
}

function SignatureLine({
  label,
}: {
  label: string;
}) {
  return (
    <div>
      <div className="border-b border-slate-500" />

      <p className="mt-2 font-black uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="border-r border-white/20 px-2 py-3 text-center font-black uppercase last:border-r-0">
      {children}
    </th>
  );
}

function Td({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <td
      className={`border-r border-slate-200 px-2 py-2.5 text-center last:border-r-0 ${
        strong
          ? "font-black"
          : "font-semibold"
      }`}
    >
      {children}
    </td>
  );
}