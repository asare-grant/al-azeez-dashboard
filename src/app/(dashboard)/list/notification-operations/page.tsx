import {
  Activity,
  AlarmClockCheck,
  BellRing,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Gauge,
  Inbox,
  ServerCog,
  ShieldCheck,
  TimerReset,
  TriangleAlert,
} from "lucide-react";

import {
  getNotificationOperationsData,
  type NotificationOperationsHealth,
} from "@/lib/notifications/admin-dashboard";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* -------------------------------------------------------------------------- */
/*                               HELPERS                                      */
/* -------------------------------------------------------------------------- */

function formatDuration(
  durationMs:
    number | null,
) {
  if (
    durationMs ===
    null
  ) {
    return "—";
  }

  if (
    durationMs <
    1000
  ) {
    return `${durationMs} ms`;
  }

  return `${(
    durationMs /
    1000
  ).toFixed(
    2,
  )} s`;
}

function formatDateTime(
  value:
    Date | null,
) {
  if (
    !value
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    },
  ).format(
    value,
  );
}

function scannerLabel(
  scannerKey:
    string,
) {
  const labels:
    Record<
      string,
      string
    > = {
      "assessment-due-soon":
        "Assessment Due Soon",

      "attendance-absence":
        "Attendance Absence",

      "attendance-completeness":
        "Attendance Completeness",

      "fee-balance-reminders":
        "Fee Balance Reminders",

      "upcoming-events":
        "Upcoming Academic Events",
    };

  return (
    labels[
      scannerKey
    ] ??
    scannerKey
  );
}

function healthConfig(
  health:
    NotificationOperationsHealth,
) {
  if (
    health ===
    "HEALTHY"
  ) {
    return {
      label:
        "All Systems Healthy",

      description:
        "The latest scheduled notification cycle completed successfully.",

      icon:
        ShieldCheck,

      className:
        "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (
    health ===
    "WARNING"
  ) {
    return {
      label:
        "Attention Required",

      description:
        "One or more notification scanners reported a partial failure.",

      icon:
        TriangleAlert,

      className:
        "border-amber-400/20 bg-amber-400/10 text-amber-200",
    };
  }

  if (
    health ===
    "CRITICAL"
  ) {
    return {
      label:
        "Scheduler Problem",

      description:
        "The most recent notification cycle failed and should be reviewed.",

      icon:
        CircleAlert,

      className:
        "border-red-400/20 bg-red-400/10 text-red-200",
    };
  }

  return {
    label:
      "Awaiting Scheduler Data",

    description:
      "No completed scheduler run is available yet.",

    icon:
      Clock3,

    className:
      "border-slate-400/20 bg-white/10 text-slate-200",
  };
}

/* -------------------------------------------------------------------------- */
/*                                  PAGE                                      */
/* -------------------------------------------------------------------------- */

export default async function NotificationOperationsPage() {
  const data =
    await getNotificationOperationsData();

  const health =
    healthConfig(
      data.health,
    );

  const HealthIcon =
    health.icon;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        {/* -------------------------------------------------------------- */}
        {/* HERO                                                           */}
        {/* -------------------------------------------------------------- */}

        <section className="relative overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
                <ServerCog className="h-3.5 w-3.5" />

                Notification Operations
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Scheduler & Delivery Health
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Monitor proactive school communications, scheduled scanners,
                delivery activity and notification-system health from one
                administrative workspace.
              </p>

              <div
                className={`mt-6 inline-flex items-start gap-3 rounded-2xl border px-4 py-3 ${health.className}`}
              >
                <HealthIcon className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-black">
                    {health.label}
                  </p>

                  <p className="mt-1 text-xs opacity-80">
                    {health.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
              <HeroMetric
                icon={
                  BellRing
                }
                label="Events Today"
                value={
                  data.today.eventsCreated
                }
              />

              <HeroMetric
                icon={
                  Inbox
                }
                label="Deliveries Today"
                value={
                  data.today.deliveriesCreated
                }
              />

              <HeroMetric
                icon={
                  Activity
                }
                label="Runs / 24h"
                value={
                  data.last24Hours.runs
                }
              />

              <HeroMetric
                icon={
                  Gauge
                }
                label="Healthy Runs"
                value={
                  data.last24Hours.successfulRuns
                }
              />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* SUMMARY CARDS                                                  */}
        {/* -------------------------------------------------------------- */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={
              AlarmClockCheck
            }
            label="Last Scheduler Run"
            value={
              data.latestRun
                ? formatDateTime(
                    data.latestRun.completedAt ??
                      data.latestRun.startedAt,
                  )
                : "No runs yet"
            }
            helper={
              data.latestRun
                ? `Run #${data.latestRun.id}`
                : "Awaiting first execution"
            }
          />

          <SummaryCard
            icon={
              TimerReset
            }
            label="Average Runtime"
            value={
              formatDuration(
                data.last24Hours.averageDurationMs,
              )
            }
            helper="Last 24 hours"
          />

          <SummaryCard
            icon={
              Inbox
            }
            label="Unread Today"
            value={
              String(
                data.today.unread,
              )
            }
            helper={`${data.today.unseen} currently unseen`}
          />

          <SummaryCard
            icon={
              TriangleAlert
            }
            label="Failed Runs"
            value={
              String(
                data.last24Hours.failedRuns,
              )
            }
            helper={`${data.last24Hours.partialRuns} partial in last 24h`}
          />
        </section>

        {/* -------------------------------------------------------------- */}
        {/* CURRENT SCANNER HEALTH                                         */}
        {/* -------------------------------------------------------------- */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Live Scanner Status
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Latest Scheduler Cycle
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Individual health and execution results for each proactive
                notification scanner.
              </p>
            </div>

            {data.latestRun ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Runtime
                </p>

                <p className="mt-1 text-lg font-black text-slate-950">
                  {formatDuration(
                    data.latestRun.durationMs,
                  )}
                </p>
              </div>
            ) : null}
          </div>

          {!data.latestRun ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No scheduler execution has been recorded yet.
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5 sm:p-6">
              {data.latestRun.scanners.map(
                (
                  scanner,
                ) => (
                  <ScannerCard
                    key={
                      scanner.id
                    }
                    scanner={
                      scanner
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>

        {/* -------------------------------------------------------------- */}
        {/* LOWER GRID                                                     */}
        {/* -------------------------------------------------------------- */}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <RecentRuns
            runs={
              data.recentRuns
            }
          />

          <RecentFailures
            failures={
              data.recentFailures
            }
          />
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                            PRESENTATION                                    */
/* -------------------------------------------------------------------------- */

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof BellRing;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="min-w-0 rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon:
    typeof BellRing;

  label:
    string;

  value:
    string;

  helper:
    string;
}) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {helper}
      </p>
    </article>
  );
}

function ScannerCard({
  scanner,
}: {
  scanner: {
    scannerKey:
      string;

    status:
      string;

    durationMs:
      number | null;

    errorMessage:
      string | null;

    result:
      unknown;
  };
}) {
  const healthy =
    scanner.status ===
    "SUCCEEDED";

  const result =
    scanner.result &&
    typeof scanner.result ===
      "object" &&
    !Array.isArray(
      scanner.result,
    )
      ? (
          scanner.result as Record<
            string,
            unknown
          >
        )
      : null;

  const skipped =
    result?.skipped ===
    true;

  const reason =
    typeof result?.reason ===
    "string"
      ? result.reason
      : null;

  return (
    <article className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            healthy
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {healthy ? (
            <CheckCircle2 className="h-4.5 w-4.5" />
          ) : (
            <CircleAlert className="h-4.5 w-4.5" />
          )}
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
            skipped
              ? "bg-amber-50 text-amber-700"
              : healthy
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {skipped
            ? "Skipped"
            : scanner.status}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-black leading-5 text-slate-950">
        {scannerLabel(
          scanner.scannerKey,
        )}
      </h3>

      <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-slate-400">
        <Clock3 className="h-3.5 w-3.5" />

        {formatDuration(
          scanner.durationMs,
        )}
      </div>

      {reason ? (
        <p className="mt-3 break-words text-[11px] leading-5 text-amber-700">
          {reason
            .toLowerCase()
            .replace(
              /_/g,
              " ",
            )}
        </p>
      ) : null}

      {scanner.errorMessage ? (
        <p className="mt-3 line-clamp-3 text-[11px] leading-5 text-red-600">
          {scanner.errorMessage}
        </p>
      ) : null}
    </article>
  );
}

function RecentRuns({
  runs,
}: {
  runs: {
    id:
      number;

    trigger:
      string;

    status:
      string;

    scannerCount:
      number;

    succeededCount:
      number;

    failedCount:
      number;

    startedAt:
      Date;

    completedAt:
      Date | null;

    durationMs:
      number | null;
  }[];
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Execution History
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Recent Scheduler Runs
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
            <tr>
              <th className="px-5 py-3">
                Run
              </th>

              <th className="px-5 py-3">
                Started
              </th>

              <th className="px-5 py-3">
                Status
              </th>

              <th className="px-5 py-3">
                Scanners
              </th>

              <th className="px-5 py-3">
                Runtime
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {runs.map(
              (
                run,
              ) => (
                <tr
                  key={
                    run.id
                  }
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-black text-slate-950">
                    #{run.id}
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {formatDateTime(
                      run.startedAt,
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <RunStatusBadge
                      status={
                        run.status
                      }
                    />
                  </td>

                  <td className="px-5 py-4">
                    <span className="font-black text-emerald-600">
                      {
                        run.succeededCount
                      }
                    </span>

                    <span className="text-slate-400">
                      {" "}
                      /{" "}
                      {
                        run.scannerCount
                      }
                    </span>

                    {run.failedCount >
                    0 ? (
                      <span className="ml-2 font-bold text-red-600">
                        {
                          run.failedCount
                        }{" "}
                        failed
                      </span>
                    ) : null}
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-500">
                    {formatDuration(
                      run.durationMs,
                    )}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecentFailures({
  failures,
}: {
  failures: {
    id:
      number;

    runId:
      number;

    scannerKey:
      string;

    errorMessage:
      string | null;

    startedAt:
      Date;
  }[];
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
          Operational Alerts
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Recent Failures
        </h2>
      </div>

      <div className="p-5 sm:p-6">
        {failures.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-7 text-center">
            <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" />

            <p className="mt-3 text-sm font-black text-emerald-800">
              No recent scanner failures
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-700/70">
              Scheduled notification processing is operating normally.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {failures.map(
              (
                failure,
              ) => (
                <article
                  key={
                    failure.id
                  }
                  className="rounded-2xl border border-red-100 bg-red-50/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                    <div className="min-w-0">
                      <p className="font-black text-slate-950">
                        {scannerLabel(
                          failure.scannerKey,
                        )}
                      </p>

                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Run #
                        {
                          failure.runId
                        }{" "}
                        ·{" "}
                        {formatDateTime(
                          failure.startedAt,
                        )}
                      </p>

                      <p className="mt-3 break-words text-xs leading-5 text-red-700">
                        {failure.errorMessage ??
                          "No error message was recorded."}
                      </p>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function RunStatusBadge({
  status,
}: {
  status:
    string;
}) {
  const className =
    status ===
    "SUCCEEDED"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
          "PARTIAL"
        ? "bg-amber-50 text-amber-700"
        : status ===
            "FAILED"
          ? "bg-red-50 text-red-700"
          : "bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${className}`}
    >
      {status}
    </span>
  );
}