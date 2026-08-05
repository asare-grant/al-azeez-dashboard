"use client";

import Link from "next/link";

import {
  CircleOff,
  Edit3,
  Loader2,
  MoreHorizontal,
  Power,
  Trash2,
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
  changeAcademicWeightingStatus,
  deleteAcademicWeighting,
} from "@/lib/academic-weightings/actions";

export default function AcademicWeightingActions({
  id,
  label,
  isActive,
}: {
  id: number;
  label: string;
  isActive: boolean;
}) {
  const router =
    useRouter();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function runAction(
    action: () => Promise<{
      success: boolean;
      message: string;
    }>,
  ) {
    setMenuOpen(false);

    startTransition(async () => {
      const result =
        await action();

      if (!result.success) {
        toast.error(
          result.message,
        );

        return;
      }

      toast.success(
        result.message,
      );

      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed =
      window.confirm(
        `Delete the weighting for ${label}?`,
      );

    if (!confirmed) {
      return;
    }

    runAction(() =>
      deleteAcademicWeighting({
        id,
      }),
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          setMenuOpen(
            (current) =>
              !current,
          )
        }
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40"
            onClick={() =>
              setMenuOpen(false)
            }
          />

          <div className="absolute right-0 top-11 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <Link
              href={`/list/academic-settings/weightings/${id}/edit`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <Edit3 className="h-4 w-4" />

              Edit weighting
            </Link>

            <button
              type="button"
              onClick={() =>
                runAction(() =>
                  changeAcademicWeightingStatus(
                    {
                      id,

                      isActive:
                        !isActive,
                    },
                  ),
                )
              }
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
            >
              {isActive ? (
                <CircleOff className="h-4 w-4" />
              ) : (
                <Power className="h-4 w-4" />
              )}

              {isActive
                ? "Deactivate"
                : "Activate"}
            </button>

            <div className="my-2 border-t border-slate-100" />

            <button
              type="button"
              onClick={handleDelete}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />

              Delete weighting
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}