"use client";

import Link from "next/link";

import {
  Archive,
  CheckCircle2,
  Crown,
  Edit3,
  Loader2,
  MoreHorizontal,
  RotateCcw,
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

import type {
  GradingScaleStatus,
} from "@prisma/client";

import {
  changeGradingScaleStatus,
  deleteGradingScale,
  setDefaultGradingScale,
} from "@/lib/academic-weightings/actions";

type GradingScaleActionsProps = {
  id: number;
  name: string;

  status: GradingScaleStatus;
  isDefault: boolean;

  weightingCount: number;
};

export default function GradingScaleActions({
  id,
  name,
  status,
  isDefault,
  weightingCount,
}: GradingScaleActionsProps) {
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

  function executeAction(
    action: () => Promise<{
      success: boolean;
      message: string;
    }>,
  ) {
    if (isPending) {
      return;
    }

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
    if (
      !window.confirm(
        `Delete "${name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    executeAction(() =>
      deleteGradingScale({
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
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
        aria-label={`Actions for ${name}`}
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
            className="fixed inset-0 z-40 cursor-default"
            onClick={() =>
              setMenuOpen(false)
            }
          />

          <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
            <ActionLink
              href={`/list/academic-settings/grading-scales/${id}/edit`}
              icon={Edit3}
            >
              Edit grading scale
            </ActionLink>

            {status !==
            "ACTIVE" ? (
              <ActionButton
                icon={
                  status ===
                  "ARCHIVED"
                    ? RotateCcw
                    : CheckCircle2
                }
                onClick={() =>
                  executeAction(() =>
                    changeGradingScaleStatus(
                      {
                        id,
                        status:
                          "ACTIVE",
                      },
                    ),
                  )
                }
              >
                {status ===
                "ARCHIVED"
                  ? "Restore and activate"
                  : "Activate scale"}
              </ActionButton>
            ) : null}

            {status ===
              "ACTIVE" &&
            !isDefault ? (
              <ActionButton
                icon={Crown}
                onClick={() =>
                  executeAction(() =>
                    setDefaultGradingScale(
                      {
                        id,
                      },
                    ),
                  )
                }
              >
                Set as school default
              </ActionButton>
            ) : null}

            {status ===
            "ACTIVE" ? (
              <ActionButton
                icon={Archive}
                disabled={
                  weightingCount >
                    0 ||
                  isDefault
                }
                onClick={() =>
                  executeAction(() =>
                    changeGradingScaleStatus(
                      {
                        id,
                        status:
                          "ARCHIVED",
                      },
                    ),
                  )
                }
              >
                Archive scale
              </ActionButton>
            ) : null}

            <div className="my-2 border-t border-slate-100" />

            <ActionButton
              icon={Trash2}
              danger
              disabled={
                weightingCount > 0 ||
                isDefault
              }
              onClick={
                handleDelete
              }
            >
              Delete scale
            </ActionButton>

            {weightingCount >
            0 ? (
              <p className="px-3 py-2 text-[10px] font-semibold leading-4 text-amber-700">
                This scale is used by{" "}
                {weightingCount} academic{" "}
                {weightingCount === 1
                  ? "weighting"
                  : "weightings"}{" "}
                and cannot be archived or deleted.
              </p>
            ) : null}

            {isDefault ? (
              <p className="px-3 py-2 text-[10px] font-semibold leading-4 text-blue-700">
                Select another default scale before archiving or deleting this
                one.
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: typeof Edit3;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
    >
      <Icon className="h-4 w-4" />

      {children}
    </Link>
  );
}

function ActionButton({
  icon: Icon,
  children,
  onClick,
  disabled = false,
  danger = false,
}: {
  icon: typeof Edit3;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      <Icon className="h-4 w-4" />

      {children}
    </button>
  );
}