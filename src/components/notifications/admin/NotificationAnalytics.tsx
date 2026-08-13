import {
  Activity,
  Ban,
  BellRing,
  CheckCheck,
  CircleGauge,
  Layers3,
  Repeat2,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";

import Link from "next/link";

import type {
  NotificationAnalyticsData,
  NotificationAnalyticsRange,
} from "@/lib/notifications/analytics";

/* -------------------------------------------------------------------------- */
/*                               LABELS                                       */
/* -------------------------------------------------------------------------- */

const categoryLabels:
  Record<
    string,
    string
  > = {
    ASSESSMENT:
      "Assessments",

    REPORT_CARD:
      "Report Cards",

    ATTENDANCE:
      "Attendance",

    ACADEMIC:
      "Academic",

    FINANCE:
      "Finance",

    ANNOUNCEMENT:
      "Announcements",

    SYSTEM:
      "System",

    GENERAL:
      "General",
  };

const sourceLabels:
  Record<
    string,
    string
  > = {
    USER_ACTION:
      "User Action",

    SCHEDULED:
      "Scheduled",

    SYSTEM:
      "System",

    ADMIN_ACTION:
      "Admin Action",

    UNKNOWN:
      "Unknown",
  };

/* -------------------------------------------------------------------------- */
/*                              HELPERS                                       */
/* -------------------------------------------------------------------------- */

function formatNumber(
  value:
    number,
) {
  return new Intl.NumberFormat(
    "en-US",
  ).format(
    value,
  );
}

function formatDateTime(
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

      hour:
        "2-digit",

      minute:
        "2-digit",
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
        character,
      ) =>
        character.toUpperCase(),
    );
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

export default function NotificationAnalytics({
  data,
}: {
  data:
    NotificationAnalyticsData;
}) {
  return (
    <section className="mt-6 space-y-6">
      {/* -------------------------------------------------------------- */}
      {/* HEADER                                                         */}
      {/* -------------------------------------------------------------- */}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-5 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              <CircleGauge className="h-4 w-4" />

              Delivery Intelligence
            </div>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Notification Analytics
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Understand notification volume, recipient reach, suppression,
              deduplication and the sources generating school communications.
            </p>
          </div>

          <AnalyticsRangeSelector
            active={
              data.range
            }
          />
        </div>

        {/* SUMMARY */}

        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:p-6">
          <AnalyticsMetric
            icon={
              Activity
            }
            label="Dispatches"
            value={
              formatNumber(
                data.summary
                  .dispatchAttempts,
              )
            }
            helper={
              data.rangeLabel
            }
          />

          <AnalyticsMetric
            icon={
              UsersRound
            }
            label="Recipients"
            value={
              formatNumber(
                data.summary
                  .intendedRecipients,
              )
            }
            helper="Intended audience"
          />

          <AnalyticsMetric
            icon={
              CheckCheck
            }
            label="Delivered"
            value={
              formatNumber(
                data.summary
                  .deliveredRecipients,
              )
            }
            helper="New in-app deliveries"
          />

          <AnalyticsMetric
            icon={
              Ban
            }
            label="Suppressed"
            value={
              formatNumber(
                data.summary
                  .suppressedRecipients,
              )
            }
            helper={`${formatNumber(
              data.summary
                .suppressedByPreference,
            )} by preference`}
          />

          <AnalyticsMetric
            icon={
              Repeat2
            }
            label="Duplicates Avoided"
            value={
              formatNumber(
                data.summary
                  .duplicateDeliveriesPrevented,
              )
            }
            helper={`${data.summary.reusedEvents} reused events`}
          />

          <AnalyticsMetric
            icon={
              CircleGauge
            }
            label="Delivery Rate"
            value={`${data.summary.deliveryRate}%`}
            helper="Delivered / intended"
          />
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* CATEGORY + SOURCE                                              */}
      {/* -------------------------------------------------------------- */}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <CategoryVolume
          categories={
            data.categories
          }
        />

        <SourceBreakdown
          sources={
            data.sources
          }
        />
      </div>

      {/* -------------------------------------------------------------- */}
      {/* POLICY INTELLIGENCE                                           */}
      {/* -------------------------------------------------------------- */}

      <div className="grid gap-6 lg:grid-cols-2">
        <MandatoryBreakdown
          mandatory={
            data.mandatoryActivity
              .mandatory
          }
          optional={
            data.mandatoryActivity
              .optional
          }
        />

        <SuppressionIntelligence
          preference={
            data.summary
              .suppressedByPreference
          }
          systemPolicy={
            data.summary
              .suppressedBySystemPolicy
          }
          eligible={
            data.summary
              .eligibleRecipients
          }
          delivered={
            data.summary
              .deliveredRecipients
          }
        />
      </div>

      {/* -------------------------------------------------------------- */}
      {/* AUDIT TABLE                                                    */}
      {/* -------------------------------------------------------------- */}

      <DispatchAuditTable
        audits={
          data.recentAudits
        }
        auditAvailableFrom={
          data.auditAvailableFrom
        }
      />
    </section>
  );
}



function AnalyticsRangeSelector({
  active,
}: {
  active:
    NotificationAnalyticsRange;
}) {
  const ranges: {
    key:
      NotificationAnalyticsRange;

    label:
      string;
  }[] = [
    {
      key:
        "today",

      label:
        "Today",
    },

    {
      key:
        "7d",

      label:
        "7 Days",
    },

    {
      key:
        "30d",

      label:
        "30 Days",
    },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
      {ranges.map(
        (
          range,
        ) => (
          <Link
            key={
              range.key
            }
            href={`/list/notification-operations?analyticsRange=${range.key}`}
            className={`rounded-xl px-3 py-2 text-xs font-black transition ${
              active ===
              range.key
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:bg-white hover:text-slate-950"
            }`}
          >
            {range.label}
          </Link>
        ),
      )}
    </div>
  );
}



function AnalyticsMetric({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon:
    typeof Activity;

  label:
    string;

  value:
    string;

  helper:
    string;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {helper}
      </p>
    </article>
  );
}




function CategoryVolume({
  categories,
}: {
  categories:
    NotificationAnalyticsData["categories"];
}) {
  const maxDelivered =
    Math.max(
      1,

      ...categories.map(
        (
          category,
        ) =>
          category.delivered,
      ),
    );

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Category Volume
        </p>

        <h3 className="mt-2 text-xl font-black text-slate-950">
          Delivery by notification category
        </h3>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {categories.length ===
        0 ? (
          <AnalyticsEmptyState />
        ) : (
          categories.map(
            (
              category,
            ) => {
              const width =
                Math.max(
                  2,

                  Math.round(
                    (category.delivered /
                      maxDelivered) *
                      100,
                  ),
                );

              return (
                <div
                  key={
                    category.category
                  }
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {categoryLabels[
                          category.category
                        ] ??
                          category.category}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {
                          category.dispatches
                        }{" "}
                        dispatches ·{" "}
                        {
                          category.deliveryRate
                        }
                        % reach
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-slate-950">
                        {
                          category.delivered
                        }
                      </p>

                      {category.suppressed >
                      0 ? (
                        <p className="text-[10px] font-bold text-amber-600">
                          {
                            category.suppressed
                          }{" "}
                          suppressed
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width:
                          `${width}%`,
                      }}
                    />
                  </div>
                </div>
              );
            },
          )
        )}
      </div>
    </section>
  );
}







function SourceBreakdown({
  sources,
}: {
  sources:
    NotificationAnalyticsData["sources"];
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-600">
          Origin
        </p>

        <h3 className="mt-2 text-xl font-black text-slate-950">
          Where notifications originate
        </h3>
      </div>

      <div className="p-5 sm:p-6">
        {sources.length ===
        0 ? (
          <AnalyticsEmptyState />
        ) : (
          <div className="space-y-3">
            {sources.map(
              (
                source,
              ) => (
                <article
                  key={
                    source.source
                  }
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">
                        {sourceLabels[
                          source.source
                        ] ??
                          source.source}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          source.dispatches
                        }{" "}
                        dispatches
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-slate-950">
                        {
                          source.delivered
                        }
                      </p>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        delivered
                      </p>
                    </div>
                  </div>

                  {source.suppressed >
                  0 ? (
                    <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                      {
                        source.suppressed
                      }{" "}
                      recipient deliveries suppressed
                    </div>
                  ) : null}
                </article>
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}





function MandatoryBreakdown({
  mandatory,
  optional,
}: {
  mandatory:
    number;

  optional:
    number;
}) {
  const total =
    mandatory +
    optional;

  const mandatoryPercentage =
    total >
    0
      ? Math.round(
          (mandatory /
            total) *
            100,
        )
      : 0;

  const optionalPercentage =
    total >
    0
      ? 100 -
        mandatoryPercentage
      : 0;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
        <ShieldCheck className="h-4 w-4" />

        Policy Classification
      </div>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Mandatory vs optional activity
      </h3>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <p className="text-2xl font-black text-emerald-800">
            {formatNumber(
              mandatory,
            )}
          </p>

          <p className="mt-1 text-xs font-bold text-emerald-700">
            Mandatory
          </p>

          <p className="mt-2 text-[10px] uppercase tracking-wider text-emerald-600">
            {
              mandatoryPercentage
            }
            % of dispatches
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-2xl font-black text-blue-800">
            {formatNumber(
              optional,
            )}
          </p>

          <p className="mt-1 text-xs font-bold text-blue-700">
            Optional
          </p>

          <p className="mt-2 text-[10px] uppercase tracking-wider text-blue-600">
            {
              optionalPercentage
            }
            % of dispatches
          </p>
        </div>
      </div>
    </section>
  );
}




function SuppressionIntelligence({
  preference,
  systemPolicy,
  eligible,
  delivered,
}: {
  preference:
    number;

  systemPolicy:
    number;

  eligible:
    number;

  delivered:
    number;
}) {
  const duplicateAvoided =
    Math.max(
      0,

      eligible -
        delivered,
    );

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-amber-600">
        <SlidersHorizontal className="h-4 w-4" />

        Delivery Decisions
      </div>

      <h3 className="mt-2 text-xl font-black text-slate-950">
        Why deliveries were not created
      </h3>

      <div className="mt-6 space-y-3">
        <DecisionRow
          label="User preferences"
          value={
            preference
          }
          description="Optional categories disabled by recipients."
        />

        <DecisionRow
          label="System policy"
          value={
            systemPolicy
          }
          description="Suppressed by global school delivery policy."
        />

        <DecisionRow
          label="Duplicates prevented"
          value={
            duplicateAvoided
          }
          description="Eligible recipients already had this logical event."
        />
      </div>
    </section>
  );
}

function DecisionRow({
  label,
  value,
  description,
}: {
  label:
    string;

  value:
    number;

  description:
    string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4">
      <div>
        <p className="text-sm font-black text-slate-800">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <span className="shrink-0 text-xl font-black text-slate-950">
        {formatNumber(
          value,
        )}
      </span>
    </div>
  );
}





function DispatchAuditTable({
  audits,
  auditAvailableFrom,
}: {
  audits:
    NotificationAnalyticsData["recentAudits"];

  auditAvailableFrom:
    Date | null;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Dispatch Audit
          </p>

          <h3 className="mt-2 text-xl font-black text-slate-950">
            Recent delivery decisions
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Detailed evidence of intended, delivered, suppressed and
            deduplicated notification activity.
          </p>
        </div>

        {auditAvailableFrom ? (
          <p className="text-[11px] font-bold text-slate-400">
            Audit data available since{" "}
            {formatDateTime(
              auditAvailableFrom,
            )}
          </p>
        ) : null}
      </div>

      {audits.length ===
      0 ? (
        <div className="p-8">
          <AnalyticsEmptyState />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              <tr>
                <th className="px-5 py-3">
                  Notification
                </th>

                <th className="px-5 py-3">
                  Source
                </th>

                <th className="px-5 py-3">
                  Intended
                </th>

                <th className="px-5 py-3">
                  Eligible
                </th>

                <th className="px-5 py-3">
                  Delivered
                </th>

                <th className="px-5 py-3">
                  Suppressed
                </th>

                <th className="px-5 py-3">
                  Policy
                </th>

                <th className="px-5 py-3">
                  Time
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {audits.map(
                (
                  audit,
                ) => (
                  <tr
                    key={
                      audit.id
                    }
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <p className="font-black text-slate-900">
                        {readableEnum(
                          audit.type,
                        )}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700">
                          {categoryLabels[
                            audit.category
                          ] ??
                            audit.category}
                        </span>

                        {audit.reusedExistingEvent ? (
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-violet-700">
                            Reused Event
                          </span>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-700">
                        {sourceLabels[
                          audit.source
                        ] ??
                          audit.source}
                      </p>

                      {audit.sourceKey ? (
                        <p className="mt-1 text-[10px] text-slate-400">
                          {
                            audit.sourceKey
                          }
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-4 font-black text-slate-700">
                      {
                        audit.intendedRecipientCount
                      }
                    </td>

                    <td className="px-5 py-4 font-black text-slate-700">
                      {
                        audit.eligibleRecipientCount
                      }
                    </td>

                    <td className="px-5 py-4 font-black text-emerald-600">
                      {
                        audit.deliveredRecipientCount
                      }
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          audit.suppressedRecipientCount >
                          0
                            ? "font-black text-amber-600"
                            : "font-bold text-slate-400"
                        }
                      >
                        {
                          audit.suppressedRecipientCount
                        }
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                          audit.mandatory
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {audit.mandatory
                          ? "Mandatory"
                          : "Optional"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-bold text-slate-400">
                      {formatDateTime(
                        audit.createdAt,
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}




function AnalyticsEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <Layers3 className="mx-auto h-6 w-6 text-slate-300" />

      <p className="mt-3 text-sm font-black text-slate-500">
        No notification audit activity for this period.
      </p>
    </div>
  );
}