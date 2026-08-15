"use client";

import {
  Activity,
  AlertTriangle,
  AtSign,
  BadgeCheck,
  CheckCircle2,
  Fingerprint,
  Info,
  Loader2,
  LockKeyhole,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  UserCog,
  UserRound,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type EditUserDrawerProps = {
  user: {
    id: string;
    displayName: string | null;
    username: string | null;
    email: string | null;
    phone: string | null;
    legacyRole: string | null;
    status: string;
  };

  assignedRoleCount: number;

  linkedRecordKind:
    | "STUDENT"
    | "TEACHER"
    | "PARENT"
    | "ADMIN"
    | "UNIVERSAL_ONLY"
    | "NONE";
};

type FormState = {
  displayName: string;
  username: string;
  email: string;
  phone: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type UpdateResponse = {
  success?: boolean;
  message?: string;
  error?: string;

  domainSync?: {
    attempted: boolean;
    synchronized: boolean;
    type: string | null;
  };
};

export default function EditUserDrawer({
  user,
  assignedRoleCount,
  linkedRecordKind,
}: EditUserDrawerProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState<FormState>(() => ({
    displayName: user.displayName ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
  }));

  const [errors, setErrors] = useState<FieldErrors>({});

  const [submitting, setSubmitting] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const domainBacked =
    linkedRecordKind === "STUDENT" ||
    linkedRecordKind === "TEACHER" ||
    linkedRecordKind === "PARENT" ||
    linkedRecordKind === "ADMIN";

  const isParent = linkedRecordKind === "PARENT";

  const initialState = useMemo<FormState>(
    () => ({
      displayName: user.displayName ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    }),
    [user],
  );

  const changed =
    form.displayName.trim() !== initialState.displayName.trim() ||
    form.username.trim() !== initialState.username.trim() ||
    form.email.trim() !== initialState.email.trim() ||
    form.phone.trim() !== initialState.phone.trim();

  /* -------------------------------------------------------------------------- */
  /* OPEN / CLOSE                                                               */
  /* -------------------------------------------------------------------------- */

  function openDrawer() {
    setForm(initialState);
    setErrors({});
    setServerError(null);
    setSuccess(null);
    setOpen(true);
  }

  function closeDrawer() {
    if (submitting) {
      return;
    }

    setOpen(false);
    setErrors({});
    setServerError(null);
    setSuccess(null);
  }

  /* -------------------------------------------------------------------------- */
  /* BODY SCROLL LOCK                                                           */
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
        closeDrawer();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, submitting]);

  /* -------------------------------------------------------------------------- */
  /* FORM                                                                       */
  /* -------------------------------------------------------------------------- */

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setServerError(null);
  }

  function validate() {
    const nextErrors: FieldErrors = {};

    const displayName = form.displayName.trim();

    const username = form.username.trim();

    const email = form.email.trim();

    const phone = form.phone.trim();

    if (!displayName) {
      nextErrors.displayName = "Display name is required.";
    } else if (displayName.length < 2) {
      nextErrors.displayName =
        "Display name must contain at least 2 characters.";
    } else if (displayName.length > 100) {
      nextErrors.displayName =
        "Display name cannot contain more than 100 characters.";
    }

    /*
     * Domain-backed profiles have required usernames in the
     * Student / Teacher / Parent / Admin models.
     */
    if (domainBacked && !username) {
      nextErrors.username =
        "Username is required because this account has a linked domain profile.";
    }

    if (username && username.length < 3) {
      nextErrors.username = "Username must contain at least 3 characters.";
    }

    if (username.length > 60) {
      nextErrors.username = "Username cannot contain more than 60 characters.";
    }

    if (username && !/^[a-zA-Z0-9._-]+$/.test(username)) {
      nextErrors.username =
        "Username may contain letters, numbers, periods, underscores and hyphens only.";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    /*
     * Parent.phone is non-nullable in your schema.
     */
    if (isParent && !phone) {
      nextErrors.phone = "Phone number is required for a linked Parent record.";
    }

    if (phone.length > 40) {
      nextErrors.phone = "Phone number is too long.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  /* -------------------------------------------------------------------------- */
  /* SUBMIT                                                                     */
  /* -------------------------------------------------------------------------- */

  async function submit() {
    if (!validate()) {
      return;
    }

    if (!changed) {
      setServerError("No changes have been made.");
      return;
    }

    setSubmitting(true);
    setServerError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/access-control/users/${user.id}/profile`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            displayName: form.displayName.trim(),

            username: form.username.trim() || null,

            email: form.email.trim() || null,

            phone: form.phone.trim() || null,
          }),
        },
      );

      const payload = (await response.json()) as UpdateResponse;

      if (!response.ok) {
        throw new Error(
          payload.error ??
            payload.message ??
            "The user profile could not be updated.",
        );
      }

      setSuccess(payload.message ?? "User information updated successfully.");

      window.setTimeout(() => {
        setOpen(false);
        setSuccess(null);

        router.refresh();
      }, 700);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the account.",
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
        onClick={openDrawer}
        className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <Pencil className="h-4 w-4" />
        Edit User
      </button>

      {/* ====================================================================== */}
      {/* DRAWER                                                                 */}
      {/* ====================================================================== */}

      {open ? (
        <div
          className="fixed inset-0 z-[130] flex items-end bg-slate-950/45 backdrop-blur-[3px] sm:items-stretch sm:justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-user-title"
        >
          {/* BACKDROP */}

          <button
            type="button"
            aria-label="Close edit user"
            disabled={submitting}
            onClick={closeDrawer}
            className="absolute inset-0 cursor-default"
          />

          {/* PANEL */}

          <div className="relative z-10 flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-[30px] border border-white/70 bg-white shadow-[0_-20px_70px_rgba(15,23,42,0.20)] sm:h-full sm:max-h-none sm:max-w-[590px] sm:rounded-none sm:rounded-l-[30px] sm:shadow-[-20px_0_70px_rgba(15,23,42,0.18)]">
            {/* ================================================================ */}
            {/* HEADER                                                           */}
            {/* ================================================================ */}

            <div className="relative overflow-hidden border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-blue-50 text-blue-600">
                    <Pencil className="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-600">
                      Identity Management
                    </p>

                    <h2
                      id="edit-user-title"
                      className="mt-1 text-xl font-black tracking-tight text-slate-950"
                    >
                      Edit User
                    </h2>

                    <p className="mt-1 max-w-md text-[11px] leading-5 text-slate-500">
                      Update local identity and contact information for this
                      application account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={submitting}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ================================================================ */}
            {/* SCROLLABLE CONTENT                                               */}
            {/* ================================================================ */}

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 [scrollbar-width:thin] sm:px-6">
              {/* ACCOUNT SUMMARY */}

              <div className="rounded-[20px] border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-white text-slate-500 shadow-sm">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-black text-slate-900">
                        {user.displayName ?? "Unnamed User"}
                      </p>

                      <AccountStatusBadge status={user.status} />
                    </div>

                    <p className="mt-1 truncate font-mono text-[9px] font-semibold text-slate-400">
                      {user.id}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <MiniIdentityValue
                    label="Application Role"
                    value={formatRole(user.legacyRole)}
                  />

                  <MiniIdentityValue
                    label="Domain Profile"
                    value={formatLinkedRecordKind(linkedRecordKind)}
                  />

                  <div className="col-span-2 sm:col-span-1">
                    <MiniIdentityValue
                      label="RBAC Roles"
                      value={String(assignedRoleCount)}
                    />
                  </div>
                </div>
              </div>

              {/* ================================================================ */}
              {/* EDITABLE INFORMATION                                             */}
              {/* ================================================================ */}

              <section className="mt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <UserCog className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Editable information
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Local application identity and contact fields
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <EditField
                    id="displayName"
                    icon={UserRound}
                    label="Display Name"
                    value={form.displayName}
                    error={errors.displayName}
                    required
                    placeholder="Enter display name"
                    onChange={(value) => updateField("displayName", value)}
                  />

                  <EditField
                    id="username"
                    icon={AtSign}
                    label="Username"
                    value={form.username}
                    error={errors.username}
                    required={domainBacked}
                    placeholder="Enter username"
                    helper={
                      domainBacked
                        ? "This value will also be synchronized to the linked school-domain record."
                        : "Optional for universal-only accounts."
                    }
                    onChange={(value) => updateField("username", value)}
                  />

                  <EditField
                    id="email"
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    value={form.email}
                    error={errors.email}
                    placeholder="Enter local contact email"
                    helper="This updates your local application record. It does not change the user's Clerk sign-in email."
                    onChange={(value) => updateField("email", value)}
                  />

                  <EditField
                    id="phone"
                    icon={Phone}
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    error={errors.phone}
                    required={isParent}
                    placeholder="Enter phone number"
                    helper={
                      isParent
                        ? "Required because the linked Parent model requires a phone number."
                        : undefined
                    }
                    onChange={(value) => updateField("phone", value)}
                  />
                </div>
              </section>

              {/* ================================================================ */}
              {/* DOMAIN SYNCHRONIZATION                                           */}
              {/* ================================================================ */}

              {domainBacked ? (
                <section className="mt-6 rounded-[20px] border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-xs font-black text-blue-950">
                        Linked record synchronization
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-blue-700">
                        Compatible identity fields will be synchronized to the{" "}
                        <span className="font-black">
                          {formatLinkedRecordKind(linkedRecordKind)}
                        </span>{" "}
                        record in the same database transaction.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <SyncBadge label="Username" />

                        {linkedRecordKind !== "ADMIN" ? (
                          <>
                            <SyncBadge label="Email" />
                            <SyncBadge label="Phone" />
                          </>
                        ) : null}
                      </div>

                      <p className="mt-3 text-[9px] leading-4 text-blue-600">
                        Display name is intentionally not split into domain
                        first-name/surname fields because that transformation
                        cannot be performed safely.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {/* MISSING DOMAIN WARNING */}

              {linkedRecordKind === "NONE" ? (
                <section className="mt-6 rounded-[20px] border border-amber-200 bg-amber-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />

                    <div>
                      <p className="text-[10px] font-black text-amber-900">
                        Domain synchronization unavailable
                      </p>

                      <p className="mt-1 text-[10px] leading-5 text-amber-700">
                        This identity currently has no matching school-domain
                        record. Universal UserAccount changes can still be
                        saved, but no domain record will be updated.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {/* ================================================================ */}
              {/* PROTECTED INFORMATION                                            */}
              {/* ================================================================ */}

              <section className="mt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <LockKeyhole className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Protected information
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Managed by dedicated account and access workflows
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ProtectedField
                    icon={Fingerprint}
                    label="Universal User ID"
                    value={user.id}
                    description="Immutable identity key"
                  />

                  <ProtectedField
                    icon={UserCog}
                    label="Application Identity"
                    value={formatRole(user.legacyRole)}
                    description="Managed through identity provisioning"
                  />

                  <ProtectedField
                    icon={BadgeCheck}
                    label="Account Status"
                    value={user.status}
                    description="Use More Actions to change lifecycle state"
                  />

                  <ProtectedField
                    icon={ShieldCheck}
                    label="RBAC Roles"
                    value={`${assignedRoleCount} assigned`}
                    description="Managed in Roles & Permissions"
                  />
                </div>
              </section>

              {/* ================================================================ */}
              {/* AUTHENTICATION BOUNDARY                                          */}
              {/* ================================================================ */}

              <section className="mt-6 rounded-[20px] border border-violet-100 bg-violet-50/40 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />

                  <div>
                    <p className="text-[10px] font-black text-violet-900">
                      Authentication boundary
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-violet-700">
                      This editor manages the school application&apos;s local
                      UserAccount identity. Authentication credentials and
                      verified Clerk identifiers remain under dedicated
                      authentication management workflows.
                    </p>
                  </div>
                </div>
              </section>

              {/* ERROR */}

              {serverError ? (
                <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-rose-100 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />

                  <p className="text-[10px] font-semibold leading-5 text-rose-700">
                    {serverError}
                  </p>
                </div>
              ) : null}

              {/* SUCCESS */}

              {success ? (
                <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-emerald-100 bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                  <p className="text-[10px] font-semibold leading-5 text-emerald-700">
                    {success}
                  </p>
                </div>
              ) : null}

              <div className="h-2" />
            </div>

            {/* ================================================================ */}
            {/* FOOTER                                                           */}
            {/* ================================================================ */}

            <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 text-[9px] text-slate-400">
                  <Activity className="h-3.5 w-3.5" />
                  Successful changes are written to Access Audit.
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    disabled={submitting}
                    className="inline-flex h-11 items-center justify-center rounded-[14px] border border-slate-200 bg-white px-4 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || !changed || Boolean(success)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[14px] bg-blue-600 px-5 text-xs font-black text-white shadow-[0_10px_25px_rgba(37,99,235,0.18)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
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

/* ========================================================================== */
/* EDIT FIELD                                                                 */
/* ========================================================================== */

function EditField({
  id,
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  helper,
  required = false,
}: {
  id: string;
  icon: typeof UserRound;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  error?: string;
  helper?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-slate-500"
      >
        <Icon className="h-3.5 w-3.5 text-slate-300" />

        {label}

        {required ? <span className="text-rose-500">*</span> : null}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`mt-2 h-12 w-full rounded-[15px] border bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-300 ${
          error
            ? "border-rose-300 ring-4 ring-rose-50"
            : "border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
        }`}
      />

      {error ? (
        <p className="mt-1.5 text-[9px] font-semibold text-rose-600">{error}</p>
      ) : helper ? (
        <p className="mt-1.5 text-[9px] leading-4 text-slate-400">{helper}</p>
      ) : null}
    </div>
  );
}

/* ========================================================================== */
/* PROTECTED FIELD                                                            */
/* ========================================================================== */

function ProtectedField({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof LockKeyhole;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-400" />

        <p className="text-[8px] font-black uppercase tracking-[0.09em] text-slate-400">
          {label}
        </p>
      </div>

      <p
        title={value}
        className="mt-2 truncate text-[11px] font-black text-slate-700"
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-slate-400">{description}</p>
    </div>
  );
}

function MiniIdentityValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[13px] border border-slate-100 bg-white p-3">
      <p className="text-[7px] font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 truncate text-[10px] font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}

function SyncBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[8px] font-black text-blue-700">
      <CheckCircle2 className="h-3 w-3" />

      {label}
    </span>
  );
}

/* ========================================================================== */
/* STATUS                                                                     */
/* ========================================================================== */

function AccountStatusBadge({ status }: { status: string }) {
  const config =
    status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700"
      : status === "PENDING"
        ? "bg-blue-50 text-blue-700"
        : status === "SUSPENDED"
          ? "bg-amber-50 text-amber-700"
          : status === "DISABLED"
            ? "bg-rose-50 text-rose-700"
            : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.07em] ${config}`}
    >
      {status}
    </span>
  );
}

/* ========================================================================== */
/* FORMATTERS                                                                 */
/* ========================================================================== */

function formatRole(value: string | null) {
  if (!value) {
    return "Not assigned";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatLinkedRecordKind(
  value: EditUserDrawerProps["linkedRecordKind"],
) {
  switch (value) {
    case "STUDENT":
      return "Student";

    case "TEACHER":
      return "Teacher";

    case "PARENT":
      return "Parent / Guardian";

    case "ADMIN":
      return "Administrator";

    case "UNIVERSAL_ONLY":
      return "Universal Only";

    case "NONE":
      return "Missing";

    default:
      return value;
  }
}
