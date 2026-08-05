import { CalendarDays, GraduationCap, School, UserRound } from "lucide-react";

import type {
  ReportCardCalculationStatus,
  ReportCardStatus,
  TermName,
} from "@prisma/client";

import ReportCardRemarks from "./ReportCardRemarks";
import ReportCardSubjectTable from "./ReportCardSubjectTable";
import ReportCardSummary from "./ReportCardSummary";
import ReportCardToolbar from "./ReportCardToolbar";

type ReportCardViewerProps = {
  reportCard: {
    id: number;

    status: ReportCardStatus;

    calculationStatus: ReportCardCalculationStatus;

    academicYear: string;

    student: {
      id: string;
      studentId: string;
      name: string;
      surname: string;
    };

    class: {
      id: number;
      name: string;
    };

    grade: {
      id: number;
      level: string;
    };

    term: {
      id: number;
      name: TermName;
    };

    subjects: {
      id: number;
      subjectName: string;
      teacherName: string | null;

      assignmentPercentage: number | null;
      assignmentScore: number;

      assessmentPercentage: number | null;
      assessmentScore: number;

      examinationPercentage: number | null;
      examinationScore: number;

      finalScore: number;
      grade: string;
      remark: string;

      subjectPosition: number | null;
      classAverage: number | null;

      calculationStatus: ReportCardCalculationStatus;
    }[];

    subjectCount: number;
    completedSubjectCount: number;

    totalScore: number;
    averageScore: number | null;

    overallGrade: string | null;
    overallPosition: number | null;
    classStudentCount: number | null;

    passRate: number | null;

    daysSchoolOpened: number | null;
    daysPresent: number | null;
    daysAbsent: number | null;
    attendancePercentage: number | null;

    conduct: string | null;
    classTeacherRemark: string | null;
    headTeacherRemark: string | null;
    promotionStatus: string | null;
    nextTermBegins: Date | null;
  };

  isAdmin?: boolean;

  backHref?: string;

  printHref?: string;

  reviewHref?: string;

  canReview?: boolean;
};

export default function ReportCardViewer({
  reportCard,
  isAdmin = false,
  backHref,
  printHref,
  reviewHref,
  canReview = false,
}: ReportCardViewerProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <ReportCardToolbar
          reportCardId={reportCard.id}
          status={reportCard.status}
          calculationStatus={reportCard.calculationStatus}
          isAdmin={isAdmin}
          backHref={backHref}
          printHref={printHref}
          reviewHref={reviewHref}
          canReview={canReview}
        />

        <section className="relative overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                <GraduationCap className="h-4 w-4" />
                Terminal Report
              </div>

              <h1 className="mt-5 text-3xl font-black sm:text-4xl">
                {reportCard.student.name} {reportCard.student.surname}
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-300">
                {reportCard.student.studentId}
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                Complete academic performance for{" "}
                {reportCard.term.name.replace(/_/g, " ")} of the{" "}
                {reportCard.academicYear} academic year.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <HeroDetail
                icon={School}
                label="Class"
                value={reportCard.class.name}
              />

              <HeroDetail
                icon={GraduationCap}
                label="Grade"
                value={reportCard.grade.level}
              />

              <HeroDetail
                icon={CalendarDays}
                label="Term"
                value={reportCard.term.name.replace(/_/g, " ")}
              />

              <HeroDetail
                icon={UserRound}
                label="Attendance"
                value={
                  reportCard.attendancePercentage === null
                    ? "—"
                    : `${reportCard.attendancePercentage.toFixed(1)}%`
                }
              />
            </div>
          </div>
        </section>

        <div className="mt-6">
          <ReportCardSummary
            totalScore={reportCard.totalScore}
            averageScore={reportCard.averageScore}
            overallGrade={reportCard.overallGrade}
            overallPosition={reportCard.overallPosition}
            classStudentCount={reportCard.classStudentCount}
            completedSubjectCount={reportCard.completedSubjectCount}
            subjectCount={reportCard.subjectCount}
            passRate={reportCard.passRate}
          />
        </div>

        <div className="mt-6">
          <ReportCardSubjectTable subjects={reportCard.subjects} />
        </div>

        <div className="mt-6">
          <ReportCardRemarks
            conduct={reportCard.conduct}
            classTeacherRemark={reportCard.classTeacherRemark}
            headTeacherRemark={reportCard.headTeacherRemark}
            promotionStatus={reportCard.promotionStatus}
            nextTermBegins={reportCard.nextTermBegins}
          />
        </div>
      </div>
    </div>
  );
}

function HeroDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;

  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}
