"use client";

import {
  AlertTriangle,
  Check,
  ChevronRight,
  KeyRound,
  CalendarClock,
  Loader2,
  LockKeyhole,
  Search,
  ShieldCheck,
  ShieldPlus,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { useReverification } from "@clerk/nextjs";

import { isReverificationCancelledError } from "@clerk/nextjs/errors";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { createPortal } from "react-dom";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type RoleOption = {
  id: number;

  key: string;

  name: string;

  description: string | null;

  type: "SYSTEM" | "CUSTOM";

  isProtected: boolean;

  permissionCount: number;

  assignedUserCount: number;

  alreadyAssigned: boolean;

  previouslyExpired: boolean;

  canAssign: boolean;

  restrictionReason: string | null;
};

type TargetUser = {
  id: string;

  displayName: string | null;

  username: string | null;

  email: string | null;
};

type RoleMutationResponse = {
  success?: boolean;

  message?: string;

  error?: string;

  code?: string;

  assignment?: {
    id: number;

    roleId: number;

    roleKey: string;
  };
};

type ExpiryPreset =
  | "PERMANENT"
  | "1_DAY"
  | "7_DAYS"
  | "14_DAYS"
  | "30_DAYS"
  | "CUSTOM";

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function AssignUserRoleDialog({
  user,
  roles,
  allowed,
  restrictionReason,
}: {
  user: TargetUser;

  roles: RoleOption[];

  allowed: boolean;

  restrictionReason?: string | null;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const [expiryPreset, setExpiryPreset] = useState<ExpiryPreset>("PERMANENT");

  const [customExpiry, setCustomExpiry] = useState("");

  function resolveExpiryIso() {
    const now = new Date();

    switch (expiryPreset) {
      case "PERMANENT":
        return null;

      case "1_DAY":
        return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString();

      case "7_DAYS":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      case "14_DAYS":
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

      case "30_DAYS":
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      case "CUSTOM": {
        if (!customExpiry) {
          return null;
        }

        const parsed = new Date(customExpiry);

        if (Number.isNaN(parsed.getTime())) {
          return null;
        }

        return parsed.toISOString();
      }
    }
  }
  /* ======================================================================== */
  /* DERIVED DATA                                                             */
  /* ======================================================================== */

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return roles;
    }

    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.key.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query),
    );
  }, [roles, search]);

  /* ======================================================================== */
  /* REVERIFICATION-AWARE REQUEST                                             */
  /* ======================================================================== */

  const performAssignment = useReverification(
    async ({
      roleId,
      reason,
      expiresAt,
    }: {
      roleId: number;
      reason: string | null;
      expiresAt: string | null;
    }) => {
      const response = await fetch(
        `/api/access-control/users/${user.id}/roles`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            roleId,
            reason,
            expiresAt,
          }),
        },
      );

      const payload = (await response.json()) as RoleMutationResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            payload.message ??
            "The access role could not be assigned.",
        );
      }

      return payload;
    },
  );

  /* ======================================================================== */
  /* HELPERS                                                                  */
  /* ======================================================================== */

  function closeDialog() {
    if (submitting) {
      return;
    }

    setOpen(false);

    window.setTimeout(() => {
      setSearch("");

      setSelectedRoleId(null);

      setReason("");

      setError(null);

      setSuccess(null);

      setExpiryPreset("PERMANENT");

      setCustomExpiry("");
    }, 150);
  }

  function selectRole(role: RoleOption) {
    if (role.alreadyAssigned || !role.canAssign || submitting) {
      return;
    }

    setSelectedRoleId(role.id);

    setError(null);
  }

  async function submitAssignment() {
    if (!selectedRole) {
      setError("Select an access role before continuing.");

      return;
    }

    if (!selectedRole.canAssign) {
      setError(
        selectedRole.restrictionReason ??
          "Your current authority does not allow this role to be assigned.",
      );

      return;
    }

    if (expiryPreset === "CUSTOM" && !customExpiry) {
      setError("Choose a custom expiry date and time.");

      return;
    }

    const expiresAt = resolveExpiryIso();

    if (expiryPreset === "CUSTOM" && !expiresAt) {
      setError("The selected expiry date is invalid.");

      return;
    }

    setSubmitting(true);

    setError(null);

    setSuccess(null);

    try {
      const payload = await performAssignment({
        roleId: selectedRole.id,

        reason: reason.trim().slice(0, 500) || null,

        expiresAt,
      });

      setSuccess(
        payload.message ?? `${selectedRole.name} was assigned successfully.`,
      );

      window.setTimeout(() => {
        setOpen(false);

        setSelectedRoleId(null);

        setReason("");

        setSearch("");

        setSuccess(null);

        setExpiryPreset("PERMANENT");

        setCustomExpiry("");

        router.refresh();
      }, 850);
    } catch (caughtError) {
      if (isReverificationCancelledError(caughtError)) {
        return;
      }

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while assigning the role.",
      );
    } finally {
      setSubmitting(false);
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
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
        >
          <ShieldPlus className="h-4 w-4" />
          Assign Role
        </button>
      ) : (
        <div
          title={
            restrictionReason ?? "You do not have permission to assign roles."
          }
          className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-300"
        >
          <LockKeyhole className="h-4 w-4" />
          Assign Role
        </div>
      )}

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[3px] sm:p-5">
              <div className="flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_40px_140px_rgba(15,23,42,0.38)]">
                {/* ========================================================== */}
                {/* HEADER                                                     */}
                {/* ========================================================== */}

                <div className="relative shrink-0 overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-blue-50 text-blue-600">
                        <ShieldPlus className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-600">
                          Authorization Management
                        </p>

                        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                          Assign Access Role
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Extend this account&apos;s effective permissions
                          through an existing RBAC role.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={closeDialog}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ========================================================== */}
                {/* SCROLLABLE BODY                                            */}
                {/* ========================================================== */}

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                  {/* TARGET */}

                  <div className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-blue-600 shadow-sm">
                        <UserRound className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Affected Account
                        </p>

                        <p className="mt-1 truncate text-sm font-black text-slate-900">
                          {user.displayName ?? user.username ?? "User"}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">
                          {user.username
                            ? `@${user.username}`
                            : (user.email ?? user.id)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ROLE SEARCH */}

                  <div className="mt-5">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-slate-700">
                          Available roles
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                          Restricted roles remain visible so administrators can
                          understand the current authority boundary.
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500">
                        {roles.length} Roles
                      </span>
                    </div>

                    <div className="relative mt-3">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search role name, key or description..."
                        className="h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div className="mt-3 space-y-2">
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role) => {
                          const selected = selectedRoleId === role.id;

                          const blocked =
                            role.alreadyAssigned || !role.canAssign;

                          return (
                            <button
                              key={role.id}
                              type="button"
                              disabled={blocked || submitting}
                              onClick={() => selectRole(role)}
                              className={`group w-full rounded-[18px] border p-4 text-left transition ${
                                selected
                                  ? "border-blue-300 bg-blue-50/70 ring-4 ring-blue-50"
                                  : blocked
                                    ? "cursor-not-allowed border-slate-200 bg-slate-50/70 opacity-70"
                                    : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${
                                    selected
                                      ? "bg-blue-600 text-white"
                                      : role.type === "CUSTOM"
                                        ? "bg-violet-50 text-violet-600"
                                        : "bg-blue-50 text-blue-600"
                                  }`}
                                >
                                  {blocked ? (
                                    <LockKeyhole className="h-4 w-4" />
                                  ) : selected ? (
                                    <Check className="h-4 w-4" />
                                  ) : (
                                    <ShieldCheck className="h-4 w-4" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-black text-slate-900">
                                      {role.name}
                                    </p>

                                    <span
                                      className={`rounded-md px-2 py-1 text-[7px] font-black uppercase tracking-wider ${
                                        role.type === "CUSTOM"
                                          ? "bg-violet-50 text-violet-700"
                                          : "bg-blue-50 text-blue-700"
                                      }`}
                                    >
                                      {role.type}
                                    </span>

                                    {role.isProtected ? (
                                      <span className="rounded-md bg-amber-50 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-amber-700">
                                        Protected
                                      </span>
                                    ) : null}

                                    {role.alreadyAssigned ? (
                                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-emerald-700">
                                        Already Assigned
                                      </span>
                                    ) : null}

                                    {role.previouslyExpired &&
                                    !role.alreadyAssigned ? (
                                      <span className="rounded-md bg-amber-50 px-2 py-1 text-[7px] font-black uppercase tracking-wider text-amber-700">
                                        Expired · Can Renew
                                      </span>
                                    ) : null}
                                  </div>

                                  <code className="mt-1.5 block text-[9px] font-bold text-slate-400">
                                    {role.key}
                                  </code>

                                  {role.description ? (
                                    <p className="mt-2 text-[10px] leading-5 text-slate-500">
                                      {role.description}
                                    </p>
                                  ) : null}

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-500">
                                      {role.permissionCount} permissions
                                    </span>

                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-500">
                                      {role.assignedUserCount} users
                                    </span>
                                  </div>

                                  {blocked &&
                                  !role.alreadyAssigned &&
                                  role.restrictionReason ? (
                                    <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-amber-100 bg-amber-50 px-3 py-2">
                                      <LockKeyhole className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />

                                      <p className="text-[9px] font-semibold leading-4 text-amber-700">
                                        {role.restrictionReason}
                                      </p>
                                    </div>
                                  ) : null}
                                </div>

                                {!blocked ? (
                                  <ChevronRight
                                    className={`mt-3 h-4 w-4 shrink-0 transition ${
                                      selected
                                        ? "text-blue-600"
                                        : "text-slate-300 group-hover:text-blue-500"
                                    }`}
                                  />
                                ) : null}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                          <KeyRound className="mx-auto h-5 w-5 text-slate-300" />

                          <p className="mt-3 text-xs font-black text-slate-500">
                            No matching roles
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SELECTED ROLE */}

                  {selectedRole ? (
                    <div className="mt-5 rounded-[18px] border border-blue-100 bg-blue-50/50 p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-blue-600">
                            Selected Access Role
                          </p>

                          <p className="mt-1 text-sm font-black text-blue-950">
                            {selectedRole.name}
                          </p>

                          <p className="mt-1 text-[10px] leading-5 text-blue-700">
                            This assignment will add{" "}
                            <span className="font-black">
                              {selectedRole.permissionCount}
                            </span>{" "}
                            role permissions to the user&apos;s RBAC sources.
                            Effective permissions are automatically
                            deduplicated.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* ================================================================ */}
                  {/* ASSIGNMENT DURATION                                               */}
                  {/* ================================================================ */}

                  <div className="mt-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-violet-50 text-violet-600">
                        <CalendarClock className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-700">
                          Assignment duration
                        </p>

                        <p className="mt-1 text-[10px] leading-4 text-slate-400">
                          Choose permanent access or automatically expire this
                          delegated role.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {[
                        {
                          key: "PERMANENT",
                          label: "Permanent",
                        },
                        {
                          key: "1_DAY",
                          label: "24 Hours",
                        },
                        {
                          key: "7_DAYS",
                          label: "7 Days",
                        },
                        {
                          key: "14_DAYS",
                          label: "14 Days",
                        },
                        {
                          key: "30_DAYS",
                          label: "30 Days",
                        },
                        {
                          key: "CUSTOM",
                          label: "Custom",
                        },
                      ].map((option) => {
                        const selected = expiryPreset === option.key;

                        return (
                          <button
                            key={option.key}
                            type="button"
                            disabled={submitting}
                            onClick={() => {
                              setExpiryPreset(option.key as ExpiryPreset);

                              setError(null);
                            }}
                            className={`rounded-[14px] border px-3 py-3 text-[10px] font-black transition ${
                              selected
                                ? "border-violet-300 bg-violet-50 text-violet-700 ring-4 ring-violet-50"
                                : "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50/30"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>

                    {expiryPreset === "CUSTOM" ? (
                      <div className="mt-3 rounded-[16px] border border-violet-100 bg-violet-50/40 p-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-violet-700">
                          Access expires
                        </label>

                        <input
                          type="datetime-local"
                          value={customExpiry}
                          onChange={(event) =>
                            setCustomExpiry(event.target.value)
                          }
                          className="mt-2 h-11 w-full rounded-[13px] border border-violet-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                        />

                        <p className="mt-2 text-[9px] leading-4 text-violet-600">
                          The selected local time will be converted to an exact
                          UTC expiry timestamp before being stored.
                        </p>
                      </div>
                    ) : null}

                    <div
                      className={`mt-3 rounded-[14px] border p-3 ${
                        expiryPreset === "PERMANENT"
                          ? "border-slate-200 bg-slate-50"
                          : "border-amber-100 bg-amber-50/70"
                      }`}
                    >
                      <p
                        className={`text-[9px] font-semibold leading-4 ${
                          expiryPreset === "PERMANENT"
                            ? "text-slate-500"
                            : "text-amber-700"
                        }`}
                      >
                        {expiryPreset === "PERMANENT"
                          ? "This role remains active until an authorized administrator removes it."
                          : "This is temporary delegated access. Once the expiry time passes, the role remains in history but stops contributing permissions automatically."}
                      </p>
                    </div>
                  </div>

                  {/* REASON */}

                  <div className="mt-5">
                    <label className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Administrative Reason{" "}
                      <span className="text-slate-300">(optional)</span>
                    </label>

                    <textarea
                      rows={4}
                      maxLength={500}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Example: Additional role required for delegated academic administration."
                      className="mt-2 w-full resize-none rounded-[16px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-[9px] font-semibold text-slate-400">
                        Stored with the role-assignment audit event.
                      </p>

                      <p className="text-[9px] font-black text-slate-300">
                        {reason.length}
                        /500
                      </p>
                    </div>
                  </div>

                  {/* SECURITY NOTE */}

                  <div className="mt-5 flex items-start gap-3 rounded-[16px] border border-violet-100 bg-violet-50/60 p-4">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />

                    <p className="text-[10px] leading-5 text-violet-700">
                      Permission and hierarchy checks are enforced again by the
                      server. High-trust assignments may require fresh identity
                      verification before the role is granted.
                    </p>
                  </div>

                  {/* ERROR / SUCCESS */}

                  {error ? (
                    <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-rose-100 bg-rose-50 p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />

                      <p className="text-[10px] font-semibold leading-5 text-rose-700">
                        {error}
                      </p>
                    </div>
                  ) : null}

                  {success ? (
                    <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-emerald-100 bg-emerald-50 p-4">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                      <p className="text-[10px] font-semibold leading-5 text-emerald-700">
                        {success}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* ========================================================== */}
                {/* FOOTER                                                     */}
                {/* ========================================================== */}

                <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={closeDialog}
                      className="h-11 rounded-[14px] border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={submitting || !selectedRole}
                      onClick={submitAssignment}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-5 text-sm font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldPlus className="h-4 w-4" />
                      )}

                      {submitting ? "Assigning..." : "Assign Role"}
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
