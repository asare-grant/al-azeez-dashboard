"use client";

import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  FormEvent,
  useEffect,
  useState,
  useTransition,
} from "react";

import type {
  ReportCardBulkReviewFilters,
  ReportCardBulkReviewOptions,
} from "@/lib/report-cards/bulk-review-types";

type ReportCardBulkReviewFiltersProps = {
  options:
    ReportCardBulkReviewOptions;

  currentFilters:
    ReportCardBulkReviewFilters;
};

export default function ReportCardBulkReviewFilterss({
  options,
  currentFilters,
}: ReportCardBulkReviewFiltersProps) {
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
    currentFilters.search ?? "",
  );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  useEffect(() => {
    setSearch(
      currentFilters.search ?? "",
    );
  }, [
    currentFilters.search,
  ]);

  function navigate(
    params:
      URLSearchParams,
  ) {
    const query =
      params.toString();

    startTransition(() => {
      router.push(
        query
          ? `${pathname}?${query}`
          : pathname,
      );
    });
  }

  function updateFilter(
    key: keyof ReportCardBulkReviewFilters,
    value: string,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (value) {
      params.set(
        key,
        value,
      );
    } else {
      params.delete(key);
    }

    params.delete("page");

    navigate(params);
  }

  function handleSearch(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    updateFilter(
      "search",
      search.trim(),
    );
  }

  function resetFilters() {
    setSearch("");

    startTransition(() => {
      router.push(
        pathname,
      );
    });
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50/40 p-5 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          <SlidersHorizontal className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-black text-slate-950 sm:text-lg">
            Class and Academic Period
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Narrow the workspace to one class,
            term and academic year before
            processing report cards.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <form
          onSubmit={
            handleSearch
          }
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search student name or ID..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={
              isPending
            }
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </form>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <FilterField
            label="Class"
          >
            <FilterSelect
              value={
                currentFilters.classId ??
                ""
              }
              placeholder="All classes"
              onChange={(
                value,
              ) =>
                updateFilter(
                  "classId",
                  value,
                )
              }
              options={options.classes.map(
                (item) => ({
                  value:
                    String(
                      item.id,
                    ),

                  label:
                    `${item.name} — ${item.grade.level}`,
                }),
              )}
            />
          </FilterField>

          <FilterField
            label="Academic Year"
          >
            <FilterSelect
              value={
                currentFilters.academicYear ??
                ""
              }
              placeholder="All academic years"
              onChange={(
                value,
              ) =>
                updateFilter(
                  "academicYear",
                  value,
                )
              }
              options={options.academicYears.map(
                (item) => ({
                  value:
                    item,

                  label:
                    item,
                }),
              )}
            />
          </FilterField>

          <FilterField
            label="School Term"
          >
            <FilterSelect
              value={
                currentFilters.termId ??
                ""
              }
              placeholder="All terms"
              onChange={(
                value,
              ) =>
                updateFilter(
                  "termId",
                  value,
                )
              }
              options={options.terms.map(
                (term) => ({
                  value:
                    String(
                      term.id,
                    ),

                  label:
                    `${term.name.replace(
                      /_/g,
                      " ",
                    )}${
                      term.isActive
                        ? " — Active"
                        : ""
                    }`,
                }),
              )}
            />
          </FilterField>

          <FilterField
            label="Review Stage"
          >
            <FilterSelect
              value={
                currentFilters.reviewStatus ??
                ""
              }
              placeholder="All review stages"
              onChange={(
                value,
              ) =>
                updateFilter(
                  "reviewStatus",
                  value,
                )
              }
              options={[
                {
                  value:
                    "DRAFT",

                  label:
                    "Preparing",
                },

                {
                  value:
                    "SUBMITTED",

                  label:
                    "Awaiting Review",
                },

                {
                  value:
                    "CHANGES_REQUESTED",

                  label:
                    "Changes Requested",
                },

                {
                  value:
                    "APPROVED",

                  label:
                    "Approved",
                },
              ]}
            />
          </FilterField>

          <FilterField
            label="Academic Readiness"
          >
            <FilterSelect
              value={
                currentFilters.calculationStatus ??
                ""
              }
              placeholder="All readiness"
              onChange={(
                value,
              ) =>
                updateFilter(
                  "calculationStatus",
                  value,
                )
              }
              options={[
                {
                  value:
                    "READY",

                  label:
                    "Ready",
                },

                {
                  value:
                    "PARTIAL",

                  label:
                    "Partial",
                },

                {
                  value:
                    "BLOCKED",

                  label:
                    "Blocked",
                },
              ]}
            />
          </FilterField>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={
              resetFilters
            }
            disabled={
              isPending
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </button>
        </div>
      </div>
    </section>
  );
}

function FilterField({
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

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string;
  placeholder: string;

  options: {
    value: string;
    label: string;
  }[];

  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          ),
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}