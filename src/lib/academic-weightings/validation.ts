// src/lib/academic-weightings/validation.ts

import { z } from "zod";

import {
  AssessmentScoreStrategy,
  GradingScaleStatus,
} from "@prisma/client";

import {
  ACADEMIC_WEIGHTING_LIMITS,
} from "./constants";

/* -------------------------------------------------------------------------- */
/*                             SHARED SCHEMAS                                  */
/* -------------------------------------------------------------------------- */

const percentageSchema = z.coerce
  .number({
    error:
      "Enter a valid percentage.",
  })
  .finite(
    "The percentage must be a finite number.",
  )
  .min(
    ACADEMIC_WEIGHTING_LIMITS.MIN_WEIGHT,
    "The percentage cannot be below 0.",
  )
  .max(
    ACADEMIC_WEIGHTING_LIMITS.MAX_WEIGHT,
    "The percentage cannot exceed 100.",
  );

const scoreSchema = z.coerce
  .number({
    error:
      "Enter a valid score.",
  })
  .finite(
    "The score must be a finite number.",
  )
  .min(
    ACADEMIC_WEIGHTING_LIMITS.MIN_SCORE,
    "The score cannot be below 0.",
  )
  .max(
    ACADEMIC_WEIGHTING_LIMITS.MAX_SCORE,
    "The score cannot exceed 100.",
  );

const optionalIdSchema = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === undefined ||
      value === null
    ) {
      return undefined;
    }

    return value;
  },
  z.coerce
    .number()
    .int()
    .positive()
    .optional(),
);

const requiredIdSchema = (
  message: string,
) =>
  z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === undefined ||
        value === null
      ) {
        return undefined;
      }

      return value;
    },
    z.coerce
      .number({
        error: message,
      })
      .int(message)
      .positive(message),
  );

export const academicYearSchema = z
  .string()
  .trim()
  .min(
    1,
    "Academic year is required.",
  )
  .max(
    ACADEMIC_WEIGHTING_LIMITS
      .ACADEMIC_YEAR_MAX_LENGTH,
    "Academic year is too long.",
  )
  .regex(
    /^\d{4}\/\d{4}$/,
    "Use the format 2026/2027.",
  )
  .refine(
    (value) => {
      const [
        startYear,
        endYear,
      ] = value
        .split("/")
        .map(Number);

      return (
        Number.isInteger(startYear) &&
        Number.isInteger(endYear) &&
        endYear === startYear + 1
      );
    },
    {
      message:
        "The ending year must be one year after the starting year.",
    },
  );

/* -------------------------------------------------------------------------- */
/*                           GRADE BOUNDARY                                    */
/* -------------------------------------------------------------------------- */

export const gradeBoundarySchema =
  z
    .object({
      id: optionalIdSchema,

      grade: z
        .string()
        .trim()
        .min(
          1,
          "Grade label is required.",
        )
        .max(
          20,
          "Grade label is too long.",
        ),

      minimumScore: scoreSchema,

      maximumScore: scoreSchema,

      remark: z
        .string()
        .trim()
        .min(
          1,
          "Grade remark is required.",
        )
        .max(
          200,
          "Grade remark is too long.",
        ),

      gradePoint: z.preprocess(
        (value) => {
          if (
            value === "" ||
            value === undefined ||
            value === null
          ) {
            return null;
          }

          return value;
        },
        z.coerce
          .number()
          .finite()
          .min(
            0,
            "Grade point cannot be negative.",
          )
          .max(
            100,
            "Grade point is too large.",
          )
          .nullable(),
      ),

      position: z.coerce
        .number()
        .int()
        .min(
          0,
          "Position cannot be negative.",
        ),
    })
    .refine(
      (boundary) =>
        boundary.minimumScore <=
        boundary.maximumScore,
      {
        message:
          "Minimum score cannot be greater than maximum score.",
        path: ["maximumScore"],
      },
    );

export type GradeBoundarySchema =
  z.infer<
    typeof gradeBoundarySchema
  >;

/* -------------------------------------------------------------------------- */
/*                            GRADING SCALE                                    */
/* -------------------------------------------------------------------------- */

export const gradingScaleSchema =
  z
    .object({
      id: optionalIdSchema,

      name: z
        .string()
        .trim()
        .min(
          3,
          "Grading-scale name must contain at least three characters.",
        )
        .max(
          100,
          "Grading-scale name is too long.",
        ),

      description: z.preprocess(
        (value) => {
          if (
            value === "" ||
            value === undefined ||
            value === null
          ) {
            return null;
          }

          return value;
        },
        z
          .string()
          .trim()
          .max(
            1000,
            "Description is too long.",
          )
          .nullable(),
      ),

      status: z.nativeEnum(
        GradingScaleStatus,
      ),

      isDefault: z.coerce
        .boolean(),

      boundaries: z
        .array(
          gradeBoundarySchema,
        )
        .min(
          ACADEMIC_WEIGHTING_LIMITS
            .MIN_BOUNDARIES,
          "Add at least one grade boundary.",
        )
        .max(
          ACADEMIC_WEIGHTING_LIMITS
            .MAX_BOUNDARIES,
          `A grading scale cannot contain more than ${ACADEMIC_WEIGHTING_LIMITS.MAX_BOUNDARIES} boundaries.`,
        ),
    })
    .superRefine(
      (
        data,
        context,
      ) => {
        const normalizedLabels =
          data.boundaries.map(
            (boundary) =>
              boundary.grade
                .trim()
                .toLowerCase(),
          );

        if (
          new Set(
            normalizedLabels,
          ).size !==
          normalizedLabels.length
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path:
              ["boundaries"],

            message:
              "Grade labels must be unique.",
          });
        }

        const positions =
          data.boundaries.map(
            (boundary) =>
              boundary.position,
          );

        if (
          new Set(positions).size !==
          positions.length
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path:
              ["boundaries"],

            message:
              "Each grade boundary must have a unique position.",
          });
        }

        const orderedBoundaries =
          [...data.boundaries].sort(
            (
              first,
              second,
            ) =>
              first.minimumScore -
              second.minimumScore,
          );

        const firstBoundary =
          orderedBoundaries[0];

        const lastBoundary =
          orderedBoundaries[
            orderedBoundaries.length -
              1
          ];

        if (
          firstBoundary &&
          Math.abs(
            firstBoundary.minimumScore -
              ACADEMIC_WEIGHTING_LIMITS
                .MIN_SCORE,
          ) >
            ACADEMIC_WEIGHTING_LIMITS
              .WEIGHT_TOLERANCE
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path:
              ["boundaries"],

            message:
              "The grading scale must begin at 0.",
          });
        }

        if (
          lastBoundary &&
          Math.abs(
            lastBoundary.maximumScore -
              ACADEMIC_WEIGHTING_LIMITS
                .MAX_SCORE,
          ) >
            ACADEMIC_WEIGHTING_LIMITS
              .WEIGHT_TOLERANCE
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path:
              ["boundaries"],

            message:
              "The grading scale must end at 100.",
          });
        }

        for (
          let index = 1;
          index <
          orderedBoundaries.length;
          index++
        ) {
          const previous =
            orderedBoundaries[
              index - 1
            ];

          const current =
            orderedBoundaries[
              index
            ];

          /*
           * Boundaries such as 0–39 and 40–49
           * are valid. Decimal scales such as
           * 0–39.99 and 40–49.99 are also valid.
           */
          if (
            current.minimumScore <=
            previous.maximumScore
          ) {
            context.addIssue({
              code:
                z.ZodIssueCode
                  .custom,

              path: [
                "boundaries",
                index,
                "minimumScore",
              ],

              message:
                `The ${current.grade} boundary overlaps with ${previous.grade}.`,
            });
          }

          const gap =
            current.minimumScore -
            previous.maximumScore;

          if (
            gap >
            1.01
          ) {
            context.addIssue({
              code:
                z.ZodIssueCode
                  .custom,

              path: [
                "boundaries",
                index,
                "minimumScore",
              ],

              message:
                `There is a score gap between ${previous.grade} and ${current.grade}.`,
            });
          }
        }

        if (
          data.status ===
            "ACTIVE" &&
          data.boundaries.length ===
            0
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: ["status"],

            message:
              "An active grading scale must contain grade boundaries.",
          });
        }
      },
    );

export type GradingScaleSchema =
  z.infer<
    typeof gradingScaleSchema
  >;

/* -------------------------------------------------------------------------- */
/*                          ACADEMIC WEIGHTING                                 */
/* -------------------------------------------------------------------------- */

export const academicWeightingSchema =
  z
    .object({
      id: optionalIdSchema,

      academicYear:
        academicYearSchema,

      termId: requiredIdSchema(
        "Select an academic term.",
      ),

      gradeId: requiredIdSchema(
        "Select a grade.",
      ),

      gradingScaleId:
        requiredIdSchema(
          "Select a grading scale.",
        ),

      assignmentWeight:
        percentageSchema,

      assessmentWeight:
        percentageSchema,

      examWeight:
        percentageSchema,

      assessmentScoreStrategy:
        z.nativeEnum(
          AssessmentScoreStrategy,
        ),

      passMark:
        percentageSchema,

      isActive: z.coerce
        .boolean(),
    })
    .superRefine(
      (
        data,
        context,
      ) => {
        const totalWeight =
          data.assignmentWeight +
          data.assessmentWeight +
          data.examWeight;

        const difference =
          Math.abs(
            totalWeight -
              ACADEMIC_WEIGHTING_LIMITS
                .REQUIRED_TOTAL_WEIGHT,
          );

        if (
          difference >
          ACADEMIC_WEIGHTING_LIMITS
            .WEIGHT_TOLERANCE
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: [
              "examWeight",
            ],

            message:
              `Assignment, assessment and examination weights must total 100%. The current total is ${Number(
                totalWeight.toFixed(
                  2,
                ),
              )}%.`,
          });
        }

        if (
          data.assignmentWeight ===
            0 &&
          data.assessmentWeight ===
            0 &&
          data.examWeight === 0
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode
                .custom,

            path: [
              "assessmentWeight",
            ],

            message:
              "At least one academic result category must carry weight.",
          });
        }
      },
    );


    /* -------------------------------------------------------------------------- */
/*                         GRADING SCALE ACTIONS                               */
/* -------------------------------------------------------------------------- */

export const gradingScaleIdSchema =
  z.object({
    id: z.coerce
      .number({
        error:
          "Select a valid grading scale.",
      })
      .int(
        "Select a valid grading scale.",
      )
      .positive(
        "Select a valid grading scale.",
      ),
  });

export const gradingScaleStatusActionSchema =
  z.object({
    id: z.coerce
      .number({
        error:
          "Select a valid grading scale.",
      })
      .int()
      .positive(),

    status: z.enum([
      "ACTIVE",
      "ARCHIVED",
    ]),
  });

export type GradingScaleIdSchema =
  z.infer<
    typeof gradingScaleIdSchema
  >;

export type GradingScaleStatusActionSchema =
  z.infer<
    typeof gradingScaleStatusActionSchema
  >;

export type AcademicWeightingSchema =
  z.infer<
    typeof academicWeightingSchema
  >;



  /* -------------------------------------------------------------------------- */
/*                       ACADEMIC WEIGHTING ACTIONS                            */
/* -------------------------------------------------------------------------- */

export const academicWeightingIdSchema =
  z.object({
    id: z.coerce
      .number({
        error:
          "Select a valid academic weighting.",
      })
      .int(
        "Select a valid academic weighting.",
      )
      .positive(
        "Select a valid academic weighting.",
      ),
  });

export const academicWeightingStatusSchema =
  z.object({
    id: z.coerce
      .number({
        error:
          "Select a valid academic weighting.",
      })
      .int()
      .positive(),

    isActive: z.boolean(),
  });

export type AcademicWeightingIdSchema =
  z.infer<
    typeof academicWeightingIdSchema
  >;

export type AcademicWeightingStatusSchema =
  z.infer<
    typeof academicWeightingStatusSchema
  >;