import "server-only";

import type {
  ReportCardCalculationStatus,
  ReportCardReviewStatus,
  ReportCardStatus,
} from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                               WORKFLOW STATE                               */
/* -------------------------------------------------------------------------- */

export type ReportCardWorkflowState = {
  status:
    ReportCardStatus;

  reviewStatus:
    ReportCardReviewStatus;

  calculationStatus:
    ReportCardCalculationStatus;

  isStale:
    boolean;

  subjectCount:
    number;

  completedSubjectCount:
    number;

  incompleteSubjectCount:
    number;
};

/* -------------------------------------------------------------------------- */
/*                               GUARD RESULT                                 */
/* -------------------------------------------------------------------------- */

export type ReportCardWorkflowGuardResult = {
  allowed:
    boolean;

  reason:
    string | null;
};

/* -------------------------------------------------------------------------- */
/*                              INTERNAL HELPERS                              */
/* -------------------------------------------------------------------------- */

function failure(
  reason: string,
): ReportCardWorkflowGuardResult {
  return {
    allowed:
      false,

    reason,
  };
}

function success(): ReportCardWorkflowGuardResult {
  return {
    allowed:
      true,

    reason:
      null,
  };
}

/* -------------------------------------------------------------------------- */
/*                           ACADEMIC COMPLETENESS                            */
/* -------------------------------------------------------------------------- */

export function reportCardHasCompleteAcademicResults(
  reportCard:
    ReportCardWorkflowState,
) {
  return (
    reportCard.subjectCount >
      0 &&
    reportCard.completedSubjectCount ===
      reportCard.subjectCount &&
    reportCard.incompleteSubjectCount ===
      0 &&
    reportCard.calculationStatus ===
      "READY"
  );
}

/* -------------------------------------------------------------------------- */
/*                            SUBMISSION GUARD                                */
/* -------------------------------------------------------------------------- */

export function canSubmitReportCardForReview(
  reportCard:
    ReportCardWorkflowState,
): ReportCardWorkflowGuardResult {
  if (
    reportCard.status !==
    "DRAFT"
  ) {
    return failure(
      "Only draft report cards can be submitted for review.",
    );
  }

  if (
    reportCard.isStale
  ) {
    return failure(
      "Academic results have changed since this report card was generated. Regenerate the report card before submitting it for review.",
    );
  }

  if (
    !reportCardHasCompleteAcademicResults(
      reportCard,
    )
  ) {
    return failure(
      "The report card does not have a complete academic result set.",
    );
  }

  if (
    reportCard.reviewStatus ===
    "SUBMITTED"
  ) {
    return failure(
      "This report card has already been submitted for review.",
    );
  }

  if (
    reportCard.reviewStatus ===
    "APPROVED"
  ) {
    return failure(
      "This report card has already been approved.",
    );
  }

  return success();
}

/* -------------------------------------------------------------------------- */
/*                              APPROVAL GUARD                                */
/* -------------------------------------------------------------------------- */

export function canApproveReportCard(
  reportCard:
    ReportCardWorkflowState,
): ReportCardWorkflowGuardResult {
  if (
    reportCard.status !==
    "DRAFT"
  ) {
    return failure(
      "Only draft report cards can be approved.",
    );
  }

  if (
    reportCard.isStale
  ) {
    return failure(
      "Academic results have changed since this report card was generated. Regenerate the report card before approval.",
    );
  }

  if (
    reportCard.reviewStatus !==
    "SUBMITTED"
  ) {
    return failure(
      "Only report cards submitted for review can be approved.",
    );
  }

  if (
    !reportCardHasCompleteAcademicResults(
      reportCard,
    )
  ) {
    return failure(
      "The report card does not have a complete academic result set.",
    );
  }

  return success();
}

/* -------------------------------------------------------------------------- */
/*                       REQUEST-CHANGES GUARD                                */
/* -------------------------------------------------------------------------- */

export function canRequestReportCardChanges(
  reportCard:
    ReportCardWorkflowState,
): ReportCardWorkflowGuardResult {
  if (
    reportCard.status !==
    "DRAFT"
  ) {
    return failure(
      "Changes can only be requested for draft report cards.",
    );
  }

  if (
    reportCard.reviewStatus !==
    "SUBMITTED"
  ) {
    return failure(
      "Changes can only be requested after a report card has been submitted for review.",
    );
  }

  return success();
}

/* -------------------------------------------------------------------------- */
/*                            PUBLICATION GUARD                               */
/* -------------------------------------------------------------------------- */

export function canPublishReportCard(
  reportCard:
    ReportCardWorkflowState,
): ReportCardWorkflowGuardResult {
  if (
    reportCard.status !==
    "DRAFT"
  ) {
    return failure(
      "Only draft report cards can be published.",
    );
  }

  if (
    reportCard.isStale
  ) {
    return failure(
      "Academic results have changed since this report card was generated. Regenerate the report card before publication.",
    );
  }

  if (
    reportCard.reviewStatus !==
    "APPROVED"
  ) {
    return failure(
      "Only approved report cards can be published.",
    );
  }

  if (
    !reportCardHasCompleteAcademicResults(
      reportCard,
    )
  ) {
    return failure(
      "The report card does not have a complete academic result set.",
    );
  }

  return success();
}