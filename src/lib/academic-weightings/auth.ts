// src/lib/academic-weightings/auth.ts

import "server-only";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

export type AcademicWeightingManager = {
  userId:
    string;

  role:
    string | null;

  actorName:
    string | null;
};

export async function requireAcademicWeightingAdmin(): Promise<
  AcademicWeightingManager
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
      "settings.manage",
    )
  ) {
    throw new Error(
      "UNAUTHORISED",
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
              "settings.manage",
        ),
    );

  const role =
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
    "Academic Administrator";

  return {
    userId:
      accessActor.actor.id,

    role,

    actorName,
  };
}