"use client";

import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  CreateUserWizardData,
} from "../types";

import type {
  WizardValidationErrors,
} from "../validation";

export default function AccountSetupStep({
  data,
  patch,
  errors,
}: {
  data:
    CreateUserWizardData;

  patch:
    (
      values:
        Partial<
          CreateUserWizardData
        >,
    ) => void;

  errors:
    WizardValidationErrors;
}) {
  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false,
    );

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(
      false,
    );

  const passwordLongEnough =
    data.password.length >=
    8;

  const passwordsMatch =
    Boolean(
      data.password &&
      data.confirmPassword &&
      data.password ===
        data.confirmPassword,
    );

  return (
    <>
      {/* HEADER */}

      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        Step 5
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Account setup
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Set the initial credential for the new account. The password is
        securely sent to Clerk during provisioning and is never stored in the
        school's database.
      </p>

      <div className="mt-7 max-w-2xl">
        {/* ============================================================ */}
        {/* PASSWORD                                                     */}
        {/* ============================================================ */}

        <PasswordField
          label="Initial password"
          value={
            data.password
          }
          show={
            showPassword
          }
          error={
            errors.password
          }
          autoComplete="new-password"
          placeholder="Create a secure password"
          onToggle={() =>
            setShowPassword(
              (
                current,
              ) =>
                !current,
            )
          }
          onChange={(
            value,
          ) =>
            patch({
              password:
                value,
            })
          }
        />

        {/* ============================================================ */}
        {/* CONFIRM PASSWORD                                             */}
        {/* ============================================================ */}

        <div className="mt-5">
          <PasswordField
            label="Confirm password"
            value={
              data.confirmPassword
            }
            show={
              showConfirmPassword
            }
            error={
              errors.confirmPassword
            }
            autoComplete="new-password"
            placeholder="Re-enter the password"
            onToggle={() =>
              setShowConfirmPassword(
                (
                  current,
                ) =>
                  !current,
              )
            }
            onChange={(
              value,
            ) =>
              patch({
                confirmPassword:
                  value,
              })
            }
          />
        </div>

        {/* ============================================================ */}
        {/* PASSWORD STATUS                                              */}
        {/* ============================================================ */}

        <div className="mt-5 rounded-[18px] border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            Password readiness
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <PasswordRequirement
              valid={
                passwordLongEnough
              }
              label="At least 8 characters"
            />

            <PasswordRequirement
              valid={
                passwordsMatch
              }
              label="Passwords match"
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECURITY NOTE                                                */}
        {/* ============================================================ */}

        <div className="mt-5 flex items-start gap-3 rounded-[18px] border border-blue-100 bg-blue-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs font-black text-blue-900">
              Authentication security
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Authentication remains managed by Clerk. The school database
              stores identity, profile information, role assignments and audit
              history, but never the user's plaintext password.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                            PASSWORD FIELD                                  */
/* -------------------------------------------------------------------------- */

function PasswordField({
  label,
  value,
  show,
  onToggle,
  onChange,
  error,
  placeholder,
  autoComplete,
}: {
  label:
    string;

  value:
    string;

  show:
    boolean;

  onToggle:
    () => void;

  onChange:
    (
      value:
        string,
    ) => void;

  error?:
    string;

  placeholder?:
    string;

  autoComplete?:
    string;
}) {
  const errorId =
    `${label
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )}-error`;

  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">
        {label}
      </span>

      <div className="relative mt-2">
        <KeyRound
          className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
            error
              ? "text-red-400"
              : "text-slate-400"
          }`}
        />

        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={
            value
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target
                .value,
            )
          }
          placeholder={
            placeholder
          }
          autoComplete={
            autoComplete
          }
          aria-invalid={
            Boolean(
              error,
            )
          }
          aria-describedby={
            error
              ? errorId
              : undefined
          }
          className={`h-12 w-full rounded-[14px] border bg-slate-50 pl-11 pr-12 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 ${
            error
              ? "border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-4 focus:ring-red-50"
              : "border-slate-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          }`}
        />

        <button
          type="button"
          onClick={
            onToggle
          }
          aria-label={
            show
              ? `Hide ${label.toLowerCase()}`
              : `Show ${label.toLowerCase()}`
          }
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {error ? (
        <p
          id={
            errorId
          }
          className="mt-1.5 text-[11px] font-bold text-red-500"
        >
          {error}
        </p>
      ) : null}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                         PASSWORD REQUIREMENT                               */
/* -------------------------------------------------------------------------- */

function PasswordRequirement({
  valid,
  label,
}: {
  valid:
    boolean;

  label:
    string;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
        valid
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
          valid
            ? "bg-emerald-500 text-white"
            : "bg-slate-200 text-slate-400"
        }`}
      >
        ✓
      </span>

      <span
        className={`text-[11px] font-bold ${
          valid
            ? "text-emerald-700"
            : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}