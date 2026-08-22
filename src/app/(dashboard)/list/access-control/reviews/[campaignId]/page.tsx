import { AccessReviewDecision } from "@prisma/client";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Crown,
  Filter,
  PencilLine,
  Search,
  ShieldCheck,
  ShieldX,
  TimerReset,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import { notFound } from "next/navigation";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import AccessReviewDecisionDialog from "@/components/access-control/AccessReviewDecisionDialog";

import StartAccessReviewCampaignButton from "@/components/access-control/StartAccessReviewCampaignButton";

import CompleteAccessReviewCampaignButton from "@/components/access-control/CompleteAccessReviewCampaignButton";

import CancelAccessReviewCampaignButton from "@/components/access-control/CancelAccessReviewCampaignButton";

import ComplianceReportExportButton from "@/components/access-control/ComplianceReportExportButton";

import prisma from "@/lib/prisma";

import {
  getAccountTrustLevel,
  getCurrentAccessActor,
  getRoleTrustLevel,
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
  params: Promise<{
    campaignId: string;
  }>;

  searchParams: Promise<{
    search?: string;

    decision?: string;

    page?: string;
  }>;
};

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function AccessReviewCampaignPage({
  params,
  searchParams,
}: PageProps) {
  const { campaignId: campaignIdParam } = await params;

  const query = await searchParams;

  const campaignId = Number.parseInt(campaignIdParam, 10);

  if (!Number.isInteger(campaignId) || campaignId <= 0) {
    notFound();
  }

  /* ------------------------------------------------------------------------ */
  /* ACCESS                                                                   */
  /* ------------------------------------------------------------------------ */

  const accessActor = await getCurrentAccessActor();

  const canView = accessActor?.can("access_reviews.view") ?? false;

  if (!canView) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1500px]">
          <AccessControlTabs />

          <div className="mt-6 rounded-[28px] border border-rose-100 bg-white p-10 text-center">
            <ShieldCheck className="mx-auto h-7 w-7 text-rose-300" />

            <h1 className="mt-4 text-xl font-black text-slate-900">
              Certification Workspace Restricted
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              You do not have permission to view access review campaigns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const actorTrust = accessActor ? getAccountTrustLevel(accessActor.actor) : 0;

  const canManage = Boolean(
    accessActor?.can("access_reviews.manage") && actorTrust >= 1000,
  );

  const canDecide = Boolean(
    accessActor?.can("access_reviews.decide") && actorTrust >= 1000,
  );

  const canExport = Boolean(
    accessActor?.can("access_reviews.export") && actorTrust >= 800,
  );

  /* ------------------------------------------------------------------------ */
  /* CAMPAIGN                                                                 */
  /* ------------------------------------------------------------------------ */

  const campaign = await prisma.accessReviewCampaign.findUnique({
    where: {
      id: campaignId,
    },
  });

  if (!campaign) {
    notFound();
  }

  /* ------------------------------------------------------------------------ */
  /* METRICS                                                                  */
  /* ------------------------------------------------------------------------ */

  const decisionGroups = await prisma.accessReviewItem.groupBy({
    by: ["decision"],

    where: {
      campaignId,
    },

    _count: {
      _all: true,
    },
  });

  const counts = new Map(
    decisionGroups.map((item) => [item.decision, item._count._all]),
  );

  const pendingCount = counts.get(AccessReviewDecision.PENDING) ?? 0;

  const certifiedCount = counts.get(AccessReviewDecision.CERTIFIED) ?? 0;

  const modifiedCount = counts.get(AccessReviewDecision.MODIFIED) ?? 0;

  const revokedCount = counts.get(AccessReviewDecision.REVOKED) ?? 0;

  const totalCount =
    pendingCount + certifiedCount + modifiedCount + revokedCount;

  const reviewedCount = totalCount - pendingCount;

  const progress =
    totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;

  const now = new Date();

  const overdue = campaign.status === "ACTIVE" && campaign.dueAt < now;

  /* ------------------------------------------------------------------------ */
  /* FILTERS                                                                  */
  /* ------------------------------------------------------------------------ */

  const search = query.search?.trim().slice(0, 100) ?? "";

  const decision = Object.values(AccessReviewDecision).includes(
    query.decision as AccessReviewDecision,
  )
    ? (query.decision as AccessReviewDecision)
    : null;

  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);

  const pageSize = 12;

  const itemWhere = {
    campaignId,

    ...(decision
      ? {
          decision,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              userDisplayName: {
                contains: search,

                mode: "insensitive" as const,
              },
            },

            {
              username: {
                contains: search,

                mode: "insensitive" as const,
              },
            },

            {
              roleName: {
                contains: search,

                mode: "insensitive" as const,
              },
            },

            {
              roleKey: {
                contains: search,

                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [items, filteredCount] = await prisma.$transaction([
    prisma.accessReviewItem.findMany({
      where: itemWhere,

      include: {
        assignment: {
          select: {
            id: true,

            expiresAt: true,

            assignedAt: true,
          },
        },
      },

      orderBy: [
        {
          decision: "asc",
        },

        {
          roleName: "asc",
        },

        {
          userDisplayName: "asc",
        },
      ],

      skip: (page - 1) * pageSize,

      take: pageSize,
    }),

    prisma.accessReviewItem.count({
      where: itemWhere,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* BACK */}

        <Link
          href="/list/access-control/reviews"
          className="mb-4 inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Access Reviews
        </Link>

        {/* HERO */}

        <section className="relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,0.28)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full bg-violet-500/20 blur-[100px]" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2">
                <StatusPill label={campaign.status} />

                {overdue ? (
                  <span className="rounded-full border border-rose-400/20 bg-rose-500/15 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-rose-300">
                    Overdue
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                {campaign.name}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                {campaign.description ??
                  "Formal certification of the captured access assignments."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-[10px] font-bold text-slate-400">
                <span>
                  Scope:{" "}
                  <strong className="text-slate-200">
                    {readableEnum(campaign.scope)}
                  </strong>
                </span>

                <span>
                  Due:{" "}
                  <strong
                    className={overdue ? "text-rose-300" : "text-slate-200"}
                  >
                    {formatDateTime(campaign.dueAt)}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              {campaign.status === "DRAFT" ? (
                <>
                  <ComplianceReportExportButton
                    mode="CAMPAIGN"
                    campaignId={campaign.id}
                    allowed={canExport}
                    label="Executive PDF"
                    restrictionReason={
                      !accessActor?.can("access_reviews.export")
                        ? "Requires access_reviews.export permission."
                        : actorTrust < 800
                          ? "Report export requires administrative security authority."
                          : null
                    }
                  />

                  <StartAccessReviewCampaignButton
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    itemCount={totalCount}
                    allowed={canManage}
                    restrictionReason={
                      !accessActor?.can("access_reviews.manage")
                        ? "Requires access_reviews.manage permission."
                        : actorTrust < 1000
                          ? "Starting campaigns requires Super Admin authority."
                          : null
                    }
                  />

                  <CancelAccessReviewCampaignButton
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    status={campaign.status}
                    reviewedCount={reviewedCount}
                    pendingCount={pendingCount}
                    allowed={canManage}
                    restrictionReason={
                      !accessActor?.can("access_reviews.manage")
                        ? "Requires access_reviews.manage permission."
                        : actorTrust < 1000
                          ? "Cancelling campaigns requires Super Admin authority."
                          : null
                    }
                  />
                </>
              ) : null}

              {campaign.status === "ACTIVE" ? (
                <>
                  <ComplianceReportExportButton
                    mode="CAMPAIGN"
                    campaignId={campaign.id}
                    allowed={canExport}
                    label="Executive PDF"
                    restrictionReason={
                      !accessActor?.can("access_reviews.export")
                        ? "Requires access_reviews.export permission."
                        : actorTrust < 800
                          ? "Report export requires administrative security authority."
                          : null
                    }
                  />
                  
                  <CompleteAccessReviewCampaignButton
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    pendingCount={pendingCount}
                    totalCount={totalCount}
                    allowed={canManage}
                    restrictionReason={
                      !accessActor?.can("access_reviews.manage")
                        ? "Requires access_reviews.manage permission."
                        : actorTrust < 1000
                          ? "Completing campaigns requires Super Admin authority."
                          : pendingCount > 0
                            ? `${pendingCount} pending review item${
                                pendingCount === 1 ? "" : "s"
                              } must be resolved first.`
                            : null
                    }
                  />

                  <CancelAccessReviewCampaignButton
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    status={campaign.status}
                    reviewedCount={reviewedCount}
                    pendingCount={pendingCount}
                    allowed={canManage}
                    restrictionReason={
                      !accessActor?.can("access_reviews.manage")
                        ? "Requires access_reviews.manage permission."
                        : actorTrust < 1000
                          ? "Cancelling campaigns requires Super Admin authority."
                          : null
                    }
                  />
                </>
              ) : null}
            </div>
          </div>
        </section>

        <AccessControlTabs />

        {campaign.status === "COMPLETED" ? (
          <div className="mt-6 flex items-start gap-3 rounded-[20px] border border-emerald-100 bg-emerald-50 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

            <div>
              <p className="text-sm font-black text-emerald-900">
                Certification Complete
              </p>

              <p className="mt-1 text-xs leading-6 text-emerald-700">
                This campaign is closed and immutable. All captured assignments
                received a formal certification decision
                {campaign.completedAt
                  ? ` before closure on ${formatDateTime(
                      campaign.completedAt,
                    )}.`
                  : "."}
              </p>
            </div>
          </div>
        ) : null}

        {campaign.status === "CANCELLED" ? (
          <div className="mt-6 flex items-start gap-3 rounded-[20px] border border-rose-100 bg-rose-50 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

            <div>
              <p className="text-sm font-black text-rose-900">
                Campaign Cancelled
              </p>

              <p className="mt-1 text-xs leading-6 text-rose-700">
                This certification campaign has been terminated. All review
                decisions and historical evidence recorded before cancellation
                remain preserved
                {campaign.cancelledAt
                  ? ` as of ${formatDateTime(campaign.cancelledAt)}.`
                  : "."}
              </p>
            </div>
          </div>
        ) : null}

        {/* PROGRESS */}

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
                Certification Progress
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {progress}% reviewed
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {reviewedCount} of {totalCount} captured assignments have a
                formal decision.
              </p>
            </div>

            <div className="text-4xl font-black tracking-tight text-slate-950">
              {progress}%
            </div>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </section>

        {/* METRICS */}

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReviewMetric
            icon={Clock3}
            label="Pending"
            value={pendingCount}
            tone="slate"
          />

          <ReviewMetric
            icon={CheckCircle2}
            label="Certified"
            value={certifiedCount}
            tone="emerald"
          />

          <ReviewMetric
            icon={PencilLine}
            label="Modified"
            value={modifiedCount}
            tone="amber"
          />

          <ReviewMetric
            icon={ShieldX}
            label="Revoked"
            value={revokedCount}
            tone="rose"
          />
        </section>

        {/* FILTERS */}

        <section className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />

            <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-600">
              Review Queue
            </p>
          </div>

          <form
            method="GET"
            className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                name="search"
                defaultValue={search}
                placeholder="Search user, role or role key..."
                className="h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              name="decision"
              defaultValue={decision ?? ""}
              className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 outline-none"
            >
              <option value="">All Decisions</option>

              <option value="PENDING">Pending</option>

              <option value="CERTIFIED">Certified</option>

              <option value="MODIFIED">Modified</option>

              <option value="REVOKED">Revoked</option>
            </select>

            <button
              type="submit"
              className="h-11 rounded-[14px] bg-slate-950 px-5 text-xs font-black text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </form>
        </section>

        {/* QUEUE */}

        {items.length === 0 ? (
          <div className="mt-5 rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <ClipboardCheck className="mx-auto h-7 w-7 text-slate-300" />

            <h3 className="mt-4 text-base font-black text-slate-700">
              No review items found
            </h3>

            <p className="mt-2 text-xs text-slate-400">
              No assignments match the current certification filters.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {items.map((item) => {
              const roleTrust = getRoleTrustLevel({
                key: item.roleKey,
              });

              const highTrust = roleTrust >= 800;

              const userName =
                item.userDisplayName ?? item.username ?? "Unknown User";

              const liveAssignment = Boolean(item.assignment);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_15px_45px_rgba(15,23,42,0.05)]"
                >
                  <div
                    className={`h-1.5 ${
                      item.decision === "CERTIFIED"
                        ? "bg-emerald-500"
                        : item.decision === "MODIFIED"
                          ? "bg-amber-500"
                          : item.decision === "REVOKED"
                            ? "bg-rose-500"
                            : highTrust
                              ? "bg-violet-500"
                              : "bg-blue-500"
                    }`}
                  />

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-blue-50 text-blue-600">
                          <UserRound className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">
                            {userName}
                          </p>

                          <p className="mt-1 text-[10px] font-semibold text-slate-400">
                            {item.username ? `@${item.username}` : item.userId}
                          </p>
                        </div>
                      </div>

                      <DecisionBadge decision={item.decision} />
                    </div>

                    <div className="mt-5 rounded-[18px] border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-900">
                          {item.roleName}
                        </p>

                        {highTrust ? (
                          <span className="rounded-md bg-violet-100 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-violet-700">
                            High Trust
                          </span>
                        ) : null}

                        {item.roleProtected ? (
                          <span className="rounded-md bg-amber-100 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-amber-700">
                            Protected
                          </span>
                        ) : null}
                      </div>

                      <code className="mt-1.5 block text-[9px] font-bold text-slate-400">
                        {item.roleKey}
                      </code>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <CardMeta
                        label="Snapshot Assigned"
                        value={formatDateTime(item.assignedAt)}
                      />

                      <CardMeta
                        label="Snapshot Expiry"
                        value={
                          item.expiresAt
                            ? formatDateTime(item.expiresAt)
                            : "Permanent"
                        }
                      />

                      <CardMeta
                        label="Live Assignment"
                        value={liveAssignment ? "Present" : "No Longer Present"}
                      />

                      <CardMeta
                        label="Source"
                        value={readableEnum(item.source)}
                      />
                    </div>

                    {item.reviewedAt ? (
                      <div className="mt-4 rounded-[14px] border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                          Review Evidence
                        </p>

                        <p className="mt-1 text-[10px] font-semibold text-slate-600">
                          Reviewed by {item.reviewedByName ?? "Administrator"} ·{" "}
                          {formatDateTime(item.reviewedAt)}
                        </p>

                        {item.reviewNote ? (
                          <p className="mt-2 text-[10px] leading-5 text-slate-500">
                            {item.reviewNote}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                          Certification Control
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {campaign.status !== "ACTIVE"
                            ? "Start the campaign before making certification decisions."
                            : item.decision !== "PENDING"
                              ? "This assignment already has a formal certification decision."
                              : "Certify, modify or revoke this captured access assignment."}
                        </p>
                      </div>

                      {campaign.status === "ACTIVE" &&
                      item.decision === "PENDING" ? (
                        <AccessReviewDecisionDialog
                          campaignId={campaign.id}
                          itemId={item.id}
                          userName={userName}
                          roleName={item.roleName}
                          currentExpiresAt={
                            item.assignment?.expiresAt?.toISOString() ?? null
                          }
                          allowed={canDecide}
                        />
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between rounded-[20px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-400">
              Page <span className="font-black text-slate-700">{page}</span> of{" "}
              <span className="font-black text-slate-700">{totalPages}</span>
            </p>

            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={buildPageHref({
                    campaignId,

                    page: page - 1,

                    search,

                    decision,
                  })}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600"
                >
                  Previous
                </Link>
              ) : null}

              {page < totalPages ? (
                <Link
                  href={buildPageHref({
                    campaignId,

                    page: page + 1,

                    search,

                    decision,
                  })}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function ReviewMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock3;

  label: string;

  value: number;

  tone: "slate" | "emerald" | "amber" | "rose";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",

    emerald: "bg-emerald-50 text-emerald-600",

    amber: "bg-amber-50 text-amber-600",

    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${tones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>

      <p className="mt-1 text-xs font-black text-slate-500">{label}</p>
    </article>
  );
}

function DecisionBadge({ decision }: { decision: AccessReviewDecision }) {
  const config =
    decision === "CERTIFIED"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : decision === "MODIFIED"
        ? "border-amber-100 bg-amber-50 text-amber-700"
        : decision === "REVOKED"
          ? "border-rose-100 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wider ${config}`}
    >
      {readableEnum(decision)}
    </span>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-blue-200">
      {readableEnum(label)}
    </span>
  );
}

function CardMeta({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-[14px] bg-slate-50 p-3">
      <p className="text-[7px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[10px] font-black leading-4 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function readableEnum(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(value);
}

function buildPageHref({
  campaignId,
  page,
  search,
  decision,
}: {
  campaignId: number;

  page: number;

  search: string;

  decision: AccessReviewDecision | null;
}) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (decision) {
    params.set("decision", decision);
  }

  params.set("page", String(page));

  return `/list/access-control/reviews/${campaignId}?${params.toString()}`;
}
