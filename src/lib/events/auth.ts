// src/lib/events/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type EventManagerContext = {
  userId:
    string;

  actorRole:
    string | null;

  actorName:
    string | null;
};

/* ========================================================================== */
/* REQUIRE EVENT MANAGER                                                      */
/* ========================================================================== */

export async function requireEventManager(): Promise<
  EventManagerContext
> {
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
      "communications.events.manage",
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  /*
   * Prefer the active RBAC role that actually
   * grants event management authority.
   *
   * This gives better audit evidence for delegated
   * identities such as:
   *
   * Academic Director
   * Secretary
   * custom communications role
   */
  const grantingAssignment =
    accessActor.activeAssignments.find(
      (
        assignment,
      ) =>
        assignment.role.permissions.some(
          (
            rolePermission,
          ) =>
            rolePermission
              .permission
              .isActive &&
            rolePermission
              .permission
              .key
              .trim()
              .toLowerCase() ===
              "communications.events.manage",
        ),
    );

  const actorRole =
    grantingAssignment
      ?.role.key
      ?.trim()
      .toLowerCase() ??
    accessActor.actor
      .legacyRole
      ?.trim()
      .toLowerCase() ??
    null;

  const actorName =
    accessActor.actor
      .displayName
      ?.trim() ||
    accessActor.actor
      .username
      ?.trim() ||
    accessActor.actor
      .email
      ?.trim() ||
    "Event Administrator";

  return {
    userId:
      accessActor.actor.id,

    actorRole,

    actorName,
  };
}