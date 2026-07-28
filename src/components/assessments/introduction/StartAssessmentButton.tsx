"use client";

import {
  ArrowRight,
  Loader2,
  Play,
  RotateCcw,
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
  startAssessmentAttempt,
} from "@/lib/assessments/actions";

type StartAssessmentButtonProps = {
  assessmentId: number;

  activeAttemptId?: number | null;

  canStart: boolean;
  canContinue: boolean;

  unavailableReason?: string | null;
};

export default function StartAssessmentButton({
  assessmentId,
  activeAttemptId,
  canStart,
  canContinue,
  unavailableReason,
}: StartAssessmentButtonProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  function handleStart() {
    if (
      canContinue &&
      activeAttemptId
    ) {
      router.push(
        `/student/assessments/${assessmentId}/take?attemptId=${activeAttemptId}`
      );

      return;
    }

    if (!canStart) {
      toast.info(
        unavailableReason ??
          "This assessment is not currently available."
      );

      return;
    }

    startTransition(async () => {
      const result =
        await startAssessmentAttempt({
          assessmentId,
        });

      if (
        !result.success ||
        !result.data
      ) {
        toast.error(result.message);
        return;
      }

      router.push(
        `/student/assessments/${assessmentId}/take?attemptId=${result.data.attemptId}`
      );
    });
  }

  const enabled =
    canStart || canContinue;

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={
        isPending || !enabled
      }
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4.5 w-4.5 animate-spin" />
          Preparing Assessment
        </>
      ) : canContinue ? (
        <>
          <RotateCcw className="h-4.5 w-4.5" />
          Continue Assessment
          <ArrowRight className="h-4.5 w-4.5" />
        </>
      ) : (
        <>
          <Play className="h-4.5 w-4.5" />
          Start Assessment
          <ArrowRight className="h-4.5 w-4.5" />
        </>
      )}
    </button>
  );
}