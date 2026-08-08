"use client";

import {
  ChevronDown,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  ClipboardCheck,
  Eye,
  FileDown,
} from "lucide-react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";

import type {
  ReportCardCommandFilters,
  ReportCardFilterOptions,
} from "../types";

type ReportCardFiltersProps = {
  options: ReportCardFilterOptions;
  currentFilters: ReportCardCommandFilters;
};

export default function ReportCardFilters({
  options,
  currentFilters,
}: ReportCardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentFilters.search ?? "");

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSearch(currentFilters.search ?? "");
  }, [currentFilters.search]);

  const activeFilterCount = useMemo(() => {
    return [
      currentFilters.search,
      currentFilters.classId,
      currentFilters.academicYear,
      currentFilters.termId,
      currentFilters.status,
      currentFilters.calculationStatus,
      currentFilters.freshness,
      currentFilters.reviewStatus,
    ].filter(Boolean).length;
  }, [currentFilters]);

  function navigateWithParams(params: URLSearchParams) {
    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  }

  function updateFilter(key: keyof ReportCardCommandFilters, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    navigateWithParams(params);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    updateFilter("search", search.trim());
  }

  function clearSearch() {
    setSearch("");

    updateFilter("search", "");
  }

  function resetFilters() {
    setSearch("");
    setShowMobileFilters(false);

    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:rounded-[28px]">
      {/* HEADER */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-blue-50/40 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-blue-50 shadow-lg shadow-blue-600/20">
              <SlidersHorizontal className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-slate-950 sm:text-lg">
                  Report filters
                </h2>

                {activeFilterCount > 0 ? (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-100 px-2 text-[10px] font-black text-blue-700">
                    {activeFilterCount}
                  </span>
                ) : null}
              </div>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                Search students and refine the academic period, publication
                status, class and report readiness.
              </p>
            </div>
          </div>

          {/* MOBILE FILTER TOGGLE */}
          <button
            type="button"
            onClick={() => setShowMobileFilters((current) => !current)}
            aria-expanded={showMobileFilters}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 lg:hidden"
          >
            <Filter className="h-4 w-4" />

            <span className="hidden xs:inline">Filters</span>

            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showMobileFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by student name, student ID or class..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            {search ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>

        {/* FILTER GRID */}
        <div
          className={`mt-5 ${showMobileFilters ? "block" : "hidden"} lg:block`}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <FilterField label="Class">
              <FilterSelect
                value={currentFilters.classId ?? ""}
                onChange={(value) => updateFilter("classId", value)}
                placeholder="All classes"
                options={options.classes.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </FilterField>

            <FilterField label="Academic Year">
              <FilterSelect
                value={currentFilters.academicYear ?? ""}
                onChange={(value) => updateFilter("academicYear", value)}
                placeholder="All academic years"
                options={options.academicYears.map((item) => ({
                  value: item,
                  label: item,
                }))}
              />
            </FilterField>

            <FilterField label="School Term">
              <FilterSelect
                value={currentFilters.termId ?? ""}
                onChange={(value) => updateFilter("termId", value)}
                placeholder="All terms"
                options={options.terms.map((term) => ({
                  value: String(term.id),

                  label: `${term.name.replace(/_/g, " ")}${
                    term.isActive ? " — Active" : ""
                  }`,
                }))}
              />
            </FilterField>

            <FilterField label="Publication Status">
              <FilterSelect
                value={currentFilters.status ?? ""}
                onChange={(value) => updateFilter("status", value)}
                placeholder="All statuses"
                options={[
                  {
                    value: "DRAFT",
                    label: "Draft",
                  },
                  {
                    value: "PUBLISHED",
                    label: "Published",
                  },
                  {
                    value: "ARCHIVED",
                    label: "Archived",
                  },
                ]}
              />
            </FilterField>

            <FilterField label="Report Readiness">
              <FilterSelect
                value={currentFilters.calculationStatus ?? ""}
                onChange={(value) => updateFilter("calculationStatus", value)}
                placeholder="All readiness levels"
                options={[
                  {
                    value: "READY",
                    label: "Ready",
                  },
                  {
                    value: "PARTIAL",
                    label: "Partial",
                  },
                  {
                    value: "BLOCKED",
                    label: "Blocked",
                  },
                ]}
              />
            </FilterField>

            <FilterField label="Freshness">
              <FilterSelect
                value={currentFilters.freshness ?? ""}
                onChange={(value) => updateFilter("freshness", value)}
                placeholder="All freshness"
                options={[
                  {
                    value: "FRESH",
                    label: "Fresh",
                  },
                  {
                    value: "STALE",
                    label: "Needs Regeneration",
                  },
                ]}
              />
            </FilterField>       

            <FilterField label="Review Workflow">
              <FilterSelect
                value={currentFilters.reviewStatus ?? ""}
                onChange={(value) => updateFilter("reviewStatus", value)}
                placeholder="All review stages"
                options={[
                  {
                    value: "DRAFT",
                    label: "Preparing",
                  },
                  {
                    value: "SUBMITTED",
                    label: "Awaiting Review",
                  },
                  {
                    value: "CHANGES_REQUESTED",
                    label: "Changes Requested",
                  },
                  {
                    value: "APPROVED",
                    label: "Approved",
                  },
                ]}
              />
            </FilterField>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium leading-5 text-slate-400">
              Filter changes are applied automatically and reset pagination to
              the first page.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              disabled={isPending || activeFilterCount === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-blue-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Reset all filters
            </button>
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="h-1 w-full overflow-hidden bg-blue-50">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
        </div>
      ) : null}
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>

      {children}
    </label>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;

  onChange: (value: string) => void;

  placeholder: string;

  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none truncate rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
