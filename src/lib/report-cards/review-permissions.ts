import type {
  ReportCardReviewStatus,
  ReportCardStatus,
} from "@prisma/client";

import type {
  ReportCardReviewActorRole,
  ReportCardReviewPermissions,
} from "./review-types";

export function resolveReportCardReviewPermissions({
  role,
  status,
  reviewStatus,
  calculationStatus,
}: {
  role: ReportCardReviewActorRole;

  status:
    ReportCardStatus;

  reviewStatus:
    ReportCardReviewStatus;

  calculationStatus:
    "READY" | "PARTIAL" | "BLOCKED";
}): ReportCardReviewPermissions {
  const isDraft =
    status === "DRAFT";

  const isEditableReviewState =
    reviewStatus === "DRAFT" ||
    reviewStatus ===
      "CHANGES_REQUESTED";

  const canEditDetails =
    isDraft &&
    isEditableReviewState;

  const canSubmitForReview =
    canEditDetails &&
    calculationStatus ===
      "READY";

  const canRequestChanges =
    role === "admin" &&
    isDraft &&
    reviewStatus ===
      "SUBMITTED";

  const canApprove =
    role === "admin" &&
    isDraft &&
    reviewStatus ===
      "SUBMITTED" &&
    calculationStatus ===
      "READY";

  const canReopen =
    role === "admin" &&
    isDraft &&
    reviewStatus ===
      "APPROVED";

  const canPublish =
    role === "admin" &&
    isDraft &&
    reviewStatus ===
      "APPROVED" &&
    calculationStatus ===
      "READY";

  const canArchive =
    role === "admin" &&
    status !== "ARCHIVED";

  return {
    canEditDetails,

    canEditHeadTeacherRemark:
      role === "admin" &&
      canEditDetails,

    canSubmitForReview,

    canRequestChanges,

    canApprove,

    canReopen,

    canPublish,

    canArchive,
  };
}