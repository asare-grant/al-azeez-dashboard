"use client";

import {
  Archive,
  Loader2,
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
  archiveReportCard,
} from "@/lib/report-cards/actions";

export default function ArchiveReportCardButton({
  reportCardId,
  disabled,
}: {
  reportCardId: number;
  disabled: boolean;
}) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function handleArchive() {
    if (
      disabled ||
      isPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Archive this report card? Archived cards will no longer be visible to students or parents.",
      );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result =
        await archiveReportCard(
          reportCardId,
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
      disabled={
        disabled ||
        isPending
      }
      onClick={handleArchive}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Archive className="h-4 w-4" />
      )}

      Archive
    </button>
  );
}