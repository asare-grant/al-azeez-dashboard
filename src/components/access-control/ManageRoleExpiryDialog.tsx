"use client";

import {
  AlertTriangle,
  CalendarClock,
  Check,
  Clock3,
  Infinity as InfinityIcon,
  Loader2,
  LockKeyhole,
  TimerReset,
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
  useMemo,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type DurationAction =
  | "7_DAYS"
  | "14_DAYS"
  | "30_DAYS"
  | "CUSTOM"
  | "PERMANENT";

type ExpiryResponse = {
  success?: boolean;

  message?: string;

  error?: string;

  code?: string;

  assignment?: {
    id: number;

    roleId: number;

    expiresAt:
      string | null;
  };
};

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function ManageRoleExpiryDialog({
  userId,
  roleId,
  roleName,
  expiresAt,
  allowed,
  restrictionReason,
}: {
  userId:
    string;

  roleId:
    number;

  roleName:
    string;

  expiresAt:
    string;

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
    action,
    setAction,
  ] =
    useState<DurationAction>(
      "14_DAYS",
    );

  const [
    customExpiry,
    setCustomExpiry,
  ] =
    useState(
      "",
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

  const currentExpiry =
    useMemo(
      () =>
        new Date(
          expiresAt,
        ),
      [
        expiresAt,
      ],
    );

  /* ======================================================================== */
  /* REVERIFICATION REQUEST                                                   */
  /* ======================================================================== */

  const performExpiryUpdate =
    useReverification(
      async ({
        expiresAt,
        reason,
      }: {
        expiresAt:
          string | null;

        reason:
          string | null;
      }) => {
        const response =
          await fetch(
            `/api/access-control/users/${userId}/roles`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  roleId,
                  expiresAt,
                  reason,
                }),
            },
          );

        const payload =
          (await response.json()) as ExpiryResponse;

        if (
          !response.ok
        ) {
          throw new Error(
            payload.error ??
              payload.message ??
              "The assignment duration could not be updated.",
          );
        }

        return payload;
      },
    );

  /* ======================================================================== */
  /* RESOLVE NEXT EXPIRY                                                      */
  /* ======================================================================== */

  function resolveNextExpiry() {
    if (
      action ===
      "PERMANENT"
    ) {
      return null;
    }

    if (
      action ===
      "CUSTOM"
    ) {
      if (
        !customExpiry
      ) {
        return undefined;
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
        return undefined;
      }

      return parsed.toISOString();
    }

    /*
     * Extend presets are deliberately based on the CURRENT
     * expiry, not the current clock.
     *
     * Example:
     * Existing access ends in 4 days.
     * "+14 days" means it will now end in 18 days.
     */
    const days =
      action === "7_DAYS"
        ? 7
        : action ===
            "14_DAYS"
          ? 14
          : 30;

    return new Date(
      currentExpiry.getTime() +
        days *
          24 *
          60 *
          60 *
          1000,
    ).toISOString();
  }

  /* ======================================================================== */
  /* CLOSE                                                                    */
  /* ======================================================================== */

  function closeDialog() {
    if (
      submitting
    ) {
      return;
    }

    setOpen(
      false,
    );

    window.setTimeout(
      () => {
        setAction(
          "14_DAYS",
        );

        setCustomExpiry(
          "",
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
      },
      150,
    );
  }

  /* ======================================================================== */
  /* SUBMIT                                                                   */
  /* ======================================================================== */

  async function submit() {
    const nextExpiry =
      resolveNextExpiry();

    if (
      nextExpiry ===
      undefined
    ) {
      setError(
        "Choose a valid custom expiry date and time.",
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
      const payload =
        await performExpiryUpdate({
          expiresAt:
            nextExpiry,

          reason:
            reason
              .trim()
              .slice(
                0,
                500,
              ) ||
            null,
        });

      setSuccess(
        payload.message ??
          "The assignment duration was updated successfully.",
      );

      window.setTimeout(
        () => {
          setOpen(
            false,
          );

          setReason(
            "",
          );

          setCustomExpiry(
            "",
          );

          setSuccess(
            null,
          );

          router.refresh();
        },
        850,
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
          : "Something went wrong while updating the assignment duration.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  /* ======================================================================== */
  /* TRIGGER                                                                  */
  /* ======================================================================== */

  return (
    <>
      {allowed ? (
        <button
          type="button"
          onClick={() =>
            setOpen(
              true,
            )
          }
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-[10px] font-black text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
        >
          <TimerReset className="h-3.5 w-3.5" />

          Manage Duration
        </button>
      ) : (
        <div
          title={
            restrictionReason ??
            "You cannot manage this assignment duration."
          }
          className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[10px] font-black text-slate-300"
        >
          <LockKeyhole className="h-3.5 w-3.5" />

          Manage Duration
        </div>
      )}

      {open &&
      typeof document !==
        "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[165] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[3px] sm:p-5">
              <div className="flex max-h-[92vh] w-full max-w-[620px] flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_40px_140px_rgba(15,23,42,0.40)]">
                {/* HEADER */}

                <div className="relative shrink-0 overflow-hidden border-b border-amber-100 bg-amber-50/50 p-5 sm:p-6">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-amber-100 text-amber-700">
                        <CalendarClock className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-700">
                          Temporary Delegated Access
                        </p>

                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                          Manage Assignment Duration
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Extend, shorten or make this role assignment permanent.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={
                        closeDialog
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* BODY */}

                <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                  {/* CURRENT */}

                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[8px] font-black uppercase tracking-[0.11em] text-slate-400">
                      Current Assignment
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-900">
                      {
                        roleName
                      }
                    </p>

                    <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-white px-3 py-2.5">
                      <Clock3 className="h-3.5 w-3.5 text-amber-600" />

                      <div>
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                          Current Expiry
                        </p>

                        <p className="mt-0.5 text-[10px] font-black text-slate-700">
                          {
                            currentExpiry.toLocaleString()
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OPTIONS */}

                  <div className="mt-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                      New Duration
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <DurationButton
                        selected={
                          action ===
                          "7_DAYS"
                        }
                        label="+7 Days"
                        onClick={() =>
                          setAction(
                            "7_DAYS",
                          )
                        }
                      />

                      <DurationButton
                        selected={
                          action ===
                          "14_DAYS"
                        }
                        label="+14 Days"
                        onClick={() =>
                          setAction(
                            "14_DAYS",
                          )
                        }
                      />

                      <DurationButton
                        selected={
                          action ===
                          "30_DAYS"
                        }
                        label="+30 Days"
                        onClick={() =>
                          setAction(
                            "30_DAYS",
                          )
                        }
                      />

                      <DurationButton
                        selected={
                          action ===
                          "CUSTOM"
                        }
                        label="Exact Date"
                        onClick={() =>
                          setAction(
                            "CUSTOM",
                          )
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setAction(
                            "PERMANENT",
                          )
                        }
                        className={`col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border text-[10px] font-black transition sm:col-span-2 ${
                          action ===
                          "PERMANENT"
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-50"
                            : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/40"
                        }`}
                      >
                        <InfinityIcon className="h-3.5 w-3.5" />

                        Convert to Permanent
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM */}

                  {action ===
                  "CUSTOM" ? (
                    <div className="mt-4 rounded-[16px] border border-amber-100 bg-amber-50/50 p-4">
                      <label className="text-[9px] font-black uppercase tracking-[0.1em] text-amber-700">
                        Exact expiry date and time
                      </label>

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
                        className="mt-2 h-11 w-full rounded-[13px] border border-amber-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      />

                      <p className="mt-2 text-[9px] leading-4 text-amber-700">
                        Selecting a date earlier than the current expiry shortens
                        the delegation. Selecting a later date extends it.
                      </p>
                    </div>
                  ) : null}

                  {/* PERMANENT WARNING */}

                  {action ===
                  "PERMANENT" ? (
                    <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-4">
                      <InfinityIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-[10px] leading-5 text-emerald-700">
                        This role will stop expiring automatically and will remain
                        effective until an authorized administrator removes it or
                        the role definition is retired.
                      </p>
                    </div>
                  ) : null}

                  {/* REASON */}

                  <div className="mt-5">
                    <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">
                      Administrative Reason{" "}
                      <span className="text-slate-300">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      rows={
                        3
                      }
                      maxLength={
                        500
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
                      placeholder="Example: Acting academic director duties extended until end of term."
                      className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-50"
                    />

                    <div className="mt-1 flex justify-between">
                      <p className="text-[9px] text-slate-400">
                        Recorded in the Access Control audit log.
                      </p>

                      <p className="text-[9px] font-black text-slate-300">
                        {
                          reason.length
                        }
                        /500
                      </p>
                    </div>
                  </div>

                  {/* SECURITY */}

                  <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-violet-100 bg-violet-50/60 p-4">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

                    <p className="text-[10px] leading-5 text-violet-700">
                      Permission, target hierarchy and role authority are checked
                      again by the server. High-trust changes may require fresh
                      Clerk verification.
                    </p>
                  </div>

                  {error ? (
                    <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-rose-100 bg-rose-50 p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

                      <p className="text-[10px] font-semibold leading-5 text-rose-700">
                        {
                          error
                        }
                      </p>
                    </div>
                  ) : null}

                  {success ? (
                    <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-4">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-[10px] font-semibold leading-5 text-emerald-700">
                        {
                          success
                        }
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* FOOTER */}

                <div className="shrink-0 border-t border-slate-100 bg-white p-4 sm:px-6">
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={
                        closeDialog
                      }
                      className="h-11 rounded-[14px] border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={
                        submit
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-amber-600 px-5 text-sm font-black text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CalendarClock className="h-4 w-4" />
                      )}

                      {submitting
                        ? "Updating..."
                        : action ===
                            "PERMANENT"
                          ? "Make Permanent"
                          : "Update Duration"}
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
/* DURATION BUTTON                                                            */
/* ========================================================================== */

function DurationButton({
  selected,
  label,
  onClick,
}: {
  selected:
    boolean;

  label:
    string;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`h-11 rounded-[14px] border text-[10px] font-black transition ${
        selected
          ? "border-amber-300 bg-amber-50 text-amber-700 ring-4 ring-amber-50"
          : "border-slate-200 bg-white text-slate-500 hover:border-amber-200 hover:bg-amber-50/40"
      }`}
    >
      {
        label
      }
    </button>
  );
}