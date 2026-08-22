// src/lib/notifications/access-review-notifications.ts

import "server-only";

import type {
  NotificationPriority,
  NotificationType,
  Prisma,
} from "@prisma/client";

import {
  createNotificationEventWithTransaction,
  notifyUsers,
} from "./service";

import {
  getAccessReviewSuperAdminRecipients,
} from "./recipients";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type CampaignNotificationActor = {
  id:
    string;

  role:
    string | null;

  name:
    string;
};

type CampaignLifecycleNotificationInput = {
  campaignId:
    number;

  campaignName:
    string;

  dueAt:
    Date;

  itemCount:
    number;

  actor:
    CampaignNotificationActor;

  tx?:
    Prisma.TransactionClient;
};

type CampaignCompletionNotificationInput =
  CampaignLifecycleNotificationInput & {
    certifiedCount:
      number;

    modifiedCount:
      number;

    revokedCount:
      number;
  };

type CampaignCancellationNotificationInput =
  CampaignLifecycleNotificationInput & {
    reviewedCount:
      number;

    pendingCount:
      number;

    reason:
      string;
  };

/* ========================================================================== */
/* SHARED DISPATCH                                                            */
/* ========================================================================== */

async function dispatchAccessReviewNotification({
  type,
  priority,
  title,
  message,
  campaignId,
  campaignName,
  dueAt,
  dedupeStage,
  actor,
  metadata,
  tx,
}: {
  type:
    NotificationType;

  priority:
    NotificationPriority;

  title:
    string;

  message:
    string;

  campaignId:
    number;

  campaignName:
    string;

  dueAt:
    Date;

  dedupeStage:
    string;

  actor:
    CampaignNotificationActor;

  metadata?:
    Prisma.InputJsonValue;

  tx?:
    Prisma.TransactionClient;
}) {
  const recipients =
    await getAccessReviewSuperAdminRecipients({
      tx,
    });

  const input = {
    type,

    category:
      "ACCESS_CONTROL" as const,

    priority,

    title,

    message,

    actionUrl:
      `/list/access-control/reviews/${campaignId}`,

    entityType:
      "ACCESS_REVIEW_CAMPAIGN" as const,

    entityId:
      campaignId,

    dedupeKey:
      `access-review:${campaignId}:${dedupeStage}`,

    actorId:
      actor.id,

    actorRole:
      actor.role,

    actorName:
      actor.name,

    source:
      "ADMIN_ACTION" as const,

    sourceKey:
      "access-review-campaign-lifecycle",

    recipients,

    metadata: {
      campaignId,

      campaignName,

      dueAt:
        dueAt.toISOString(),

      ...(metadata &&
      typeof metadata ===
        "object"
        ? metadata
        : {}),
    } satisfies Prisma.InputJsonValue,
  };

  if (tx) {
    return createNotificationEventWithTransaction({
      tx,

      input,
    });
  }

  return notifyUsers(
    input,
  );
}

/* ========================================================================== */
/* CAMPAIGN STARTED                                                           */
/* ========================================================================== */

export async function notifyAccessReviewCampaignStarted(
  input:
    CampaignLifecycleNotificationInput,
) {
  return dispatchAccessReviewNotification({
    type:
      "ACCESS_REVIEW_CAMPAIGN_STARTED",

    priority:
      "NORMAL",

    title:
      "Access review campaign started",

    message:
      `${input.campaignName} is now active with ${input.itemCount} access assignment${
        input.itemCount ===
        1
          ? ""
          : "s"
      } requiring certification.`,

    campaignId:
      input.campaignId,

    campaignName:
      input.campaignName,

    dueAt:
      input.dueAt,

    dedupeStage:
      "started",

    actor:
      input.actor,

    tx:
      input.tx,

    metadata: {
      lifecycle:
        "STARTED",

      itemCount:
        input.itemCount,
    },
  });
}

/* ========================================================================== */
/* CAMPAIGN COMPLETED                                                         */
/* ========================================================================== */

export async function notifyAccessReviewCampaignCompleted(
  input:
    CampaignCompletionNotificationInput,
) {
  return dispatchAccessReviewNotification({
    type:
      "ACCESS_REVIEW_CAMPAIGN_COMPLETED",

    priority:
      "NORMAL",

    title:
      "Access review campaign completed",

    message:
      `${input.campaignName} has been formally completed. ${input.certifiedCount} certified, ${input.modifiedCount} modified and ${input.revokedCount} revoked.`,

    campaignId:
      input.campaignId,

    campaignName:
      input.campaignName,

    dueAt:
      input.dueAt,

    dedupeStage:
      "completed",

    actor:
      input.actor,

    tx:
      input.tx,

    metadata: {
      lifecycle:
        "COMPLETED",

      itemCount:
        input.itemCount,

      certifiedCount:
        input.certifiedCount,

      modifiedCount:
        input.modifiedCount,

      revokedCount:
        input.revokedCount,
    },
  });
}

/* ========================================================================== */
/* CAMPAIGN CANCELLED                                                         */
/* ========================================================================== */

export async function notifyAccessReviewCampaignCancelled(
  input:
    CampaignCancellationNotificationInput,
) {
  return dispatchAccessReviewNotification({
    type:
      "ACCESS_REVIEW_CAMPAIGN_CANCELLED",

    priority:
      "HIGH",

    title:
      "Access review campaign cancelled",

    message:
      `${input.campaignName} has been cancelled. ${input.reviewedCount} decision${
        input.reviewedCount ===
        1
          ? ""
          : "s"
      } remain preserved and ${input.pendingCount} item${
        input.pendingCount ===
        1
          ? ""
          : "s"
      } were still pending.`,

    campaignId:
      input.campaignId,

    campaignName:
      input.campaignName,

    dueAt:
      input.dueAt,

    dedupeStage:
      "cancelled",

    actor:
      input.actor,

    tx:
      input.tx,

    metadata: {
      lifecycle:
        "CANCELLED",

      itemCount:
        input.itemCount,

      reviewedCount:
        input.reviewedCount,

      pendingCount:
        input.pendingCount,

      reason:
        input.reason,
    },
  });
}