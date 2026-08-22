// src/lib/notifications/scheduled/access-review-deadlines.ts

import "server-only";

import prisma from "@/lib/prisma";

import {
  getAccessReviewSuperAdminRecipients,
} from "@/lib/notifications/recipients";

import {
  notifyUsers,
} from "@/lib/notifications/service";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type AccessReviewDeadlineStage =
  | "7D"
  | "3D"
  | "24H"
  | "OVERDUE";

type AccessReviewDeadlineScannerResult = {
  scanned:
    number;

  eligible:
    number;

  dispatched:
    number;

  createdEvents:
    number;

  delivered:
    number;

  skipped:
    number;

  recipientCount:
    number;

  stages: {
    sevenDays:
      number;

    threeDays:
      number;

    twentyFourHours:
      number;

    overdue:
      number;
  };
};

/* ========================================================================== */
/* TIME                                                                       */
/* ========================================================================== */

const HOUR_MS =
  60 *
  60 *
  1000;

const DAY_MS =
  24 *
  HOUR_MS;

/* ========================================================================== */
/* STAGE RESOLUTION                                                           */
/* ========================================================================== */

function resolveDeadlineStage({
  dueAt,
  now,
}: {
  dueAt:
    Date;

  now:
    Date;
}):
  | AccessReviewDeadlineStage
  | null {
  const remaining =
    dueAt.getTime() -
    now.getTime();

  if (
    remaining <=
    0
  ) {
    return "OVERDUE";
  }

  if (
    remaining <=
    24 *
      HOUR_MS
  ) {
    return "24H";
  }

  if (
    remaining <=
    3 *
      DAY_MS
  ) {
    return "3D";
  }

  if (
    remaining <=
    7 *
      DAY_MS
  ) {
    return "7D";
  }

  return null;
}

/* ========================================================================== */
/* NOTIFICATION CONTENT                                                       */
/* ========================================================================== */

function getDeadlineNotificationDefinition({
  stage,
  campaignName,
  pendingCount,
}: {
  stage:
    AccessReviewDeadlineStage;

  campaignName:
    string;

  pendingCount:
    number;
}) {
  switch (
    stage
  ) {
    case "7D": {
      return {
        type:
          "ACCESS_REVIEW_DUE_SOON" as const,

        priority:
          "NORMAL" as const,

        dedupeStage:
          "7d",

        title:
          "Access review due within 7 days",

        message:
          `${campaignName} is due within 7 days with ${pendingCount} pending certification item${
            pendingCount ===
            1
              ? ""
              : "s"
          }.`,
      };
    }

    case "3D": {
      return {
        type:
          "ACCESS_REVIEW_DUE_SOON" as const,

        priority:
          "HIGH" as const,

        dedupeStage:
          "3d",

        title:
          "Access review requires attention",

        message:
          `${campaignName} is due within 3 days and still has ${pendingCount} pending certification item${
            pendingCount ===
            1
              ? ""
              : "s"
          }.`,
      };
    }

    case "24H": {
      return {
        type:
          "ACCESS_REVIEW_DUE_URGENT" as const,

        priority:
          "URGENT" as const,

        dedupeStage:
          "24h",

        title:
          "Access review due within 24 hours",

        message:
          `${campaignName} is due within 24 hours with ${pendingCount} pending certification item${
            pendingCount ===
            1
              ? ""
              : "s"
          }. Immediate review is required.`,
      };
    }

    case "OVERDUE": {
      return {
        type:
          "ACCESS_REVIEW_OVERDUE" as const,

        priority:
          "URGENT" as const,

        dedupeStage:
          "overdue",

        title:
          "Access review campaign is overdue",

        message:
          `${campaignName} has passed its review deadline with ${pendingCount} pending certification item${
            pendingCount ===
            1
              ? ""
              : "s"
          }.`,
      };
    }
  }
}

/* ========================================================================== */
/* MAIN SCANNER                                                               */
/* ========================================================================== */

export async function processAccessReviewDeadlineNotifications(): Promise<AccessReviewDeadlineScannerResult> {
  const now =
    new Date();

  const sevenDaysFromNow =
    new Date(
      now.getTime() +
        7 *
          DAY_MS,
    );

  const recipients =
    await getAccessReviewSuperAdminRecipients();

  /*
   * Only ACTIVE campaigns require deadline monitoring.
   *
   * DRAFT:
   * Not yet formally underway.
   *
   * COMPLETED / CANCELLED:
   * Terminal and no longer actionable.
   *
   * There is deliberately no lower bound on dueAt.
   * This lets a still-active overdue campaign be detected
   * even if it has been overdue for more than a few days.
   *
   * Notification dedupe prevents repeated deliveries.
   */
  const campaigns =
    await prisma.accessReviewCampaign.findMany({
      where: {
        status:
          "ACTIVE",

        dueAt: {
          lte:
            sevenDaysFromNow,
        },
      },

      select: {
        id:
          true,

        name:
          true,

        scope:
          true,

        dueAt:
          true,

        startedAt:
          true,

        items: {
          where: {
            decision:
              "PENDING",
          },

          select: {
            id:
              true,
          },
        },
      },

      orderBy: {
        dueAt:
          "asc",
      },
    });

  const result: AccessReviewDeadlineScannerResult = {
    scanned:
      campaigns.length,

    eligible:
      0,

    dispatched:
      0,

    createdEvents:
      0,

    delivered:
      0,

    skipped:
      0,

    recipientCount:
      recipients.length,

    stages: {
      sevenDays:
        0,

      threeDays:
        0,

      twentyFourHours:
        0,

      overdue:
        0,
    },
  };

  if (
    recipients.length ===
    0
  ) {
    result.skipped =
      campaigns.length;

    return result;
  }

  for (
    const campaign of
    campaigns
  ) {
    const pendingCount =
      campaign.items.length;

    /*
     * A campaign whose review queue has already reached
     * zero should normally be completed rather than
     * generate deadline warnings.
     *
     * We leave completion to the Super Admin, but there
     * is no reason to create "pending work" reminders.
     */
    if (
      pendingCount ===
      0
    ) {
      result.skipped +=
        1;

      continue;
    }

    const stage =
      resolveDeadlineStage({
        dueAt:
          campaign.dueAt,

        now,
      });

    if (!stage) {
      result.skipped +=
        1;

      continue;
    }

    result.eligible +=
      1;

    const definition =
      getDeadlineNotificationDefinition({
        stage,

        campaignName:
          campaign.name,

        pendingCount,
      });

    /*
     * dueAt is deliberately part of the dedupe key.
     *
     * If campaign due-date editing is added later,
     * a revised deadline creates a fresh notification
     * cycle instead of being blocked by the old one.
     */
    const dedupeKey =
      [
        "access-review",

        campaign.id,

        campaign.dueAt.getTime(),

        definition.dedupeStage,
      ].join(":");

    const dispatch =
      await notifyUsers({
        type:
          definition.type,

        category:
          "ACCESS_CONTROL",

        priority:
          definition.priority,

        title:
          definition.title,

        message:
          definition.message,

        actionUrl:
          `/list/access-control/reviews/${campaign.id}`,

        entityType:
          "ACCESS_REVIEW_CAMPAIGN",

        entityId:
          campaign.id,

        dedupeKey,

        actorRole:
          "system",

        actorName:
          "Scheduled Notification Engine",

        source:
          "SCHEDULED",

        sourceKey:
          "access-review-deadlines",

        recipients,

        metadata: {
          scanner:
            "access-review-deadlines",

          stage,

          campaignId:
            campaign.id,

          campaignName:
            campaign.name,

          scope:
            campaign.scope,

          dueAt:
            campaign.dueAt.toISOString(),

          startedAt:
            campaign.startedAt
              ?.toISOString() ??
            null,

          pendingCount,
        },
      });

    result.dispatched +=
      1;

    if (
      dispatch.createdEvent
    ) {
      result.createdEvents +=
        1;
    }

    result.delivered +=
      dispatch.deliveredCount;

    switch (
      stage
    ) {
      case "7D":
        result.stages.sevenDays +=
          1;
        break;

      case "3D":
        result.stages.threeDays +=
          1;
        break;

      case "24H":
        result.stages.twentyFourHours +=
          1;
        break;

      case "OVERDUE":
        result.stages.overdue +=
          1;
        break;
    }
  }

  return result;
}