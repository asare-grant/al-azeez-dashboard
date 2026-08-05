"use client";

import {
  FilePlus2,
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
  generateClassReportCardDrafts,
} from "@/lib/report-cards/actions";

export default function GenerateReportCardsButton({
  classId,
  academicYear,
  termId,
}: {
  classId?: number;
  academicYear?: string;
  termId?: number;
}) {
  const router =
    useRouter();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const canGenerate =
    Boolean(
      classId &&
        academicYear &&
        termId,
    );

  function handleGenerate() {
    if (
      !canGenerate ||
      !classId ||
      !academicYear ||
      !termId ||
      isPending
    ) {
      return;
    }

    startTransition(async () => {
      const result =
        await generateClassReportCardDrafts(
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
      onClick={handleGenerate}
      disabled={
        !canGenerate ||
        isPending
      }
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FilePlus2 className="h-4 w-4" />
      )}

      {isPending
        ? "Generating..."
        : "Generate Drafts"}
    </button>
  );
}