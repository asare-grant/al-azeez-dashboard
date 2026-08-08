"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  CalendarRange,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
} from "lucide-react";

import {
  toast,
} from "react-toastify";

import {
  useRouter,
} from "next/navigation";

import {
  createSchoolAcademicYear,
  updateSchoolAcademicYear,
} from "@/lib/actions";

type AcademicYear = {
  id:
    number;

  name:
    string;

  startDate:
    Date | string;

  endDate:
    Date | string;

  isActive:
    boolean;
};

type AcademicYearFormProps = {
  data?:
    AcademicYear | null;

  academicYears:
    AcademicYear[];
};

function formatDate(
  value?:
    Date | string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1,
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

export default function AcademicYearForm({
  data,
  academicYears,
}: AcademicYearFormProps) {
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
    useState({
      name:
        data?.name ??
        "",

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
    });

  useEffect(() => {
    if (
      !selectedId
    ) {
      return;
    }

    const selected =
      academicYears.find(
        (year) =>
          year.id ===
          selectedId,
      );

    if (!selected) {
      return;
    }

    setForm({
      name:
        selected.name,

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
    academicYears,
  ]);

  function updateField(
    field:
      keyof typeof form,

    value:
      string | boolean,
  ) {
    setForm(
      (current) => ({
        ...current,

        [field]:
          value,
      }),
    );
  }

  function startNew() {
    setSelectedId(
      null,
    );

    setForm({
      name:
        "",

      startDate:
        "",

      endDate:
        "",

      isActive:
        false,
    });
  }

  function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !form.name.trim()
    ) {
      toast.error(
        "Enter an academic year.",
      );

      return;
    }

    if (
      !form.startDate ||
      !form.endDate
    ) {
      toast.error(
        "Enter the academic year start and end dates.",
      );

      return;
    }

    startTransition(
      async () => {
        const payload = {
          id:
            selectedId ??
            undefined,

          name:
            form.name.trim(),

          startDate:
            new Date(
              form.startDate,
            ),

          endDate:
            new Date(
              form.endDate,
            ),

          isActive:
            form.isActive,
        };

        const result =
          selectedId
            ? await updateSchoolAcademicYear(
                payload,
              )
            : await createSchoolAcademicYear(
                payload,
              );

        if (
          !result.success
        ) {
          toast.error(
            result.message ||
              "The academic year could not be saved.",
          );

          return;
        }

        toast.success(
          selectedId
            ? "Academic year updated successfully."
            : "Academic year created successfully.",
        );

        router.refresh();
      },
    );
  }

  return (
    <div>
      {academicYears.length >
      0 ? (
        <div className="mb-5">
          <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Configured Years
          </label>

          <select
            value={
              selectedId ??
              ""
            }
            onChange={(
              event,
            ) =>
              setSelectedId(
                event.target
                  .value
                  ? Number(
                      event.target
                        .value,
                    )
                  : null,
              )
            }
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          >
            <option value="">
              Create new academic year
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
        </div>
      ) : null}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-5"
      >
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Academic Year
          </label>

          <input
            value={
              form.name
            }
            onChange={(
              event,
            ) =>
              updateField(
                "name",
                event.target
                  .value,
              )
            }
            placeholder="2026/2027"
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <p className="mt-1.5 text-xs text-slate-400">
            Example:
            2026/2027
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Start Date
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
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              End Date
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
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <p className="text-sm font-black text-slate-800">
              Active Academic Year
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use this year as the current academic period across the school.
            </p>
          </div>

          <input
            type="checkbox"
            checked={
              form.isActive
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
            className="h-5 w-5 accent-blue-600"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={
              isPending
            }
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                ? "Update Academic Year"
                : "Create Academic Year"}
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />

              New Year
            </button>
          ) : null}
        </div>

        {form.isActive ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />

            This academic year will be treated as active.
          </div>
        ) : null}
      </form>
    </div>
  );
}