"use client";

import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  archiveReportCard,
  publishReportCard,
} from "@/lib/report-cards/actions";

import {
  approveReportCard,
  reopenReportCardReview,
  requestReportCardChanges,
  submitReportCardForReview,
} from "@/lib/report-cards/review-actions";

import type {
  ReportCardReviewWorkspaceData,
} from "@/lib/report-cards/review-types";

type WorkflowAction =
  | "submit"
  | "request-changes"
  | "approve"
  | "reopen"
  | "publish"
  | "archive"
  | null;

export default function ReportCardApprovalControls({
  reportCard,
}: {
  reportCard:
    ReportCardReviewWorkspaceData;
}) {
  const router =
    useRouter();

  const [
    pendingAction,
    setPendingAction,
  ] = useState<WorkflowAction>(
    null,
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    reviewNote,
    setReviewNote,
  ] = useState(
    reportCard.reviewNote ?? "",
  );

  const permissions =
    reportCard.permissions;

  const hasAnyAction =
    permissions.canSubmitForReview ||
    permissions.canRequestChanges ||
    permissions.canApprove ||
    permissions.canReopen ||
    permissions.canPublish ||
    permissions.canArchive;

  function runAction(
    action: Exclude<
      WorkflowAction,
      null
    >,
  ) {
    if (
      isPending ||
      pendingAction
    ) {
      return;
    }

    setPendingAction(action);

    startTransition(
      async () => {
        try {
          let result;

          switch (action) {
            case "submit":
              result =
                await submitReportCardForReview({
                  reportCardId:
                    reportCard.id,

                  note:
                    reviewNote,
                });
              break;

            case "request-changes":
              if (
                reviewNote
                  .trim()
                  .length < 5
              ) {
                toast.error(
                  "Explain the corrections that are required.",
                );

                return;
              }

              result =
                await requestReportCardChanges({
                  reportCardId:
                    reportCard.id,

                  reviewNote,
                });
              break;

            case "approve":
              result =
                await approveReportCard({
                  reportCardId:
                    reportCard.id,

                  reviewNote,
                });
              break;

            case "reopen":
              if (
                reviewNote
                  .trim()
                  .length < 5
              ) {
                toast.error(
                  "Explain why the report card is being reopened.",
                );

                return;
              }

              result =
                await reopenReportCardReview({
                  reportCardId:
                    reportCard.id,

                  reviewNote,
                });
              break;

            case "publish": {
              const confirmed =
                window.confirm(
                  "Publish and permanently lock this approved report card?",
                );

              if (!confirmed) {
                return;
              }

              result =
                await publishReportCard(
                  reportCard.id,
                );
              break;
            }

            case "archive": {
              const confirmed =
                window.confirm(
                  "Archive this report card? It will no longer be visible to the student or parent.",
                );

              if (!confirmed) {
                return;
              }

              result =
                await archiveReportCard(
                  reportCard.id,
                );
              break;
            }
          }

          if (!result.success) {
            toast.error(
              result.message,
            );

            return;
          }

          toast.success(
            result.message,
          );

          router.refresh();
        } finally {
          setPendingAction(
            null,
          );
        }
      },
    );
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 bg-slate-950 p-5 text-white sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-white/10 text-blue-300">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
              Approval Controls
            </p>

            <h2 className="mt-2 text-xl font-black sm:text-2xl">
              Review workflow actions
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-300">
              Available actions are determined
              by your role and the current
              report-card state.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {reportCard.reviewStatus ===
          "CHANGES_REQUESTED" &&
        reportCard.reviewNote ? (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <p className="text-sm font-black text-amber-900">
                Corrections requested
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                {
                  reportCard.reviewNote
                }
              </p>
            </div>
          </div>
        ) : null}

        {(permissions.canSubmitForReview ||
          permissions.canRequestChanges ||
          permissions.canApprove ||
          permissions.canReopen) ? (
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.13em] text-slate-500">
              Review or Approval Note
            </span>

            <textarea
              value={reviewNote}
              onChange={(event) =>
                setReviewNote(
                  event.target.value,
                )
              }
              maxLength={1000}
              rows={5}
              placeholder="Add an optional submission or approval note. Correction and reopening actions require a clear explanation."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <span className="mt-1 block text-right text-[10px] font-semibold text-slate-400">
              {reviewNote.length}
              /1000
            </span>
          </label>
        ) : null}

        {hasAnyAction ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {permissions.canSubmitForReview ? (
              <ActionButton
                label="Submit for Review"
                icon={Send}
                loading={
                  pendingAction ===
                  "submit"
                }
                disabled={isPending}
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() =>
                  runAction(
                    "submit",
                  )
                }
              />
            ) : null}

            {permissions.canRequestChanges ? (
              <ActionButton
                label="Request Changes"
                icon={AlertTriangle}
                loading={
                  pendingAction ===
                  "request-changes"
                }
                disabled={isPending}
                className="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                onClick={() =>
                  runAction(
                    "request-changes",
                  )
                }
              />
            ) : null}

            {permissions.canApprove ? (
              <ActionButton
                label="Approve Report"
                icon={
                  CheckCircle2
                }
                loading={
                  pendingAction ===
                  "approve"
                }
                disabled={isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() =>
                  runAction(
                    "approve",
                  )
                }
              />
            ) : null}

            {permissions.canReopen ? (
              <ActionButton
                label="Reopen for Editing"
                icon={RotateCcw}
                loading={
                  pendingAction ===
                  "reopen"
                }
                disabled={isPending}
                className="border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                onClick={() =>
                  runAction(
                    "reopen",
                  )
                }
              />
            ) : null}

            {permissions.canPublish ? (
              <ActionButton
                label="Publish Report Card"
                icon={ShieldCheck}
                loading={
                  pendingAction ===
                  "publish"
                }
                disabled={isPending}
                className="bg-slate-950 text-white hover:bg-slate-800"
                onClick={() =>
                  runAction(
                    "publish",
                  )
                }
              />
            ) : null}

            {permissions.canArchive ? (
              <ActionButton
                label="Archive Report"
                icon={Archive}
                loading={
                  pendingAction ===
                  "archive"
                }
                disabled={isPending}
                className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                onClick={() =>
                  runAction(
                    "archive",
                  )
                }
              />
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-black text-slate-700">
              No workflow actions available
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              This report card is locked or
              no action is available for your
              current role.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ActionButton({
  label,
  icon: Icon,
  loading,
  disabled,
  className,
  onClick,
}: {
  label: string;
  icon: typeof Send;
  loading: boolean;
  disabled: boolean;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={
        disabled ||
        loading
      }
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}

      {label}
    </button>
  );
}