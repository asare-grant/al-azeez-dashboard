"use client";

import {
  AlertCircle,
  BadgeDollarSign,
  Check,
  GraduationCap,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import type {
  CreateUserWizardData,
} from "../types";

import type {
  WizardValidationErrors,
} from "../validation";

const accountTypes = [
  {
    role: "admin" as const,

    title: "Administrator",

    description:
      "Administrative management and school operations.",

    icon: ShieldCheck,
  },

  {
    role: "teacher" as const,

    title: "Teacher",

    description:
      "Teaching, assessments, attendance and classroom responsibilities.",

    icon: GraduationCap,
  },

  {
    role: "student" as const,

    title: "Student",

    description:
      "Student academic and learning account.",

    icon: UserRound,
  },

  {
    role: "parent" as const,

    title: "Parent / Guardian",

    description:
      "Access to linked children's school information.",

    icon: UsersRound,
  },

  {
    role: "account" as const,

    title: "Accountant / Bursar",

    description:
      "Fees, payments, statements and finance administration.",

    icon: BadgeDollarSign,
  },
];

export default function AccountTypeStep({
  data,
  patch,
  roles,
  errors,
}: {
  data: CreateUserWizardData;

  patch: (
    values: Partial<CreateUserWizardData>,
  ) => void;

  roles: {
    id: number;

    key: string;
  }[];

  errors: WizardValidationErrors;
}) {
  function choose(
    primaryRole: CreateUserWizardData["primaryRole"],
  ) {
    if (!primaryRole) {
      return;
    }

    const requiredKey =
      primaryRole === "account"
        ? "accountant"
        : primaryRole;

    const requiredRole =
      roles.find(
        (role) =>
          role.key ===
          requiredKey,
      );

    patch({
      primaryRole,

      /*
       * Reset role selection around the required
       * primary RBAC role whenever the account type
       * changes.
       */
      roleIds: requiredRole
        ? [requiredRole.id]
        : [],

      /*
       * Role-specific school profile data must not
       * leak between account types.
       */
      profile: {},
    });
  }

  return (
    <>
      {/* HEADER */}

      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
        Step 1
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Choose the account type
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        The primary identity determines the user's existing application
        dashboard while RBAC provides additional access.
      </p>

      {/* ACCOUNT TYPES */}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {accountTypes.map((item) => {
          const Icon =
            item.icon;

          const active =
            data.primaryRole ===
            item.role;

          return (
            <button
              key={item.role}
              type="button"
              aria-pressed={active}
              onClick={() =>
                choose(
                  item.role,
                )
              }
              className={`group relative overflow-hidden rounded-[22px] border p-5 text-left transition-all duration-200 ${
                active
                  ? "border-blue-300 bg-blue-50 shadow-[0_16px_35px_rgba(37,99,235,0.10)] ring-4 ring-blue-50"
                  : errors.primaryRole
                    ? "border-red-200 bg-white hover:border-red-300"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
              }`}
            >
              {/* SUBTLE ACTIVE GLOW */}

              {active ? (
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-200/40 blur-2xl" />
              ) : null}

              <div className="relative flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-950 text-white group-hover:bg-blue-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                    active
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="relative">
                <h3 className="mt-4 font-black text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* VALIDATION ERROR */}

      {errors.primaryRole ? (
        <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

          <div>
            <p className="text-xs font-black text-red-700">
              Account type required
            </p>

            <p className="mt-1 text-[11px] leading-5 text-red-600">
              {errors.primaryRole}
            </p>
          </div>
        </div>
      ) : null}

      {/* EXPLANATION */}

      <div className="mt-5 rounded-[18px] border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          Primary identity
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Choosing an account type automatically assigns its required base
          access role. Additional system or custom roles can be added later in
          the Roles & Access step.
        </p>
      </div>
    </>
  );
}