"use client";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  FileClock,
  FilePlus2,
  GraduationCap,
  Loader2,
  Scale,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useState,
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  generateClassReportCardDrafts,
} from "@/lib/report-cards/actions";

import type {
  ReportCardGenerationPageData,
  ReportCardGenerationReadiness,
  ReportCardGenerationSelection,
} from "./types";

type ReportCardGenerationStudioProps = {
  options:
    ReportCardGenerationPageData;

  initialSelection:
    ReportCardGenerationSelection;

  readiness:
    ReportCardGenerationReadiness
    | null;
};

export default function ReportCardGenerationStudio({
  options,
  initialSelection,
  readiness,
}: ReportCardGenerationStudioProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    selection,
    setSelection,
  ] = useState(
    initialSelection,
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function updateSelection(
    next:
      ReportCardGenerationSelection,
  ) {
    setSelection(next);

    const params =
      new URLSearchParams();

    if (next.classId) {
      params.set(
        "classId",
        String(next.classId),
      );
    }

    if (next.academicYear) {
      params.set(
        "academicYear",
        next.academicYear,
      );
    }

    if (next.termId) {
      params.set(
        "termId",
        String(next.termId),
      );
    }

    router.replace(
      `${pathname}?${params.toString()}`,
    );
  }

  function handleGenerate() {
    if (
      !readiness?.ready ||
      !selection.classId ||
      !selection.academicYear ||
      !selection.termId ||
      isPending
    ) {
      return;
    }

    const existingDrafts =
      readiness
        .existingReportCards
        .draft;

    const message =
      existingDrafts > 0
        ? `Regenerate ${existingDrafts} existing draft report card${
            existingDrafts === 1
              ? ""
              : "s"
          } and create any missing drafts?`
        : `Generate report-card drafts for ${readiness.classOption?.name}?`;

    if (
      !window.confirm(message)
    ) {
      return;
    }

    startTransition(
      async () => {
        const result =
          await generateClassReportCardDrafts({
            classId:
              selection.classId!,

            academicYear:
              selection.academicYear,

            termId:
              selection.termId!,
          });

        if (!result.success) {
          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        router.push(
          `/list/report-cards?classId=${selection.classId}&academicYear=${encodeURIComponent(
            selection.academicYear,
          )}&termId=${selection.termId}`,
        );

        router.refresh();
      },
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/list/report-cards"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Report Cards
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              <GraduationCap className="h-4 w-4" />
              Report Generation
            </div>

            <h1 className="mt-5 text-3xl font-black sm:text-4xl lg:text-5xl">
              Generate terminal report cards
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Select an academic period,
              validate its weighting and
              grading configuration, then
              generate secure report-card
              drafts for the entire class.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Step 1
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Select academic period
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              All three selections are
              required before configuration
              readiness can be checked.
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Field
              label="Class"
            >
              <select
                value={
                  selection.classId ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  updateSelection({
                    ...selection,

                    classId:
                      event.target
                        .value
                        ? Number(
                            event
                              .target
                              .value,
                          )
                        : null,
                  })
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">
                  Select class
                </option>

                {options.classes.map(
                  (classOption) => (
                    <option
                      key={
                        classOption.id
                      }
                      value={
                        classOption.id
                      }
                    >
                      {
                        classOption.name
                      }{" "}
                      —{" "}
                      {
                        classOption
                          .studentCount
                      }{" "}
                      students
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field
              label="Academic Year"
            >
              <select
                value={
                  selection.academicYear
                }
                onChange={(
                  event,
                ) =>
                  updateSelection({
                    ...selection,

                    academicYear:
                      event.target
                        .value,
                  })
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">
                  Select academic year
                </option>

                {options.academicYears.map(
                  (
                    academicYear,
                  ) => (
                    <option
                      key={
                        academicYear
                      }
                      value={
                        academicYear
                      }
                    >
                      {academicYear}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Field
              label="School Term"
            >
              <select
                value={
                  selection.termId ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  updateSelection({
                    ...selection,

                    termId:
                      event.target
                        .value
                        ? Number(
                            event
                              .target
                              .value,
                          )
                        : null,
                  })
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">
                  Select term
                </option>

                {options.terms.map(
                  (term) => (
                    <option
                      key={
                        term.id
                      }
                      value={
                        term.id
                      }
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
              </select>
            </Field>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Step 2
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Configuration readiness
            </h2>
          </div>

          {!readiness ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-4 font-black text-slate-700">
                Complete the academic
                period selection
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ReadinessMetric
                  icon={
                    UsersRound
                  }
                  label="Students"
                  value={String(
                    readiness
                      .classOption
                      ?.studentCount ??
                      0,
                  )}
                />

                <ReadinessMetric
                  icon={
                    BookOpenCheck
                  }
                  label="Subjects"
                  value={String(
                    readiness
                      .classOption
                      ?.lessonCount ??
                      0,
                  )}
                />

                <ReadinessMetric
                  icon={Scale}
                  label="Weighting"
                  value={
                    readiness.weighting
                      ? "Configured"
                      : "Missing"
                  }
                />

                <ReadinessMetric
                  icon={FileClock}
                  label="Existing Drafts"
                  value={String(
                    readiness
                      .existingReportCards
                      .draft,
                  )}
                />
              </div>

              {readiness.weighting ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <WeightMetric
                    label="Assignment"
                    value={`${readiness.weighting.assignmentWeight}%`}
                  />

                  <WeightMetric
                    label="Assessment"
                    value={`${readiness.weighting.assessmentWeight}%`}
                  />

                  <WeightMetric
                    label="Examination"
                    value={`${readiness.weighting.examWeight}%`}
                  />

                  <WeightMetric
                    label="Pass Mark"
                    value={`${readiness.weighting.passMark}%`}
                  />

                  <WeightMetric
                    label="Grading Scale"
                    value={
                      readiness.weighting
                        .gradingScale.name
                    }
                  />
                </div>
              ) : null}

              {readiness.issues.length >
              0 ? (
                <div className="mt-5 space-y-3">
                  {readiness.issues.map(
                    (
                      issue,
                      index,
                    ) => (
                      <div
                        key={`${issue}-${index}`}
                        className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
                      >
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                        <p className="text-sm font-semibold leading-6 text-red-700">
                          {issue}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />

                  <div>
                    <p className="text-sm font-black text-emerald-900">
                      Ready for generation
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      The selected class and
                      academic configuration
                      passed all preliminary
                      checks.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="mt-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <p className="font-black text-slate-950">
              Generate report-card drafts
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Published and archived cards
              will remain locked and unchanged.
            </p>
          </div>

          <button
            type="button"
            disabled={
              !readiness?.ready ||
              isPending
            }
            onClick={
              handleGenerate
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FilePlus2 className="h-4 w-4" />
            )}

            {isPending
              ? "Generating..."
              : readiness
                    ?.existingReportCards
                    .draft
                ? "Regenerate Drafts"
                : "Generate Drafts"}
          </button>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}

function ReadinessMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-blue-600" />

      <p className="mt-3 text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </article>
  );
}

function WeightMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <p className="text-sm font-black text-blue-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-500">
        {label}
      </p>
    </div>
  );
}