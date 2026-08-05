"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  AcademicWeightingFormOptions,
} from "@/lib/academic-weightings/types";

export default function AcademicWeightingFilters({
  options,
}: {
  options:
    AcademicWeightingFormOptions;
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [
    search,
    setSearch,
  ] = useState(
    searchParams.get("search") ??
      "",
  );

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

    params.delete("page");

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname,
    );
  }

  return (
    <section className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          <Filter className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-900">
            Filter configurations
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Search by year, grade or grading scale.
          </p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();

          updateFilter(
            "search",
            search.trim(),
          );
        }}
        className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6"
      >
        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value,
            )
          }
          placeholder="Search configurations..."
          className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 xl:col-span-2"
        />

        <FilterSelect
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
              </option>
            ),
          )}
        </FilterSelect>

        <FilterSelect
          value={
            searchParams.get(
              "gradeId",
            ) ?? ""
          }
          onChange={(value) =>
            updateFilter(
              "gradeId",
              value,
            )
          }
        >
          <option value="">
            All Grades
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
        </FilterSelect>

        <FilterSelect
          value={
            searchParams.get(
              "status",
            ) ?? "ALL"
          }
          onChange={(value) =>
            updateFilter(
              "status",
              value === "ALL"
                ? ""
                : value,
            )
          }
        >
          <option value="ALL">
            All Statuses
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>
        </FilterSelect>

        <div className="flex gap-2 md:col-span-2 xl:col-span-6 xl:justify-end">
          <button
            type="button"
            onClick={() => {
              setSearch("");
              router.push(pathname);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600"
          >
            <RotateCcw className="h-4 w-4" />

            Reset
          </button>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white"
          >
            <Search className="h-4 w-4" />

            Search
          </button>
        </div>
      </form>
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  children: React.ReactNode;
}) {
  return (
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
  );
}