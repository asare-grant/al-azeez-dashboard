// src/lib/report-cards/review-permissions.ts

import type {
  ReportCardCalculationStatus,
  ReportCardReviewStatus,
  ReportCardStatus,
} from "@prisma/client";

import type {
  ReportCardReviewActorRole,
  ReportCardReviewPermissions,
} from "./review-types";

/* ========================================================================== */
/* REVIEW PERMISSION RESOLVER                                                 */
/* ========================================================================== */

export function resolveReportCardReviewPermissions({
  role,
  status,
  reviewStatus,
  calculationStatus,
  isStale,
}: {
  role:
    ReportCardReviewActorRole;

  status:
    ReportCardStatus;

  reviewStatus:
    ReportCardReviewStatus;

  calculationStatus:
    ReportCardCalculationStatus;

  isStale:
    boolean;
}): ReportCardReviewPermissions {
  /* ------------------------------------------------------------------------ */
  /* ACTOR AUTHORITY                                                          */
  /* ------------------------------------------------------------------------ */

  /*
   * IMPORTANT:
   *
   * This function is called only after the user has passed
   * requireReportCardManager().
   *
   * Therefore:
   *
   * admin
   *   → legacy administrative authority
   *
   * super_admin
   *   → administrative authority
   *
   * custom
   *   → already validated as holding report_cards.*
   *     RBAC authority by requireReportCardManager()
   *
   * teacher
   *   → teacher-specific report-card workflow
   *
   * We intentionally do NOT convert a custom role into the
   * "admin" persona. We only classify its authority for this
   * review workspace.
   */
  const isAdministrativeReviewer =
    role ===
      "admin" ||
    role ===
      "super_admin" ||
    role ===
      "custom";

  const isTeacher =
    role ===
    "teacher";

  /* ------------------------------------------------------------------------ */
  /* REPORT STATE                                                             */
  /* ------------------------------------------------------------------------ */

  const isDraft =
    status ===
    "DRAFT";

  const isEditableReviewState =
    reviewStatus ===
      "DRAFT" ||
    reviewStatus ===
      "CHANGES_REQUESTED";

  const calculationReady =
    calculationStatus ===
    "READY";

  /* ------------------------------------------------------------------------ */
  /* EDITING                                                                  */
  /* ------------------------------------------------------------------------ */

  /*
   * Both Teachers and authorized administrative reviewers
   * may edit ordinary report details while the report is
   * still in an editable draft/revision state.
   */
  const canEditDetails =
    (
      isTeacher ||
      isAdministrativeReviewer
    ) &&
    isDraft &&
    isEditableReviewState;

  /*
   * Head Teacher remarks are administrative.
   *
   * Teachers may edit the ordinary/class-teacher fields,
   * but not the administrative Head Teacher remark.
   */
  const canEditHeadTeacherRemark =
    isAdministrativeReviewer &&
    canEditDetails;

  /* ------------------------------------------------------------------------ */
  /* SUBMISSION                                                               */
  /* ------------------------------------------------------------------------ */

  /*
   * A Teacher or administrative reviewer may submit once:
   *
   * - the report is editable
   * - the calculation is READY
   * - the report is not stale
   */
  const canSubmitForReview =
    !isStale &&
    canEditDetails &&
    calculationReady;

  /* ------------------------------------------------------------------------ */
  /* REVIEW DECISIONS                                                         */
  /* ------------------------------------------------------------------------ */

  /*
   * Requesting changes, approval and reopening are
   * administrative review decisions.
   */
  const canRequestChanges =
    isAdministrativeReviewer &&
    !isStale &&
    isDraft &&
    reviewStatus ===
      "SUBMITTED";

  const canApprove =
    isAdministrativeReviewer &&
    !isStale &&
    isDraft &&
    reviewStatus ===
      "SUBMITTED" &&
    calculationReady;

  const canReopen =
    isAdministrativeReviewer &&
    !isStale &&
    isDraft &&
    reviewStatus ===
      "APPROVED";

  /* ------------------------------------------------------------------------ */
  /* PUBLICATION                                                              */
  /* ------------------------------------------------------------------------ */

  const canPublish =
    isAdministrativeReviewer &&
    !isStale &&
    isDraft &&
    reviewStatus ===
      "APPROVED" &&
    calculationReady;

  /* ------------------------------------------------------------------------ */
  /* ARCHIVE                                                                  */
  /* ------------------------------------------------------------------------ */

  const canArchive =
    isAdministrativeReviewer &&
    status !==
      "ARCHIVED";

  /* ------------------------------------------------------------------------ */
  /* RESULT                                                                   */
  /* ------------------------------------------------------------------------ */

  return {
    canEditDetails,

    canEditHeadTeacherRemark,

    canSubmitForReview,

    canRequestChanges,

    canApprove,

    canReopen,

    canPublish,

    canArchive,
  };
}