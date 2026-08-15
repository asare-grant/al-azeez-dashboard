"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Loader2,
  LockKeyhole,
  MoreHorizontal,
  PauseCircle,
  Power,
  ShieldCheck,
  ShieldAlert,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type LifecycleAction = "SUSPEND" | "ACTIVATE" | "DISABLE";

type UserMoreActionsProps = {
  userId: string;
  displayName: string;
  status: string;
};

type ActionConfig = {
  action: LifecycleAction;
  label: string;
  menuDescription: string;
  dialogTitle: string;
  dialogDescription: string;
  confirmLabel: string;
  icon: typeof PauseCircle;
  tone: "amber" | "emerald" | "rose";
};

const actionConfigs: Record<LifecycleAction, ActionConfig> = {
  SUSPEND: {
    action: "SUSPEND",
    label: "Suspend User",
    menuDescription: "Temporarily restrict normal account access.",
    dialogTitle: "Suspend this account?",
    dialogDescription:
      "The account will remain in the system, but normal application access will be restricted until an administrator reactivates it.",
    confirmLabel: "Suspend Account",
    icon: PauseCircle,
    tone: "amber",
  },

  ACTIVATE: {
    action: "ACTIVATE",
    label: "Reactivate User",
    menuDescription: "Restore normal application access.",
    dialogTitle: "Reactivate this account?",
    dialogDescription:
      "The account will return to the ACTIVE state and may resume normal application access according to its assigned RBAC roles.",
    confirmLabel: "Reactivate Account",
    icon: Power,
    tone: "emerald",
  },

  DISABLE: {
    action: "DISABLE",
    label: "Disable User",
    menuDescription: "Place the account in a disabled state.",
    dialogTitle: "Disable this account?",
    dialogDescription:
      "The account will remain preserved for audit and identity history, but normal application access will be disabled.",
    confirmLabel: "Disable Account",
    icon: LockKeyhole,
    tone: "rose",
  },
};

export default function UserMoreActions({
  userId,
  displayName,
  status,
}: UserMoreActionsProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const [selectedAction, setSelectedAction] =
    useState<LifecycleAction | null>(null);

  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const normalizedStatus = status.toUpperCase();

  /* -------------------------------------------------------------------------- */
  /* CLOSE DROPDOWN WHEN CLICKING OUTSIDE                                       */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* -------------------------------------------------------------------------- */
  /* ESCAPE KEY                                                                 */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedAction && !submitting) {
        closeDialog();
        return;
      }

      setOpen(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedAction, submitting]);

  /* -------------------------------------------------------------------------- */
  /* ACTION AVAILABILITY                                                        */
  /* -------------------------------------------------------------------------- */

  const availableActions: LifecycleAction[] =
  normalizedStatus === "ACTIVE"
    ? ["SUSPEND", "DISABLE"]
    : normalizedStatus === "PENDING"
      ? ["ACTIVATE", "DISABLE"]
      : normalizedStatus === "SUSPENDED"
        ? ["ACTIVATE", "DISABLE"]
        : normalizedStatus === "DISABLED"
          ? ["ACTIVATE"]
          : [];

  function openAction(action: LifecycleAction) {
    setOpen(false);
    setSelectedAction(action);
    setReason("");
    setError(null);
    setSuccess(null);
  }

  function closeDialog() {
    if (submitting) {
      return;
    }

    setSelectedAction(null);
    setReason("");
    setError(null);
    setSuccess(null);
  }

  /* -------------------------------------------------------------------------- */
  /* SUBMIT                                                                     */
  /* -------------------------------------------------------------------------- */

  async function submitLifecycleAction() {
    if (!selectedAction) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/access-control/users/${userId}/lifecycle`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: selectedAction,
            reason: reason.trim() || null,
          }),
        },
      );

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            payload.message ??
            "The account lifecycle action could not be completed.",
        );
      }

      setSuccess(
        payload.message ?? "The account status was updated successfully.",
      );

      /*
       * Give the user a short confirmation state before refreshing
       * the server-rendered profile.
       */
      window.setTimeout(() => {
        setSelectedAction(null);
        setReason("");
        setSuccess(null);

        router.refresh();
      }, 700);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while updating the account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedConfig = selectedAction
    ? actionConfigs[selectedAction]
    : null;

  return (
    <>
      {/* ====================================================================== */}
      {/* MORE ACTIONS DROPDOWN                                                  */}
      {/* ====================================================================== */}

      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`inline-flex h-11 items-center gap-2 rounded-[14px] px-5 text-sm font-black text-white shadow-[0_10px_25px_rgba(37,99,235,0.20)] transition ${
            open
              ? "bg-blue-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <MoreHorizontal className="h-4 w-4" />

          More Actions

          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* DROPDOWN */}

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+10px)] z-[80] w-[310px] overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
          >
            {/* HEADER */}

            <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-black text-slate-900">
                    Account Actions
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    Manage account lifecycle and access
                  </p>
                </div>
              </div>
            </div>

            {/* CURRENT STATUS */}

            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between gap-3 rounded-[14px] bg-slate-50 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                  <span className="text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
                    Current State
                  </span>
                </div>

                <AccountStateBadge status={normalizedStatus} />
              </div>
            </div>

            {/* LIFECYCLE ACTIONS */}

            <div className="p-2">
              {availableActions.map((action) => {
                const config = actionConfigs[action];

                return (
                  <LifecycleMenuItem
                    key={action}
                    config={config}
                    onClick={() => openAction(action)}
                  />
                );
              })}
            </div>

            {/* FOOTER */}

            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
              <div className="flex items-start gap-2">
                <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />

                <p className="text-[9px] leading-4 text-slate-400">
                  Lifecycle changes are recorded in the account&apos;s security
                  and audit history.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ====================================================================== */}
      {/* CONFIRMATION MODAL                                                     */}
      {/* ====================================================================== */}

      {selectedConfig ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lifecycle-dialog-title"
        >
          <div className="w-full max-w-[520px] overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.30)]">
            {/* TOP ACCENT */}

            <div
              className={`h-1.5 w-full ${
                selectedConfig.tone === "emerald"
                  ? "bg-emerald-500"
                  : selectedConfig.tone === "amber"
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
            />

            <div className="p-5 sm:p-6">
              {/* HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <LifecycleDialogIcon config={selectedConfig} />

                  <div>
                    <p
                      className={`text-[9px] font-black uppercase tracking-[0.12em] ${
                        selectedConfig.tone === "emerald"
                          ? "text-emerald-600"
                          : selectedConfig.tone === "amber"
                            ? "text-amber-600"
                            : "text-rose-600"
                      }`}
                    >
                      Account Lifecycle
                    </p>

                    <h2
                      id="lifecycle-dialog-title"
                      className="mt-1 text-lg font-black tracking-tight text-slate-950"
                    >
                      {selectedConfig.dialogTitle}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={submitting}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* ACCOUNT */}

              <div className="mt-5 rounded-[18px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
                  Affected Account
                </p>

                <p className="mt-1.5 truncate text-sm font-black text-slate-900">
                  {displayName}
                </p>

                <p className="mt-1 truncate font-mono text-[9px] font-semibold text-slate-400">
                  {userId}
                </p>
              </div>

              {/* DESCRIPTION */}

              <div className="mt-5 flex items-start gap-3">
                <CircleAlert
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    selectedConfig.tone === "emerald"
                      ? "text-emerald-500"
                      : selectedConfig.tone === "amber"
                        ? "text-amber-500"
                        : "text-rose-500"
                  }`}
                />

                <p className="text-xs leading-6 text-slate-500">
                  {selectedConfig.dialogDescription}
                </p>
              </div>

              {/* REASON */}

              <div className="mt-5">
                <label
                  htmlFor="lifecycle-reason"
                  className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500"
                >
                  Administrative reason
                  <span className="ml-1 font-semibold normal-case tracking-normal text-slate-300">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="lifecycle-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  disabled={submitting}
                  maxLength={500}
                  rows={4}
                  placeholder={
                    selectedAction === "SUSPEND"
                      ? "Why is this account being suspended?"
                      : selectedAction === "DISABLE"
                        ? "Why is this account being disabled?"
                        : "Reason for restoring account access..."
                  }
                  className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-xs font-medium leading-5 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                />

                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="text-[9px] text-slate-400">
                    Saved with the lifecycle audit event.
                  </p>

                  <span className="text-[9px] font-bold text-slate-300">
                    {reason.length}/500
                  </span>
                </div>
              </div>

              {/* ERROR */}

              {error ? (
                <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-rose-100 bg-rose-50 p-3.5">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />

                  <p className="text-[10px] font-semibold leading-5 text-rose-700">
                    {error}
                  </p>
                </div>
              ) : null}

              {/* SUCCESS */}

              {success ? (
                <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-3.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                  <p className="text-[10px] font-semibold leading-5 text-emerald-700">
                    {success}
                  </p>
                </div>
              ) : null}

              {/* ACTIONS */}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={submitting}
                  className="inline-flex h-11 items-center justify-center rounded-[14px] border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={submitLifecycleAction}
                  disabled={submitting || Boolean(success)}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-[14px] px-5 text-xs font-black text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    selectedConfig.tone === "emerald"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : selectedConfig.tone === "amber"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      <selectedConfig.icon className="h-4 w-4" />
                      {selectedConfig.confirmLabel}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ========================================================================== */
/* MENU ITEM                                                                  */
/* ========================================================================== */

function LifecycleMenuItem({
  config,
  onClick,
}: {
  config: ActionConfig;
  onClick: () => void;
}) {
  const Icon = config.icon;

  const tone = {
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      hover: "hover:bg-emerald-50/60",
      label: "group-hover:text-emerald-700",
    },

    amber: {
      icon: "bg-amber-50 text-amber-600",
      hover: "hover:bg-amber-50/60",
      label: "group-hover:text-amber-700",
    },

    rose: {
      icon: "bg-rose-50 text-rose-600",
      hover: "hover:bg-rose-50/60",
      label: "group-hover:text-rose-700",
    },
  }[config.tone];

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`group flex w-full items-start gap-3 rounded-[14px] px-3 py-3 text-left transition ${tone.hover}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p
          className={`text-[11px] font-black text-slate-700 transition ${tone.label}`}
        >
          {config.label}
        </p>

        <p className="mt-0.5 text-[9px] leading-4 text-slate-400">
          {config.menuDescription}
        </p>
      </div>
    </button>
  );
}

/* ========================================================================== */
/* DIALOG ICON                                                                */
/* ========================================================================== */

function LifecycleDialogIcon({ config }: { config: ActionConfig }) {
  const Icon = config.icon;

  const className =
    config.tone === "emerald"
      ? "bg-emerald-50 text-emerald-600"
      : config.tone === "amber"
        ? "bg-amber-50 text-amber-600"
        : "bg-rose-50 text-rose-600";

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] ${className}`}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}

/* ========================================================================== */
/* STATUS BADGE                                                               */
/* ========================================================================== */

function AccountStateBadge({ status }: { status: string }) {
  const config =
    status === "ACTIVE"
      ? {
          className:
            "border-emerald-100 bg-emerald-50 text-emerald-700",
          dot: "bg-emerald-500",
        }
      : status === "SUSPENDED"
        ? {
            className: "border-amber-100 bg-amber-50 text-amber-700",
            dot: "bg-amber-500",
          }
        : status === "DISABLED"
          ? {
              className: "border-rose-100 bg-rose-50 text-rose-700",
              dot: "bg-rose-500",
            }
          : {
              className: "border-slate-200 bg-slate-50 text-slate-600",
              dot: "bg-slate-400",
            };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />

      {status}
    </span>
  );
}