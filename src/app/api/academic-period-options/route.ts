// src/app/api/academic-period-options/route.ts

import {
  NextResponse,
} from "next/server";

import {
  requireAcademicOptionsAccess,
} from "@/lib/academics/options-auth";

import prisma from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* ========================================================================== */
/* GET                                                                        */
/* ========================================================================== */

export async function GET() {
  try {
    /* ---------------------------------------------------------------------- */
    /* AUTHORIZATION                                                          */
    /* ---------------------------------------------------------------------- */

    await requireAcademicOptionsAccess();

    /* ---------------------------------------------------------------------- */
    /* OPTIONS                                                                */
    /* ---------------------------------------------------------------------- */

    const [
      terms,
      academicYearRows,
    ] =
      await prisma.$transaction([
        prisma.schoolTerm.findMany({
          select: {
            id:
              true,

            name:
              true,

            startDate:
              true,

            endDate:
              true,

            isActive:
              true,
          },

          orderBy: [
            {
              isActive:
                "desc",
            },

            {
              startDate:
                "desc",
            },
          ],
        }),

        prisma.academicWeighting.findMany({
          where: {
            isActive:
              true,
          },

          distinct: [
            "academicYear",
          ],

          select: {
            academicYear:
              true,
          },

          orderBy: {
            academicYear:
              "desc",
          },
        }),
      ]);

    const academicYears =
      Array.from(
        new Set(
          academicYearRows
            .map(
              (
                row,
              ) =>
                row.academicYear
                  .trim(),
            )
            .filter(
              Boolean,
            ),
        ),
      );

    const activeTerm =
      terms.find(
        (
          term,
        ) =>
          term.isActive,
      ) ??
      null;

    return NextResponse.json({
      academicYears,

      terms,

      defaultAcademicYear:
        academicYears[0] ??
        "",

      defaultTermId:
        activeTerm?.id ??
        null,
    });
  } catch (
    error
  ) {
    console.error(
      "ACADEMIC PERIOD OPTIONS ERROR:",
      error,
    );

    if (
      error instanceof Error &&
      error.message ===
        "UNAUTHENTICATED"
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthenticated",
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
          message:
            "Unauthorised",
        },

        {
          status:
            403,
        },
      );
    }

    return NextResponse.json(
      {
        message:
          "Academic-period options could not be loaded.",
      },

      {
        status:
          500,
      },
    );
  }
}