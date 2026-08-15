import {
  Boxes,
  KeyRound,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import Link from "next/link";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import PermissionMatrix from "@/components/access-control/PermissionMatrix";

import RoleCard from "@/components/access-control/RoleCard";

import {
  getAccessControlRolesAndPermissions,
} from "@/lib/access-control/admin-dashboard";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function AccessControlRolesPage() {
  const data =
    await getAccessControlRolesAndPermissions();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* ====================================================== */}
        {/* HERO                                                   */}
        {/* ====================================================== */}

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.25)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-28 h-[380px] w-[380px] rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="absolute -bottom-32 left-[28%] h-[330px] w-[330px] rounded-full bg-blue-500/10 blur-[100px]" />

            <div
              className="absolute inset-0 opacity-[0.05]"
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

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-200 backdrop-blur-xl sm:text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />

                  Authorization Architecture
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  Roles & Permissions
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Understand and govern how responsibilities, capabilities and
                  administrative authority are distributed across the school
                  management platform.
                </p>
              </div>

              <Link
                href="/list/access-control/roles/new"
                className="group inline-flex h-12 w-fit items-center justify-center gap-2.5 rounded-2xl border border-violet-400/20 bg-violet-600 px-5 text-sm font-black text-white shadow-[0_16px_35px_rgba(124,58,237,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-500"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10">
                  <Plus className="h-4 w-4" />
                </span>

                Create Custom Role
              </Link>
            </div>
          </div>
        </section>

        <AccessControlTabs />

        {/* ====================================================== */}
        {/* METRICS                                                */}
        {/* ====================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <RoleMetric
            icon={
              ShieldCheck
            }
            label="Total Roles"
            value={
              data.metrics
                .totalRoles
            }
          />

          <RoleMetric
            icon={
              LockKeyhole
            }
            label="System Roles"
            value={
              data.metrics
                .systemRoles
            }
          />

          <RoleMetric
            icon={
              Sparkles
            }
            label="Custom Roles"
            value={
              data.metrics
                .customRoles
            }
          />

          <RoleMetric
            icon={
              KeyRound
            }
            label="Permissions"
            value={
              data.metrics
                .totalPermissions
            }
          />

          <RoleMetric
            icon={
              UsersRound
            }
            label="Assignments"
            value={
              data.metrics
                .totalAssignments
            }
          />

          <RoleMetric
            icon={
              Boxes
            }
            label="Active Roles"
            value={
              data.metrics
                .activeRoles
            }
          />
        </section>

        {/* ====================================================== */}
        {/* ROLE CATALOGUE                                         */}
        {/* ====================================================== */}

        <section className="mt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Role Catalogue
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                Access profiles
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                System roles preserve core application behavior while custom
                roles provide the foundation for specialized school staff.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] text-emerald-700">
              <LockKeyhole className="h-3 w-3" />

              {
                data.metrics
                  .protectedRoles
              }{" "}
              protected
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.roles.map(
              (role) => (
                <RoleCard
                  key={
                    role.id
                  }
                  role={
                    role
                  }
                />
              ),
            )}
          </div>
        </section>

        {/* ====================================================== */}
        {/* PERMISSION MATRIX                                      */}
        {/* ====================================================== */}

        <div className="mt-8">
          <PermissionMatrix
            roles={
              data.roles
            }
            permissionGroups={
              data.permissionGroups
            }
          />
        </div>
      </div>
    </div>
  );
}

function RoleMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof ShieldCheck;

  label:
    string;

  value:
    number;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
    </article>
  );
}