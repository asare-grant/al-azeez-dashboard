// src/components/assessments/parent/ParentAssessmentDashboard.tsx

import {
  Award,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";

import type {
  ParentAssessmentDashboardProps,
  ParentAssessmentRecentResult,
} from "./types";

function formatDate(
  value: Date | string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatScore(
  value: number | null,
) {
  if (value === null) {
    return "—";
  }

  return `${Number(
    value.toFixed(1),
  )}%`;
}

export default function ParentAssessmentDashboard({
  children,
}: ParentAssessmentDashboardProps) {
  const totalAvailable =
    children.reduce(
      (total, child) =>
        total + child.available,
      0,
    );

  const totalCompleted =
    children.reduce(
      (total, child) =>
        total + child.completed,
      0,
    );

  const totalUpcoming =
    children.reduce(
      (total, child) =>
        total + child.upcoming,
      0,
    );

  const totalMissed =
    children.reduce(
      (total, child) =>
        total + child.missed,
      0,
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <ParentAssessmentHero
          childCount={children.length}
          availableCount={totalAvailable}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetric
            label="Available"
            value={totalAvailable}
            description="Ready for your children"
            icon={BookOpenCheck}
          />

          <DashboardMetric
            label="Upcoming"
            value={totalUpcoming}
            description="Scheduled assessments"
            icon={CalendarClock}
          />

          <DashboardMetric
            label="Completed"
            value={totalCompleted}
            description="Submitted and marked"
            icon={CheckCircle2}
          />

          <DashboardMetric
            label="Missed"
            value={totalMissed}
            description="Assessments not attempted"
            icon={CircleAlert}
          />
        </div>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="border-b border-slate-100 pb-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Children Overview
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Assessment performance
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor available assessments,
              completed work, missed deadlines
              and recent performance for each
              child.
            </p>
          </div>

          {children.length === 0 ? (
            <ParentAssessmentEmptyState />
          ) : (
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {children.map(
                (childSummary) => (
                  <ChildAssessmentCard
                    key={
                      childSummary.child.id
                    }
                    summary={
                      childSummary
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ParentAssessmentHero({
  childCount,
  availableCount,
}: {
  childCount: number;
  availableCount: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,0.24)] sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
            <GraduationCap className="h-4 w-4" />
            Parent Assessment Centre
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Follow every learning milestone
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Keep track of your children&apos;s
            online assessments, recent scores
            and upcoming academic activities
            from one secure dashboard.
          </p>
        </div>

        <div className="grid min-w-[280px] grid-cols-2 gap-3">
          <HeroMetric
            icon={Users}
            value={childCount}
            label={
              childCount === 1
                ? "Child"
                : "Children"
            }
          />

          <HeroMetric
            icon={BookOpenCheck}
            value={availableCount}
            label="Ready Now"
          />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-4 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function DashboardMetric({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: typeof BookOpenCheck;
}) {
  return (
    <div className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function ChildAssessmentCard({
  summary,
}: {
  summary: ParentAssessmentDashboardProps["children"][number];
}) {
  const childName =
    `${summary.child.name} ${summary.child.surname}`;

  const initials =
    `${summary.child.name.charAt(0)}${summary.child.surname.charAt(0)}`.toUpperCase();

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="relative overflow-hidden bg-slate-950 p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-500/20 blur-2xl" />

        <div className="relative flex items-center gap-4">
          {summary.child.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={summary.child.img}
              alt={childName}
              className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="truncate text-xl font-black">
              {childName}
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-300">
              {summary.child.className}
            </p>
          </div>

          <div className="ml-auto text-right">
            <p className="text-2xl font-black text-blue-300">
              {formatScore(
                summary.averageScore,
              )}
            </p>

            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Average
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ChildMetric
            label="Available"
            value={summary.available}
          />

          <ChildMetric
            label="Upcoming"
            value={summary.upcoming}
          />

          <ChildMetric
            label="Completed"
            value={summary.completed}
          />

          <ChildMetric
            label="Missed"
            value={summary.missed}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">
                Recent results
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Latest completed assessments
              </p>
            </div>

            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>

          {summary.recentResults.length ===
          0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm font-bold text-slate-500">
                No completed assessment
                results yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {summary.recentResults.map(
                (result) => (
                  <RecentResultRow
                    key={result.attemptId}
                    result={result}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ChildMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function RecentResultRow({
  result,
}: {
  result: ParentAssessmentRecentResult;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Award className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-slate-900">
          {result.title}
        </p>

        <p className="mt-1 truncate text-xs font-semibold text-slate-500">
          {result.subject} •{" "}
          {formatDate(result.date)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-black text-blue-700">
          {formatScore(
            result.percentage,
          )}
        </p>

        <p className="mt-0.5 text-[10px] font-bold text-slate-400">
          {result.score}/
          {result.totalMarks}
        </p>
      </div>
    </div>
  );
}

function ParentAssessmentEmptyState() {
  return (
    <div className="mt-6 flex min-h-[340px] flex-col items-center justify-center rounded-[26px] border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-blue-600 shadow-lg shadow-slate-200/60">
        <Users className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-black text-slate-950">
        No children connected
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        No student records are currently
        connected to this parent account.
        Contact the school administrator for
        assistance.
      </p>
    </div>
  );
}