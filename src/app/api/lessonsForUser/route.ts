// src/app/api/lessonsForUser/route.ts

import {
  NextResponse,
} from "next/server";

import {
  requireAcademicOptionsAccess,
} from "@/lib/academics/options-auth";

import prisma from "@/lib/prisma";

/* ========================================================================== */
/* GET                                                                        */
/* ========================================================================== */

export async function GET() {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    const actor =
      await requireAcademicOptionsAccess();

    /* ---------------------------------------------------------------------- */
    /* LESSONS                                                                */
    /* ---------------------------------------------------------------------- */

    const lessons =
      await prisma.lesson.findMany({
        where:
          actor.scope ===
          "OWN_LESSONS"
            ? {
                teacherId:
                  actor.userId,
              }
            : undefined,

        select: {
          id:
            true,

          name:
            true,
        },

        orderBy: {
          name:
            "asc",
        },
      });

    return NextResponse.json({
      lessons,
    });
  } catch (
    error
  ) {
    console.error(
      "LESSONS FOR USER ERROR:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHENTICATED"
    ) {
      return NextResponse.json(
        {
          lessons:
            [],

          error:
            true,

          message:
            "Authentication required.",
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
          lessons:
            [],

          error:
            true,

          message:
            "You do not have permission to access lesson options.",
        },

        {
          status:
            403,
        },
      );
    }

    return NextResponse.json(
      {
        lessons:
          [],

        error:
          true,

        message:
          "Lesson options could not be loaded.",
      },

      {
        status:
          500,
      },
    );
  }
}