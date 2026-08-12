import "server-only";

import type {
  Prisma,
} from "@prisma/client";

export type EventViewerRole =
  | "admin"
  | "teacher"
  | "student"
  | "parent";

export function getEventVisibilityWhere({
  userId,
  role,
}: {
  userId:
    string;

  role:
    EventViewerRole;
}): Prisma.EventWhereInput {
  if (
    role ===
    "admin"
  ) {
    return {};
  }

  if (
    role ===
    "student"
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

  if (
    role ===
    "parent"
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

  /*
   * Teachers see:
   *
   * - school-wide events
   * - events for classes they supervise
   * - events for classes they teach
   */
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