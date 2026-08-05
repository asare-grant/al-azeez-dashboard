import {
  z,
} from "zod";

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

export const REPORT_CARD_REVIEW_LIMITS = {
  MAX_SCHOOL_DAYS: 365,

  MAX_CONDUCT_LENGTH: 100,
  MAX_ATTITUDE_LENGTH: 100,
  MAX_INTEREST_LENGTH: 100,

  MAX_TEACHER_REMARK_LENGTH: 500,
  MAX_HEAD_TEACHER_REMARK_LENGTH: 500,

  MAX_PROMOTION_STATUS_LENGTH: 150,

  MAX_REVIEW_NOTE_LENGTH: 1000,
} as const;

/* -------------------------------------------------------------------------- */
/*                            SHARED SCHEMAS                                  */
/* -------------------------------------------------------------------------- */

const reportCardIdSchema =
  z.coerce
    .number({
      error:
        "Select a valid report card.",
    })
    .int(
      "The report-card ID must be a whole number.",
    )
    .positive(
      "Select a valid report card.",
    );

const nullableSchoolDaySchema =
  z
    .union([
      z.coerce
        .number({
          error:
            "Enter a valid number of days.",
        })
        .int(
          "School days must be a whole number.",
        )
        .min(
          0,
          "School days cannot be negative.",
        )
        .max(
          REPORT_CARD_REVIEW_LIMITS
            .MAX_SCHOOL_DAYS,

          `School days cannot exceed ${REPORT_CARD_REVIEW_LIMITS.MAX_SCHOOL_DAYS}.`,
        ),

      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .transform((value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return value;
    });

const optionalTrimmedText = ({
  fieldName,
  maxLength,
}: {
  fieldName: string;
  maxLength: number;
}) =>
  z
    .string()
    .trim()
    .max(
      maxLength,
      `${fieldName} cannot exceed ${maxLength} characters.`,
    )
    .default("");

const optionalDateSchema =
  z
    .union([
      z.date(),

      z
        .string()
        .trim()
        .refine(
          (value) =>
            value === "" ||
            !Number.isNaN(
              new Date(
                value,
              ).getTime(),
            ),

          "Enter a valid date.",
        ),

      z.null(),
      z.undefined(),
    ])
    .transform((value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return null;
      }

      return value instanceof Date
        ? value
        : new Date(value);
    });

/* -------------------------------------------------------------------------- */
/*                    EDITABLE REPORT DETAILS SCHEMA                          */
/* -------------------------------------------------------------------------- */

export const reportCardDetailsSchema =
  z
    .object({
      reportCardId:
        reportCardIdSchema,

      daysSchoolOpened:
        nullableSchoolDaySchema,

      daysPresent:
        nullableSchoolDaySchema,

      conduct:
        optionalTrimmedText({
          fieldName:
            "Conduct",

          maxLength:
            REPORT_CARD_REVIEW_LIMITS
              .MAX_CONDUCT_LENGTH,
        }),

      attitude:
        optionalTrimmedText({
          fieldName:
            "Attitude",

          maxLength:
            REPORT_CARD_REVIEW_LIMITS
              .MAX_ATTITUDE_LENGTH,
        }),

      interest:
        optionalTrimmedText({
          fieldName:
            "Interest",

          maxLength:
            REPORT_CARD_REVIEW_LIMITS
              .MAX_INTEREST_LENGTH,
        }),

      classTeacherRemark:
        optionalTrimmedText({
          fieldName:
            "Class-teacher remark",

          maxLength:
            REPORT_CARD_REVIEW_LIMITS
              .MAX_TEACHER_REMARK_LENGTH,
        }),

      headTeacherRemark:
        optionalTrimmedText({
          fieldName:
            "Head-teacher remark",

          maxLength:
            REPORT_CARD_REVIEW_LIMITS
              .MAX_HEAD_TEACHER_REMARK_LENGTH,
        }),

      promotionStatus:
        optionalTrimmedText({
          fieldName:
            "Promotion status",

          maxLength:
            REPORT_CARD_REVIEW_LIMITS
              .MAX_PROMOTION_STATUS_LENGTH,
        }),

      termClosedOn:
        optionalDateSchema,

      nextTermBegins:
        optionalDateSchema,
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.daysSchoolOpened !==
            null &&
          value.daysPresent !==
            null &&
          value.daysPresent >
            value.daysSchoolOpened
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "daysPresent",
            ],

            message:
              "Days present cannot exceed the total days school opened.",
          });
        }

        if (
          value.termClosedOn &&
          value.nextTermBegins &&
          value.nextTermBegins <=
            value.termClosedOn
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "nextTermBegins",
            ],

            message:
              "The next term must begin after the current term closes.",
          });
        }
      },
    );

/* -------------------------------------------------------------------------- */
/*                         SUBMIT FOR REVIEW                                  */
/* -------------------------------------------------------------------------- */

export const submitReportCardForReviewSchema =
  z.object({
    reportCardId:
      reportCardIdSchema,

    note:
      optionalTrimmedText({
        fieldName:
          "Review note",

        maxLength:
          REPORT_CARD_REVIEW_LIMITS
            .MAX_REVIEW_NOTE_LENGTH,
      }).optional(),
  });

/* -------------------------------------------------------------------------- */
/*                         REQUEST CHANGES                                    */
/* -------------------------------------------------------------------------- */

export const requestReportCardChangesSchema =
  z.object({
    reportCardId:
      reportCardIdSchema,

    reviewNote:
      z
        .string()
        .trim()
        .min(
          5,
          "Explain the changes that are required.",
        )
        .max(
          REPORT_CARD_REVIEW_LIMITS
            .MAX_REVIEW_NOTE_LENGTH,

          `The review note cannot exceed ${REPORT_CARD_REVIEW_LIMITS.MAX_REVIEW_NOTE_LENGTH} characters.`,
        ),
  });

/* -------------------------------------------------------------------------- */
/*                              APPROVAL                                      */
/* -------------------------------------------------------------------------- */

export const approveReportCardSchema =
  z.object({
    reportCardId:
      reportCardIdSchema,

    reviewNote:
      optionalTrimmedText({
        fieldName:
          "Approval note",

        maxLength:
          REPORT_CARD_REVIEW_LIMITS
            .MAX_REVIEW_NOTE_LENGTH,
      }).optional(),
  });

/* -------------------------------------------------------------------------- */
/*                              REOPEN                                        */
/* -------------------------------------------------------------------------- */

export const reopenReportCardReviewSchema =
  z.object({
    reportCardId:
      reportCardIdSchema,

    reviewNote:
      z
        .string()
        .trim()
        .min(
          5,
          "Explain why this report card is being reopened.",
        )
        .max(
          REPORT_CARD_REVIEW_LIMITS
            .MAX_REVIEW_NOTE_LENGTH,

          `The review note cannot exceed ${REPORT_CARD_REVIEW_LIMITS.MAX_REVIEW_NOTE_LENGTH} characters.`,
        ),
  });

/* -------------------------------------------------------------------------- */
/*                           INFERRED TYPES                                   */
/* -------------------------------------------------------------------------- */

export type ReportCardDetailsSchemaInput =
  z.input<
    typeof reportCardDetailsSchema
  >;

export type ReportCardDetailsSchemaOutput =
  z.output<
    typeof reportCardDetailsSchema
  >;

export type SubmitReportCardForReviewSchemaInput =
  z.input<
    typeof submitReportCardForReviewSchema
  >;

export type RequestReportCardChangesSchemaInput =
  z.input<
    typeof requestReportCardChangesSchema
  >;

export type ApproveReportCardSchemaInput =
  z.input<
    typeof approveReportCardSchema
  >;

export type ReopenReportCardReviewSchemaInput =
  z.input<
    typeof reopenReportCardReviewSchema
  >;