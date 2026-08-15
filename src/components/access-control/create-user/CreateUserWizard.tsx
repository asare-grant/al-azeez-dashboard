"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  UserRoundPlus,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { provisionUserAction } from "@/lib/access-control/provisioning-actions";

import {
  initialCreateUserWizardData,
  type CreateUserWizardData,
} from "./types";

import AccountTypeStep from "./steps/AccountTypeStep";
import IdentityStep from "./steps/IdentityStep";
import SchoolProfileStep from "./steps/SchoolProfileStep";
import RoleAssignmentStep from "./steps/RoleAssignmentStep";
import AccountSetupStep from "./steps/AccountSetupStep";
import ReviewStep from "./steps/ReviewStep";

import {
  validateEntireWizard,
  validateWizardStep,
  type WizardValidationErrors,
} from "./validation";

type RoleOption = {
  id: number;

  key: string;

  name: string;

  description: string | null;

  type: "SYSTEM" | "CUSTOM";

  isProtected: boolean;

  _count: {
    permissions: number;
  };
};

type ClassOption = {
  id: number;

  name: string;

  gradeId: number;
};

type SubjectOption = {
  id: number;

  name: string;
};

type ParentOption = {
  id: string;

  name: string;

  surname: string;

  phone: string;
};

type StudentOption = {
  id: string;

  name: string;

  surname: string;

  studentID: string;

  parentId: string | null;

  class: {
    name: string;
  };
};

const steps = [
  "Account Type",
  "Identity",
  "School Profile",
  "Roles & Access",
  "Account Setup",
  "Review",
];

export default function CreateUserWizard({
  roles,
  classes,
  subjects,
  parents,
  students,
}: {
  roles: RoleOption[];

  classes: ClassOption[];

  subjects: SubjectOption[];

  parents: ParentOption[];

  students: StudentOption[];
}) {
  const router = useRouter();

  const [step, setStep] = useState(0);

  const [data, setData] = useState<CreateUserWizardData>(
    initialCreateUserWizardData,
  );

  const [pending, startTransition] = useTransition();

  const [errors, setErrors] = useState<WizardValidationErrors>({});

  function patch(values: Partial<CreateUserWizardData>) {
    setData((current) => ({
      ...current,
      ...values,
    }));

    setErrors((current) => {
      const next = {
        ...current,
      };

      for (const key of Object.keys(values)) {
        delete next[key];
      }

      return next;
    });
  }

  function previous() {
    /*
     * Going backwards should never be blocked by
     * validation. We also clear errors from the
     * screen we're leaving.
     */
    setErrors({});

    setStep((current) => Math.max(0, current - 1));
  }

  function handleContinue() {
    const validation = validateWizardStep(step, data);

    if (!validation.valid) {
      setErrors(validation.errors);

      return;
    }

    setErrors({});

    setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  function clearError(key: string) {
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = {
        ...current,
      };

      delete next[key];

      return next;
    });
  }

  function getFirstInvalidStep(validationErrors: WizardValidationErrors) {
    /*
     * STEP 1 — ACCOUNT TYPE
     */
    if (validationErrors.primaryRole) {
      return 0;
    }

    /*
     * STEP 2 — IDENTITY
     */
    if (
      validationErrors.firstName ||
      validationErrors.lastName ||
      validationErrors.email ||
      validationErrors.username
    ) {
      return 1;
    }

    /*
     * STEP 3 — SCHOOL PROFILE
     */
    if (
      validationErrors.studentID ||
      validationErrors.teacherID ||
      validationErrors.classId ||
      validationErrors.sex ||
      validationErrors.birthday ||
      validationErrors.address ||
      validationErrors.studentType ||
      validationErrors.boardingType
    ) {
      return 2;
    }

    /*
     * STEP 4 — ROLES & ACCESS
     */
    if (validationErrors.roleIds) {
      return 3;
    }

    /*
     * STEP 5 — ACCOUNT SETUP
     */
    if (
        validationErrors.password ||
        validationErrors.confirmPassword
    ) {
      return 4;
    }

    return null;
  }

  function submit() {
    /*
     * Final client-side validation.
     *
     * Even though every previous step should already
     * have validated successfully, the final Create
     * User action performs one complete validation
     * pass again.
     */
    const validation = validateEntireWizard(data);

    if (!validation.valid) {
      setErrors(validation.errors);

      const invalidStep = getFirstInvalidStep(validation.errors);

      if (invalidStep !== null) {
        setStep(invalidStep);
      }

      toast.error(
        "Please complete the required information before creating this user.",
      );

      return;
    }

    if (!data.primaryRole) {
      return;
    }

    startTransition(async () => {
      const result = await provisionUserAction({
        identity: {
          firstName: data.firstName.trim(),

          lastName: data.lastName.trim(),

          email: data.email.trim(),

          phone: data.phone.trim() ? data.phone.trim() : null,

          /*
           * Username is mandatory in our new
           * provisioning architecture.
           */
          username: data.username.trim(),

          imageUrl: data.imageUrl ? data.imageUrl : null,
        },

        access: {
          primaryRole: data.primaryRole,

          roleIds: data.roleIds,
        },

        account: {
          /*
           * confirmPassword is intentionally NOT
           * sent to Clerk or Prisma.
           */
          password: data.password,
        },

        profile: data.profile,
      });

      if (!result.success) {
        toast.error(result.message);

        return;
      }

      toast.success(result.message);

      router.push(`/list/access-control/users/${result.userId}`);

      router.refresh();
    });
  }


  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      {/* STEP RAIL */}

      <aside className="relative h-fit overflow-hidden rounded-[30px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] xl:sticky xl:top-6">
  {/* SOFT BACKGROUND DETAILS */}

  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />

  <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-indigo-100/50 blur-3xl" />

  <div className="relative p-4 sm:p-5">
    {/* ================================================================ */}
    {/* HEADER                                                          */}
    {/* ================================================================ */}

    <div className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-white/10 bg-white/10 text-blue-200 shadow-inner backdrop-blur">
          <UserRoundPlus className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-300">
            Access Control
          </p>

          <h3 className="mt-1 text-base font-black tracking-tight text-white">
            Create New User
          </h3>

          <p className="mt-1 text-[10px] leading-4 text-slate-400">
            Secure identity provisioning
          </p>
        </div>
      </div>

      {/* PROGRESS */}

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Progress
          </span>

          <span className="text-[10px] font-black text-blue-200">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-500"
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>

    {/* ================================================================ */}
    {/* STEPS                                                           */}
    {/* ================================================================ */}

    <div className="mt-5">
      <p className="px-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
        Provisioning workflow
      </p>

      <div className="relative mt-3">
        {/* VERTICAL CONNECTOR */}

        <div className="pointer-events-none absolute bottom-6 left-[22px] top-6 w-px bg-slate-200" />

        <div className="space-y-1.5">
          {steps.map((label, index) => {
            const complete =
              index < step;

            const active =
              index === step;

            const upcoming =
              index > step;

            return (
              <div
                key={label}
                className={`relative flex items-center gap-3 rounded-[18px] border px-3 py-3.5 transition-all duration-300 ${
                  active
                    ? "border-blue-200 bg-blue-50 shadow-[0_10px_25px_rgba(37,99,235,0.08)]"
                    : complete
                      ? "border-transparent bg-emerald-50/50"
                      : "border-transparent bg-transparent"
                }`}
              >
                {/* STEP INDICATOR */}

                <div className="relative z-10 shrink-0">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-[11px] border text-[10px] font-black shadow-sm transition-all duration-300 ${
                      complete
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : active
                          ? "border-blue-600 bg-blue-600 text-white shadow-[0_6px_16px_rgba(37,99,235,0.25)]"
                          : "border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {complete ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </span>
                </div>

                {/* STEP COPY */}

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-xs font-black transition ${
                      active
                        ? "text-blue-950"
                        : complete
                          ? "text-emerald-900"
                          : "text-slate-500"
                    }`}
                  >
                    {label}
                  </p>

                  <p
                    className={`mt-0.5 text-[9px] font-bold ${
                      active
                        ? "text-blue-500"
                        : complete
                          ? "text-emerald-500"
                          : "text-slate-300"
                    }`}
                  >
                    {complete
                      ? "Completed"
                      : active
                        ? "Currently editing"
                        : "Pending"}
                  </p>
                </div>

                {/* ACTIVE MARKER */}

                {active ? (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                ) : null}

                {/* COMPLETED MARKER */}

                {complete ? (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]" />
                ) : null}

                {/* UPCOMING DOT */}

                {upcoming ? (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-200" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* ================================================================ */}
    {/* SECURITY FOOTER                                                 */}
    {/* ================================================================ */}

    <div className="mt-5 rounded-[20px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)]">
          <ShieldCheck className="h-4 w-4" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.11em] text-blue-700">
            Protected Workflow
          </p>

          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Identity, role assignments and provisioning actions are validated
            before account creation.
          </p>
        </div>
      </div>
    </div>
  </div>
</aside>

      {/* STEP CONTENT */}

      <main className="min-w-0">
        <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="p-5 sm:p-6 lg:p-8">
            {step === 0 ? (
              <AccountTypeStep
                data={
                    data
                }
                patch={
                    patch
                }
                roles={
                    roles
                }
                errors={
                    errors
                }
            />
            ) : null}

            {step === 1 ? (
              <IdentityStep 
              data={data} 
              patch={patch} 
              errors={errors} />
            ) : null}

            {step === 2 ? (
              <SchoolProfileStep
                data={data}
                patch={patch}
                clearError={clearError}
                errors={errors}
                classes={classes}
                subjects={subjects}
                parents={parents}
                students={students}
              />
            ) : null}

            {step === 3 ? (
              <RoleAssignmentStep
                data={
                    data
                }
                patch={
                    patch
                }
                roles={
                    roles
                }
                errors={
                    errors
                }
                />
            ) : null}

            {step === 4 ? 
            <AccountSetupStep
                data={
                    data
                }
                patch={
                    patch
                }
                errors={
                    errors
                }
                />
                : null}

            {step === 5 ? 
            <ReviewStep
                data={
                    data
                }
                roles={
                    roles
                }
                validation={
                    validateEntireWizard(
                    data,
                    )
                }
                /> : null}
          </div>

          {/* FOOTER */}

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <button
              type="button"
              disabled={step === 0}
              onClick={previous}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={submit}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}

                {pending ? "Provisioning..." : "Create User"}
              </button>
            )}
          </footer>
        </section>
      </main>
    </div>
  );
}
