import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import type {
  ReportCardRole,
} from "./auth";

/* -------------------------------------------------------------------------- */
/*                               TYPES                                        */
/* -------------------------------------------------------------------------- */

type BuildReportCardReadWhereInput = {
  reportCardId:
    number;

  userId:
    string;

  role:
    ReportCardRole;

  /*
   * Optional route context.
   *
   * These let child-specific and class-specific routes
   * prove that the URL itself belongs to the requested card.
   */
  childId?:
    string;

  classId?:
    number;
};

/* -------------------------------------------------------------------------- */
/*                          READ ACCESS POLICY                                 */
/* -------------------------------------------------------------------------- */

export function buildReportCardReadWhere({
  reportCardId,
  userId,
  role,
  childId,
  classId,
}: BuildReportCardReadWhereInput): Prisma.ReportCardWhereInput | null {
  if (
    !Number.isInteger(
      reportCardId,
    ) ||
    reportCardId <= 0
  ) {
    return null;
  }

  const where:
    Prisma.ReportCardWhereInput = {
      id:
        reportCardId,
    };

  switch (role) {
    /* ---------------------------------------------------------------------- */
    /*                              ADMIN                                     */
    /* ---------------------------------------------------------------------- */

    case "admin": {
      /*
       * Administrators may read every lifecycle state.
       *
       * DRAFT
       * PUBLISHED
       * ARCHIVED
       */
      return where;
    }

    /* ---------------------------------------------------------------------- */
    /*                             TEACHER                                     */
    /* ---------------------------------------------------------------------- */

    case "teacher": {
      /*
       * A class-specific teacher route must also
       * match the class contained in the URL.
       */
      if (
        classId !==
        undefined
      ) {
        if (
          !Number.isInteger(
            classId,
          ) ||
          classId <= 0
        ) {
          return null;
        }

        where.classId =
          classId;
      }

      /*
       * The report's class must contain at least
       * one lesson assigned to this teacher.
       */
      where.class = {
        lessons: {
          some: {
            teacherId:
              userId,
          },
        },
      };

      return where;
    }

    /* ---------------------------------------------------------------------- */
    /*                              STUDENT                                    */
    /* ---------------------------------------------------------------------- */

    case "student": {
      /*
       * Students only receive their own officially
       * published report-card snapshots.
       */
      where.studentId =
        userId;

      where.status =
        "PUBLISHED";

      return where;
    }

    /* ---------------------------------------------------------------------- */
    /*                               PARENT                                    */
    /* ---------------------------------------------------------------------- */

    case "parent": {
      /*
       * When the route contains /children/[childId],
       * the requested card must belong to that exact child.
       */
      if (
        childId !==
        undefined
      ) {
        const normalizedChildId =
          childId.trim();

        if (
          !normalizedChildId
        ) {
          return null;
        }

        where.studentId =
          normalizedChildId;
      }

      /*
       * Whether or not a child ID was supplied,
       * the student must belong to this parent.
       */
      where.student = {
        parentId:
          userId,
      };

      /*
       * Parents never receive draft or archived cards.
       */
      where.status =
        "PUBLISHED";

      return where;
    }

    default:
      return null;
  }
}



/* -------------------------------------------------------------------------- */
/*                       MANAGER MUTATION ACCESS                              */
/* -------------------------------------------------------------------------- */

export function buildReportCardManagerWhere({
  reportCardId,
  userId,
  role,
}: {
  reportCardId: number;

  userId: string;

  role: ReportCardRole;
}): Prisma.ReportCardWhereInput | null {
  /*
   * Only administrators and teachers can mutate
   * report-card review state.
   */
  if (
    role !== "admin" &&
    role !== "teacher"
  ) {
    return null;
  }

  /*
   * The manager ownership policy is the same
   * ownership rule already used for reading.
   *
   * Admin:
   *   any report
   *
   * Teacher:
   *   only reports belonging to a class in which
   *   the teacher has at least one assigned lesson.
   */
  return buildReportCardReadWhere({
    reportCardId,

    userId,

    role,
  });
}