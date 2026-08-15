"use client";

import {
  KeyRound,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  createCustomRoleAction,
} from "@/lib/access-control/role-actions";

import RolePermissionSelector from "./RolePermissionSelector";

type PermissionGroup = {
  group:
    string;

  permissions:
    {
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
    }[];
};

type SourceRole = {
  id:
    number;

  name:
    string;

  key:
    string;

  description:
    string | null;

  permissionIds:
    number[];
} | null;

export default function CustomRoleBuilder({
  permissionGroups,
  sourceRole,
}: {
  permissionGroups:
    PermissionGroup[];

  sourceRole:
    SourceRole;
}) {
  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] =
    useTransition();

  const [
    name,
    setName,
  ] =
    useState(
      sourceRole
        ? `${sourceRole.name} Copy`
        : "",
    );

  const [
    key,
    setKey,
  ] =
    useState(
      sourceRole
        ? `${sourceRole.key}_custom`
        : "",
    );

  const [
    description,
    setDescription,
  ] =
    useState(
      sourceRole
        ? `Custom role based on ${sourceRole.name}.`
        : "",
    );

  const [
    permissionIds,
    setPermissionIds,
  ] =
    useState<number[]>(
      sourceRole
        ?.permissionIds ??
        [],
    );

  function submit() {
    startTransition(
      async () => {
        const result =
             await createCustomRoleAction({
                name,

                key,

                description,

                permissionIds,
              });

        if (
          !result.success
        ) {
          toast.error(
            result.message,
          );

          return;
        }

        toast.success(
          result.message,
        );

        router.push(
          `/list/access-control/roles/${result.roleId}`,
        );

        router.refresh();
      },
    );
  }

  /*
   * Clone service already copies the source role's
   * permissions, so source role selection is shown
   * read-only for the clone operation.
   *
   * We can support "clone + modify before saving"
   * later by routing clone creation through the
   * standard create service.
   */
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      {/* ROLE IDENTITY */}

      <section className="h-fit rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <Sparkles className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-xl font-black text-slate-950">
          Role identity
        </h2>

        <div className="mt-5 space-y-4">
          <Field
            label="Role name"
            value={
              name
            }
            onChange={
              setName
            }
            placeholder="e.g. Academic Director"
          />

          <Field
            label="Role key"
            value={
              key
            }
            onChange={
              setKey
            }
            placeholder="academic_director"
          />

          <div>
            <label className="text-xs font-black text-slate-600">
              Description
            </label>

            <textarea
              rows={5}
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target
                    .value,
                )
              }
              className="mt-2 w-full rounded-[14px] border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="mt-6 rounded-[16px] bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Selected permissions
            </span>

            <span className="text-xl font-black text-slate-950">
              {
                permissionIds
                  .length
              }
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={
            pending
          }
          onClick={
            submit
          }
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {sourceRole
            ? "Create from Template"
            : "Create Role"}
        </button>
      </section>

      {/* PERMISSIONS */}

      <div>
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Authorization
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-950">
            Permission selection
          </h2>
        </div>

        <RolePermissionSelector
          groups={
            permissionGroups
          }
          selectedIds={
            permissionIds
          }
          onChange={
            setPermissionIds
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string,
    ) => void;

  placeholder:
    string;
}) {
  return (
    <div>
      <label className="text-xs font-black text-slate-600">
        {
          label
        }
      </label>

      <input
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .value,
          )
        }
        placeholder={
          placeholder
        }
        className="mt-2 h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-sm font-semibold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
      />
    </div>
  );
}