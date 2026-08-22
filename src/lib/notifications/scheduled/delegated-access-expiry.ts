// src/lib/notifications/scheduled/delegated-access-expiry.ts

import "server-only";

import prisma from "@/lib/prisma";

import {
  getAccessControlGovernanceRecipients,
} from "@/lib/notifications/recipients";

import {
  notifyUsers,
} from "@/lib/notifications/service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type DelegatedAccessReminderStage =
  | "7D"
  | "3D"
  | "24H"
  | "EXPIRED";

type DelegatedAccessScannerResult = {
  scanned: number;

  eligible: number;

  dispatched: number;

  createdEvents: number;

  delivered: number;

  skipped: number;

  recipientCount: number;

  stages: {
    sevenDays: number;

    threeDays: number;

    twentyFourHours: number;

    expired: number;
  };
};

/* -------------------------------------------------------------------------- */
/*                              TIME CONSTANTS                                */
/* -------------------------------------------------------------------------- */

const HOUR_MS =
  60 *
  60 *
  1000;

const DAY_MS =
  24 *
  HOUR_MS;

/*
 * We only scan recently expired assignments.
 *
 * This prevents the scheduled job from loading every
 * expired role assignment ever created.
 */
const EXPIRED_LOOKBACK_MS =
  7 *
  DAY_MS;

/* -------------------------------------------------------------------------- */
/*                         RESOLVE REMINDER STAGE                             */
/* -------------------------------------------------------------------------- */

function resolveReminderStage({
  expiresAt,
  now,
}: {
  expiresAt: Date;

  now: Date;
}): DelegatedAccessReminderStage | null {
  const remainingMs =
    expiresAt.getTime() -
    now.getTime();

  /*
   * Already expired.
   */
  if (remainingMs <= 0) {
    return "EXPIRED";
  }

  /*
   * Final urgent reminder.
   */
  if (
    remainingMs <=
    24 * HOUR_MS
  ) {
    return "24H";
  }

  /*
   * Three-day reminder.
   */
  if (
    remainingMs <=
    3 * DAY_MS
  ) {
    return "3D";
  }

  /*
   * Seven-day reminder.
   */
  if (
    remainingMs <=
    7 * DAY_MS
  ) {
    return "7D";
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                         NOTIFICATION CONTENT                               */
/* -------------------------------------------------------------------------- */

function getNotificationDefinition({
  stage,
  userName,
  roleName,
}: {
  stage: DelegatedAccessReminderStage;

  userName: string;

  roleName: string;
}) {
  switch (stage) {
    case "24H": {
      return {
        type:
          "DELEGATED_ACCESS_EXPIRING_URGENT" as const,

        priority:
          "URGENT" as const,

        title:
          "Delegated access expires within 24 hours",

        message:
          `${roleName} access for ${userName} will expire within 24 hours. Review the assignment before the delegated access ends.`,

        dedupeStage:
          "24h",
      };
    }

    case "3D": {
      return {
        type:
          "DELEGATED_ACCESS_EXPIRES_SOON" as const,

        priority:
          "HIGH" as const,

        title:
          "Delegated access requires review",

        message:
          `${roleName} access for ${userName} expires within 3 days. Review whether the assignment should be extended, made permanent, or allowed to expire.`,

        dedupeStage:
          "3d",
      };
    }

    case "7D": {
      return {
        type:
          "DELEGATED_ACCESS_EXPIRING" as const,

        priority:
          "NORMAL" as const,

        title:
          "Delegated access expires soon",

        message:
          `${roleName} access for ${userName} expires within 7 days.`,

        dedupeStage:
          "7d",
      };
    }

    case "EXPIRED": {
      return {
        type:
          "DELEGATED_ACCESS_EXPIRED" as const,

        priority:
          "NORMAL" as const,

        title:
          "Delegated access has expired",

        message:
          `${roleName} access for ${userName} has expired and no longer contributes delegated RBAC permissions.`,

        dedupeStage:
          "expired",
      };
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                            DISPLAY NAME                                    */
/* -------------------------------------------------------------------------- */

function getAssignmentUserName({
  displayName,
  username,
  email,
}: {
  displayName: string | null;

  username: string | null;

  email: string | null;
}) {
  return (
    displayName?.trim() ||
    username?.trim() ||
    email?.trim() ||
    "Unknown user"
  );
}

/* -------------------------------------------------------------------------- */
/*                              MAIN SCANNER                                  */
/* -------------------------------------------------------------------------- */

export async function processDelegatedAccessExpiryNotifications(): Promise<DelegatedAccessScannerResult> {
  const now =
    new Date();

  const futureLimit =
    new Date(
      now.getTime() +
        7 * DAY_MS,
    );

  const expiredLookback =
    new Date(
      now.getTime() -
        EXPIRED_LOOKBACK_MS,
    );

  /*
   * Resolve the people who are allowed to receive
   * access-control governance alerts.
   *
   * We do this once for the whole scanner instead
   * of repeating the same query for every assignment.
   */
  const recipients =
    await getAccessControlGovernanceRecipients();

  /*
   * Find temporary delegated role assignments that:
   *
   * 1. expire within the next seven days, or
   * 2. expired within the previous seven days.
   */
  const assignments =
    await prisma.userRoleAssignment.findMany({
      where: {
        expiresAt: {
          not:
            null,

          gte:
            expiredLookback,

          lte:
            futureLimit,
        },

        role: {
          isActive:
            true,
        },
      },

      select: {
        id:
          true,

        assignedAt:
          true,

        assignedBy:
          true,

        expiresAt:
          true,

        source:
          true,

        user: {
          select: {
            id:
              true,

            displayName:
              true,

            username:
              true,

            email:
              true,

            status:
              true,
          },
        },

        role: {
          select: {
            id:
              true,

            key:
              true,

            name:
              true,

            type:
              true,

            isProtected:
              true,
          },
        },
      },

      orderBy: {
        expiresAt:
          "asc",
      },
    });

  const result: DelegatedAccessScannerResult = {
    scanned:
      assignments.length,

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

      expired:
        0,
    },
  };

  /*
   * There is nobody authorised to receive these
   * notifications.
   *
   * Nothing needs to be dispatched.
   */
  if (
    recipients.length ===
    0
  ) {
    result.skipped =
      assignments.length;

    return result;
  }

  for (
    const assignment of
    assignments
  ) {
    /*
     * Prisma knows expiresAt matched `not: null`,
     * but TypeScript can still expose the selected
     * field as nullable.
     */
    if (
      !assignment.expiresAt
    ) {
      result.skipped +=
        1;

      continue;
    }

    const stage =
      resolveReminderStage({
        expiresAt:
          assignment.expiresAt,

        now,
      });

    if (!stage) {
      result.skipped +=
        1;

      continue;
    }

    /*
     * We do not need upcoming reminders for accounts
     * that are already suspended or disabled.
     *
     * The EXPIRED event remains useful for governance
     * history even if the account is no longer active.
     */
    if (
      stage !==
        "EXPIRED" &&
      assignment.user.status !==
        "ACTIVE"
    ) {
      result.skipped +=
        1;

      continue;
    }

    result.eligible +=
      1;

    const userName =
      getAssignmentUserName({
        displayName:
          assignment.user.displayName,

        username:
          assignment.user.username,

        email:
          assignment.user.email,
      });

    const definition =
      getNotificationDefinition({
        stage,

        userName,

        roleName:
          assignment.role.name,
      });

    /*
     * IMPORTANT:
     *
     * expiresAt is included in the dedupe key.
     *
     * Example:
     *
     * delegated-access:42:1786905600000:7d
     *
     * If an administrator later extends the same
     * assignment, the expiry timestamp changes.
     *
     * That gives the new expiry cycle its own valid
     * 7-day / 3-day / 24-hour reminders.
     */
    const dedupeKey =
      [
        "delegated-access",

        assignment.id,

        assignment.expiresAt.getTime(),

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
          "/list/access-control/delegated-access",

        entityType:
          "USER_ROLE_ASSIGNMENT",

        entityId:
          assignment.id,

        dedupeKey,

        /*
         * Makes the notification auditable as a
         * scheduled-system notification.
         */
        actorRole:
          "system",

        actorName:
          "Scheduled Notification Engine",

        source:
          "SCHEDULED",

        sourceKey:
          "delegated-access-expiry",

        recipients,

        metadata: {
          scanner:
            "delegated-access-expiry",

          stage,

          assignmentId:
            assignment.id,

          assignedBy:
            assignment.assignedBy,

          assignmentSource:
            assignment.source,

          assignedAt:
            assignment.assignedAt.toISOString(),

          expiresAt:
            assignment.expiresAt.toISOString(),

          user: {
            id:
              assignment.user.id,

            displayName:
              assignment.user.displayName,

            username:
              assignment.user.username,

            email:
              assignment.user.email,

            status:
              assignment.user.status,
          },

          role: {
            id:
              assignment.role.id,

            key:
              assignment.role.key,

            name:
              assignment.role.name,

            type:
              assignment.role.type,

            isProtected:
              assignment.role.isProtected,
          },
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

    switch (stage) {
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

      case "EXPIRED":
        result.stages.expired +=
          1;
        break;
    }
  }

  return result;
}