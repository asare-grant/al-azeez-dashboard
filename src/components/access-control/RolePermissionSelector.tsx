"use client";

import {
  Check,
  ChevronDown,
  KeyRound,
  Search,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

type PermissionItem = {
  id:
    number;

  key:
    string;

  name:
    string;

  description:
    string | null;

  group:
    string;

  assigned?:
    boolean;
};

type PermissionGroup = {
  group:
    string;

  permissions:
    PermissionItem[];
};

export default function RolePermissionSelector({
  groups,
  selectedIds,
  onChange,
  disabled = false,
}: {
  groups:
    PermissionGroup[];

  selectedIds:
    number[];

  onChange:
    (
      ids:
        number[],
    ) => void;

  disabled?:
    boolean;
}) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const selected =
    useMemo(
      () =>
        new Set(
          selectedIds,
        ),
      [
        selectedIds,
      ],
    );

  const visibleGroups =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (
        !query
      ) {
        return groups;
      }

      return groups
        .map(
          (
            group,
          ) => ({
            ...group,

            permissions:
              group.permissions.filter(
                (
                  permission,
                ) =>
                  permission.name
                    .toLowerCase()
                    .includes(
                      query,
                    ) ||
                  permission.key
                    .toLowerCase()
                    .includes(
                      query,
                    ) ||
                  permission.description
                    ?.toLowerCase()
                    .includes(
                      query,
                    ) ||
                  group.group
                    .toLowerCase()
                    .includes(
                      query,
                    ),
              ),
          }),
        )
        .filter(
          (
            group,
          ) =>
            group.permissions
              .length >
            0,
        );
    }, [
      groups,
      search,
    ]);

  function setPermission(
    permissionId:
      number,

    enabled:
      boolean,
  ) {
    if (
      disabled
    ) {
      return;
    }

    const next =
      new Set(
        selected,
      );

    if (
      enabled
    ) {
      next.add(
        permissionId,
      );
    } else {
      next.delete(
        permissionId,
      );
    }

    onChange(
      Array.from(
        next,
      ),
    );
  }

  function setGroup(
    permissionIds:
      number[],

    enabled:
      boolean,
  ) {
    if (
      disabled
    ) {
      return;
    }

    const next =
      new Set(
        selected,
      );

    for (
      const id of
      permissionIds
    ) {
      if (
        enabled
      ) {
        next.add(
          id,
        );
      } else {
        next.delete(
          id,
        );
      }
    }

    onChange(
      Array.from(
        next,
      ),
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
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
            placeholder="Search permissions..."
            className="h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleGroups.map(
          (
            group,
          ) => {
            const ids =
              group.permissions.map(
                (
                  permission,
                ) =>
                  permission.id,
              );

            const selectedCount =
              ids.filter(
                (
                  id,
                ) =>
                  selected.has(
                    id,
                  ),
              ).length;

            const allSelected =
              ids.length >
                0 &&
              selectedCount ===
                ids.length;

            return (
              <section
                key={
                  group.group
                }
                className="p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-blue-600" />

                      <h3 className="text-xs font-black uppercase tracking-[0.12em] text-slate-700">
                        {formatGroup(
                          group.group,
                        )}
                      </h3>
                    </div>

                    <p className="mt-1 text-[10px] font-bold text-slate-400">
                      {
                        selectedCount
                      }{" "}
                      of{" "}
                      {
                        ids.length
                      }{" "}
                      selected
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      disabled
                    }
                    onClick={() =>
                      setGroup(
                        ids,

                        !allSelected,
                      )
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {allSelected
                      ? "Clear group"
                      : "Select group"}
                  </button>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {group.permissions.map(
                    (
                      permission,
                    ) => {
                      const checked =
                        selected.has(
                          permission.id,
                        );

                      return (
                        <button
                          key={
                            permission.id
                          }
                          type="button"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            setPermission(
                              permission.id,

                              !checked,
                            )
                          }
                          className={`flex items-start gap-3 rounded-[16px] border p-3 text-left transition ${
                            checked
                              ? "border-blue-200 bg-blue-50/70"
                              : "border-slate-200 bg-white hover:border-blue-200"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              checked
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {checked ? (
                              <Check className="h-3 w-3" />
                            ) : null}
                          </span>

                          <span>
                            <span className="block text-sm font-black text-slate-800">
                              {
                                permission.name
                              }
                            </span>

                            <span className="mt-1 block font-mono text-[9px] text-slate-400">
                              {
                                permission.key
                              }
                            </span>

                            {permission.description ? (
                              <span className="mt-1 block text-[11px] leading-5 text-slate-500">
                                {
                                  permission.description
                                }
                              </span>
                            ) : null}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </section>
            );
          },
        )}
      </div>
    </div>
  );
}

function formatGroup(
  value:
    string,
) {
  return value
    .replace(
      /[_-]/g,
      " ",
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
}