"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  useReverification,
} from "@clerk/nextjs";

import {
  isReverificationCancelledError,
} from "@clerk/nextjs/errors";

type ResetPasswordDialogProps = {
  user: {
    id: string;
    displayName: string | null;
    username: string | null;
    email: string | null;
    status: string;
  };
};

type ResetPasswordResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  authentication?: {
    passwordEnabled: boolean;
    sessionsRevoked: boolean;
  };
};

export default function ResetPasswordDialog({
  user,
}: ResetPasswordDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  /*
   * Recommended default:
   *
   * A password reset requested by an administrator should invalidate
   * existing sessions unless the administrator deliberately opts out.
   */
  const [revokeAllSessions, setRevokeAllSessions] = useState(true);

  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  function openDialog() {
    setOpen(true);

    setRevokeAllSessions(true);

    setReason("");

    setError(null);

    setSuccess(null);
  }

  function closeDialog() {
    if (submitting) {
      return;
    }

    setOpen(false);

    setReason("");

    setError(null);

    setSuccess(null);
  }

  /* -------------------------------------------------------------------------- */
  /* BODY LOCK                                                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* -------------------------------------------------------------------------- */
  /* ESCAPE                                                                     */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) {
        closeDialog();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, submitting]);


  /* -------------------------------------------------------------------------- */
/* CLERK REVERIFICATION-AWARE REQUEST                                         */
/* -------------------------------------------------------------------------- */

const performPasswordResetRequest =
  useReverification(
    async ({
      revokeAllSessions,
      reason,
    }: {
      revokeAllSessions: boolean;
      reason: string | null;
    }) => {
      const response = await fetch(
        `/api/access-control/users/${user.id}/password-reset`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            revokeAllSessions,
            reason,
          }),
        },
      );

      const payload =
        (await response.json()) as ResetPasswordResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            payload.message ??
            "The password reset requirement could not be completed.",
        );
      }

      return payload;
    },
  );

  /* -------------------------------------------------------------------------- */
  /* SUBMIT                                                                     */
  /* -------------------------------------------------------------------------- */


async function submitReset() {
  setSubmitting(true);

  setError(null);
  setSuccess(null);

  try {
    const payload =
      await performPasswordResetRequest({
        revokeAllSessions,

        reason:
          reason.trim() ||
          null,
      });

    setSuccess(
      payload.message ??
        "The user will be required to reset their password.",
    );

    window.setTimeout(() => {
      setOpen(false);
      setSuccess(null);

      router.refresh();
    }, 900);
  } catch (caughtError) {
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
        : "Something went wrong while requesting the password reset.",
    );
  } finally {
    setSubmitting(false);
  }
}
  return (
    <>
      {/* ====================================================================== */}
      {/* TRIGGER                                                                */}
      {/* ====================================================================== */}

      <button
        type="button"
        onClick={openDialog}
        className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <ShieldCheck className="h-4 w-4" />
        Reset Password
      </button>

      {/* ====================================================================== */}
      {/* MODAL                                                                  */}
      {/* ====================================================================== */}

      {open ? (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[4px] sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-title"
        >
          {/* ================================================================ */}
          {/* BACKDROP                                                         */}
          {/* ================================================================ */}

          <button
            type="button"
            aria-label="Close password reset"
            onClick={closeDialog}
            disabled={submitting}
            className="absolute inset-0 cursor-default"
          />

          {/* ================================================================ */}
          {/* MODAL PANEL                                                       */}
          {/* ================================================================ */}

          <div className="relative z-10 flex h-[calc(100dvh-24px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.32)] sm:h-auto sm:max-h-[calc(100dvh-40px)] sm:rounded-[30px]">
            {/* TOP ACCENT */}

            <div className="h-1.5 shrink-0 bg-violet-600" />

            {/* ================================================================ */}
            {/* HEADER                                                           */}
            {/* ================================================================ */}

            <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-violet-50 text-violet-600 sm:h-12 sm:w-12 sm:rounded-[16px]">
                    <KeyRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.12em] text-violet-600 sm:text-[9px]">
                      Authentication Security
                    </p>

                    <h2
                      id="reset-password-title"
                      className="mt-1 text-lg font-black tracking-tight text-slate-950 sm:text-xl"
                    >
                      Require Password Reset
                    </h2>

                    <p className="mt-1 max-w-md text-[10px] leading-4.5 text-slate-500 sm:text-[11px] sm:leading-5">
                      Require this user to securely choose a new password
                      through Clerk authentication.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={submitting}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ================================================================ */}
            {/* SCROLLABLE BODY                                                  */}
            {/* ================================================================ */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-width:thin] sm:px-6 sm:py-5">
              {/* ================================================================ */}
              {/* ACCOUNT                                                         */}
              {/* ================================================================ */}

              <section className="rounded-[18px] border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-slate-500 shadow-sm">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-black text-slate-900">
                        {user.displayName ?? "Unnamed User"}
                      </p>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : user.status === "PENDING"
                              ? "bg-blue-50 text-blue-700"
                              : user.status === "SUSPENDED"
                                ? "bg-amber-50 text-amber-700"
                                : user.status === "DISABLED"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
                      @{user.username ?? "username-unavailable"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {/* EMAIL */}

                  <div className="min-w-0 rounded-[14px] border border-slate-100 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                      <p className="text-[7px] font-black uppercase tracking-[0.09em] text-slate-400">
                        Local Email
                      </p>
                    </div>

                    <p
                      title={user.email ?? "Not supplied"}
                      className="mt-1.5 truncate text-[10px] font-black text-slate-700"
                    >
                      {user.email ?? "Not supplied"}
                    </p>
                  </div>

                  {/* CLERK ID */}

                  <div className="min-w-0 rounded-[14px] border border-slate-100 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="h-3.5 w-3.5 shrink-0 text-slate-300" />

                      <p className="text-[7px] font-black uppercase tracking-[0.09em] text-slate-400">
                        Clerk User ID
                      </p>
                    </div>

                    <p
                      title={user.id}
                      className="mt-1.5 truncate font-mono text-[9px] font-black text-slate-600"
                    >
                      {user.id}
                    </p>
                  </div>
                </div>
              </section>

              {/* ================================================================ */}
              {/* CLERK SECURITY INFORMATION                                       */}
              {/* ================================================================ */}

              <section className="mt-4 rounded-[16px] border border-violet-100 bg-violet-50/50 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-violet-100 text-violet-600">
                    <LockKeyhole className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-violet-900">
                      Clerk-controlled reset
                    </p>

                    <p className="mt-1 text-[9px] leading-[18px] text-violet-700">
                      No password is generated, displayed or stored by the
                      school system. Clerk securely requires the user to choose
                      a new password.
                    </p>
                  </div>
                </div>
              </section>

              {/* ================================================================ */}
              {/* SESSION REVOCATION                                               */}
              {/* ================================================================ */}

              <section className="mt-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setRevokeAllSessions((current) => !current)}
                  aria-pressed={revokeAllSessions}
                  className={`w-full rounded-[18px] border p-4 text-left transition ${
                    revokeAllSessions
                      ? "border-rose-200 bg-rose-50/60"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        revokeAllSessions
                          ? "bg-rose-100 text-rose-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-black text-slate-800">
                            Revoke all active sessions
                          </p>

                          <p className="mt-1 text-[9px] leading-[18px] text-slate-500">
                            {revokeAllSessions
                              ? "The user will be signed out of existing sessions and required to authenticate again."
                              : "Existing sessions will remain valid until they expire or are otherwise revoked."}
                          </p>
                        </div>

                        {/* TOGGLE */}

                        <div
                          className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                            revokeAllSessions ? "bg-rose-500" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              revokeAllSessions
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                <div className="mt-2 flex items-center gap-2 px-1">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

                  <p className="text-[9px] text-slate-400">
                    Recommended for administrator-requested password resets.
                  </p>
                </div>
              </section>

              {/* ================================================================ */}
              {/* ADMINISTRATIVE REASON                                            */}
              {/* ================================================================ */}

              <section className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="password-reset-reason"
                    className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500"
                  >
                    Administrative Reason
                    <span className="ml-1 font-semibold normal-case tracking-normal text-slate-300">
                      (optional)
                    </span>
                  </label>

                  <span className="text-[9px] font-bold text-slate-300">
                    {reason.length}/500
                  </span>
                </div>

                <textarea
                  id="password-reset-reason"
                  rows={3}
                  maxLength={500}
                  disabled={submitting}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Example: User reported that they can no longer access their account."
                  className="mt-2 min-h-[92px] w-full resize-none rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-xs font-medium leading-5 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <p className="mt-1.5 text-[9px] leading-4 text-slate-400">
                  The reason is saved only in the administrative audit record.
                </p>
              </section>

              {/* ================================================================ */}
              {/* SECURITY WARNING                                                 */}
              {/* ================================================================ */}

              <section className="mt-4 flex items-start gap-3 rounded-[16px] border border-amber-100 bg-amber-50/60 p-3.5">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />

                <p className="text-[9px] leading-[18px] text-amber-700">
                  This action changes authentication security in Clerk only.
                  Student, Teacher, Parent, Admin and UserAccount profile data
                  remain unchanged.
                </p>
              </section>

              {/* ================================================================ */}
              {/* ERROR                                                            */}
              {/* ================================================================ */}

              {error ? (
                <section className="mt-4 flex items-start gap-3 rounded-[16px] border border-rose-100 bg-rose-50 p-3.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />

                  <p className="text-[10px] font-semibold leading-5 text-rose-700">
                    {error}
                  </p>
                </section>
              ) : null}

              {/* ================================================================ */}
              {/* SUCCESS                                                          */}
              {/* ================================================================ */}

              {success ? (
                <section className="mt-4 flex items-start gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                  <p className="text-[10px] font-semibold leading-5 text-emerald-700">
                    {success}
                  </p>
                </section>
              ) : null}

              {/* A little breathing room at the end of the scroll region */}

              <div className="h-1" />
            </div>

            {/* ================================================================ */}
            {/* FIXED FOOTER                                                     */}
            {/* ================================================================ */}

            <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3.5 sm:px-6 sm:py-4">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="hidden items-center gap-2 text-[9px] text-slate-400 sm:flex">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Clerk securely manages the password reset.
                </div>

                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={submitting}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={submitReset}
                    disabled={submitting || Boolean(success)}
                    className="inline-flex h-11 flex-[1.7] items-center justify-center gap-2 rounded-[14px] bg-violet-600 px-5 text-xs font-black text-white shadow-[0_10px_25px_rgba(124,58,237,0.18)] transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Reset Required
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        Require Password Reset
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
