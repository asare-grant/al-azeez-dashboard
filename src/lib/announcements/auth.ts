// src/lib/announcements/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type AnnouncementManagerContext = {
  userId:
    string;

  actorRole:
    string | null;

  actorName:
    string | null;
};

/* ========================================================================== */
/* REQUIRE MANAGER                                                            */
/* ========================================================================== */

export async function requireAnnouncementManager(): Promise<
  AnnouncementManagerContext
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
      "communications.announcements.manage",
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

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
              "communications.announcements.manage",
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
    "Announcement Administrator";

  return {
    userId:
      accessActor.actor.id,

    actorRole,

    actorName,
  };
}