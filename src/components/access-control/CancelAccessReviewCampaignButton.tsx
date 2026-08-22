"use client";

import {
  AlertTriangle,
  Ban,
  Check,
  Loader2,
  LockKeyhole,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

type ResponsePayload = {
  success?: boolean;

  message?: string;

  error?: string;

  code?: string;
};

export default function CancelAccessReviewCampaignButton({
  campaignId,
  campaignName,
  status,
  reviewedCount,
  pendingCount,
  allowed,
  restrictionReason,
}: {
  campaignId:
    number;

  campaignName:
    string;

  status:
    string;

  reviewedCount:
    number;

  pendingCount:
    number;

  allowed:
    boolean;

  restrictionReason?:
    string | null;
}) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  const [
    reason,
    setReason,
  ] =
    useState(
      "",
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const cancellable =
    status ===
      "DRAFT" ||
    status ===
      "ACTIVE";

  const enabled =
    allowed &&
    cancellable;

  function close() {
    if (
      submitting
    ) {
      return;
    }

    setOpen(
      false,
    );

    setReason(
      "",
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );
  }

  async function cancelCampaign() {
    if (
      !reason.trim()
    ) {
      setError(
        "Enter a reason for cancelling this campaign.",
      );

      return;
    }

    setSubmitting(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      null,
    );

    try {
      const response =
        await fetch(
          `/api/access-control/reviews/campaigns/${campaignId}/lifecycle`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                action:
                  "CANCEL",

                reason:
                  reason
                    .trim()
                    .slice(
                      0,
                      1000,
                    ),
              }),
          },
        );

      const payload =
        (await response.json()) as ResponsePayload;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            payload.message ??
            "The campaign could not be cancelled.",
        );
      }

      setSuccess(
        payload.message ??
          "The campaign has been cancelled.",
      );

      window.setTimeout(
        () => {
          setOpen(
            false,
          );

          router.refresh();
        },
        850,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while cancelling the campaign.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <>
      {enabled ? (
        <button
          type="button"
          onClick={() =>
            setOpen(
              true,
            )
          }
          className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 transition hover:bg-rose-100"
        >
          <Ban className="h-4 w-4" />

          Cancel Campaign
        </button>
      ) : (
        <div
          title={
            restrictionReason ??
            "This campaign can no longer be cancelled."
          }
          className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-300"
        >
          <LockKeyhole className="h-4 w-4" />

          Cancel Campaign
        </div>
      )}

      {open &&
      typeof document !==
        "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[205] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[4px]">
              <div className="w-full max-w-[580px] overflow-hidden rounded-[30px] bg-white shadow-[0_45px_150px_rgba(15,23,42,0.42)]">
                <div className="relative bg-rose-950 p-6 text-white">
                  <button
                    type="button"
                    disabled={
                      submitting
                    }
                    onClick={
                      close
                    }
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-rose-300">
                    Governance Termination
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Cancel this campaign?
                  </h2>
                </div>

                <div className="p-6">
                  <p className="text-sm leading-7 text-slate-600">
                    You are cancelling{" "}
                    <span className="font-black text-slate-950">
                      {campaignName}
                    </span>
                    .
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[15px] bg-emerald-50 p-3">
                      <p className="text-xl font-black text-emerald-800">
                        {reviewedCount}
                      </p>

                      <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-emerald-600">
                        Decisions Preserved
                      </p>
                    </div>

                    <div className="rounded-[15px] bg-slate-50 p-3">
                      <p className="text-xl font-black text-slate-800">
                        {pendingCount}
                      </p>

                      <p className="mt-1 text-[8px] font-black uppercase tracking-wider text-slate-400">
                        Remaining Pending
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-amber-100 bg-amber-50 p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <p className="text-[10px] leading-5 text-amber-700">
                      Cancelling the campaign does not reverse any access changes
                      that have already been made. Certified, modified and revoked
                      review decisions remain preserved as historical evidence.
                    </p>
                  </div>

                  <div className="mt-5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                      Cancellation Reason
                    </label>

                    <textarea
                      rows={
                        4
                      }
                      maxLength={
                        1000
                      }
                      value={
                        reason
                      }
                      onChange={(
                        event,
                      ) => {
                        setReason(
                          event.target
                            .value,
                        );

                        if (
                          error
                        ) {
                          setError(
                            null,
                          );
                        }
                      }}
                      placeholder="Explain why this certification campaign is being terminated..."
                      className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
                    />
                  </div>

                  {error ? (
                    <Message
                      type="error"
                      message={
                        error
                      }
                    />
                  ) : null}

                  {success ? (
                    <Message
                      type="success"
                      message={
                        success
                      }
                    />
                  ) : null}

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={
                        close
                      }
                      className="h-11 rounded-[14px] border border-slate-200 px-5 text-sm font-black text-slate-600"
                    >
                      Keep Campaign
                    </button>

                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={
                        cancelCampaign
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-rose-600 px-5 text-sm font-black text-white disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}

                      {submitting
                        ? "Cancelling..."
                        : "Confirm Cancellation"}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Message({
  type,
  message,
}: {
  type:
    "success" |
    "error";

  message:
    string;
}) {
  return (
    <div
      className={`mt-4 flex items-start gap-3 rounded-[16px] border p-4 ${
        type ===
        "success"
          ? "border-emerald-100 bg-emerald-50"
          : "border-rose-100 bg-rose-50"
      }`}
    >
      {type ===
      "success" ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
      )}

      <p
        className={`text-xs font-semibold ${
          type ===
          "success"
            ? "text-emerald-700"
            : "text-rose-700"
        }`}
      >
        {message}
      </p>
    </div>
  );
}