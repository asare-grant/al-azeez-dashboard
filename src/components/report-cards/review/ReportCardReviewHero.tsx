import Link from "next/link";

import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  CalendarDays,
  FileDown,
  GraduationCap,
  School,
  Trophy,
  UserRound,
} from "lucide-react";

import type {
  ReportCardReviewWorkspaceData,
} from "@/lib/report-cards/review-types";

import {
  ReportCardCalculationBadge,
  ReportCardLifecycleStatusBadge,
  ReportCardReviewStatusBadge,
} from "./ReportCardReviewStatusBadge";

type ReportCardReviewHeroProps = {
  reportCard:
    ReportCardReviewWorkspaceData;

  backHref: string;
  printHref: string;
};

function formatTermName(
  value: string,
) {
  return value.replace(
    /_/g,
    " ",
  );
}

export default function ReportCardReviewHero({
  reportCard,
  backHref,
  printHref,
}: ReportCardReviewHeroProps) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Report
        </Link>

        <Link
          href={printHref}
          target="_blank"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <FileDown className="h-4 w-4" />
          Print Preview
        </Link>
      </div>

      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-5 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:rounded-[34px] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_500px] xl:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <ReportCardLifecycleStatusBadge
                status={
                  reportCard.status
                }
              />

              <ReportCardReviewStatusBadge
                status={
                  reportCard.reviewStatus
                }
              />

              <ReportCardCalculationBadge
                status={
                  reportCard
                    .calculationStatus
                }
              />
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/10 text-blue-200">
                {reportCard.student.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      reportCard.student.img
                    }
                    alt={`${reportCard.student.name} ${reportCard.student.surname}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-7 w-7" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                  Report Card Review
                </p>

                <h1 className="mt-2 break-words text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  {reportCard.student.name}{" "}
                  {
                    reportCard.student
                      .surname
                  }
                </h1>

                <p className="mt-2 text-sm font-semibold text-slate-300">
                  {
                    reportCard.student
                      .studentId
                  }
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Review academic calculations,
              attendance, student development,
              remarks and approval readiness
              before this report card is
              published.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HeroDetail
              icon={School}
              label="Class"
              value={
                reportCard.class.name
              }
            />

            <HeroDetail
              icon={
                GraduationCap
              }
              label="Grade"
              value={
                reportCard.grade.level
              }
            />

            <HeroDetail
              icon={
                CalendarDays
              }
              label="Academic Period"
              value={`${formatTermName(
                reportCard.term.name,
              )} • ${
                reportCard.academicYear
              }`}
            />

            <HeroDetail
              icon={Trophy}
              label="Class Position"
              value={
                reportCard.overallPosition
                  ? `${
                      reportCard
                        .overallPosition
                    } of ${
                      reportCard
                        .classStudentCount ??
                      "—"
                    }`
                  : "Not calculated"
              }
            />

            <HeroDetail
              icon={Award}
              label="Overall Grade"
              value={
                reportCard.overallGrade ??
                "Not calculated"
              }
            />

            <HeroDetail
              icon={
                BookOpenCheck
              }
              label="Subjects Complete"
              value={`${reportCard.completedSubjectCount}/${reportCard.subjectCount}`}
            />
          </div>
        </div>
      </section>
    </>
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
    <article className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black text-white">
        {value}
      </p>
    </article>
  );
}