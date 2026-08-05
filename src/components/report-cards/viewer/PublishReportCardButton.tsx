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
  publishReportCard,
} from "@/lib/report-cards/actions";

export default function PublishReportCardButton({
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

  function handlePublish() {
    if (
      disabled ||
      isPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Publish and permanently lock this report card?",
      );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result =
        await publishReportCard(
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
      onClick={handlePublish}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}

      Publish
    </button>
  );
}