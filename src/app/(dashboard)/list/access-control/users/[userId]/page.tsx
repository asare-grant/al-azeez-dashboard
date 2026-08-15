// src/app/(dashboard)/list/access-control/users/[userId]/page.tsx
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Copy,
  Mail,
  Pencil,
  ShieldCheck,
  UserRound,
  AtSign,
  KeyRound,
  BadgeCheck,
  Database,
  Fingerprint,
  ImageIcon,
  Info,
  Phone,
  UserCog,
  Activity,
  History,
  Link2,
  ArrowRight,
  CircleCheck,
  ClockArrowUp,
  ShieldPlus,
  UsersRound,
  Layers3,
  LockKeyhole,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Megaphone,
  ReceiptText,
  Settings2,
  Users,
  WalletCards,
  Check,
  GitBranch,
  Network,
  Route,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRoundPlus,
  Braces,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  TableProperties,
  CircleCheckBig,
  HeartPulse,
  ServerCog,
  ShieldEllipsis,
  CloudCog,
  CalendarClock,
  Clock4,
  GitCommitHorizontal,
  Milestone,
  TimerReset,
  AlertTriangle,
  GitCompareArrows,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  Waypoints,
  MonitorSmartphone,
  ShieldQuestion,
  Smartphone,
  UserCheck,
  CirclePlus,
  PauseCircle,
  Power,
  RefreshCcw,
  ShieldMinus,
  UserRoundCheck,
  BookUser,
  Building,
  CircleAlert,
  ContactRound,
  School,
  UserRoundCog,
  Cake,
  Home,
  MapPin,
  BadgeInfo,
  IdCard,
  ArrowUpRight,
  BriefcaseBusiness,
  Baby,
  HeartHandshake,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccessAuditAction, Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import { resolveLegacyAccessRole } from "@/lib/access-control/legacy-role-map";

import UserMoreActions from "@/components/access-control/UserMoreActions";

import EditUserDrawer from "@/components/access-control/EditUserDrawer";

export const dynamic = "force-dynamic";

export const revalidate = 0;

type UserDetailPageProps = {
  params: Promise<{
    userId: string;
  }>;

  searchParams: Promise<{
    tab?: string;

    auditAction?: string;

    auditActor?: string;

    auditFrom?: string;

    auditTo?: string;

    auditPage?: string;

    auditPageSize?: string;
  }>;
};

const userDetailTabs = [
  {
    key: "overview",
    label: "Overview",
    icon: UserRound,
  },

  {
    key: "roles",
    label: "Roles & Permissions",
    icon: UsersRound,
  },

  {
    key: "audit",
    label: "Activity & Audit",
    icon: Activity,
  },

  {
    key: "account",
    label: "Account Activity",
    icon: History,
  },

  {
    key: "linked",
    label: "Linked Records",
    icon: Link2,
  },
] as const;

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseAuditAction(value: string): AccessAuditAction | undefined {
  if (!value) {
    return undefined;
  }

  const actions = Object.values(AccessAuditAction);

  return actions.includes(value as AccessAuditAction)
    ? (value as AccessAuditAction)
    : undefined;
}

function buildAuditHref({
  userId,
  page,
  pageSize,
  action,
  actor,
  from,
  to,
}: {
  userId: string;

  page: number;

  pageSize: number;

  action?: string;

  actor?: string;

  from?: string;

  to?: string;
}) {
  const params = new URLSearchParams();

  params.set("tab", "audit");

  params.set("auditPage", String(page));

  params.set("auditPageSize", String(pageSize));

  if (action) {
    params.set("auditAction", action);
  }

  if (actor) {
    params.set("auditActor", actor);
  }

  if (from) {
    params.set("auditFrom", from);
  }

  if (to) {
    params.set("auditTo", to);
  }

  return `/list/access-control/users/${userId}?${params.toString()}`;
}

export default async function UserDetailPage({
  params,
  searchParams,
}: UserDetailPageProps) {
  const { userId } = await params;

  const search = await searchParams;

  const tab = search.tab ?? "overview";

  const auditAction = search.auditAction?.trim() || "";

  const auditActor = search.auditActor?.trim() || "";

  const auditFrom = search.auditFrom?.trim() || "";

  const auditTo = search.auditTo?.trim() || "";

  const requestedAuditPage = parsePositiveInteger(search.auditPage, 1);

  const requestedAuditPageSize = parsePositiveInteger(search.auditPageSize, 10);

  const auditPageSize = Math.min(requestedAuditPageSize, 50);

  const parsedAuditAction = parseAuditAction(auditAction);

  const user = await prisma.userAccount.findUnique({
    where: {
      id: userId,
    },

    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },

        orderBy: {
          assignedAt: "asc",
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  /* -------------------------------------------------------------------------- */
  /* LINKED SCHOOL RECORDS                                                      */
  /* -------------------------------------------------------------------------- */

  const linkedRecordType = user.legacyRole?.toLowerCase() ?? null;

  const [linkedStudent, linkedTeacher, linkedParent, linkedAdmin] =
    await Promise.all([
      linkedRecordType === "student"
        ? prisma.student.findUnique({
            where: {
              id: user.id,
            },

            include: {
              class: {
                include: {
                  grade: true,
                },
              },

              grade: true,

              parent: true,
            },
          })
        : Promise.resolve(null),

      linkedRecordType === "teacher"
        ? prisma.teacher.findUnique({
            where: {
              id: user.id,
            },

            include: {
              subjects: true,

              classes: true,

              _count: {
                select: {
                  subjects: true,

                  classes: true,

                  lessons: true,
                },
              },
            },
          })
        : Promise.resolve(null),

      linkedRecordType === "parent"
        ? prisma.parent.findUnique({
            where: {
              id: user.id,
            },

            include: {
              students: {
                include: {
                  class: true,

                  grade: true,
                },

                orderBy: [
                  {
                    name: "asc",
                  },

                  {
                    surname: "asc",
                  },
                ],
              },

              _count: {
                select: {
                  students: true,
                },
              },
            },
          })
        : Promise.resolve(null),

      linkedRecordType === "admin"
        ? prisma.admin.findUnique({
            where: {
              id: user.id,
            },
          })
        : Promise.resolve(null),
    ]);

  const hasLinkedDomainRecord = Boolean(
    linkedStudent || linkedTeacher || linkedParent || linkedAdmin,
  );

  const linkedRecordKind = linkedStudent
    ? "STUDENT"
    : linkedTeacher
      ? "TEACHER"
      : linkedParent
        ? "PARENT"
        : linkedAdmin
          ? "ADMIN"
          : linkedRecordType === "account"
            ? "UNIVERSAL_ONLY"
            : "NONE";

  const linkedRecordLabel =
    linkedRecordKind === "STUDENT"
      ? "Student Profile"
      : linkedRecordKind === "TEACHER"
        ? "Teacher Profile"
        : linkedRecordKind === "PARENT"
          ? "Parent / Guardian Profile"
          : linkedRecordKind === "ADMIN"
            ? "Administrator Profile"
            : linkedRecordKind === "UNIVERSAL_ONLY"
              ? "Universal Account Identity"
              : "No Domain Record";

  const linkedRecordDescription =
    linkedRecordKind === "STUDENT"
      ? "This UserAccount is connected to a student academic profile."
      : linkedRecordKind === "TEACHER"
        ? "This UserAccount is connected to a teacher academic and instructional profile."
        : linkedRecordKind === "PARENT"
          ? "This UserAccount is connected to a parent or guardian profile and its linked students."
          : linkedRecordKind === "ADMIN"
            ? "This UserAccount is connected to the application's administrator record."
            : linkedRecordKind === "UNIVERSAL_ONLY"
              ? "This account intentionally uses the universal UserAccount identity without a separate school-domain profile."
              : "No matching school-domain record was found for this identity.";

  const recentAuditActivity = await prisma.accessAuditLog.findMany({
    where: {
      targetUserId: user.id,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 5,
  });

  /* -------------------------------------------------------------------------- */
  /* ACCOUNT LIFECYCLE EVENTS                                                   */
  /* -------------------------------------------------------------------------- */

  const accountLifecycleEvents = await prisma.accessAuditLog.findMany({
    where: {
      targetUserId: user.id,

      action: {
        in: [
          AccessAuditAction.USER_CREATED,
          AccessAuditAction.USER_UPDATED,
          AccessAuditAction.USER_ACTIVATED,
          AccessAuditAction.USER_SUSPENDED,
          AccessAuditAction.USER_DISABLED,
          AccessAuditAction.ROLE_ASSIGNED,
          AccessAuditAction.ROLE_REMOVED,
        ],
      },
    },

    orderBy: [
      {
        createdAt: "desc",
      },

      {
        id: "desc",
      },
    ],

    take: 8,
  });

  /* -------------------------------------------------------------------------- */
  /* USER ACCESS AUDIT DATA                                                     */
  /* -------------------------------------------------------------------------- */

  const userAuditWhere: Prisma.AccessAuditLogWhereInput = {
    targetUserId: user.id,

    ...(parsedAuditAction
      ? {
          action: parsedAuditAction,
        }
      : {}),

    ...(auditActor
      ? {
          OR: [
            {
              actorId: {
                contains: auditActor,

                mode: "insensitive",
              },
            },

            {
              actorName: {
                contains: auditActor,

                mode: "insensitive",
              },
            },

            {
              actorRole: {
                contains: auditActor,

                mode: "insensitive",
              },
            },
          ],
        }
      : {}),

    ...(auditFrom || auditTo
      ? {
          createdAt: {
            ...(auditFrom
              ? {
                  gte: new Date(`${auditFrom}T00:00:00.000Z`),
                }
              : {}),

            ...(auditTo
              ? {
                  lte: new Date(`${auditTo}T23:59:59.999Z`),
                }
              : {}),
          },
        }
      : {}),
  };

  const auditActors = await prisma.accessAuditLog.findMany({
    where: {
      targetUserId: user.id,

      actorId: {
        not: null,
      },
    },

    distinct: ["actorId"],

    orderBy: {
      createdAt: "desc",
    },

    select: {
      actorId: true,

      actorName: true,

      actorRole: true,
    },

    take: 50,
  });

  const totalAuditEvents = await prisma.accessAuditLog.count({
    where: userAuditWhere,
  });

  const totalAuditPages = Math.max(
    1,
    Math.ceil(totalAuditEvents / auditPageSize),
  );

  const auditPage = Math.min(requestedAuditPage, totalAuditPages);

  const auditEvents = await prisma.accessAuditLog.findMany({
    where: userAuditWhere,

    orderBy: [
      {
        createdAt: "desc",
      },

      {
        id: "desc",
      },
    ],

    skip: (auditPage - 1) * auditPageSize,

    take: auditPageSize,
  });

  const auditPagination = {
    page: auditPage,

    pageSize: auditPageSize,

    totalRecords: totalAuditEvents,

    totalPages: totalAuditPages,

    hasPreviousPage: auditPage > 1,

    hasNextPage: auditPage < totalAuditPages,
  };

  const previousAuditHref = auditPagination.hasPreviousPage
    ? buildAuditHref({
        userId: user.id,

        page: auditPagination.page - 1,

        pageSize: auditPagination.pageSize,

        action: auditAction,

        actor: auditActor,

        from: auditFrom,

        to: auditTo,
      })
    : null;

  const nextAuditHref = auditPagination.hasNextPage
    ? buildAuditHref({
        userId: user.id,

        page: auditPagination.page + 1,

        pageSize: auditPagination.pageSize,

        action: auditAction,

        actor: auditActor,

        from: auditFrom,

        to: auditTo,
      })
    : null;

  /* -------------------------------------------------------------------------- */
  /* AUDIT SUMMARY                                                              */
  /* -------------------------------------------------------------------------- */
  const [
    administrativeActionCount,

    roleChangeCount,

    latestAuditEvent,

    actionBreakdownRows,

    actorBreakdownRows,
  ] = await Promise.all([
    /* ---------------------------------------------------------------------- */
    /* ACTOR-DRIVEN ACTIVITY                                                  */
    /* ---------------------------------------------------------------------- */

    prisma.accessAuditLog.count({
      where: {
        AND: [
          userAuditWhere,

          {
            actorId: {
              not: null,
            },
          },
        ],
      },
    }),

    /* ---------------------------------------------------------------------- */
    /* ROLE CHANGES                                                           */
    /* ---------------------------------------------------------------------- */

    prisma.accessAuditLog.count({
      where: {
        AND: [
          userAuditWhere,

          {
            action: {
              in: [
                AccessAuditAction.ROLE_ASSIGNED,
                AccessAuditAction.ROLE_REMOVED,
              ],
            },
          },
        ],
      },
    }),

    /* ---------------------------------------------------------------------- */
    /* LATEST MATCHING EVENT                                                  */
    /* ---------------------------------------------------------------------- */

    prisma.accessAuditLog.findFirst({
      where: userAuditWhere,

      orderBy: [
        {
          createdAt: "desc",
        },

        {
          id: "desc",
        },
      ],
    }),

    /* ---------------------------------------------------------------------- */
    /* ACTION DISTRIBUTION                                                    */
    /* ---------------------------------------------------------------------- */

    prisma.accessAuditLog.groupBy({
      by: ["action"],

      where: userAuditWhere,

      _count: {
        _all: true,
      },

      orderBy: {
        _count: {
          action: "desc",
        },
      },
    }),

    /* ---------------------------------------------------------------------- */
    /* ACTOR DISTRIBUTION                                                     */
    /* ---------------------------------------------------------------------- */

    prisma.accessAuditLog.groupBy({
      by: ["actorId", "actorName", "actorRole"],

      where: userAuditWhere,

      _count: {
        _all: true,
      },

      orderBy: {
        _count: {
          actorId: "desc",
        },
      },
    }),
  ]);

  const actionBreakdown = Object.fromEntries(
    actionBreakdownRows.map((item) => [item.action, item._count._all]),
  ) as Record<string, number>;

  const actorBreakdown = Object.fromEntries(
    actorBreakdownRows.map((item) => {
      const key = item.actorId ?? "system";

      return [
        key,

        {
          count: item._count._all,

          actorId: item.actorId,

          actorName: item.actorName,

          actorRole: item.actorRole,
        },
      ];
    }),
  ) as Record<
    string,
    {
      count: number;

      actorId: string | null;

      actorName: string | null;

      actorRole: string | null;
    }
  >;

  /* -------------------------------------------------------------------------- */
  /* RBAC ACCESS SUMMARY                                                        */
  /* -------------------------------------------------------------------------- */

  const effectivePermissionKeys = Array.from(
    new Set(
      user.roles.flatMap((assignment) =>
        assignment.role.permissions.map(
          (rolePermission) => rolePermission.permission.key,
        ),
      ),
    ),
  );

  const groupedEffectivePermissions = groupPermissions(effectivePermissionKeys);

  const assignedRoleCount = user.roles.length;

  const effectivePermissionCount = effectivePermissionKeys.length;

  const accountHasAccess = user.status === "ACTIVE" && assignedRoleCount > 0;

  const primeRole = user.legacyRole
    ? formatLegacyRole(user.legacyRole)
    : "Not assigned";

  const primaryRole = user.roles[0]?.role;

  /* -------------------------------------------------------------------------- */
  /* PROVISIONING / RBAC SYNCHRONIZATION                                       */
  /* -------------------------------------------------------------------------- */

  const expectedAccessRoleKey = resolveLegacyAccessRole(user.legacyRole);

  const expectedRoleAssignment = expectedAccessRoleKey
    ? (user.roles.find(
        (assignment) => assignment.role.key === expectedAccessRoleKey,
      ) ?? null)
    : null;

  const legacyRoleMapped = Boolean(expectedAccessRoleKey);

  const primaryRoleAssigned = Boolean(expectedRoleAssignment);

  const permissionReady = effectivePermissionCount > 0;

  const activeRoleAssignments = user.roles.filter(
    (assignment) => assignment.role.isActive,
  );

  const allAssignedRolesActive =
    user.roles.length > 0 && activeRoleAssignments.length === user.roles.length;

  const assignmentSources = Array.from(
    new Set(user.roles.map((assignment) => assignment.source)),
  );

  const hasMixedRoleSources = assignmentSources.length > 1;

  const synchronizationIssues: string[] = [];

  if (!user.legacyRole) {
    synchronizationIssues.push(
      "No legacy application role is stored for this identity.",
    );
  }

  if (user.legacyRole && !legacyRoleMapped) {
    synchronizationIssues.push(
      "The legacy application role does not map to a known RBAC system role.",
    );
  }

  if (expectedAccessRoleKey && !primaryRoleAssigned) {
    synchronizationIssues.push(
      `The required "${expectedAccessRoleKey}" RBAC role is not assigned.`,
    );
  }

  if (user.roles.length === 0) {
    synchronizationIssues.push("No RBAC roles are currently assigned.");
  }

  if (user.roles.length > 0 && !allAssignedRolesActive) {
    synchronizationIssues.push("One or more assigned RBAC roles are inactive.");
  }

  if (!permissionReady) {
    synchronizationIssues.push(
      "No effective RBAC permissions are currently available.",
    );
  }

  if (user.status !== "ACTIVE") {
    synchronizationIssues.push(`The local account state is ${user.status}.`);
  }

  const synchronizationHealthy = synchronizationIssues.length === 0;

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px]">
        {/* ============================================================ */}
        {/* ACTION BAR                                                   */}
        {/* ============================================================ */}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Link
            href="/list/access-control/users"
            className="inline-flex h-11 w-fit items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>

          <div className="flex flex-wrap gap-2">
            <EditUserDrawer
              user={{
                id: user.id,

                displayName: user.displayName,

                username: user.username,

                email: user.email,

                phone: user.phone,

                legacyRole: user.legacyRole,

                status: user.status,
              }}
              assignedRoleCount={assignedRoleCount}
              linkedRecordKind={linkedRecordKind}
            />

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
              <ShieldCheck className="h-4 w-4" />
              Reset Password
            </button>

            <UserMoreActions
              userId={user.id}
              displayName={user.displayName ?? "User"}
              status={user.status}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* PROFILE HERO                                                 */}
        {/* ============================================================ */}

        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {/* SOFT DECORATIVE BACKGROUND */}

          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-100/40 blur-3xl" />

          <div className="relative grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)] lg:p-8">
            {/* -------------------------------------------------------- */}
            {/* PROFILE IDENTITY                                         */}
            {/* -------------------------------------------------------- */}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 shadow-[0_18px_40px_rgba(109,40,217,0.20)]">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt={user.displayName ?? ""}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white">
                      <UserRound className="h-10 w-10 text-violet-400" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    {user.displayName}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {primaryRole ? (
                    <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-blue-700">
                      {primaryRole.name}
                    </span>
                  ) : null}

                  {user.legacyRole ? (
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
                      Legacy: {user.legacyRole}
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Mail className="h-4 w-4 text-slate-400" />

                    <span className="truncate">
                      {user.email ?? "No email address"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <span className="flex h-4 w-4 items-center justify-center font-black text-slate-400">
                      @
                    </span>

                    <span>{user.username ?? "No username"}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="font-black text-slate-700">User ID:</span>

                    <code className="break-all rounded-md bg-slate-50 px-2 py-1 text-[11px] text-slate-500">
                      {user.id}
                    </code>

                    <button
                      type="button"
                      title="Copy User ID"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-blue-600"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* ACCOUNT META                                             */}
            {/* -------------------------------------------------------- */}

            <div className="border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="space-y-5">
                <HeroMetaRow
                  icon={CalendarDays}
                  label="Joined"
                  value={formatDate(user.createdAt)}
                />

                <HeroMetaRow
                  icon={Clock3}
                  label="Last Updated"
                  value={formatRelativeDate(user.updatedAt)}
                />

                <HeroMetaRow
                  icon={ShieldCheck}
                  label="Account Status"
                  value={
                    user.status === "ACTIVE"
                      ? "Active and provisioned"
                      : user.status
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================== */}
        {/* USER DETAIL WORKSPACE                                                  */}
        {/* ====================================================================== */}

        <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
          {/* TABS */}

          <div className="border-b border-slate-100 bg-white px-2 sm:px-4">
            <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <nav className="flex min-w-max items-center">
                {userDetailTabs.map(({ key, label, icon: Icon }) => {
                  const active = tab === key;

                  return (
                    <Link
                      key={key}
                      href={`/list/access-control/users/${user.id}?tab=${key}`}
                      className={`group relative flex h-[66px] items-center gap-2.5 px-4 text-xs font-black transition sm:px-5 ${
                        active
                          ? "text-blue-600"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                          active
                            ? "bg-blue-50 text-blue-600"
                            : "bg-transparent text-slate-400 group-hover:bg-slate-50 group-hover:text-slate-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>

                      <span>{label}</span>

                      {active ? (
                        <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-blue-600" />
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* TAB BODY */}

          <div className="bg-slate-50/40 p-4 sm:p-5 lg:p-6">
            {tab === "overview" ? (
              <>
                {/* YOUR EXISTING OVERVIEW GOES HERE */}
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.65fr)]">
                  {/* ------------------------------------------------------------------ */}
                  {/* ACCOUNT INFORMATION                                                 */}
                  {/* ------------------------------------------------------------------ */}

                  <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                    {/* HEADER */}

                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600">
                          <UserRound className="h-4.5 w-4.5" />
                        </div>

                        <div>
                          <h2 className="font-black text-slate-950">
                            Account Information
                          </h2>

                          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                            Core identity and local account information
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">
                        <BadgeCheck className="h-3 w-3" />
                        Provisioned
                      </span>
                    </div>

                    {/* INFORMATION GRID */}

                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 [&>*:not(:nth-child(3n))]:xl:border-r [&>*:nth-child(odd)]:sm:border-r [&>*:nth-child(odd)]:xl:border-r-0">
                      <AccountInfoCell
                        icon={UserRound}
                        label="Display Name"
                        value={user.displayName ?? ""}
                      />

                      <AccountInfoCell
                        icon={AtSign}
                        label="Username"
                        value={user.username ?? "Not supplied"}
                      />

                      <AccountInfoCell
                        icon={Mail}
                        label="Email Address"
                        value={user.email ?? "Not supplied"}
                      />

                      <AccountInfoCell
                        icon={Phone}
                        label="Phone Number"
                        value={user.phone ?? "Not supplied"}
                      />

                      <AccountInfoCell
                        icon={ShieldCheck}
                        label="Legacy Role"
                        value={formatLegacyRole(user.legacyRole)}
                        badge
                      />

                      <AccountInfoCell
                        icon={BadgeCheck}
                        label="Account Status"
                        value={user.status}
                        status={user.status === "ACTIVE"}
                      />

                      <AccountInfoCell
                        icon={ImageIcon}
                        label="Profile Image"
                        value={
                          user.imageUrl
                            ? "Profile image available"
                            : "No profile image"
                        }
                      />

                      <AccountInfoCell
                        icon={CalendarDays}
                        label="Created"
                        value={formatDate(user.createdAt)}
                      />

                      <AccountInfoCell
                        icon={Clock3}
                        label="Last Updated"
                        value={formatRelativeDate(user.updatedAt)}
                      />
                    </div>

                    {/* USER ID FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                            <Fingerprint className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                              Universal User ID
                            </p>

                            <code className="mt-1 block truncate text-[11px] font-semibold text-slate-600">
                              {user.id}
                            </code>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Database className="h-3.5 w-3.5" />
                          Clerk ID = UserAccount ID
                        </div>
                      </div>
                    </div>
                  </article>

                  {/* ------------------------------------------------------------------ */}
                  {/* ABOUT THIS ACCOUNT                                                  */}
                  {/* ------------------------------------------------------------------ */}

                  <article className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
                    {/* SUBTLE GLOW */}

                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />

                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600">
                          <Info className="h-4.5 w-4.5" />
                        </div>

                        <div>
                          <h2 className="font-black text-slate-950">
                            About This Account
                          </h2>

                          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                            Identity management summary
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-6 text-slate-500">
                        This user was provisioned through the Access Control
                        system and is managed using Clerk authentication
                        together with the school's local RBAC identity and
                        access records.
                      </p>

                      <div className="mt-6 space-y-1">
                        <AboutAccountItem
                          icon={ShieldCheck}
                          title="Authentication"
                          value="Managed by Clerk"
                        />

                        <AboutAccountItem
                          icon={UserCog}
                          title="Application Identity"
                          value={formatLegacyRole(user.legacyRole)}
                        />

                        <AboutAccountItem
                          icon={KeyRound}
                          title="RBAC Access"
                          value={
                            primaryRole ? primaryRole.name : "No role assigned"
                          }
                        />

                        <AboutAccountItem
                          icon={Database}
                          title="Local Record"
                          value="UserAccount"
                        />

                        <AboutAccountItem
                          icon={BadgeCheck}
                          title="Account State"
                          value={
                            user.status === "ACTIVE" ? "Active" : user.status
                          }
                          positive={user.status === "ACTIVE"}
                        />
                      </div>

                      {/* ACCOUNT TYPE NOTE */}

                      <div className="mt-6 rounded-[18px] border border-blue-100 bg-blue-50/70 p-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-blue-600">
                          Account Architecture
                        </p>

                        <p className="mt-2 text-xs leading-5 text-blue-700">
                          {getAccountArchitectureDescription(user.legacyRole)}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>

                {/* ====================================================================== */}
                {/* OVERVIEW — ROLE ASSIGNMENTS + RECENT ACTIVITY                         */}
                {/* ====================================================================== */}

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.65fr)]">
                  {/* ------------------------------------------------------------------ */}
                  {/* ROLE ASSIGNMENTS                                                  */}
                  {/* ------------------------------------------------------------------ */}

                  <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                    {/* HEADER */}

                    <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-violet-50 text-violet-600">
                          <UsersRound className="h-4.5 w-4.5" />
                        </div>

                        <div>
                          <h2 className="font-black text-slate-950">
                            Role Assignments
                          </h2>

                          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                            Direct RBAC roles assigned to this account
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                        {user.roles.length}{" "}
                        {user.roles.length === 1 ? "Role" : "Roles"}
                      </span>
                    </div>

                    {/* DESKTOP TABLE */}

                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[760px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/60">
                            <RoleTableHeading>Role Name</RoleTableHeading>

                            <RoleTableHeading>Role Key</RoleTableHeading>

                            <RoleTableHeading>Type</RoleTableHeading>

                            <RoleTableHeading>Assigned By</RoleTableHeading>

                            <RoleTableHeading>Assigned At</RoleTableHeading>

                            <RoleTableHeading>Status</RoleTableHeading>
                          </tr>
                        </thead>

                        <tbody>
                          {user.roles.length > 0 ? (
                            user.roles.map((assignment) => (
                              <tr
                                key={assignment.id}
                                className="border-b border-slate-100 last:border-b-0 transition hover:bg-blue-50/30"
                              >
                                <td className="px-5 py-4 sm:px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                      <ShieldPlus className="h-4 w-4" />
                                    </div>

                                    <div>
                                      <p className="text-sm font-black text-slate-800">
                                        {assignment.role.name}
                                      </p>

                                      {assignment.role.description ? (
                                        <p className="mt-0.5 max-w-[220px] truncate text-[10px] font-medium text-slate-400">
                                          {assignment.role.description}
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4 text-xs font-bold text-slate-500">
                                  <code className="rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
                                    {assignment.role.key}
                                  </code>
                                </td>

                                <td className="px-5 py-4">
                                  <RoleTypeBadge type={assignment.role.type} />
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-xs font-bold text-slate-700">
                                    {assignment.assignedBy
                                      ? "Administrator"
                                      : "System"}
                                  </p>

                                  {assignment.assignedBy ? (
                                    <p className="mt-0.5 max-w-[150px] truncate text-[9px] font-medium text-slate-400">
                                      {assignment.assignedBy}
                                    </p>
                                  ) : null}
                                </td>

                                <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                                  {formatDateTime(assignment.assignedAt)}
                                </td>

                                <td className="px-5 py-4">
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.06em] text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={6}
                                className="px-6 py-12 text-center"
                              >
                                <UsersRound className="mx-auto h-6 w-6 text-slate-300" />

                                <p className="mt-3 text-sm font-black text-slate-500">
                                  No roles assigned
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  This account currently has no direct RBAC role
                                  assignment.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE ROLE CARDS */}

                    <div className="divide-y divide-slate-100 md:hidden">
                      {user.roles.length > 0 ? (
                        user.roles.map((assignment) => (
                          <div key={assignment.id} className="p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                                <ShieldPlus className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-black text-slate-800">
                                    {assignment.role.name}
                                  </p>

                                  <RoleTypeBadge type={assignment.role.type} />
                                </div>

                                <p className="mt-1 text-[10px] font-bold text-slate-400">
                                  {assignment.role.key}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-[14px] bg-slate-50 p-3">
                              <MobileRoleMeta
                                label="Assigned"
                                value={formatDate(assignment.assignedAt)}
                              />

                              <MobileRoleMeta
                                label="Status"
                                value="Active"
                                positive
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <UsersRound className="mx-auto h-6 w-6 text-slate-300" />

                          <p className="mt-3 text-sm font-black text-slate-500">
                            No roles assigned
                          </p>
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6">
                      <Link
                        href={`/list/access-control/users/${user.id}?tab=roles`}
                        className="inline-flex items-center gap-2 text-xs font-black text-blue-600 transition hover:text-blue-800"
                      >
                        View all roles & permissions
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>

                  {/* ------------------------------------------------------------------ */}
                  {/* RECENT ACTIVITY                                                   */}
                  {/* ------------------------------------------------------------------ */}

                  <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                    {/* HEADER */}

                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600">
                          <Activity className="h-4.5 w-4.5" />
                        </div>

                        <div>
                          <h2 className="font-black text-slate-950">
                            Recent Activity
                          </h2>

                          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                            Latest account and access-control events
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ACTIVITY TIMELINE */}

                    <div className="px-5 py-2 sm:px-6">
                      {recentAuditActivity.length > 0 ? (
                        <div>
                          {recentAuditActivity.map((activity, index) => {
                            const config = getAuditActivityConfig(
                              activity.action,
                            );

                            const Icon = config.icon;

                            const last =
                              index === recentAuditActivity.length - 1;

                            return (
                              <div
                                key={activity.id}
                                className="relative flex gap-4 py-4"
                              >
                                {/* TIMELINE */}

                                {!last ? (
                                  <div className="absolute bottom-0 left-[17px] top-[42px] w-px bg-slate-200" />
                                ) : null}

                                <div
                                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm ${config.iconClass}`}
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                </div>

                                {/* COPY */}

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-xs font-black text-slate-800">
                                        {config.title}
                                      </p>

                                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                        {getAuditActivityDescription(
                                          activity,
                                          user.displayName ?? "User",
                                        )}
                                      </p>
                                    </div>

                                    <span className="shrink-0 text-[9px] font-bold text-slate-400">
                                      {formatRelativeDate(activity.createdAt)}
                                    </span>
                                  </div>

                                  {activity.actorName ? (
                                    <p className="mt-2 text-[9px] font-semibold text-slate-400">
                                      By{" "}
                                      <span className="font-black text-slate-500">
                                        {activity.actorName}
                                      </span>
                                      {activity.actorRole
                                        ? ` · ${formatLegacyRole(
                                            activity.actorRole,
                                          )}`
                                        : ""}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-10 text-center">
                          <ClockArrowUp className="mx-auto h-6 w-6 text-slate-300" />

                          <p className="mt-3 text-sm font-black text-slate-500">
                            No recent activity
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            Access-control activity for this user will appear
                            here.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6">
                      <Link
                        href={`/list/access-control/users/${user.id}?tab=audit`}
                        className="inline-flex items-center gap-2 text-xs font-black text-blue-600 transition hover:text-blue-800"
                      >
                        View full audit log
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                </div>
              </>
            ) : null}

            {tab === "roles" ? (
              <>
                {/* ================================================================ */}
                {/* ROLES & PERMISSIONS — ACCESS SUMMARY                            */}
                {/* ================================================================ */}

                <section>
                  {/* SECTION INTRO */}

                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ShieldCheck className="h-4 w-4" />
                      </div>

                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                        Access Intelligence
                      </p>
                    </div>

                    <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                      Access Summary
                    </h2>

                    <p className="mt-1.5 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                      A consolidated view of this user's application identity,
                      assigned RBAC roles and effective authorization.
                    </p>
                  </div>

                  {/* SUMMARY GRID */}

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AccessSummaryCard
                      icon={Layers3}
                      eyebrow="RBAC Roles"
                      value={assignedRoleCount.toString()}
                      label={
                        assignedRoleCount === 1
                          ? "Assigned role"
                          : "Assigned roles"
                      }
                      description="Direct access roles attached to this user."
                      tone="blue"
                    />

                    <AccessSummaryCard
                      icon={KeyRound}
                      eyebrow="Authorization"
                      value={effectivePermissionCount.toString()}
                      label="Effective permissions"
                      description="Unique permissions inherited across all assigned roles."
                      tone="violet"
                    />

                    <AccessSummaryCard
                      icon={Fingerprint}
                      eyebrow="Application Identity"
                      value={primeRole}
                      label="Primary role"
                      description="Legacy Clerk role currently used for application routing."
                      tone="amber"
                      compactValue
                    />

                    <AccessSummaryCard
                      icon={BadgeCheck}
                      eyebrow="Account Access"
                      value={accountHasAccess ? "Active" : "Restricted"}
                      label={
                        accountHasAccess
                          ? "Access enabled"
                          : "Access restricted"
                      }
                      description={
                        accountHasAccess
                          ? "The account is active and has at least one RBAC role."
                          : "This account currently cannot receive normal RBAC access."
                      }
                      tone={accountHasAccess ? "emerald" : "rose"}
                      compactValue
                    />
                  </div>
                </section>

                {/* ================================================================ */}
                {/* ASSIGNED ROLES                                                  */}
                {/* ================================================================ */}

                <section className="mt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <Layers3 className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                          Role Membership
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Assigned Roles
                      </h2>

                      <p className="mt-1.5 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Direct roles assigned to this identity. The primary
                        application role remains protected while additional
                        system and custom roles extend the user's capabilities.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500 shadow-sm">
                        <Layers3 className="h-3 w-3" />
                        {user.roles.length}{" "}
                        {user.roles.length === 1 ? "Assignment" : "Assignments"}
                      </span>
                    </div>
                  </div>

                  {/* ROLE CARDS */}

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {user.roles.length > 0 ? (
                      user.roles.map((assignment) => {
                        const role = assignment.role;

                        const permissionCount = role.permissions.length;

                        const requiredRoleKey =
                          user.legacyRole === "account"
                            ? "accountant"
                            : user.legacyRole;

                        const required = role.key === requiredRoleKey;

                        return (
                          <AssignedRoleCard
                            key={assignment.id}
                            roleName={role.name}
                            roleKey={role.key}
                            description={role.description}
                            roleType={role.type}
                            permissionCount={permissionCount}
                            required={required}
                            protectedRole={role.isProtected}
                            assignedAt={assignment.assignedAt}
                            assignedBy={assignment.assignedBy}
                            source={assignment.source}
                          />
                        );
                      })
                    ) : (
                      <div className="lg:col-span-2 rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-slate-50 text-slate-300">
                          <Layers3 className="h-5 w-5" />
                        </div>

                        <h3 className="mt-4 font-black text-slate-700">
                          No roles assigned
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                          This identity currently has no direct RBAC role
                          assignments.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* ================================================================ */}
                {/* EFFECTIVE PERMISSIONS                                            */}
                {/* ================================================================ */}

                <section className="mt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <KeyRound className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                          Effective Authorization
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Effective Permissions
                      </h2>

                      <p className="mt-1.5 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        The final access available to this user after combining
                        all assigned roles. Duplicate permissions are
                        automatically collapsed.
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-blue-700">
                      <KeyRound className="h-3 w-3" />
                      {effectivePermissionCount} Effective
                    </span>
                  </div>

                  {effectivePermissionCount > 0 ? (
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                      {Object.entries(groupedEffectivePermissions).map(
                        ([groupKey, permissions]) => {
                          const config = getPermissionGroupConfig(groupKey);

                          const Icon = config.icon;

                          return (
                            <article
                              key={groupKey}
                              className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.04)]"
                            >
                              {/* GROUP HEADER */}

                              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${config.iconClass}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0">
                                    <h3 className="truncate text-sm font-black text-slate-900">
                                      {config.label}
                                    </h3>

                                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                                      {permissions.length}{" "}
                                      {permissions.length === 1
                                        ? "permission"
                                        : "permissions"}
                                    </p>
                                  </div>
                                </div>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-slate-500">
                                  Effective
                                </span>
                              </div>

                              {/* PERMISSIONS */}

                              <div className="divide-y divide-slate-100">
                                {permissions.map((permission) => (
                                  <div
                                    key={permission}
                                    className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/80 sm:px-6"
                                  >
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                      <Check className="h-3.5 w-3.5" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-black text-slate-700">
                                        {formatPermissionName(permission)}
                                      </p>

                                      <code className="mt-1 block break-all text-[9px] font-semibold text-slate-400">
                                        {permission}
                                      </code>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </article>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-slate-50 text-slate-300">
                        <KeyRound className="h-5 w-5" />
                      </div>

                      <h3 className="mt-4 font-black text-slate-700">
                        No effective permissions
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                        Assign an RBAC role with permissions before this account
                        can receive application access.
                      </p>
                    </div>
                  )}
                </section>

                {/* ================================================================ */}
                {/* ACCESS ARCHITECTURE / PERMISSION PROVENANCE                      */}
                {/* ================================================================ */}

                <section className="mt-6">
                  <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.045)]">
                    {/* SUBTLE BACKGROUND */}

                    <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-100/60 blur-3xl" />

                    <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-violet-100/40 blur-3xl" />

                    <div className="relative p-5 sm:p-6">
                      {/* HEADER */}

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-slate-950 text-white shadow-sm">
                            <Network className="h-4.5 w-4.5" />
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600">
                              Authorization Architecture
                            </p>

                            <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                              Access Architecture & Permission Provenance
                            </h2>

                            <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                              This account currently uses a hybrid authorization
                              model while the application transitions from
                              legacy Clerk roles to the centralized RBAC engine.
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-amber-700">
                          <GitBranch className="h-3 w-3" />
                          Migration Mode
                        </span>
                      </div>

                      {/* ACCESS FLOW */}

                      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
                        <AccessFlowCard
                          icon={Fingerprint}
                          eyebrow="Application Identity"
                          title={formatLegacyRole(user.legacyRole)}
                          description="Stored as the legacy Clerk role and still used by existing application routing and compatibility checks."
                          tone="amber"
                        />

                        <AccessFlowArrow />

                        <AccessFlowCard
                          icon={Layers3}
                          eyebrow="RBAC Membership"
                          title={`${assignedRoleCount} ${
                            assignedRoleCount === 1
                              ? "Assigned Role"
                              : "Assigned Roles"
                          }`}
                          description="System and custom roles assigned directly to the user's central UserAccount identity."
                          tone="blue"
                        />

                        <AccessFlowArrow />

                        <AccessFlowCard
                          icon={KeyRound}
                          eyebrow="Effective Authorization"
                          title={`${effectivePermissionCount} ${
                            effectivePermissionCount === 1
                              ? "Permission"
                              : "Permissions"
                          }`}
                          description="Unique permissions inherited from all assigned RBAC roles after duplicate permissions are collapsed."
                          tone="emerald"
                        />
                      </div>

                      {/* PROVENANCE EXPLANATION */}

                      <div className="mt-5 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-[18px] border border-blue-100 bg-blue-50/60 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                              <ShieldCheck className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-xs font-black text-blue-950">
                                Role-based permission inheritance
                              </p>

                              <p className="mt-1 text-[11px] leading-5 text-blue-700">
                                Permissions are not assigned directly to this
                                user. They are inherited through assigned RBAC
                                roles, which keeps access consistent, auditable
                                and easier to manage across the school.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-[18px] border border-amber-100 bg-amber-50/60 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                              <Route className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-xs font-black text-amber-950">
                                Legacy routing remains active
                              </p>

                              <p className="mt-1 text-[11px] leading-5 text-amber-700">
                                Clerk&apos;s legacy role still determines
                                existing dashboard routing and older
                                authorization checks during the migration phase.
                                RBAC currently runs alongside it until
                                enforcement is fully centralized.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SOURCE SUMMARY */}

                      <div className="mt-5 rounded-[18px] border border-slate-200 bg-slate-50/70 p-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <ProvenanceMetric
                            label="Direct Permissions"
                            value="0"
                            description="Permissions attached directly to this user"
                          />

                          <ProvenanceMetric
                            label="Role Sources"
                            value={String(assignedRoleCount)}
                            description="Assigned roles contributing access"
                          />

                          <ProvenanceMetric
                            label="Effective Permissions"
                            value={String(effectivePermissionCount)}
                            description="Final unique permissions available"
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                </section>
              </>
            ) : null}

            {tab === "audit" ? (
              <>
                {/* ================================================================ */}
                {/* ACTIVITY & AUDIT                                                */}
                {/* ================================================================ */}

                <section>
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <Activity className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                          Security & Governance
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Activity & Audit
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        A permanent administrative history of identity
                        provisioning, role assignments and access-control
                        changes associated with this account.
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500 shadow-sm">
                      <History className="h-3 w-3" />
                      {totalAuditEvents}{" "}
                      {totalAuditEvents === 1 ? "Audit Event" : "Audit Events"}
                    </span>
                  </div>

                  {/* ================================================================ */}
                  {/* AUDIT SUMMARY                                                    */}
                  {/* ================================================================ */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AuditSummaryCard
                      icon={History}
                      eyebrow="Audit History"
                      value={String(totalAuditEvents)}
                      label="Recorded events"
                      description="Total access-control audit entries recorded for this user."
                      tone="blue"
                    />

                    <AuditSummaryCard
                      icon={UserCog}
                      eyebrow="Administrative"
                      value={String(administrativeActionCount)}
                      label="Actor-driven actions"
                      description="Matching audit events performed by an identified administrative or system actor."
                      tone="violet"
                    />

                    <AuditSummaryCard
                      icon={ShieldPlus}
                      eyebrow="Role Security"
                      value={String(roleChangeCount)}
                      label="Role changes"
                      description="Matching role assignments and removals affecting this identity."
                      tone="amber"
                    />

                    <AuditSummaryCard
                      icon={Clock3}
                      eyebrow="Latest Activity"
                      value={
                        latestAuditEvent
                          ? formatRelativeDate(latestAuditEvent.createdAt)
                          : "None"
                      }
                      label={
                        latestAuditEvent
                          ? formatAuditAction(latestAuditEvent.action)
                          : "No activity recorded"
                      }
                      description={
                        latestAuditEvent
                          ? `Most recent audit event recorded ${formatDateTime(
                              latestAuditEvent.createdAt,
                            )}.`
                          : "No access-control activity has been recorded for this account."
                      }
                      tone={latestAuditEvent ? "emerald" : "slate"}
                      compact
                    />
                  </div>

                  {/* ================================================================ */}
                  {/* AUDIT INTEGRITY NOTICE                                          */}
                  {/* ================================================================ */}

                  <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Fingerprint className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-black text-blue-950">
                        Audit integrity
                      </p>

                      <p className="mt-1 max-w-4xl text-[11px] leading-5 text-blue-700">
                        These records document administrative access-control
                        activity associated with this user, including who
                        performed an action, what changed, and when it occurred.
                        Audit history should remain immutable from ordinary
                        user-management workflows.
                      </p>
                    </div>
                  </div>

                  {/* ================================================================ */}
                  {/* AUDIT FILTERS                                                    */}
                  {/* ================================================================ */}

                  <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-[13px] bg-slate-100 text-slate-600">
                            <SlidersHorizontal className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
                              Audit Controls
                            </p>

                            <h3 className="mt-1 font-black text-slate-900">
                              Filter activity
                            </h3>
                          </div>
                        </div>

                        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                          Narrow this user&apos;s audit history by action, actor
                          or date range.
                        </p>
                      </div>

                      <Link
                        href={buildAuditHref({
                          userId: user.id,

                          page: 1,

                          pageSize: auditPagination.pageSize,
                        })}
                        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset Filters
                      </Link>
                    </div>

                    <form
                      action={`/list/access-control/users/${user.id}`}
                      method="GET"
                      className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                    >
                      <input type="hidden" name="tab" value="audit" />

                      <input type="hidden" name="auditPage" value="1" />

                      <input
                        type="hidden"
                        name="auditPageSize"
                        value={auditPagination.pageSize}
                      />

                      {/* ACTION */}

                      <label className="block">
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                          Action
                        </span>

                        <select
                          name="auditAction"
                          defaultValue={auditAction}
                          className="mt-2 h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="">All actions</option>

                          {Object.values(AccessAuditAction).map((action) => (
                            <option key={action} value={action}>
                              {formatAuditAction(action)}
                            </option>
                          ))}
                        </select>
                      </label>

                      {/* ACTOR */}

                      <label className="block">
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                          Actor
                        </span>

                        <select
                          name="auditActor"
                          defaultValue={auditActor}
                          className="mt-2 h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="">All actors</option>

                          {auditActors.map((actor) => (
                            <option
                              key={actor.actorId ?? "system"}
                              value={actor.actorId ?? ""}
                            >
                              {actor.actorName ?? actor.actorId ?? "System"}
                            </option>
                          ))}
                        </select>
                      </label>

                      {/* FROM */}

                      <label className="block">
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                          From
                        </span>

                        <input
                          type="date"
                          name="auditFrom"
                          defaultValue={auditFrom}
                          className="mt-2 h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />
                      </label>

                      {/* TO */}

                      <label className="block">
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                          To
                        </span>

                        <input
                          type="date"
                          name="auditTo"
                          defaultValue={auditTo}
                          className="mt-2 h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                        />
                      </label>

                      <div className="md:col-span-2 xl:col-span-4">
                        <button
                          type="submit"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-blue-700"
                        >
                          <Search className="h-3.5 w-3.5" />
                          Apply Filters
                        </button>
                      </div>
                    </form>

                    {/* QUICK PRESETS */}

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                        Quick presets
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <AuditPresetLink
                          href={buildAuditHref({
                            userId: user.id,

                            page: 1,

                            pageSize: auditPagination.pageSize,
                          })}
                          label="All activity"
                          active={
                            !auditAction &&
                            !auditActor &&
                            !auditFrom &&
                            !auditTo
                          }
                        />

                        <AuditPresetLink
                          href={buildAuditHref({
                            userId: user.id,

                            page: 1,

                            pageSize: auditPagination.pageSize,

                            action: "ROLE_ASSIGNED",
                          })}
                          label="Role assignments"
                          active={
                            auditAction === "ROLE_ASSIGNED" &&
                            !auditActor &&
                            !auditFrom &&
                            !auditTo
                          }
                        />

                        <AuditPresetLink
                          href={buildAuditHref({
                            userId: user.id,

                            page: 1,

                            pageSize: auditPagination.pageSize,

                            action: "ROLE_REMOVED",
                          })}
                          label="Role removals"
                          active={
                            auditAction === "ROLE_REMOVED" &&
                            !auditActor &&
                            !auditFrom &&
                            !auditTo
                          }
                        />

                        <AuditPresetLink
                          href={buildAuditHref({
                            userId: user.id,

                            page: 1,

                            pageSize: auditPagination.pageSize,

                            action: "USER_CREATED",
                          })}
                          label="Provisioning"
                          active={
                            auditAction === "USER_CREATED" &&
                            !auditActor &&
                            !auditFrom &&
                            !auditTo
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* ================================================================ */}
                  {/* ACTOR / ACTION BREAKDOWN                                         */}
                  {/* ================================================================ */}

                  <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    {/* ACTION BREAKDOWN */}

                    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-blue-600">
                            Action Distribution
                          </p>

                          <h3 className="mt-1 text-base font-black text-slate-900">
                            Actions recorded
                          </h3>
                        </div>

                        <Activity className="h-5 w-5 text-blue-500" />
                      </div>

                      <div className="mt-5 space-y-4">
                        {Object.entries(actionBreakdown)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 6)
                          .map(([action, count]) => {
                            const percentage =
                              totalAuditEvents > 0
                                ? Math.round((count / totalAuditEvents) * 100)
                                : 0;

                            return (
                              <BreakdownRow
                                key={action}
                                label={formatAuditAction(action)}
                                count={count}
                                percentage={percentage}
                              />
                            );
                          })}

                        {Object.keys(actionBreakdown).length === 0 ? (
                          <EmptyBreakdown text="No action activity found for the current filters." />
                        ) : null}
                      </div>
                    </article>

                    {/* ACTOR BREAKDOWN */}

                    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.04)] sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-violet-600">
                            Actor Distribution
                          </p>

                          <h3 className="mt-1 text-base font-black text-slate-900">
                            Who generated activity
                          </h3>
                        </div>

                        <UserCog className="h-5 w-5 text-violet-500" />
                      </div>

                      <div className="mt-5 space-y-3">
                        {Object.entries(actorBreakdown)
                          .sort((a, b) => b[1].count - a[1].count)
                          .slice(0, 6)
                          .map(([key, actor]) => (
                            <ActorBreakdownRow
                              key={key}
                              actorName={
                                actor.actorName ??
                                (actor.actorId
                                  ? shortenIdentifier(actor.actorId)
                                  : "System")
                              }
                              actorRole={actor.actorRole}
                              count={actor.count}
                            />
                          ))}

                        {Object.keys(actorBreakdown).length === 0 ? (
                          <EmptyBreakdown text="No actor activity found for the current filters." />
                        ) : null}
                      </div>
                    </article>
                  </div>
                </section>

                {/* ================================================================ */}
                {/* FULL AUDIT TIMELINE                                              */}
                {/* ================================================================ */}

                <section className="mt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
                          <History className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
                          Administrative History
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Full Audit Timeline
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        A chronological record of provisioning, role changes and
                        access-control activity associated with this identity.
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500 shadow-sm">
                      <Activity className="h-3 w-3" />
                      {auditEvents.length} shown
                    </span>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                    {auditEvents.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {auditEvents.map((activity, index) => {
                          const config = getAuditTimelineConfig(
                            activity.action,
                          );

                          const Icon = config.icon;

                          const role = activity.roleId
                            ? user.roles.find(
                                (assignment) =>
                                  assignment.roleId === activity.roleId,
                              )?.role
                            : null;

                          return (
                            <article
                              key={activity.id}
                              className="group relative px-5 py-5 transition hover:bg-slate-50/60 sm:px-6"
                            >
                              <div className="flex gap-4">
                                {/* TIMELINE COLUMN */}

                                <div className="relative flex shrink-0 flex-col items-center">
                                  <div
                                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white ${config.iconClass}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  {index !== auditEvents.length - 1 ? (
                                    <div className="absolute bottom-[-20px] top-10 w-px bg-slate-200" />
                                  ) : null}
                                </div>

                                {/* CONTENT */}

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-black text-slate-900">
                                          {config.title}
                                        </h3>

                                        <span
                                          className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${config.badgeClass}`}
                                        >
                                          {formatAuditAction(activity.action)}
                                        </span>
                                      </div>

                                      <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
                                        {getFullAuditDescription(
                                          activity,
                                          user.displayName ?? "User",
                                          role?.name ?? null,
                                        )}
                                      </p>
                                    </div>

                                    <div className="shrink-0 text-left lg:text-right">
                                      <p className="text-[10px] font-black text-slate-500">
                                        {formatDateTime(activity.createdAt)}
                                      </p>

                                      <p className="mt-1 text-[9px] font-bold text-slate-400">
                                        {formatRelativeDate(activity.createdAt)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* ACTOR + ROLE */}

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <AuditContextPill
                                      icon={UserCog}
                                      label="Actor"
                                      value={
                                        activity.actorName ??
                                        (activity.actorId
                                          ? shortenIdentifier(activity.actorId)
                                          : "System")
                                      }
                                    />

                                    <AuditContextPill
                                      icon={ShieldCheck}
                                      label="Actor Role"
                                      value={
                                        activity.actorRole
                                          ? formatLegacyRole(activity.actorRole)
                                          : "System"
                                      }
                                    />

                                    {role ? (
                                      <AuditContextPill
                                        icon={KeyRound}
                                        label="Affected Role"
                                        value={role.name}
                                      />
                                    ) : null}

                                    <AuditContextPill
                                      icon={Fingerprint}
                                      label="Event ID"
                                      value={String(activity.id)}
                                    />
                                  </div>

                                  {/* EXPANDABLE DETAIL */}

                                  <details className="group mt-4 overflow-hidden rounded-[16px] border border-slate-200 bg-slate-50/70 open:bg-white">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
                                      <span className="inline-flex items-center gap-2">
                                        <Database className="h-3.5 w-3.5 text-slate-400" />
                                        View audit details
                                      </span>

                                      <ChevronDown className="group-open:rotate-180 h-4 w-4 text-slate-400 transition group-open:rotate-180" />
                                    </summary>

                                    <div className="border-t border-slate-100 px-4 py-4">
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <AuditDetailItem
                                          label="Action"
                                          value={activity.action}
                                        />

                                        <AuditDetailItem
                                          label="Created At"
                                          value={activity.createdAt.toISOString()}
                                        />

                                        <AuditDetailItem
                                          label="Actor ID"
                                          value={
                                            activity.actorId ??
                                            "System / not recorded"
                                          }
                                        />

                                        <AuditDetailItem
                                          label="Actor Role"
                                          value={
                                            activity.actorRole ??
                                            "System / not recorded"
                                          }
                                        />

                                        <AuditDetailItem
                                          label="Target User"
                                          value={
                                            activity.targetUserId ??
                                            "Not recorded"
                                          }
                                        />

                                        <AuditDetailItem
                                          label="Role ID"
                                          value={
                                            activity.roleId
                                              ? String(activity.roleId)
                                              : "Not applicable"
                                          }
                                        />
                                      </div>

                                      {/* METADATA */}

                                      <div className="mt-4">
                                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                          Metadata
                                        </p>

                                        <div className="mt-2 overflow-x-auto rounded-[14px] border border-slate-200 bg-slate-950 p-4">
                                          <pre className="min-w-max whitespace-pre-wrap break-words text-[10px] leading-5 text-slate-300">
                                            {formatAuditMetadata(
                                              activity.metadata,
                                            )}
                                          </pre>
                                        </div>
                                      </div>
                                    </div>
                                  </details>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-slate-50 text-slate-300">
                          <History className="h-6 w-6" />
                        </div>

                        <h3 className="mt-4 font-black text-slate-700">
                          No audit activity found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                          No access-control events match the current filters for
                          this user.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* ================================================================ */}
                {/* DETAILED AUDIT HISTORY                                           */}
                {/* ================================================================ */}

                <section className="mt-6">
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
                          <TableProperties className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
                          Administrative Records
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Detailed Audit History
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Structured access-control records for reviewing
                        administrative actions, affected roles, actors and event
                        metadata.
                      </p>
                    </div>

                    {/* EXPORT — VISUAL FOUNDATION FOR NOW */}

                    <button
                      type="button"
                      disabled
                      title="Audit export will be enabled when the export service is connected."
                      className="inline-flex h-10 w-fit cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-400 opacity-70 shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export CSV
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.08em] text-slate-400">
                        Soon
                      </span>
                    </button>
                  </div>

                  {/* TABLE CONTAINER */}

                  <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                    {/* TABLE META BAR */}

                    <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                          <Database className="h-3 w-3" />
                          {auditPagination.totalRecords}{" "}
                          {auditPagination.totalRecords === 1
                            ? "record"
                            : "records"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                          Page {auditPagination.page}
                          {" / "}
                          {auditPagination.totalPages}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">
                          <ShieldCheck className="h-3 w-3" />
                          Audit Protected
                        </span>
                      </div>

                      <p className="text-[9px] font-bold text-slate-400">
                        Newest activity first
                      </p>
                    </div>

                    {auditEvents.length > 0 ? (
                      <>
                        {/* ============================================================ */}
                        {/* DESKTOP TABLE                                                */}
                        {/* ============================================================ */}

                        <div className="hidden overflow-x-auto lg:block">
                          <table className="w-full min-w-[1050px] border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 bg-white">
                                <AuditTableHeading>Event</AuditTableHeading>

                                <AuditTableHeading>Action</AuditTableHeading>

                                <AuditTableHeading>Actor</AuditTableHeading>

                                <AuditTableHeading>
                                  Affected Role
                                </AuditTableHeading>

                                <AuditTableHeading>
                                  Date & Time
                                </AuditTableHeading>

                                <AuditTableHeading>Metadata</AuditTableHeading>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                              {auditEvents.map((activity) => {
                                const config = getAuditTimelineConfig(
                                  activity.action,
                                );

                                const Icon = config.icon;

                                const role = activity.roleId
                                  ? user.roles.find(
                                      (assignment) =>
                                        assignment.roleId === activity.roleId,
                                    )?.role
                                  : null;

                                return (
                                  <tr
                                    key={activity.id}
                                    className="group transition-colors hover:bg-slate-50/70"
                                  >
                                    {/* EVENT */}

                                    <td className="px-5 py-4 align-middle">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
                                        >
                                          <Icon className="h-3.5 w-3.5" />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="max-w-[180px] truncate text-xs font-black text-slate-800">
                                            {config.title}
                                          </p>

                                          <p className="mt-1 font-mono text-[8px] font-bold text-slate-400">
                                            EVENT-{activity.id}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* ACTION */}

                                    <td className="px-5 py-4 align-middle">
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${config.badgeClass}`}
                                      >
                                        {formatAuditAction(activity.action)}
                                      </span>
                                    </td>

                                    {/* ACTOR */}

                                    <td className="px-5 py-4 align-middle">
                                      <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                          <UserCog className="h-3.5 w-3.5" />
                                        </div>

                                        <div className="min-w-0">
                                          <p className="max-w-[150px] truncate text-[11px] font-black text-slate-700">
                                            {activity.actorName ??
                                              (activity.actorId
                                                ? shortenIdentifier(
                                                    activity.actorId,
                                                  )
                                                : "System")}
                                          </p>

                                          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.07em] text-slate-400">
                                            {activity.actorRole
                                              ? formatLegacyRole(
                                                  activity.actorRole,
                                                )
                                              : "System"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* ROLE */}

                                    <td className="px-5 py-4 align-middle">
                                      {role ? (
                                        <div>
                                          <p className="text-[11px] font-black text-slate-700">
                                            {role.name}
                                          </p>

                                          <p className="mt-0.5 font-mono text-[8px] text-slate-400">
                                            {role.key}
                                          </p>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] font-bold text-slate-300">
                                          —
                                        </span>
                                      )}
                                    </td>

                                    {/* DATE */}

                                    <td className="px-5 py-4 align-middle">
                                      <div className="flex items-start gap-2">
                                        <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />

                                        <div>
                                          <p className="whitespace-nowrap text-[10px] font-black text-slate-600">
                                            {formatDateTime(activity.createdAt)}
                                          </p>

                                          <p className="mt-1 whitespace-nowrap text-[8px] font-bold text-slate-400">
                                            {formatRelativeDate(
                                              activity.createdAt,
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    {/* METADATA */}

                                    <td className="px-5 py-4 align-middle">
                                      <details className="group/details relative">
                                        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-black text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 [&::-webkit-details-marker]:hidden">
                                          <Braces className="h-3 w-3" />
                                          Inspect
                                          <ChevronDown className="h-3 w-3 transition group-open/details:rotate-180" />
                                        </summary>

                                        <div className="mt-2 max-w-[280px] overflow-x-auto rounded-xl bg-slate-950 p-3 shadow-lg">
                                          <pre className="whitespace-pre-wrap break-words text-[9px] leading-4 text-slate-300">
                                            {formatAuditMetadata(
                                              activity.metadata,
                                            )}
                                          </pre>
                                        </div>
                                      </details>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* ============================================================ */}
                        {/* MOBILE / TABLET RECORD CARDS                                 */}
                        {/* ============================================================ */}

                        <div className="divide-y divide-slate-100 lg:hidden">
                          {auditEvents.map((activity) => {
                            const config = getAuditTimelineConfig(
                              activity.action,
                            );

                            const Icon = config.icon;

                            const role = activity.roleId
                              ? user.roles.find(
                                  (assignment) =>
                                    assignment.roleId === activity.roleId,
                                )?.role
                              : null;

                            return (
                              <article key={activity.id} className="p-5">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div>
                                        <p className="text-xs font-black text-slate-800">
                                          {config.title}
                                        </p>

                                        <p className="mt-1 font-mono text-[8px] font-bold text-slate-400">
                                          EVENT-{activity.id}
                                        </p>
                                      </div>

                                      <span
                                        className={`rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-[0.06em] ${config.badgeClass}`}
                                      >
                                        {formatAuditAction(activity.action)}
                                      </span>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                      <MobileAuditValue
                                        label="Actor"
                                        value={
                                          activity.actorName ??
                                          (activity.actorId
                                            ? shortenIdentifier(
                                                activity.actorId,
                                              )
                                            : "System")
                                        }
                                      />

                                      <MobileAuditValue
                                        label="Actor Role"
                                        value={
                                          activity.actorRole
                                            ? formatLegacyRole(
                                                activity.actorRole,
                                              )
                                            : "System"
                                        }
                                      />

                                      <MobileAuditValue
                                        label="Affected Role"
                                        value={role?.name ?? "Not applicable"}
                                      />

                                      <MobileAuditValue
                                        label="Timestamp"
                                        value={formatDateTime(
                                          activity.createdAt,
                                        )}
                                      />
                                    </div>

                                    <details className="group/details mt-4 overflow-hidden rounded-xl border border-slate-200">
                                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 text-[10px] font-black text-slate-500 [&::-webkit-details-marker]:hidden">
                                        <span className="inline-flex items-center gap-2">
                                          <Braces className="h-3.5 w-3.5" />
                                          Event metadata
                                        </span>

                                        <ChevronDown className="h-3.5 w-3.5 transition group-open/details:rotate-180" />
                                      </summary>

                                      <div className="border-t border-slate-100 bg-slate-950 p-3.5">
                                        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[9px] leading-4 text-slate-300">
                                          {formatAuditMetadata(
                                            activity.metadata,
                                          )}
                                        </pre>
                                      </div>
                                    </details>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>

                        {/* ============================================================ */}
                        {/* AUDIT PAGINATION                                             */}
                        {/* ============================================================ */}

                        <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                          <div>
                            <p className="text-[10px] font-black text-slate-600">
                              {auditPagination.totalRecords === 0 ? (
                                <>No audit records</>
                              ) : (
                                <>
                                  Showing{" "}
                                  {(auditPagination.page - 1) *
                                    auditPagination.pageSize +
                                    1}
                                  {" – "}
                                  {Math.min(
                                    auditPagination.page *
                                      auditPagination.pageSize,
                                    auditPagination.totalRecords,
                                  )}{" "}
                                  of {auditPagination.totalRecords} audit
                                  records
                                </>
                              )}
                            </p>

                            <p className="mt-1 text-[9px] font-medium text-slate-400">
                              Page {auditPagination.page} of{" "}
                              {auditPagination.totalPages}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {previousAuditHref ? (
                              <Link
                                href={previousAuditHref}
                                scroll={false}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Previous
                              </Link>
                            ) : (
                              <span className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-300 opacity-60">
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Previous
                              </span>
                            )}

                            <div className="hidden items-center gap-1 sm:flex">
                              <span className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-slate-950 px-3 text-[10px] font-black text-white shadow-sm">
                                {auditPagination.page}
                              </span>

                              <span className="px-1 text-[9px] font-black text-slate-300">
                                /
                              </span>

                              <span className="flex h-9 min-w-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500">
                                {auditPagination.totalPages}
                              </span>
                            </div>

                            {nextAuditHref ? (
                              <Link
                                href={nextAuditHref}
                                scroll={false}
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              >
                                Next
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            ) : (
                              <span className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-300 opacity-60">
                                Next
                                <ChevronRight className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-slate-50 text-slate-300">
                          <TableProperties className="h-6 w-6" />
                        </div>

                        <h3 className="mt-4 font-black text-slate-700">
                          No audit records found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                          No structured audit records match the current filters
                          for this user.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : null}

            {tab === "account" ? (
              <>
                {/* ================================================================ */}
                {/* ACCOUNT ACTIVITY                                                */}
                {/* ================================================================ */}

                <section>
                  {/* ------------------------------------------------------------ */}
                  {/* HEADER                                                       */}
                  {/* ------------------------------------------------------------ */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <History className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                          Identity Operations
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Account Activity
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Authentication, provisioning, lifecycle and
                        access-health information for this school identity.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />

                        {user.status}
                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500 shadow-sm">
                        <Fingerprint className="h-3 w-3" />
                        Central Identity
                      </span>
                    </div>
                  </div>

                  {/* ------------------------------------------------------------ */}
                  {/* ACCOUNT HEALTH CARDS                                        */}
                  {/* ------------------------------------------------------------ */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <AccountHealthCard
                      icon={HeartPulse}
                      eyebrow="Account State"
                      value={
                        user.status === "ACTIVE"
                          ? "Healthy"
                          : formatLegacyRole(user.status)
                      }
                      label={
                        user.status === "ACTIVE"
                          ? "Active account"
                          : "Restricted account"
                      }
                      description={
                        user.status === "ACTIVE"
                          ? "The local UserAccount is active and available for application access."
                          : "This identity is not currently in the normal ACTIVE account state."
                      }
                      tone={user.status === "ACTIVE" ? "emerald" : "slate"}
                    />

                    <AccountHealthCard
                      icon={CircleCheckBig}
                      eyebrow="Provisioning"
                      value={primaryRole ? "Complete" : "Attention"}
                      label={
                        primaryRole
                          ? "Identity provisioned"
                          : "Role assignment missing"
                      }
                      description={
                        primaryRole
                          ? "The account has a local identity together with an assigned RBAC role."
                          : "The local identity exists, but no RBAC role assignment is currently available."
                      }
                      tone={primaryRole ? "blue" : "amber"}
                    />

                    <AccountHealthCard
                      icon={ServerCog}
                      eyebrow="Authentication"
                      value="Clerk"
                      label="Identity provider"
                      description="Authentication credentials and sign-in identity are managed by Clerk while school profile data remains local."
                      tone="violet"
                    />

                    <AccountHealthCard
                      icon={ShieldEllipsis}
                      eyebrow="RBAC Access"
                      value={accountHasAccess ? "Active" : "Limited"}
                      label={`${effectivePermissionCount} ${
                        effectivePermissionCount === 1
                          ? "permission"
                          : "permissions"
                      }`}
                      description={
                        accountHasAccess
                          ? `${assignedRoleCount} assigned ${
                              assignedRoleCount === 1 ? "role is" : "roles are"
                            } currently contributing effective application access.`
                          : "This account does not currently have a complete active RBAC access state."
                      }
                      tone={accountHasAccess ? "emerald" : "amber"}
                    />
                  </div>

                  {/* ------------------------------------------------------------ */}
                  {/* ACCOUNT HEALTH STRIP                                        */}
                  {/* ------------------------------------------------------------ */}

                  <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                    <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                      <AccountHealthStatus
                        icon={Database}
                        label="Local Identity"
                        value="UserAccount"
                        healthy
                      />

                      <AccountHealthStatus
                        icon={ShieldCheck}
                        label="Authentication"
                        value="Managed by Clerk"
                        healthy
                      />

                      <AccountHealthStatus
                        icon={KeyRound}
                        label="Primary Access"
                        value={primaryRole?.name ?? "Not assigned"}
                        healthy={Boolean(primaryRole)}
                      />

                      <AccountHealthStatus
                        icon={ShieldCheck}
                        label="Effective Access"
                        value={accountHasAccess ? "Ready" : "Needs attention"}
                        healthy={accountHasAccess}
                      />
                    </div>
                  </div>
                </section>
                {/* ================================================================ */}
                {/* AUTHENTICATION & IDENTITY                                       */}
                {/* ================================================================ */}

                <section className="mt-6">
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Fingerprint className="h-4 w-4" />
                      </div>

                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                        Identity Architecture
                      </p>
                    </div>

                    <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                      Authentication & Identity
                    </h2>

                    <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                      Authentication is managed externally by Clerk while the
                      school maintains its own local identity, routing role and
                      RBAC authorization records.
                    </p>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    {/* -------------------------------------------------------------- */}
                    {/* AUTHENTICATION PROVIDER                                        */}
                    {/* -------------------------------------------------------------- */}

                    <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-100/60 blur-3xl" />

                      <div className="relative border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-violet-50 text-violet-600">
                              <CloudCog className="h-[18px] w-[18px]" />
                            </div>

                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-violet-600">
                                Authentication Provider
                              </p>

                              <h3 className="mt-1 text-base font-black text-slate-950">
                                Clerk Identity
                              </h3>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-emerald-700">
                            <BadgeCheck className="h-3 w-3" />
                            Connected
                          </span>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-slate-500">
                          Clerk owns authentication credentials and sign-in
                          identity. The school application references the same
                          universal user identifier for its local records.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2">
                        <IdentityInfoItem
                          icon={Fingerprint}
                          label="Universal User ID"
                          value={user.id}
                          mono
                        />

                        <IdentityInfoItem
                          icon={UserRound}
                          label="Display Name"
                          value={user.displayName ?? "Not supplied"}
                        />

                        <IdentityInfoItem
                          icon={AtSign}
                          label="Username"
                          value={user.username ?? "Not supplied"}
                        />

                        <IdentityInfoItem
                          icon={Mail}
                          label="Email Address"
                          value={user.email ?? "Not supplied"}
                        />

                        <IdentityInfoItem
                          icon={ShieldCheck}
                          label="Account Status"
                          value={user.status}
                          positive={user.status === "ACTIVE"}
                        />

                        <IdentityInfoItem
                          icon={Route}
                          label="Legacy Routing Role"
                          value={formatLegacyRole(user.legacyRole)}
                        />
                      </div>
                    </article>

                    {/* -------------------------------------------------------------- */}
                    {/* APPLICATION IDENTITY                                           */}
                    {/* -------------------------------------------------------------- */}

                    <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/60 blur-3xl" />

                      <div className="relative border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-blue-50 text-blue-600">
                              <Database className="h-[18px] w-[18px]" />
                            </div>

                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-blue-600">
                                School Identity
                              </p>

                              <h3 className="mt-1 text-base font-black text-slate-950">
                                Local Application Identity
                              </h3>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-blue-700">
                            <Database className="h-3 w-3" />
                            UserAccount
                          </span>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-slate-500">
                          The local UserAccount connects the external Clerk
                          identity to school roles, permissions, profiles and
                          auditable access-control records.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2">
                        <IdentityInfoItem
                          icon={Database}
                          label="Local Record"
                          value="UserAccount"
                        />

                        <IdentityInfoItem
                          icon={Fingerprint}
                          label="Identity Match"
                          value="Clerk ID = UserAccount ID"
                          positive
                        />

                        <IdentityInfoItem
                          icon={ShieldCheck}
                          label="Primary RBAC Role"
                          value={primaryRole?.name ?? "Not assigned"}
                          positive={Boolean(primaryRole)}
                        />

                        <IdentityInfoItem
                          icon={KeyRound}
                          label="Assigned Roles"
                          value={`${assignedRoleCount} ${
                            assignedRoleCount === 1 ? "role" : "roles"
                          }`}
                        />

                        <IdentityInfoItem
                          icon={KeyRound}
                          label="Effective Permissions"
                          value={`${effectivePermissionCount} ${
                            effectivePermissionCount === 1
                              ? "permission"
                              : "permissions"
                          }`}
                          positive={effectivePermissionCount > 0}
                        />

                        <IdentityInfoItem
                          icon={Route}
                          label="Routing Mode"
                          value="Legacy Clerk role + RBAC"
                        />
                      </div>
                    </article>
                  </div>

                  {/* -------------------------------------------------------------- */}
                  {/* IDENTITY RELATIONSHIP STRIP                                    */}
                  {/* -------------------------------------------------------------- */}

                  <div className="mt-5 rounded-[20px] border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-blue-600 text-white">
                          <Fingerprint className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-xs font-black text-blue-950">
                            Unified identity relationship
                          </p>

                          <p className="mt-1 max-w-3xl text-[11px] leading-5 text-blue-700">
                            The external Clerk user and local UserAccount
                            intentionally share the same identifier. This allows
                            authentication, school identity and RBAC
                            authorization to resolve to one person without
                            maintaining a separate identity mapping table.
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-blue-100 bg-white px-3 py-2 font-mono text-[9px] font-bold text-blue-700 shadow-sm">
                          {shortenIdentifier(user.id)}
                        </span>

                        <span className="text-xs font-black text-blue-400">
                          =
                        </span>

                        <span className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-blue-700 shadow-sm">
                          UserAccount
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
                {/* ================================================================ */}
                {/* ACCOUNT LIFECYCLE                                                */}
                {/* ================================================================ */}

                <section className="mt-6">
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Milestone className="h-4 w-4" />
                      </div>

                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">
                        Identity Lifecycle
                      </p>
                    </div>

                    <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                      Account Lifecycle
                    </h2>

                    <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                      A lifecycle view of when this account was created, how it
                      entered the access-control system and its current
                      operational state.
                    </p>
                  </div>

                  {/* SUMMARY CARDS */}

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <LifecycleMetricCard
                      icon={CalendarClock}
                      eyebrow="Created"
                      value={formatDate(user.createdAt)}
                      label="Account creation"
                      description={`Created ${formatRelativeDate(
                        user.createdAt,
                      )}.`}
                      tone="blue"
                    />

                    <LifecycleMetricCard
                      icon={Clock4}
                      eyebrow="Last Updated"
                      value={formatDate(user.updatedAt)}
                      label="Local identity update"
                      description={`Last changed ${formatRelativeDate(
                        user.updatedAt,
                      )}.`}
                      tone="violet"
                    />

                    <LifecycleMetricCard
                      icon={TimerReset}
                      eyebrow="Account Age"
                      value={formatAccountAge(user.createdAt)}
                      label="Time in system"
                      description="Calculated from the local UserAccount creation timestamp."
                      tone="amber"
                    />

                    <LifecycleMetricCard
                      icon={HeartPulse}
                      eyebrow="Lifecycle State"
                      value={user.status === "ACTIVE" ? "Active" : user.status}
                      label={
                        user.status === "ACTIVE" ? "Operational" : "Restricted"
                      }
                      description={
                        user.status === "ACTIVE"
                          ? "This account is currently in the normal operational state."
                          : "This identity is currently outside the normal ACTIVE state."
                      }
                      tone={user.status === "ACTIVE" ? "emerald" : "slate"}
                    />
                  </div>

                  {/* LIFECYCLE FLOW */}

                  <article className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-950 text-white">
                          <GitCommitHorizontal className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="font-black text-slate-950">
                            Lifecycle Progress
                          </h3>

                          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                            Current progression through identity and access
                            provisioning
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
                        <LifecycleStage
                          number="01"
                          title="Account Created"
                          description={formatDateTime(user.createdAt)}
                          complete
                        />

                        <LifecycleArrow />

                        <LifecycleStage
                          number="02"
                          title="Identity Linked"
                          description="Clerk identity connected to local UserAccount."
                          complete
                        />

                        <LifecycleArrow />

                        <LifecycleStage
                          number="03"
                          title="RBAC Assigned"
                          description={
                            assignedRoleCount > 0
                              ? `${assignedRoleCount} ${
                                  assignedRoleCount === 1
                                    ? "role assigned"
                                    : "roles assigned"
                                }.`
                              : "No RBAC role assignment found."
                          }
                          complete={assignedRoleCount > 0}
                        />

                        <LifecycleArrow />

                        <LifecycleStage
                          number="04"
                          title="Current State"
                          description={
                            user.status === "ACTIVE"
                              ? "Active and operational."
                              : `Current state: ${user.status}.`
                          }
                          complete={user.status === "ACTIVE"}
                        />
                      </div>
                    </div>
                  </article>

                  {/* PROVISIONING ORIGIN */}

                  <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
                    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:p-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-blue-600">
                        Provisioning Origin
                      </p>

                      <h3 className="mt-2 font-black text-slate-900">
                        {getProvisioningOrigin(user.roles)}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {getProvisioningOriginDescription(user.roles)}
                      </p>
                    </article>

                    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:p-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-violet-600">
                        Current Authorization State
                      </p>

                      <h3 className="mt-2 font-black text-slate-900">
                        {accountHasAccess
                          ? "Access Ready"
                          : "Access Needs Attention"}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {accountHasAccess
                          ? `${assignedRoleCount} assigned ${
                              assignedRoleCount === 1 ? "role is" : "roles are"
                            } contributing ${effectivePermissionCount} effective ${
                              effectivePermissionCount === 1
                                ? "permission"
                                : "permissions"
                            }.`
                          : "The account does not currently satisfy the full active RBAC access state."}
                      </p>
                    </article>
                  </div>
                </section>

                {/* ================================================================ */}
                {/* PROVISIONING & RBAC SYNCHRONIZATION                              */}
                {/* ================================================================ */}

                <section className="mt-6">
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                            synchronizationHealthy
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          <GitCompareArrows className="h-4 w-4" />
                        </div>

                        <p
                          className={`text-[10px] font-black uppercase tracking-[0.16em] ${
                            synchronizationHealthy
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          Access Synchronization
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Provisioning & RBAC Synchronization
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Diagnostic checks comparing the account&apos;s legacy
                        application identity with its required RBAC role, role
                        assignments and effective authorization state.
                      </p>
                    </div>

                    <SynchronizationBadge
                      healthy={synchronizationHealthy}
                      issueCount={synchronizationIssues.length}
                    />
                  </div>

                  {/* DIAGNOSTIC CARDS */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SynchronizationCard
                      icon={Waypoints}
                      eyebrow="Legacy Mapping"
                      title={legacyRoleMapped ? "Mapped" : "Unmapped"}
                      value={
                        user.legacyRole
                          ? `${formatLegacyRole(user.legacyRole)} → ${
                              expectedAccessRoleKey ?? "Unknown"
                            }`
                          : "No legacy role"
                      }
                      description={
                        legacyRoleMapped
                          ? "The legacy application role resolves to a recognized RBAC system role."
                          : "The application role cannot currently be resolved to a known RBAC role."
                      }
                      healthy={legacyRoleMapped}
                    />

                    <SynchronizationCard
                      icon={ShieldCheck}
                      eyebrow="Required Role"
                      title={primaryRoleAssigned ? "Assigned" : "Missing"}
                      value={expectedAccessRoleKey ?? "Not resolved"}
                      description={
                        primaryRoleAssigned
                          ? "The required RBAC role corresponding to this application identity is assigned."
                          : "The expected primary RBAC assignment could not be confirmed."
                      }
                      healthy={primaryRoleAssigned}
                    />

                    <SynchronizationCard
                      icon={RefreshCw}
                      eyebrow="Role Sources"
                      title={
                        user.roles.length === 0
                          ? "None"
                          : hasMixedRoleSources
                            ? "Mixed"
                            : "Consistent"
                      }
                      value={
                        assignmentSources.length > 0
                          ? assignmentSources
                              .map(formatAssignmentSource)
                              .join(", ")
                          : "No assignments"
                      }
                      description={
                        hasMixedRoleSources
                          ? "This identity contains role assignments created through more than one provisioning source."
                          : user.roles.length > 0
                            ? "The current role assignments share a consistent provisioning source."
                            : "No role-assignment source can be evaluated because there are no assignments."
                      }
                      healthy={user.roles.length > 0}
                      advisory={hasMixedRoleSources}
                    />

                    <SynchronizationCard
                      icon={ScanSearch}
                      eyebrow="Authorization"
                      title={permissionReady ? "Ready" : "Not Ready"}
                      value={`${effectivePermissionCount} ${
                        effectivePermissionCount === 1
                          ? "permission"
                          : "permissions"
                      }`}
                      description={
                        permissionReady
                          ? "The account currently resolves to an effective RBAC permission set."
                          : "No effective permissions are currently available for this identity."
                      }
                      healthy={permissionReady}
                    />
                  </div>

                  {/* SYNCHRONIZATION FLOW */}

                  <article className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-950 text-white">
                            <GitCompareArrows className="h-4 w-4" />
                          </div>

                          <div>
                            <h3 className="font-black text-slate-950">
                              Identity-to-Authorization Chain
                            </h3>

                            <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                              How this identity currently resolves into
                              application access
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] ${
                            synchronizationHealthy
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {synchronizationHealthy ? (
                            <CircleCheckBig className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}

                          {synchronizationHealthy
                            ? "Synchronized"
                            : "Review Required"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
                        <SyncFlowStage
                          number="01"
                          label="Legacy Identity"
                          value={
                            user.legacyRole
                              ? formatLegacyRole(user.legacyRole)
                              : "Not assigned"
                          }
                          healthy={Boolean(user.legacyRole)}
                        />

                        <LifecycleArrow />

                        <SyncFlowStage
                          number="02"
                          label="Expected RBAC Role"
                          value={expectedAccessRoleKey ?? "Not resolved"}
                          healthy={legacyRoleMapped}
                        />

                        <LifecycleArrow />

                        <SyncFlowStage
                          number="03"
                          label="Primary Assignment"
                          value={expectedRoleAssignment?.role.name ?? "Missing"}
                          healthy={primaryRoleAssigned}
                        />

                        <LifecycleArrow />

                        <SyncFlowStage
                          number="04"
                          label="Effective Access"
                          value={
                            permissionReady
                              ? `${effectivePermissionCount} permissions`
                              : "No permissions"
                          }
                          healthy={permissionReady && accountHasAccess}
                        />
                      </div>
                    </div>
                  </article>

                  {/* DIAGNOSTIC RESULT */}

                  <div className="mt-5">
                    {synchronizationHealthy ? (
                      <div className="relative overflow-hidden rounded-[22px] border border-emerald-100 bg-emerald-50/60 p-5">
                        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-300/20 blur-3xl" />

                        <div className="relative flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-emerald-600 text-white shadow-sm">
                            <CircleCheckBig className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-black text-emerald-950">
                              Access synchronization is healthy
                            </p>

                            <p className="mt-1 max-w-3xl text-[11px] leading-5 text-emerald-700">
                              The legacy application role resolves to the
                              expected RBAC role, the required assignment
                              exists, the account is active, and effective
                              permissions are available.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-[22px] border border-amber-200 bg-amber-50/70">
                        <div className="flex items-start gap-3 border-b border-amber-100 p-5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-amber-500 text-white shadow-sm">
                            <ShieldAlert className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-sm font-black text-amber-950">
                              Synchronization review required
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-amber-700">
                              One or more identity or authorization checks
                              require administrative attention.
                            </p>
                          </div>
                        </div>

                        <div className="divide-y divide-amber-100 bg-white/60">
                          {synchronizationIssues.map((issue, index) => (
                            <div
                              key={`${issue}-${index}`}
                              className="flex items-start gap-3 px-5 py-3.5"
                            >
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />

                              <p className="text-[11px] font-semibold leading-5 text-slate-600">
                                {issue}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MIGRATION NOTE */}

                  <div className="mt-5 rounded-[20px] border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <GitCompareArrows className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-black text-blue-950">
                          Migration-aware diagnostic
                        </p>

                        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-blue-700">
                          During the current migration phase, the legacy
                          application role remains a compatibility and routing
                          signal while RBAC roles provide the new permission
                          model. This diagnostic checks that both layers remain
                          aligned without changing either one automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ================================================================ */}
                {/* SECURITY & AUTHENTICATION STATE                                  */}
                {/* ================================================================ */}

                <section className="mt-6">
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <LockKeyhole className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                          Security Boundary
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Security & Authentication State
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Current authentication ownership, credential boundaries
                        and security capabilities available to this school
                        account.
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-violet-700">
                      <ShieldCheck className="h-3 w-3" />
                      Clerk Secured
                    </span>
                  </div>

                  {/* SECURITY ARCHITECTURE */}

                  <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    {/* -------------------------------------------------------------- */}
                    {/* AUTHENTICATION OWNERSHIP                                       */}
                    {/* -------------------------------------------------------------- */}

                    <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-100/60 blur-3xl" />

                      <div className="relative border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-violet-50 text-violet-600">
                              <CloudCog className="h-[18px] w-[18px]" />
                            </div>

                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-violet-600">
                                Authentication Ownership
                              </p>

                              <h3 className="mt-1 text-base font-black text-slate-950">
                                Clerk Security Boundary
                              </h3>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-emerald-700">
                            <UserCheck className="h-3 w-3" />
                            Managed
                          </span>
                        </div>

                        <p className="mt-4 max-w-3xl text-xs leading-5 text-slate-500">
                          Authentication credentials are controlled by Clerk.
                          The school database stores identity and authorization
                          information, but does not store the user&apos;s
                          authentication password.
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2">
                        <SecurityStateItem
                          icon={CloudCog}
                          label="Provider"
                          value="Clerk"
                          status="AVAILABLE"
                        />

                        <SecurityStateItem
                          icon={KeyRound}
                          label="Credential Owner"
                          value="Clerk Authentication"
                          status="AVAILABLE"
                        />

                        <SecurityStateItem
                          icon={Database}
                          label="Local Password Storage"
                          value="Not stored"
                          status="SECURE"
                        />

                        <SecurityStateItem
                          icon={Fingerprint}
                          label="Identity Binding"
                          value="Clerk ID = UserAccount ID"
                          status="AVAILABLE"
                        />

                        <SecurityStateItem
                          icon={ShieldCheck}
                          label="Authorization Layer"
                          value="School RBAC"
                          status="AVAILABLE"
                        />

                        <SecurityStateItem
                          icon={Route}
                          label="Legacy Routing"
                          value={
                            user.legacyRole
                              ? formatLegacyRole(user.legacyRole)
                              : "Not assigned"
                          }
                          status={user.legacyRole ? "AVAILABLE" : "ATTENTION"}
                        />
                      </div>
                    </article>

                    {/* -------------------------------------------------------------- */}
                    {/* SECURITY POSTURE                                               */}
                    {/* -------------------------------------------------------------- */}

                    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-[15px] ${
                            accountHasAccess
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          <ShieldCheck className="h-[18px] w-[18px]" />
                        </div>

                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                            Security Posture
                          </p>

                          <h3 className="mt-1 text-base font-black text-slate-950">
                            {accountHasAccess
                              ? "Normal Operational State"
                              : "Review Recommended"}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <SecurityPostureRow
                          label="Local account"
                          value={
                            user.status === "ACTIVE" ? "Active" : user.status
                          }
                          healthy={user.status === "ACTIVE"}
                        />

                        <SecurityPostureRow
                          label="Primary RBAC role"
                          value={primaryRole?.name ?? "Not assigned"}
                          healthy={Boolean(primaryRole)}
                        />

                        <SecurityPostureRow
                          label="Effective authorization"
                          value={`${effectivePermissionCount} ${
                            effectivePermissionCount === 1
                              ? "permission"
                              : "permissions"
                          }`}
                          healthy={effectivePermissionCount > 0}
                        />

                        <SecurityPostureRow
                          label="Synchronization"
                          value={
                            synchronizationHealthy
                              ? "Healthy"
                              : "Review required"
                          }
                          healthy={synchronizationHealthy}
                        />
                      </div>

                      <div
                        className={`mt-5 rounded-[16px] border p-4 ${
                          accountHasAccess && synchronizationHealthy
                            ? "border-emerald-100 bg-emerald-50/60"
                            : "border-amber-100 bg-amber-50/60"
                        }`}
                      >
                        <p
                          className={`text-[10px] font-black ${
                            accountHasAccess && synchronizationHealthy
                              ? "text-emerald-800"
                              : "text-amber-800"
                          }`}
                        >
                          {accountHasAccess && synchronizationHealthy
                            ? "No local access inconsistency detected"
                            : "One or more local access checks require attention"}
                        </p>

                        <p
                          className={`mt-1 text-[10px] leading-5 ${
                            accountHasAccess && synchronizationHealthy
                              ? "text-emerald-700"
                              : "text-amber-700"
                          }`}
                        >
                          This assessment reflects local account status and RBAC
                          configuration. It does not yet include live
                          authentication-session intelligence from Clerk.
                        </p>
                      </div>
                    </article>
                  </div>

                  {/* -------------------------------------------------------------- */}
                  {/* AUTHENTICATION INTELLIGENCE                                    */}
                  {/* -------------------------------------------------------------- */}

                  <article className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-100 text-slate-600">
                          <MonitorSmartphone className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="font-black text-slate-950">
                            Authentication Intelligence
                          </h3>

                          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                            Extended security telemetry and session visibility
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-slate-500">
                        <ShieldQuestion className="h-3 w-3" />
                        Future Integration
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-4">
                      <FutureSecurityCapability
                        icon={Clock3}
                        title="Last Sign-In"
                        description="Most recent successful authentication timestamp."
                      />

                      <FutureSecurityCapability
                        icon={MonitorSmartphone}
                        title="Active Sessions"
                        description="Current browser and device sessions associated with the account."
                      />

                      <FutureSecurityCapability
                        icon={Smartphone}
                        title="MFA Status"
                        description="Multi-factor authentication enrollment and method visibility."
                      />

                      <FutureSecurityCapability
                        icon={KeyRound}
                        title="Credential History"
                        description="Password reset and credential-management activity."
                      />
                    </div>
                  </article>

                  {/* -------------------------------------------------------------- */}
                  {/* PASSWORD MANAGEMENT BOUNDARY                                   */}
                  {/* -------------------------------------------------------------- */}

                  <div className="mt-5 rounded-[20px] border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-blue-600 text-white">
                        <LockKeyhole className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-black text-blue-950">
                          Password-management boundary
                        </p>

                        <p className="mt-1 max-w-4xl text-[11px] leading-5 text-blue-700">
                          Initial credentials are supplied to Clerk during
                          account provisioning. Password validation, secure
                          storage, sign-in verification and future credential
                          changes remain the responsibility of the
                          authentication provider rather than the school&apos;s
                          Prisma database.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ================================================================ */}
                {/* ACCOUNT LIFECYCLE EVENTS                                         */}
                {/* ================================================================ */}

                <section className="mt-6">
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-white">
                          <History className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-600">
                          Lifecycle History
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Account Lifecycle Events
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        Important account and access events that describe how
                        this identity has changed over time.
                      </p>
                    </div>

                    <Link
                      href={`/list/access-control/users/${user.id}?tab=audit`}
                      className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      View Full Audit History
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* CONTENT */}

                  <article className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                    {/* SUMMARY STRIP */}

                    <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-500">
                          <History className="h-3 w-3" />
                          {accountLifecycleEvents.length} Recent
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-blue-700">
                          <ShieldCheck className="h-3 w-3" />
                          Account Relevant
                        </span>
                      </div>

                      <p className="text-[9px] font-bold text-slate-400">
                        Newest lifecycle activity first
                      </p>
                    </div>

                    {accountLifecycleEvents.length > 0 ? (
                      <div className="px-5 py-2 sm:px-6">
                        {accountLifecycleEvents.map((event, index) => {
                          const config = getAccountLifecycleEventConfig(
                            event.action,
                          );

                          const Icon = config.icon;

                          const affectedRole = event.roleId
                            ? (user.roles.find(
                                (assignment) =>
                                  assignment.roleId === event.roleId,
                              )?.role ?? null)
                            : null;

                          const last =
                            index === accountLifecycleEvents.length - 1;

                          return (
                            <div
                              key={event.id}
                              className="relative flex gap-4 py-4"
                            >
                              {/* TIMELINE */}

                              {!last ? (
                                <div className="absolute bottom-0 left-[19px] top-[44px] w-px bg-slate-200" />
                              ) : null}

                              <div
                                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${config.iconClass}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>

                              {/* CONTENT */}

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-xs font-black text-slate-800">
                                        {config.title}
                                      </p>

                                      <span
                                        className={`rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-[0.07em] ${config.badgeClass}`}
                                      >
                                        {formatAuditAction(event.action)}
                                      </span>
                                    </div>

                                    <p className="mt-1.5 max-w-3xl text-[11px] leading-5 text-slate-500">
                                      {getAccountLifecycleEventDescription({
                                        action: event.action,

                                        displayName: user.displayName ?? "User",

                                        roleName: affectedRole?.name ?? null,
                                      })}
                                    </p>
                                  </div>

                                  <div className="shrink-0 sm:text-right">
                                    <p className="text-[9px] font-black text-slate-500">
                                      {formatDateTime(event.createdAt)}
                                    </p>

                                    <p className="mt-1 text-[8px] font-bold text-slate-400">
                                      {formatRelativeDate(event.createdAt)}
                                    </p>
                                  </div>
                                </div>

                                {/* CONTEXT */}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <LifecycleEventContext
                                    label="Actor"
                                    value={
                                      event.actorName ??
                                      (event.actorId
                                        ? shortenIdentifier(event.actorId)
                                        : "System")
                                    }
                                  />

                                  {event.actorRole ? (
                                    <LifecycleEventContext
                                      label="Actor Role"
                                      value={formatLegacyRole(event.actorRole)}
                                    />
                                  ) : null}

                                  {affectedRole ? (
                                    <LifecycleEventContext
                                      label="Role"
                                      value={affectedRole.name}
                                    />
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-6 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[16px] bg-slate-50 text-slate-300">
                          <History className="h-5 w-5" />
                        </div>

                        <h3 className="mt-4 text-sm font-black text-slate-700">
                          No lifecycle events recorded
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                          Important account creation, status and role-change
                          events will appear here when they are recorded by
                          Access Control.
                        </p>
                      </div>
                    )}

                    {/* FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[9px] leading-4 text-slate-400">
                          This condensed history shows lifecycle-relevant events
                          only. The full forensic record remains available in
                          Activity & Audit.
                        </p>

                        <Link
                          href={`/list/access-control/users/${user.id}?tab=audit`}
                          className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-black text-blue-600 transition hover:text-blue-800"
                        >
                          Open Audit
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </section>
              </>
            ) : null}

            {tab === "linked" ? (
              <>
                {/* ================================================================ */}
                {/* LINKED RECORDS                                                   */}
                {/* ================================================================ */}

                <section>
                  {/* HEADER */}

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                          <Link2 className="h-4 w-4" />
                        </div>

                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">
                          Domain Relationships
                        </p>
                      </div>

                      <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                        Linked Records
                      </h2>

                      <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                        School-domain records associated with this universal
                        identity, including academic profiles, family
                        relationships and role-specific records.
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] ${
                        hasLinkedDomainRecord ||
                        linkedRecordKind === "UNIVERSAL_ONLY"
                          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border-amber-100 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {hasLinkedDomainRecord ||
                      linkedRecordKind === "UNIVERSAL_ONLY" ? (
                        <BadgeCheck className="h-3 w-3" />
                      ) : (
                        <CircleAlert className="h-3 w-3" />
                      )}

                      {hasLinkedDomainRecord
                        ? "Record Linked"
                        : linkedRecordKind === "UNIVERSAL_ONLY"
                          ? "Universal Identity"
                          : "No Record Found"}
                    </span>
                  </div>

                  {/* ------------------------------------------------------------ */}
                  {/* IDENTITY RELATIONSHIP                                        */}
                  {/* ------------------------------------------------------------ */}

                  <article className="relative mt-5 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-100/60 blur-3xl" />

                    <div className="relative p-5 sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-slate-950 text-white shadow-sm">
                            {linkedRecordKind === "STUDENT" ? (
                              <GraduationCap className="h-6 w-6" />
                            ) : linkedRecordKind === "TEACHER" ? (
                              <BookUser className="h-6 w-6" />
                            ) : linkedRecordKind === "PARENT" ? (
                              <UsersRound className="h-6 w-6" />
                            ) : linkedRecordKind === "ADMIN" ? (
                              <UserRoundCog className="h-6 w-6" />
                            ) : (
                              <Database className="h-6 w-6" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-600">
                              Linked Identity Type
                            </p>

                            <h3 className="mt-1 text-lg font-black text-slate-950">
                              {linkedRecordLabel}
                            </h3>

                            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                              {linkedRecordDescription}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 rounded-[18px] border border-slate-200 bg-slate-50/70 px-4 py-3">
                          <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                            Identity Key
                          </p>

                          <p
                            title={user.id}
                            className="mt-1 max-w-[240px] truncate font-mono text-[10px] font-black text-slate-600"
                          >
                            {user.id}
                          </p>
                        </div>
                      </div>

                      {/* RELATIONSHIP FLOW */}

                      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                        <LinkedIdentityStage
                          icon={Fingerprint}
                          eyebrow="Universal Identity"
                          title="UserAccount"
                          value={shortenIdentifier(user.id)}
                          healthy
                        />

                        <div className="flex justify-center">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
                            <ArrowRight className="h-4 w-4 lg:block" />
                          </div>
                        </div>

                        <LinkedIdentityStage
                          icon={
                            linkedRecordKind === "STUDENT"
                              ? GraduationCap
                              : linkedRecordKind === "TEACHER"
                                ? BookUser
                                : linkedRecordKind === "PARENT"
                                  ? UsersRound
                                  : linkedRecordKind === "ADMIN"
                                    ? UserRoundCog
                                    : Database
                          }
                          eyebrow="School Domain"
                          title={linkedRecordLabel}
                          value={
                            hasLinkedDomainRecord
                              ? "Linked by shared ID"
                              : linkedRecordKind === "UNIVERSAL_ONLY"
                                ? "No separate record required"
                                : "No matching record"
                          }
                          healthy={
                            hasLinkedDomainRecord ||
                            linkedRecordKind === "UNIVERSAL_ONLY"
                          }
                        />
                      </div>
                    </div>
                  </article>

                  {/* ------------------------------------------------------------ */}
                  {/* RELATIONSHIP SUMMARY                                         */}
                  {/* ------------------------------------------------------------ */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <LinkedRecordMetric
                      icon={Fingerprint}
                      label="Universal ID"
                      value={shortenIdentifier(user.id)}
                      description="Identity shared across authentication and local access control."
                      tone="blue"
                    />

                    <LinkedRecordMetric
                      icon={UserRound}
                      label="Application Role"
                      value={
                        user.legacyRole
                          ? formatLegacyRole(user.legacyRole)
                          : "Not assigned"
                      }
                      description="Primary application identity used during the current migration phase."
                      tone="violet"
                    />

                    <LinkedRecordMetric
                      icon={Link2}
                      label="Domain Link"
                      value={
                        hasLinkedDomainRecord
                          ? "Connected"
                          : linkedRecordKind === "UNIVERSAL_ONLY"
                            ? "Not Required"
                            : "Missing"
                      }
                      description={
                        hasLinkedDomainRecord
                          ? "A corresponding school-domain record was located."
                          : linkedRecordKind === "UNIVERSAL_ONLY"
                            ? "This account type intentionally operates without a separate domain record."
                            : "The expected school-domain profile could not be found."
                      }
                      tone={
                        hasLinkedDomainRecord ||
                        linkedRecordKind === "UNIVERSAL_ONLY"
                          ? "emerald"
                          : "amber"
                      }
                    />

                    <LinkedRecordMetric
                      icon={Database}
                      label="Record Type"
                      value={linkedRecordLabel}
                      description="The school-domain identity currently associated with this account."
                      tone="cyan"
                    />
                  </div>
                </section>

                {/* ================================================================ */}
                {/* STUDENT LINKED PROFILE                                           */}
                {/* ================================================================ */}

                {linkedStudent ? (
                  <section className="mt-6">
                    {/* HEADER */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <GraduationCap className="h-4 w-4" />
                          </div>

                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">
                            Academic Domain Profile
                          </p>
                        </div>

                        <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          Student Linked Profile
                        </h2>

                        <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                          Academic identity, enrolment information, class
                          placement and parent or guardian relationships
                          connected to this account.
                        </p>
                      </div>

                      <Link
                        href="/list/students"
                        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                      >
                        Open Students
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* MAIN PROFILE */}

                    <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                      {/* ------------------------------------------------------------ */}
                      {/* STUDENT IDENTITY CARD                                        */}
                      {/* ------------------------------------------------------------ */}

                      <article className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] sm:p-6">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                        <div className="relative">
                          <div className="flex items-start justify-between gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/10 shadow-xl">
                              {linkedStudent.img ? (
                                <Image
                                  src={linkedStudent.img}
                                  alt={`${linkedStudent.name} ${linkedStudent.surname}`}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : user.imageUrl ? (
                                <Image
                                  src={user.imageUrl}
                                  alt={`${linkedStudent.name} ${linkedStudent.surname}`}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UserRound className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-violet-200 backdrop-blur">
                              <BadgeCheck className="h-3 w-3" />
                              Linked Student
                            </span>
                          </div>

                          <div className="mt-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-violet-300">
                              Student Identity
                            </p>

                            <h3 className="mt-2 text-xl font-black tracking-tight">
                              {linkedStudent.name} {linkedStudent.surname}
                            </h3>

                            <p className="mt-1 font-mono text-[10px] font-bold text-slate-400">
                              {linkedStudent.studentID}
                            </p>
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <StudentMiniStat
                              label="Class"
                              value={
                                linkedStudent.class?.name ?? "Not assigned"
                              }
                            />

                            <StudentMiniStat
                              label="Grade"
                              value={
                                linkedStudent.grade?.level ?? "Not assigned"
                              }
                            />

                            <StudentMiniStat
                              label="Student Type"
                              value={formatStudentType(
                                linkedStudent.studentType,
                              )}
                            />

                            <StudentMiniStat
                              label="Residence"
                              value={formatBoardingType(
                                linkedStudent.boardingType,
                              )}
                            />
                          </div>

                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                              Universal Identity
                            </p>

                            <p
                              title={linkedStudent.id}
                              className="mt-1 truncate font-mono text-[9px] font-bold text-slate-400"
                            >
                              {linkedStudent.id}
                            </p>
                          </div>
                        </div>
                      </article>

                      {/* ------------------------------------------------------------ */}
                      {/* ACADEMIC IDENTITY                                            */}
                      {/* ------------------------------------------------------------ */}

                      <div className="space-y-5">
                        <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-violet-50 text-violet-600">
                                <GraduationCap className="h-4 w-4" />
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-900">
                                  Academic Identity
                                </h3>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Current school placement and enrolment profile
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-emerald-700">
                              Active Record
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 xl:grid-cols-3">
                            <StudentProfileField
                              icon={IdCard}
                              label="Student ID"
                              value={linkedStudent.studentID}
                            />

                            <StudentProfileField
                              icon={School}
                              label="Class"
                              value={
                                linkedStudent.class?.name ?? "Not assigned"
                              }
                            />

                            <StudentProfileField
                              icon={GraduationCap}
                              label="Grade"
                              value={
                                linkedStudent.grade?.level ?? "Not assigned"
                              }
                            />

                            <StudentProfileField
                              icon={UserRound}
                              label="Sex"
                              value={formatStudentSex(linkedStudent.sex)}
                            />

                            <StudentProfileField
                              icon={Cake}
                              label="Birthday"
                              value={formatDate(linkedStudent.birthday)}
                            />

                            <StudentProfileField
                              icon={CalendarDays}
                              label="Student Record Created"
                              value={formatDate(linkedStudent.createdAt)}
                            />
                          </div>
                        </article>

                        {/* ---------------------------------------------------------- */}
                        {/* ENROLMENT CLASSIFICATION                                   */}
                        {/* ---------------------------------------------------------- */}

                        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600">
                              <BadgeInfo className="h-4 w-4" />
                            </div>

                            <div>
                              <h3 className="text-sm font-black text-slate-900">
                                Enrolment Classification
                              </h3>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Operational student classification used across
                                school modules
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <StudentClassificationCard
                              eyebrow="Student Type"
                              value={formatStudentType(
                                linkedStudent.studentType,
                              )}
                              description={
                                linkedStudent.studentType === "new"
                                  ? "This learner is currently classified as a new student."
                                  : "This learner is currently classified as an existing student."
                              }
                              tone="blue"
                            />

                            <StudentClassificationCard
                              eyebrow="Boarding Status"
                              value={formatBoardingType(
                                linkedStudent.boardingType,
                              )}
                              description={
                                linkedStudent.boardingType === "boarder"
                                  ? "This learner is registered under the school's boarding programme."
                                  : "This learner is registered as a day student."
                              }
                              tone="violet"
                            />
                          </div>
                        </article>
                      </div>
                    </div>

                    {/* -------------------------------------------------------------- */}
                    {/* CONTACT + PARENT RELATIONSHIP                                  */}
                    {/* -------------------------------------------------------------- */}

                    <div className="mt-5 grid gap-5 xl:grid-cols-2">
                      {/* CONTACT */}

                      <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-sky-50 text-sky-600">
                              <ContactRound className="h-4 w-4" />
                            </div>

                            <div>
                              <h3 className="text-sm font-black text-slate-900">
                                Student Contact Record
                              </h3>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Contact information stored on the Student domain
                                profile
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2">
                          <StudentProfileField
                            icon={Mail}
                            label="Email"
                            value={linkedStudent.email ?? "Not supplied"}
                          />

                          <StudentProfileField
                            icon={Phone}
                            label="Phone"
                            value={linkedStudent.phone ?? "Not supplied"}
                          />

                          <div className="sm:col-span-2">
                            <StudentProfileField
                              icon={MapPin}
                              label="Address"
                              value={linkedStudent.address || "Not supplied"}
                            />
                          </div>
                        </div>
                      </article>

                      {/* PARENT / GUARDIAN */}

                      <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-100/50 blur-3xl" />

                        <div className="relative border-b border-slate-100 px-5 py-4 sm:px-6">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-orange-50 text-orange-600">
                                <Users className="h-4 w-4" />
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-900">
                                  Parent / Guardian Relationship
                                </h3>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Family record associated with this student
                                </p>
                              </div>
                            </div>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${
                                linkedStudent.parent
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {linkedStudent.parent ? "Linked" : "Not Linked"}
                            </span>
                          </div>
                        </div>

                        {linkedStudent.parent ? (
                          <div className="relative p-5 sm:p-6">
                            <div className="flex items-center gap-4">
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[16px] border border-slate-200 bg-slate-100">
                                {linkedStudent.parent.img ? (
                                  <Image
                                    src={linkedStudent.parent.img}
                                    alt={`${linkedStudent.parent.name} ${linkedStudent.parent.surname}`}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Users className="h-5 w-5 text-slate-300" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-900">
                                  {linkedStudent.parent.name}{" "}
                                  {linkedStudent.parent.surname}
                                </p>

                                <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                                  {linkedStudent.parent.phone}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                              <StudentRelationshipValue
                                label="Parent Username"
                                value={linkedStudent.parent.username}
                              />

                              <StudentRelationshipValue
                                label="Parent Email"
                                value={
                                  linkedStudent.parent.email ?? "Not supplied"
                                }
                              />

                              <StudentRelationshipValue
                                label="Phone"
                                value={linkedStudent.parent.phone}
                              />

                              <StudentRelationshipValue
                                label="Parent ID"
                                value={shortenIdentifier(
                                  linkedStudent.parent.id,
                                )}
                              />
                            </div>

                            <div className="mt-5">
                              <Link
                                href="/list/parents"
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3.5 text-[10px] font-black text-orange-700 transition hover:border-orange-200 hover:bg-orange-100"
                              >
                                Open Parents
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6">
                            <div className="rounded-[18px] border border-dashed border-amber-200 bg-amber-50/60 p-5">
                              <div className="flex items-start gap-3">
                                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                                <div>
                                  <p className="text-xs font-black text-amber-900">
                                    No parent or guardian linked
                                  </p>

                                  <p className="mt-1 text-[10px] leading-5 text-amber-700">
                                    This Student record currently has no linked
                                    Parent record. The student's academic
                                    identity remains valid, but the family
                                    relationship should be reviewed if one is
                                    expected.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    </div>

                    {/* -------------------------------------------------------------- */}
                    {/* QUICK NAVIGATION                                               */}
                    {/* -------------------------------------------------------------- */}

                    <article className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          School Navigation
                        </p>

                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          Related management areas
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          Open the existing school-management modules associated
                          with this student's academic and family records.
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <LinkedNavigationCard
                          href="/list/students"
                          icon={GraduationCap}
                          title="Students"
                          description="Open the student directory and academic profiles."
                          tone="violet"
                        />

                        <LinkedNavigationCard
                          href="/list/classes"
                          icon={School}
                          title="Classes"
                          description={
                            linkedStudent.class
                              ? `Current placement: ${linkedStudent.class.name}.`
                              : "Open the school class directory."
                          }
                          tone="blue"
                        />

                        <LinkedNavigationCard
                          href="/list/parents"
                          icon={Users}
                          title="Parents"
                          description={
                            linkedStudent.parent
                              ? `Linked guardian: ${linkedStudent.parent.name} ${linkedStudent.parent.surname}.`
                              : "Open the parent and guardian directory."
                          }
                          tone="orange"
                        />
                      </div>
                    </article>
                  </section>
                ) : null}

                {/* ================================================================ */}
                {/* TEACHER LINKED PROFILE                                           */}
                {/* ================================================================ */}

                {linkedTeacher ? (
                  <section className="mt-6">
                    {/* ------------------------------------------------------------ */}
                    {/* HEADER                                                       */}
                    {/* ------------------------------------------------------------ */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <BookUser className="h-4 w-4" />
                          </div>

                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                            Instructional Domain Profile
                          </p>
                        </div>

                        <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          Teacher Linked Profile
                        </h2>

                        <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                          Professional identity, teaching assignments, subjects,
                          classes and instructional responsibilities associated
                          with this account.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href="/list/teachers"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          All Teachers
                        </Link>

                        <Link
                          href={`/list/teachers/${linkedTeacher.id}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Open Teacher Profile
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* ------------------------------------------------------------ */}
                    {/* MAIN TEACHER PROFILE                                         */}
                    {/* ------------------------------------------------------------ */}

                    <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                      {/* ========================================================== */}
                      {/* IDENTITY CARD                                              */}
                      {/* ========================================================== */}

                      <article className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)] sm:p-6">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/20 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />

                        <div className="relative">
                          {/* PHOTO */}

                          <div className="flex items-start justify-between gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/10 shadow-xl">
                              {linkedTeacher.img ? (
                                <Image
                                  src={linkedTeacher.img}
                                  alt={`${linkedTeacher.name} ${linkedTeacher.surname}`}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : user.imageUrl ? (
                                <Image
                                  src={user.imageUrl}
                                  alt={`${linkedTeacher.name} ${linkedTeacher.surname}`}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UserRound className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-200 backdrop-blur">
                              <BadgeCheck className="h-3 w-3" />
                              Linked Teacher
                            </span>
                          </div>

                          {/* IDENTITY */}

                          <div className="mt-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-emerald-300">
                              Teacher Identity
                            </p>

                            <h3 className="mt-2 text-xl font-black tracking-tight">
                              {linkedTeacher.name} {linkedTeacher.surname}
                            </h3>

                            <p className="mt-1 font-mono text-[10px] font-bold text-slate-400">
                              {linkedTeacher.teacherID}
                            </p>
                          </div>

                          {/* SUMMARY */}

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <TeacherMiniStat
                              label="Subjects"
                              value={String(linkedTeacher._count.subjects)}
                            />

                            <TeacherMiniStat
                              label="Classes"
                              value={String(linkedTeacher._count.classes)}
                            />

                            <TeacherMiniStat
                              label="Lessons"
                              value={String(linkedTeacher._count.lessons)}
                            />

                            <TeacherMiniStat
                              label="Account"
                              value={
                                user.status === "ACTIVE"
                                  ? "Active"
                                  : user.status
                              }
                            />
                          </div>

                          {/* UNIVERSAL ID */}

                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                              Universal Identity
                            </p>

                            <p
                              title={linkedTeacher.id}
                              className="mt-1 truncate font-mono text-[9px] font-bold text-slate-400"
                            >
                              {linkedTeacher.id}
                            </p>
                          </div>
                        </div>
                      </article>

                      {/* ========================================================== */}
                      {/* PROFESSIONAL IDENTITY                                      */}
                      {/* ========================================================== */}

                      <div className="space-y-5">
                        <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600">
                                <BriefcaseBusiness className="h-4 w-4" />
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-900">
                                  Professional Identity
                                </h3>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Core teacher record and professional
                                  information
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-emerald-700">
                              Active Record
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 xl:grid-cols-3">
                            <TeacherProfileField
                              icon={IdCard}
                              label="Teacher ID"
                              value={linkedTeacher.teacherID}
                            />

                            <TeacherProfileField
                              icon={UserRound}
                              label="Username"
                              value={linkedTeacher.username}
                            />

                            <TeacherProfileField
                              icon={UserRound}
                              label="Sex"
                              value={formatTeacherSex(linkedTeacher.sex)}
                            />

                            <TeacherProfileField
                              icon={Cake}
                              label="Birthday"
                              value={formatDate(linkedTeacher.birthday)}
                            />

                            <TeacherProfileField
                              icon={BookOpenCheck}
                              label="Subjects"
                              value={`${linkedTeacher._count.subjects} ${
                                linkedTeacher._count.subjects === 1
                                  ? "subject"
                                  : "subjects"
                              }`}
                            />

                            <TeacherProfileField
                              icon={School}
                              label="Classes"
                              value={`${linkedTeacher._count.classes} ${
                                linkedTeacher._count.classes === 1
                                  ? "class"
                                  : "classes"
                              }`}
                            />
                          </div>
                        </article>

                        {/* ======================================================== */}
                        {/* INSTRUCTIONAL SCOPE                                      */}
                        {/* ======================================================== */}

                        <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600">
                                <GraduationCap className="h-4 w-4" />
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-900">
                                  Instructional Scope
                                </h3>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Current subjects, classes and lesson
                                  responsibilities
                                </p>
                              </div>
                            </div>

                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-blue-700">
                              <BookOpenCheck className="h-3 w-3" />
                              {linkedTeacher._count.lessons}{" "}
                              {linkedTeacher._count.lessons === 1
                                ? "Lesson"
                                : "Lessons"}
                            </span>
                          </div>

                          {/* SUBJECTS */}

                          <div className="mt-5">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                Assigned Subjects
                              </p>

                              <p className="text-[9px] font-black text-slate-400">
                                {linkedTeacher.subjects.length}
                              </p>
                            </div>

                            {linkedTeacher.subjects.length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {linkedTeacher.subjects.map((subject) => (
                                  <span
                                    key={subject.id}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-black text-emerald-700"
                                  >
                                    <BookOpenCheck className="h-3 w-3" />

                                    {subject.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <TeacherEmptyAssignment message="No subjects are currently assigned to this teacher." />
                            )}
                          </div>

                          {/* CLASSES */}

                          <div className="mt-6 border-t border-slate-100 pt-5">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                Assigned Classes
                              </p>

                              <p className="text-[9px] font-black text-slate-400">
                                {linkedTeacher.classes.length}
                              </p>
                            </div>

                            {linkedTeacher.classes.length > 0 ? (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {linkedTeacher.classes.map((classItem) => (
                                  <TeacherClassCard
                                    key={classItem.id}
                                    name={classItem.name}
                                  />
                                ))}
                              </div>
                            ) : (
                              <TeacherEmptyAssignment message="No classes are currently assigned to this teacher." />
                            )}
                          </div>
                        </article>
                      </div>
                    </div>

                    {/* ================================================================ */}
                    {/* CONTACT + WORKLOAD SUMMARY                                        */}
                    {/* ================================================================ */}

                    <div className="mt-5 grid gap-5 xl:grid-cols-2">
                      {/* ------------------------------------------------------------ */}
                      {/* CONTACT                                                      */}
                      {/* ------------------------------------------------------------ */}

                      <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-cyan-50 text-cyan-600">
                              <ContactRound className="h-4 w-4" />
                            </div>

                            <div>
                              <h3 className="text-sm font-black text-slate-900">
                                Teacher Contact Record
                              </h3>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Contact information stored on the Teacher domain
                                profile
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2">
                          <TeacherProfileField
                            icon={Mail}
                            label="Email"
                            value={linkedTeacher.email ?? "Not supplied"}
                          />

                          <TeacherProfileField
                            icon={Phone}
                            label="Phone"
                            value={linkedTeacher.phone ?? "Not supplied"}
                          />

                          <div className="sm:col-span-2">
                            <TeacherProfileField
                              icon={MapPin}
                              label="Address"
                              value={linkedTeacher.address || "Not supplied"}
                            />
                          </div>
                        </div>
                      </article>

                      {/* ------------------------------------------------------------ */}
                      {/* TEACHING WORKLOAD                                            */}
                      {/* ------------------------------------------------------------ */}

                      <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-100/60 blur-3xl" />

                        <div className="relative">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600">
                              <BriefcaseBusiness className="h-4 w-4" />
                            </div>

                            <div>
                              <h3 className="text-sm font-black text-slate-900">
                                Teaching Scope Summary
                              </h3>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                Current instructional footprint in the academic
                                system
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-3 gap-3">
                            <TeacherWorkloadMetric
                              label="Subjects"
                              value={linkedTeacher._count.subjects}
                              icon={BookOpenCheck}
                            />

                            <TeacherWorkloadMetric
                              label="Classes"
                              value={linkedTeacher._count.classes}
                              icon={School}
                            />

                            <TeacherWorkloadMetric
                              label="Lessons"
                              value={linkedTeacher._count.lessons}
                              icon={FileText}
                            />
                          </div>

                          <div className="mt-5 rounded-[16px] border border-emerald-100 bg-emerald-50/50 p-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.09em] text-emerald-600">
                              Instructional Status
                            </p>

                            <p className="mt-2 text-xs font-black text-emerald-900">
                              {linkedTeacher._count.subjects > 0 ||
                              linkedTeacher._count.classes > 0 ||
                              linkedTeacher._count.lessons > 0
                                ? "Teaching responsibilities assigned"
                                : "No instructional assignments"}
                            </p>

                            <p className="mt-1 text-[10px] leading-5 text-emerald-700">
                              This summary reflects the teacher&apos;s current
                              relationships in the Subjects, Classes and Lessons
                              modules.
                            </p>
                          </div>
                        </div>
                      </article>
                    </div>

                    {/* ================================================================ */}
                    {/* QUICK NAVIGATION                                                  */}
                    {/* ================================================================ */}

                    <article className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Academic Navigation
                        </p>

                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          Related teacher management areas
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          Open the existing academic modules associated with
                          this teacher&apos;s profile and instructional
                          responsibilities.
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <LinkedNavigationCard
                          href={`/list/teachers/${linkedTeacher.id}`}
                          icon={BookUser}
                          title="Teacher Profile"
                          description="Open this teacher's existing detailed school profile."
                          tone="emerald"
                        />

                        <LinkedNavigationCard
                          href="/list/subjects"
                          icon={BookOpenCheck}
                          title="Subjects"
                          description={`${linkedTeacher._count.subjects} assigned ${
                            linkedTeacher._count.subjects === 1
                              ? "subject"
                              : "subjects"
                          }.`}
                          tone="violet"
                        />

                        <LinkedNavigationCard
                          href="/list/classes"
                          icon={School}
                          title="Classes"
                          description={`${linkedTeacher._count.classes} assigned ${
                            linkedTeacher._count.classes === 1
                              ? "class"
                              : "classes"
                          }.`}
                          tone="blue"
                        />

                        <LinkedNavigationCard
                          href="/list/lessons"
                          icon={FileText}
                          title="Lessons"
                          description={`${linkedTeacher._count.lessons} linked ${
                            linkedTeacher._count.lessons === 1
                              ? "lesson"
                              : "lessons"
                          }.`}
                          tone="amber"
                        />
                      </div>
                    </article>
                  </section>
                ) : null}

                {/* ================================================================ */}
                {/* PARENT / GUARDIAN LINKED PROFILE                                 */}
                {/* ================================================================ */}

                {linkedParent ? (
                  <section className="mt-6">
                    {/* ------------------------------------------------------------ */}
                    {/* HEADER                                                       */}
                    {/* ------------------------------------------------------------ */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <UsersRound className="h-4 w-4" />
                          </div>

                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
                            Family Domain Profile
                          </p>
                        </div>

                        <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          Parent / Guardian Linked Profile
                        </h2>

                        <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                          Guardian identity, contact information and linked
                          student relationships associated with this account.
                        </p>
                      </div>

                      <Link
                        href="/list/parents"
                        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                      >
                        Open Parents Directory
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* ------------------------------------------------------------ */}
                    {/* MAIN PROFILE                                                 */}
                    {/* ------------------------------------------------------------ */}

                    <div className="mt-5 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                      {/* ========================================================== */}
                      {/* PARENT IDENTITY                                            */}
                      {/* ========================================================== */}

                      <article className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)] sm:p-6">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-orange-500/20 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl" />

                        <div className="relative">
                          {/* PHOTO + BADGE */}

                          <div className="flex items-start justify-between gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/10 shadow-xl">
                              {linkedParent.img ? (
                                <Image
                                  src={linkedParent.img}
                                  alt={`${linkedParent.name} ${linkedParent.surname}`}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : user.imageUrl ? (
                                <Image
                                  src={user.imageUrl}
                                  alt={`${linkedParent.name} ${linkedParent.surname}`}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UsersRound className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-orange-200 backdrop-blur">
                              <BadgeCheck className="h-3 w-3" />
                              Linked Guardian
                            </span>
                          </div>

                          {/* IDENTITY */}

                          <div className="mt-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-orange-300">
                              Parent / Guardian Identity
                            </p>

                            <h3 className="mt-2 text-xl font-black tracking-tight">
                              {linkedParent.name} {linkedParent.surname}
                            </h3>

                            <p className="mt-1 text-[10px] font-bold text-slate-400">
                              @{linkedParent.username}
                            </p>
                          </div>

                          {/* MINI STATS */}

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <ParentMiniStat
                              label="Children"
                              value={String(linkedParent._count.students)}
                            />

                            <ParentMiniStat
                              label="Relationship"
                              value={
                                linkedParent._count.students > 0
                                  ? "Linked"
                                  : "Unlinked"
                              }
                            />

                            <ParentMiniStat
                              label="Account"
                              value={
                                user.status === "ACTIVE"
                                  ? "Active"
                                  : user.status
                              }
                            />

                            <ParentMiniStat label="Role" value="Guardian" />
                          </div>

                          {/* UNIVERSAL ID */}

                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                              Universal Identity
                            </p>

                            <p
                              title={linkedParent.id}
                              className="mt-1 truncate font-mono text-[9px] font-bold text-slate-400"
                            >
                              {linkedParent.id}
                            </p>
                          </div>
                        </div>
                      </article>

                      {/* ========================================================== */}
                      {/* GUARDIAN IDENTITY + FAMILY HEALTH                          */}
                      {/* ========================================================== */}

                      <div className="space-y-5">
                        {/* PERSONAL / CONTACT */}

                        <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-orange-50 text-orange-600">
                                <ContactRound className="h-4 w-4" />
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-900">
                                  Guardian Identity
                                </h3>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Contact and school-family identity information
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-emerald-700">
                              Active Record
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2">
                            <ParentProfileField
                              icon={UserRound}
                              label="Full Name"
                              value={`${linkedParent.name} ${linkedParent.surname}`}
                            />

                            <ParentProfileField
                              icon={UserRound}
                              label="Username"
                              value={linkedParent.username}
                            />

                            <ParentProfileField
                              icon={Mail}
                              label="Email"
                              value={linkedParent.email ?? "Not supplied"}
                            />

                            <ParentProfileField
                              icon={Phone}
                              label="Phone"
                              value={linkedParent.phone}
                            />

                            <div className="sm:col-span-2">
                              <ParentProfileField
                                icon={MapPin}
                                label="Address"
                                value={linkedParent.address || "Not supplied"}
                              />
                            </div>
                          </div>
                        </article>

                        {/* FAMILY RELATIONSHIP HEALTH */}

                        <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-100/60 blur-3xl" />

                          <div className="relative">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${
                                  linkedParent._count.students > 0
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                <HeartHandshake className="h-4 w-4" />
                              </div>

                              <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                  Relationship Health
                                </p>

                                <h3 className="mt-1 text-sm font-black text-slate-900">
                                  {linkedParent._count.students > 0
                                    ? "Student relationships connected"
                                    : "No students currently linked"}
                                </h3>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <ParentRelationshipMetric
                                label="Linked Students"
                                value={linkedParent._count.students}
                              />

                              <ParentRelationshipMetric
                                label="Classes"
                                value={
                                  new Set(
                                    linkedParent.students
                                      .map((student) => student.class?.id)
                                      .filter(Boolean),
                                  ).size
                                }
                              />

                              <ParentRelationshipMetric
                                label="Grades"
                                value={
                                  new Set(
                                    linkedParent.students
                                      .map((student) => student.grade?.id)
                                      .filter(Boolean),
                                  ).size
                                }
                              />
                            </div>

                            <div
                              className={`mt-5 rounded-[16px] border p-4 ${
                                linkedParent._count.students > 0
                                  ? "border-emerald-100 bg-emerald-50/50"
                                  : "border-amber-100 bg-amber-50/50"
                              }`}
                            >
                              <p
                                className={`text-[10px] font-black ${
                                  linkedParent._count.students > 0
                                    ? "text-emerald-900"
                                    : "text-amber-900"
                                }`}
                              >
                                {linkedParent._count.students > 0
                                  ? `${linkedParent._count.students} ${
                                      linkedParent._count.students === 1
                                        ? "student is"
                                        : "students are"
                                    } linked to this guardian.`
                                  : "This guardian currently has no linked Student records."}
                              </p>

                              <p
                                className={`mt-1 text-[10px] leading-5 ${
                                  linkedParent._count.students > 0
                                    ? "text-emerald-700"
                                    : "text-amber-700"
                                }`}
                              >
                                {linkedParent._count.students > 0
                                  ? "Family access can resolve through these student relationships for parent-facing academic information."
                                  : "If this account should represent an active parent or guardian, review the Student.parentId relationships."}
                              </p>
                            </div>
                          </div>
                        </article>
                      </div>
                    </div>

                    {/* ================================================================ */}
                    {/* LINKED CHILDREN                                                   */}
                    {/* ================================================================ */}

                    <article className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                      {/* HEADER */}

                      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600">
                            <GraduationCap className="h-4 w-4" />
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-slate-900">
                              Linked Students
                            </h3>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              Children currently connected to this
                              guardian&apos;s Parent record
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] text-blue-700">
                          <Baby className="h-3 w-3" />
                          {linkedParent._count.students}{" "}
                          {linkedParent._count.students === 1
                            ? "Student"
                            : "Students"}
                        </span>
                      </div>

                      {/* CHILDREN */}

                      {linkedParent.students.length > 0 ? (
                        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
                          {linkedParent.students.map((student) => (
                            <ParentLinkedStudentCard
                              key={student.id}
                              student={student}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="px-6 py-12 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-amber-50 text-amber-400">
                            <UsersRound className="h-6 w-6" />
                          </div>

                          <h3 className="mt-4 text-sm font-black text-slate-700">
                            No students linked
                          </h3>

                          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
                            Student relationships will appear here when a
                            Student record uses this parent&apos;s ID as its
                            parent relationship.
                          </p>
                        </div>
                      )}
                    </article>

                    {/* ================================================================ */}
                    {/* FAMILY RELATIONSHIP ARCHITECTURE                                 */}
                    {/* ================================================================ */}

                    <article className="relative mt-5 overflow-hidden rounded-[24px] border border-orange-100 bg-orange-50/40 p-5 sm:p-6">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-200/30 blur-3xl" />

                      <div className="relative">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-orange-500 text-white">
                            <HeartHandshake className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-black text-orange-950">
                              Family relationship architecture
                            </p>

                            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-orange-700">
                              Parent access is connected to student academic
                              data through the Student.parentId relationship.
                              The Parent account remains one universal identity
                              while each linked child maintains an independent
                              Student academic profile.
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col items-center gap-3 lg:flex-row lg:justify-center">
                          <FamilyRelationshipStage
                            icon={UsersRound}
                            label="Parent Account"
                            value={`${linkedParent.name} ${linkedParent.surname}`}
                          />

                          <ArrowRight className="h-4 w-4 rotate-90 text-orange-300 lg:rotate-0" />

                          <FamilyRelationshipStage
                            icon={HeartHandshake}
                            label="Relationship"
                            value={`${linkedParent._count.students} linked ${
                              linkedParent._count.students === 1
                                ? "student"
                                : "students"
                            }`}
                          />

                          <ArrowRight className="h-4 w-4 rotate-90 text-orange-300 lg:rotate-0" />

                          <FamilyRelationshipStage
                            icon={GraduationCap}
                            label="Academic Profiles"
                            value="Independent Student records"
                          />
                        </div>
                      </div>
                    </article>

                    {/* ================================================================ */}
                    {/* QUICK NAVIGATION                                                  */}
                    {/* ================================================================ */}

                    <article className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Family Navigation
                        </p>

                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          Related family and academic areas
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          Continue into the existing school modules associated
                          with this guardian and their linked learners.
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <LinkedNavigationCard
                          href="/list/parents"
                          icon={UsersRound}
                          title="Parents"
                          description="Open the full parent and guardian directory."
                          tone="orange"
                        />

                        <LinkedNavigationCard
                          href="/list/students"
                          icon={GraduationCap}
                          title="Students"
                          description={`${linkedParent._count.students} ${
                            linkedParent._count.students === 1
                              ? "student is"
                              : "students are"
                          } linked to this guardian.`}
                          tone="violet"
                        />

                        <LinkedNavigationCard
                          href="/list/classes"
                          icon={School}
                          title="Classes"
                          description="Open class records associated with student placement."
                          tone="blue"
                        />
                      </div>
                    </article>
                  </section>
                ) : null}

                {/* ================================================================ */}
                {/* ADMINISTRATOR LINKED PROFILE                                     */}
                {/* ================================================================ */}

                {linkedAdmin ? (
                  <section className="mt-6">
                    {/* ------------------------------------------------------------ */}
                    {/* HEADER                                                       */}
                    {/* ------------------------------------------------------------ */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <UserRoundCog className="h-4 w-4" />
                          </div>

                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
                            Administrative Domain Profile
                          </p>
                        </div>

                        <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          Administrator Linked Profile
                        </h2>

                        <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                          Administrative identity, universal account
                          relationship, RBAC scope and account health associated
                          with this administrator record.
                        </p>
                      </div>

                      <Link
                        href="/admin"
                        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Open Admin Dashboard
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* ------------------------------------------------------------ */}
                    {/* ADMIN IDENTITY + ACCESS                                      */}
                    {/* ------------------------------------------------------------ */}

                    <div className="mt-5 grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
                      {/* ========================================================== */}
                      {/* ADMIN IDENTITY CARD                                        */}
                      {/* ========================================================== */}

                      <article className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)] sm:p-6">
                        {/* DECORATIVE GLOWS */}

                        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />

                        <div className="relative">
                          {/* IMAGE + LINK BADGE */}

                          <div className="flex items-start justify-between gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/10 shadow-xl">
                              {user.imageUrl ? (
                                <Image
                                  src={user.imageUrl}
                                  alt={user.displayName ?? "Administrator"}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UserRoundCog className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-blue-200 backdrop-blur">
                              <BadgeCheck className="h-3 w-3" />
                              Linked Admin
                            </span>
                          </div>

                          {/* ADMIN IDENTITY */}

                          <div className="mt-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-blue-300">
                              Administrator Identity
                            </p>

                            <h3 className="mt-2 truncate text-xl font-black tracking-tight">
                              {user.displayName ?? "Administrator"}
                            </h3>

                            <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                              @
                              {linkedAdmin.username ??
                                user.username ??
                                "username-unavailable"}
                            </p>
                          </div>

                          {/* COMPACT ACCOUNT SUMMARY */}

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <StudentMiniStat
                              label="Domain"
                              value="Administrator"
                            />

                            <StudentMiniStat
                              label="RBAC Roles"
                              value={String(assignedRoleCount)}
                            />

                            <StudentMiniStat
                              label="Permissions"
                              value={String(effectivePermissionCount)}
                            />

                            <StudentMiniStat
                              label="Account"
                              value={
                                user.status === "ACTIVE"
                                  ? "Active"
                                  : user.status
                              }
                            />
                          </div>

                          {/* DOMAIN ID */}

                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                              Administrator Record ID
                            </p>

                            <p
                              title={linkedAdmin.id}
                              className="mt-1 truncate font-mono text-[9px] font-bold text-slate-400"
                            >
                              {linkedAdmin.id}
                            </p>
                          </div>
                        </div>
                      </article>

                      {/* ========================================================== */}
                      {/* ACCESS + ACCOUNT HEALTH                                    */}
                      {/* ========================================================== */}

                      <div className="space-y-5">
                        {/* -------------------------------------------------------- */}
                        {/* ADMINISTRATIVE ACCESS                                    */}
                        {/* -------------------------------------------------------- */}

                        <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                          {/* HEADER */}

                          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-violet-50 text-violet-600">
                                <ShieldCheck className="h-4 w-4" />
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-900">
                                  Administrative Access
                                </h3>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Application role and effective RBAC
                                  authorization
                                </p>
                              </div>
                            </div>

                            <span
                              className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${
                                accountHasAccess
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  accountHasAccess
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                              />

                              {accountHasAccess
                                ? "Access Enabled"
                                : "Access Restricted"}
                            </span>
                          </div>

                          {/* ACCESS METRICS */}

                          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4 sm:p-6">
                            <LinkedRecordMetric
                              icon={ShieldCheck}
                              label="Primary Role"
                              value={primaryRole?.name ?? "No role assigned"}
                              description="Primary RBAC role currently assigned to this identity."
                              tone="violet"
                            />

                            <LinkedRecordMetric
                              icon={Layers3}
                              label="Assigned Roles"
                              value={String(assignedRoleCount)}
                              description="Direct RBAC role assignments attached to this administrator."
                              tone="blue"
                            />

                            <LinkedRecordMetric
                              icon={KeyRound}
                              label="Permissions"
                              value={String(effectivePermissionCount)}
                              description="Unique effective permissions inherited from assigned roles."
                              tone="cyan"
                            />

                            <LinkedRecordMetric
                              icon={BadgeCheck}
                              label="Account State"
                              value={
                                user.status === "ACTIVE"
                                  ? "Active"
                                  : user.status
                              }
                              description="Current state of the universal application account."
                              tone={
                                user.status === "ACTIVE" ? "emerald" : "amber"
                              }
                            />
                          </div>
                        </article>

                        {/* -------------------------------------------------------- */}
                        {/* ACCOUNT HEALTH                                           */}
                        {/* -------------------------------------------------------- */}

                        <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                          <div
                            className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl ${
                              synchronizationHealthy
                                ? "bg-emerald-100/70"
                                : "bg-amber-100/70"
                            }`}
                          />

                          <div className="relative">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${
                                    synchronizationHealthy
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-amber-50 text-amber-600"
                                  }`}
                                >
                                  {synchronizationHealthy ? (
                                    <CircleCheckBig className="h-4 w-4" />
                                  ) : (
                                    <ShieldAlert className="h-4 w-4" />
                                  )}
                                </div>

                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    Account Health
                                  </p>

                                  <h3 className="mt-1 text-sm font-black text-slate-900">
                                    {synchronizationHealthy
                                      ? "Administrative access is healthy"
                                      : "Administrative access requires review"}
                                  </h3>
                                </div>
                              </div>

                              <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${
                                  synchronizationHealthy
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {synchronizationHealthy ? (
                                  <CircleCheck className="h-3 w-3" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3" />
                                )}

                                {synchronizationHealthy
                                  ? "Healthy"
                                  : "Review Required"}
                              </span>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
                                  Identity Match
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                  <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />

                                  <p className="text-[11px] font-black text-slate-700">
                                    Exact ID match
                                  </p>
                                </div>

                                <p className="mt-1.5 text-[9px] leading-4 text-slate-400">
                                  Admin.id matches the universal UserAccount.id.
                                </p>
                              </div>

                              <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
                                  Required Role
                                </p>

                                <p className="mt-2 truncate text-[11px] font-black text-slate-700">
                                  {expectedAccessRoleKey ?? "Not mapped"}
                                </p>

                                <p className="mt-1.5 text-[9px] leading-4 text-slate-400">
                                  Expected RBAC role derived from the
                                  application identity.
                                </p>
                              </div>

                              <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
                                  Provisioning
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      synchronizationHealthy
                                        ? "bg-emerald-500"
                                        : "bg-amber-500"
                                    }`}
                                  />

                                  <p className="text-[11px] font-black text-slate-700">
                                    {synchronizationHealthy
                                      ? "Synchronized"
                                      : "Needs review"}
                                  </p>
                                </div>

                                <p className="mt-1.5 text-[9px] leading-4 text-slate-400">
                                  Local identity, role assignment and account
                                  state.
                                </p>
                              </div>
                            </div>

                            {!synchronizationHealthy ? (
                              <div className="mt-4 rounded-[16px] border border-amber-100 bg-amber-50/60 p-4">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                                  <div>
                                    <p className="text-[10px] font-black text-amber-900">
                                      Provisioning review recommended
                                    </p>

                                    <p className="mt-1 text-[10px] leading-5 text-amber-700">
                                      {synchronizationIssues.length}{" "}
                                      {synchronizationIssues.length === 1
                                        ? "synchronization issue was"
                                        : "synchronization issues were"}{" "}
                                      detected. Review the Roles & Permissions
                                      tab for the complete access state.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 rounded-[16px] border border-emerald-100 bg-emerald-50/50 p-4">
                                <div className="flex items-start gap-3">
                                  <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                                  <div>
                                    <p className="text-[10px] font-black text-emerald-900">
                                      Administrative identity synchronized
                                    </p>

                                    <p className="mt-1 text-[10px] leading-5 text-emerald-700">
                                      The administrator domain record, universal
                                      identity, account status and expected RBAC
                                      access are currently aligned.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      </div>
                    </div>

                    {/* ================================================================ */}
                    {/* IDENTITY ARCHITECTURE                                            */}
                    {/* ================================================================ */}

                    <article className="relative mt-5 overflow-hidden rounded-[24px] border border-blue-100 bg-blue-50/40 p-5 sm:p-6">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />

                      <div className="relative">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-blue-600 text-white">
                            <Network className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-black text-blue-950">
                              Administrator identity architecture
                            </p>

                            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-blue-700">
                              The Admin record intentionally remains
                              lightweight. Authentication and universal identity
                              are maintained by UserAccount, while authorization
                              is resolved independently through RBAC roles and
                              permissions.
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                          <LinkedIdentityStage
                            icon={UserRoundCog}
                            eyebrow="Domain Record"
                            title="Administrator"
                            value={linkedAdmin.username ?? linkedAdmin.id}
                            healthy
                          />

                          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-blue-300 lg:rotate-0" />

                          <LinkedIdentityStage
                            icon={Fingerprint}
                            eyebrow="Universal Identity"
                            title="UserAccount"
                            value={user.id}
                            healthy={linkedAdmin.id === user.id}
                          />

                          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-blue-300 lg:rotate-0" />

                          <LinkedIdentityStage
                            icon={ShieldCheck}
                            eyebrow="Authorization"
                            title={primaryRole?.name ?? "RBAC Access"}
                            value={`${effectivePermissionCount} effective permissions`}
                            healthy={accountHasAccess}
                          />
                        </div>
                      </div>
                    </article>

                    {/* ================================================================ */}
                    {/* ADMIN NAVIGATION                                                 */}
                    {/* ================================================================ */}

                    <article className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Administrative Navigation
                        </p>

                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          Related administration areas
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          Continue into the main administrative workspace or
                          inspect this identity&apos;s authorization and
                          security history.
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <LinkedNavigationCard
                          href="/admin"
                          icon={Building2}
                          title="Admin Dashboard"
                          description="Return to the main school administration dashboard."
                          tone="blue"
                        />

                        <LinkedNavigationCard
                          href={`/list/access-control/users/${user.id}?tab=roles`}
                          icon={ShieldCheck}
                          title="Roles & Permissions"
                          description={`${assignedRoleCount} ${
                            assignedRoleCount === 1 ? "role" : "roles"
                          } providing ${effectivePermissionCount} effective permissions.`}
                          tone="violet"
                        />

                        <LinkedNavigationCard
                          href={`/list/access-control/users/${user.id}?tab=audit`}
                          icon={Activity}
                          title="Security & Audit"
                          description="Review administrative account changes and access-control activity."
                          tone="emerald"
                        />
                      </div>
                    </article>
                  </section>
                ) : null}

                {/* ================================================================ */}
                {/* UNIVERSAL ACCOUNT IDENTITY                                       */}
                {/* ================================================================ */}

                {linkedRecordKind === "UNIVERSAL_ONLY" ? (
                  <section className="mt-6">
                    {/* ------------------------------------------------------------ */}
                    {/* HEADER                                                       */}
                    {/* ------------------------------------------------------------ */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                            <Fingerprint className="h-4 w-4" />
                          </div>

                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-600">
                            Universal Identity
                          </p>
                        </div>

                        <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          Universal Account Identity
                        </h2>

                        <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                          This account intentionally operates through the
                          universal UserAccount identity and RBAC authorization
                          system without requiring a separate Student, Teacher,
                          Parent or Administrator domain profile.
                        </p>
                      </div>

                      <Link
                        href={`/list/access-control/users/${user.id}?tab=roles`}
                        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                      >
                        Review Access
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* ============================================================ */}
                    {/* MAIN IDENTITY                                                */}
                    {/* ============================================================ */}

                    <div className="mt-5 grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
                      {/* ---------------------------------------------------------- */}
                      {/* UNIVERSAL IDENTITY CARD                                    */}
                      {/* ---------------------------------------------------------- */}

                      <article className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)] sm:p-6">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

                        <div className="relative">
                          {/* IMAGE + TYPE */}

                          <div className="flex items-start justify-between gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/10 shadow-xl">
                              {user.imageUrl ? (
                                <Image
                                  src={user.imageUrl}
                                  alt={user.displayName ?? "Universal Account"}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Fingerprint className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-cyan-200 backdrop-blur">
                              <CircleCheck className="h-3 w-3" />
                              Universal Only
                            </span>
                          </div>

                          {/* IDENTITY */}

                          <div className="mt-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-cyan-300">
                              UserAccount Identity
                            </p>

                            <h3 className="mt-2 truncate text-xl font-black tracking-tight">
                              {user.displayName ?? "Universal Account"}
                            </h3>

                            <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                              @{user.username ?? "username-unavailable"}
                            </p>
                          </div>

                          {/* MINI STATS */}

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <StudentMiniStat
                              label="Identity"
                              value="Universal"
                            />

                            <StudentMiniStat
                              label="RBAC Roles"
                              value={String(assignedRoleCount)}
                            />

                            <StudentMiniStat
                              label="Permissions"
                              value={String(effectivePermissionCount)}
                            />

                            <StudentMiniStat
                              label="Account"
                              value={
                                user.status === "ACTIVE"
                                  ? "Active"
                                  : user.status
                              }
                            />
                          </div>

                          {/* UNIVERSAL ID */}

                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                              Universal User ID
                            </p>

                            <p
                              title={user.id}
                              className="mt-1 truncate font-mono text-[9px] font-bold text-slate-400"
                            >
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </article>

                      {/* ========================================================== */}
                      {/* IDENTITY + ACCESS STATE                                    */}
                      {/* ========================================================== */}

                      <div className="space-y-5">
                        {/* -------------------------------------------------------- */}
                        {/* UNIVERSAL IDENTITY INFORMATION                           */}
                        {/* -------------------------------------------------------- */}

                        <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-cyan-50 text-cyan-600">
                                <UserRound className="h-4 w-4" />
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-900">
                                  Universal Identity Information
                                </h3>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Account-level identity managed independently
                                  of school-domain records
                                </p>
                              </div>
                            </div>

                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-emerald-700">
                              <CircleCheck className="h-3 w-3" />
                              Valid Architecture
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2">
                            <AccountInfoCell
                              icon={UserRound}
                              label="Display Name"
                              value={user.displayName ?? "Not supplied"}
                            />

                            <AccountInfoCell
                              icon={AtSign}
                              label="Username"
                              value={user.username ?? "Not supplied"}
                            />

                            <AccountInfoCell
                              icon={Mail}
                              label="Email"
                              value={user.email ?? "Not supplied"}
                            />

                            <AccountInfoCell
                              icon={Phone}
                              label="Phone"
                              value={user.phone ?? "Not supplied"}
                            />

                            <AccountInfoCell
                              icon={Fingerprint}
                              label="Application Identity"
                              value={formatLegacyRole(user.legacyRole)}
                              badge
                            />

                            <AccountInfoCell
                              icon={BadgeCheck}
                              label="Account Status"
                              value={user.status}
                              status={user.status === "ACTIVE"}
                            />
                          </div>
                        </article>

                        {/* -------------------------------------------------------- */}
                        {/* ACCESS HEALTH                                            */}
                        {/* -------------------------------------------------------- */}

                        <article className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                          <div
                            className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl ${
                              accountHasAccess
                                ? "bg-emerald-100/70"
                                : "bg-amber-100/70"
                            }`}
                          />

                          <div className="relative">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${
                                    accountHasAccess
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-amber-50 text-amber-600"
                                  }`}
                                >
                                  {accountHasAccess ? (
                                    <ShieldCheck className="h-4 w-4" />
                                  ) : (
                                    <ShieldAlert className="h-4 w-4" />
                                  )}
                                </div>

                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    Authorization Health
                                  </p>

                                  <h3 className="mt-1 text-sm font-black text-slate-900">
                                    {accountHasAccess
                                      ? "Universal account has active access"
                                      : "Universal account access is restricted"}
                                  </h3>
                                </div>
                              </div>

                              <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${
                                  accountHasAccess
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    accountHasAccess
                                      ? "bg-emerald-500"
                                      : "bg-amber-500"
                                  }`}
                                />

                                {accountHasAccess
                                  ? "Access Enabled"
                                  : "Restricted"}
                              </span>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
                                  Assigned Roles
                                </p>

                                <p className="mt-2 text-lg font-black text-slate-800">
                                  {assignedRoleCount}
                                </p>

                                <p className="mt-1 text-[9px] leading-4 text-slate-400">
                                  Direct RBAC roles attached to this identity.
                                </p>
                              </div>

                              <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
                                  Effective Permissions
                                </p>

                                <p className="mt-2 text-lg font-black text-slate-800">
                                  {effectivePermissionCount}
                                </p>

                                <p className="mt-1 text-[9px] leading-4 text-slate-400">
                                  Unique permissions inherited from all assigned
                                  roles.
                                </p>
                              </div>

                              <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
                                  Primary Role
                                </p>

                                <p
                                  title={
                                    primaryRole?.name ?? "No role assigned"
                                  }
                                  className="mt-2 truncate text-[11px] font-black text-slate-800"
                                >
                                  {primaryRole?.name ?? "No role assigned"}
                                </p>

                                <p className="mt-1 text-[9px] leading-4 text-slate-400">
                                  Primary RBAC authorization currently attached
                                  to the account.
                                </p>
                              </div>
                            </div>

                            <div
                              className={`mt-5 rounded-[16px] border p-4 ${
                                accountHasAccess
                                  ? "border-emerald-100 bg-emerald-50/50"
                                  : "border-amber-100 bg-amber-50/50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {accountHasAccess ? (
                                  <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                ) : (
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                )}

                                <div>
                                  <p
                                    className={`text-[10px] font-black ${
                                      accountHasAccess
                                        ? "text-emerald-900"
                                        : "text-amber-900"
                                    }`}
                                  >
                                    {accountHasAccess
                                      ? "RBAC authorization available"
                                      : "RBAC authorization requires review"}
                                  </p>

                                  <p
                                    className={`mt-1 text-[10px] leading-5 ${
                                      accountHasAccess
                                        ? "text-emerald-700"
                                        : "text-amber-700"
                                    }`}
                                  >
                                    {accountHasAccess
                                      ? "This universal identity does not require a separate school-domain record. Application access is resolved directly through its UserAccount and assigned RBAC roles."
                                      : "The universal identity is valid, but normal application access requires an active account with at least one assigned RBAC role."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      </div>
                    </div>

                    {/* ================================================================ */}
                    {/* UNIVERSAL ACCOUNT ARCHITECTURE                                   */}
                    {/* ================================================================ */}

                    <article className="relative mt-5 overflow-hidden rounded-[24px] border border-cyan-100 bg-cyan-50/40 p-5 sm:p-6">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl" />

                      <div className="relative">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-cyan-600 text-white">
                            <Network className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-black text-cyan-950">
                              Universal account architecture
                            </p>

                            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-cyan-700">
                              This identity is intentionally represented only by
                              UserAccount. Unlike students, teachers, parents
                              and administrators, it does not require a
                              secondary school-domain record. Authentication,
                              application identity and authorization remain
                              independently managed through the universal
                              account and RBAC system.
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                          <LinkedIdentityStage
                            icon={Fingerprint}
                            eyebrow="Universal Identity"
                            title="UserAccount"
                            value={user.id}
                            healthy
                          />

                          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-cyan-300 lg:rotate-0" />

                          <LinkedIdentityStage
                            icon={Database}
                            eyebrow="Domain Requirement"
                            title="No Separate Record"
                            value="Universal-only architecture"
                            healthy
                          />

                          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-cyan-300 lg:rotate-0" />

                          <LinkedIdentityStage
                            icon={ShieldCheck}
                            eyebrow="Authorization"
                            title={primaryRole?.name ?? "RBAC Access"}
                            value={`${effectivePermissionCount} effective permissions`}
                            healthy={accountHasAccess}
                          />
                        </div>
                      </div>
                    </article>

                    {/* ================================================================ */}
                    {/* WHY THERE IS NO DOMAIN RECORD                                    */}
                    {/* ================================================================ */}

                    <article className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-50 text-blue-600">
                            <Info className="h-4 w-4" />
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-slate-900">
                              Why no domain record exists
                            </h3>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              Expected behavior for universal-only identities
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
                        <div className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                            <Fingerprint className="h-4 w-4" />
                          </div>

                          <p className="mt-4 text-xs font-black text-slate-800">
                            Universal identity only
                          </p>

                          <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                            The UserAccount record already provides the
                            application's canonical local identity.
                          </p>
                        </div>

                        <div className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <ShieldCheck className="h-4 w-4" />
                          </div>

                          <p className="mt-4 text-xs font-black text-slate-800">
                            Access through RBAC
                          </p>

                          <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                            Capabilities are determined by assigned roles and
                            effective permissions rather than a school-domain
                            profile.
                          </p>
                        </div>

                        <div className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CircleCheckBig className="h-4 w-4" />
                          </div>

                          <p className="mt-4 text-xs font-black text-slate-800">
                            Not a broken relationship
                          </p>

                          <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                            The absence of Student, Teacher, Parent or Admin
                            records is expected and should not be treated as an
                            integrity failure.
                          </p>
                        </div>
                      </div>
                    </article>

                    {/* ================================================================ */}
                    {/* QUICK NAVIGATION                                                 */}
                    {/* ================================================================ */}

                    <article className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Access Navigation
                        </p>

                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          Related identity and security areas
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          Review authorization, account history and the complete
                          security record for this universal identity.
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <LinkedNavigationCard
                          href={`/list/access-control/users/${user.id}?tab=overview`}
                          icon={UserRound}
                          title="Account Overview"
                          description="Review universal identity and local account information."
                          tone="blue"
                        />

                        <LinkedNavigationCard
                          href={`/list/access-control/users/${user.id}?tab=roles`}
                          icon={ShieldCheck}
                          title="Roles & Permissions"
                          description={`${assignedRoleCount} ${
                            assignedRoleCount === 1 ? "role" : "roles"
                          } providing ${effectivePermissionCount} effective permissions.`}
                          tone="violet"
                        />

                        <LinkedNavigationCard
                          href={`/list/access-control/users/${user.id}?tab=audit`}
                          icon={Activity}
                          title="Activity & Audit"
                          description="Review security, account and authorization changes for this identity."
                          tone="emerald"
                        />
                      </div>
                    </article>
                  </section>
                ) : null}

                {/* ================================================================ */}
                {/* MISSING DOMAIN RECORD / IDENTITY INTEGRITY WARNING                */}
                {/* ================================================================ */}

                {linkedRecordKind === "NONE" ? (
                  <section className="mt-6">
                    {/* ------------------------------------------------------------ */}
                    {/* HEADER                                                       */}
                    {/* ------------------------------------------------------------ */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <ShieldAlert className="h-4 w-4" />
                          </div>

                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600">
                            Identity Integrity Warning
                          </p>
                        </div>

                        <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          Missing Domain Record
                        </h2>

                        <p className="mt-1.5 max-w-3xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                          This universal account does not currently resolve to
                          the school-domain record expected from its application
                          identity. Review the identity, provisioning and
                          account relationships before relying on this profile.
                        </p>
                      </div>

                      <Link
                        href={`/list/access-control/users/${user.id}?tab=roles`}
                        className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-xs font-black text-amber-700 shadow-sm transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800"
                      >
                        Review Access Configuration
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* ============================================================ */}
                    {/* PRIMARY WARNING                                              */}
                    {/* ============================================================ */}

                    <article className="relative mt-5 overflow-hidden rounded-[26px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 shadow-[0_20px_60px_rgba(120,53,15,0.08)]">
                      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />

                      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-rose-200/30 blur-3xl" />

                      <div className="relative p-5 sm:p-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-amber-500 text-white shadow-[0_12px_30px_rgba(245,158,11,0.22)]">
                              <ShieldAlert className="h-6 w-6" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-600">
                                  Relationship Integrity
                                </p>

                                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-rose-700">
                                  <CircleAlert className="h-3 w-3" />
                                  Investigation Required
                                </span>
                              </div>

                              <h3 className="mt-2 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                                Expected school-domain profile could not be
                                found
                              </h3>

                              <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-500">
                                The account exists in UserAccount, but its
                                current application identity indicates that a
                                corresponding school-domain record should exist.
                                No matching record was found using the shared
                                universal identity.
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 rounded-[18px] border border-amber-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                              Current State
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />

                              <p className="text-xs font-black text-amber-800">
                                Domain link missing
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>

                    {/* ============================================================ */}
                    {/* DIAGNOSTIC SUMMARY                                           */}
                    {/* ============================================================ */}

                    <div className="mt-5 grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
                      {/* ---------------------------------------------------------- */}
                      {/* ACCOUNT IDENTITY                                          */}
                      {/* ---------------------------------------------------------- */}

                      <article className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)] sm:p-6">
                        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-500/20 blur-3xl" />

                        <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-rose-500/10 blur-3xl" />

                        <div className="relative">
                          {/* IMAGE + STATUS */}

                          <div className="flex items-start justify-between gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/10 shadow-xl">
                              {user.imageUrl ? (
                                <Image
                                  src={user.imageUrl}
                                  alt={user.displayName ?? "User"}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UserRound className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                            </div>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-amber-200 backdrop-blur">
                              <AlertTriangle className="h-3 w-3" />
                              Link Missing
                            </span>
                          </div>

                          {/* IDENTITY */}

                          <div className="mt-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-300">
                              Universal Account
                            </p>

                            <h3 className="mt-2 truncate text-xl font-black tracking-tight">
                              {user.displayName ?? "Unknown User"}
                            </h3>

                            <p className="mt-1 truncate text-[10px] font-bold text-slate-400">
                              @{user.username ?? "username-unavailable"}
                            </p>
                          </div>

                          {/* MINI STATS */}

                          <div className="mt-5 grid grid-cols-2 gap-2">
                            <StudentMiniStat
                              label="Expected Type"
                              value={
                                user.legacyRole
                                  ? formatLegacyRole(user.legacyRole)
                                  : "Unknown"
                              }
                            />

                            <StudentMiniStat
                              label="Domain Record"
                              value="Missing"
                            />

                            <StudentMiniStat
                              label="RBAC Roles"
                              value={String(assignedRoleCount)}
                            />

                            <StudentMiniStat
                              label="Account"
                              value={
                                user.status === "ACTIVE"
                                  ? "Active"
                                  : user.status
                              }
                            />
                          </div>

                          {/* UNIVERSAL ID */}

                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-500">
                              Universal User ID
                            </p>

                            <p
                              title={user.id}
                              className="mt-1 truncate font-mono text-[9px] font-bold text-slate-400"
                            >
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </article>

                      {/* ========================================================== */}
                      {/* DIAGNOSTIC DETAILS                                        */}
                      {/* ========================================================== */}

                      <div className="space-y-5">
                        {/* -------------------------------------------------------- */}
                        {/* IDENTITY DIAGNOSTICS                                    */}
                        {/* -------------------------------------------------------- */}

                        <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-amber-50 text-amber-600">
                                <ScanSearch className="h-4 w-4" />
                              </div>

                              <div>
                                <h3 className="text-sm font-black text-slate-900">
                                  Identity Diagnostics
                                </h3>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Current identity and expected domain
                                  relationship
                                </p>
                              </div>
                            </div>

                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-amber-700">
                              <ScanSearch className="h-3 w-3" />
                              Diagnostic State
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2">
                            <AccountInfoCell
                              icon={Fingerprint}
                              label="Universal ID"
                              value={user.id}
                            />

                            <AccountInfoCell
                              icon={UserCog}
                              label="Application Identity"
                              value={formatLegacyRole(user.legacyRole)}
                              badge
                            />

                            <AccountInfoCell
                              icon={Database}
                              label="Expected Domain"
                              value={
                                user.legacyRole
                                  ? formatLegacyRole(user.legacyRole)
                                  : "Unable to determine"
                              }
                            />

                            <AccountInfoCell
                              icon={Link2}
                              label="Domain Link"
                              value="No matching record"
                            />

                            <AccountInfoCell
                              icon={ShieldCheck}
                              label="Primary RBAC Role"
                              value={primaryRole?.name ?? "No role assigned"}
                            />

                            <AccountInfoCell
                              icon={BadgeCheck}
                              label="Account State"
                              value={user.status}
                              status={user.status === "ACTIVE"}
                            />
                          </div>
                        </article>

                        {/* -------------------------------------------------------- */}
                        {/* INTEGRITY ASSESSMENT                                    */}
                        {/* -------------------------------------------------------- */}

                        <article className="relative overflow-hidden rounded-[24px] border border-amber-200 bg-white p-5 shadow-[0_16px_45px_rgba(120,53,15,0.06)] sm:p-6">
                          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-100/70 blur-3xl" />

                          <div className="relative">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-amber-50 text-amber-600">
                                  <ShieldQuestion className="h-4 w-4" />
                                </div>

                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                                    Integrity Assessment
                                  </p>

                                  <h3 className="mt-1 text-sm font-black text-slate-900">
                                    Identity relationship requires investigation
                                  </h3>
                                </div>
                              </div>

                              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-rose-700">
                                <CircleAlert className="h-3 w-3" />
                                Unresolved
                              </span>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              {/* UNIVERSAL ACCOUNT */}

                              <div className="rounded-[16px] border border-emerald-100 bg-emerald-50/40 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-emerald-600">
                                  UserAccount
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                  <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />

                                  <p className="text-[11px] font-black text-emerald-900">
                                    Present
                                  </p>
                                </div>

                                <p className="mt-1.5 text-[9px] leading-4 text-emerald-700">
                                  The universal local account exists and can be
                                  resolved.
                                </p>
                              </div>

                              {/* APPLICATION ROLE */}

                              <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
                                  Declared Identity
                                </p>

                                <p className="mt-2 truncate text-[11px] font-black text-slate-700">
                                  {user.legacyRole
                                    ? formatLegacyRole(user.legacyRole)
                                    : "Not assigned"}
                                </p>

                                <p className="mt-1.5 text-[9px] leading-4 text-slate-400">
                                  Application identity used to determine the
                                  expected domain profile.
                                </p>
                              </div>

                              {/* DOMAIN RECORD */}

                              <div className="rounded-[16px] border border-rose-100 bg-rose-50/50 p-4">
                                <p className="text-[8px] font-black uppercase tracking-[0.09em] text-rose-600">
                                  Domain Record
                                </p>

                                <div className="mt-2 flex items-center gap-2">
                                  <CircleAlert className="h-3.5 w-3.5 text-rose-500" />

                                  <p className="text-[11px] font-black text-rose-900">
                                    Not Found
                                  </p>
                                </div>

                                <p className="mt-1.5 text-[9px] leading-4 text-rose-700">
                                  No corresponding school-domain record was
                                  located using this identity.
                                </p>
                              </div>
                            </div>

                            {/* SUMMARY */}

                            <div className="mt-5 rounded-[16px] border border-amber-100 bg-amber-50/60 p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                                <div>
                                  <p className="text-[10px] font-black text-amber-900">
                                    Domain relationship is incomplete
                                  </p>

                                  <p className="mt-1 text-[10px] leading-5 text-amber-700">
                                    The account can still exist in Access
                                    Control, but role-specific school features
                                    may fail or return incomplete information
                                    until the expected domain relationship is
                                    restored or the application identity is
                                    corrected.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      </div>
                    </div>

                    {/* ================================================================ */}
                    {/* EXPECTED IDENTITY FLOW                                           */}
                    {/* ================================================================ */}

                    <article className="relative mt-5 overflow-hidden rounded-[24px] border border-amber-100 bg-amber-50/40 p-5 sm:p-6">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />

                      <div className="relative">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-amber-500 text-white">
                            <Waypoints className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-black text-amber-950">
                              Expected identity relationship
                            </p>

                            <p className="mt-1 max-w-4xl text-[11px] leading-5 text-amber-700">
                              Role-specific accounts should resolve from the
                              universal UserAccount identity into their
                              corresponding school-domain record using the same
                              ID. This relationship is currently incomplete.
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
                          <LinkedIdentityStage
                            icon={Fingerprint}
                            eyebrow="Universal Identity"
                            title="UserAccount"
                            value={user.id}
                            healthy
                          />

                          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-amber-300 lg:rotate-0" />

                          <LinkedIdentityStage
                            icon={UserCog}
                            eyebrow="Application Identity"
                            title={
                              user.legacyRole
                                ? formatLegacyRole(user.legacyRole)
                                : "Unknown Role"
                            }
                            value={
                              user.legacyRole
                                ? `Expected ${formatLegacyRole(user.legacyRole)} domain record`
                                : "No reliable domain type available"
                            }
                            healthy={Boolean(user.legacyRole)}
                          />

                          <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-amber-300 lg:rotate-0" />

                          <LinkedIdentityStage
                            icon={Database}
                            eyebrow="School Domain"
                            title="Record Missing"
                            value="Relationship unresolved"
                            healthy={false}
                          />
                        </div>
                      </div>
                    </article>

                    {/* ================================================================ */}
                    {/* POSSIBLE CAUSES                                                  */}
                    {/* ================================================================ */}

                    <article className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-rose-50 text-rose-600">
                            <ScanSearch className="h-4 w-4" />
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-slate-900">
                              What should be reviewed
                            </h3>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              Common identity conditions that can produce this
                              state
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4 sm:p-6">
                        {/* 1 */}

                        <div className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Database className="h-4 w-4" />
                          </div>

                          <p className="mt-4 text-xs font-black text-slate-800">
                            Missing record
                          </p>

                          <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                            The expected school-domain record may never have
                            been created or may have been removed.
                          </p>
                        </div>

                        {/* 2 */}

                        <div className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <Fingerprint className="h-4 w-4" />
                          </div>

                          <p className="mt-4 text-xs font-black text-slate-800">
                            Identity mismatch
                          </p>

                          <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                            A domain record may exist under a different
                            identifier rather than this UserAccount ID.
                          </p>
                        </div>

                        {/* 3 */}

                        <div className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <UserCog className="h-4 w-4" />
                          </div>

                          <p className="mt-4 text-xs font-black text-slate-800">
                            Incorrect application role
                          </p>

                          <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                            The stored legacy role may no longer represent the
                            user&apos;s real school identity.
                          </p>
                        </div>

                        {/* 4 */}

                        <div className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <RefreshCcw className="h-4 w-4" />
                          </div>

                          <p className="mt-4 text-xs font-black text-slate-800">
                            Incomplete provisioning
                          </p>

                          <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
                            Account creation may have succeeded while domain
                            provisioning did not complete.
                          </p>
                        </div>
                      </div>
                    </article>

                    {/* ================================================================ */}
                    {/* RBAC VS DOMAIN HEALTH                                            */}
                    {/* ================================================================ */}

                    <article className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.045)]">
                      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-violet-50 text-violet-600">
                            <GitCompareArrows className="h-4 w-4" />
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-slate-900">
                              Access health vs identity health
                            </h3>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              Authorization and domain integrity are separate
                              concerns
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.07em] text-slate-500">
                          Diagnostic Comparison
                        </span>
                      </div>

                      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                        {/* RBAC */}

                        <div
                          className={`rounded-[20px] border p-5 ${
                            accountHasAccess
                              ? "border-emerald-100 bg-emerald-50/40"
                              : "border-amber-100 bg-amber-50/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${
                                accountHasAccess
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              <ShieldCheck className="h-4 w-4" />
                            </div>

                            <span
                              className={`h-2 w-2 rounded-full ${
                                accountHasAccess
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                          </div>

                          <p className="mt-4 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                            Access Control
                          </p>

                          <p className="mt-1 text-sm font-black text-slate-900">
                            {accountHasAccess
                              ? "RBAC access available"
                              : "RBAC access restricted"}
                          </p>

                          <p className="mt-2 text-[10px] leading-5 text-slate-500">
                            {assignedRoleCount}{" "}
                            {assignedRoleCount === 1 ? "role is" : "roles are"}{" "}
                            assigned, providing {effectivePermissionCount}{" "}
                            effective permissions.
                          </p>
                        </div>

                        {/* DOMAIN */}

                        <div className="rounded-[20px] border border-rose-100 bg-rose-50/40 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-rose-50 text-rose-600">
                              <Database className="h-4 w-4" />
                            </div>

                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                          </div>

                          <p className="mt-4 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                            Domain Integrity
                          </p>

                          <p className="mt-1 text-sm font-black text-rose-900">
                            Domain relationship unresolved
                          </p>

                          <p className="mt-2 text-[10px] leading-5 text-rose-700">
                            Authorization may still exist, but the role-specific
                            school profile required by this application identity
                            could not be located.
                          </p>
                        </div>
                      </div>
                    </article>

                    {/* ================================================================ */}
                    {/* INVESTIGATION ACTIONS                                            */}
                    {/* ================================================================ */}

                    <article className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.045)] sm:p-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Investigation Navigation
                        </p>

                        <h3 className="mt-1 text-sm font-black text-slate-900">
                          Review identity and access records
                        </h3>

                        <p className="mt-1 text-[10px] leading-5 text-slate-400">
                          Use the account, authorization and audit views to
                          determine whether the domain record should be
                          restored, recreated or the identity classification
                          corrected.
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <LinkedNavigationCard
                          href={`/list/access-control/users/${user.id}?tab=overview`}
                          icon={UserRound}
                          title="Account Overview"
                          description="Review the canonical UserAccount identity and local account state."
                          tone="blue"
                        />

                        <LinkedNavigationCard
                          href={`/list/access-control/users/${user.id}?tab=roles`}
                          icon={ShieldAlert}
                          title="Roles & Permissions"
                          description="Compare the application identity against assigned RBAC authorization."
                          tone="amber"
                        />

                        <LinkedNavigationCard
                          href={`/list/access-control/users/${user.id}?tab=audit`}
                          icon={Activity}
                          title="Activity & Audit"
                          description="Investigate account creation, role assignment and lifecycle changes."
                          tone="orange"
                        />
                      </div>
                    </article>
                  </section>
                ) : null}
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               HERO META                                    */
/* -------------------------------------------------------------------------- */

function HeroMetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;

  label: string;

  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DATE HELPERS                                  */
/* -------------------------------------------------------------------------- */

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",

    month: "long",

    year: "numeric",
  }).format(value);
}

function formatRelativeDate(value: Date) {
  const now = Date.now();

  const difference = now - value.getTime();

  const minutes = Math.max(0, Math.floor(difference / 60000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  return formatDate(value);
}

/* -------------------------------------------------------------------------- */
/*                           ACCOUNT INFO CELL                                */
/* -------------------------------------------------------------------------- */

function AccountInfoCell({
  icon: Icon,
  label,
  value,
  badge = false,
  status = false,
}: {
  icon: typeof UserRound;

  label: string;

  value: string;

  badge?: boolean;

  status?: boolean;
}) {
  return (
    <div className="group border-b border-slate-100 p-5 transition hover:bg-slate-50/70 sm:p-6 sm:[&:nth-child(odd)]:border-r lg:[&:nth-child(odd)]:border-r-0 lg:[&:not(:nth-child(3n))]:border-r">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-blue-500" />

        <p className="text-[9px] font-black uppercase tracking-[0.11em] text-slate-400">
          {label}
        </p>
      </div>

      <div className="mt-2.5">
        {status ? (
          <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.07em] text-emerald-700">
            {value}
          </span>
        ) : badge ? (
          <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.07em] text-blue-700">
            {value}
          </span>
        ) : (
          <p className="break-words text-sm font-black leading-5 text-slate-800">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          ABOUT ACCOUNT ITEM                                */
/* -------------------------------------------------------------------------- */

function AboutAccountItem({
  icon: Icon,
  title,
  value,
  positive = false,
}: {
  icon: typeof UserRound;
  title: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] px-2 py-2.5 transition hover:bg-slate-50">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          positive
            ? "bg-emerald-50 text-emerald-600"
            : "bg-blue-50 text-blue-600"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-700">{title}</p>

        <p
          className={`mt-0.5 truncate text-[11px] ${
            positive
              ? "font-bold text-emerald-600"
              : "font-medium text-slate-400"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          ROLE FORMATTER                                    */
/* -------------------------------------------------------------------------- */

function formatLegacyRole(role: string | null) {
  switch (role) {
    case "admin":
      return "Administrator";

    case "teacher":
      return "Teacher";

    case "student":
      return "Student";

    case "parent":
      return "Parent / Guardian";

    case "account":
      return "Accountant / Bursar";

    default:
      return role ? role : "Not assigned";
  }
}

/* -------------------------------------------------------------------------- */
/*                       ACCOUNT ARCHITECTURE COPY                            */
/* -------------------------------------------------------------------------- */

function getAccountArchitectureDescription(role: string | null) {
  switch (role) {
    case "account":
      return "Finance users use the universal UserAccount identity together with Accountant / Bursar RBAC permissions. No separate Accountant domain record is currently required.";

    case "teacher":
      return "Teacher accounts combine the universal UserAccount identity with a linked Teacher school profile and role-based academic permissions.";

    case "student":
      return "Student accounts combine the universal UserAccount identity with a linked Student academic profile, class membership and learner access permissions.";

    case "parent":
      return "Parent accounts combine the universal UserAccount identity with a Parent / Guardian profile and relationships to linked students.";

    case "admin":
      return "Administrator accounts use the universal UserAccount identity together with elevated administrative roles and system permissions.";

    default:
      return "This identity is managed through the school's central UserAccount and role-based access architecture.";
  }
}

function ComingSoonPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-blue-100 bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-lg font-black text-slate-900">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

        <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
          Next build stage
        </span>
      </div>
    </div>
  );
}

function RoleTableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-[0.1em] text-slate-400 sm:px-6">
      {children}
    </th>
  );
}

function RoleTypeBadge({ type }: { type: string }) {
  const custom = type === "CUSTOM";

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${
        custom ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"
      }`}
    >
      {type}
    </span>
  );
}

function MobileRoleMeta({
  label,
  value,
  positive = false,
}: {
  label: string;

  value: string;

  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-xs font-black ${
          positive ? "text-emerald-600" : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  }).format(value);
}

function getAuditActivityConfig(action: string) {
  switch (action) {
    case "USER_CREATED":
      return {
        title: "User created",

        icon: CircleCheck,

        iconClass: "bg-emerald-100 text-emerald-600",
      };

    case "ROLE_ASSIGNED":
      return {
        title: "Role assigned",

        icon: ShieldPlus,

        iconClass: "bg-blue-100 text-blue-600",
      };

    case "ROLE_REMOVED":
      return {
        title: "Role removed",

        icon: ShieldCheck,

        iconClass: "bg-amber-100 text-amber-600",
      };

    case "USER_UPDATED":
      return {
        title: "Account updated",

        icon: Pencil,

        iconClass: "bg-violet-100 text-violet-600",
      };

    default:
      return {
        title: formatAuditAction(action),

        icon: Activity,

        iconClass: "bg-slate-100 text-slate-500",
      };
  }
}

function formatAuditAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getAuditActivityDescription(
  activity: {
    action: string;

    metadata: unknown;

    roleId: number | null;
  },

  displayName: string,
) {
  switch (activity.action) {
    case "USER_CREATED":
      return `${displayName}'s account was successfully provisioned.`;

    case "ROLE_ASSIGNED":
      return "An RBAC role was assigned to this account.";

    case "ROLE_REMOVED":
      return "An RBAC role was removed from this account.";

    case "USER_UPDATED":
      return "The user's account information was updated.";

    default:
      return "An access-control activity was recorded for this account.";
  }
}

function AccessSummaryCard({
  icon: Icon,
  eyebrow,
  value,
  label,
  description,
  tone,
  compactValue = false,
}: {
  icon: typeof ShieldCheck;

  eyebrow: string;

  value: string;

  label: string;

  description: string;

  tone: "blue" | "violet" | "amber" | "emerald" | "rose";

  compactValue?: boolean;
}) {
  const tones = {
    blue: {
      icon: "bg-blue-50 text-blue-600 ring-blue-100",
      glow: "bg-blue-500/10",
      accent: "bg-blue-500",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600 ring-violet-100",
      glow: "bg-violet-500/10",
      accent: "bg-violet-500",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600 ring-amber-100",
      glow: "bg-amber-500/10",
      accent: "bg-amber-500",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
      glow: "bg-emerald-500/10",
      accent: "bg-emerald-500",
    },

    rose: {
      icon: "bg-rose-50 text-rose-600 ring-rose-100",
      glow: "bg-rose-500/10",
      accent: "bg-rose-500",
    },
  };

  const current = tones[tone];

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.075)]">
      {/* DECORATIVE GLOW */}

      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition duration-500 group-hover:scale-125 ${current.glow}`}
      />

      {/* TOP */}

      <div className="relative flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ring-1 ${current.icon}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <div className={`mt-1 h-1.5 w-1.5 rounded-full ${current.accent}`} />
      </div>

      {/* CONTENT */}

      <div className="relative mt-5">
        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
          {eyebrow}
        </p>

        <p
          className={`mt-2 truncate font-black tracking-[-0.035em] text-slate-950 ${
            compactValue ? "text-xl" : "text-3xl"
          }`}
          title={value}
        >
          {value}
        </p>

        <p className="mt-1 text-xs font-black text-slate-700">{label}</p>

        <p className="mt-3 min-h-[40px] text-[10px] font-medium leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function AssignedRoleCard({
  roleName,
  roleKey,
  description,
  roleType,
  permissionCount,
  required,
  protectedRole,
  assignedAt,
  assignedBy,
  source,
}: {
  roleName: string;

  roleKey: string;

  description: string | null;

  roleType: string;

  permissionCount: number;

  required: boolean;

  protectedRole: boolean;

  assignedAt: Date;

  assignedBy: string | null;

  source: string;
}) {
  const custom = roleType === "CUSTOM";

  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_38px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_22px_50px_rgba(15,23,42,0.075)] sm:p-6">
      {/* GLOW */}

      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl ${
          custom ? "bg-violet-500/10" : "bg-blue-500/10"
        }`}
      />

      {/* TOP */}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ${
              custom
                ? "bg-violet-50 text-violet-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <ShieldCheck className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-black text-slate-950">
                {roleName}
              </h3>

              {required ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-700">
                  <LockKeyhole className="h-2.5 w-2.5" />
                  Primary / Required
                </span>
              ) : null}
            </div>

            <code className="mt-1.5 inline-flex rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">
              {roleKey}
            </code>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.08em] ${
            custom ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {roleType}
        </span>
      </div>

      {/* DESCRIPTION */}

      <p className="relative mt-4 min-h-[40px] text-xs leading-5 text-slate-500">
        {description ??
          "This role grants a defined set of application permissions through the RBAC system."}
      </p>

      {/* PERMISSION COUNT */}

      <div className="relative mt-5 rounded-[18px] border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <KeyRound className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
                Role Permissions
              </p>

              <p className="mt-0.5 text-sm font-black text-slate-800">
                {permissionCount}{" "}
                {permissionCount === 1 ? "permission" : "permissions"}
              </p>
            </div>
          </div>

          {protectedRole ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[8px] font-black uppercase tracking-[0.07em] text-amber-700">
              <ShieldCheck className="h-2.5 w-2.5" />
              Protected
            </span>
          ) : null}
        </div>
      </div>

      {/* ASSIGNMENT DETAILS */}

      <div className="relative mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
        <RoleMetaItem label="Assigned" value={formatDateTime(assignedAt)} />

        <RoleMetaItem label="Source" value={formatAssignmentSource(source)} />

        <RoleMetaItem
          label="Assigned By"
          value={assignedBy ? shortenIdentifier(assignedBy) : "System"}
        />

        <RoleMetaItem label="Status" value="Active" positive />
      </div>
    </article>
  );
}

function RoleMetaItem({
  label,
  value,
  positive = false,
}: {
  label: string;

  value: string;

  positive?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-[11px] font-black ${
          positive ? "text-emerald-600" : "text-slate-700"
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function formatAssignmentSource(source: string) {
  switch (source) {
    case "ADMIN":
      return "Administrator";

    case "SYSTEM":
      return "System";

    case "MIGRATION":
      return "Migration";

    case "PROVISIONING":
      return "Provisioning";

    default:
      return source
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
}

function shortenIdentifier(value: string) {
  if (value.length <= 22) {
    return value;
  }

  return `${value.slice(0, 10)}…${value.slice(-7)}`;
}

function groupPermissions(permissions: string[]) {
  return permissions.reduce<Record<string, string[]>>((groups, permission) => {
    const [group] = permission.split(".");

    const key = group || "general";

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(permission);

    return groups;
  }, {});
}

function getPermissionGroupConfig(group: string) {
  switch (group) {
    case "finance":
      return {
        label: "Finance",

        icon: WalletCards,

        iconClass: "bg-emerald-50 text-emerald-600",
      };

    case "students":
      return {
        label: "Students",

        icon: GraduationCap,

        iconClass: "bg-blue-50 text-blue-600",
      };

    case "teachers":
      return {
        label: "Teachers",

        icon: Users,

        iconClass: "bg-violet-50 text-violet-600",
      };

    case "academics":
      return {
        label: "Academics",

        icon: BookOpenCheck,

        iconClass: "bg-cyan-50 text-cyan-600",
      };

    case "assessments":
      return {
        label: "Assessments",

        icon: ClipboardCheck,

        iconClass: "bg-indigo-50 text-indigo-600",
      };

    case "attendance":
      return {
        label: "Attendance",

        icon: CalendarDays,

        iconClass: "bg-amber-50 text-amber-600",
      };

    case "communications":
      return {
        label: "Communications",

        icon: Megaphone,

        iconClass: "bg-pink-50 text-pink-600",
      };

    case "report_cards":
      return {
        label: "Report Cards",

        icon: FileText,

        iconClass: "bg-purple-50 text-purple-600",
      };

    case "settings":
      return {
        label: "Settings",

        icon: Settings2,

        iconClass: "bg-slate-100 text-slate-600",
      };

    case "notification_operations":
      return {
        label: "Notification Operations",

        icon: Building2,

        iconClass: "bg-orange-50 text-orange-600",
      };

    case "roles":
    case "permissions":
    case "users":
      return {
        label: "Access Control",

        icon: ShieldCheck,

        iconClass: "bg-rose-50 text-rose-600",
      };

    case "parents":
      return {
        label: "Parents & Guardians",

        icon: UsersRound,

        iconClass: "bg-teal-50 text-teal-600",
      };

    case "results":
      return {
        label: "Results",

        icon: FileText,

        iconClass: "bg-fuchsia-50 text-fuchsia-600",
      };

    case "exams":
      return {
        label: "Examinations",

        icon: ReceiptText,

        iconClass: "bg-yellow-50 text-yellow-700",
      };

    default:
      return {
        label: formatPermissionGroup(group),

        icon: KeyRound,

        iconClass: "bg-slate-50 text-slate-500",
      };
  }
}

function formatPermissionName(permission: string) {
  const parts = permission.split(".");

  /*
   * We don't need to repeat the domain because
   * the containing card already tells the user
   * which domain they're viewing.
   */
  const actionParts = parts.slice(1);

  return actionParts
    .join(" ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPermissionGroup(group: string) {
  return group
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function AccessFlowCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  tone,
}: {
  icon: typeof ShieldCheck;

  eyebrow: string;

  title: string;

  description: string;

  tone: "amber" | "blue" | "emerald";
}) {
  const tones = {
    amber: {
      icon: "bg-amber-50 text-amber-600",

      border: "border-amber-100",

      dot: "bg-amber-500",
    },

    blue: {
      icon: "bg-blue-50 text-blue-600",

      border: "border-blue-100",

      dot: "bg-blue-500",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600",

      border: "border-emerald-100",

      dot: "bg-emerald-500",
    },
  };

  const current = tones[tone];

  return (
    <div
      className={`relative rounded-[20px] border bg-white p-4 ${current.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${current.icon}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <span className={`mt-1 h-2 w-2 rounded-full ${current.dot}`} />
      </div>

      <p className="mt-4 text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
        {eyebrow}
      </p>

      <p className="mt-1.5 text-sm font-black text-slate-900">{title}</p>

      <p className="mt-2 text-[10px] leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function AccessFlowArrow() {
  return (
    <>
      {/* DESKTOP */}

      <div className="hidden items-center justify-center lg:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* MOBILE */}

      <div className="flex justify-center lg:hidden">
        <div className="flex h-8 w-8 rotate-90 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </>
  );
}

function ProvenanceMetric({
  label,
  value,
  description,
}: {
  label: string;

  value: string;

  description: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-2xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-slate-400">{description}</p>
    </div>
  );
}

function AuditSummaryCard({
  icon: Icon,
  eyebrow,
  value,
  label,
  description,
  tone,
  compact = false,
}: {
  icon: typeof Activity;

  eyebrow: string;

  value: string;

  label: string;

  description: string;

  tone: "blue" | "violet" | "amber" | "emerald" | "slate";

  compact?: boolean;
}) {
  const tones = {
    blue: {
      icon: "bg-blue-50 text-blue-600 ring-blue-100",

      glow: "bg-blue-500/10",

      accent: "bg-blue-500",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600 ring-violet-100",

      glow: "bg-violet-500/10",

      accent: "bg-violet-500",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600 ring-amber-100",

      glow: "bg-amber-500/10",

      accent: "bg-amber-500",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",

      glow: "bg-emerald-500/10",

      accent: "bg-emerald-500",
    },

    slate: {
      icon: "bg-slate-100 text-slate-500 ring-slate-200",

      glow: "bg-slate-500/5",

      accent: "bg-slate-400",
    },
  };

  const current = tones[tone];

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.075)]">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition duration-500 group-hover:scale-125 ${current.glow}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ring-1 ${current.icon}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <span className={`mt-1 h-1.5 w-1.5 rounded-full ${current.accent}`} />
      </div>

      <div className="relative mt-5">
        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
          {eyebrow}
        </p>

        <p
          className={`mt-2 truncate font-black tracking-[-0.035em] text-slate-950 ${
            compact ? "text-xl" : "text-3xl"
          }`}
          title={value}
        >
          {value}
        </p>

        <p className="mt-1 truncate text-xs font-black text-slate-700">
          {label}
        </p>

        <p className="mt-3 min-h-[40px] text-[10px] font-medium leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function AuditPresetLink({
  href,
  label,
  active = false,
}: {
  href: string;

  label: string;

  active?: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`inline-flex h-8 items-center rounded-lg border px-3 text-[9px] font-black uppercase tracking-[0.06em] transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
          : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label}
    </Link>
  );
}

function BreakdownRow({
  label,
  count,
  percentage,
}: {
  label: string;

  count: number;

  percentage: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-xs font-black text-slate-700">{label}</p>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-[10px] font-black text-slate-500">{count}</span>

          <span className="w-8 text-right text-[9px] font-bold text-slate-400">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width: `${Math.min(100, percentage)}%`,
          }}
        />
      </div>
    </div>
  );
}

function ActorBreakdownRow({
  actorName,
  actorRole,
  count,
}: {
  actorName: string;

  actorRole: string | null;

  count: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-slate-100 bg-slate-50/60 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
        <UserCog className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-slate-700">
          {actorName}
        </p>

        <p className="mt-0.5 text-[9px] font-bold text-slate-400">
          {actorRole ? formatLegacyRole(actorRole) : "System / Unknown"}
        </p>
      </div>

      <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-violet-50 px-2 text-[9px] font-black text-violet-700">
        {count}
      </span>
    </div>
  );
}

function EmptyBreakdown({ text }: { text: string }) {
  return (
    <div className="rounded-[14px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
      <p className="text-xs font-bold text-slate-400">{text}</p>
    </div>
  );
}

function getAuditTimelineConfig(action: string) {
  switch (action) {
    case "USER_CREATED":
      return {
        title: "User account provisioned",

        icon: UserRoundPlus,

        iconClass: "bg-emerald-100 text-emerald-700",

        badgeClass: "bg-emerald-50 text-emerald-700",
      };

    case "ROLE_ASSIGNED":
      return {
        title: "Role assigned",

        icon: ShieldPlus,

        iconClass: "bg-blue-100 text-blue-700",

        badgeClass: "bg-blue-50 text-blue-700",
      };

    case "ROLE_REMOVED":
      return {
        title: "Role removed",

        icon: ShieldCheck,

        iconClass: "bg-amber-100 text-amber-700",

        badgeClass: "bg-amber-50 text-amber-700",
      };

    case "USER_UPDATED":
      return {
        title: "Account updated",

        icon: Pencil,

        iconClass: "bg-violet-100 text-violet-700",

        badgeClass: "bg-violet-50 text-violet-700",
      };

    case "USER_DISABLED":
      return {
        title: "Account disabled",

        icon: LockKeyhole,

        iconClass: "bg-rose-100 text-rose-700",

        badgeClass: "bg-rose-50 text-rose-700",
      };

    case "USER_ENABLED":
      return {
        title: "Account reactivated",

        icon: BadgeCheck,

        iconClass: "bg-emerald-100 text-emerald-700",

        badgeClass: "bg-emerald-50 text-emerald-700",
      };

    default:
      return {
        title: formatAuditAction(action),

        icon: Activity,

        iconClass: "bg-slate-100 text-slate-600",

        badgeClass: "bg-slate-100 text-slate-600",
      };
  }
}

function getFullAuditDescription(
  activity: {
    action: string;

    actorName: string | null;

    roleId: number | null;

    metadata: unknown;
  },

  displayName: string,

  roleName: string | null,
) {
  switch (activity.action) {
    case "USER_CREATED":
      return `${displayName}'s identity was provisioned through the Access Control system.`;

    case "ROLE_ASSIGNED":
      return roleName
        ? `${roleName} was assigned to ${displayName}.`
        : `An RBAC role was assigned to ${displayName}.`;

    case "ROLE_REMOVED":
      return roleName
        ? `${roleName} was removed from ${displayName}.`
        : `An RBAC role was removed from ${displayName}.`;

    case "USER_UPDATED":
      return `${displayName}'s account information was updated.`;

    case "USER_DISABLED":
      return `${displayName}'s account access was disabled.`;

    case "USER_ENABLED":
      return `${displayName}'s account access was restored.`;

    default:
      return `An access-control event was recorded for ${displayName}.`;
  }
}

function AuditContextPill({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;

  label: string;

  value: string;
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />

      <div className="min-w-0">
        <p className="text-[7px] font-black uppercase tracking-[0.09em] text-slate-400">
          {label}
        </p>

        <p
          className="max-w-[180px] truncate text-[10px] font-black text-slate-600"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function AuditDetailItem({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-[11px] font-bold leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function formatAuditMetadata(metadata: unknown) {
  if (metadata === null || metadata === undefined) {
    return "No metadata recorded.";
  }

  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return "Metadata could not be displayed.";
  }
}

function AuditTableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      className="px-5 py-3.5 text-left text-[8px] font-black uppercase tracking-[0.11em] text-slate-400"
    >
      {children}
    </th>
  );
}

function MobileAuditValue({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
        {label}
      </p>

      <p
        title={value}
        className="mt-1 truncate text-[10px] font-black text-slate-600"
      >
        {value}
      </p>
    </div>
  );
}

function AccountHealthCard({
  icon: Icon,
  eyebrow,
  value,
  label,
  description,
  tone,
}: {
  icon: typeof History;

  eyebrow: string;

  value: string;

  label: string;

  description: string;

  tone: "emerald" | "blue" | "violet" | "amber" | "slate";
}) {
  const tones = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",

      glow: "bg-emerald-500/10",

      dot: "bg-emerald-500",
    },

    blue: {
      icon: "bg-blue-50 text-blue-600 ring-blue-100",

      glow: "bg-blue-500/10",

      dot: "bg-blue-500",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600 ring-violet-100",

      glow: "bg-violet-500/10",

      dot: "bg-violet-500",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600 ring-amber-100",

      glow: "bg-amber-500/10",

      dot: "bg-amber-500",
    },

    slate: {
      icon: "bg-slate-100 text-slate-500 ring-slate-200",

      glow: "bg-slate-500/5",

      dot: "bg-slate-400",
    },
  };

  const current = tones[tone];

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_45px_rgba(15,23,42,0.075)]">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition duration-500 group-hover:scale-125 ${current.glow}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] ring-1 ${current.icon}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <span className={`mt-1 h-1.5 w-1.5 rounded-full ${current.dot}`} />
      </div>

      <div className="relative mt-5">
        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
          {eyebrow}
        </p>

        <p className="mt-2 truncate text-2xl font-black tracking-[-0.035em] text-slate-950">
          {value}
        </p>

        <p className="mt-1 truncate text-xs font-black text-slate-700">
          {label}
        </p>

        <p className="mt-3 min-h-[40px] text-[10px] font-medium leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function AccountHealthStatus({
  icon: Icon,
  label,
  value,
  healthy,
}: {
  icon: typeof Database;

  label: string;

  value: string;

  healthy: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-slate-100 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          healthy
            ? "bg-emerald-50 text-emerald-600"
            : "bg-amber-50 text-amber-600"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>

        <p
          title={value}
          className="mt-1 truncate text-[11px] font-black text-slate-700"
        >
          {value}
        </p>
      </div>

      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          healthy ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
    </div>
  );
}

function IdentityInfoItem({
  icon: Icon,
  label,
  value,
  positive = false,
  mono = false,
}: {
  icon: typeof Fingerprint;

  label: string;

  value: string;

  positive?: boolean;

  mono?: boolean;
}) {
  return (
    <div className="min-w-0 border-b border-slate-100 p-4 last:border-b-0 sm:border-r sm:last:border-r-0 sm:[&:nth-child(even)]:border-r-0">
      <div className="flex items-center gap-2">
        <Icon
          className={`h-3.5 w-3.5 ${
            positive ? "text-emerald-500" : "text-slate-300"
          }`}
        />

        <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>
      </div>

      <p
        title={value}
        className={`mt-2 break-words text-[11px] font-black leading-5 ${
          positive ? "text-emerald-700" : "text-slate-700"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function LifecycleMetricCard({
  icon: Icon,
  eyebrow,
  value,
  label,
  description,
  tone,
}: {
  icon: typeof CalendarClock;

  eyebrow: string;

  value: string;

  label: string;

  description: string;

  tone: "blue" | "violet" | "amber" | "emerald" | "slate";
}) {
  const tones = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      glow: "bg-blue-500/10",
    },

    violet: {
      icon: "bg-violet-50 text-violet-600",
      glow: "bg-violet-500/10",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600",
      glow: "bg-amber-500/10",
    },

    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      glow: "bg-emerald-500/10",
    },

    slate: {
      icon: "bg-slate-100 text-slate-500",
      glow: "bg-slate-500/5",
    },
  };

  const current = tones[tone];

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.07)]">
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
          {eyebrow}
        </p>

        <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-950">
          {value}
        </p>

        <p className="mt-1 text-xs font-black text-slate-700">{label}</p>

        <p className="mt-3 min-h-[40px] text-[10px] leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function LifecycleStage({
  number,
  title,
  description,
  complete,
}: {
  number: string;

  title: string;

  description: string;

  complete: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        complete
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-amber-100 bg-amber-50/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-black ${
            complete ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
          }`}
        >
          {number}
        </span>

        <span
          className={`h-2 w-2 rounded-full ${
            complete ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
      </div>

      <h4 className="mt-4 text-sm font-black text-slate-900">{title}</h4>

      <p className="mt-1.5 text-[10px] leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function LifecycleArrow() {
  return (
    <>
      <div className="hidden items-center justify-center lg:flex">
        <ArrowRight className="h-4 w-4 text-slate-300" />
      </div>

      <div className="flex justify-center lg:hidden">
        <ArrowRight className="h-4 w-4 rotate-90 text-slate-300" />
      </div>
    </>
  );
}

function formatAccountAge(createdAt: Date) {
  const now = new Date();

  const milliseconds = now.getTime() - createdAt.getTime();

  const days = Math.max(0, Math.floor(milliseconds / 86_400_000));

  if (days < 1) {
    return "Today";
  }

  if (days < 30) {
    return `${days} ${days === 1 ? "day" : "days"}`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  const years = Math.floor(months / 12);

  return `${years} ${years === 1 ? "year" : "years"}`;
}

function getProvisioningOrigin(
  roles: {
    source: string;
  }[],
) {
  if (roles.some((assignment) => assignment.source === "ADMIN")) {
    return "Admin Provisioning";
  }

  if (roles.some((assignment) => assignment.source === "MIGRATION")) {
    return "Legacy Migration";
  }

  if (roles.length > 0) {
    return "Role Assignment";
  }

  return "Identity Only";
}

function getProvisioningOriginDescription(
  roles: {
    source: string;
  }[],
) {
  if (roles.some((assignment) => assignment.source === "ADMIN")) {
    return "This account has role assignments created through the administrative Access Control provisioning workflow.";
  }

  if (roles.some((assignment) => assignment.source === "MIGRATION")) {
    return "This identity was brought into the RBAC platform from the application's existing legacy Clerk-role system.";
  }

  if (roles.length > 0) {
    return "The account has RBAC role assignments, but no recognized provisioning source is currently displayed.";
  }

  return "The local identity exists without a corresponding RBAC role assignment.";
}

function SynchronizationBadge({
  healthy,
  issueCount,
}: {
  healthy: boolean;

  issueCount: number;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] ${
        healthy
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
    >
      {healthy ? (
        <CircleCheckBig className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}

      {healthy
        ? "Synchronized"
        : `${issueCount} ${issueCount === 1 ? "Issue" : "Issues"}`}
    </span>
  );
}

function SyncFlowStage({
  number,
  label,
  value,
  healthy,
}: {
  number: string;

  label: string;

  value: string;

  healthy: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        healthy
          ? "border-emerald-100 bg-emerald-50/40"
          : "border-amber-100 bg-amber-50/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-black ${
            healthy ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"
          }`}
        >
          {number}
        </span>

        {healthy ? (
          <CircleCheckBig className="h-4 w-4 text-emerald-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        )}
      </div>

      <p className="mt-4 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p
        title={value}
        className="mt-1.5 truncate text-xs font-black text-slate-800"
      >
        {value}
      </p>
    </div>
  );
}

function SynchronizationCard({
  icon: Icon,
  eyebrow,
  title,
  value,
  description,
  healthy,
  advisory = false,
}: {
  icon: typeof ShieldCheck;

  eyebrow: string;

  title: string;

  value: string;

  description: string;

  healthy: boolean;

  advisory?: boolean;
}) {
  const tone = advisory
    ? {
        icon: "bg-blue-50 text-blue-600",
        dot: "bg-blue-500",
        glow: "bg-blue-500/10",
      }
    : healthy
      ? {
          icon: "bg-emerald-50 text-emerald-600",
          dot: "bg-emerald-500",
          glow: "bg-emerald-500/10",
        }
      : {
          icon: "bg-amber-50 text-amber-600",
          dot: "bg-amber-500",
          glow: "bg-amber-500/10",
        };

  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.07)]">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${tone.glow}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[15px] ${tone.icon}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <span className={`mt-1 h-2 w-2 rounded-full ${tone.dot}`} />
      </div>

      <div className="relative mt-5">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
          {eyebrow}
        </p>

        <p
          className={`mt-2 text-xl font-black tracking-tight ${
            advisory
              ? "text-blue-700"
              : healthy
                ? "text-emerald-700"
                : "text-amber-700"
          }`}
        >
          {title}
        </p>

        <p
          title={value}
          className="mt-1 truncate text-[11px] font-black text-slate-700"
        >
          {value}
        </p>

        <p className="mt-3 min-h-[40px] text-[10px] leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </article>
  );
}

function SecurityStateItem({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: typeof ShieldCheck;

  label: string;

  value: string;

  status: "AVAILABLE" | "SECURE" | "ATTENTION";
}) {
  const config = {
    AVAILABLE: {
      icon: "text-blue-500",

      badge: "bg-blue-50 text-blue-700",

      label: "Available",
    },

    SECURE: {
      icon: "text-emerald-500",

      badge: "bg-emerald-50 text-emerald-700",

      label: "Secure",
    },

    ATTENTION: {
      icon: "text-amber-500",

      badge: "bg-amber-50 text-amber-700",

      label: "Review",
    },
  };

  const current = config[status];

  return (
    <div className="min-w-0 border-b border-slate-100 p-4 sm:border-r sm:[&:nth-child(even)]:border-r-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${current.icon}`} />

          <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-[0.07em] ${current.badge}`}
        >
          {current.label}
        </span>
      </div>

      <p
        title={value}
        className="mt-2 break-words text-[11px] font-black leading-5 text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function SecurityPostureRow({
  label,
  value,
  healthy,
}: {
  label: string;

  value: string;

  healthy: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[14px] border border-slate-100 bg-slate-50/60 px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            healthy ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />

        <p className="truncate text-[10px] font-black text-slate-600">
          {label}
        </p>
      </div>

      <p
        title={value}
        className={`max-w-[55%] truncate text-right text-[10px] font-black ${
          healthy ? "text-emerald-700" : "text-amber-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FutureSecurityCapability({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;

  title: string;

  description: string;
}) {
  return (
    <div className="group border-b border-slate-100 p-5 last:border-b-0 sm:border-r xl:border-b-0 xl:last:border-r-0">
      <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-50 text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-500">
        <Icon className="h-4 w-4" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h4 className="text-xs font-black text-slate-700">{title}</h4>

        <span className="rounded-full bg-slate-100 px-2 py-1 text-[7px] font-black uppercase tracking-[0.07em] text-slate-400">
          Not integrated yet
        </span>
      </div>

      <p className="mt-2 text-[10px] leading-5 text-slate-400">{description}</p>
    </div>
  );
}

function getAccountLifecycleEventConfig(action: AccessAuditAction) {
  switch (action) {
    case AccessAuditAction.USER_CREATED:
      return {
        title: "Account created",

        icon: UserRoundPlus,

        iconClass: "bg-emerald-100 text-emerald-700",

        badgeClass: "bg-emerald-50 text-emerald-700",
      };

    case AccessAuditAction.USER_UPDATED:
      return {
        title: "Account updated",

        icon: Pencil,

        iconClass: "bg-violet-100 text-violet-700",

        badgeClass: "bg-violet-50 text-violet-700",
      };

    case AccessAuditAction.USER_ACTIVATED:
      return {
        title: "Account activated",

        icon: Power,

        iconClass: "bg-emerald-100 text-emerald-700",

        badgeClass: "bg-emerald-50 text-emerald-700",
      };

    case AccessAuditAction.USER_SUSPENDED:
      return {
        title: "Account suspended",

        icon: PauseCircle,

        iconClass: "bg-amber-100 text-amber-700",

        badgeClass: "bg-amber-50 text-amber-700",
      };

    case AccessAuditAction.USER_DISABLED:
      return {
        title: "Account disabled",

        icon: LockKeyhole,

        iconClass: "bg-rose-100 text-rose-700",

        badgeClass: "bg-rose-50 text-rose-700",
      };

    case AccessAuditAction.ROLE_ASSIGNED:
      return {
        title: "Access role assigned",

        icon: ShieldPlus,

        iconClass: "bg-blue-100 text-blue-700",

        badgeClass: "bg-blue-50 text-blue-700",
      };

    case AccessAuditAction.ROLE_REMOVED:
      return {
        title: "Access role removed",

        icon: ShieldMinus,

        iconClass: "bg-orange-100 text-orange-700",

        badgeClass: "bg-orange-50 text-orange-700",
      };

    default:
      return {
        title: "Account activity",

        icon: History,

        iconClass: "bg-slate-100 text-slate-600",

        badgeClass: "bg-slate-100 text-slate-600",
      };
  }
}

function getAccountLifecycleEventDescription({
  action,
  displayName,
  roleName,
}: {
  action: AccessAuditAction;

  displayName: string;

  roleName: string | null;
}) {
  switch (action) {
    case AccessAuditAction.USER_CREATED:
      return `${displayName}'s school identity was created and entered the Access Control system.`;

    case AccessAuditAction.USER_UPDATED:
      return `${displayName}'s account information was updated.`;

    case AccessAuditAction.USER_ACTIVATED:
      return `${displayName}'s account was activated for normal application access.`;

    case AccessAuditAction.USER_SUSPENDED:
      return `${displayName}'s account was suspended and requires administrative review before normal access resumes.`;

    case AccessAuditAction.USER_DISABLED:
      return `${displayName}'s account was disabled.`;

    case AccessAuditAction.ROLE_ASSIGNED:
      return roleName
        ? `${roleName} was assigned to ${displayName}.`
        : `An RBAC access role was assigned to ${displayName}.`;

    case AccessAuditAction.ROLE_REMOVED:
      return roleName
        ? `${roleName} was removed from ${displayName}.`
        : `An RBAC access role was removed from ${displayName}.`;

    default:
      return `An account lifecycle event was recorded for ${displayName}.`;
  }
}

function LifecycleEventContext({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5">
      <span className="text-[7px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </span>

      <span
        title={value}
        className="max-w-[170px] truncate text-[9px] font-black text-slate-600"
      >
        {value}
      </span>
    </div>
  );
}

function LinkedIdentityStage({
  icon: Icon,
  eyebrow,
  title,
  value,
  healthy,
}: {
  icon: typeof Link2;

  eyebrow: string;

  title: string;

  value: string;

  healthy: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 ${
        healthy
          ? "border-emerald-100 bg-emerald-50/30"
          : "border-amber-100 bg-amber-50/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${
            healthy
              ? "bg-emerald-50 text-emerald-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <span
          className={`h-2 w-2 rounded-full ${
            healthy ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
      </div>

      <p className="mt-4 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
        {eyebrow}
      </p>

      <h4 className="mt-1 text-sm font-black text-slate-900">{title}</h4>

      <p
        title={value}
        className="mt-1.5 truncate text-[10px] font-bold text-slate-500"
      >
        {value}
      </p>
    </div>
  );
}

function LinkedRecordMetric({
  icon: Icon,
  label,
  value,
  description,
  tone,
}: {
  icon: typeof Link2;

  label: string;

  value: string;

  description: string;

  tone: "blue" | "violet" | "emerald" | "amber" | "cyan";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",

    violet: "bg-violet-50 text-violet-600",

    emerald: "bg-emerald-50 text-emerald-600",

    amber: "bg-amber-50 text-amber-600",

    cyan: "bg-cyan-50 text-cyan-600",
  };

  return (
    <article className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${tones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-4 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p
        title={value}
        className="mt-1.5 truncate text-sm font-black text-slate-800"
      >
        {value}
      </p>

      <p className="mt-2 text-[10px] leading-5 text-slate-400">{description}</p>
    </article>
  );
}

function StudentMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
      <p className="text-[7px] font-black uppercase tracking-[0.09em] text-slate-500">
        {label}
      </p>

      <p
        title={value}
        className="mt-1.5 truncate text-[10px] font-black text-white"
      >
        {value}
      </p>
    </div>
  );
}

function StudentProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 border-b border-slate-100 p-4 sm:border-r sm:[&:nth-child(3n)]:border-r-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-300" />

        <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>
      </div>

      <p
        title={value}
        className="mt-2 break-words text-[11px] font-black leading-5 text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function StudentClassificationCard({
  eyebrow,
  value,
  description,
  tone,
}: {
  eyebrow: string;
  value: string;
  description: string;
  tone: "blue" | "violet";
}) {
  const config = {
    blue: {
      container: "border-blue-100 bg-blue-50/50",

      label: "text-blue-600",

      value: "text-blue-900",

      dot: "bg-blue-500",
    },

    violet: {
      container: "border-violet-100 bg-violet-50/50",

      label: "text-violet-600",

      value: "text-violet-900",

      dot: "bg-violet-500",
    },
  };

  const current = config[tone];

  return (
    <div className={`rounded-[18px] border p-4 ${current.container}`}>
      <div className="flex items-start justify-between gap-3">
        <p
          className={`text-[8px] font-black uppercase tracking-[0.1em] ${current.label}`}
        >
          {eyebrow}
        </p>

        <span className={`mt-1 h-2 w-2 rounded-full ${current.dot}`} />
      </div>

      <p className={`mt-2 text-base font-black ${current.value}`}>{value}</p>

      <p className="mt-2 text-[10px] leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function StudentRelationshipValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-slate-100 bg-slate-50/60 p-3">
      <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
        {label}
      </p>

      <p
        title={value}
        className="mt-1.5 truncate text-[10px] font-black text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function LinkedNavigationCard({
  href,
  icon: Icon,
  title,
  description,
  tone,
}: {
  href: string;
  icon: typeof GraduationCap;
  title: string;
  description: string;
  tone: "violet" | "blue" | "orange" | "emerald" | "amber";
}) {
  const tones = {
    violet: "bg-violet-50 text-violet-600",

    blue: "bg-blue-50 text-blue-600",

    orange: "bg-orange-50 text-orange-600",

    emerald: "bg-emerald-50 text-emerald-600",

    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <Link
      href={href}
      className="group rounded-[18px] border border-slate-200 bg-slate-50/50 p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${tones[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-slate-600" />
      </div>

      <p className="mt-4 text-xs font-black text-slate-800">{title}</p>

      <p className="mt-1.5 text-[10px] leading-5 text-slate-400">
        {description}
      </p>
    </Link>
  );
}

function formatStudentType(value: string) {
  switch (value.trim().toLowerCase()) {
    case "new":
      return "New Student";

    case "old":
      return "Existing Student";

    default:
      return value;
  }
}

function formatBoardingType(value: string) {
  switch (value.trim().toLowerCase()) {
    case "boarder":
      return "Boarder";

    case "day":
      return "Day Student";

    default:
      return value;
  }
}

function formatStudentSex(value: string) {
  switch (value.trim().toUpperCase()) {
    case "MALE":
      return "Male";

    case "FEMALE":
      return "Female";

    default:
      return value;
  }
}

function TeacherMiniStat({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
      <p className="text-[7px] font-black uppercase tracking-[0.09em] text-slate-500">
        {label}
      </p>

      <p
        title={value}
        className="mt-1.5 truncate text-[10px] font-black text-white"
      >
        {value}
      </p>
    </div>
  );
}

function TeacherProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookUser;

  label: string;

  value: string;
}) {
  return (
    <div className="min-w-0 border-b border-slate-100 p-4 sm:border-r sm:[&:nth-child(3n)]:border-r-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-300" />

        <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>
      </div>

      <p
        title={value}
        className="mt-2 break-words text-[11px] font-black leading-5 text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function TeacherClassCard({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-blue-100 bg-blue-50/40 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
        <School className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-[0.08em] text-blue-500">
          Assigned Class
        </p>

        <p
          title={name}
          className="mt-1 truncate text-[10px] font-black text-blue-900"
        >
          {name}
        </p>
      </div>
    </div>
  );
}

function TeacherEmptyAssignment({ message }: { message: string }) {
  return (
    <div className="mt-3 rounded-[16px] border border-dashed border-slate-200 bg-slate-50/60 p-4">
      <p className="text-[10px] font-semibold leading-5 text-slate-400">
        {message}
      </p>
    </div>
  );
}

function TeacherWorkloadMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;

  value: number;

  icon: typeof School;
}) {
  return (
    <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-3 text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
        <Icon className="h-3.5 w-3.5" />
      </div>

      <p className="mt-2 text-xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function formatTeacherSex(value: string) {
  switch (value.trim().toUpperCase()) {
    case "MALE":
      return "Male";

    case "FEMALE":
      return "Female";

    default:
      return value;
  }
}

function ParentMiniStat({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/[0.06] p-3 backdrop-blur">
      <p className="text-[7px] font-black uppercase tracking-[0.09em] text-slate-500">
        {label}
      </p>

      <p
        title={value}
        className="mt-1.5 truncate text-[10px] font-black text-white"
      >
        {value}
      </p>
    </div>
  );
}

function ParentProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;

  label: string;

  value: string;
}) {
  return (
    <div className="min-w-0 border-b border-slate-100 p-4 sm:border-r sm:[&:nth-child(even)]:border-r-0">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-300" />

        <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
          {label}
        </p>
      </div>

      <p
        title={value}
        className="mt-2 break-words text-[11px] font-black leading-5 text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function ParentRelationshipMetric({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="rounded-[16px] border border-slate-100 bg-slate-50/60 p-3 text-center">
      <p className="text-xl font-black tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ParentLinkedStudentCard({
  student,
}: {
  student: {
    id: string;

    name: string;

    surname: string;

    studentID: string;

    img: string | null;

    studentType: string;

    boardingType: string;

    class: {
      id: number;

      name: string;
    } | null;

    grade: {
      id: number;

      level: string;
    } | null;
  };
}) {
  return (
    <article className="group relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_35px_rgba(15,23,42,0.07)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] border border-slate-200 bg-slate-100">
            {student.img ? (
              <Image
                src={student.img}
                alt={`${student.name} ${student.surname}`}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <GraduationCap className="h-5 w-5 text-slate-300" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-black text-slate-900">
              {student.name} {student.surname}
            </p>

            <p className="mt-1 font-mono text-[8px] font-bold text-slate-400">
              {student.studentID}
            </p>
          </div>

          <Link
            href={`/list/students/${student.id}`}
            title="Open student profile"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <ChildRecordValue
            label="Class"
            value={student.class?.name ?? "Not assigned"}
          />

          <ChildRecordValue
            label="Grade"
            value={student.grade?.level ?? "Not assigned"}
          />

          <ChildRecordValue
            label="Student Type"
            value={formatStudentType(student.studentType)}
          />

          <ChildRecordValue
            label="Residence"
            value={formatBoardingType(student.boardingType)}
          />
        </div>

        <Link
          href={`/list/students/${student.id}`}
          className="mt-4 flex items-center justify-between rounded-[12px] bg-slate-50 px-3 py-2.5 text-[9px] font-black text-slate-600 transition group-hover:bg-blue-50 group-hover:text-blue-700"
        >
          View Student Profile
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

function ChildRecordValue({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-[12px] border border-slate-100 bg-slate-50/60 p-2.5">
      <p className="text-[7px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p
        title={value}
        className="mt-1 truncate text-[9px] font-black text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function FamilyRelationshipStage({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;

  label: string;

  value: string;
}) {
  return (
    <div className="w-full max-w-[260px] rounded-[18px] border border-orange-100 bg-white/80 p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-3 text-[8px] font-black uppercase tracking-[0.09em] text-orange-500">
        {label}
      </p>

      <p
        title={value}
        className="mt-1.5 truncate text-[10px] font-black text-slate-800"
      >
        {value}
      </p>
    </div>
  );
}
