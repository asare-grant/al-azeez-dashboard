// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "react-toastify";
// import { useRouter } from "next/navigation";

// import InputField from "../InputField";
// import { termSchema, TermSchema } from "@/lib/formValidationSchemas";
// import { saveTermSettings } from "@/lib/actions";

// const TermForm = ({ data }: { data?: any }) => {
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<TermSchema>({
//     resolver: zodResolver(termSchema) as any,
//     defaultValues: {
//       name: data?.name ?? "FIRST",
//       startDate: data?.startDate
//         ? new Date(data.startDate).toISOString().slice(0, 10)
//         : "",
//       endDate: data?.endDate
//         ? new Date(data.endDate).toISOString().slice(0, 10)
//         : "",
//     },
//   });

//   const onSubmit = handleSubmit(async (values) => {
//     const result = await saveTermSettings(values);

//     if (result.success) {
//       toast.success("Term settings updated");
//       router.refresh();
//     } else {
//       toast.error("Something went wrong");
//     }
//   });

//   return (
//     <form
//       onSubmit={onSubmit}
//       className="bg-white p-4 rounded-md space-y-4 max-w-md "
//     >
//       {/* TERM NAME */}
//       <div>
//         <label className="text-xs text-gray-500">Term</label>
//         <select
//           {...register("name")}
//           className="ring-1 ring-gray-300 p-2 rounded-md w-full"
//         >
//           <option value="FIRST">First Term</option>
//           <option value="SECOND">Second Term</option>
//           <option value="THIRD">Third Term</option>
//         </select>
//       </div>

//       {/* START DATE */}
//       <div className="flex flex-col flex-1 md:flex-row gap-4">
//       <InputField
//         label="Term Start Date"
//         name="startDate"
//         type="date"
//         register={register}
//         error={errors.startDate}
//       />

//       {/* END DATE */}
//       <InputField
//         label="Term End Date"
//         name="endDate"
//         type="date"
//         register={register}
//         error={errors.endDate}
//       />
//       </div>
//       {data?.id && <input type="hidden" {...register("id")} value={data.id} />}

//       <button className="bg-blue-500 text-white p-2 rounded-md w-full">
//         Save Settings
//       </button>
//     </form>
//   );
// };

// export default TermForm;







"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Plus,
  Save,
  Sparkles,
} from "lucide-react";

import { toast } from "react-toastify";

import { useRouter } from "next/navigation";

import { saveTermSettings } from "@/lib/actions";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type TermName =
  | "FIRST"
  | "SECOND"
  | "THIRD";

type SchoolTerm = {
  id: number;

  name: TermName;

  startDate:
    | Date
    | string;

  endDate:
    | Date
    | string;

  isActive:
    boolean;

  academicYearId:
    number | null;

  academicYear?: {
    id: number;
    name: string;
  } | null;
};

type AcademicYearOption = {
  id: number;

  name: string;

  startDate?:
    | Date
    | string;

  endDate?:
    | Date
    | string;

  isActive: boolean;
};

type TermFormProps = {
  data?:
    SchoolTerm | null;

  terms:
    SchoolTerm[];

  academicYears:
    AcademicYearOption[];

  activeAcademicYearId:
    number | null;
};

type TermFormState = {
  name:
    TermName;

  academicYearId:
    number | null;

  startDate:
    string;

  endDate:
    string;

  isActive:
    boolean;
};

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatDate(
  value?:
    | Date
    | string
    | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function formatTermName(
  value:
    TermName,
) {
  switch (value) {
    case "FIRST":
      return "First Term";

    case "SECOND":
      return "Second Term";

    case "THIRD":
      return "Third Term";

    default:
      return value;
  }
}

function createInitialState({
  data,
  activeAcademicYearId,
}: {
  data?:
    SchoolTerm | null;

  activeAcademicYearId:
    number | null;
}): TermFormState {
  return {
    name:
      data?.name ??
      "FIRST",

    academicYearId:
      data?.academicYearId ??
      activeAcademicYearId,

    startDate:
      formatDate(
        data?.startDate,
      ),

    endDate:
      formatDate(
        data?.endDate,
      ),

    isActive:
      data?.isActive ??
      false,
  };
}

/* -------------------------------------------------------------------------- */
/*                              TERM FORM                                     */
/* -------------------------------------------------------------------------- */

export default function TermForm({
  data,
  terms,
  academicYears,
  activeAcademicYearId,
}: TermFormProps) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] =
    useTransition();

  const [
    selectedId,
    setSelectedId,
  ] =
    useState<number | null>(
      data?.id ??
        null,
    );

  const [
    form,
    setForm,
  ] =
    useState<TermFormState>(() =>
      createInitialState({
        data,

        activeAcademicYearId,
      }),
    );

  /* ------------------------------------------------------------------------ */
  /*                          DERIVED VALUES                                  */
  /* ------------------------------------------------------------------------ */

  const selectedAcademicYear =
    useMemo(
      () =>
        academicYears.find(
          (year) =>
            year.id ===
            form.academicYearId,
        ) ?? null,
      [
        academicYears,
        form.academicYearId,
      ],
    );

  const termsForSelectedYear =
    useMemo(
      () =>
        form.academicYearId
          ? terms.filter(
              (term) =>
                term.academicYearId ===
                form.academicYearId,
            )
          : terms,
      [
        terms,
        form.academicYearId,
      ],
    );

  /* ------------------------------------------------------------------------ */
  /*                    LOAD SELECTED EXISTING TERM                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const selected =
      terms.find(
        (term) =>
          term.id ===
          selectedId,
      );

    if (!selected) {
      return;
    }

    setForm({
      name:
        selected.name,

      academicYearId:
        selected.academicYearId,

      startDate:
        formatDate(
          selected.startDate,
        ),

      endDate:
        formatDate(
          selected.endDate,
        ),

      isActive:
        selected.isActive,
    });
  }, [
    selectedId,
    terms,
  ]);

  /* ------------------------------------------------------------------------ */
  /*                              FIELD UPDATE                                */
  /* ------------------------------------------------------------------------ */

  function updateField<
    K extends keyof TermFormState,
  >(
    field: K,
    value: TermFormState[K],
  ) {
    setForm(
      (current) => ({
        ...current,

        [field]:
          value,
      }),
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                            CREATE NEW TERM                               */
  /* ------------------------------------------------------------------------ */

  function startNew() {
    setSelectedId(
      null,
    );

    setForm({
      name:
        "FIRST",

      academicYearId:
        activeAcademicYearId,

      startDate:
        "",

      endDate:
        "",

      isActive:
        false,
    });
  }

  /* ------------------------------------------------------------------------ */
  /*                                SUBMIT                                    */
  /* ------------------------------------------------------------------------ */

  function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !form.academicYearId
    ) {
      toast.error(
        "Select an academic year.",
      );

      return;
    }

    if (
      !form.startDate ||
      !form.endDate
    ) {
      toast.error(
        "Enter the term start and end dates.",
      );

      return;
    }

    const startDate =
      new Date(
        form.startDate,
      );

    const endDate =
      new Date(
        form.endDate,
      );

    if (
      Number.isNaN(
        startDate.getTime(),
      ) ||
      Number.isNaN(
        endDate.getTime(),
      )
    ) {
      toast.error(
        "Enter valid term dates.",
      );

      return;
    }

    if (
      endDate <=
      startDate
    ) {
      toast.error(
        "The term end date must be after the start date.",
      );

      return;
    }

    /*
     * Optional client-side guard.
     * The server action still remains the
     * authoritative validation layer.
     */
    if (
      selectedAcademicYear
        ?.startDate &&
      selectedAcademicYear
        ?.endDate
    ) {
      const yearStart =
        new Date(
          selectedAcademicYear.startDate,
        );

      const yearEnd =
        new Date(
          selectedAcademicYear.endDate,
        );

      if (
        startDate <
          yearStart ||
        endDate >
          yearEnd
      ) {
        toast.error(
          `The term dates must fall within the ${selectedAcademicYear.name} academic year.`,
        );

        return;
      }
    }

    startTransition(
      async () => {
        const result =
          await saveTermSettings({
            id:
              selectedId ??
              undefined,

            academicYearId:
              form.academicYearId!,

            name:
              form.name,

            /*
             * Your current server action
             * expects date strings.
             */
            startDate:
              form.startDate,

            endDate:
              form.endDate,

            isActive:
              form.isActive,
          });

        if (
          !result.success
        ) {
          toast.error(
            result.message ||
              "The term could not be saved.",
          );

          return;
        }

        toast.success(
          result.message ||
            (selectedId
              ? "Term updated successfully."
              : "Term created successfully."),
        );

        router.refresh();
      },
    );
  }

  /* ------------------------------------------------------------------------ */
  /*                                  UI                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-w-0">

      {/* -------------------------------------------------------------- */}
      {/*                  EXISTING TERM SELECTOR                        */}
      {/* -------------------------------------------------------------- */}

      {terms.length >
      0 ? (
        <div className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Configured Terms
            </label>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">
              {
                terms.length
              }{" "}
              {terms.length === 1
                ? "Term"
                : "Terms"}
            </span>
          </div>

          <div className="relative mt-2">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={
                selectedId ??
                ""
              }
              onChange={(
                event,
              ) => {
                const value =
                  event.target
                    .value;

                if (!value) {
                  startNew();

                  return;
                }

                setSelectedId(
                  Number(
                    value,
                  ),
                );
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50"
            >
              <option value="">
                Create new term
              </option>

              {terms.map(
                (term) => (
                  <option
                    key={
                      term.id
                    }
                    value={
                      term.id
                    }
                  >
                    {formatTermName(
                      term.name,
                    )}

                    {term.academicYear
                      ?.name
                      ? ` — ${term.academicYear.name}`
                      : ""}

                    {term.isActive
                      ? " — Active"
                      : ""}
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      ) : (
        <div className="mb-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Sparkles className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-black text-slate-800">
                No terms configured yet
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Create the first school term for an academic year below.
              </p>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-5"
      >

        {/* ------------------------------------------------------------ */}
        {/*                       ACADEMIC YEAR                          */}
        {/* ------------------------------------------------------------ */}

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Academic Year
          </label>

          <div className="relative mt-2">
            <CalendarRange className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={
                form.academicYearId ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "academicYearId",
                  event.target
                    .value
                    ? Number(
                        event.target
                          .value,
                      )
                    : null,
                )
              }
              disabled={
                isPending
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                Select academic year
              </option>

              {academicYears.map(
                (year) => (
                  <option
                    key={
                      year.id
                    }
                    value={
                      year.id
                    }
                  >
                    {
                      year.name
                    }

                    {year.isActive
                      ? " — Active"
                      : ""}
                  </option>
                ),
              )}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-400">
              Every school term belongs to one academic year.
            </p>

            {selectedAcademicYear
              ?.isActive ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />

                Active Year
              </span>
            ) : null}
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/*                         TERM NAME                            */}
        {/* ------------------------------------------------------------ */}

        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            School Term
          </label>

          <div className="relative mt-2">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <select
              value={
                form.name
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "name",
                  event.target
                    .value as TermName,
                )
              }
              disabled={
                isPending
              }
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="FIRST">
                First Term
              </option>

              <option value="SECOND">
                Second Term
              </option>

              <option value="THIRD">
                Third Term
              </option>
            </select>

            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <p className="mt-1.5 text-xs text-slate-400">
            Select the academic term being configured.
          </p>
        </div>

        {/* ------------------------------------------------------------ */}
        {/*                            DATES                             */}
        {/* ------------------------------------------------------------ */}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Term Start Date
            </label>

            <input
              type="date"
              value={
                form.startDate
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "startDate",
                  event.target
                    .value,
                )
              }
              disabled={
                isPending
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Term End Date
            </label>

            <input
              type="date"
              value={
                form.endDate
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "endDate",
                  event.target
                    .value,
                )
              }
              disabled={
                isPending
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/*                     PERIOD SUMMARY                           */}
        {/* ------------------------------------------------------------ */}

        {form.startDate &&
        form.endDate ? (
          <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Clock3 className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.11em] text-violet-700">
                Reporting Period
              </p>

              <p className="mt-1 text-sm font-bold leading-6 text-slate-700">
                {formatTermName(
                  form.name,
                )}

                {selectedAcademicYear
                  ? ` • ${selectedAcademicYear.name}`
                  : ""}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {form.startDate}{" "}
                →{" "}
                {form.endDate}
              </p>
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------------ */}
        {/*                        ACTIVE TERM                           */}
        {/* ------------------------------------------------------------ */}

        <label
          className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${
            form.isActive
              ? "border-emerald-200 bg-emerald-50/70"
              : "border-slate-200 bg-slate-50"
          } ${
            isPending
              ? "cursor-not-allowed opacity-60"
              : ""
          }`}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-slate-800">
                Active School Term
              </p>

              {form.isActive ? (
                <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                  Current
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use this term as the school's current reporting period.
            </p>
          </div>

          <div className="relative shrink-0">
            <input
              type="checkbox"
              checked={
                form.isActive
              }
              disabled={
                isPending
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "isActive",
                  event.target
                    .checked,
                )
              }
              className="peer sr-only"
            />

            <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-600 peer-disabled:opacity-50" />

            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
          </div>
        </label>

        {/* ------------------------------------------------------------ */}
        {/*                           ACTIONS                            */}
        {/* ------------------------------------------------------------ */}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={
              isPending ||
              !form.academicYearId ||
              !form.startDate ||
              !form.endDate
            }
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : selectedId ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {isPending
              ? "Saving..."
              : selectedId
                ? "Update Term"
                : "Create Term"}
          </button>

          {selectedId ? (
            <button
              type="button"
              onClick={
                startNew
              }
              disabled={
                isPending
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />

              New Term
            </button>
          ) : null}
        </div>

        {/* ------------------------------------------------------------ */}
        {/*                         STATUS                               */}
        {/* ------------------------------------------------------------ */}

        {form.isActive ? (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold leading-5 text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              {formatTermName(
                form.name,
              )}

              {selectedAcademicYear
                ? ` for ${selectedAcademicYear.name}`
                : ""}{" "}
              will become the active school term.
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold leading-5 text-slate-500">
            This term will be saved as an inactive academic period.
          </div>
        )}

        {/* ------------------------------------------------------------ */}
        {/*                 EXISTING TERMS IN SELECTED YEAR              */}
        {/* ------------------------------------------------------------ */}

        {form.academicYearId &&
        termsForSelectedYear.length >
          0 ? (
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  Terms in Academic Year
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedAcademicYear
                    ?.name ??
                    "Selected year"}
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                {
                  termsForSelectedYear.length
                }
                /3
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {termsForSelectedYear.map(
                (term) => (
                  <button
                    key={
                      term.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedId(
                        term.id,
                      )
                    }
                    disabled={
                      isPending
                    }
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                      selectedId ===
                      term.id
                        ? "border-violet-200 bg-violet-50"
                        : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          term.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800">
                          {formatTermName(
                            term.name,
                          )}
                        </p>

                        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                          {formatDate(
                            term.startDate,
                          )}{" "}
                          →{" "}
                          {formatDate(
                            term.endDate,
                          )}
                        </p>
                      </div>
                    </div>

                    {term.isActive ? (
                      <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-emerald-700">
                        Active
                      </span>
                    ) : null}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
