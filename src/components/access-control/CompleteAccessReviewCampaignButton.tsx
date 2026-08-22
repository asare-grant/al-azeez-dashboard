"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
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

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type ResponsePayload = {
  success?: boolean;

  message?: string;

  error?: string;

  code?: string;
};

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function CompleteAccessReviewCampaignButton({
  campaignId,
  campaignName,
  pendingCount,
  totalCount,
  allowed,
  restrictionReason,
}: {
  campaignId:
    number;

  campaignName:
    string;

  pendingCount:
    number;

  totalCount:
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

  const ready =
    allowed &&
    pendingCount ===
      0 &&
    totalCount >
      0;

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

  async function completeCampaign() {
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
                  "COMPLETE",

                reason:
                  reason
                    .trim()
                    .slice(
                      0,
                      1000,
                    ) ||
                  null,
              }),
          },
        );

      const payload =
        (await response.json()) as ResponsePayload;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            payload.message ??
            "The campaign could not be completed.",
        );
      }

      setSuccess(
        payload.message ??
          "The access review campaign has been completed.",
      );

      window.setTimeout(
        () => {
          setOpen(
            false,
          );

          router.refresh();
        },
        800,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while completing the campaign.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <>
      {ready ? (
        <button
          type="button"
          onClick={() =>
            setOpen(
              true,
            )
          }
          className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4" />

          Complete Campaign
        </button>
      ) : (
        <div
          title={
            restrictionReason ??
            (
              pendingCount >
              0
                ? `${pendingCount} pending review item${
                    pendingCount ===
                    1
                      ? ""
                      : "s"
                  } must be completed first.`
                : "This campaign cannot currently be completed."
            )
          }
          className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-300"
        >
          <LockKeyhole className="h-4 w-4" />

          Complete Campaign
        </div>
      )}

      {open &&
      typeof document !==
        "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[205] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[4px]">
              <div className="w-full max-w-[560px] overflow-hidden rounded-[30px] bg-white shadow-[0_45px_150px_rgba(15,23,42,0.42)]">
                <div className="relative bg-emerald-950 p-6 text-white">
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

                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-300">
                    Certification Closure
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Complete this campaign?
                  </h2>
                </div>

                <div className="p-6">
                  <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-sm font-black text-emerald-900">
                      {campaignName}
                    </p>

                    <p className="mt-2 text-xs leading-6 text-emerald-700">
                      All{" "}
                      <span className="font-black">
                        {totalCount}
                      </span>{" "}
                      captured access assignments now have a formal certification
                      decision.
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                      Completion Note{" "}
                      <span className="text-slate-300">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      rows={
                        3
                      }
                      maxLength={
                        1000
                      }
                      value={
                        reason
                      }
                      onChange={(
                        event,
                      ) =>
                        setReason(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Example: Term 1 privileged access certification completed and reviewed."
                      className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
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
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={
                        completeCampaign
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-5 text-sm font-black text-white disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}

                      {submitting
                        ? "Completing..."
                        : "Complete Certification"}
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

/* ========================================================================== */
/* MESSAGE                                                                    */
/* ========================================================================== */

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