import type { ReportCardCalculationStatus, ReportCardReviewStatus, ReportCardStatus } from "@prisma/client";

import type {
  ReportCardReviewActorRole,
  ReportCardReviewPermissions,
} from "./review-types";

export function resolveReportCardReviewPermissions({
  role,
  status,
  reviewStatus,
  calculationStatus,
  isStale,
}: {
  role: ReportCardReviewActorRole;

  status: ReportCardStatus;

  reviewStatus: ReportCardReviewStatus;

  calculationStatus:
    ReportCardCalculationStatus;

  isStale: boolean;
}): ReportCardReviewPermissions {
  const isDraft = status === "DRAFT";

  const isEditableReviewState =
    reviewStatus === "DRAFT" || reviewStatus === "CHANGES_REQUESTED";

  const canEditDetails = isDraft && isEditableReviewState;

  const canSubmitForReview = 
    !isStale &&
    canEditDetails && 
    calculationStatus === "READY";
    
  const canRequestChanges =
    role === "admin" && 
    !isStale &&
    isDraft && 
    reviewStatus === "SUBMITTED";
    
  const canApprove =
    !isStale &&
    role === "admin" &&
    isDraft &&
    reviewStatus === "SUBMITTED" &&
    calculationStatus === "READY";
    
  const canReopen = 
    !isStale &&
    role === "admin" && 
    isDraft && 
    reviewStatus === "APPROVED";
    
  const canPublish =
    role === "admin" &&
    !isStale &&
    isDraft &&
    reviewStatus === "APPROVED" &&
    calculationStatus === "READY";

  const canArchive = role === "admin" && status !== "ARCHIVED";

  return {
    canEditDetails,

    canEditHeadTeacherRemark: role === "admin" && canEditDetails,

    canSubmitForReview,

    canRequestChanges,

    canApprove,

    canReopen,

    canPublish,

    canArchive,
  };
}
