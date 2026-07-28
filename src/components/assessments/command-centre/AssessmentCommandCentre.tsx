import {
  Activity,
  CalendarClock,
  CheckCircle2,
  FileEdit,
  Gauge,
  Layers3,
} from "lucide-react";

import AssessmentCommandFilters from "./AssessmentCommandFilters";
import AssessmentCommandHeader from "./AssessmentCommandHeader";
import AssessmentDesktopTable from "./AssessmentDesktopTable";
import AssessmentEmptyState from "./AssessmentEmptyState";
import AssessmentMobileCard from "./AssessmentMobileCard";
import AssessmentPagination from "./AssessmentPagination";

import type {
  AssessmentCommandCentreProps,
} from "./types";

export default function AssessmentCommandCentre({
  assessments,
  metrics,
  classes,
  subjects,
  page,
  totalPages,
  total,
  currentFilters,
}: AssessmentCommandCentreProps) {
  const hasFilters =
    Boolean(currentFilters.search) ||
    Boolean(currentFilters.status) ||
    Boolean(currentFilters.classId) ||
    Boolean(currentFilters.subjectId);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <AssessmentCommandHeader
          totalAssessments={
            metrics.total
          }
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DashboardMetric
            icon={Layers3}
            label="Total Assessments"
            value={String(metrics.total)}
            description="Across all statuses"
          />

          <DashboardMetric
            icon={Activity}
            label="Live Now"
            value={String(metrics.active)}
            description="Available to students"
          />

          <DashboardMetric
            icon={CalendarClock}
            label="Scheduled"
            value={String(
              metrics.scheduled
            )}
            description="Opening later"
          />

          <DashboardMetric
            icon={Gauge}
            label="Submission Rate"
            value={`${metrics.submissionRate}%`}
            description="Eligible submissions"
          />

          <DashboardMetric
            icon={CheckCircle2}
            label="Average Score"
            value={
              metrics.averageScore !==
              null
                ? `${metrics.averageScore}%`
                : "—"
            }
            description="Across submitted attempts"
          />
        </div>

        <div className="mt-6">
          <AssessmentCommandFilters
            classes={classes}
            subjects={subjects}
          />
        </div>

        <section className="mt-6 overflow-visible rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Assessment Workspace
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Manage assessments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {total}{" "}
                {total === 1
                  ? "assessment"
                  : "assessments"}{" "}
                found
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
              <FileEdit className="h-4 w-4" />
              Page {page} of{" "}
              {Math.max(
                1,
                totalPages
              )}
            </div>
          </div>

          {assessments.length === 0 ? (
            <div className="mt-5">
              <AssessmentEmptyState
                hasFilters={hasFilters}
              />
            </div>
          ) : (
            <>
              <AssessmentDesktopTable
                assessments={assessments}
              />

              <div className="mt-5 space-y-4 xl:hidden">
                {assessments.map(
                  (assessment) => (
                    <AssessmentMobileCard
                      key={assessment.id}
                      assessment={
                        assessment
                      }
                    />
                  )
                )}
              </div>

              <AssessmentPagination
                page={page}
                totalPages={totalPages}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function DashboardMetric({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Layers3;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-sm font-black text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}