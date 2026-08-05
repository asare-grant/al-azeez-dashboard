"use server";

import { 
    Prisma, 
    type GradingScaleStatus 
} from "@prisma/client";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

import {
  academicWeightingFailure,
  academicWeightingSuccess,
} from "./action-result";

import { requireAcademicWeightingAdmin } from "./auth";

import {
  gradingScaleIdSchema,
  gradingScaleSchema,
  gradingScaleStatusActionSchema,
} from "./validation";

import { normalizeGradeBoundaries } from "./utils";

import {
  ACADEMIC_WEIGHTING_LIST_PATH,
  GRADING_SCALE_LIST_PATH,
  gradingScaleDetailsPath,
  gradingScaleEditPath,
} from "./paths";

import type { AcademicWeightingActionResult, GradingScaleInput } from "./types";

type GradingScaleMutationResult = {
  gradingScaleId: number;
  updatedAt: Date;
};

type GradingScaleStatusResult = {
  gradingScaleId: number;
  status: GradingScaleStatus;
  isDefault: boolean;
  updatedAt: Date;
};

type GradingScaleDeleteResult = {
  gradingScaleId: number;
};

function revalidateGradingScalePaths(gradingScaleId?: number) {
  revalidatePath(GRADING_SCALE_LIST_PATH);

  revalidatePath(ACADEMIC_WEIGHTING_LIST_PATH);

  if (gradingScaleId) {
    revalidatePath(gradingScaleDetailsPath(gradingScaleId));

    revalidatePath(gradingScaleEditPath(gradingScaleId));
  }
}

function getGradingScaleErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A grading scale with this name already exists.";
    }

    if (error.code === "P2003") {
      return "This grading scale is currently referenced by another academic record.";
    }

    if (error.code === "P2025") {
      return "The selected grading scale could not be found.";
    }

    if (error.code === "P2034") {
      return "The grading scale was updated by another request. Please try again.";
    }
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHENTICATED") {
      return "You must sign in before managing grading scales.";
    }

    if (error.message === "UNAUTHORISED") {
      return "Only administrators may manage grading scales.";
    }
  }

  return "The grading-scale operation could not be completed.";
}

/* -------------------------------------------------------------------------- */
/*                         CREATE GRADING SCALE                                */
/* -------------------------------------------------------------------------- */

export async function createGradingScale(
  input: GradingScaleInput,
): Promise<AcademicWeightingActionResult<GradingScaleMutationResult>> {
  try {
    const parsed = gradingScaleSchema.safeParse(input);

    if (!parsed.success) {
      return academicWeightingFailure(
        "Review the grading-scale details.",
        parsed.error.flatten().fieldErrors,
      );
    }

    await requireAcademicWeightingAdmin();

    const data = parsed.data;

    const boundaries = normalizeGradeBoundaries(data.boundaries);

    const gradingScale = await prisma.$transaction(
      async (tx) => {
        /*
         * A draft may be created without
         * becoming the school default.
         *
         * Any default scale must be active.
         */
        if (data.isDefault && data.status !== "ACTIVE") {
          throw new Error("DEFAULT_SCALE_MUST_BE_ACTIVE");
        }

        if (data.isDefault) {
          await tx.gradingScale.updateMany({
            where: {
              isDefault: true,
            },

            data: {
              isDefault: false,
            },
          });
        }

        return tx.gradingScale.create({
          data: {
            name: data.name.trim(),

            description: data.description?.trim() || null,

            status: data.status,

            isDefault: data.isDefault,

            boundaries: {
              create: boundaries.map((boundary, index) => ({
                grade: boundary.grade,

                minimumScore: boundary.minimumScore,

                maximumScore: boundary.maximumScore,

                remark: boundary.remark,

                gradePoint: boundary.gradePoint ?? null,

                position: index,
              })),
            },
          },

          select: {
            id: true,
            updatedAt: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateGradingScalePaths(gradingScale.id);

    return academicWeightingSuccess("Grading scale created successfully.", {
      gradingScaleId: gradingScale.id,

      updatedAt: gradingScale.updatedAt,
    });
  } catch (error) {
    console.error("CREATE GRADING SCALE ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "DEFAULT_SCALE_MUST_BE_ACTIVE"
    ) {
      return academicWeightingFailure(
        "Only an active grading scale can be selected as the school default.",
      );
    }

    return academicWeightingFailure(getGradingScaleErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                         UPDATE GRADING SCALE                                */
/* -------------------------------------------------------------------------- */

export async function updateGradingScale(
  input: GradingScaleInput,
): Promise<AcademicWeightingActionResult<GradingScaleMutationResult>> {
  try {
    const parsed = gradingScaleSchema.safeParse(input);

    if (!parsed.success) {
      return academicWeightingFailure(
        "Review the grading-scale details.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const data = parsed.data;

    if (!data.id) {
      return academicWeightingFailure(
        "The grading scale must be saved before it can be updated.",
      );
    }

    await requireAcademicWeightingAdmin();

    const boundaries = normalizeGradeBoundaries(data.boundaries);

    const gradingScale = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.gradingScale.findUnique({
          where: {
            id: data.id,
          },

          select: {
            id: true,
            status: true,
            isDefault: true,

            _count: {
              select: {
                academicWeightings: true,
              },
            },
          },
        });

        if (!existing) {
          throw new Error("GRADING_SCALE_NOT_FOUND");
        }

        if (data.isDefault && data.status !== "ACTIVE") {
          throw new Error("DEFAULT_SCALE_MUST_BE_ACTIVE");
        }

        /*
         * A scale currently used by academic
         * weightings may still be updated, but it
         * cannot be archived through this general
         * edit operation.
         */
        if (
          existing._count.academicWeightings > 0 &&
          data.status === "ARCHIVED"
        ) {
          throw new Error("USED_SCALE_CANNOT_BE_ARCHIVED");
        }

        if (data.isDefault) {
          await tx.gradingScale.updateMany({
            where: {
              isDefault: true,

              id: {
                not: data.id,
              },
            },

            data: {
              isDefault: false,
            },
          });
        }

        /*
         * Replace boundaries as one atomic unit.
         * Either the complete scale is updated or
         * no part of it changes.
         */
        await tx.gradeBoundary.deleteMany({
          where: {
            gradingScaleId: data.id,
          },
        });

        return tx.gradingScale.update({
          where: {
            id: data.id,
          },

          data: {
            name: data.name.trim(),

            description: data.description?.trim() || null,

            status: data.status,

            isDefault: data.isDefault,

            boundaries: {
              create: boundaries.map((boundary, index) => ({
                grade: boundary.grade,

                minimumScore: boundary.minimumScore,

                maximumScore: boundary.maximumScore,

                remark: boundary.remark,

                gradePoint: boundary.gradePoint ?? null,

                position: index,
              })),
            },
          },

          select: {
            id: true,
            updatedAt: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateGradingScalePaths(gradingScale.id);

    return academicWeightingSuccess("Grading scale updated successfully.", {
      gradingScaleId: gradingScale.id,

      updatedAt: gradingScale.updatedAt,
    });
  } catch (error) {
    console.error("UPDATE GRADING SCALE ERROR:", error);

    if (
        error instanceof Error && error.message === "GRADING_SCALE_NOT_FOUND"
    ) {
      return academicWeightingFailure(
        "The selected grading scale could not be found.",
      );
    }

    if (
      error instanceof Error &&
      error.message === "DEFAULT_SCALE_MUST_BE_ACTIVE"
    ) {
      return academicWeightingFailure(
        "Only an active grading scale can be selected as the school default.",
      );
    }

    if (
      error instanceof Error &&
      error.message === "USED_SCALE_CANNOT_BE_ARCHIVED"
    ) {
      return academicWeightingFailure(
        "This grading scale is already used by academic weightings and cannot be archived.",
      );
    }

    return academicWeightingFailure(getGradingScaleErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                    ACTIVATE OR ARCHIVE GRADING SCALE                        */
/* -------------------------------------------------------------------------- */

export async function changeGradingScaleStatus(input: {
  id: number;
  status: "ACTIVE" | "ARCHIVED";
}): Promise<AcademicWeightingActionResult<GradingScaleStatusResult>> {
  try {
    const parsed = gradingScaleStatusActionSchema.safeParse(input);

    if (!parsed.success) {
      return academicWeightingFailure(
        "The grading-scale status request is invalid.",
        parsed.error.flatten().fieldErrors,
      );
    }

    await requireAcademicWeightingAdmin();

    const result = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.gradingScale.findUnique({
          where: {
            id: parsed.data.id,
          },

          select: {
            id: true,
            status: true,
            isDefault: true,

            _count: {
              select: {
                boundaries: true,
                academicWeightings: true,
              },
            },
          },
        });

        if (!existing) {
          throw new Error("GRADING_SCALE_NOT_FOUND");
        }

        if (
          parsed.data.status === "ACTIVE" &&
          existing._count.boundaries === 0
        ) {
          throw new Error("ACTIVE_SCALE_REQUIRES_BOUNDARIES");
        }

        if (
          parsed.data.status === "ARCHIVED" &&
          existing._count.academicWeightings > 0
        ) {
          throw new Error("USED_SCALE_CANNOT_BE_ARCHIVED");
        }

        const shouldRemoveDefault = parsed.data.status === "ARCHIVED";

        return tx.gradingScale.update({
          where: {
            id: parsed.data.id,
          },

          data: {
            status: parsed.data.status,

            ...(shouldRemoveDefault
              ? {
                  isDefault: false,
                }
              : {}),
          },

          select: {
            id: true,
            status: true,
            isDefault: true,
            updatedAt: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateGradingScalePaths(result.id);

    return academicWeightingSuccess(
      result.status === "ACTIVE"
        ? "Grading scale activated."
        : "Grading scale archived.",
      {
        gradingScaleId: result.id,

        status: result.status,

        isDefault: result.isDefault,

        updatedAt: result.updatedAt,
      },
    );
  } catch (error) {
    console.error("CHANGE GRADING SCALE STATUS ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "GRADING_SCALE_NOT_FOUND") {
        return academicWeightingFailure(
          "The selected grading scale could not be found.",
        );
      }

      if (error.message === "ACTIVE_SCALE_REQUIRES_BOUNDARIES") {
        return academicWeightingFailure(
          "A grading scale must contain grade boundaries before it can be activated.",
        );
      }

      if (error.message === "USED_SCALE_CANNOT_BE_ARCHIVED") {
        return academicWeightingFailure(
          "This grading scale is used by academic weightings and cannot be archived.",
        );
      }
    }

    return academicWeightingFailure(getGradingScaleErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                        SET SCHOOL DEFAULT SCALE                             */
/* -------------------------------------------------------------------------- */

export async function setDefaultGradingScale(input: {
  id: number;
}): Promise<AcademicWeightingActionResult<GradingScaleStatusResult>> {
  try {
    const parsed = gradingScaleIdSchema.safeParse(input);

    if (!parsed.success) {
      return academicWeightingFailure(
        "Select a valid grading scale.",
        parsed.error.flatten().fieldErrors,
      );
    }

    await requireAcademicWeightingAdmin();

    const result = await prisma.$transaction(
      async (tx) => {
        const scale = await tx.gradingScale.findUnique({
          where: {
            id: parsed.data.id,
          },

          select: {
            id: true,
            status: true,
            isDefault: true,

            _count: {
              select: {
                boundaries: true,
              },
            },
          },
        });

        if (!scale) {
          throw new Error("GRADING_SCALE_NOT_FOUND");
        }

        if (scale.status !== "ACTIVE") {
          throw new Error("DEFAULT_SCALE_MUST_BE_ACTIVE");
        }

        if (scale._count.boundaries === 0) {
          throw new Error("DEFAULT_SCALE_REQUIRES_BOUNDARIES");
        }

        await tx.gradingScale.updateMany({
          where: {
            isDefault: true,

            id: {
              not: scale.id,
            },
          },

          data: {
            isDefault: false,
          },
        });

        return tx.gradingScale.update({
          where: {
            id: scale.id,
          },

          data: {
            isDefault: true,
          },

          select: {
            id: true,
            status: true,
            isDefault: true,
            updatedAt: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateGradingScalePaths(result.id);

    return academicWeightingSuccess("Default grading scale updated.", {
      gradingScaleId: result.id,

      status: result.status,

      isDefault: result.isDefault,

      updatedAt: result.updatedAt,
    });
  } catch (error) {
    console.error("SET DEFAULT GRADING SCALE ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "GRADING_SCALE_NOT_FOUND") {
        return academicWeightingFailure(
          "The selected grading scale could not be found.",
        );
      }

      if (error.message === "DEFAULT_SCALE_MUST_BE_ACTIVE") {
        return academicWeightingFailure(
          "Only an active grading scale can be selected as the school default.",
        );
      }

      if (error.message === "DEFAULT_SCALE_REQUIRES_BOUNDARIES") {
        return academicWeightingFailure(
          "The grading scale must contain grade boundaries before becoming the school default.",
        );
      }
    }

    return academicWeightingFailure(getGradingScaleErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                          DELETE GRADING SCALE                               */
/* -------------------------------------------------------------------------- */

export async function deleteGradingScale(input: {
  id: number;
}): Promise<AcademicWeightingActionResult<GradingScaleDeleteResult>> {
  try {
    const parsed = gradingScaleIdSchema.safeParse(input);

    if (!parsed.success) {
      return academicWeightingFailure(
        "Select a valid grading scale.",
        parsed.error.flatten().fieldErrors,
      );
    }

    await requireAcademicWeightingAdmin();

    const deleted = await prisma.$transaction(
      async (tx) => {
        const scale = await tx.gradingScale.findUnique({
          where: {
            id: parsed.data.id,
          },

          select: {
            id: true,
            name: true,
            isDefault: true,

            _count: {
              select: {
                academicWeightings: true,
              },
            },
          },
        });

        if (!scale) {
          throw new Error("GRADING_SCALE_NOT_FOUND");
        }

        if (scale._count.academicWeightings > 0) {
          throw new Error("GRADING_SCALE_IN_USE");
        }

        if (scale.isDefault) {
          throw new Error("DEFAULT_SCALE_CANNOT_BE_DELETED");
        }

        /*
         * GradeBoundary rows are deleted by
         * the cascade relation configured in
         * the Prisma schema.
         */
        return tx.gradingScale.delete({
          where: {
            id: scale.id,
          },

          select: {
            id: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidateGradingScalePaths();

    return academicWeightingSuccess("Grading scale deleted.", {
      gradingScaleId: deleted.id,
    });
  } catch (error) {
    console.error("DELETE GRADING SCALE ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "GRADING_SCALE_NOT_FOUND") {
        return academicWeightingFailure(
          "The selected grading scale could not be found.",
        );
      }

      if (error.message === "GRADING_SCALE_IN_USE") {
        return academicWeightingFailure(
          "This grading scale cannot be deleted because one or more academic weightings use it.",
        );
      }

      if (error.message === "DEFAULT_SCALE_CANNOT_BE_DELETED") {
        return academicWeightingFailure(
          "The school default grading scale cannot be deleted. Select another default scale first.",
        );
      }
    }

    return academicWeightingFailure(getGradingScaleErrorMessage(error));
  }
}



/* -------------------------------------------------------------------------- */
/*                       CREATE ACADEMIC WEIGHTING                             */
/* -------------------------------------------------------------------------- */

import {
  academicWeightingIdSchema,
  academicWeightingSchema,
  academicWeightingStatusSchema,
} from "./validation";

import {
  academicWeightingEditPath,
} from "./paths";

import type {
  AcademicWeightingDeleteResult,
  AcademicWeightingInput,
  AcademicWeightingMutationResult,
  AcademicWeightingStatusResult,
} from "./types";

function revalidateAcademicWeightingPaths(
  weightingId?: number,
) {
  revalidatePath(
    ACADEMIC_WEIGHTING_LIST_PATH,
  );

  revalidatePath(
    "/list/results/manage",
  );

  revalidatePath(
    "/list/report-cards",
  );

  if (weightingId) {
    revalidatePath(
      academicWeightingEditPath(
        weightingId,
      ),
    );
  }
}

function getAcademicWeightingErrorMessage(
  error: unknown,
) {
  if (
    error instanceof
    Prisma.PrismaClientKnownRequestError
  ) {
    if (error.code === "P2002") {
      return "A weighting already exists for this academic year, term and grade.";
    }

    if (error.code === "P2003") {
      return "A selected term, grade or grading scale is invalid.";
    }

    if (error.code === "P2025") {
      return "The selected academic weighting could not be found.";
    }

    if (error.code === "P2034") {
      return "Another request changed this weighting. Please try again.";
    }
  }

  if (error instanceof Error) {
    if (
      error.message ===
      "UNAUTHENTICATED"
    ) {
      return "You must sign in before managing academic weightings.";
    }

    if (
      error.message ===
      "UNAUTHORISED"
    ) {
      return "Only administrators may manage academic weightings.";
    }

    if (
      error.message ===
      "TERM_NOT_FOUND"
    ) {
      return "The selected school term could not be found.";
    }

    if (
      error.message ===
      "GRADE_NOT_FOUND"
    ) {
      return "The selected grade could not be found.";
    }

    if (
      error.message ===
      "GRADING_SCALE_NOT_ACTIVE"
    ) {
      return "Select an active grading scale.";
    }

    if (
      error.message ===
      "WEIGHTING_NOT_FOUND"
    ) {
      return "The selected academic weighting could not be found.";
    }
  }

  return "The academic-weighting operation could not be completed.";
}

async function validateWeightingRelations(
  tx: Prisma.TransactionClient,
  {
    termId,
    gradeId,
    gradingScaleId,
  }: {
    termId: number;
    gradeId: number;
    gradingScaleId: number;
  },
) {
  const [
    term,
    grade,
    gradingScale,
  ] = await Promise.all([
    tx.schoolTerm.findUnique({
      where: {
        id: termId,
      },

      select: {
        id: true,
      },
    }),

    tx.grade.findUnique({
      where: {
        id: gradeId,
      },

      select: {
        id: true,
      },
    }),

    tx.gradingScale.findUnique({
      where: {
        id: gradingScaleId,
      },

      select: {
        id: true,
        status: true,

        _count: {
          select: {
            boundaries: true,
          },
        },
      },
    }),
  ]);

  if (!term) {
    throw new Error(
      "TERM_NOT_FOUND",
    );
  }

  if (!grade) {
    throw new Error(
      "GRADE_NOT_FOUND",
    );
  }

  if (
    !gradingScale ||
    gradingScale.status !==
      "ACTIVE" ||
    gradingScale._count
      .boundaries === 0
  ) {
    throw new Error(
      "GRADING_SCALE_NOT_ACTIVE",
    );
  }
}

export async function createAcademicWeighting(
  input: AcademicWeightingInput,
): Promise<
  AcademicWeightingActionResult<AcademicWeightingMutationResult>
> {
  try {
    const parsed =
      academicWeightingSchema.safeParse(
        input,
      );

    if (!parsed.success) {
      return academicWeightingFailure(
        "Review the academic-weighting details.",
        parsed.error.flatten()
          .fieldErrors,
      );
    }

    await requireAcademicWeightingAdmin();

    const data =
      parsed.data;

    const weighting =
      await prisma.$transaction(
        async (tx) => {
          await validateWeightingRelations(
            tx,
            {
              termId:
                data.termId,

              gradeId:
                data.gradeId,

              gradingScaleId:
                data.gradingScaleId,
            },
          );

          return tx.academicWeighting.create({
            data: {
              academicYear:
                data.academicYear,

              termId:
                data.termId,

              gradeId:
                data.gradeId,

              gradingScaleId:
                data.gradingScaleId,

              assignmentWeight:
                data.assignmentWeight,

              assessmentWeight:
                data.assessmentWeight,

              examWeight:
                data.examWeight,

              assessmentScoreStrategy:
                data.assessmentScoreStrategy,

              passMark:
                data.passMark,

              isActive:
                data.isActive,
            },

            select: {
              id: true,
              updatedAt: true,
            },
          });
        },
        {
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,

          maxWait: 5_000,
          timeout: 10_000,
        },
      );

    revalidateAcademicWeightingPaths(
      weighting.id,
    );

    return academicWeightingSuccess(
      "Academic weighting created successfully.",
      {
        weightingId:
          weighting.id,

        updatedAt:
          weighting.updatedAt,
      },
    );
  } catch (error) {
    console.error(
      "CREATE ACADEMIC WEIGHTING ERROR:",
      error,
    );

    return academicWeightingFailure(
      getAcademicWeightingErrorMessage(
        error,
      ),
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                       UPDATE ACADEMIC WEIGHTING                             */
/* -------------------------------------------------------------------------- */

export async function updateAcademicWeighting(
  input: AcademicWeightingInput,
): Promise<
  AcademicWeightingActionResult<AcademicWeightingMutationResult>
> {
  try {
    const parsed =
      academicWeightingSchema.safeParse(
        input,
      );

    if (!parsed.success) {
      return academicWeightingFailure(
        "Review the academic-weighting details.",
        parsed.error.flatten()
          .fieldErrors,
      );
    }

    if (!parsed.data.id) {
      return academicWeightingFailure(
        "The academic weighting must be saved before it can be updated.",
      );
    }

    await requireAcademicWeightingAdmin();

    const data =
      parsed.data;

    const weighting =
      await prisma.$transaction(
        async (tx) => {
          const existing =
            await tx.academicWeighting.findUnique({
              where: {
                id: data.id,
              },

              select: {
                id: true,
              },
            });

          if (!existing) {
            throw new Error(
              "WEIGHTING_NOT_FOUND",
            );
          }

          await validateWeightingRelations(
            tx,
            {
              termId:
                data.termId,

              gradeId:
                data.gradeId,

              gradingScaleId:
                data.gradingScaleId,
            },
          );

          return tx.academicWeighting.update({
            where: {
              id: data.id,
            },

            data: {
              academicYear:
                data.academicYear,

              termId:
                data.termId,

              gradeId:
                data.gradeId,

              gradingScaleId:
                data.gradingScaleId,

              assignmentWeight:
                data.assignmentWeight,

              assessmentWeight:
                data.assessmentWeight,

              examWeight:
                data.examWeight,

              assessmentScoreStrategy:
                data.assessmentScoreStrategy,

              passMark:
                data.passMark,

              isActive:
                data.isActive,
            },

            select: {
              id: true,
              updatedAt: true,
            },
          });
        },
        {
          isolationLevel:
            Prisma
              .TransactionIsolationLevel
              .Serializable,

          maxWait: 5_000,
          timeout: 10_000,
        },
      );

    revalidateAcademicWeightingPaths(
      weighting.id,
    );

    return academicWeightingSuccess(
      "Academic weighting updated successfully.",
      {
        weightingId:
          weighting.id,

        updatedAt:
          weighting.updatedAt,
      },
    );
  } catch (error) {
    console.error(
      "UPDATE ACADEMIC WEIGHTING ERROR:",
      error,
    );

    return academicWeightingFailure(
      getAcademicWeightingErrorMessage(
        error,
      ),
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                  ACTIVATE OR DEACTIVATE WEIGHTING                           */
/* -------------------------------------------------------------------------- */

export async function changeAcademicWeightingStatus(
  input: {
    id: number;
    isActive: boolean;
  },
): Promise<
  AcademicWeightingActionResult<AcademicWeightingStatusResult>
> {
  try {
    const parsed =
      academicWeightingStatusSchema.safeParse(
        input,
      );

    if (!parsed.success) {
      return academicWeightingFailure(
        "The weighting status request is invalid.",
        parsed.error.flatten()
          .fieldErrors,
      );
    }

    await requireAcademicWeightingAdmin();

    const updated =
      await prisma.academicWeighting.update({
        where: {
          id: parsed.data.id,
        },

        data: {
          isActive:
            parsed.data.isActive,
        },

        select: {
          id: true,
          isActive: true,
          updatedAt: true,
        },
      });

    revalidateAcademicWeightingPaths(
      updated.id,
    );

    return academicWeightingSuccess(
      updated.isActive
        ? "Academic weighting activated."
        : "Academic weighting deactivated.",
      {
        weightingId:
          updated.id,

        isActive:
          updated.isActive,

        updatedAt:
          updated.updatedAt,
      },
    );
  } catch (error) {
    console.error(
      "CHANGE ACADEMIC WEIGHTING STATUS ERROR:",
      error,
    );

    return academicWeightingFailure(
      getAcademicWeightingErrorMessage(
        error,
      ),
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                         DELETE ACADEMIC WEIGHTING                           */
/* -------------------------------------------------------------------------- */

export async function deleteAcademicWeighting(
  input: {
    id: number;
  },
): Promise<
  AcademicWeightingActionResult<AcademicWeightingDeleteResult>
> {
  try {
    const parsed =
      academicWeightingIdSchema.safeParse(
        input,
      );

    if (!parsed.success) {
      return academicWeightingFailure(
        "Select a valid academic weighting.",
        parsed.error.flatten()
          .fieldErrors,
      );
    }

    await requireAcademicWeightingAdmin();

    const deleted =
      await prisma.academicWeighting.delete({
        where: {
          id: parsed.data.id,
        },

        select: {
          id: true,
        },
      });

    revalidateAcademicWeightingPaths();

    return academicWeightingSuccess(
      "Academic weighting deleted.",
      {
        weightingId:
          deleted.id,
      },
    );
  } catch (error) {
    console.error(
      "DELETE ACADEMIC WEIGHTING ERROR:",
      error,
    );

    return academicWeightingFailure(
      getAcademicWeightingErrorMessage(
        error,
      ),
    );
  }
}