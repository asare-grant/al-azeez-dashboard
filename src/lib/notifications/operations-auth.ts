// src/lib/notifications/operations-auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type NotificationOperationsPermission =
  | "notification_operations.view"
  | "notification_operations.policy.manage"
  | "notification_operations.analytics.view"
  | "notification_operations.scheduler.run";

/* ========================================================================== */
/* REQUIRE PERMISSION                                                         */
/* ========================================================================== */

export async function requireNotificationOperationsPermission(
  permission:
    NotificationOperationsPermission,
) {
  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor
  ) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  if (
    !accessActor.can(
      permission,
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  return accessActor;
}