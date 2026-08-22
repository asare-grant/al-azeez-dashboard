"use client";

import {
  AlertTriangle,
  CalendarClock,
  Check,
  CheckCircle2,
  Loader2,
  PencilLine,
  ShieldX,
  X,
} from "lucide-react";

import {
  useReverification,
} from "@clerk/nextjs";

import {
  isReverificationCancelledError,
} from "@clerk/nextjs/errors";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

type Decision =
  | "CERTIFIED"
  | "MODIFIED"
  | "REVOKED";

type ModifyMode =
  | "PERMANENT"
  | "CUSTOM";

type ResponsePayload = {
  success?: boolean;
  message?: string;
  error?: string;
  code?: string;
};

export default function AccessReviewDecisionDialog({
  campaignId,
  itemId,
  userName,
  roleName,
  currentExpiresAt,
  allowed,
}: {
  campaignId: number;
  itemId: number;
  userName: string;
  roleName: string;
  currentExpiresAt: string | null;
  allowed: boolean;
}) {
  const router =
    useRouter();

  const [
    decision,
    setDecision,
  ] =
    useState<Decision | null>(
      null,
    );

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    modifyMode,
    setModifyMode,
  ] =
    useState<ModifyMode>(
      currentExpiresAt
        ? "CUSTOM"
        : "PERMANENT",
    );

  const [
    customExpiry,
    setCustomExpiry,
  ] =
    useState("");

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

  const performDecision =
    useReverification(
      async ({
        decision,
        note,
        expiresAt,
      }: {
        decision: Decision;
        note: string | null;
        expiresAt?: string | null;
      }) => {
        const response =
          await fetch(
            `/api/access-control/reviews/campaigns/${campaignId}/items/${itemId}`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  decision,
                  note,
                  ...(decision ===
                  "MODIFIED"
                    ? {
                        expiresAt,
                      }
                    : {}),
                }),
            },
          );

        const payload =
          (await response.json()) as ResponsePayload;

        if (!response.ok) {
          throw new Error(
            payload.error ??
              payload.message ??
              "The certification decision could not be completed.",
          );
        }

        return payload;
      },
    );

  function close() {
    if (submitting) {
      return;
    }

    setDecision(null);
    setNote("");
    setCustomExpiry("");
    setError(null);
    setSuccess(null);
  }

  async function submit() {
    if (!decision) {
      return;
    }

    let expiresAt:
      string | null | undefined =
      undefined;

    if (
      decision ===
      "MODIFIED"
    ) {
      if (
        modifyMode ===
        "PERMANENT"
      ) {
        expiresAt =
          null;
      } else {
        if (!customExpiry) {
          setError(
            "Choose the new expiry date and time.",
          );

          return;
        }

        const parsed =
          new Date(
            customExpiry,
          );

        if (
          Number.isNaN(
            parsed.getTime(),
          )
        ) {
          setError(
            "The selected expiry date is invalid.",
          );

          return;
        }

        expiresAt =
          parsed.toISOString();
      }
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload =
        await performDecision({
          decision,

          note:
            note
              .trim()
              .slice(
                0,
                1000,
              ) ||
            null,

          expiresAt,
        });

      setSuccess(
        payload.message ??
          "The certification decision was recorded.",
      );

      window.setTimeout(
        () => {
          close();
          router.refresh();
        },
        800,
      );
    } catch (
      caughtError
    ) {
      if (
        isReverificationCancelledError(
          caughtError,
        )
      ) {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while processing the decision.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!allowed) {
    return (
      <div className="inline-flex h-9 cursor-not-allowed items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-[10px] font-black text-slate-300">
        Review Restricted
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setDecision(
              "CERTIFIED",
            )
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-[10px] font-black text-emerald-700 hover:bg-emerald-100"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />

          Certify
        </button>

        <button
          type="button"
          onClick={() =>
            setDecision(
              "MODIFIED",
            )
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-[10px] font-black text-amber-700 hover:bg-amber-100"
        >
          <PencilLine className="h-3.5 w-3.5" />

          Modify
        </button>

        <button
          type="button"
          onClick={() =>
            setDecision(
              "REVOKED",
            )
          }
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-[10px] font-black text-rose-700 hover:bg-rose-100"
        >
          <ShieldX className="h-3.5 w-3.5" />

          Revoke
        </button>
      </div>

      {decision &&
      typeof document !==
        "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[4px]">
              <div className="flex max-h-[92vh] w-full max-w-[600px] flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_45px_150px_rgba(15,23,42,0.42)]">
                <div
                  className={`relative p-6 ${
                    decision ===
                    "CERTIFIED"
                      ? "bg-emerald-950"
                      : decision ===
                          "MODIFIED"
                        ? "bg-amber-950"
                        : "bg-rose-950"
                  } text-white`}
                >
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={close}
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/60">
                    Formal Access Decision
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {decision ===
                    "CERTIFIED"
                      ? "Certify this access?"
                      : decision ===
                          "MODIFIED"
                        ? "Modify this access?"
                        : "Revoke this access?"}
                  </h2>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                      Review Assignment
                    </p>

                    <p className="mt-2 text-sm font-black text-slate-950">
                      {roleName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {userName}
                    </p>
                  </div>

                  {decision ===
                  "MODIFIED" ? (
                    <div className="mt-5">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        New Assignment Duration
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setModifyMode(
                              "CUSTOM",
                            )
                          }
                          className={`h-11 rounded-[14px] border text-[10px] font-black ${
                            modifyMode ===
                            "CUSTOM"
                              ? "border-amber-300 bg-amber-50 text-amber-700"
                              : "border-slate-200 text-slate-500"
                          }`}
                        >
                          Exact Expiry
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setModifyMode(
                              "PERMANENT",
                            )
                          }
                          className={`h-11 rounded-[14px] border text-[10px] font-black ${
                            modifyMode ===
                            "PERMANENT"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 text-slate-500"
                          }`}
                        >
                          Make Permanent
                        </button>
                      </div>

                      {modifyMode ===
                      "CUSTOM" ? (
                        <div className="relative mt-3">
                          <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                          <input
                            type="datetime-local"
                            value={
                              customExpiry
                            }
                            onChange={(
                              event,
                            ) =>
                              setCustomExpiry(
                                event.target
                                  .value,
                              )
                            }
                            className="h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-50"
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                      Review Note{" "}
                      <span className="text-slate-300">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      rows={4}
                      maxLength={1000}
                      value={note}
                      onChange={(
                        event,
                      ) =>
                        setNote(
                          event.target.value,
                        )
                      }
                      placeholder={
                        decision ===
                        "CERTIFIED"
                          ? "Why is this access still appropriate?"
                          : decision ===
                              "MODIFIED"
                            ? "Why is this access being changed?"
                            : "Why should this access be revoked?"
                      }
                      className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  {decision ===
                  "REVOKED" ? (
                    <div className="mt-4 flex gap-3 rounded-[16px] border border-rose-100 bg-rose-50 p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

                      <p className="text-[10px] leading-5 text-rose-700">
                        Revocation removes the live RBAC role assignment
                        immediately. The certification snapshot and audit history
                        remain preserved.
                      </p>
                    </div>
                  ) : null}

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
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-white p-4 sm:px-6">
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={close}
                      className="h-11 rounded-[14px] border border-slate-200 px-5 text-sm font-black text-slate-600"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={submit}
                      className={`inline-flex h-11 items-center justify-center gap-2 rounded-[14px] px-5 text-sm font-black text-white disabled:opacity-60 ${
                        decision ===
                        "CERTIFIED"
                          ? "bg-emerald-600"
                          : decision ===
                              "MODIFIED"
                            ? "bg-amber-600"
                            : "bg-rose-600"
                      }`}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}

                      {submitting
                        ? "Processing..."
                        : decision ===
                            "CERTIFIED"
                          ? "Confirm Certification"
                          : decision ===
                              "MODIFIED"
                            ? "Apply Modification"
                            : "Confirm Revocation"}
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