"use client";

import {
  AlertTriangle,
  Archive,
  Loader2,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  retireRoleAction,
} from "@/lib/access-control/role-actions";

export default function RetireRoleButton({
  roleId,
  roleName,
  assignedUsers,
}: {
  roleId:
    number;

  roleName:
    string;

  assignedUsers:
    number;
}) {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );

  const [
    pending,
    startTransition,
  ] =
    useTransition();

  function handleRetire() {
    if (
      pending
    ) {
      return;
    }

    startTransition(
      async () => {
        const result =
          await retireRoleAction(
            roleId,
          );

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

        setOpen(
          false,
        );

        router.push(
          "/list/access-control/roles",
        );

        router.refresh();
      },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setOpen(
            true,
          )
        }
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 transition hover:border-red-300 hover:bg-red-100"
      >
        <Archive className="h-4 w-4" />

        Retire Role
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
            {/* HEADER */}

            <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-500/20 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-red-300">
                    Sensitive Access Change
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    Retire this role?
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(
                    false,
                  )
                }
                disabled={
                  pending
                }
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* BODY */}

            <div className="p-6">
              <p className="text-sm leading-7 text-slate-600">
                You are about to retire{" "}
                <span className="font-black text-slate-950">
                  {roleName}
                </span>
                . The role will remain in historical records but will stop
                contributing permissions to active users.
              </p>

              {assignedUsers >
              0 ? (
                <div className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-black text-amber-800">
                    {assignedUsers} user
                    {assignedUsers ===
                    1
                      ? ""
                      : "s"}{" "}
                    currently assigned
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Their historical assignment remains recorded, but this
                    role's permissions will no longer be effective once it is
                    inactive.
                  </p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={
                    pending
                  }
                  onClick={() =>
                    setOpen(
                      false,
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    pending
                  }
                  onClick={
                    handleRetire
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}

                  {pending
                    ? "Retiring..."
                    : "Retire Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}