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

export default function GradingScaleFilters() {
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
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname,
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
            Find grading scales
          </h3>

          <p className="mt-0.5 text-xs text-slate-500">
            Search by scale name, description, grade or remark.
          </p>
        </div>
      </div>

      <form
        onSubmit={submitSearch}
        className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search grading scales..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <select
          value={
            searchParams.get(
              "status",
            ) ?? "ALL"
          }
          onChange={(event) =>
            updateFilter(
              "status",
              event.target.value ===
                "ALL"
                ? ""
                : event.target.value,
            )
          }
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        >
          <option value="ALL">
            All Statuses
          </option>

          <option value="DRAFT">
            Draft
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="ARCHIVED">
            Archived
          </option>
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
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