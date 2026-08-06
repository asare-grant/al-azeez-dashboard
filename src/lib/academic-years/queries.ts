import "server-only";

import prisma from "@/lib/prisma";

export async function getAcademicYearOptions() {
  const [
    configuredYears,
    weightingYears,
    reportCardYears,
  ] = await prisma.$transaction([
    prisma.schoolAcademicYear.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        isActive: true,
      },

      orderBy: [
        {
          isActive: "desc",
        },
        {
          startDate: "desc",
        },
      ],
    }),

    prisma.academicWeighting.findMany({
      distinct: [
        "academicYear",
      ],

      select: {
        academicYear: true,
      },

      orderBy: {
        academicYear: "desc",
      },
    }),

    prisma.reportCard.findMany({
      distinct: [
        "academicYear",
      ],

      select: {
        academicYear: true,
      },

      orderBy: {
        academicYear: "desc",
      },
    }),
  ]);

  const academicYears =
    Array.from(
      new Set([
        ...configuredYears.map(
          (year) =>
            year.name.trim(),
        ),

        ...weightingYears.map(
          (year) =>
            year.academicYear.trim(),
        ),

        ...reportCardYears.map(
          (year) =>
            year.academicYear.trim(),
        ),
      ]),
    )
      .filter(Boolean)
      .sort((first, second) =>
        second.localeCompare(
          first,
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          },
        ),
      );

  const activeAcademicYear =
    configuredYears.find(
      (year) =>
        year.isActive,
    ) ?? null;

  return {
    academicYears,

    activeAcademicYear,

    configuredYears,
  };
}