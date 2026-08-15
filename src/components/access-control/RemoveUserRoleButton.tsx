"use client";

import {
  AlertTriangle,
  Check,
  Loader2,
  LockKeyhole,
  ShieldMinus,
  Trash2,
  UserRound,
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

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type RoleMutationResponse = {
  success?: boolean;

  message?: string;

  error?: string;

  code?: string;
};

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function RemoveUserRoleButton({
  userId,
  displayName,
  roleId,
  roleName,
  roleKey,
  required,
  allowed,
  restrictionReason,
}: {
  userId:
    string;

  displayName:
    string;

  roleId:
    number;

  roleName:
    string;

  roleKey:
    string;

  required:
    boolean;

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

  /* ======================================================================== */
  /* REVERIFICATION-AWARE DELETE                                              */
  /* ======================================================================== */

  const performRemoval =
    useReverification(
      async ({
        roleId,
        reason,
      }: {
        roleId:
          number;

        reason:
          string | null;
      }) => {
        const response =
          await fetch(
            `/api/access-control/users/${userId}/roles`,
            {
              method:
                "DELETE",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  roleId,
                  reason,
                }),
            },
          );

        const payload =
          (await response.json()) as RoleMutationResponse;

        if (
          !response.ok
        ) {
          throw new Error(
            payload.error ??
              payload.message ??
              "The access role could not be removed.",
          );
        }

        return payload;
      },
    );

  /* ======================================================================== */
  /* ACTIONS                                                                  */
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

  async function removeRole() {
    if (
      !allowed ||
      required
    ) {
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
        await performRemoval({
          roleId,

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
          `${roleName} was removed successfully.`,
      );

      window.setTimeout(
        () => {
          setOpen(
            false,
          );

          setReason(
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
          : "Something went wrong while removing the role.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  /* ======================================================================== */
  /* RENDER                                                                   */
  /* ======================================================================== */

  const disabled =
    required ||
    !allowed;

  const disabledReason =
    required
      ? "This is the user's required primary RBAC role and cannot be removed through normal role management."
      : restrictionReason ??
        "Your current authority does not permit this role to be removed.";

  return (
    <>
      {disabled ? (
        <div
          title={
            disabledReason
          }
          className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[10px] font-black text-slate-300"
        >
          <LockKeyhole className="h-3.5 w-3.5" />

          Remove Role
        </div>
      ) : (
        <button
          type="button"
          onClick={() =>
            setOpen(
              true,
            )
          }
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-[10px] font-black text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
        >
          <ShieldMinus className="h-3.5 w-3.5" />

          Remove Role
        </button>
      )}

      {open &&
      typeof document !==
        "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[3px]">
              <div className="flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_40px_140px_rgba(15,23,42,0.4)]">
                {/* HEADER */}

                <div className="relative shrink-0 overflow-hidden border-b border-rose-100 bg-rose-50/50 p-5 sm:p-6">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-200/50 blur-3xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-rose-100 text-rose-600">
                        <ShieldMinus className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-rose-600">
                          Sensitive Access Change
                        </p>

                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                          Remove this role?
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          The user will immediately stop inheriting permissions
                          that are available only through this role.
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
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* BODY */}

                <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                  {/* USER */}

                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-white text-blue-600 shadow-sm">
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Affected Account
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-900">
                          {
                            displayName
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ROLE */}

                  <div className="mt-3 rounded-[18px] border border-rose-100 bg-rose-50/50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldMinus className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.12em] text-rose-500">
                          Role Being Removed
                        </p>

                        <p className="mt-1 text-sm font-black text-rose-950">
                          {
                            roleName
                          }
                        </p>

                        <code className="mt-1 block text-[9px] font-bold text-rose-500">
                          {
                            roleKey
                          }
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* WARNING */}

                  <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-amber-100 bg-amber-50 p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                    <p className="text-[10px] leading-5 text-amber-700">
                      Removing a role changes effective authorization immediately.
                      Permissions also provided by another assigned role will
                      remain available.
                    </p>
                  </div>

                  {/* REASON */}

                  <div className="mt-5">
                    <label className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Administrative Reason{" "}
                      <span className="text-slate-300">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      rows={
                        4
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
                      placeholder="Example: Temporary delegated duties have ended."
                      className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
                    />

                    <div className="mt-1 flex justify-between gap-4">
                      <p className="text-[9px] font-semibold text-slate-400">
                        Saved with the ROLE_REMOVED audit event.
                      </p>

                      <span className="text-[9px] font-black text-slate-300">
                        {
                          reason.length
                        }
                        /500
                      </span>
                    </div>
                  </div>

                  {/* SECURITY */}

                  <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-violet-100 bg-violet-50/60 p-4">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

                    <p className="text-[10px] leading-5 text-violet-700">
                      Role hierarchy and protected-account policy are checked
                      again on the server. High-trust role removal may require
                      fresh Clerk verification.
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
                      className="h-11 rounded-[14px] border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={
                        submitting
                      }
                      onClick={
                        removeRole
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-rose-600 px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(225,29,72,0.18)] transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}

                      {submitting
                        ? "Removing..."
                        : "Remove Role"}
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