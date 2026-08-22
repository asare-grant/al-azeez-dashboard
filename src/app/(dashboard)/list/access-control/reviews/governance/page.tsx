import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Crown,
  Gauge,
  History,
  PencilLine,
  ShieldCheck,
  ShieldX,
  TimerReset,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";

import Link from "next/link";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import { getAccessReviewGovernanceAnalytics } from "@/lib/access-control";

import ComplianceReportExportButton from "@/components/access-control/ComplianceReportExportButton";

import {
  getAccountTrustLevel,
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* CONFIG                                                                     */
/* ========================================================================== */

export const dynamic = "force-dynamic";

export const revalidate = 0;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type PageProps = {
  searchParams: Promise<{
    academicYear?: string;

    term?: string;

    months?: string;
  }>;
};

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function AccessReviewGovernancePage({
  searchParams,
}: PageProps) {
  const query = await searchParams;

  const months = Math.min(
    Math.max(Number.parseInt(query.months ?? "24", 10) || 24, 1),
    120,
  );

  let analytics;

  const accessActor = await getCurrentAccessActor();

  const actorTrust = accessActor ? getAccountTrustLevel(accessActor.actor) : 0;

  const canExport = Boolean(
    accessActor?.can("access_reviews.export") && actorTrust >= 800,
  );

  try {
    analytics = await getAccessReviewGovernanceAnalytics({
      academicYear: query.academicYear ?? null,

      term: query.term ?? null,

      months,
    });
  } catch {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          <AccessControlTabs />

          <div className="mt-6 rounded-[28px] border border-rose-100 bg-white p-10 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-8 w-8 text-rose-300" />

            <h1 className="mt-4 text-xl font-black text-slate-950">
              Governance Analytics Restricted
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Your current Access Control authority does not include permission
              to view certification analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    overview,
    decisions,
    exposure,
    reviewers,
    periods,
    recentCampaigns,
    filterOptions,
  } = analytics;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <Link
          href="/list/access-control/reviews"
          className="mb-4 inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Access Reviews
        </Link>

        {/* ================================================================ */}
        {/* HERO                                                             */}
        {/* ================================================================ */}

        <section className="relative overflow-hidden rounded-[36px] bg-slate-950 p-6 text-white shadow-[0_35px_110px_rgba(15,23,42,0.28)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-28 -top-28 h-[380px] w-[380px] rounded-full bg-violet-500/20 blur-[110px]" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-500/15 blur-[100px]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2">
              <BarChart3 className="h-3.5 w-3.5 text-violet-300" />

              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                Governance Intelligence
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Access Review Governance
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Long-term certification performance, privileged-access exposure,
              reviewer activity and compliance history across academic periods.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <ComplianceReportExportButton
                mode="PERIOD"
                academicYear={query.academicYear ?? null}
                term={query.term ?? null}
                allowed={canExport}
                label="Export Executive Report"
                restrictionReason={
                  !accessActor?.can("access_reviews.export")
                    ? "Requires access_reviews.export permission."
                    : actorTrust < 800
                      ? "Report export requires administrative security authority."
                      : null
                }
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <HeroStat
                label="Completion Rate"
                value={`${overview.completionRate}%`}
              />

              <HeroStat
                label="Campaigns"
                value={String(overview.totalCampaigns)}
              />

              <HeroStat
                label="Assignments Reviewed"
                value={String(overview.totalAssignmentsReviewed)}
              />

              <HeroStat
                label="Overdue"
                value={String(overview.overdueCampaigns)}
                danger={overview.overdueCampaigns > 0}
              />
            </div>
          </div>
        </section>

        <AccessControlTabs />

        {/* ================================================================ */}
        {/* FILTERS                                                          */}
        {/* ================================================================ */}

        <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <form className="grid gap-3 md:grid-cols-4">
            <select
              name="academicYear"
              defaultValue={query.academicYear ?? ""}
              className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 outline-none"
            >
              <option value="">All Academic Years</option>

              {filterOptions.academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              name="term"
              defaultValue={query.term ?? ""}
              className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 outline-none"
            >
              <option value="">All Terms</option>

              {filterOptions.terms.map((term) => (
                <option key={term} value={term}>
                  {readableEnum(term)}
                </option>
              ))}
            </select>

            <select
              name="months"
              defaultValue={String(months)}
              className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 outline-none"
            >
              <option value="12">Last 12 Months</option>

              <option value="24">Last 24 Months</option>

              <option value="36">Last 36 Months</option>

              <option value="60">Last 5 Years</option>

              <option value="120">Last 10 Years</option>
            </select>

            <button
              type="submit"
              className="h-11 rounded-[14px] bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-blue-700"
            >
              Apply Analytics Filters
            </button>
          </form>
        </section>

        {/* ================================================================ */}
        {/* PRIMARY METRICS                                                  */}
        {/* ================================================================ */}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Gauge}
            eyebrow="Governance"
            label="Completion Rate"
            value={`${overview.completionRate}%`}
            description="Completed formal campaigns among campaigns that entered certification."
            tone="blue"
          />

          <MetricCard
            icon={AlertTriangle}
            eyebrow="Compliance Risk"
            label="Overdue Campaigns"
            value={String(overview.overdueCampaigns)}
            description="Active campaigns that have passed their certification deadline."
            tone={overview.overdueCampaigns > 0 ? "rose" : "emerald"}
          />

          <MetricCard
            icon={Clock3}
            eyebrow="Efficiency"
            label="Average Completion"
            value={
              overview.averageCompletionHours === null
                ? "—"
                : formatDuration(overview.averageCompletionHours)
            }
            description="Average time from campaign start until formal completion."
            tone="violet"
          />

          <MetricCard
            icon={Crown}
            eyebrow="High Trust"
            label="Pending Exposure"
            value={String(exposure.currentlyPendingHighTrust)}
            description="High-trust or protected assignments still awaiting a formal decision."
            tone={exposure.currentlyPendingHighTrust > 0 ? "amber" : "emerald"}
          />
        </section>

        {/* ================================================================ */}
        {/* DECISION DISTRIBUTION                                             */}
        {/* ================================================================ */}

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                  Decision Intelligence
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Certification outcomes
                </h2>
              </div>

              <TrendingUp className="h-5 w-5 text-slate-300" />
            </div>

            <div className="mt-6 space-y-5">
              <DecisionBar
                icon={CheckCircle2}
                label="Certified"
                value={decisions.certified}
                percent={decisions.certifiedRate}
                tone="emerald"
              />

              <DecisionBar
                icon={PencilLine}
                label="Modified"
                value={decisions.modified}
                percent={decisions.modifiedRate}
                tone="amber"
              />

              <DecisionBar
                icon={ShieldX}
                label="Revoked"
                value={decisions.revoked}
                percent={decisions.revokedRate}
                tone="rose"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniMetric label="Captured" value={decisions.total} />

              <MiniMetric label="Reviewed" value={decisions.reviewed} />

              <MiniMetric label="Pending" value={decisions.pending} />

              <MiniMetric
                label="Review Rate"
                value={`${percentage(decisions.reviewed, decisions.total)}%`}
              />
            </div>
          </div>

          {/* EXPOSURE */}

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-600">
              Authority Exposure
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Sensitive access reviewed
            </h2>

            <div className="mt-6 space-y-3">
              <ExposureRow
                icon={Crown}
                label="High-trust assignments"
                value={exposure.highTrustItems}
                tone="violet"
              />

              <ExposureRow
                icon={ShieldCheck}
                label="Protected assignments"
                value={exposure.protectedItems}
                tone="amber"
              />

              <ExposureRow
                icon={TimerReset}
                label="Temporary assignments"
                value={exposure.temporaryItems}
                tone="blue"
              />

              <ExposureRow
                icon={AlertTriangle}
                label="Pending high-trust"
                value={exposure.currentlyPendingHighTrust}
                tone={
                  exposure.currentlyPendingHighTrust > 0 ? "rose" : "emerald"
                }
              />
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* REVIEWERS                                                        */}
        {/* ================================================================ */}

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
              Reviewer Performance
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Certification activity
            </h2>

            <p className="mt-1 text-xs leading-6 text-slate-400">
              Formal review decisions attributed to each recorded reviewer.
            </p>
          </div>

          {reviewers.length === 0 ? (
            <EmptyState message="No certification reviewer activity has been recorded for the selected period." />
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[850px] w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <TableHead>Reviewer</TableHead>

                    <TableHead>Reviews</TableHead>

                    <TableHead>Certified</TableHead>

                    <TableHead>Modified</TableHead>

                    <TableHead>Revoked</TableHead>

                    <TableHead>Avg. Decision Time</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {reviewers.map((reviewer) => (
                    <tr
                      key={reviewer.reviewerId}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <UserRoundCheck className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-black text-slate-800">
                              {reviewer.reviewerName}
                            </p>

                            <p className="mt-1 max-w-[180px] truncate font-mono text-[8px] text-slate-400">
                              {reviewer.reviewerId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <TableValue value={reviewer.totalReviews} />

                      <TableValue value={reviewer.certified} />

                      <TableValue value={reviewer.modified} />

                      <TableValue value={reviewer.revoked} />

                      <td className="py-4 text-xs font-black text-slate-600">
                        {reviewer.averageDecisionHours === null
                          ? "—"
                          : formatDuration(reviewer.averageDecisionHours)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ================================================================ */}
        {/* TERM COMPLIANCE HISTORY                                           */}
        {/* ================================================================ */}

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-violet-50 text-violet-600">
              <History className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-600">
                Permanent Compliance History
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950">
                Academic-period certification record
              </h2>
            </div>
          </div>

          {periods.length === 0 ? (
            <EmptyState message="No academic-period certification history exists for the selected filters." />
          ) : (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {periods.map((period) => (
                <article
                  key={period.key}
                  className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.13em] text-violet-600">
                        {period.academicYear}
                      </p>

                      <h3 className="mt-1 text-lg font-black text-slate-950">
                        {period.term}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-950">
                        {period.completionRate}%
                      </p>

                      <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                        Completion
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-violet-600"
                      style={{
                        width: `${period.completionRate}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    <HistoryMetric label="Campaigns" value={period.campaigns} />

                    <HistoryMetric label="Completed" value={period.completed} />

                    <HistoryMetric label="Overdue" value={period.overdue} />

                    <HistoryMetric label="Certified" value={period.certified} />

                    <HistoryMetric label="Modified" value={period.modified} />

                    <HistoryMetric label="Revoked" value={period.revoked} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ================================================================ */}
        {/* RECENT CAMPAIGN HISTORY                                           */}
        {/* ================================================================ */}

        <section className="mt-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />

            <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
              Campaign History
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Recent certification records
          </h2>

          {recentCampaigns.length === 0 ? (
            <EmptyState message="No access review campaigns exist for the selected analytics period." />
          ) : (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {recentCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/list/access-control/reviews/${campaign.id}`}
                  className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(15,23,42,0.07)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={campaign.status} />

                        {campaign.overdue ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-rose-700">
                            Overdue
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 text-base font-black text-slate-950 transition group-hover:text-blue-700">
                        {campaign.name}
                      </h3>

                      <p className="mt-1 text-[10px] font-semibold text-slate-400">
                        {campaign.academicYear ?? "No academic year"} ·{" "}
                        {campaign.term
                          ? readableEnum(campaign.term)
                          : "No term"}
                      </p>
                    </div>

                    <p className="text-2xl font-black text-slate-950">
                      {campaign.progress}%
                    </p>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${campaign.progress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <MiniMetric label="Pending" value={campaign.pending} />

                    <MiniMetric label="Certified" value={campaign.certified} />

                    <MiniMetric label="Modified" value={campaign.modified} />

                    <MiniMetric label="Revoked" value={campaign.revoked} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* UI HELPERS                                                                 */
/* ========================================================================== */

function HeroStat({
  label,
  value,
  danger = false,
}: {
  label: string;

  value: string;

  danger?: boolean;
}) {
  return (
    <div className="min-w-[130px] rounded-[18px] border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
      <p
        className={`text-xl font-black ${
          danger ? "text-rose-300" : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  eyebrow,
  label,
  value,
  description,
  tone,
}: {
  icon: typeof Gauge;

  eyebrow: string;

  label: string;

  value: string;

  description: string;

  tone: "blue" | "emerald" | "violet" | "amber" | "rose";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",

    emerald: "bg-emerald-50 text-emerald-600",

    violet: "bg-violet-50 text-violet-600",

    amber: "bg-amber-50 text-amber-600",

    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-[15px] ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
        {eyebrow}
      </p>

      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-black text-slate-700">{label}</p>

      <p className="mt-3 text-[10px] leading-5 text-slate-400">{description}</p>
    </article>
  );
}

function DecisionBar({
  icon: Icon,
  label,
  value,
  percent,
  tone,
}: {
  icon: typeof CheckCircle2;

  label: string;

  value: number;

  percent: number;

  tone: "emerald" | "amber" | "rose";
}) {
  const bars = {
    emerald: "bg-emerald-500",

    amber: "bg-amber-500",

    rose: "bg-rose-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />

          <p className="text-xs font-black text-slate-700">{label}</p>
        </div>

        <p className="text-xs font-black text-slate-900">
          {value} <span className="text-slate-400">· {percent}%</span>
        </p>
      </div>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${bars[tone]}`}
          style={{
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}

function ExposureRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Crown;

  label: string;

  value: number;

  tone: "blue" | "violet" | "amber" | "emerald" | "rose";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",

    violet: "bg-violet-50 text-violet-600",

    amber: "bg-amber-50 text-amber-600",

    emerald: "bg-emerald-50 text-emerald-600",

    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-slate-100 bg-slate-50/60 p-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="min-w-0 flex-1 text-xs font-black text-slate-600">
        {label}
      </p>

      <span className="text-xl font-black text-slate-950">{value}</span>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;

  value: string | number;
}) {
  return (
    <div className="rounded-[13px] bg-slate-50 p-3">
      <p className="text-lg font-black text-slate-900">{value}</p>

      <p className="mt-1 text-[7px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function HistoryMetric({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div>
      <p className="text-lg font-black text-slate-900">{value}</p>

      <p className="text-[7px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="pb-3 pr-4 text-left text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
      {children}
    </th>
  );
}

function TableValue({ value }: { value: number }) {
  return (
    <td className="py-4 pr-4 text-xs font-black text-slate-700">{value}</td>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
      <p className="text-xs font-semibold text-slate-400">{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-slate-600">
      {readableEnum(status)}
    </span>
  );
}

function readableEnum(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDuration(hours: number) {
  if (hours < 24) {
    return `${hours.toFixed(hours < 10 ? 1 : 0)}h`;
  }

  const days = hours / 24;

  return `${days.toFixed(days < 10 ? 1 : 0)}d`;
}

function percentage(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}
