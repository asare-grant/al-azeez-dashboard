"use client";

import {
  ChevronDown,
  KeyRound,
  Layers3,
  LockKeyhole,
  Search,
  ShieldCheck,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

type Permission = {
  id: number;

  key: string;

  name: string;

  description:
    string | null;

  module:
    string;
};

type PermissionGroup = {
  module: string;

  permissions:
    Permission[];
};

type RolePermission = {
  permission: Permission;
};

type Role = {
  id: number;

  key: string;

  name: string;

  type:
    "SYSTEM" | "CUSTOM";

  isProtected:
    boolean;

  permissions:
    RolePermission[];
};

export default function PermissionMatrix({
  roles,
  permissionGroups,
}: {
  roles:
    Role[];

  permissionGroups:
    PermissionGroup[];
}) {
  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    expanded,
    setExpanded,
  ] =
    useState<
      Set<string>
    >(
      new Set(
        permissionGroups.map(
          (group) =>
            group.module,
        ),
      ),
    );

  const filteredGroups =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return permissionGroups;
      }

      return permissionGroups
        .map(
          (group) => ({
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
                  group.module
                    .toLowerCase()
                    .includes(
                      query,
                    ),
              ),
          }),
        )
        .filter(
          (group) =>
            group.permissions
              .length >
            0,
        );
    }, [
      search,
      permissionGroups,
    ]);

  const rolePermissionSets =
    useMemo(
      () =>
        new Map(
          roles.map(
            (role) => [
              role.id,

              new Set(
                role.permissions.map(
                  (
                    assignment,
                  ) =>
                    assignment
                      .permission
                      .key,
                ),
              ),
            ],
          ),
        ),
      [roles],
    );

  function toggleModule(
    module: string,
  ) {
    setExpanded(
      (current) => {
        const next =
          new Set(
            current,
          );

        if (
          next.has(
            module,
          )
        ) {
          next.delete(
            module,
          );
        } else {
          next.add(
            module,
          );
        }

        return next;
      },
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      {/* HEADER */}

      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              <Layers3 className="h-4 w-4" />

              Permission Architecture
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Role permission matrix
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review exactly which capabilities are granted to each role across
              every management module.
            </p>
          </div>

          <div className="relative w-full xl:w-[330px]">
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
              placeholder="Search permissions..."
              className="h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>
      </div>

      {/* MATRIX */}

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* ROLE HEADER */}

          <div
            className="grid border-b border-slate-100 bg-slate-50"
            style={{
              gridTemplateColumns: `minmax(330px, 1.6fr) repeat(${roles.length}, minmax(125px, 0.7fr))`,
            }}
          >
            <div className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
              Permission
            </div>

            {roles.map(
              (role) => (
                <div
                  key={
                    role.id
                  }
                  className="border-l border-slate-100 px-3 py-4 text-center"
                >
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.08em] text-slate-600">
                    {role.name}
                  </p>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-slate-300">
                    {role.type}
                  </p>
                </div>
              ),
            )}
          </div>

          {/* GROUPS */}

          {filteredGroups.map(
            (group) => {
              const isOpen =
                expanded.has(
                  group.module,
                );

              return (
                <div
                  key={
                    group.module
                  }
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleModule(
                        group.module,
                      )
                    }
                    className="flex w-full items-center justify-between bg-slate-50/60 px-5 py-3 text-left transition hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <KeyRound className="h-3.5 w-3.5" />
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.11em] text-slate-700">
                          {formatModuleName(
                            group.module,
                          )}
                        </p>

                        <p className="mt-0.5 text-[9px] font-bold text-slate-400">
                          {
                            group
                              .permissions
                              .length
                          }{" "}
                          permissions
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {isOpen
                    ? group.permissions.map(
                        (
                          permission,
                        ) => (
                          <div
                            key={
                              permission.id
                            }
                            className="grid border-t border-slate-50 transition hover:bg-blue-50/20"
                            style={{
                              gridTemplateColumns: `minmax(330px, 1.6fr) repeat(${roles.length}, minmax(125px, 0.7fr))`,
                            }}
                          >
                            <div className="px-5 py-4">
                              <p className="text-sm font-black text-slate-800">
                                {
                                  permission.name
                                }
                              </p>

                              <p className="mt-1 font-mono text-[9px] font-semibold text-slate-400">
                                {
                                  permission.key
                                }
                              </p>

                              {permission.description ? (
                                <p className="mt-1.5 max-w-lg text-[11px] leading-5 text-slate-400">
                                  {
                                    permission.description
                                  }
                                </p>
                              ) : null}
                            </div>

                            {roles.map(
                              (
                                role,
                              ) => {
                                const granted =
                                  rolePermissionSets
                                    .get(
                                      role.id,
                                    )
                                    ?.has(
                                      permission.key,
                                    ) ??
                                  false;

                                return (
                                  <div
                                    key={
                                      role.id
                                    }
                                    className="flex items-center justify-center border-l border-slate-50 px-3 py-4"
                                  >
                                    {granted ? (
                                      <span
                                        title="Permission granted"
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                                      >
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                      </span>
                                    ) : (
                                      <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                    )}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        ),
                      )
                    : null}
                </div>
              );
            },
          )}

          {filteredGroups.length ===
          0 ? (
            <div className="p-12 text-center">
              <KeyRound className="mx-auto h-6 w-6 text-slate-300" />

              <p className="mt-3 text-sm font-black text-slate-500">
                No matching permissions
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* SECURITY NOTE */}

      <div className="flex items-start gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

        <p className="text-xs leading-5 text-slate-500">
          Protected system roles are currently read-only. Permission changes
          will be introduced through audited RBAC mutation services rather than
          direct database editing.
        </p>
      </div>
    </section>
  );
}

function formatModuleName(
  value: string,
) {
  return value
    .replace(
      /[_-]/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}