import Link from "next/link";

import {
  Activity,
  Archive,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  FilePlus2,
  History,
  LockKeyhole,
  MessageSquareWarning,
  PencilLine,
  RefreshCcw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import {
  auth,
} from "@clerk/nextjs/server";

import {
  redirect,
} from "next/navigation";

import {
  Prisma,
  ReportCardActivityType,
} from "@prisma/client";

import prisma from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

const PAGE_SIZE = 25;

type AuditPageProps = {
  searchParams: Promise<{
    page?: string;

    search?: string;

    type?: string;

    actorRole?: string;
  }>;
};

function positiveInteger(
  value?: string,
) {
  const parsed =
    Number(value);

  return Number.isInteger(
    parsed,
  ) &&
    parsed > 0
    ? parsed
    : 1;
}

function parseActivityType(
  value?: string,
) {
  if (!value) {
    return undefined;
  }

  const values =
    Object.values(
      ReportCardActivityType,
    );

  return values.includes(
    value as ReportCardActivityType,
  )
    ? (value as ReportCardActivityType)
    : undefined;
}

function formatDateTime(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    },
  ).format(value);
}

function humaniseType(
  value: string,
) {
  return value
    .replace(
      /_/g,
      " ",
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export default async function AuditPage({
  searchParams,
}: AuditPageProps) {
  const {
    userId,
    sessionClaims,
  } = await auth();

  if (!userId) {
    redirect(
      "/sign-in",
    );
  }

  const role = (
    sessionClaims
      ?.metadata as {
      role?: string;
    }
  )?.role;

  if (
    role !== "admin"
  ) {
    redirect("/");
  }

  const params =
    await searchParams;

  const page =
    positiveInteger(
      params.page,
    );

  const search =
    params.search
      ?.trim();

  const type =
    parseActivityType(
      params.type,
    );

  const actorRole =
    params.actorRole
      ?.trim();

  const where:
    Prisma.ReportCardActivityWhereInput = {
    ...(type
      ? {
          type,
        }
      : {}),

    ...(actorRole
      ? {
          actorRole,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              title: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              description: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              note: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              actorName: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              reportCard: {
                student: {
                  name: {
                    contains:
                      search,

                    mode:
                      "insensitive",
                  },
                },
              },
            },

            {
              reportCard: {
                student: {
                  surname: {
                    contains:
                      search,

                    mode:
                      "insensitive",
                  },
                },
              },
            },

            {
              reportCard: {
                student: {
                  studentID: {
                    contains:
                      search,

                    mode:
                      "insensitive",
                  },
                },
              },
            },

            {
              reportCard: {
                class: {
                  name: {
                    contains:
                      search,

                    mode:
                      "insensitive",
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [
    activities,
    total,
    activityGroups,
    systemCount,
  ] =
    await prisma.$transaction([
      prisma.reportCardActivity.findMany({
        where,

        orderBy: [
          {
            createdAt:
              "desc",
          },

          {
            id:
              "desc",
          },
        ],

        skip:
          (page - 1) *
          PAGE_SIZE,

        take:
          PAGE_SIZE,

        select: {
          id:
            true,

          type:
            true,

          actorId:
            true,

          actorRole:
            true,

          actorName:
            true,

          title:
            true,

          description:
            true,

          note:
            true,

          metadata:
            true,

          createdAt:
            true,

          reportCard: {
            select: {
              id:
                true,

              academicYear:
                true,

              version:
                true,

              student: {
                select: {
                  id:
                    true,

                  studentID:
                    true,

                  name:
                    true,

                  surname:
                    true,

                  img:
                    true,
                },
              },

              class: {
                select: {
                  id:
                    true,

                  name:
                    true,
                },
              },

              grade: {
                select: {
                  id:
                    true,

                  level:
                    true,
                },
              },

              term: {
                select: {
                  id:
                    true,

                  name:
                    true,
                },
              },
            },
          },
        },
      }),

      prisma.reportCardActivity.count({
        where,
      }),

      prisma.reportCardActivity.groupBy({
        by: [
          "type",
        ],

        _count: {
          _all:
            true,
        },
      }),

      prisma.reportCardActivity.count({
        where: {
          actorRole:
            "system",
        },
      }),
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total /
          PAGE_SIZE,
      ),
    );

  const metricMap =
    new Map(
      activityGroups.map(
        (group) => [
          group.type,
          group._count
            ._all,
        ],
      ),
    );

  const generatedCount =
    (metricMap.get(
      "GENERATED",
    ) ?? 0) +
    (metricMap.get(
      "REGENERATED",
    ) ?? 0);

  const reviewCount =
    (metricMap.get(
      "SUBMITTED_FOR_REVIEW",
    ) ?? 0) +
    (metricMap.get(
      "CHANGES_REQUESTED",
    ) ?? 0) +
    (metricMap.get(
      "APPROVED",
    ) ?? 0);

  const publicationCount =
    metricMap.get(
      "PUBLISHED",
    ) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">

        {/* BACK */}
        <Link
          href="/list/settings"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />

          Settings
        </Link>

        {/* HERO */}
        <section className="relative mt-5 overflow-hidden rounded-[34px] border border-slate-800 bg-[linear-gradient(135deg,#020617_0%,#0f172a_50%,#172554_100%)] p-6 text-white shadow-[0_32px_100px_rgba(15,23,42,0.24)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-[28%] h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" />

                Governance & Security
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                Immutable Activity History
              </p>

              <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                Report Card Audit Trail
              </h1>

              <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-slate-300 sm:text-base">
                Review report generation, academic snapshot changes,
                corrections, approvals, publication and archival activity
                across the reporting system.
              </p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/10 bg-white/10 text-blue-200 backdrop-blur-xl">
              <History className="h-8 w-8" />
            </div>
          </div>
        </section>

        {/* METRICS */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric
            label="Total Events"
            value={total}
            icon={Activity}
          />

          <Metric
            label="Generation"
            value={generatedCount}
            icon={FilePlus2}
          />

          <Metric
            label="Review Events"
            value={reviewCount}
            icon={BadgeCheck}
          />

          <Metric
            label="Published"
            value={publicationCount}
            icon={LockKeyhole}
          />

          <Metric
            label="System Events"
            value={systemCount}
            icon={RefreshCcw}
          />
        </section>

        {/* FILTERS */}
        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
          <form className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_220px_200px_auto]">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Search
              </label>

              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  name="search"
                  defaultValue={
                    search ?? ""
                  }
                  placeholder="Student, class, actor, note..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Activity Type
              </label>

              <select
                name="type"
                defaultValue={
                  type ?? ""
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="">
                  All Activity
                </option>

                {Object.values(
                  ReportCardActivityType,
                ).map(
                  (
                    activityType,
                  ) => (
                    <option
                      key={
                        activityType
                      }
                      value={
                        activityType
                      }
                    >
                      {humaniseType(
                        activityType,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                Actor
              </label>

              <select
                name="actorRole"
                defaultValue={
                  actorRole ??
                  ""
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="">
                  All Actors
                </option>

                <option value="admin">
                  Administrator
                </option>

                <option value="teacher">
                  Teacher
                </option>

                <option value="system">
                  System
                </option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Apply
              </button>

              <Link
                href="/list/settings/audit"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </Link>
            </div>
          </form>
        </section>

        {/* AUDIT LOG */}
        <section className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Activity Registry
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Reporting history
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {total} audit{" "}
                {total === 1
                  ? "event"
                  : "events"}{" "}
                match the current filters.
              </p>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500">
              Page {page} of{" "}
              {totalPages}
            </div>
          </div>

          {activities.length ===
          0 ? (
            <div className="p-10 text-center">
              <History className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 text-lg font-black text-slate-800">
                No audit activity found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try adjusting the current filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {activities.map(
                (activity) => (
                  <AuditRow
                    key={
                      activity.id
                    }
                    activity={
                      activity
                    }
                  />
                ),
              )}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 p-5">
              <AuditPageLink
                page={
                  page - 1
                }
                disabled={
                  page <= 1
                }
                params={
                  params
                }
              >
                Previous
              </AuditPageLink>

              <p className="text-xs font-bold text-slate-400">
                {page} /{" "}
                {totalPages}
              </p>

              <AuditPageLink
                page={
                  page + 1
                }
                disabled={
                  page >=
                  totalPages
                }
                params={
                  params
                }
              >
                Next
              </AuditPageLink>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}


function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;

  value:
    number | string;

  icon:
    typeof Activity;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
    </article>
  );
}

function getVisual(
  type: string,
) {
  switch (type) {
    case "GENERATED":
      return {
        icon:
          FilePlus2,
        className:
          "bg-blue-50 text-blue-600",
      };

    case "REGENERATED":
      return {
        icon:
          RefreshCcw,
        className:
          "bg-cyan-50 text-cyan-700",
      };

    case "MARKED_STALE":
      return {
        icon:
          TriangleAlert,
        className:
          "bg-amber-50 text-amber-700",
      };

    case "DETAILS_UPDATED":
      return {
        icon:
          PencilLine,
        className:
          "bg-slate-100 text-slate-700",
      };

    case "SUBMITTED_FOR_REVIEW":
      return {
        icon:
          Send,
        className:
          "bg-indigo-50 text-indigo-700",
      };

    case "CHANGES_REQUESTED":
      return {
        icon:
          MessageSquareWarning,
        className:
          "bg-orange-50 text-orange-700",
      };

    case "REOPENED":
      return {
        icon:
          RotateCcw,
        className:
          "bg-violet-50 text-violet-700",
      };

    case "APPROVED":
      return {
        icon:
          BadgeCheck,
        className:
          "bg-emerald-50 text-emerald-700",
      };

    case "PUBLISHED":
      return {
        icon:
          LockKeyhole,
        className:
          "bg-emerald-50 text-emerald-700",
      };

    case "ARCHIVED":
      return {
        icon:
          Archive,
        className:
          "bg-slate-100 text-slate-700",
      };

    default:
      return {
        icon:
          History,
        className:
          "bg-slate-100 text-slate-600",
      };
  }
}

function AuditRow({
  activity,
}: {
  activity: {
    id: number;

    type:
      ReportCardActivityType;

    actorId:
      string | null;

    actorRole:
      string | null;

    actorName:
      string | null;

    title:
      string;

    description:
      string | null;

    note:
      string | null;

    createdAt:
      Date;

    reportCard: {
      id:
        number;

      academicYear:
        string;

      version:
        number;

      student: {
        studentID:
          string;

        name:
          string;

        surname:
          string;

        img:
          string | null;
      };

      class: {
        name:
          string;
      };

      grade: {
        level:
          string;
      };

      term: {
        name:
          string;
      };
    };
  };
}) {
  const visual =
    getVisual(
      activity.type,
    );

  const Icon =
    visual.icon;

  const actor =
    activity.actorName?.trim() ||
    (activity.actorRole ===
    "system"
      ? "System"
      : activity.actorRole ===
          "admin"
        ? "Administrator"
        : activity.actorRole ===
            "teacher"
          ? "Teacher"
          : "Unknown actor");

  return (
    <article className="grid gap-4 p-5 transition hover:bg-slate-50/70 md:grid-cols-[48px_minmax(0,1fr)_220px] md:items-start sm:p-6">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${visual.className}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-black text-slate-950">
            {
              activity.title
            }
          </p>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
            {humaniseType(
              activity.type,
            )}
          </span>
        </div>

        {activity.description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            {
              activity.description
            }
          </p>
        ) : null}

        {activity.note ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
              Note
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
              {
                activity.note
              }
            </p>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5" />

            {actor}
          </span>

          <span>
            {
              activity.reportCard
                .student.name
            }{" "}
            {
              activity.reportCard
                .student.surname
            }
          </span>

          <span>
            {
              activity.reportCard
                .class.name
            }
          </span>

          <span>
            {activity.reportCard.term.name.replace(
              /_/g,
              " ",
            )}{" "}
            •{" "}
            {
              activity.reportCard
                .academicYear
            }
          </span>
        </div>
      </div>

      <div className="md:text-right">
        <p className="text-sm font-black text-slate-700">
          {formatDateTime(
            activity.createdAt,
          )}
        </p>

        <p className="mt-1 text-xs font-semibold text-slate-400">
          Report #
          {
            activity.reportCard
              .id
          }{" "}
          • v
          {
            activity.reportCard
              .version
          }
        </p>

        <Link
          href={`/list/report-cards/${activity.reportCard.id}/review`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-black text-blue-600 transition hover:text-blue-700"
        >
          Open report
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

function AuditPageLink({
  page,
  disabled,
  params,
  children,
}: {
  page:
    number;

  disabled:
    boolean;

  params: {
    search?:
      string;

    type?:
      string;

    actorRole?:
      string;
  };

  children:
    React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-10 cursor-not-allowed items-center rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-300">
        {children}
      </span>
    );
  }

  const query =
    new URLSearchParams();

  if (params.search) {
    query.set(
      "search",
      params.search,
    );
  }

  if (params.type) {
    query.set(
      "type",
      params.type,
    );
  }

  if (params.actorRole) {
    query.set(
      "actorRole",
      params.actorRole,
    );
  }

  query.set(
    "page",
    String(page),
  );

  return (
    <Link
      href={`/list/settings/audit?${query.toString()}`}
      className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {children}
    </Link>
  );
}