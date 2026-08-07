import Image from "next/image";

import {
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  School,
  Trophy,
  UserRound,
} from "lucide-react";
import ReportCardDocumentActions from "@/lib/report-cards/document/ReportCardDocumentActions";

type ReportCardDocumentProps = {
  reportCard: {
    student: {
      studentId: string;
      name: string;
      surname: string;
      img: string | null;
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

function formatTermName(value: string) {
  return value.replace(/_/g, " ");
}

function formatDate(value: Date | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatScore(value: number | null, decimalPlaces = 1) {
  if (value === null) {
    return "—";
  }

  return Number(value.toFixed(decimalPlaces)).toString();
}

export default function ReportCardDocument({
  reportCard,
}: ReportCardDocumentProps) {
  const studentName = `${reportCard.student.name} ${reportCard.student.surname}`;

  return (
    <>
      <ReportCardDocumentActions
        fileName={`${studentName}-${formatTermName(
          reportCard.term.name,
        )}-${reportCard.academicYear}-report-card`}
      />

      <article
        id="report-card-document"
        className="
          relative
          mx-auto
          min-h-[297mm]
          w-full
          max-w-[210mm]
          overflow-hidden
          bg-white
          text-slate-950
          shadow-[0_30px_80px_rgba(15,23,42,0.12)]

          print:min-h-0
          print:max-w-none
          print:overflow-visible
          print:shadow-none
        "
      >
        {/* ================================================================ */}
        {/*                        TOP BRAND ACCENT                           */}
        {/* ================================================================ */}

        <div className="h-[5px] w-full bg-gradient-to-r from-blue-800 via-blue-600 to-amber-500 print:bg-blue-800" />

        <div className="p-[7mm] sm:p-[8mm] print:p-[6mm]">
          {/* ================================================================ */}
          {/*                            HEADER                                */}
          {/* ================================================================ */}

          <header className="relative border-b-2 border-slate-900 pb-3">
            <div className="grid grid-cols-[58px_minmax(0,1fr)_54px] items-center gap-3 sm:grid-cols-[64px_minmax(0,1fr)_58px]">
              {/* SCHOOL LOGO */}
              <div className="flex justify-start">
                <div className="relative h-[58px] w-[58px] overflow-hidden rounded-full bg-white sm:h-[62px] sm:w-[62px]">
                  <Image
                    src="/logo.jpg"
                    alt="Al-Azeez International School logo"
                    fill
                    sizes="64px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* SCHOOL IDENTITY */}
              <div className="min-w-0 text-center">
                <p className="text-[6.5px] font-black uppercase tracking-[0.24em] text-blue-700 sm:text-[7px]">
                  Official Academic Record
                </p>

                <h1 className="mt-0.5 text-[16px] font-black uppercase leading-[1.08] tracking-[-0.02em] text-slate-950 sm:text-[19px]">
                  Al-Azeez International School
                </h1>

                <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-[8px]">
                  Knowledge, Faith and Perseverance
                </p>

                <div className="mx-auto mt-2 inline-flex rounded-full bg-slate-950 px-3 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-white">
                  Terminal Report Card
                </div>
              </div>

              {/* STUDENT PHOTO */}
              <div className="flex justify-end">
                <div className="relative h-[62px] w-[52px] overflow-hidden rounded-[8px] border-2 border-white bg-slate-100 shadow-sm ring-1 ring-slate-300 print:shadow-none">
                  {reportCard.student.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={reportCard.student.img}
                      alt={studentName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                      <UserRound className="h-5 w-5" />

                      <span className="mt-1 text-[6px] font-black uppercase tracking-wide">
                        Student
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* ================================================================ */}
          {/*                      STUDENT INFORMATION                         */}
          {/* ================================================================ */}

          <section className="mt-3 overflow-hidden rounded-[10px] border border-slate-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2">
              <StudentDetail label="Student Name" value={studentName} />

              <StudentDetail
                label="Student ID"
                value={reportCard.student.studentId}
              />

              <StudentDetail label="Class" value={reportCard.class.name} />

              <StudentDetail label="Grade" value={reportCard.grade.level} />

              <StudentDetail
                label="Academic Year"
                value={reportCard.academicYear}
              />

              <StudentDetail
                label="Term"
                value={formatTermName(reportCard.term.name)}
              />
            </div>
          </section>

          {/* ================================================================ */}
          {/*                      ACADEMIC PERFORMANCE                        */}
          {/* ================================================================ */}

          <section className="mt-3">
            <SectionHeading
              icon={BookOpenCheck}
              title="Academic Performance"
              subtitle="Subject performance and terminal achievement"
            />

            <div className="mt-2.5 overflow-hidden rounded-[10px] border border-slate-300">
              <table className="w-full table-fixed border-collapse text-[8px] sm:text-[9px] print:text-[8px]">
                <thead>
                  <tr className="bg-slate-950 text-white">
                    <Th className="w-[22%] text-left">Subject</Th>

                    <Th>Assign.</Th>

                    <Th>Assess.</Th>

                    <Th>Exam</Th>

                    <Th>Total</Th>

                    <Th>Grade</Th>

                    <Th>Pos.</Th>

                    <Th className="w-[15%]">Remark</Th>
                  </tr>
                </thead>

                <tbody>
                  {reportCard.subjects.map((subject, index) => (
                    <tr
                      key={subject.id}
                      className={
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/80"
                      }
                    >
                      <Td strong align="left">
                        {subject.subjectName}
                      </Td>

                      <Td>{formatScore(subject.assignmentScore)}</Td>

                      <Td>{formatScore(subject.assessmentScore)}</Td>

                      <Td>{formatScore(subject.examinationScore)}</Td>

                      <Td strong>{formatScore(subject.finalScore)}</Td>

                      <Td strong>{subject.grade}</Td>

                      <Td>{subject.subjectPosition ?? "—"}</Td>

                      <Td>{subject.remark}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ================================================================ */}
          {/*                      PERFORMANCE SUMMARY                         */}
          {/* ================================================================ */}

          <section
            data-pdf-page-break="before"
            data-pdf-keep-together="true"
            className="mt-3 break-inside-avoid"
          >
            <SectionHeading
              icon={Trophy}
              title="Performance Summary"
              subtitle="Overall terminal academic standing"
            />

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 print:grid-cols-4">
              <PremiumSummaryBox
                icon={BookOpenCheck}
                label="Total Score"
                value={formatScore(reportCard.totalScore)}
              />

              <PremiumSummaryBox
                icon={Award}
                label="Average"
                value={
                  reportCard.averageScore === null
                    ? "—"
                    : `${formatScore(reportCard.averageScore)}%`
                }
              />

              <PremiumSummaryBox
                icon={GraduationCap}
                label="Overall Grade"
                value={reportCard.overallGrade ?? "—"}
              />

              <PremiumSummaryBox
                icon={Trophy}
                label="Class Position"
                value={
                  reportCard.overallPosition
                    ? `${reportCard.overallPosition} of ${
                        reportCard.classStudentCount ?? "—"
                      }`
                    : "—"
                }
              />
            </div>

            {reportCard.overallRemark ? (
              <div className="mt-2 rounded-[10px] border border-blue-100 bg-blue-50/60 px-4 py-2.5">
                <p className="text-[8px] font-black uppercase tracking-[0.14em] text-blue-700">
                  Overall Performance
                </p>

                <p className="mt-1 text-[10px] font-bold leading-5 text-slate-700">
                  {reportCard.overallRemark}
                </p>
              </div>
            ) : null}
          </section>

          {/* ================================================================ */}
          {/*                        ATTENDANCE                                 */}
          {/* ================================================================ */}

          <section
            data-pdf-keep-together="true"
            className="mt-5 break-inside-avoid"
          >
            <SectionHeading
              icon={CalendarDays}
              title="Attendance"
              subtitle="Terminal attendance record"
            />

            <div className="mt-3 grid grid-cols-3 gap-2">
              <CompactSummary
                label="School Opened"
                value={reportCard.daysSchoolOpened?.toString() ?? "—"}
              />

              <CompactSummary
                label="Days Present"
                value={reportCard.daysPresent?.toString() ?? "—"}
              />

              <CompactSummary
                label="Days Absent"
                value={reportCard.daysAbsent?.toString() ?? "—"}
              />
            </div>
          </section>

          {/* ================================================================ */}
          {/*                     DEVELOPMENT & REMARKS                        */}
          {/* ================================================================ */}

          <section
            data-pdf-keep-together="true"
            className="mt-5 break-inside-avoid"
          >
            <SectionHeading
              icon={CheckCircle2}
              title="Conduct & Remarks"
              subtitle="Personal development and school observations"
            />

            <div className="mt-3 overflow-hidden rounded-[10px] border border-slate-300">
              <RemarkRow label="Conduct" value={reportCard.conduct} />

              <RemarkRow
                label="Class Teacher's Remark"
                value={reportCard.classTeacherRemark}
              />

              <RemarkRow
                label="Head Teacher's Remark"
                value={reportCard.headTeacherRemark}
              />

              <RemarkRow
                label="Promotion Status"
                value={reportCard.promotionStatus}
                strong
              />

              <RemarkRow
                label="Next Term Begins"
                value={formatDate(reportCard.nextTermBegins)}
                last
              />
            </div>
          </section>

          {/* ================================================================ */}
          {/*                         SIGNATURES                                */}
          {/* ================================================================ */}

          <footer className="mt-7 break-inside-avoid">
            <div className="grid grid-cols-2 gap-10 px-4">
              <SignatureLine label="Class Teacher" />

              <SignatureLine label="Head Teacher" />
            </div>

            <div className="mt-4 border-t border-slate-200 pt-3 text-center">
              <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Al-Azeez International School • Official Terminal Report
              </p>

              <p className="mt-1 text-[7px] text-slate-400">
                This document contains the academic record of the student named
                above.
              </p>
            </div>
          </footer>
        </div>
      </article>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT DETAIL                                     */
/* -------------------------------------------------------------------------- */

function StudentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-[34px] items-center border-b border-slate-200 px-3 py-1.5 last:border-b-0 sm:[&:nth-child(odd)]:border-r print:[&:nth-child(odd)]:border-r">
      <span className="w-[96px] shrink-0 text-[7px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </span>

      <span className="min-w-0 break-words text-[9px] font-black text-slate-950">
        {value}
      </span>
    </div>
  );
}
/* -------------------------------------------------------------------------- */
/*                           SECTION HEADING                                  */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof School;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-blue-700 text-white">
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-950">
          {title}
        </h2>

        <p className="mt-0.5 text-[7px] font-semibold text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           SUMMARY BOX                                      */
/* -------------------------------------------------------------------------- */

function PremiumSummaryBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50/70 p-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm print:shadow-none">
          <Icon className="h-3 w-3" />
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
      </div>

      <p className="mt-2 text-lg font-black leading-none text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[6px] font-black uppercase tracking-[0.11em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          COMPACT SUMMARY                                   */
/* -------------------------------------------------------------------------- */

function CompactSummary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-2 text-center">
      <p className="text-[15px] font-black leading-none text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[6px] font-black uppercase tracking-[0.09em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           REMARK ROW                                       */
/* -------------------------------------------------------------------------- */

function RemarkRow({
  label,
  value,
  strong = false,
  last = false,
}: {
  label: string;
  value: string | null;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[125px_minmax(0,1fr)] ${
        !last ? "border-b border-slate-200" : ""
      }`}
    >
      <div className="bg-slate-50 px-3 py-2.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>

      <div
        className={`px-3 py-2.5 text-[9px] leading-4 text-slate-700 ${
          strong ? "font-black" : "font-semibold"
        }`}
      >
        {value || "—"}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          SIGNATURE LINE                                    */
/* -------------------------------------------------------------------------- */

function SignatureLine({ label }: { label: string }) {
  return (
    <div className="pt-4 text-center">
      <div className="mx-auto max-w-[150px] border-b border-slate-700" />

      <p className="mt-1.5 text-[7px] font-black uppercase tracking-[0.11em] text-slate-600">
        {label}
      </p>

      <p className="mt-0.5 text-[6px] text-slate-400">Signature / Date</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              TABLE                                         */
/* -------------------------------------------------------------------------- */

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-r border-white/15 px-1 py-2 text-center font-black uppercase tracking-[0.02em] last:border-r-0 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  strong = false,
  align = "center",
}: {
  children: React.ReactNode;
  strong?: boolean;
  align?: "left" | "center";
}) {
  return (
    <td
      className={`border-r border-t border-slate-200 px-1.5 py-1.5 last:border-r-0 ${
        align === "left" ? "text-left" : "text-center"
      } ${strong ? "font-black" : "font-semibold"}`}
    >
      {children}
    </td>
  );
}
