import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  ChevronRight,
  Clock3,
  Filter,
  KeyRound,
  LockKeyhole,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
  UserRound,
} from "lucide-react";

import Link from "next/link";

import AccessControlTabs from "@/components/access-control/AccessControlTabs";

import ManageRoleExpiryDialog from "@/components/access-control/ManageRoleExpiryDialog";

import RemoveUserRoleButton from "@/components/access-control/RemoveUserRoleButton";

import {
  canActorManageTarget,
  canActorRemoveRole,
  getCurrentAccessActor,
  getDelegatedAccessGovernance,
} from "@/lib/access-control";

import {
  resolveLegacyAccessRole,
} from "@/lib/access-control/legacy-role-map";

/* ========================================================================== */
/* PAGE CONFIG                                                                */
/* ========================================================================== */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type SearchParams = Promise<{
  search?:
    string;

  status?:
    string;

  window?:
    string;

  trust?:
    string;

  sort?:
    string;

  page?:
    string;
}>;

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function DelegatedAccessPage({
  searchParams,
}: {
  searchParams:
    SearchParams;
}) {
  const params =
    await searchParams;

  const page =
    Math.max(
      1,
      Number.parseInt(
        params.page ??
          "1",
        10,
      ) ||
        1,
    );

  const [
    data,
    accessActor,
  ] =
    await Promise.all([
      getDelegatedAccessGovernance({
        page,

        pageSize:
          12,

        search:
          params.search,

        status:
          params.status as
            | "ALL"
            | "ACTIVE"
            | "EXPIRING"
            | "EXPIRED"
            | undefined,

        window:
          params.window as
            | "ALL"
            | "24H"
            | "3D"
            | "7D"
            | "30D"
            | undefined,

        trust:
          params.trust as
            | "ALL"
            | "STANDARD"
            | "HIGH"
            | undefined,

        sort:
          params.sort as
            | "EXPIRY_ASC"
            | "EXPIRY_DESC"
            | "ASSIGNED_DESC"
            | "USER_ASC"
            | "ROLE_ASC"
            | undefined,
      }),

      getCurrentAccessActor(),
    ]);

  const canManageExpiry =
    accessActor?.can(
      "roles.manage_expiry",
    ) ??
    false;

  const canRemoveRoles =
    accessActor?.can(
      "roles.remove",
    ) ??
    false;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* ================================================================= */}
        {/* HERO                                                              */}
        {/* ================================================================= */}

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-slate-950 text-white shadow-[0_35px_100px_rgba(15,23,42,0.28)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-28 h-[380px] w-[380px] rounded-full bg-amber-400/15 blur-[100px]" />

            <div className="absolute -bottom-32 left-[32%] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-[110px]" />

            <div
              className="absolute inset-0 opacity-[0.045]"
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
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-200 backdrop-blur-xl">
                  <TimerReset className="h-3.5 w-3.5" />

                  Delegated Access Governance
                </div>

                <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                  Temporary Access Centre
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Monitor temporary authority, upcoming expiries and historical
                  delegated access across the school from one controlled
                  governance workspace.
                </p>

                <div className="mt-7 flex flex-wrap gap-2.5">
                  <HeroPill
                    label="Expiry Aware"
                  />

                  <HeroPill
                    label="Hierarchy Protected"
                  />

                  <HeroPill
                    label="Reverification Ready"
                  />

                  <HeroPill
                    label="Audit Tracked"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
                <HeroMetric
                  icon={
                    TimerReset
                  }
                  label="Temporary"
                  value={
                    data.metrics
                      .activeTemporary
                  }
                />

                <HeroMetric
                  icon={
                    Clock3
                  }
                  label="Expiring Soon"
                  value={
                    data.metrics
                      .expiringSoon
                  }
                />

                <HeroMetric
                  icon={
                    AlertTriangle
                  }
                  label="Expired"
                  value={
                    data.metrics
                      .expired
                  }
                />

                <HeroMetric
                  icon={
                    ShieldAlert
                  }
                  label="High Trust"
                  value={
                    data.metrics
                      .highTrust
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* ACCESS CONTROL NAVIGATION                                         */}
        {/* ================================================================= */}

        <AccessControlTabs />

        {/* ================================================================= */}
        {/* SUMMARY                                                           */}
        {/* ================================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GovernanceMetric
            eyebrow="Temporary Authority"
            value={
              data.metrics
                .activeTemporary
            }
            label="Active Delegations"
            description="Temporary role assignments currently contributing authorization."
            icon={
              TimerReset
            }
            tone="blue"
          />

          <GovernanceMetric
            eyebrow="Review Window"
            value={
              data.metrics
                .expiringSoon
            }
            label="Expiring Within 7 Days"
            description="Delegations that should be reviewed before automatic expiry."
            icon={
              CalendarClock
            }
            tone="amber"
          />

          <GovernanceMetric
            eyebrow="Immediate Attention"
            value={
              data.metrics
                .urgent24Hours
            }
            label="Expires Within 24 Hours"
            description="Delegated authority reaching its deadline within one day."
            icon={
              AlertTriangle
            }
            tone="rose"
          />

          <GovernanceMetric
            eyebrow="Historical"
            value={
              data.metrics
                .expired
            }
            label="Expired Assignments"
            description="Retained assignments that no longer contribute effective access."
            icon={
              Clock3
            }
            tone="slate"
          />
        </section>

        {/* ================================================================= */}
        {/* FILTERS                                                           */}
        {/* ================================================================= */}

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                <Filter className="h-4 w-4" />

                Governance Filters
              </div>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                Review delegated authority
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Search, filter and prioritize temporary role assignments.
              </p>
            </div>

            <Link
              href="/list/access-control/delegated-access"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />

              Reset Filters
            </Link>
          </div>

          <form
            method="GET"
            className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_repeat(4,minmax(150px,0.7fr))_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                name="search"
                defaultValue={
                  data.filters
                    .search
                }
                placeholder="Search user, role, username or email..."
                className="h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <select
              name="status"
              defaultValue={
                data.filters
                  .status
              }
              className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active Temporary
              </option>

              <option value="EXPIRING">
                Expiring Soon
              </option>

              <option value="EXPIRED">
                Expired
              </option>
            </select>

            <select
              name="window"
              defaultValue={
                data.filters
                  .window
              }
              className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="ALL">
                Any Expiry
              </option>

              <option value="24H">
                Next 24 Hours
              </option>

              <option value="3D">
                Next 3 Days
              </option>

              <option value="7D">
                Next 7 Days
              </option>

              <option value="30D">
                Next 30 Days
              </option>
            </select>

            <select
              name="trust"
              defaultValue={
                data.filters
                  .trust
              }
              className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="ALL">
                All Trust Levels
              </option>

              <option value="STANDARD">
                Standard Trust
              </option>

              <option value="HIGH">
                High Trust
              </option>
            </select>

            <select
              name="sort"
              defaultValue={
                data.filters
                  .sort
              }
              className="h-11 rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-600 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option value="EXPIRY_ASC">
                Expiry Soonest
              </option>

              <option value="EXPIRY_DESC">
                Expiry Latest
              </option>

              <option value="ASSIGNED_DESC">
                Recently Assigned
              </option>

              <option value="USER_ASC">
                User Name
              </option>

              <option value="ROLE_ASC">
                Role Name
              </option>
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-[14px] bg-slate-950 px-5 text-xs font-black text-white transition hover:bg-blue-700"
            >
              Apply
            </button>
          </form>
        </section>

        {/* ================================================================= */}
        {/* RESULTS HEADER                                                    */}
        {/* ================================================================= */}

        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Access Review Queue
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Delegated assignments
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {
                data.pagination
                  .total
              }{" "}
              assignment
              {data.pagination
                .total ===
              1
                ? ""
                : "s"}{" "}
              match the current governance filters.
            </p>
          </div>

          {data.metrics
            .highTrust >
          0 ? (
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-violet-100 bg-violet-50 px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-violet-700 sm:self-auto">
              <LockKeyhole className="h-3.5 w-3.5" />

              {
                data.metrics
                  .highTrust
              }{" "}
              High-Trust Delegation
              {data.metrics
                .highTrust ===
              1
                ? ""
                : "s"}
            </div>
          ) : null}
        </section>

        {/* ================================================================= */}
        {/* ASSIGNMENTS                                                       */}
        {/* ================================================================= */}

        {data.assignments
          .length ===
        0 ? (
          <EmptyState />
        ) : (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {data.assignments.map(
              (
                assignment,
              ) => {
                const targetHierarchy =
                  accessActor
                    ? canActorManageTarget({
                        actor:
                          accessActor.actor,

                        target:
                          assignment.user,

                        action:
                          "MANAGE_ROLES",
                      })
                    : null;

                const roleAuthority =
                  accessActor
                    ? canActorRemoveRole({
                        actor:
                          accessActor.actor,

                        role:
                          assignment.role,
                      })
                    : null;

                const requiredRoleKey =
                  resolveLegacyAccessRole(
                    assignment.user
                      .legacyRole,
                  );

                const required =
                  requiredRoleKey ===
                  assignment.role.key;

                const canManageThisTarget =
                  Boolean(
                    targetHierarchy
                      ?.allowed,
                  );

                const canManageThisExpiry =
                  Boolean(
                    canManageExpiry &&
                      canManageThisTarget &&
                      roleAuthority
                        ?.allowed &&
                      !required &&
                      !assignment
                        .expired &&
                      assignment.role
                        .isActive,
                  );

                const canRemoveThisRole =
                  Boolean(
                    canRemoveRoles &&
                      canManageThisTarget &&
                      roleAuthority
                        ?.allowed &&
                      !required,
                  );

                const hierarchyReason =
                  required
                    ? "The user's required primary role cannot be managed here."
                    : !canManageThisTarget
                      ? targetHierarchy
                          ?.reason ??
                        "Target hierarchy prevents this change."
                      : !roleAuthority
                            ?.allowed
                        ? roleAuthority
                            ?.reason ??
                          "Your role authority does not permit this change."
                        : null;

                return (
                  <DelegatedAccessCard
                    key={
                      assignment.id
                    }
                    assignment={
                      assignment
                    }
                    canManageExpiry={
                      canManageThisExpiry
                    }
                    canRemove={
                      canRemoveThisRole
                    }
                    expiryRestrictionReason={
                      !canManageExpiry
                        ? "Requires roles.manage_expiry permission."
                        : hierarchyReason
                    }
                    removeRestrictionReason={
                      !canRemoveRoles
                        ? "Requires roles.remove permission."
                        : hierarchyReason
                    }
                    required={
                      required
                    }
                  />
                );
              },
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGINATION                                                        */}
        {/* ================================================================= */}

        <Pagination
          pagination={
            data.pagination
          }
          filters={
            data.filters
          }
        />
      </div>
    </div>
  );
}

/* ========================================================================== */
/* DELEGATED ACCESS CARD                                                      */
/* ========================================================================== */

function DelegatedAccessCard({
  assignment,
  canManageExpiry,
  canRemove,
  expiryRestrictionReason,
  removeRestrictionReason,
  required,
}: {
  assignment:
    Awaited<
      ReturnType<
        typeof getDelegatedAccessGovernance
      >
    >["assignments"][number];

  canManageExpiry:
    boolean;

  canRemove:
    boolean;

  expiryRestrictionReason:
    string | null;

  removeRestrictionReason:
    string | null;

  required:
    boolean;
}) {
  const userLabel =
    assignment.user
      .displayName ??
    assignment.user
      .username ??
    "Unnamed User";

  const countdown =
    formatCountdown(
      assignment.expiresAt,
    );

  const urgency =
    getUrgency(
      assignment,
    );

  return (
    <article className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.055)]">
      <div
        className={`h-1.5 w-full ${
          urgency ===
          "expired"
            ? "bg-slate-300"
            : urgency ===
                "urgent"
              ? "bg-rose-500"
              : urgency ===
                  "high"
                ? "bg-amber-500"
                : urgency ===
                    "soon"
                  ? "bg-yellow-400"
                  : assignment
                        .highTrust
                    ? "bg-violet-500"
                    : "bg-blue-500"
        }`}
      />

      <div className="p-5 sm:p-6">
        {/* USER + STATUS */}

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-blue-50 text-blue-600">
              <UserRound className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <Link
                href={`/list/access-control/users/${assignment.user.id}`}
                className="block truncate text-sm font-black text-slate-950 transition hover:text-blue-700"
              >
                {
                  userLabel
                }
              </Link>

              <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                {assignment.user
                  .username
                  ? `@${assignment.user.username}`
                  : assignment.user
                      .email ??
                    assignment.user
                      .id}
              </p>
            </div>
          </div>

          <AssignmentStatusBadge
            expired={
              assignment.expired
            }
            expiringSoon={
              assignment.expiringSoon
            }
            highTrust={
              assignment.highTrust
            }
          />
        </div>

        {/* ROLE */}

        <div className="mt-5 rounded-[18px] border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-white text-violet-600 shadow-sm">
              <KeyRound className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-black text-slate-900">
                  {
                    assignment.role
                      .name
                  }
                </p>

                <span
                  className={`rounded-md px-2 py-1 text-[7px] font-black uppercase tracking-wider ${
                    assignment.role
                      .type ===
                    "CUSTOM"
                      ? "bg-violet-50 text-violet-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {
                    assignment.role
                      .type
                  }
                </span>

                {assignment.role
                  .isProtected ? (
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-amber-700">
                      Protected
                    </span>
                  ) : null}

                {assignment.highTrust ? (
                  <span className="rounded-md bg-rose-50 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-rose-700">
                    High Trust
                  </span>
                ) : null}
              </div>

              <code className="mt-1.5 block text-[9px] font-bold text-slate-400">
                {
                  assignment.role
                    .key
                }
              </code>

              {assignment.role
                .description ? (
                  <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-500">
                    {
                      assignment.role
                        .description
                    }
                  </p>
                ) : null}
            </div>
          </div>
        </div>

        {/* EXPIRY */}

        <div
          className={`mt-4 rounded-[18px] border p-4 ${
            assignment.expired
              ? "border-slate-200 bg-slate-50"
              : urgency ===
                  "urgent"
                ? "border-rose-100 bg-rose-50/60"
                : assignment
                      .expiringSoon
                  ? "border-amber-100 bg-amber-50/60"
                  : "border-blue-100 bg-blue-50/40"
          }`}
        >
          <div className="flex items-start gap-3">
            <CalendarClock
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                assignment.expired
                  ? "text-slate-400"
                  : urgency ===
                      "urgent"
                    ? "text-rose-600"
                    : assignment
                          .expiringSoon
                      ? "text-amber-600"
                      : "text-blue-600"
              }`}
            />

            <div>
              <p
                className={`text-sm font-black ${
                  assignment.expired
                    ? "text-slate-700"
                    : urgency ===
                        "urgent"
                      ? "text-rose-800"
                      : assignment
                            .expiringSoon
                        ? "text-amber-800"
                        : "text-blue-800"
                }`}
              >
                {
                  countdown
                }
              </p>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                {assignment.expired
                  ? "This assignment is retained for audit history but no longer contributes authorization."
                  : `Access automatically expires ${formatDateTime(
                      assignment.expiresAt,
                    )}.`}
              </p>
            </div>
          </div>
        </div>

        {/* METADATA */}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Meta
            label="Permissions"
            value={String(
              assignment.role
                ._count
                .permissions,
            )}
          />

          <Meta
            label="Assigned"
            value={formatShortDate(
              assignment.assignedAt,
            )}
          />

          <Meta
            label="Source"
            value={readableEnum(
              assignment.source,
            )}
          />

          <Meta
            label="Trust"
            value={
              assignment.highTrust
                ? "High"
                : "Standard"
            }
          />
        </div>

        {/* ACTIONS */}

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
              Governance Action
            </p>

            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              {assignment.expired
                ? "Review or remove this historical expired assignment."
                : assignment.expiringSoon
                  ? "Review before access automatically expires."
                  : "Manage the remaining delegated-access period."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            {!assignment.expired ? (
              <ManageRoleExpiryDialog
                userId={
                  assignment.userId
                }
                roleId={
                  assignment.roleId
                }
                roleName={
                  assignment.role
                    .name
                }
                expiresAt={
                  assignment.expiresAt.toISOString()
                }
                allowed={
                  canManageExpiry
                }
                restrictionReason={
                  expiryRestrictionReason
                }
              />
            ) : null}

            <RemoveUserRoleButton
              userId={
                assignment.userId
              }
              displayName={
                userLabel
              }
              roleId={
                assignment.roleId
              }
              roleName={
                assignment.role
                  .name
              }
              roleKey={
                assignment.role
                  .key
              }
              required={
                required
              }
              allowed={
                canRemove
              }
              restrictionReason={
                removeRestrictionReason
              }
            />

            <Link
              href={`/list/access-control/users/${assignment.user.id}?tab=roles`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Open Profile

              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ========================================================================== */
/* STATUS                                                                     */
/* ========================================================================== */

function AssignmentStatusBadge({
  expired,
  expiringSoon,
  highTrust,
}: {
  expired:
    boolean;

  expiringSoon:
    boolean;

  highTrust:
    boolean;
}) {
  const config =
    expired
      ? {
          label:
            "Expired",

          className:
            "border-slate-200 bg-slate-50 text-slate-500",
        }
      : expiringSoon
        ? {
            label:
              "Review Required",

            className:
              "border-amber-100 bg-amber-50 text-amber-700",
          }
        : highTrust
          ? {
              label:
                "Privileged",

              className:
                "border-violet-100 bg-violet-50 text-violet-700",
            }
          : {
              label:
                "Temporary",

              className:
                "border-blue-100 bg-blue-50 text-blue-700",
            };

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] ${config.className}`}
    >
      {
        config.label
      }
    </span>
  );
}

/* ========================================================================== */
/* GOVERNANCE METRIC                                                         */
/* ========================================================================== */

function GovernanceMetric({
  eyebrow,
  value,
  label,
  description,
  icon: Icon,
  tone,
}: {
  eyebrow:
    string;

  value:
    number;

  label:
    string;

  description:
    string;

  icon:
    typeof TimerReset;

  tone:
    "blue" |
    "amber" |
    "rose" |
    "slate";
}) {
  const tones = {
    blue: {
      icon:
        "bg-blue-50 text-blue-600",

      glow:
        "bg-blue-100",
    },

    amber: {
      icon:
        "bg-amber-50 text-amber-600",

      glow:
        "bg-amber-100",
    },

    rose: {
      icon:
        "bg-rose-50 text-rose-600",

      glow:
        "bg-rose-100",
    },

    slate: {
      icon:
        "bg-slate-100 text-slate-600",

      glow:
        "bg-slate-200",
    },
  };

  const current =
    tones[
      tone
    ];

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${current.glow}`}
      />

      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-[15px] ${current.icon}`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>

      <div className="relative mt-5">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
          {
            eyebrow
          }
        </p>

        <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          {
            value
          }
        </p>

        <p className="mt-1 text-xs font-black text-slate-700">
          {
            label
          }
        </p>

        <p className="mt-3 text-[10px] leading-5 text-slate-400">
          {
            description
          }
        </p>
      </div>
    </article>
  );
}

/* ========================================================================== */
/* HERO                                                                       */
/* ========================================================================== */

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof TimerReset;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="min-w-[130px] rounded-[22px] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-amber-300" />

      <p className="mt-4 text-3xl font-black tracking-tight">
        {
          value
        }
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        {
          label
        }
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

/* ========================================================================== */
/* META                                                                       */
/* ========================================================================== */

function Meta({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-[14px] border border-slate-100 bg-slate-50/70 px-3 py-3">
      <p className="text-[7px] font-black uppercase tracking-[0.1em] text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-1 truncate text-[10px] font-black text-slate-700">
        {
          value
        }
      </p>
    </div>
  );
}

/* ========================================================================== */
/* PAGINATION                                                                 */
/* ========================================================================== */

function Pagination({
  pagination,
  filters,
}: {
  pagination:
    Awaited<
      ReturnType<
        typeof getDelegatedAccessGovernance
      >
    >["pagination"];

  filters:
    Awaited<
      ReturnType<
        typeof getDelegatedAccessGovernance
      >
    >["filters"];
}) {
  if (
    pagination.totalPages <=
    1
  ) {
    return null;
  }

  function href(
    page:
      number,
  ) {
    const query =
      new URLSearchParams();

    if (
      filters.search
    ) {
      query.set(
        "search",
        filters.search,
      );
    }

    if (
      filters.status !==
      "ALL"
    ) {
      query.set(
        "status",
        filters.status,
      );
    }

    if (
      filters.window !==
      "ALL"
    ) {
      query.set(
        "window",
        filters.window,
      );
    }

    if (
      filters.trust !==
      "ALL"
    ) {
      query.set(
        "trust",
        filters.trust,
      );
    }

    if (
      filters.sort !==
      "EXPIRY_ASC"
    ) {
      query.set(
        "sort",
        filters.sort,
      );
    }

    query.set(
      "page",
      String(
        page,
      ),
    );

    return `/list/access-control/delegated-access?${query.toString()}`;
  }

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold text-slate-400">
        Page{" "}
        <span className="font-black text-slate-700">
          {
            pagination.page
          }
        </span>{" "}
        of{" "}
        <span className="font-black text-slate-700">
          {
            pagination.totalPages
          }
        </span>
      </p>

      <div className="flex gap-2">
        {pagination.hasPrevious ? (
          <Link
            href={
              href(
                pagination.page -
                  1,
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />

            Previous
          </Link>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 text-xs font-black text-slate-300">
            <ArrowLeft className="h-3.5 w-3.5" />

            Previous
          </span>
        )}

        {pagination.hasNext ? (
          <Link
            href={
              href(
                pagination.page +
                  1,
              )
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-blue-700"
          >
            Next

            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-4 text-xs font-black text-slate-300">
            Next

            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* EMPTY                                                                      */
/* ========================================================================== */

function EmptyState() {
  return (
    <div className="mt-5 rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-slate-50 text-slate-300">
        <ShieldCheck className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-black text-slate-700">
        No delegated access found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-400">
        No temporary role assignments match the current governance filters.
      </p>
    </div>
  );
}

/* ========================================================================== */
/* TIME HELPERS                                                               */
/* ========================================================================== */

function formatCountdown(
  expiresAt:
    Date,
) {
  const milliseconds =
    expiresAt.getTime() -
    Date.now();

  if (
    milliseconds <=
    0
  ) {
    return "Expired";
  }

  const minutes =
    Math.ceil(
      milliseconds /
        60_000,
    );

  if (
    minutes <
    60
  ) {
    return `Expires in ${minutes} ${
      minutes ===
      1
        ? "minute"
        : "minutes"
    }`;
  }

  const hours =
    Math.ceil(
      milliseconds /
        3_600_000,
    );

  if (
    hours <
    24
  ) {
    return `Expires in ${hours} ${
      hours ===
      1
        ? "hour"
        : "hours"
    }`;
  }

  const days =
    Math.ceil(
      milliseconds /
        86_400_000,
    );

  if (
    days <
    31
  ) {
    return `Expires in ${days} ${
      days ===
      1
        ? "day"
        : "days"
    }`;
  }

  const months =
    Math.ceil(
      days /
        30,
    );

  return `Expires in ${months} ${
    months ===
    1
      ? "month"
      : "months"
  }`;
}

function getUrgency(
  assignment:
    Awaited<
      ReturnType<
        typeof getDelegatedAccessGovernance
      >
    >["assignments"][number],
) {
  if (
    assignment.expired
  ) {
    return "expired";
  }

  const hours =
    assignment
      .millisecondsRemaining /
    3_600_000;

  if (
    hours <=
    24
  ) {
    return "urgent";
  }

  if (
    hours <=
    72
  ) {
    return "high";
  }

  if (
    hours <=
    168
  ) {
    return "soon";
  }

  return "normal";
}

function formatDateTime(
  value:
    Date,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    value,
  );
}

function formatShortDate(
  value:
    Date,
) {
  return new Intl.DateTimeFormat(
    "en-GB",
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