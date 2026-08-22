// src/lib/announcements/visibility.ts

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

export type AnnouncementVisibilityScope =
  | "GLOBAL"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "SCHOOL_WIDE_ONLY";

export type AnnouncementViewerContext = {
  userId:
    string;

  role:
    AppRole;

  scope:
    AnnouncementVisibilityScope;

  canManage:
    boolean;
};

/* ========================================================================== */
/* CURRENT VIEWER                                                             */
/* ========================================================================== */

export async function requireAnnouncementViewer(): Promise<
  AnnouncementViewerContext
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
      "communications.announcements.view",
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

  /*
   * Prefer a domain persona when available.
   *
   * For delegated/custom RBAC identities the normalized
   * application role becomes "custom".
   */
  const activeRoleKey =
    accessActor.activeAssignments.find(
      (
        assignment,
      ) =>
        [
          "teacher",
          "student",
          "parent",
        ].includes(
          assignment.role.key
            .trim()
            .toLowerCase(),
        ),
    )?.role.key
      ?.trim()
      .toLowerCase() ??
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
      "communications.announcements.manage",
    );

  let scope:
    AnnouncementVisibilityScope;

  /*
   * Announcement managers need global visibility
   * because they may create/update/delete announcements
   * across the school.
   */
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
    /*
     * Secretary, Accountant, Auditor or future custom
     * staff who have announcement viewing authority but
     * not management authority see school-wide notices
     * only.
     */
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
/* VISIBILITY QUERY                                                           */
/* ========================================================================== */

export function getAnnouncementVisibilityWhere({
  userId,
  scope,
}: {
  userId:
    string;

  scope:
    AnnouncementVisibilityScope;
}): Prisma.AnnouncementWhereInput {
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

        /*
         * Class supervised by this teacher.
         */
        {
          class: {
            supervisorId:
              userId,
          },
        },

        /*
         * Class in which this teacher has a lesson.
         */
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
  /* OTHER VIEWERS                                                            */
  /* ------------------------------------------------------------------------ */

  return {
    classId:
      null,
  };
}