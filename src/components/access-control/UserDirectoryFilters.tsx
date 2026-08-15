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

type RoleOption = {
  id:
    number;

  key:
    string;

  name:
    string;

  type:
    "SYSTEM" |
    "CUSTOM";
};

export default function UserDirectoryFilters({
  roles,
}: {
  roles:
    RoleOption[];
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
  ] =
    useState(
      searchParams.get(
        "search",
      ) ??
        "",
    );

  const selectedRole =
    searchParams.get(
      "role",
    ) ??
    "";

  const selectedStatus =
    searchParams.get(
      "status",
    ) ??
    "ALL";

  function updateParams(
    updates:
      Record<
        string,
        string | null
      >,
  ) {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    for (
      const [
        key,
        value,
      ] of Object.entries(
        updates,
      )
    ) {
      if (
        !value ||
        value ===
          "ALL"
      ) {
        params.delete(
          key,
        );
      } else {
        params.set(
          key,
          value,
        );
      }
    }

    /*
     * Whenever filters change,
     * reset pagination.
     */
    params.delete(
      "page",
    );

    const query =
      params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  }

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          const current =
            searchParams.get(
              "search",
            ) ??
            "";

          if (
            search !==
            current
          ) {
            updateParams({
              search:
                search ||
                null,
            });
          }
        },
        400,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    search,
  ]);

  const hasFilters =
    Boolean(
      search ||
        selectedRole ||
        (
          selectedStatus &&
          selectedStatus !==
            "ALL"
        ),
    );

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        {/* SEARCH */}

        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event,
            ) =>
              setSearch(
                event.target
                  .value,
              )
            }
            placeholder="Search by name, username, email or phone..."
            className="h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>

        {/* ROLE */}

        <div className="relative xl:w-[220px]">
          <select
            value={
              selectedRole
            }
            onChange={(
              event,
            ) =>
              updateParams({
                role:
                  event.target
                    .value ||
                  null,
              })
            }
            className="h-11 w-full appearance-none rounded-[14px] border border-slate-200 bg-white px-4 pr-9 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="">
              All roles
            </option>

            {roles.map(
              (
                role,
              ) => (
                <option
                  key={
                    role.id
                  }
                  value={
                    role.key
                  }
                >
                  {
                    role.name
                  }
                </option>
              ),
            )}
          </select>

          <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        {/* STATUS */}

        <div className="xl:w-[180px]">
          <select
            value={
              selectedStatus
            }
            onChange={(
              event,
            ) =>
              updateParams({
                status:
                  event.target
                    .value,
              })
            }
            className="h-11 w-full rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            <option value="ALL">
              All statuses
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="SUSPENDED">
              Suspended
            </option>

            <option value="DISABLED">
              Disabled
            </option>
          </select>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setSearch(
                "",
              );

              router.push(
                pathname,
              );
            }}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-4 text-xs font-black text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-4 w-4" />

            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}