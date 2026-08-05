"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Filter,
  RotateCcw,
} from "lucide-react";

import type {
  StudentResultProfileFilterOptions,
} from "@/lib/results";

export default function StudentResultsProfileFilters({
  options,
}: {
  options:
    StudentResultProfileFilterOptions;
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  function updateFilter(
    name: string,
    value: string,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    router.push(
      `${pathname}?${params.toString()}`,
    );
  }

  return (
    <section className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Filter className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-black text-slate-900">
            Profile Filters
          </p>

          <p className="text-xs text-slate-500">
            Analyse a specific academic period or subject.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <FilterSelect
          label="Academic Year"
          value={
            searchParams.get(
              "academicYear",
            ) ?? ""
          }
          onChange={(value) =>
            updateFilter(
              "academicYear",
              value,
            )
          }
        >
          <option value="">
            All Academic Years
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
        </FilterSelect>

        <FilterSelect
          label="Term"
          value={
            searchParams.get(
              "termId",
            ) ?? ""
          }
          onChange={(value) =>
            updateFilter(
              "termId",
              value,
            )
          }
        >
          <option value="">
            All Terms
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
        </FilterSelect>

        <FilterSelect
          label="Subject"
          value={
            searchParams.get(
              "subjectId",
            ) ?? ""
          }
          onChange={(value) =>
            updateFilter(
              "subjectId",
              value,
            )
          }
        >
          <option value="">
            All Subjects
          </option>

          {options.subjects.map(
            (subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
              </option>
            ),
          )}
        </FilterSelect>

        <FilterSelect
          label="Result Type"
          value={
            searchParams.get(
              "type",
            ) ?? ""
          }
          onChange={(value) =>
            updateFilter(
              "type",
              value,
            )
          }
        >
          <option value="">
            All Result Types
          </option>

          <option value="ASSESSMENT">
            Assessments
          </option>

          <option value="EXAM">
            Examinations
          </option>

          <option value="ASSIGNMENT">
            Assignments
          </option>
        </FilterSelect>

        <button
          type="button"
          onClick={() =>
            router.push(pathname)
          }
          className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </section>
  );
}

function FilterSelect({
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
      <span className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}