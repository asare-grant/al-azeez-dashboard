"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Calculator,
  Loader2,
  Save,
} from "lucide-react";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "react-toastify";

import {
  createAcademicWeighting,
  updateAcademicWeighting,
} from "@/lib/academic-weightings/actions";

import {
  academicWeightingSchema,
} from "@/lib/academic-weightings/validation";

import type {
  AcademicWeightingFormOptions,
  AcademicWeightingInput,
} from "@/lib/academic-weightings/types";

import AcademicWeightDistribution from "./AcademicWeightDistribution";

import AcademicWeightingValidationPanel from "./AcademicWeightingValidationPanel";

export default function AcademicWeightingStudio({
  mode,
  initialWeighting,
  options,
}: {
  mode:
    | "create"
    | "edit";

  initialWeighting:
    AcademicWeightingInput;

  options:
    AcademicWeightingFormOptions;
}) {
  const router =
    useRouter();

  const [
    weighting,
    setWeighting,
  ] = useState(
    initialWeighting,
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const validation =
    useMemo(
      () =>
        academicWeightingSchema.safeParse(
          weighting,
        ),
      [weighting],
    );

  function update<
    Key extends keyof AcademicWeightingInput,
  >(
    key: Key,
    value:
      AcademicWeightingInput[Key],
  ) {
    setWeighting(
      (current) => ({
        ...current,
        [key]: value,
      }),
    );
  }

  function handleSave() {
    const parsed =
      academicWeightingSchema.safeParse(
        weighting,
      );

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]
          ?.message ??
          "Review the weighting configuration.",
      );

      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createAcademicWeighting(
              parsed.data,
            )
          : await updateAcademicWeighting(
              parsed.data,
            );

      if (!result.success) {
        toast.error(
          result.message,
        );

        return;
      }

      toast.success(
        result.message,
      );

      router.replace(
        `/list/academic-settings/weightings/${result.data.weightingId}/edit`,
      );

      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/list/academic-settings/weightings"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Academic Weighting Studio
              </p>

              <h1 className="mt-1 text-xl font-black text-slate-950">
                {weighting.academicYear ||
                  "New Weighting"}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              isPending ||
              !validation.success
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {mode === "create"
              ? "Create Weighting"
              : "Save Changes"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Calculator className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    Configuration
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    Academic period and grade
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Academic Year"
                  value={
                    weighting.academicYear
                  }
                  onChange={(value) =>
                    update(
                      "academicYear",
                      value,
                    )
                  }
                >
                  <option value="">
                    Select academic year
                  </option>

                  {options.academicYears.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    ),
                  )}
                </SelectField>

                <SelectField
                  label="School Term"
                  value={String(
                    weighting.termId ||
                      "",
                  )}
                  onChange={(value) =>
                    update(
                      "termId",
                      Number(value),
                    )
                  }
                >
                  <option value="">
                    Select term
                  </option>

                  {options.terms.map(
                    (term) => (
                      <option
                        key={term.id}
                        value={term.id}
                      >
                        {term.name.replace(
                          /_/g,
                          " ",
                        )}
                        {term.isActive
                          ? " — Active"
                          : ""}
                      </option>
                    ),
                  )}
                </SelectField>

                <SelectField
                  label="Grade"
                  value={String(
                    weighting.gradeId ||
                      "",
                  )}
                  onChange={(value) =>
                    update(
                      "gradeId",
                      Number(value),
                    )
                  }
                >
                  <option value="">
                    Select grade
                  </option>

                  {options.grades.map(
                    (grade) => (
                      <option
                        key={grade.id}
                        value={grade.id}
                      >
                        {grade.level}
                      </option>
                    ),
                  )}
                </SelectField>

                <SelectField
                  label="Grading Scale"
                  value={String(
                    weighting.gradingScaleId ||
                      "",
                  )}
                  onChange={(value) =>
                    update(
                      "gradingScaleId",
                      Number(value),
                    )
                  }
                >
                  <option value="">
                    Select grading scale
                  </option>

                  {options.gradingScales.map(
                    (scale) => (
                      <option
                        key={scale.id}
                        value={scale.id}
                      >
                        {scale.name}
                        {scale.isDefault
                          ? " — Default"
                          : ""}
                      </option>
                    ),
                  )}
                </SelectField>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Score Composition
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950">
                Configure category weights
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <NumberField
                  label="Assignment Weight"
                  value={
                    weighting.assignmentWeight
                  }
                  suffix="%"
                  onChange={(value) =>
                    update(
                      "assignmentWeight",
                      value,
                    )
                  }
                />

                <NumberField
                  label="Assessment Weight"
                  value={
                    weighting.assessmentWeight
                  }
                  suffix="%"
                  onChange={(value) =>
                    update(
                      "assessmentWeight",
                      value,
                    )
                  }
                />

                <NumberField
                  label="Examination Weight"
                  value={
                    weighting.examWeight
                  }
                  suffix="%"
                  onChange={(value) =>
                    update(
                      "examWeight",
                      value,
                    )
                  }
                />
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Assessment Score Strategy"
                  value={
                    weighting.assessmentScoreStrategy
                  }
                  onChange={(value) =>
                    update(
                      "assessmentScoreStrategy",
                      value as AcademicWeightingInput["assessmentScoreStrategy"],
                    )
                  }
                >
                  <option value="AVERAGE">
                    Average all assessments
                  </option>

                  <option value="HIGHEST">
                    Use highest assessment
                  </option>

                  <option value="LATEST">
                    Use latest assessment
                  </option>
                </SelectField>

                <NumberField
                  label="Pass Mark"
                  value={
                    weighting.passMark
                  }
                  suffix="%"
                  onChange={(value) =>
                    update(
                      "passMark",
                      value,
                    )
                  }
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  update(
                    "isActive",
                    !weighting.isActive,
                  )
                }
                className={`mt-5 flex w-full items-center justify-between rounded-2xl border p-4 text-left ${
                  weighting.isActive
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-sm font-black text-slate-900">
                    Active Configuration
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Allow the report-card engine to use this weighting.
                  </p>
                </div>

                <span
                  className={`h-6 w-11 rounded-full p-1 transition ${
                    weighting.isActive
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white transition ${
                      weighting.isActive
                        ? "translate-x-5"
                        : ""
                    }`}
                  />
                </span>
              </button>
            </section>
          </div>

          <div className="space-y-5 xl:sticky xl:top-[110px]">
            <AcademicWeightingValidationPanel
              weighting={weighting}
            />

            <AcademicWeightDistribution
              assignmentWeight={
                weighting.assignmentWeight
              }
              assessmentWeight={
                weighting.assessmentWeight
              }
              examWeight={
                weighting.examWeight
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (
    value: number,
  ) => void;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>

      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value ===
                ""
                ? 0
                : Number(
                    event.target
                      .value,
                  ),
            )
          }
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-12 text-sm font-semibold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />

        {suffix ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}