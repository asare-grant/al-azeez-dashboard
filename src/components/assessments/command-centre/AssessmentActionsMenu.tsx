"use client";

import {
  Archive,
  BarChart3,
  Copy,
  Edit3,
  FileClock,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  archiveAssessment,
  closeAssessment,
  deleteAssessment,
  duplicateAssessment,
  returnAssessmentToDraft,
} from "@/lib/assessments/actions";

import type {
  AssessmentCommandItem,
} from "./types";

import AssessmentDeleteModal from "./AssessmentDeleteModal";

type AssessmentActionsMenuProps = {
  assessment: AssessmentCommandItem;
};

export default function AssessmentActionsMenu({
  assessment,
}: AssessmentActionsMenuProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function runAction(
    action: () => Promise<{
      success: boolean;
      message: string;
      data?: unknown;
    }>,
    onSuccess?: (
      result: Awaited<
        ReturnType<typeof action>
      >
    ) => void
  ) {
    setOpen(false);

    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      onSuccess?.(result);

      router.refresh();
    });
  }

  function handleDuplicate() {
    runAction(
      () =>
        duplicateAssessment(
          assessment.id
        ),
      (result) => {
        const data = result.data as
          | {
              assessmentId?: number;
            }
          | undefined;

        if (data?.assessmentId) {
          router.push(
            `/list/assessments/${data.assessmentId}/edit`
          );
        }
      }
    );
  }

  function handleDelete() {
    startTransition(async () => {
      const result =
        await deleteAssessment(
          assessment.id
        );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setDeleteOpen(false);
      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <>
      <div
        ref={menuRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) => !current
            )
          }
          disabled={isPending}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
          aria-label="Assessment actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {open ? (
          <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_22px_60px_rgba(15,23,42,0.16)]">
            {assessment.status ===
            "DRAFT" ? (
              <MenuLink
                href={`/list/assessments/${assessment.id}/edit`}
                icon={Edit3}
                label="Edit assessment"
              />
            ) : null}

            <MenuLink
              href={`/list/assessments/${assessment.id}/submissions`}
              icon={Users}
              label="View submissions"
            />

            <MenuLink
              href={`/list/assessments/${assessment.id}/analytics`}
              icon={BarChart3}
              label="View analytics"
            />

            <MenuButton
              icon={Copy}
              label="Duplicate"
              onClick={handleDuplicate}
            />

            {assessment.status ===
              "SCHEDULED" ||
            assessment.status ===
              "PUBLISHED" ? (
              <MenuButton
                icon={RotateCcw}
                label="Return to draft"
                onClick={() =>
                  runAction(() =>
                    returnAssessmentToDraft(
                      assessment.id
                    )
                  )
                }
              />
            ) : null}

            {assessment.status ===
              "SCHEDULED" ||
            assessment.status ===
              "PUBLISHED" ? (
              <MenuButton
                icon={XCircle}
                label="Close assessment"
                onClick={() =>
                  runAction(() =>
                    closeAssessment(
                      assessment.id
                    )
                  )
                }
              />
            ) : null}

            {assessment.status !==
            "ARCHIVED" ? (
              <MenuButton
                icon={Archive}
                label="Archive assessment"
                onClick={() =>
                  runAction(() =>
                    archiveAssessment(
                      assessment.id
                    )
                  )
                }
              />
            ) : null}

            {assessment.status ===
            "SCHEDULED" ? (
              <MenuLabel
                icon={FileClock}
                label="Waiting to open"
              />
            ) : null}

            {assessment.status ===
            "DRAFT" ? (
              <>
                <div className="my-2 h-px bg-slate-100" />

                <MenuButton
                  icon={Trash2}
                  label="Delete permanently"
                  danger
                  onClick={() => {
                    setOpen(false);
                    setDeleteOpen(true);
                  }}
                />
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      <AssessmentDeleteModal
        open={deleteOpen}
        assessmentTitle={
          assessment.title
        }
        isDeleting={isPending}
        onCancel={() =>
          setDeleteOpen(false)
        }
        onConfirm={handleDelete}
      />
    </>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Edit3;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
    >
      <Icon className="h-4 w-4 text-slate-400" />
      {label}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${
          danger
            ? "text-red-500"
            : "text-slate-400"
        }`}
      />

      {label}
    </button>
  );
}

function MenuLabel({
  icon: Icon,
  label,
}: {
  icon: typeof FileClock;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-400">
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}