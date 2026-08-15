import {
  Activity,
  BadgeCheck,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import Link from "next/link";

import {
  getAccessControlOverview,
} from "@/lib/access-control/admin-dashboard";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AccessControlPage() {
  const data =
    await getAccessControlOverview();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* HERO */}

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.28)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-28 h-[380px] w-[380px] rounded-full bg-blue-500/20 blur-[95px]" />

            <div className="absolute -bottom-32 left-[30%] h-[340px] w-[340px] rounded-full bg-cyan-400/10 blur-[100px]" />

            <div className="absolute left-[-110px] top-1/2 h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-violet-500/10 blur-[95px]" />

            <div
              className="absolute inset-0 opacity-[0.055]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)
                `,

                backgroundSize:
                  "44px 44px",
              }}
            />
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 backdrop-blur-xl sm:text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />

                  Identity & Access
                </div>

                <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  Access Control Centre
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Manage school identities, role assignments, privileged access
                  and security policy from one controlled administrative hub.
                </p>

                <div className="mt-7 flex flex-wrap gap-2.5">
                  <HeroPill
                    label="Role-Based Access"
                  />

                  <HeroPill
                    label="Permission Driven"
                  />

                  <HeroPill
                    label="Audit Ready"
                  />

                  <HeroPill
                    label="Secure Administration"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
                <HeroMetric
                  icon={
                    Users
                  }
                  label="Users"
                  value={
                    data.metrics
                      .totalUsers
                  }
                />

                <HeroMetric
                  icon={
                    KeyRound
                  }
                  label="Roles"
                  value={
                    data.metrics
                      .totalRoles
                  }
                />

                <HeroMetric
                  icon={
                    BadgeCheck
                  }
                  label="Active"
                  value={
                    data.metrics
                      .activeUsers
                  }
                />

                <HeroMetric
                  icon={
                    LockKeyhole
                  }
                  label="Assignments"
                  value={
                    data.metrics
                      .assignments
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* NAVIGATION */}

        <AccessControlTabs />

        {/* SUMMARY */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Active Accounts"
            value={
              data.metrics
                .activeUsers
            }
            description="Accounts currently allowed to operate."
          />

          <SummaryCard
            title="Pending"
            value={
              data.metrics
                .pendingUsers
            }
            description="Accounts awaiting activation or completion."
          />

          <SummaryCard
            title="Custom Roles"
            value={
              data.metrics
                .customRoles
            }
            description="School-defined access profiles."
          />

          <SummaryCard
            title="Expiring Access"
            value={
              data.metrics
                .expiringAssignments
            }
            description="Role assignments expiring within seven days."
          />
        </section>

        {/* LOWER CONTENT */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <RecentUsers
            users={
              data.recentUsers
            }
          />

          <RecentAccessActivity
            activity={
              data.recentActivity
            }
          />
        </div>
      </div>
    </div>
  );
}




function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof Users;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="min-w-[130px] rounded-[22px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-4 text-3xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function HeroPill({
  label,
}: {
  label:
    string;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
      {
        label
      }
    </span>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title:
    string;

  value:
    number;

  description:
    string;
}) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {
          title
        }
      </p>

      <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">
        {
          value
        }
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {
          description
        }
      </p>
    </article>
  );
}




function RecentUsers({
  users,
}: {
  users:
    Awaited<
      ReturnType<
        typeof getAccessControlOverview
      >
    >["recentUsers"];
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Identity Directory
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-950">
            Recently provisioned users
          </h2>
        </div>

        <Link
          href="/list/access-control/users"
          className="text-xs font-black text-blue-600 hover:text-blue-800"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {users.length ===
        0 ? (
          <EmptyState
            text="No RBAC users have been provisioned yet."
          />
        ) : (
          users.map(
            (
              user,
            ) => (
              <div
                key={
                  user.id
                }
                className="flex items-center gap-4 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <UserCog className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-slate-900">
                    {user.displayName ||
                      user.username ||
                      "Unnamed user"}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {user.roles
                      .map(
                        (
                          role,
                        ) =>
                          role.name,
                      )
                      .join(
                        ", ",
                      ) ||
                      user.legacyRole ||
                      "No role assigned"}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                  {
                    user.status
                  }
                </span>
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}




function RecentAccessActivity({
  activity,
}: {
  activity:
    Awaited<
      ReturnType<
        typeof getAccessControlOverview
      >
    >["recentActivity"];
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-600">
          <Activity className="h-4 w-4" />

          Security Activity
        </div>

        <h2 className="mt-2 text-xl font-black text-slate-950">
          Recent access changes
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {activity.length ===
        0 ? (
          <EmptyState
            text="No access-control activity has been recorded yet."
          />
        ) : (
          activity.map(
            (
              item,
            ) => (
              <div
                key={
                  item.id
                }
                className="p-5"
              >
                <p className="text-sm font-black text-slate-800">
                  {readableEnum(
                    item.action,
                  )}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {item.actorName ||
                    "System"}{" "}
                  •{" "}
                  {item.targetUser
                    ?.displayName ||
                    item.targetUser
                      ?.username ||
                    "Access policy"}
                </p>
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}

function EmptyState({
  text,
}: {
  text:
    string;
}) {
  return (
    <div className="p-8 text-center">
      <p className="text-sm font-bold text-slate-400">
        {
          text
        }
      </p>
    </div>
  );
}

function readableEnum(
  value:
    string,
) {
  return value
    .toLowerCase()
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}