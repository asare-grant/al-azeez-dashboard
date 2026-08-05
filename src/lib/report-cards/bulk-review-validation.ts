import {
  z,
} from "zod";

const reportCardIdSchema =
  z.coerce
    .number({
      error:
        "Select a valid report card.",
    })
    .int(
      "Report-card IDs must be whole numbers.",
    )
    .positive(
      "Select a valid report card.",
    );

const reportCardIdsSchema =
  z
    .array(
      reportCardIdSchema,
    )
    .min(
      1,
      "Select at least one report card.",
    )
    .max(
      100,
      "You can process a maximum of 100 report cards at once.",
    )
    .transform(
      (values) =>
        Array.from(
          new Set(values),
        ),
    );

export const bulkApproveReportCardsSchema =
  z.object({
    reportCardIds:
      reportCardIdsSchema,

    reviewNote:
      z
        .string()
        .trim()
        .max(
          1000,
          "The approval note cannot exceed 1,000 characters.",
        )
        .optional(),
  });

export const bulkRequestReportCardChangesSchema =
  z.object({
    reportCardIds:
      reportCardIdsSchema,

    reviewNote:
      z
        .string()
        .trim()
        .min(
          5,
          "Explain the corrections that are required.",
        )
        .max(
          1000,
          "The correction note cannot exceed 1,000 characters.",
        ),
  });

export const bulkPublishReportCardsSchema =
  z.object({
    reportCardIds:
      reportCardIdsSchema,
  });

export type BulkApproveReportCardsSchemaInput =
  z.input<
    typeof bulkApproveReportCardsSchema
  >;

export type BulkRequestReportCardChangesSchemaInput =
  z.input<
    typeof bulkRequestReportCardChangesSchema
  >;

export type BulkPublishReportCardsSchemaInput =
  z.input<
    typeof bulkPublishReportCardsSchema
  >;