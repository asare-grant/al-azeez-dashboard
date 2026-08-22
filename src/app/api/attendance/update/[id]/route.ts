// src/app/api/attendance/update/[id]/route.ts

import {
  NextResponse,
} from "next/server";

import {
  requireAttendancePermission,
} from "@/lib/attendance/auth";

import prisma from "@/lib/prisma";

export async function PUT(
  req:
    Request,

  context: {
    params: Promise<{
      id:
        string;
    }>;
  },
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const actor =
      await requireAttendancePermission(
        "attendance.modify",
      );

    /* ---------------------------------------------------------------------- */
    /* ATTENDANCE ID                                                          */
    /* ---------------------------------------------------------------------- */

    const {
      id,
    } =
      await context.params;

    const attendanceId =
      Number(
        id,
      );

    if (
      !Number.isInteger(
        attendanceId,
      ) ||
      attendanceId <=
        0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid attendance ID",
        },

        {
          status:
            400,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* BODY                                                                    */
    /* ---------------------------------------------------------------------- */

    const {
      present,
    } =
      await req.json();

    if (
      typeof present !==
      "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid attendance value",
        },

        {
          status:
            400,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* OWNERSHIP                                                              */
    /* ---------------------------------------------------------------------- */

    if (
      actor.scope ===
      "SUPERVISED_CLASSES"
    ) {
      const record =
        await prisma.attendance.findUnique({
          where: {
            id:
              attendanceId,
          },

          select: {
            id:
              true,

            student: {
              select: {
                class: {
                  select: {
                    supervisorId:
                      true,
                  },
                },
              },
            },
          },
        });

      if (
        !record
      ) {
        return NextResponse.json(
          {
            error:
              "Attendance record not found",
          },

          {
            status:
              404,
          },
        );
      }

      if (
        record.student
          .class
          .supervisorId !==
        actor.userId
      ) {
        return NextResponse.json(
          {
            error:
              "Forbidden",
          },

          {
            status:
              403,
          },
        );
      }
    }

    /* ---------------------------------------------------------------------- */
    /* UPDATE                                                                 */
    /* ---------------------------------------------------------------------- */

    const updated =
      await prisma.attendance.update({
        where: {
          id:
            attendanceId,
        },

        data: {
          present,
        },
      });

    return NextResponse.json(
      updated,
    );
  } catch (
    error
  ) {
    console.error(
      "ATTENDANCE UPDATE ERROR:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHENTICATED"
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },

        {
          status:
            401,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          error:
            "Forbidden",
        },

        {
          status:
            403,
        },
      );
    }

    return NextResponse.json(
      {
        error:
          "Failed to update attendance",
      },

      {
        status:
          500,
      },
    );
  }
}