import {
  CalendarDays,
  FileText,
  GraduationCap,
  School,
  UserRound,
} from "lucide-react";

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

        <section className="relative overflow-hidden rounded-[30px] border border-slate-800/70 bg-[linear-gradient(120deg,#07111f_0%,#0b1730_48%,#172554_100%)] shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:rounded-[34px]">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-blue-500/15 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-48 left-[35%] h-[380px] w-[380px] rounded-full bg-cyan-400/10 blur-3xl" />

          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",

              backgroundSize: "42px 42px",
            }}
          />

          <div className="relative p-5 sm:p-7 lg:p-8 xl:p-9">
            {/* TOP ROW */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              {/* LEFT */}
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 backdrop-blur-xl">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-300" />

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Official Student Report
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300 sm:text-xs">
                    Terminal Academic Record
                  </p>

                  <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem] lg:leading-[1.05]">
                    {reportCard.student.name} {reportCard.student.surname}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-slate-300">
                      {reportCard.student.studentId}
                    </span>

                    <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-blue-200">
                      {reportCard.term.name.replace(/_/g, " ")}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-slate-300">
                      {reportCard.academicYear}
                    </span>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-[15px] sm:leading-7">
                    Complete academic performance, subject outcomes, attendance,
                    class standing and school remarks for the selected terminal
                    period.
                  </p>
                </div>
              </div>

              {/* RIGHT STATUS */}
              <div className="flex shrink-0 items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-3 pr-5 backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Report Status
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        reportCard.status === "PUBLISHED"
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                    />

                    <p className="text-sm font-black text-white">
                      {reportCard.status === "PUBLISHED"
                        ? "Published record"
                        : "Academic record"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILS */}
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 lg:grid-cols-4">
              <PremiumHeroDetail
                icon={School}
                label="Class"
                value={reportCard.class.name}
              />

              <PremiumHeroDetail
                icon={GraduationCap}
                label="Grade"
                value={reportCard.grade.level}
              />

              <PremiumHeroDetail
                icon={CalendarDays}
                label="Academic Period"
                value={`${reportCard.term.name.replace(
                  /_/g,
                  " ",
                )} • ${reportCard.academicYear}`}
              />

              <PremiumHeroDetail
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

function PremiumHeroDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-[20px] border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-xl transition duration-300 hover:border-blue-400/20 hover:bg-white/[0.075] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-blue-200">
          <Icon className="h-4 w-4" />
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80 opacity-60" />
      </div>

      <p className="mt-4 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 sm:text-[10px]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black text-white sm:text-base">
        {value}
      </p>
    </div>
  );
}