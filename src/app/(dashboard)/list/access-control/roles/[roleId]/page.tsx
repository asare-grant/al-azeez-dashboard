import {
  ArrowLeft,
  Copy,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import Link from "next/link";

import { notFound } from "next/navigation";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import { getAccessControlRoleDetail } from "@/lib/access-control/admin-dashboard";

import RetireRoleButton from "@/components/access-control/RetireRoleButton";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default async function AccessRoleDetailPage({
  params,
}: {
  params: Promise<{
    roleId: string;
  }>;
}) {
  const { roleId } = await params;

  const numericRoleId = Number(roleId);

  if (!Number.isInteger(numericRoleId)) {
    notFound();
  }

  const data = await getAccessControlRoleDetail(numericRoleId);

  if (!data) {
    notFound();
  }

  const { role } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/list/access-control/roles"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Roles & Permissions
        </Link>

        <AccessControlTabs />

        {/* HERO */}

        <section className="relative mt-6 overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_35px_100px_rgba(15,23,42,0.24)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full bg-violet-500/20 blur-[100px]" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-violet-200">
                  {role.type} ROLE
                </span>

                {role.isProtected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-200">
                    <LockKeyhole className="h-3 w-3" />
                    Protected
                  </span>
                ) : null}
                {!role.isActive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
                    Inactive
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                {role.name}
              </h1>

              <p className="mt-2 font-mono text-xs text-blue-300">{role.key}</p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                {role.description ??
                  "Access role for the school management platform."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* CLONE */}

              <Link
                href={`/list/access-control/roles/new?clone=${role.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/15"
              >
                <Copy className="h-4 w-4" />
                Create from this role
              </Link>

              {/* CUSTOM ROLE MANAGEMENT */}

              {!role.isProtected && role.type === "CUSTOM" && role.isActive ? (
                <>
                  <Link
                    href={`/list/access-control/roles/${role.id}/edit`}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black text-white transition hover:bg-violet-500"
                  >
                    <Sparkles className="h-4 w-4" />
                    Edit Role
                  </Link>

                  <RetireRoleButton
                    roleId={role.id}
                    roleName={role.name}
                    assignedUsers={role.userCount}
                  />
                </>
              ) : null}
            </div>
          </div>
        </section>

        {/* METRICS */}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric
            icon={UsersRound}
            label="Assigned Users"
            value={role.userCount}
          />

          <Metric
            icon={KeyRound}
            label="Permissions"
            value={role.permissionCount}
          />

          <Metric
            icon={ShieldCheck}
            label="Status"
            value={role.isActive ? "Active" : "Inactive"}
          />
        </div>

        {/* PERMISSION VIEW */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Effective Access
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Granted permissions
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {data.permissionGroups.map((group) => {
              const assigned = group.permissions.filter(
                (permission) => permission.assigned,
              );

              if (assigned.length === 0) {
                return null;
              }

              return (
                <div key={group.group} className="p-5 sm:p-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    {formatGroup(group.group)}
                  </h3>

                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {assigned.map((permission) => (
                      <div
                        key={permission.id}
                        className="rounded-[16px] border border-emerald-100 bg-emerald-50/60 p-3"
                      >
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                          <div>
                            <p className="text-sm font-black text-slate-800">
                              {permission.name}
                            </p>

                            <p className="mt-1 font-mono text-[9px] text-slate-400">
                              {permission.key}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* USERS */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
              Role Membership
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Users with this role
            </h2>
          </div>

          {role.assignments.length === 0 ? (
            <div className="p-8 text-center text-sm font-bold text-slate-400">
              No users currently have this role.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {role.assignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/list/access-control/users/${assignment.user.id}`}
                  className="flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-black text-slate-900">
                      {assignment.user.displayName ??
                        assignment.user.username ??
                        "Unnamed user"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {assignment.user.email ?? assignment.source}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase text-slate-500">
                    {assignment.user.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;

  label: string;

  value: string | number;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-blue-600" />

      <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function formatGroup(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
