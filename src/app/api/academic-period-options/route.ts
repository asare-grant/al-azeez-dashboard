import {
  NextResponse,
} from "next/server";

import prisma from "@/lib/prisma";

import {
  auth,
} from "@clerk/nextjs/server";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export async function GET() {
  try {
    const {
      userId,
      sessionClaims,
    } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          message:
            "Unauthenticated",
        },
        {
          status: 401,
        },
      );
    }

    const role = (
      sessionClaims
        ?.metadata as {
        role?: string;
      }
    )?.role;

    if (
      role !== "admin" &&
      role !== "teacher"
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorised",
        },
        {
          status: 403,
        },
      );
    }

    const [
      terms,
      academicYearRows,
    ] =
      await prisma.$transaction([
        prisma.schoolTerm.findMany({
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            isActive: true,
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
            isActive: true,
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
              (row) =>
                row.academicYear
                  .trim(),
            )
            .filter(Boolean),
        ),
      );

    const activeTerm =
      terms.find(
        (term) =>
          term.isActive,
      ) ?? null;

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
  } catch (error) {
    console.error(
      "ACADEMIC PERIOD OPTIONS ERROR:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Academic-period options could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}