// src/lib/events/visibility.ts

import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

import {
  normalizeAppRole,
} from "@/lib/navigation/roles";

import type {
  AppRole,
} from "@/lib/navigation/roles";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

export type EventVisibilityScope =
  | "GLOBAL"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "SCHOOL_WIDE_ONLY";

export type EventViewerContext = {
  userId:
    string;

  role:
    AppRole;

  scope:
    EventVisibilityScope;

  canManage:
    boolean;
};

/* ========================================================================== */
/* CURRENT VIEWER                                                             */
/* ========================================================================== */

export async function requireEventViewer(): Promise<
  EventViewerContext
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
      "communications.events.view",
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  const legacyRole =
    accessActor.actor
      .legacyRole
      ?.trim()
      .toLowerCase();

  const activeRoleKey =
    accessActor
      .activeAssignments[0]
      ?.role.key
      ?.trim()
      .toLowerCase();

  const role =
    normalizeAppRole(
      legacyRole ||
      activeRoleKey ||
      "custom",
    );

  const canManage =
    accessActor.can(
      "communications.events.manage",
    );

  let scope:
    EventVisibilityScope;

  if (
    canManage
  ) {
    scope =
      "GLOBAL";
  } else if (
    role ===
    "teacher"
  ) {
    scope =
      "TEACHER";
  } else if (
    role ===
    "student"
  ) {
    scope =
      "STUDENT";
  } else if (
    role ===
    "parent"
  ) {
    scope =
      "PARENT";
  } else {
    scope =
      "SCHOOL_WIDE_ONLY";
  }

  return {
    userId:
      accessActor.actor.id,

    role,

    scope,

    canManage,
  };
}

/* ========================================================================== */
/* VISIBILITY WHERE                                                           */
/* ========================================================================== */

export function getEventVisibilityWhere({
  userId,
  scope,
}: {
  userId:
    string;

  scope:
    EventVisibilityScope;
}): Prisma.EventWhereInput {
  /* ------------------------------------------------------------------------ */
  /* GLOBAL                                                                   */
  /* ------------------------------------------------------------------------ */

  if (
    scope ===
    "GLOBAL"
  ) {
    return {};
  }

  /* ------------------------------------------------------------------------ */
  /* STUDENT                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    scope ===
    "STUDENT"
  ) {
    return {
      OR: [
        {
          classId:
            null,
        },

        {
          class: {
            students: {
              some: {
                id:
                  userId,
              },
            },
          },
        },
      ],
    };
  }

  /* ------------------------------------------------------------------------ */
  /* PARENT                                                                   */
  /* ------------------------------------------------------------------------ */

  if (
    scope ===
    "PARENT"
  ) {
    return {
      OR: [
        {
          classId:
            null,
        },

        {
          class: {
            students: {
              some: {
                parentId:
                  userId,
              },
            },
          },
        },
      ],
    };
  }

  /* ------------------------------------------------------------------------ */
  /* TEACHER                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    scope ===
    "TEACHER"
  ) {
    return {
      OR: [
        {
          classId:
            null,
        },

        {
          class: {
            supervisorId:
              userId,
          },
        },

        {
          class: {
            lessons: {
              some: {
                teacherId:
                  userId,
              },
            },
          },
        },
      ],
    };
  }

  /* ------------------------------------------------------------------------ */
  /* OTHER AUTHENTICATED EVENT VIEWERS                                        */
  /* ------------------------------------------------------------------------ */

  /*
   * Read-only/custom staff who possess
   * communications.events.view but do not possess
   * communications.events.manage only see school-wide
   * events.
   */
  return {
    classId:
      null,
  };
}