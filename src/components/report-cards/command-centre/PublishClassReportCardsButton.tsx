"use client";

import {
  Loader2,
  Send,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useTransition,
} from "react";

import {
  toast,
} from "react-toastify";

import {
  publishClassReportCards,
} from "@/lib/report-cards/actions";

export default function PublishClassReportCardsButton({
  classId,
  academicYear,
  termId,
  publishableCount,
  isAdmin,
}: {
  classId?: number;
  academicYear?: string;
  termId?: number;
  publishableCount: number;
  isAdmin: boolean;
}) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const canPublish =
    isAdmin &&
    Boolean(
      classId &&
        academicYear &&
        termId,
    ) &&
    publishableCount > 0;

  function handlePublish() {
    if (
      !canPublish ||
      !classId ||
      !academicYear ||
      !termId ||
      isPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Publish and permanently lock ${publishableCount} ready report card${
          publishableCount === 1
            ? ""
            : "s"
        }?`,
      );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result =
        await publishClassReportCards(
          {
            classId,
            academicYear,
            termId,
          },
        );

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

  return (
    <button
      type="button"
      onClick={handlePublish}
      disabled={
        !canPublish ||
        isPending
      }
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}

      Publish Ready
      {publishableCount > 0
        ? ` (${publishableCount})`
        : ""}
    </button>
  );
}