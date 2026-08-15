"use client";

import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useMemo, useState, useTransition } from "react";

import { toast } from "react-toastify";

import {
  updateCustomRoleAction,
  updateRolePermissionsAction,
} from "@/lib/access-control/role-actions";

import RolePermissionSelector from "./RolePermissionSelector";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type PermissionItem = {
  id: number;

  key: string;

  name: string;

  description: string | null;

  group: string;

  sortOrder: number;

  assigned: boolean;
};

type PermissionGroup = {
  group: string;

  permissions: PermissionItem[];
};

type EditableRole = {
  id: number;

  key: string;

  name: string;

  description: string | null;

  type: "SYSTEM" | "CUSTOM";

  isProtected: boolean;

  isActive: boolean;

  permissionCount: number;
};

/* -------------------------------------------------------------------------- */
/*                                  COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export default function CustomRoleEditor({
  role,
  permissionGroups,
}: {
  role: EditableRole;

  permissionGroups: PermissionGroup[];
}) {
  const router = useRouter();

  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(role.name);

  const [description, setDescription] = useState(role.description ?? "");

  const initialPermissionIds = useMemo(
    () =>
      permissionGroups.flatMap((group) =>
        group.permissions
          .filter((permission) => permission.assigned)
          .map((permission) => permission.id),
      ),
    [permissionGroups],
  );

  const [permissionIds, setPermissionIds] =
    useState<number[]>(initialPermissionIds);

  /* ---------------------------------------------------------------------- */
  /*                              CHANGE STATE                              */
  /* ---------------------------------------------------------------------- */

  const identityChanged =
    name.trim() !== role.name ||
    description.trim() !== (role.description ?? "").trim();

  const permissionChanged = useMemo(() => {
    const initial = new Set(initialPermissionIds);

    const current = new Set(permissionIds);

    if (initial.size !== current.size) {
      return true;
    }

    for (const id of initial) {
      if (!current.has(id)) {
        return true;
      }
    }

    return false;
  }, [initialPermissionIds, permissionIds]);

  const hasChanges = identityChanged || permissionChanged;

  /* ---------------------------------------------------------------------- */
  /*                                 SAVE                                   */
  /* ---------------------------------------------------------------------- */

  function handleSave() {
    if (!hasChanges || pending) {
      return;
    }

    startTransition(async () => {
      /*
       * Save identity first if required.
       */
      if (identityChanged) {
        const identityResult = await updateCustomRoleAction({
          roleId: role.id,

          name,

          description,
        });

        if (!identityResult.success) {
          toast.error(identityResult.message);

          return;
        }
      }

      /*
       * Permissions use their own audited
       * differential mutation.
       */
      if (permissionChanged) {
        const permissionResult = await updateRolePermissionsAction({
          roleId: role.id,

          permissionIds,
        });

        if (!permissionResult.success) {
          toast.error(permissionResult.message);

          return;
        }

        if (permissionResult.added > 0 || permissionResult.removed > 0) {
          toast.success(
            `Permissions updated: ${permissionResult.added} added, ${permissionResult.removed} removed.`,
          );
        }
      }

      toast.success("Role changes saved successfully.");

      router.push(`/list/access-control/roles/${role.id}`);

      router.refresh();
    });
  }

  /* ---------------------------------------------------------------------- */
  /*                                RENDER                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
      {/* ================================================================ */}
      {/* ROLE IDENTITY                                                    */}
      {/* ================================================================ */}

      <aside className="h-fit rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6 xl:sticky xl:top-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-violet-50 text-violet-600">
            <KeyRound className="h-5 w-5" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-violet-700">
            <ShieldCheck className="h-3 w-3" />
            Custom Role
          </span>
        </div>

        <h2 className="mt-5 text-xl font-black tracking-tight text-slate-950">
          Role identity
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Update how this access profile appears to administrators.
        </p>

        {/* ROLE KEY */}

        <div className="mt-5 rounded-[16px] border border-slate-200 bg-slate-50 p-3.5">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Stable role key
          </p>

          <p className="mt-1.5 break-all font-mono text-xs font-bold text-slate-700">
            {role.key}
          </p>

          <p className="mt-2 text-[10px] leading-4 text-slate-400">
            Role keys cannot be changed after creation because they may become
            permanent application identifiers.
          </p>
        </div>

        {/* NAME */}

        <div className="mt-5">
          <label className="text-xs font-black text-slate-600">Role name</label>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            className="mt-2 h-11 w-full rounded-[14px] border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>

        {/* DESCRIPTION */}

        <div className="mt-4">
          <label className="text-xs font-black text-slate-600">
            Description
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            className="mt-2 w-full resize-none rounded-[14px] border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />

          <p className="mt-1 text-right text-[9px] font-bold text-slate-300">
            {description.length}
            /500
          </p>
        </div>

        {/* SELECTION SUMMARY */}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-[16px] bg-slate-50 p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Permissions
            </p>

            <p className="mt-2 text-2xl font-black text-slate-950">
              {permissionIds.length}
            </p>
          </div>

          <div className="rounded-[16px] bg-slate-50 p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Changes
            </p>

            <p
              className={`mt-2 text-sm font-black ${
                hasChanges ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {hasChanges ? "Unsaved" : "Saved"}
            </p>
          </div>
        </div>

        {/* SAVE */}

        <button
          type="button"
          disabled={pending || !hasChanges || !name.trim()}
          onClick={handleSave}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : hasChanges ? (
            <Save className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}

          {pending
            ? "Saving..."
            : hasChanges
              ? "Save Changes"
              : "No Unsaved Changes"}
        </button>

        {hasChanges ? (
          <div className="mt-3 flex items-start gap-2 rounded-[14px] border border-amber-200 bg-amber-50 p-3 text-[10px] font-semibold leading-5 text-amber-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Changes to permissions affect every active user currently assigned
            to this role.
          </div>
        ) : null}
      </aside>

      {/* ================================================================ */}
      {/* PERMISSION EDITOR                                                */}
      {/* ================================================================ */}

      <main className="min-w-0">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Authorization
          </p>

          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            Role permissions
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Select the exact actions this role is permitted to perform. Changes
            are audited individually when saved.
          </p>
        </div>

        <RolePermissionSelector
          groups={permissionGroups}
          selectedIds={permissionIds}
          onChange={setPermissionIds}
        />
      </main>
    </div>
  );
}
