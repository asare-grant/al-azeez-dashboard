import type {
  GradingScaleStatus,
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  requireAcademicWeightingAdmin,
} from "./auth";

import {
  deriveAcademicYear,
  getAcademicYearRange,
} from "./utils";

import type {
  AcademicWeightingFormOptions,
  GradingScaleInput,
  GradingScaleListItem,
} from "./types";

import type {
  AcademicWeightingListFilters,
  AcademicWeightingListItem,
  AcademicWeightingMetrics,
  AcademicWeightingInput,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                              QUERY FILTERS                                  */
/* -------------------------------------------------------------------------- */

export type GradingScaleListFilters = {
  page?: number;
  pageSize?: number;

  search?: string;

  status?:
    | GradingScaleStatus
    | "ALL";
};

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

/* -------------------------------------------------------------------------- */
/*                          GRADING SCALE LIST                                 */
/* -------------------------------------------------------------------------- */

export async function getGradingScaleList({
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  status = "ALL",
}: GradingScaleListFilters = {}) {
  await requireAcademicWeightingAdmin();

  const safePage =
    Math.max(1, page);

  const safePageSize =
    Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, pageSize),
    );

  const normalizedSearch =
    search?.trim();

  const where: Prisma.GradingScaleWhereInput =
    {
      ...(status !== "ALL"
        ? {
            status,
          }
        : {}),

      ...(normalizedSearch
        ? {
            OR: [
              {
                name: {
                  contains:
                    normalizedSearch,
                  mode:
                    "insensitive",
                },
              },

              {
                description: {
                  contains:
                    normalizedSearch,
                  mode:
                    "insensitive",
                },
              },

              {
                boundaries: {
                  some: {
                    OR: [
                      {
                        grade: {
                          contains:
                            normalizedSearch,
                          mode:
                            "insensitive",
                        },
                      },

                      {
                        remark: {
                          contains:
                            normalizedSearch,
                          mode:
                            "insensitive",
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

  const [
    gradingScales,
    total,
  ] = await prisma.$transaction([
    prisma.gradingScale.findMany({
      where,

      select: {
        id: true,
        name: true,
        description: true,

        status: true,
        isDefault: true,

        createdAt: true,
        updatedAt: true,

        _count: {
          select: {
            boundaries: true,
            academicWeightings:
              true,
          },
        },
      },

      orderBy: [
        {
          isDefault: "desc",
        },
        {
          status: "asc",
        },
        {
          updatedAt: "desc",
        },
      ],

      skip:
        (safePage - 1) *
        safePageSize,

      take:
        safePageSize,
    }),

    prisma.gradingScale.count({
      where,
    }),
  ]);

  const data: GradingScaleListItem[] =
    gradingScales.map(
      (scale) => ({
        id: scale.id,

        name: scale.name,

        description:
          scale.description,

        status:
          scale.status,

        isDefault:
          scale.isDefault,

        boundaryCount:
          scale._count.boundaries,

        weightingCount:
          scale._count
            .academicWeightings,

        createdAt:
          scale.createdAt,

        updatedAt:
          scale.updatedAt,
      }),
    );

  return {
    data,

    page:
      safePage,

    pageSize:
      safePageSize,

    total,

    totalPages:
      Math.max(
        1,
        Math.ceil(
          total /
            safePageSize,
        ),
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                         SINGLE GRADING SCALE                                */
/* -------------------------------------------------------------------------- */

export async function getGradingScaleById(
  gradingScaleId: number,
) {
  await requireAcademicWeightingAdmin();

  return prisma.gradingScale.findUnique({
    where: {
      id: gradingScaleId,
    },

    select: {
      id: true,
      name: true,
      description: true,

      status: true,
      isDefault: true,

      createdAt: true,
      updatedAt: true,

      boundaries: {
        select: {
          id: true,

          grade: true,

          minimumScore: true,
          maximumScore: true,

          remark: true,
          gradePoint: true,

          position: true,

          createdAt: true,
          updatedAt: true,
        },

        orderBy: [
          {
            position: "asc",
          },
          {
            minimumScore: "desc",
          },
        ],
      },

      academicWeightings: {
        select: {
          id: true,
          academicYear: true,

          assignmentWeight: true,
          assessmentWeight: true,
          examWeight: true,

          passMark: true,
          isActive: true,

          term: {
            select: {
              id: true,
              name: true,
            },
          },

          grade: {
            select: {
              id: true,
              level: true,
            },
          },
        },

        orderBy: [
          {
            academicYear: "desc",
          },
          {
            grade: {
              level: "asc",
            },
          },
        ],
      },

      _count: {
        select: {
          boundaries: true,
          academicWeightings:
            true,
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                         GRADING SCALE EDIT DATA                             */
/* -------------------------------------------------------------------------- */

export async function getGradingScaleEditorData(
  gradingScaleId: number,
): Promise<GradingScaleInput | null> {
  const scale =
    await getGradingScaleById(
      gradingScaleId,
    );

  if (!scale) {
    return null;
  }

  return {
    id: scale.id,

    name: scale.name,

    description:
      scale.description,

    status:
      scale.status,

    isDefault:
      scale.isDefault,

    boundaries:
      scale.boundaries.map(
        (boundary) => ({
          id: boundary.id,

          grade:
            boundary.grade,

          minimumScore:
            boundary.minimumScore,

          maximumScore:
            boundary.maximumScore,

          remark:
            boundary.remark,

          gradePoint:
            boundary.gradePoint,

          position:
            boundary.position,
        }),
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                      GRADING SCALE SELECT OPTIONS                           */
/* -------------------------------------------------------------------------- */

export async function getAvailableGradingScales({
  includeDrafts = false,
}: {
  includeDrafts?: boolean;
} = {}) {
  await requireAcademicWeightingAdmin();

  return prisma.gradingScale.findMany({
    where: includeDrafts
      ? {
          status: {
            not: "ARCHIVED",
          },
        }
      : {
          status: "ACTIVE",
        },

    select: {
      id: true,
      name: true,
      status: true,
      isDefault: true,

      _count: {
        select: {
          boundaries: true,
        },
      },
    },

    orderBy: [
      {
        isDefault: "desc",
      },
      {
        name: "asc",
      },
    ],
  });
}

/* -------------------------------------------------------------------------- */
/*                     ACADEMIC WEIGHTING FORM OPTIONS                         */
/* -------------------------------------------------------------------------- */

export async function getAcademicWeightingFormOptions(): Promise<AcademicWeightingFormOptions> {
  await requireAcademicWeightingAdmin();

  const now =
    new Date();

  const currentAcademicYear =
    deriveAcademicYear(now);

  const currentStartYear =
    Number(
      currentAcademicYear.split(
        "/",
      )[0],
    );

  const [
    terms,
    grades,
    gradingScales,
    weightingYears,
  ] = await Promise.all([
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
          isActive: "desc",
        },
        {
          startDate: "desc",
        },
      ],
    }),

    prisma.grade.findMany({
      select: {
        id: true,
        level: true,
      },

      orderBy: {
        id: "asc",
      },
    }),

    prisma.gradingScale.findMany({
      where: {
        status: "ACTIVE",
      },

      select: {
        id: true,
        name: true,
        status: true,
        isDefault: true,
      },

      orderBy: [
        {
          isDefault: "desc",
        },
        {
          name: "asc",
        },
      ],
    }),

    prisma.academicWeighting.findMany({
      select: {
        academicYear: true,
      },

      distinct: [
        "academicYear",
      ],
    }),
  ]);

  const generatedYears =
    getAcademicYearRange({
      startYear:
        currentStartYear + 1,

      count: 7,
    });

  const academicYears =
    Array.from(
      new Set([
        currentAcademicYear,

        ...generatedYears,

        ...weightingYears.map(
          (item) =>
            item.academicYear,
        ),
      ]),
    ).sort(
      (first, second) =>
        second.localeCompare(
          first,
        ),
    );

  return {
    terms,
    grades,
    gradingScales,
    academicYears,
  };
}

/* -------------------------------------------------------------------------- */
/*                           GRADING SCALE METRICS                             */
/* -------------------------------------------------------------------------- */

export async function getGradingScaleMetrics() {
  await requireAcademicWeightingAdmin();

  const [
    total,
    draft,
    active,
    archived,
    defaultScale,
  ] = await Promise.all([
    prisma.gradingScale.count(),

    prisma.gradingScale.count({
      where: {
        status: "DRAFT",
      },
    }),

    prisma.gradingScale.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.gradingScale.count({
      where: {
        status: "ARCHIVED",
      },
    }),

    prisma.gradingScale.findFirst({
      where: {
        isDefault: true,
      },

      select: {
        id: true,
        name: true,
        status: true,
      },
    }),
  ]);

  return {
    total,
    draft,
    active,
    archived,
    defaultScale,
  };
}



/* -------------------------------------------------------------------------- */
/*                       ACADEMIC WEIGHTING LIST                               */
/* -------------------------------------------------------------------------- */



const DEFAULT_WEIGHTING_PAGE_SIZE = 12;
const MAX_WEIGHTING_PAGE_SIZE = 50;

export async function getAcademicWeightingList({
  page = 1,
  pageSize =
    DEFAULT_WEIGHTING_PAGE_SIZE,

  search,
  academicYear,
  termId,
  gradeId,
  gradingScaleId,
  status = "ALL",
}: AcademicWeightingListFilters = {}) {
  await requireAcademicWeightingAdmin();

  const safePage =
    Math.max(1, page);

  const safePageSize =
    Math.min(
      MAX_WEIGHTING_PAGE_SIZE,
      Math.max(1, pageSize),
    );

  const normalizedSearch =
    search?.trim();

  const where: Prisma.AcademicWeightingWhereInput =
    {
      ...(academicYear
        ? {
            academicYear,
          }
        : {}),

      ...(termId
        ? {
            termId,
          }
        : {}),

      ...(gradeId
        ? {
            gradeId,
          }
        : {}),

      ...(gradingScaleId
        ? {
            gradingScaleId,
          }
        : {}),

      ...(status === "ACTIVE"
        ? {
            isActive: true,
          }
        : {}),

      ...(status === "INACTIVE"
        ? {
            isActive: false,
          }
        : {}),

      ...(normalizedSearch
        ? {
            OR: [
              {
                academicYear: {
                  contains:
                    normalizedSearch,
                  mode:
                    "insensitive",
                },
              },

              {
                grade: {
                  level: {
                    contains:
                      normalizedSearch,
                    mode:
                      "insensitive",
                  },
                },
              },

              {
                gradingScale: {
                  name: {
                    contains:
                      normalizedSearch,
                    mode:
                      "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    };

  const [
    weightings,
    total,
  ] = await prisma.$transaction([
    prisma.academicWeighting.findMany({
      where,

      select: {
        id: true,
        academicYear: true,

        assignmentWeight: true,
        assessmentWeight: true,
        examWeight: true,

        assessmentScoreStrategy:
          true,

        passMark: true,
        isActive: true,

        createdAt: true,
        updatedAt: true,

        term: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },

        grade: {
          select: {
            id: true,
            level: true,
          },
        },

        gradingScale: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },

      orderBy: [
        {
          isActive: "desc",
        },

        {
          academicYear: "desc",
        },

        {
          grade: {
            level: "asc",
          },
        },

        {
          termId: "asc",
        },
      ],

      skip:
        (safePage - 1) *
        safePageSize,

      take:
        safePageSize,
    }),

    prisma.academicWeighting.count({
      where,
    }),
  ]);

  const data: AcademicWeightingListItem[] =
    weightings.map(
      (weighting) => ({
        id:
          weighting.id,

        academicYear:
          weighting.academicYear,

        assignmentWeight:
          weighting.assignmentWeight,

        assessmentWeight:
          weighting.assessmentWeight,

        examWeight:
          weighting.examWeight,

        assessmentScoreStrategy:
          weighting.assessmentScoreStrategy,

        passMark:
          weighting.passMark,

        isActive:
          weighting.isActive,

        term:
          weighting.term,

        grade:
          weighting.grade,

        gradingScale:
          weighting.gradingScale,

        createdAt:
          weighting.createdAt,

        updatedAt:
          weighting.updatedAt,
      }),
    );

  return {
    data,

    page:
      safePage,

    pageSize:
      safePageSize,

    total,

    totalPages:
      Math.max(
        1,
        Math.ceil(
          total /
            safePageSize,
        ),
      ),
  };
}

/* -------------------------------------------------------------------------- */
/*                    SINGLE ACADEMIC WEIGHTING                                */
/* -------------------------------------------------------------------------- */

export async function getAcademicWeightingById(
  weightingId: number,
) {
  await requireAcademicWeightingAdmin();

  return prisma.academicWeighting.findUnique({
    where: {
      id: weightingId,
    },

    select: {
      id: true,
      academicYear: true,

      termId: true,
      gradeId: true,
      gradingScaleId: true,

      assignmentWeight: true,
      assessmentWeight: true,
      examWeight: true,

      assessmentScoreStrategy:
        true,

      passMark: true,
      isActive: true,

      createdAt: true,
      updatedAt: true,

      term: {
        select: {
          id: true,
          name: true,
          isActive: true,
          startDate: true,
          endDate: true,
        },
      },

      grade: {
        select: {
          id: true,
          level: true,
        },
      },

      gradingScale: {
        select: {
          id: true,
          name: true,
          status: true,
          isDefault: true,

          boundaries: {
            select: {
              id: true,
              grade: true,

              minimumScore: true,
              maximumScore: true,

              remark: true,
              gradePoint: true,

              position: true,
            },

            orderBy: {
              position: "asc",
            },
          },
        },
      },
    },
  });
}

/* -------------------------------------------------------------------------- */
/*                    ACADEMIC WEIGHTING EDITOR DATA                           */
/* -------------------------------------------------------------------------- */

export async function getAcademicWeightingEditorData(
  weightingId: number,
): Promise<AcademicWeightingInput | null> {
  const weighting =
    await getAcademicWeightingById(
      weightingId,
    );

  if (!weighting) {
    return null;
  }

  return {
    id:
      weighting.id,

    academicYear:
      weighting.academicYear,

    termId:
      weighting.termId,

    gradeId:
      weighting.gradeId,

    gradingScaleId:
      weighting.gradingScaleId,

    assignmentWeight:
      weighting.assignmentWeight,

    assessmentWeight:
      weighting.assessmentWeight,

    examWeight:
      weighting.examWeight,

    assessmentScoreStrategy:
      weighting.assessmentScoreStrategy,

    passMark:
      weighting.passMark,

    isActive:
      weighting.isActive,
  };
}

/* -------------------------------------------------------------------------- */
/*                       ACADEMIC WEIGHTING METRICS                            */
/* -------------------------------------------------------------------------- */

export async function getAcademicWeightingMetrics(): Promise<AcademicWeightingMetrics> {
  await requireAcademicWeightingAdmin();

  const [
    total,
    active,
    inactive,
    gradeRecords,
    yearRecords,
    passMarkAggregate,
  ] = await Promise.all([
    prisma.academicWeighting.count(),

    prisma.academicWeighting.count({
      where: {
        isActive: true,
      },
    }),

    prisma.academicWeighting.count({
      where: {
        isActive: false,
      },
    }),

    prisma.academicWeighting.findMany({
      select: {
        gradeId: true,
      },

      distinct: [
        "gradeId",
      ],
    }),

    prisma.academicWeighting.findMany({
      select: {
        academicYear: true,
      },

      distinct: [
        "academicYear",
      ],
    }),

    prisma.academicWeighting.aggregate({
      _avg: {
        passMark: true,
      },
    }),
  ]);

  return {
    total,
    active,
    inactive,

    gradesConfigured:
      gradeRecords.length,

    academicYearsConfigured:
      yearRecords.length,

    averagePassMark:
      passMarkAggregate._avg
        .passMark === null
        ? null
        : Number(
            passMarkAggregate._avg
              .passMark.toFixed(1),
          ),
  };
}