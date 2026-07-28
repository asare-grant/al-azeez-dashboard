"use client";

import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import type {
  AssessmentFilterOption,
} from "./types";

type AssessmentCommandFiltersProps = {
  classes: AssessmentFilterOption[];
  subjects: AssessmentFilterOption[];
};

const statusTabs = [
  {
    label: "All",
    value: "",
  },
  {
    label: "Drafts",
    value: "DRAFT",
  },
  {
    label: "Scheduled",
    value: "SCHEDULED",
  },
  {
    label: "Live",
    value: "PUBLISHED",
  },
  {
    label: "Closed",
    value: "CLOSED",
  },
  {
    label: "Archived",
    value: "ARCHIVED",
  },
];

export default function AssessmentCommandFilters({
  classes,
  subjects,
}: AssessmentCommandFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  const [searchValue, setSearchValue] =
    useState(
      searchParams.get("search") ?? ""
    );

  const currentStatus =
    searchParams.get("status") ?? "";

  const currentClass =
    searchParams.get("classId") ?? "";

  const currentSubject =
    searchParams.get("subjectId") ?? "";

  function updateParameter(
    key: string,
    value?: string
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    if (
      value === undefined ||
      value === ""
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    params.delete("page");

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  useEffect(() => {
    const timeout =
      window.setTimeout(() => {
        const currentSearch =
          searchParams.get("search") ??
          "";

        if (
          searchValue === currentSearch
        ) {
          return;
        }

        updateParameter(
          "search",
          searchValue.trim()
        );
      }, 500);

    return () =>
      window.clearTimeout(timeout);
  }, [searchValue]);

  const hasFilters =
    Boolean(currentStatus) ||
    Boolean(currentClass) ||
    Boolean(currentSubject) ||
    Boolean(
      searchParams.get("search")
    );

  function clearFilters() {
    setSearchValue("");
    router.push(pathname);
  }

  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.04)] sm:p-5">
      <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-2">
          {statusTabs.map((tab) => {
            const active =
              currentStatus === tab.value;

            return (
              <button
                key={tab.label}
                type="button"
                onClick={() =>
                  updateParameter(
                    "status",
                    tab.value
                  )
                }
                className={`rounded-xl px-4 py-2.5 text-xs font-black transition ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_220px_220px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={searchValue}
            onChange={(event) =>
              setSearchValue(
                event.target.value
              )
            }
            placeholder="Search assessments, classes or subjects..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <select
          value={currentClass}
          onChange={(event) =>
            updateParameter(
              "classId",
              event.target.value
            )
          }
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        >
          <option value="">
            All classes
          </option>

          {classes.map((classItem) => (
            <option
              key={classItem.id}
              value={classItem.id}
            >
              {classItem.name}
            </option>
          ))}
        </select>

        <select
          value={currentSubject}
          onChange={(event) =>
            updateParameter(
              "subjectId",
              event.target.value
            )
          }
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        >
          <option value="">
            All subjects
          </option>

          {subjects.map(
            (subject) => (
              <option
                key={subject.id}
                value={subject.id}
              >
                {subject.name}
              </option>
            )
          )}
        </select>

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        ) : (
          <div className="hidden h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-400 lg:flex">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
        )}
      </div>
    </section>
  );
}