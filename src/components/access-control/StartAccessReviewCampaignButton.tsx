"use client";

import {
  AlertTriangle,
  Check,
  Loader2,
  Play,
  ShieldCheck,
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
};

export default function StartAccessReviewCampaignButton({
  campaignId,
  campaignName,
  itemCount,
  allowed,
  restrictionReason,
}: {
  campaignId: number;
  campaignName: string;
  itemCount: number;
  allowed: boolean;
  restrictionReason?: string | null;
}) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    success,
    setSuccess,
  ] =
    useState<string | null>(
      null,
    );

  async function startCampaign() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response =
        await fetch(
          `/api/access-control/reviews/campaigns/${campaignId}/start`,
          {
            method:
              "POST",
          },
        );

      const payload =
        (await response.json()) as ResponsePayload;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            payload.message ??
            "The campaign could not be started.",
        );
      }

      setSuccess(
        payload.message ??
          "The campaign is now active.",
      );

      window.setTimeout(
        () => {
          setOpen(false);
          router.refresh();
        },
        750,
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while starting the campaign.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {allowed ? (
        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-emerald-600 px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700"
        >
          <Play className="h-4 w-4" />

          Start Campaign
        </button>
      ) : (
        <div
          title={
            restrictionReason ??
            "You cannot start this campaign."
          }
          className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-300"
        >
          <ShieldCheck className="h-4 w-4" />

          Start Campaign
        </div>
      )}

      {open &&
      typeof document !==
        "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[4px]">
              <div className="w-full max-w-[540px] overflow-hidden rounded-[30px] bg-white shadow-[0_45px_150px_rgba(15,23,42,0.42)]">
                <div className="relative bg-slate-950 p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-300">
                        Formal Certification
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        Start this campaign?
                      </h2>
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        setOpen(false)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm leading-7 text-slate-600">
                    <span className="font-black text-slate-950">
                      {campaignName}
                    </span>{" "}
                    contains{" "}
                    <span className="font-black text-slate-950">
                      {itemCount}
                    </span>{" "}
                    access assignment
                    {itemCount === 1
                      ? ""
                      : "s"}
                    . Once started, reviewers can formally Certify, Modify or
                    Revoke each assignment.
                  </p>

                  {error ? (
                    <div className="mt-4 flex gap-3 rounded-[16px] border border-rose-100 bg-rose-50 p-4">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />

                      <p className="text-xs font-semibold text-rose-700">
                        {error}
                      </p>
                    </div>
                  ) : null}

                  {success ? (
                    <div className="mt-4 flex gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-4">
                      <Check className="h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-xs font-semibold text-emerald-700">
                        {success}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() =>
                        setOpen(false)
                      }
                      className="h-11 rounded-[14px] border border-slate-200 px-5 text-sm font-black text-slate-600"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={
                        startCampaign
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-emerald-600 px-5 text-sm font-black text-white disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}

                      {submitting
                        ? "Starting..."
                        : "Start Certification"}
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