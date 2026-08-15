import {
  Activity,
  BadgeCheck,
  Ban,
  Clock3,
  Plus,
  ShieldCheck,
  UserCog,
  UsersRound,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import UserDirectoryFilters from "@/components/access-control/UserDirectoryFilters";

import UserDirectoryActions from "@/components/access-control/UserDirectoryActions";

import UserDirectoryPagination from "@/components/access-control/UserDirectoryPagination";

import UserRoleBadges from "@/components/access-control/UserRoleBadges";

import UserStatusBadge from "@/components/access-control/UserStatusBadge";

import {
  getAccessControlUsers,
  type AccessControlUserStatusFilter,
} from "@/lib/access-control/admin-dashboard";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type UsersPageProps = {
  searchParams:
    Promise<{
      page?:
        string;

      search?:
        string;

      role?:
        string;

      status?:
        string;
    }>;
};

export default async function AccessControlUsersPage({
  searchParams,
}: UsersPageProps) {
  const params =
    await searchParams;

  const page =
    Math.max(
      1,
      Number(
        params.page,
      ) || 1,
    );

  const status =
    (
      params.status ||
      "ALL"
    ) as AccessControlUserStatusFilter;

  const data =
    await getAccessControlUsers({
      page,

      pageSize:
        12,

      search:
        params.search,

      role:
        params.role,

      status,
    });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* ====================================================== */}
        {/* HERO                                                   */}
        {/* ====================================================== */}

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.25)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-28 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[95px]" />

            <div className="absolute -bottom-32 left-[30%] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-[100px]" />

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
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 backdrop-blur-xl sm:text-xs">
                  <UsersRound className="h-3.5 w-3.5" />

                  Identity Directory
                </div>

                <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  Users & Access
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Review school user identities, account status and role
                  assignments from one secure administrative directory.
                </p>
              </div>

              {/* CREATE USER */}

              <Link
                href="/list/access-control/users/new"
                className="group inline-flex h-12 w-fit items-center justify-center gap-2.5 rounded-2xl border border-blue-400/20 bg-blue-600 px-5 text-sm font-black text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_20px_42px_rgba(37,99,235,0.35)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10">
                  <Plus className="h-4 w-4" />
                </span>

                Create User
              </Link>
            </div>
          </div>
        </section>

        <AccessControlTabs />

        {/* ====================================================== */}
        {/* STATUS METRICS                                         */}
        {/* ====================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <DirectoryMetric
            icon={
              UsersRound
            }
            label="All Users"
            value={
              data.counts
                .all
            }
          />

          <DirectoryMetric
            icon={
              BadgeCheck
            }
            label="Active"
            value={
              data.counts
                .active
            }
          />

          <DirectoryMetric
            icon={
              Clock3
            }
            label="Pending"
            value={
              data.counts
                .pending
            }
          />

          <DirectoryMetric
            icon={
              Activity
            }
            label="Suspended"
            value={
              data.counts
                .suspended
            }
          />

          <DirectoryMetric
            icon={
              Ban
            }
            label="Disabled"
            value={
              data.counts
                .disabled
            }
          />
        </section>

        {/* ====================================================== */}
        {/* FILTERS                                                */}
        {/* ====================================================== */}

        <div className="mt-6">
          <UserDirectoryFilters
            roles={
              data.roles
            }
          />
        </div>

        {/* ====================================================== */}
        {/* DIRECTORY                                              */}
        {/* ====================================================== */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                User Directory
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                School identities
              </h2>
            </div>

            <p className="text-xs font-bold text-slate-400">
              {
                data.pagination
                  .total
              }{" "}
              matching account
              {data.pagination
                .total ===
              1
                ? ""
                : "s"}
            </p>
          </div>

          {data.users.length ===
          0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UserCog className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-black text-slate-800">
                No users found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                No user accounts match the current search and access filters.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1080px] text-sm">
                  <thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="px-6 py-3.5">
                        User
                      </th>

                      <th className="px-5 py-3.5">
                        Roles
                      </th>

                      <th className="px-5 py-3.5">
                        Status
                      </th>

                      <th className="px-5 py-3.5">
                        Legacy Role
                      </th>

                      <th className="px-5 py-3.5">
                        Created
                      </th>

                      <th className="px-5 py-3.5 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {data.users.map(
                      (
                        user,
                      ) => (
                        <UserTableRow
                          key={
                            user.id
                          }
                          user={
                            user
                          }
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET CARDS */}

              <div className="divide-y divide-slate-100 lg:hidden">
                {data.users.map(
                  (
                    user,
                  ) => (
                    <UserMobileCard
                      key={
                        user.id
                      }
                      user={
                        user
                      }
                    />
                  ),
                )}
              </div>

              <UserDirectoryPagination
                page={
                  data.pagination
                    .page
                }
                totalPages={
                  data.pagination
                    .totalPages
                }
                total={
                  data.pagination
                    .total
                }
                searchParams={{
                  search:
                    params.search,

                  role:
                    params.role,

                  status:
                    params.status,
                }}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}




type DirectoryUser =
  Awaited<
    ReturnType<
      typeof getAccessControlUsers
    >
  >["users"][number];

function UserTableRow({
  user,
}: {
  user:
    DirectoryUser;
}) {
  return (
    <tr className="transition hover:bg-slate-50/80">
      {/* IDENTITY */}

      <td className="px-6 py-4">
        <UserIdentity
          user={
            user
          }
        />
      </td>

      {/* ROLES */}

      <td className="px-5 py-4">
        <UserRoleBadges
          roles={
            user.roles.map(
              (
                assignment,
              ) =>
                assignment.role,
            )
          }
        />
      </td>

      {/* STATUS */}

      <td className="px-5 py-4">
        <UserStatusBadge
          status={
            user.status
          }
        />
      </td>

      {/* LEGACY */}

      <td className="px-5 py-4">
        {user.legacyRole ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500">
            {
              user.legacyRole
            }
          </span>
        ) : (
          <span className="text-xs font-bold text-slate-300">
            —
          </span>
        )}
      </td>

      {/* CREATED */}

      <td className="px-5 py-4 text-xs font-semibold text-slate-500">
        {formatDate(
          user.createdAt,
        )}
      </td>

      {/* ACTIONS */}

      <td className="px-5 py-4">
        <div className="flex justify-end">
          <UserDirectoryActions
            userId={
              user.id
            }
          />
        </div>
      </td>
    </tr>
  );
}

function UserMobileCard({
  user,
}: {
  user:
    DirectoryUser;
}) {
  return (
    <article className="p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <UserIdentity
            user={
              user
            }
          />
        </div>

        <UserDirectoryActions
          userId={
            user.id
          }
        />
      </div>

      <div className="mt-4">
        <UserRoleBadges
          roles={
            user.roles.map(
              (
                assignment,
              ) =>
                assignment.role,
            )
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <UserStatusBadge
          status={
            user.status
          }
        />

        <p className="text-[10px] font-bold text-slate-400">
          Added{" "}
          {formatDate(
            user.createdAt,
          )}
        </p>
      </div>
    </article>
  );
}

function UserIdentity({
  user,
}: {
  user:
    DirectoryUser;
}) {
  const name =
    user.displayName ||
    user.username ||
    "Unnamed user";

  const initials =
    name
      .split(
        " ",
      )
      .filter(
        Boolean,
      )
      .slice(
        0,
        2,
      )
      .map(
        (
          part,
        ) =>
          part[0]?.toUpperCase(),
      )
      .join(
        "",
      );

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-[0_4px_14px_rgba(15,23,42,0.10)]">
        {user.imageUrl ? (
          <Image
            src={
              user.imageUrl
            }
            alt={
              name
            }
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-black text-white">
            {initials ||
              "U"}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <Link
          href={`/list/access-control/users/${user.id}`}
          className="block truncate font-black text-slate-900 transition hover:text-blue-700"
        >
          {
            name
          }
        </Link>

        <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400">
          {user.email ||
            user.username ||
            user.phone ||
            "No contact information"}
        </p>
      </div>
    </div>
  );
}

function DirectoryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof UsersRound;

  label:
    string;

  value:
    number;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <p className="mt-4 text-2xl font-black tracking-tight text-slate-950">
        {
          value
        }
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
        {
          label
        }
      </p>
    </article>
  );
}

function formatDate(
  value:
    Date,
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(
    value,
  );
}