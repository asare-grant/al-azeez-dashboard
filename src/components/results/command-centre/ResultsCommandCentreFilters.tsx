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
  useEffect,
  useState,
} from "react";

import type {
  ResultsCommandCentreFilterOptions,
} from "@/lib/results";

type ResultsCommandCentreFiltersProps = {
  options: ResultsCommandCentreFilterOptions;
};

export default function ResultsCommandCentreFilters({
  options,
}: ResultsCommandCentreFiltersProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  const [search, setSearch] =
    useState(
      searchParams.get("search") ??
        "",
    );

  useEffect(() => {
    setSearch(
      searchParams.get("search") ??
        "",
    );
  }, [searchParams]);

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
      `${pathname}?${params.toString()}`,
    );
  }

  function submitSearch(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    updateFilter(
      "search",
      search.trim(),
    );
  }

  function resetFilters() {
    setSearch("");

    router.push(pathname);
  }

  return (
    <section className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          <Filter className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-black text-slate-900">
            Advanced Filters
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Narrow results by academic
            item, class, student or period.
          </p>
        </div>
      </div>

      <form
        onSubmit={submitSearch}
        className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-4"
      >
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search student, ID, title or subject..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <FilterSelect
          label="Result Type"
          value={
            searchParams.get("type") ??
            "ALL"
          }
          onChange={(value) =>
            updateFilter(
              "type",
              value === "ALL"
                ? ""
                : value,
            )
          }
        >
          <option value="ALL">
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

        <FilterSelect
          label="Class"
          value={
            searchParams.get(
              "classId",
            ) ?? ""
          }
          onChange={(value) =>
            updateFilter(
              "classId",
              value,
            )
          }
        >
          <option value="">
            All Classes
          </option>

          {options.classes.map(
            (classItem) => (
              <option
                key={classItem.id}
                value={classItem.id}
              >
                {classItem.name}
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
          label="Student"
          value={
            searchParams.get(
              "studentId",
            ) ?? ""
          }
          onChange={(value) =>
            updateFilter(
              "studentId",
              value,
            )
          }
        >
          <option value="">
            All Students
          </option>

          {options.students.map(
            (student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.surname},{" "}
                {student.name} —{" "}
                {student.studentID}
              </option>
            ),
          )}
        </FilterSelect>

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
          label="Academic Term"
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
                {formatEnumLabel(
                  term.name,
                )}
                {term.isActive
                  ? " — Active"
                  : ""}
              </option>
            ),
          )}
        </FilterSelect>

        <div className="flex gap-2 xl:col-span-4 xl:justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <RotateCcw className="h-4 w-4" />

            Reset
          </button>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
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
    <label className="flex min-w-0 flex-col gap-2">
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
        className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  );
}

function formatEnumLabel(
  value: string,
) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}