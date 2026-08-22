import { AccessReviewCampaignStatus } from "@prisma/client";

import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

import Link from "next/link";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import CreateAccessReviewCampaignDialog from "@/components/access-control/CreateAccessReviewCampaignDialog";

import {
  getAccountTrustLevel,
  getCurrentAccessActor,
} from "@/lib/access-control";

import prisma from "@/lib/prisma";

/* ========================================================================== */
/* CONFIG                                                                     */
/* ========================================================================== */

export const dynamic = "force-dynamic";

export const revalidate = 0;

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function AccessReviewsPage() {
  const accessActor = await getCurrentAccessActor();

  const canView = accessActor?.can("access_reviews.view") ?? false;

  const canCreate = accessActor?.can("access_reviews.create") ?? false;

  const actorTrust = accessActor ? getAccountTrustLevel(accessActor.actor) : 0;

  const canCreateCampaign = Boolean(canCreate && actorTrust >= 1000);

  if (!canView) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px]">
          <AccessControlTabs />

          <div className="mt-6 rounded-[28px] border border-rose-100 bg-white p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-7 w-7 text-rose-300" />

            <h1 className="mt-4 text-xl font-black text-slate-900">
              Access Review Restricted
            </h1>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Your current access authority does not include permission to view
              certification campaigns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const campaigns = await prisma.accessReviewCampaign.findMany({
    include: {
      _count: {
        select: {
          items: true,
        },
      },

      items: {
        select: {
          decision: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const activeCount = campaigns.filter(
    (campaign) => campaign.status === AccessReviewCampaignStatus.ACTIVE,
  ).length;

  const draftCount = campaigns.filter(
    (campaign) => campaign.status === AccessReviewCampaignStatus.DRAFT,
  ).length;

  const completedCount = campaigns.filter(
    (campaign) => campaign.status === AccessReviewCampaignStatus.COMPLETED,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* HERO */}

        <section className="relative overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,0.25)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-[90px]" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Access Certification
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Access Review & Certification
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Formally review privileged and delegated authority, preserve
                point-in-time evidence and certify whether access should remain,
                change or be revoked.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/list/access-control/reviews/governance"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
              >
                <BarChart3 className="h-4 w-4 text-violet-300" />
                Governance Analytics
              </Link>

              <CreateAccessReviewCampaignDialog
                allowed={canCreateCampaign}
                restrictionReason={
                  !canCreate
                    ? "Requires access_reviews.create permission."
                    : actorTrust < 1000
                      ? "Campaign creation requires Super Admin authority."
                      : null
                }
              />
            </div>
          </div>
        </section>

        <AccessControlTabs />

        {/* METRICS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={ClipboardCheck}
            value={campaigns.length}
            label="Total Campaigns"
          />

          <Metric icon={Clock3} value={draftCount} label="Draft" />

          <Metric icon={CalendarClock} value={activeCount} label="Active" />

          <Metric
            icon={CheckCircle2}
            value={completedCount}
            label="Completed"
          />
        </div>

        {/* CAMPAIGNS */}

        <section className="mt-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-600">
              Certification Campaigns
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Review history
            </h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="mt-4 rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <ClipboardCheck className="mx-auto h-6 w-6 text-slate-300" />

              <p className="mt-4 text-sm font-black text-slate-700">
                No certification campaigns yet
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-400">
                Create your first campaign to begin formal privileged-access
                certification.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {campaigns.map((campaign) => {
                const reviewed = campaign.items.filter(
                  (item) => item.decision !== "PENDING",
                ).length;

                const total = campaign._count.items;

                const percent =
                  total > 0 ? Math.round((reviewed / total) * 100) : 0;

                return (
                  <Link
                    key={campaign.id}
                    href={`/list/access-control/reviews/${campaign.id}`}
                    className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_15px_45px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500">
                          {campaign.status}
                        </span>

                        <h3 className="mt-3 text-lg font-black text-slate-950 group-hover:text-blue-700">
                          {campaign.name}
                        </h3>

                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                          {readableScope(campaign.scope)}
                        </p>
                      </div>

                      <span className="text-xl font-black text-slate-900">
                        {percent}%
                      </span>
                    </div>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <SmallMetric label="Assignments" value={total} />

                      <SmallMetric label="Reviewed" value={reviewed} />

                      <SmallMetric label="Pending" value={total - reviewed} />
                    </div>

                    <p className="mt-4 text-[10px] text-slate-400">
                      Due{" "}
                      <span className="font-black text-slate-600">
                        {formatDate(campaign.dueAt)}
                      </span>
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof ClipboardCheck;

  value: number;

  label: string;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-blue-600" />

      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>

      <p className="mt-1 text-xs font-black text-slate-500">{label}</p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="rounded-[14px] bg-slate-50 p-3">
      <p className="text-lg font-black text-slate-900">{value}</p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function readableScope(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(value);
}
