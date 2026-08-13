import "server-only";

import { auth } from "@clerk/nextjs/server";

import type {
  NotificationCategory,
  NotificationDispatchSource,
  NotificationPriority,
  NotificationType,
} from "@prisma/client";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */

export type NotificationAnalyticsRange = "today" | "7d" | "30d";

export type NotificationAnalyticsData = {
  range: NotificationAnalyticsRange;

  rangeLabel: string;

  startedAt: Date;

  endedAt: Date;

  auditAvailableFrom: Date | null;

  summary: {
    dispatchAttempts: number;

    intendedRecipients: number;

    eligibleRecipients: number;

    deliveredRecipients: number;

    suppressedRecipients: number;

    suppressedByPreference: number;

    suppressedBySystemPolicy: number;

    duplicateDeliveriesPrevented: number;

    deliveryRate: number;

    eligibleDeliveryRate: number;

    mandatoryDispatches: number;

    optionalDispatches: number;

    reusedEvents: number;
  };

  categories: {
    category: NotificationCategory;

    dispatches: number;

    intended: number;

    delivered: number;

    suppressed: number;

    deliveryRate: number;
  }[];

  sources: {
    source: NotificationDispatchSource;

    dispatches: number;

    delivered: number;

    suppressed: number;
  }[];

  mandatoryActivity: {
    mandatory: number;

    optional: number;
  };

  recentAudits: {
    id: number;

    eventId: number | null;

    type: NotificationType;

    category: NotificationCategory;

    priority: NotificationPriority;

    source: NotificationDispatchSource;

    sourceKey: string | null;

    mandatory: boolean;

    intendedRecipientCount: number;

    eligibleRecipientCount: number;

    deliveredRecipientCount: number;

    suppressedRecipientCount: number;

    suppressedByPreferenceCount: number;

    suppressedBySystemPolicyCount: number;

    reusedExistingEvent: boolean;

    actorRole: string | null;

    actorName: string | null;

    entityType: string | null;

    entityId: string | null;

    createdAt: Date;
  }[];
};

/* -------------------------------------------------------------------------- */
/*                              RANGE HELPERS                                 */
/* -------------------------------------------------------------------------- */

function startOfUtcToday() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),

      now.getUTCMonth(),

      now.getUTCDate(),

      0,
      0,
      0,
      0,
    ),
  );
}

function resolveAnalyticsRange(range: NotificationAnalyticsRange) {
  const endedAt = new Date();

  if (range === "today") {
    return {
      startedAt: startOfUtcToday(),

      endedAt,

      label: "Today",
    };
  }

  const days = range === "7d" ? 7 : 30;

  const startedAt = new Date(endedAt.getTime() - days * 24 * 60 * 60 * 1000);

  return {
    startedAt,

    endedAt,

    label: range === "7d" ? "Last 7 Days" : "Last 30 Days",
  };
}

/* -------------------------------------------------------------------------- */
/*                              SAFE PERCENTAGE                               */
/* -------------------------------------------------------------------------- */

function percentage(
  numerator: number,

  denominator: number,
) {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

/* -------------------------------------------------------------------------- */
/*                              ADMIN GUARD                                   */
/* -------------------------------------------------------------------------- */

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  if (!userId || role !== "admin") {
    throw new Error("Unauthorized");
  }

  return {
    userId,
  };
}

/* -------------------------------------------------------------------------- */
/*                         NOTIFICATION ANALYTICS                             */
/* -------------------------------------------------------------------------- */

export async function getNotificationAnalytics({
  range = "7d",
}: {
  range?: NotificationAnalyticsRange;
} = {}): Promise<NotificationAnalyticsData> {
  await requireAdmin();

  const safeRange: NotificationAnalyticsRange =
    range === "today" || range === "7d" || range === "30d" ? range : "7d";

  const { startedAt, endedAt, label } = resolveAnalyticsRange(safeRange);

  /* ---------------------------------------------------------------------- */
  /*                         PARALLEL AGGREGATES                            */
  /* ---------------------------------------------------------------------- */

 const [
  overall,
  categoryGroups,
  sourceGroups,
  mandatoryGroups,
  reusedEvents,
  firstAudit,
  recentAudits,
] =
  await Promise.all([
    /* -------------------------------------------------------------- */
    /*                        OVERALL TOTALS                          */
    /* -------------------------------------------------------------- */

    prisma.notificationDispatchAudit.aggregate({
      where: {
        createdAt: {
          gte:
            startedAt,

          lte:
            endedAt,
        },
      },

      _count: {
        _all:
          true,
      },

      _sum: {
        intendedRecipientCount:
          true,

        eligibleRecipientCount:
          true,

        deliveredRecipientCount:
          true,

        suppressedRecipientCount:
          true,

        suppressedByPreferenceCount:
          true,

        suppressedBySystemPolicyCount:
          true,
      },
    }),

    /* -------------------------------------------------------------- */
    /*                       CATEGORY GROUPS                          */
    /* -------------------------------------------------------------- */

    prisma.notificationDispatchAudit.groupBy({
      by: [
        "category",
      ],

      where: {
        createdAt: {
          gte:
            startedAt,

          lte:
            endedAt,
        },
      },

      _count: {
        _all:
          true,
      },

      _sum: {
        intendedRecipientCount:
          true,

        deliveredRecipientCount:
          true,

        suppressedRecipientCount:
          true,
      },

      orderBy: {
        _sum: {
          deliveredRecipientCount:
            "desc",
        },
      },
    }),

    /* -------------------------------------------------------------- */
    /*                         SOURCE GROUPS                          */
    /* -------------------------------------------------------------- */

    prisma.notificationDispatchAudit.groupBy({
      by: [
        "source",
      ],

      where: {
        createdAt: {
          gte:
            startedAt,

          lte:
            endedAt,
        },
      },

      _count: {
        _all:
          true,
      },

      _sum: {
        deliveredRecipientCount:
          true,

        suppressedRecipientCount:
          true,
      },
    }),

    /* -------------------------------------------------------------- */
    /*                    MANDATORY / OPTIONAL                        */
    /* -------------------------------------------------------------- */

    prisma.notificationDispatchAudit.groupBy({
      by: [
        "mandatory",
      ],

      where: {
        createdAt: {
          gte:
            startedAt,

          lte:
            endedAt,
        },
      },

      _count: {
        _all:
          true,
      },
    }),

    /* -------------------------------------------------------------- */
    /*                      REUSED EVENTS                             */
    /* -------------------------------------------------------------- */

    prisma.notificationDispatchAudit.count({
      where: {
        createdAt: {
          gte:
            startedAt,

          lte:
            endedAt,
        },

        reusedExistingEvent:
          true,
      },
    }),

    /* -------------------------------------------------------------- */
    /*                    AUDIT COVERAGE START                        */
    /* -------------------------------------------------------------- */

    prisma.notificationDispatchAudit.findFirst({
      orderBy: {
        createdAt:
          "asc",
      },

      select: {
        createdAt:
          true,
      },
    }),

    /* -------------------------------------------------------------- */
    /*                       RECENT AUDITS                            */
    /* -------------------------------------------------------------- */

    prisma.notificationDispatchAudit.findMany({
      where: {
        createdAt: {
          gte:
            startedAt,

          lte:
            endedAt,
        },
      },

      orderBy: {
        createdAt:
          "desc",
      },

      take:
        25,

      select: {
        id:
          true,

        eventId:
          true,

        type:
          true,

        category:
          true,

        priority:
          true,

        source:
          true,

        sourceKey:
          true,

        mandatory:
          true,

        intendedRecipientCount:
          true,

        eligibleRecipientCount:
          true,

        deliveredRecipientCount:
          true,

        suppressedRecipientCount:
          true,

        suppressedByPreferenceCount:
          true,

        suppressedBySystemPolicyCount:
          true,

        reusedExistingEvent:
          true,

        actorRole:
          true,

        actorName:
          true,

        entityType:
          true,

        entityId:
          true,

        createdAt:
          true,
      },
    }),
  ]);

  /* ---------------------------------------------------------------------- */
  /*                           SUMMARY                                      */
  /* ---------------------------------------------------------------------- */

  const intendedRecipients = overall._sum.intendedRecipientCount ?? 0;

  const eligibleRecipients = overall._sum.eligibleRecipientCount ?? 0;

  const deliveredRecipients = overall._sum.deliveredRecipientCount ?? 0;

  const suppressedRecipients = overall._sum.suppressedRecipientCount ?? 0;

  const suppressedByPreference = overall._sum.suppressedByPreferenceCount ?? 0;

  const suppressedBySystemPolicy =
    overall._sum.suppressedBySystemPolicyCount ?? 0;

  /*
   * Eligible recipients who were not newly
   * delivered are primarily retries/dedupe
   * prevention in our current architecture.
   */
  const duplicateDeliveriesPrevented = Math.max(
    0,

    eligibleRecipients - deliveredRecipients,
  );

  const mandatoryDispatches =
    mandatoryGroups.find((group) => group.mandatory === true)?._count._all ?? 0;

  const optionalDispatches =
    mandatoryGroups.find((group) => group.mandatory === false)?._count._all ??
    0;

  /* ---------------------------------------------------------------------- */
  /*                          CATEGORY DATA                                 */
  /* ---------------------------------------------------------------------- */

  const categories = categoryGroups.map((group) => {
    const intended = group._sum.intendedRecipientCount ?? 0;

    const delivered = group._sum.deliveredRecipientCount ?? 0;

    const suppressed = group._sum.suppressedRecipientCount ?? 0;

    return {
      category: group.category,

      dispatches: group._count._all,

      intended,

      delivered,

      suppressed,

      deliveryRate: percentage(
        delivered,

        intended,
      ),
    };
  });

  /* ---------------------------------------------------------------------- */
  /*                           SOURCE DATA                                   */
  /* ---------------------------------------------------------------------- */

  const sources = sourceGroups
    .map((group) => ({
      source: group.source,

      dispatches: group._count._all,

      delivered: group._sum.deliveredRecipientCount ?? 0,

      suppressed: group._sum.suppressedRecipientCount ?? 0,
    }))
    .sort((a, b) => b.delivered - a.delivered);

  return {
    range: safeRange,

    rangeLabel: label,

    startedAt,

    endedAt,

    auditAvailableFrom: firstAudit?.createdAt ?? null,

    summary: {
      dispatchAttempts: overall._count._all,

      intendedRecipients,

      eligibleRecipients,

      deliveredRecipients,

      suppressedRecipients,

      suppressedByPreference,

      suppressedBySystemPolicy,

      duplicateDeliveriesPrevented,

      deliveryRate: percentage(
        deliveredRecipients,

        intendedRecipients,
      ),

      eligibleDeliveryRate: percentage(
        deliveredRecipients,

        eligibleRecipients,
      ),

      mandatoryDispatches,

      optionalDispatches,

      reusedEvents,
    },

    categories,

    sources,

    mandatoryActivity: {
      mandatory: mandatoryDispatches,

      optional: optionalDispatches,
    },

    recentAudits,
  };
}
