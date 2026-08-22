// src/components/report-cards/viewer/ReportCardViewer.tsx
import {
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  Layers3,
  School,
  ShieldCheck,
  Sparkles,
  Trophy,
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

  canPublish?: boolean;

  backHref?: string;

  printHref?: string;

  reviewHref?: string;

  canReview?: boolean;
};

export default function ReportCardViewer({
  reportCard,
  canPublish = false,
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
          canPublish={canPublish}
          backHref={backHref}
          printHref={printHref}
          reviewHref={reviewHref}
          canReview={canReview}
        />

        <section className="relative overflow-hidden rounded-[30px] border border-slate-800/80 bg-[linear-gradient(125deg,#020617_0%,#081329_38%,#0d2552_70%,#172554_100%)] text-white shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:rounded-[36px]">
          {/* ================================================================ */}
          {/*                    BACKGROUND ATMOSPHERE                         */}
          {/* ================================================================ */}

          <div className="pointer-events-none absolute -right-40 -top-52 h-[540px] w-[540px] rounded-full bg-blue-500/[0.16] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-56 left-[22%] h-[460px] w-[460px] rounded-full bg-cyan-400/[0.08] blur-3xl" />

          <div className="pointer-events-none absolute right-[14%] top-8 h-36 w-36 rounded-full border border-white/[0.04]" />

          <div className="pointer-events-none absolute right-[18%] top-16 h-20 w-20 rounded-full border border-white/[0.03]" />

          {/* GRID TEXTURE */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.028]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />

          <div className="relative p-5 sm:p-7 lg:p-8 xl:p-9">
            {/* ================================================================ */}
            {/*                        COMMAND BAR                               */}
            {/* ================================================================ */}

            <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.10] px-3 py-1.5 backdrop-blur-xl">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />

                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200">
                    Administrative Academic Record
                  </span>
                </div>

                <HeroLifecycleBadge status={reportCard.status} />

                <HeroCalculationBadge status={reportCard.calculationStatus} />
              </div>

              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                <FileText className="h-3.5 w-3.5" />
                Report Record
                <span className="text-slate-600">/</span>#{reportCard.id}
              </div>
            </div>

            {/* ================================================================ */}
            {/*                         MAIN HERO                                */}
            {/* ================================================================ */}

            <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-stretch">
              {/* ============================================================= */}
              {/*                           LEFT                               */}
              {/* ============================================================= */}

              <div className="flex min-w-0 flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-300">
                    Student Academic Profile
                  </p>

                  <div className="mt-4 flex items-start gap-4 sm:gap-5">
                    {/* STUDENT AVATAR */}
                    <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.07] text-blue-200 shadow-[0_16px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:h-[76px] sm:w-[76px]">
                      <UserRound className="h-7 w-7" />

                      <div className="pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
                    </div>

                    <div className="min-w-0">
                      <h1 className="break-words text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl lg:text-[2.9rem] lg:leading-[1.02]">
                        {reportCard.student.name} {reportCard.student.surname}
                      </h1>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <AdminHeroChip>
                          {reportCard.student.studentId}
                        </AdminHeroChip>

                        <AdminHeroChip>{reportCard.class.name}</AdminHeroChip>

                        <AdminHeroChip accent>
                          {reportCard.term.name.replace(/_/g, " ")}
                        </AdminHeroChip>

                        <AdminHeroChip>{reportCard.academicYear}</AdminHeroChip>
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 max-w-3xl text-sm font-medium leading-7 text-slate-300 sm:text-[15px]">
                    Authoritative academic snapshot for reviewing subject
                    performance, calculated standing, attendance and official
                    school outcomes before completing the report-card lifecycle.
                  </p>
                </div>

                {/* ------------------------------------------------------------- */}
                {/*                     STUDENT RECORD STRIP                      */}
                {/* ------------------------------------------------------------- */}

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <AdminRecordDetail
                    icon={School}
                    label="Class"
                    value={reportCard.class.name}
                  />

                  <AdminRecordDetail
                    icon={GraduationCap}
                    label="Grade Level"
                    value={reportCard.grade.level}
                  />

                  <AdminRecordDetail
                    icon={CalendarDays}
                    label="Academic Period"
                    value={`${reportCard.term.name.replace(
                      /_/g,
                      " ",
                    )} • ${reportCard.academicYear}`}
                  />
                </div>
              </div>

              {/* ============================================================= */}
              {/*                       RIGHT SNAPSHOT                          */}
              {/* ============================================================= */}

              <div className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-2xl sm:p-5">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-blue-300" />

                        <p className="text-[9px] font-black uppercase tracking-[0.17em] text-blue-300">
                          Executive Snapshot
                        </p>
                      </div>

                      <h2 className="mt-1.5 text-lg font-black tracking-tight text-white">
                        Academic standing
                      </h2>

                      <p className="mt-1 text-[11px] font-medium text-slate-400">
                        Current calculated performance
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.06] text-blue-200">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>

                  {/* PRIMARY SCORE */}
                  <div className="mt-5 rounded-[20px] border border-blue-400/[0.12] bg-blue-400/[0.07] p-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                          Overall Average
                        </p>

                        <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-white">
                          {reportCard.averageScore === null
                            ? "—"
                            : `${reportCard.averageScore.toFixed(1)}%`}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
                          Overall Grade
                        </p>

                        <p className="mt-1 text-2xl font-black text-blue-200">
                          {reportCard.overallGrade ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* COMPLETION BAR */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.11em]">
                        <span className="text-slate-400">
                          Academic Completion
                        </span>

                        <span className="text-blue-200">
                          {reportCard.completedSubjectCount}/
                          {reportCard.subjectCount}
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"
                          style={{
                            width: `${
                              reportCard.subjectCount > 0
                                ? Math.min(
                                    100,
                                    Math.round(
                                      (reportCard.completedSubjectCount /
                                        reportCard.subjectCount) *
                                        100,
                                    ),
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECONDARY METRICS */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <ExecutiveMetric
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

                    <ExecutiveMetric
                      icon={BookOpenCheck}
                      label="Pass Rate"
                      value={
                        reportCard.passRate === null
                          ? "—"
                          : `${reportCard.passRate.toFixed(1)}%`
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================================ */}
            {/*                    ADMIN CONTROL INDICATORS                      */}
            {/* ================================================================ */}

            <div className="mt-7 grid gap-3 border-t border-white/[0.08] pt-5 md:grid-cols-3">
              <AdminIndicator
                icon={CheckCircle2}
                label="Academic Calculation"
                title={
                  reportCard.calculationStatus === "READY"
                    ? "Calculation ready"
                    : reportCard.calculationStatus === "PARTIAL"
                      ? "Partial calculations"
                      : "Calculation blocked"
                }
                description={
                  reportCard.calculationStatus === "READY"
                    ? "Required academic calculations have been completed."
                    : reportCard.calculationStatus === "PARTIAL"
                      ? "Some subject results remain incomplete."
                      : "The academic snapshot requires attention."
                }
                state={
                  reportCard.calculationStatus === "READY"
                    ? "success"
                    : reportCard.calculationStatus === "PARTIAL"
                      ? "warning"
                      : "error"
                }
              />

              <AdminIndicator
                icon={Layers3}
                label="Subject Records"
                title={`${reportCard.completedSubjectCount} of ${reportCard.subjectCount} complete`}
                description={
                  reportCard.completedSubjectCount === reportCard.subjectCount
                    ? "All expected subject records are available."
                    : `${
                        reportCard.subjectCount -
                        reportCard.completedSubjectCount
                      } subject record${
                        reportCard.subjectCount -
                          reportCard.completedSubjectCount ===
                        1
                          ? ""
                          : "s"
                      } still require completion.`
                }
                state={
                  reportCard.completedSubjectCount === reportCard.subjectCount
                    ? "success"
                    : "warning"
                }
              />

              <AdminIndicator
                icon={ShieldCheck}
                label="Lifecycle Status"
                title={
                  reportCard.status === "PUBLISHED"
                    ? "Officially published"
                    : reportCard.status === "ARCHIVED"
                      ? "Archived record"
                      : "Administrative draft"
                }
                description={
                  reportCard.status === "PUBLISHED"
                    ? "This record has completed the publication lifecycle."
                    : reportCard.status === "ARCHIVED"
                      ? "This report is retained as an archived academic record."
                      : "This report remains editable within the authorised workflow."
                }
                state={
                  reportCard.status === "PUBLISHED"
                    ? "success"
                    : reportCard.status === "ARCHIVED"
                      ? "neutral"
                      : "warning"
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

// function PremiumHeroDetail({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: typeof School;
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="group rounded-[20px] border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-xl transition duration-300 hover:border-blue-400/20 hover:bg-white/[0.075] sm:p-5">
//       <div className="flex items-center justify-between gap-3">
//         <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-blue-200">
//           <Icon className="h-4 w-4" />
//         </div>

//         <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80 opacity-60" />
//       </div>

//       <p className="mt-4 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 sm:text-[10px]">
//         {label}
//       </p>

//       <p className="mt-1 break-words text-sm font-black text-white sm:text-base">
//         {value}
//       </p>
//     </div>
//   );
// }


function AdminHeroChip({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] backdrop-blur ${
        accent
          ? "border-blue-400/20 bg-blue-400/10 text-blue-200"
          : "border-white/[0.09] bg-white/[0.055] text-slate-300"
      }`}
    >
      {children}
    </span>
  );
}


function AdminRecordDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-blue-200">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-xs font-black text-slate-200 sm:text-sm">
          {value}
        </p>
      </div>
    </div>
  );
}


function ExecutiveMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-blue-200">
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80" />
      </div>

      <p className="mt-3 break-words text-lg font-black tracking-[-0.025em] text-white">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}


function AdminIndicator({
  icon: Icon,
  label,
  title,
  description,
  state,
}: {
  icon: typeof CheckCircle2;

  label: string;
  title: string;
  description: string;

  state:
    | "success"
    | "warning"
    | "error"
    | "neutral";
}) {
  const iconClass = {
    success:
      "bg-emerald-400/10 text-emerald-300 border-emerald-400/10",

    warning:
      "bg-amber-400/10 text-amber-300 border-amber-400/10",

    error:
      "bg-red-400/10 text-red-300 border-red-400/10",

    neutral:
      "bg-slate-400/10 text-slate-300 border-slate-400/10",
  }[state];

  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-white/[0.07] bg-white/[0.035] p-3.5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-xs font-black text-white">
          {title}
        </p>

        <p className="mt-1 text-[10px] font-medium leading-4 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}


function HeroLifecycleBadge({
  status,
}: {
  status: ReportCardStatus;
}) {
  const config = {
    DRAFT: {
      label:
        "Draft Record",

      classes:
        "border-amber-400/20 bg-amber-400/10 text-amber-200",
    },

    PUBLISHED: {
      label:
        "Published",

      classes:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    },

    ARCHIVED: {
      label:
        "Archived",

      classes:
        "border-slate-400/20 bg-slate-400/10 text-slate-300",
    },
  } satisfies Record<
    ReportCardStatus,
    {
      label: string;
      classes: string;
    }
  >;

  const item =
    config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] ${item.classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {item.label}
    </span>
  );
}



function HeroCalculationBadge({
  status,
}: {
  status:
    ReportCardCalculationStatus;
}) {
  const config = {
    READY: {
      label:
        "Academically Ready",

      classes:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    },

    PARTIAL: {
      label:
        "Partial Results",

      classes:
        "border-amber-400/20 bg-amber-400/10 text-amber-200",
    },

    BLOCKED: {
      label:
        "Calculation Blocked",

      classes:
        "border-red-400/20 bg-red-400/10 text-red-200",
    },
  } satisfies Record<
    ReportCardCalculationStatus,
    {
      label: string;
      classes: string;
    }
  >;

  const item =
    config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] ${item.classes}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {item.label}
    </span>
  );
}