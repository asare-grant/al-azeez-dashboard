"use client";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  FilePlus2,
  GraduationCap,
  Layers3,
  Loader2,
  LockKeyhole,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
  XCircle,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useMemo,
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
  ReportCardGenerationCheck,
} from "@/lib/report-cards/generation-validator";

import type {
  ReportCardGenerationSummary,
} from "@/lib/report-cards/generation-types";

import type {
  ReportCardGenerationPageData,
  ReportCardGenerationReadiness,
  ReportCardGenerationSelection,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                                 PROPS                                      */
/* -------------------------------------------------------------------------- */

type ReportCardGenerationStudioProps = {
  options:
    ReportCardGenerationPageData;

  initialSelection:
    ReportCardGenerationSelection;

  readiness:
    ReportCardGenerationReadiness
    | null;
};

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

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
    allowPartial,
    setAllowPartial,
  ] = useState(false);

  const [
    generationResult,
    setGenerationResult,
  ] = useState<
    ReportCardGenerationSummary | null
  >(null);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const requiresPartialConsent =
    Boolean(
      readiness
        ?.canGeneratePartialReports,
    );

  const canGenerate =
    Boolean(
      readiness?.ready &&
        selection.classId &&
        selection.academicYear &&
        selection.termId &&
        !isPending &&
        (
          !requiresPartialConsent ||
          allowPartial
        ),
    );

  const existingDrafts =
    readiness?.summary
      .existingDrafts ?? 0;

  const generationButtonLabel =
    existingDrafts > 0
      ? "Regenerate Drafts"
      : "Generate Drafts";

  /*
   * Reset transient state whenever the server returns
   * readiness for a different academic selection.
   */
  const selectionKey =
    useMemo(
      () =>
        [
          initialSelection.classId ??
            "",
          initialSelection.academicYear,
          initialSelection.termId ??
            "",
        ].join("-"),

      [
        initialSelection.classId,
        initialSelection.academicYear,
        initialSelection.termId,
      ],
    );

  useEffect(() => {
  setSelection({
    classId:
      initialSelection.classId,

    academicYear:
      initialSelection.academicYear,

    termId:
      initialSelection.termId,
  });

  setAllowPartial(false);

  setGenerationResult(null);

  // selectionKey represents all selection properties.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectionKey]);

  function updateSelection(
    next:
      ReportCardGenerationSelection,
  ) {
    setSelection(next);

    setAllowPartial(false);

    setGenerationResult(
      null,
    );

    const params =
      new URLSearchParams();

    if (next.classId) {
      params.set(
        "classId",
        String(next.classId),
      );
    }

    if (
      next.academicYear
    ) {
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

    const query =
      params.toString();

    router.replace(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  }

  function handleGenerate() {
    if (
      !canGenerate ||
      !readiness ||
      !selection.classId ||
      !selection.academicYear ||
      !selection.termId
    ) {
      return;
    }

    const className =
      readiness.class?.name ??
      "the selected class";

    const confirmationMessage =
      existingDrafts > 0
        ? `Regenerate ${existingDrafts} existing draft report card${
            existingDrafts === 1
              ? ""
              : "s"
          } for ${className} and create any missing drafts?`
        : `Generate report-card drafts for ${className}?`;

    if (
      !window.confirm(
        confirmationMessage,
      )
    ) {
      return;
    }

    setGenerationResult(
      null,
    );

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

            allowPartial:
              requiresPartialConsent
                ? allowPartial
                : false,
          });

        if (!result.success) {
          toast.error(
            result.message,
          );

          return;
        }

        setGenerationResult(
          result.data,
        );

        toast.success(
          result.message,
        );

        router.refresh();
      },
    );
  }

  function openGeneratedReports() {
    if (
      !selection.classId ||
      !selection.academicYear ||
      !selection.termId
    ) {
      return;
    }

    const params =
      new URLSearchParams({
        classId:
          String(
            selection.classId,
          ),

        academicYear:
          selection.academicYear,

        termId:
          String(
            selection.termId,
          ),
      });

    router.push(
      `/list/report-cards?${params.toString()}`,
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1600px]">
        <Link
          href="/list/report-cards"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Report Cards
        </Link>

        <GenerationHero
          readiness={
            readiness
          }
        />

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-6">
            <AcademicPeriodSelection
              options={options}
              selection={
                selection
              }
              onChange={
                updateSelection
              }
            />

            <ReadinessWorkspace
              readiness={
                readiness
              }
            />

            {readiness ? (
              <SubjectReadinessTable
                readiness={
                  readiness
                }
              />
            ) : null}

            {generationResult ? (
              <GenerationResultPanel
                result={
                  generationResult
                }
                onOpenReports={
                  openGeneratedReports
                }
              />
            ) : null}
          </div>

          <aside className="min-w-0 space-y-6 2xl:sticky 2xl:top-6 2xl:self-start">
            <GenerationSummaryCard
              readiness={
                readiness
              }
            />

            {requiresPartialConsent ? (
              <PartialGenerationConsent
                checked={
                  allowPartial
                }
                onChange={
                  setAllowPartial
                }
                warningCount={
                  readiness?.warnings
                    .length ?? 0
                }
              />
            ) : null}

            <GenerationActionCard
              readiness={
                readiness
              }
              canGenerate={
                canGenerate
              }
              isPending={
                isPending
              }
              allowPartial={
                allowPartial
              }
              requiresPartialConsent={
                requiresPartialConsent
              }
              buttonLabel={
                generationButtonLabel
              }
              onGenerate={
                handleGenerate
              }
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HERO                                      */
/* -------------------------------------------------------------------------- */

function GenerationHero({
  readiness,
}: {
  readiness:
    ReportCardGenerationReadiness
    | null;
}) {
  return (
    <section className="relative mt-5 overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:rounded-[36px] sm:p-9 lg:p-11">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_500px] xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
            <GraduationCap className="h-4 w-4" />
            Academic Processing
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Report Card Generation Studio
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Validate academic records,
            inspect subject-level readiness,
            generate secure report-card
            snapshots and preserve published
            historical records.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric
            icon={UsersRound}
            label="Students"
            value={String(
              readiness?.summary
                .students ?? 0,
            )}
          />

          <HeroMetric
            icon={BookOpenCheck}
            label="Subjects"
            value={String(
              readiness?.summary
                .subjects ?? 0,
            )}
          />

          <HeroMetric
            icon={ShieldCheck}
            label="Readiness"
            value={
              readiness
                ? `${readiness.completionPercentage}%`
                : "Not checked"
            }
          />

          <HeroMetric
            icon={
              readiness?.ready
                ? CheckCircle2
                : LockKeyhole
            }
            label="Generation"
            value={
              readiness?.ready
                ? "Available"
                : "Blocked"
            }
          />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                         ACADEMIC SELECTION                                 */
/* -------------------------------------------------------------------------- */

function AcademicPeriodSelection({
  options,
  selection,
  onChange,
}: {
  options:
    ReportCardGenerationPageData;

  selection:
    ReportCardGenerationSelection;

  onChange: (
    selection:
      ReportCardGenerationSelection,
  ) => void;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
        Step 1
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950">
        Select academic period
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Choose the class, academic year
        and school term to inspect.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Field label="Class">
          <SelectWrapper>
            <select
              value={
                selection.classId ??
                ""
              }
              onChange={(
                event,
              ) =>
                onChange({
                  ...selection,

                  classId:
                    event.target
                      .value
                      ? Number(
                          event.target
                            .value,
                        )
                      : null,
                })
              }
              className={selectClassName}
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
                    {classOption.name} —{" "}
                    {
                      classOption
                        .studentCount
                    }{" "}
                    students
                  </option>
                ),
              )}
            </select>
          </SelectWrapper>
        </Field>

        <Field label="Academic Year">
          <SelectWrapper>
            <select
              value={
                selection.academicYear
              }
              onChange={(
                event,
              ) =>
                onChange({
                  ...selection,

                  academicYear:
                    event.target
                      .value,
                })
              }
              className={selectClassName}
            >
              <option value="">
                Select academic year
              </option>

              {options.academicYears.map(
                (academicYear) => (
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
          </SelectWrapper>
        </Field>

        <Field label="School Term">
          <SelectWrapper>
            <select
              value={
                selection.termId ??
                ""
              }
              onChange={(
                event,
              ) =>
                onChange({
                  ...selection,

                  termId:
                    event.target
                      .value
                      ? Number(
                          event.target
                            .value,
                        )
                      : null,
                })
              }
              className={selectClassName}
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
            </select>
          </SelectWrapper>
        </Field>
      </div>
    </section>
  );
}

const selectClassName =
  "h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100";

function SelectWrapper({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                         READINESS WORKSPACE                                */
/* -------------------------------------------------------------------------- */

function ReadinessWorkspace({
  readiness,
}: {
  readiness:
    ReportCardGenerationReadiness
    | null;
}) {
  if (!readiness) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Step 2
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Configuration readiness
        </h2>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-9 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />

          <p className="mt-4 font-black text-slate-700">
            Complete the academic
            period selection
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Readiness checks will appear
            after all required selections
            have been made.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Step 2
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Configuration readiness
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Structural and academic checks
            for the complete filtered class.
          </p>
        </div>

        <ReadinessBadge
          readiness={
            readiness
          }
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-black text-slate-800">
            Validation completion
          </p>

          <p className="text-sm font-black text-blue-700">
            {
              readiness
                .completionPercentage
            }
            %
          </p>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  readiness
                    .completionPercentage,
                ),
              )}%`,
            }}
            className={`h-full rounded-full transition-all ${
              readiness.ready
                ? "bg-emerald-500"
                : readiness.errors
                      .length > 0
                  ? "bg-red-500"
                  : "bg-amber-500"
            }`}
          />
        </div>
      </div>

      {readiness.weighting ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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

      <div className="mt-6 grid gap-3">
        {readiness.checks.map(
          (check) => (
            <ReadinessCheckCard
              key={check.id}
              check={check}
            />
          ),
        )}
      </div>
    </section>
  );
}

function ReadinessBadge({
  readiness,
}: {
  readiness:
    ReportCardGenerationReadiness;
}) {
  if (
    readiness.errors.length > 0
  ) {
    return (
      <span className="inline-flex items-center gap-2 self-start rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-red-700">
        <XCircle className="h-3.5 w-3.5" />
        Generation Blocked
      </span>
    );
  }

  if (
    readiness.warnings.length > 0
  ) {
    return (
      <span className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" />
        Partial Data
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Ready
    </span>
  );
}

function ReadinessCheckCard({
  check,
}: {
  check:
    ReportCardGenerationCheck;
}) {
  const config = {
    SUCCESS: {
      icon:
        CheckCircle2,

      className:
        "border-emerald-200 bg-emerald-50",

      iconClass:
        "bg-emerald-100 text-emerald-700",

      titleClass:
        "text-emerald-950",

      textClass:
        "text-emerald-700",
    },

    WARNING: {
      icon:
        AlertTriangle,

      className:
        "border-amber-200 bg-amber-50",

      iconClass:
        "bg-amber-100 text-amber-700",

      titleClass:
        "text-amber-950",

      textClass:
        "text-amber-700",
    },

    ERROR: {
      icon:
        XCircle,

      className:
        "border-red-200 bg-red-50",

      iconClass:
        "bg-red-100 text-red-700",

      titleClass:
        "text-red-950",

      textClass:
        "text-red-700",
    },
  }[check.severity];

  const Icon =
    config.icon;

  return (
    <article
      className={`flex items-start gap-4 rounded-2xl border p-4 ${config.className}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`font-black ${config.titleClass}`}
          >
            {check.title}
          </h3>

          <span className="rounded-full bg-white/70 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
            {check.status}
          </span>
        </div>

        <p
          className={`mt-1 text-sm leading-6 ${config.textClass}`}
        >
          {check.message}
        </p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                         SUBJECT READINESS                                  */
/* -------------------------------------------------------------------------- */

function SubjectReadinessTable({
  readiness,
}: {
  readiness:
    ReportCardGenerationReadiness;
}) {
  if (
    readiness.subjects.length === 0
  ) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          Step 3
        </p>

        <h2 className="mt-2 text-2xl font-black text-slate-950">
          Subject readiness
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Review category coverage and
          missing student results by subject.
        </p>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1050px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <TableHeading>
                Subject
              </TableHeading>

              <TableHeading>
                Academic Items
              </TableHeading>

              <TableHeading>
                Result Records
              </TableHeading>

              <TableHeading>
                Missing Results
              </TableHeading>

              <TableHeading>
                Status
              </TableHeading>
            </tr>
          </thead>

          <tbody>
            {readiness.subjects.map(
              (subject) => (
                <tr
                  key={
                    subject.subjectId
                  }
                  className="border-b border-slate-100"
                >
                  <TableCell>
                    <p className="font-black text-slate-950">
                      {
                        subject.subjectName
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        subject.studentCount
                      }{" "}
                      students
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="font-bold text-slate-700">
                      {
                        subject.assignmentCount
                      }{" "}
                      assignment
                      {subject.assignmentCount ===
                      1
                        ? ""
                        : "s"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        subject.assessmentCount
                      }{" "}
                      assessments •{" "}
                      {
                        subject.examinationCount
                      }{" "}
                      examinations
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="font-bold text-slate-700">
                      {
                        subject.assignmentResultCount
                      }{" "}
                      assignment
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        subject.assessmentResultCount
                      }{" "}
                      assessment •{" "}
                      {
                        subject.examinationResultCount
                      }{" "}
                      examination
                    </p>
                  </TableCell>

                  <TableCell>
                    <MissingResults
                      assignment={
                        subject
                          .missingAssignmentResults
                      }
                      assessment={
                        subject
                          .missingAssessmentResults
                      }
                      examination={
                        subject
                          .missingExaminationResults
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <CalculationStatusBadge
                      status={
                        subject
                          .calculationStatus
                      }
                    />
                  </TableCell>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:hidden">
        {readiness.subjects.map(
          (subject) => (
            <article
              key={
                subject.subjectId
              }
              className="rounded-[22px] border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">
                    {
                      subject.subjectName
                    }
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {
                      subject.studentCount
                    }{" "}
                    students
                  </p>
                </div>

                <CalculationStatusBadge
                  status={
                    subject
                      .calculationStatus
                  }
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <SmallMetric
                  label="Assignments"
                  value={
                    subject.assignmentCount
                  }
                />

                <SmallMetric
                  label="Assessments"
                  value={
                    subject.assessmentCount
                  }
                />

                <SmallMetric
                  label="Exams"
                  value={
                    subject.examinationCount
                  }
                />
              </div>

              <div className="mt-4">
                <MissingResults
                  assignment={
                    subject
                      .missingAssignmentResults
                  }
                  assessment={
                    subject
                      .missingAssessmentResults
                  }
                  examination={
                    subject
                      .missingExaminationResults
                  }
                />
              </div>
            </article>
          ),
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                           SUMMARY SIDEBAR                                  */
/* -------------------------------------------------------------------------- */

function GenerationSummaryCard({
  readiness,
}: {
  readiness:
    ReportCardGenerationReadiness
    | null;
}) {
  const summary =
    readiness?.summary;

  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BarChart3 className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-black text-slate-950">
            Generation Summary
          </h2>

          <p className="text-xs text-slate-400">
            Complete academic dataset
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SummaryMetric
          label="Students"
          value={
            summary?.students ?? 0
          }
        />

        <SummaryMetric
          label="Subjects"
          value={
            summary?.subjects ?? 0
          }
        />

        <SummaryMetric
          label="Assignments"
          value={
            summary?.assignments ?? 0
          }
        />

        <SummaryMetric
          label="Assessments"
          value={
            summary?.assessments ?? 0
          }
        />

        <SummaryMetric
          label="Examinations"
          value={
            summary?.examinations ?? 0
          }
        />

        <SummaryMetric
          label="All Results"
          value={
            (
              summary?.assignmentResults ??
              0
            ) +
            (
              summary?.assessmentResults ??
              0
            ) +
            (
              summary?.examinationResults ??
              0
            )
          }
        />
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          Existing report cards
        </p>

        <div className="mt-3 space-y-2">
          <LifecycleRow
            label="All Existing"
            value={
              summary?.existingReportCards ??
              0
            }
          />

          <LifecycleRow
            label="Drafts"
            value={
              summary?.existingDrafts ??
              0
            }
          />

          <LifecycleRow
            label="Published"
            value={
              summary?.publishedCards ??
              0
            }
          />

          <LifecycleRow
            label="Archived"
            value={
              summary?.archivedCards ??
              0
            }
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                           PARTIAL CONSENT                                  */
/* -------------------------------------------------------------------------- */

function PartialGenerationConsent({
  checked,
  onChange,
  warningCount,
}: {
  checked: boolean;

  onChange: (
    value: boolean,
  ) => void;

  warningCount: number;
}) {
  return (
    <label className={`block cursor-pointer rounded-[26px] border p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] transition sm:p-6 ${
      checked
        ? "border-amber-400 bg-amber-50"
        : "border-amber-200 bg-white"
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(
            event,
          ) =>
            onChange(
              event.target.checked,
            )
          }
          className="mt-1 h-4 w-4 shrink-0 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
        />

        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />

            <p className="font-black text-amber-950">
              Allow partial generation
            </p>
          </div>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            {warningCount} readiness
            warning
            {warningCount === 1
              ? ""
              : "s"}{" "}
            were detected. Students with
            missing records will receive
            partial drafts.
          </p>

          <p className="mt-3 text-xs font-bold leading-5 text-amber-800">
            Partial report cards cannot be
            approved or published until their
            missing results are completed and
            the drafts are regenerated.
          </p>
        </div>
      </div>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                             ACTION CARD                                    */
/* -------------------------------------------------------------------------- */

function GenerationActionCard({
  readiness,
  canGenerate,
  isPending,
  allowPartial,
  requiresPartialConsent,
  buttonLabel,
  onGenerate,
}: {
  readiness:
    ReportCardGenerationReadiness
    | null;

  canGenerate: boolean;
  isPending: boolean;
  allowPartial: boolean;

  requiresPartialConsent:
    boolean;

  buttonLabel: string;

  onGenerate: () => void;
}) {
  let helperText =
    "Select a complete academic period to continue.";

  if (readiness) {
    if (
      readiness.errors.length > 0
    ) {
      helperText =
        "Resolve all blocking errors before generation.";
    } else if (
      requiresPartialConsent &&
      !allowPartial
    ) {
      helperText =
        "Confirm partial generation to continue with incomplete student records.";
    } else {
      helperText =
        "The selected academic period can now be processed.";
    }
  }

  return (
    <section className="rounded-[26px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_22px_65px_rgba(15,23,42,0.22)] sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
        <Sparkles className="h-5 w-5" />
      </div>

      <h2 className="mt-5 text-xl font-black">
        Generate report-card drafts
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {helperText}
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex justify-between gap-3">
          <span className="text-xs font-bold text-slate-400">
            Structural errors
          </span>

          <span className="text-xs font-black text-white">
            {readiness?.errors
              .length ?? 0}
          </span>
        </div>

        <div className="mt-3 flex justify-between gap-3">
          <span className="text-xs font-bold text-slate-400">
            Data warnings
          </span>

          <span className="text-xs font-black text-white">
            {readiness?.warnings
              .length ?? 0}
          </span>
        </div>

        <div className="mt-3 flex justify-between gap-3">
          <span className="text-xs font-bold text-slate-400">
            Existing drafts
          </span>

          <span className="text-xs font-black text-white">
            {readiness?.summary
              .existingDrafts ?? 0}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={
          !canGenerate
        }
        onClick={
          onGenerate
        }
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FilePlus2 className="h-4 w-4" />
        )}

        {isPending
          ? "Generating..."
          : buttonLabel}
      </button>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                         GENERATION RESULT                                  */
/* -------------------------------------------------------------------------- */

function GenerationResultPanel({
  result,
  onOpenReports,
}: {
  result:
    ReportCardGenerationSummary;

  onOpenReports: () => void;
}) {
  const seconds =
    result.durationMilliseconds /
    1000;

  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_22px_65px_rgba(15,23,42,0.08)]">
      <div className="bg-emerald-600 p-5 text-white sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em]">
              <CheckCircle2 className="h-4 w-4" />
              Generation Complete
            </div>

            <h2 className="mt-4 text-2xl font-black sm:text-3xl">
              {result.className}
            </h2>

            <p className="mt-2 text-sm text-emerald-100">
              {result.termName.replace(
                /_/g,
                " ",
              )}{" "}
              • {result.academicYear}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onOpenReports
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
          >
            <ClipboardCheck className="h-4 w-4" />
            Open Report Cards
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ResultMetric
            label="Created"
            value={result.created}
            icon={FilePlus2}
          />

          <ResultMetric
            label="Regenerated"
            value={result.regenerated}
            icon={RefreshCcw}
          />

          <ResultMetric
            label="Preserved"
            value={result.preserved}
            icon={LockKeyhole}
          />

          <ResultMetric
            label="Skipped"
            value={result.skipped}
            icon={CircleAlert}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ResultMetric
            label="Academically Ready"
            value={result.ready}
            icon={CheckCircle2}
          />

          <ResultMetric
            label="Partial"
            value={result.partial}
            icon={AlertTriangle}
          />

          <ResultMetric
            label="Blocked"
            value={result.blocked}
            icon={XCircle}
          />

          <ResultMetric
            label="Subject Snapshots"
            value={
              result.subjectSnapshotsCreated
            }
            icon={Layers3}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
          <div className="grid gap-4 sm:grid-cols-3">
            <ResultSummary
              label="Students Processed"
              value={String(
                result.studentCount,
              )}
            />

            <ResultSummary
              label="Subjects"
              value={String(
                result.subjectCount,
              )}
            />

            <ResultSummary
              label="Processing Time"
              value={`${seconds.toFixed(
                2,
              )} seconds`}
            />
          </div>
        </div>

        {result.warnings.length >
        0 ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-black text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              Generation warnings
            </p>

            <div className="mt-3 space-y-2">
              {result.warnings.map(
                (
                  warning,
                  index,
                ) => (
                  <p
                    key={`${warning}-${index}`}
                    className="text-xs leading-5 text-amber-700"
                  >
                    {warning}
                  </p>
                ),
              )}
            </div>
          </div>
        ) : null}

        {result.reportCards.some(
          (item) =>
            item.action ===
              "SKIPPED",
        ) ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-black text-red-900">
              Skipped report cards
            </p>

            <div className="mt-3 space-y-2">
              {result.reportCards
                .filter(
                  (item) =>
                    item.action ===
                    "SKIPPED",
                )
                .map(
                  (item) => (
                    <div
                      key={
                        item.studentId
                      }
                      className="rounded-xl bg-white/70 p-3"
                    >
                      <p className="text-xs font-black text-red-900">
                        {
                          item.studentName
                        }
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-700">
                        {item.message}
                      </p>
                    </div>
                  ),
                )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                            SMALL COMPONENTS                                */
/* -------------------------------------------------------------------------- */

function WeightMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <p className="break-words text-sm font-black text-blue-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-500">
        {label}
      </p>
    </div>
  );
}

function CalculationStatusBadge({
  status,
}: {
  status:
    | "READY"
    | "PARTIAL"
    | "BLOCKED";
}) {
  const config = {
    READY:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    PARTIAL:
      "border-amber-200 bg-amber-50 text-amber-700",

    BLOCKED:
      "border-red-200 bg-red-50 text-red-700",
  }[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.11em] ${config}`}
    >
      {status}
    </span>
  );
}

function MissingResults({
  assignment,
  assessment,
  examination,
}: {
  assignment: number;
  assessment: number;
  examination: number;
}) {
  const total =
    assignment +
    assessment +
    examination;

  if (total === 0) {
    return (
      <span className="text-xs font-black text-emerald-600">
        None missing
      </span>
    );
  }

  return (
    <div className="space-y-1 text-xs">
      {assignment > 0 ? (
        <p className="font-bold text-amber-700">
          {assignment} assignment
        </p>
      ) : null}

      {assessment > 0 ? (
        <p className="font-bold text-amber-700">
          {assessment} assessment
        </p>
      ) : null}

      {examination > 0 ? (
        <p className="font-bold text-amber-700">
          {examination} examination
        </p>
      ) : null}
    </div>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-lg font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function LifecycleRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-xs font-bold text-slate-500">
        {label}
      </span>

      <span className="text-sm font-black text-slate-900">
        {value}
      </span>
    </div>
  );
}

function ResultMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Trophy;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="h-5 w-5 text-blue-600" />

      <p className="mt-3 text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </article>
  );
}

function ResultSummary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-lg font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-2.5 text-center">
      <p className="font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function TableHeading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="px-5 py-5 align-middle">
      {children}
    </td>
  );
}