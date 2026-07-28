"use client";

import {
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Save,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  toast,
} from "react-toastify";

import { 
    saveAssessmentTeacherFeedback 
} from "@/lib/assessments/actions";

type TeacherFeedbackPanelProps = {
  assessmentId: number;
  studentId: string;
  attemptId: number;

  initialFeedback: string | null;

  reviewedAt:
    | Date
    | string
    | null;

  reviewedBy:
    | {
        name: string;
        surname: string;
      }
    | null;

  disabled?: boolean;
};

function formatReviewDate(
  value: Date | string | null
) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

export default function TeacherFeedbackPanel({
  assessmentId,
  studentId,
  attemptId,
  initialFeedback,
  reviewedAt,
  reviewedBy,
  disabled = false,
}: TeacherFeedbackPanelProps) {
  const router = useRouter();

  const [feedback, setFeedback] =
    useState(
      initialFeedback ?? ""
    );

  const [savedFeedback, setSavedFeedback] =
    useState(
      initialFeedback ?? ""
    );

  const [isPending, startTransition] =
    useTransition();

  useEffect(() => {
    setFeedback(
      initialFeedback ?? ""
    );

    setSavedFeedback(
      initialFeedback ?? ""
    );
  }, [
    attemptId,
    initialFeedback,
  ]);

  const hasChanges =
    feedback.trim() !==
    savedFeedback.trim();

  function saveFeedback(
    value = feedback
  ) {
    startTransition(async () => {
      const result =
        await saveAssessmentTeacherFeedback({
          assessmentId,
          attemptId,
          studentId,
          feedback: value,
        });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      const normalized =
        result.data?.feedback ??
        "";

      setFeedback(normalized);
      setSavedFeedback(normalized);

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <section className="print:shadow-none rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <MessageSquareText className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Teacher Feedback
          </p>

          <h2 className="mt-1 text-xl font-black text-slate-950">
            Submission comments
          </h2>
        </div>
      </div>

      <textarea
        value={feedback}
        disabled={disabled}
        onChange={(event) =>
          setFeedback(
            event.target.value
          )
        }
        rows={8}
        maxLength={3000}
        placeholder="Add constructive feedback, areas of strength and recommendations for improvement..."
        className="print:hidden mt-5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="hidden print:block mt-5 min-h-28 rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-800">
        {savedFeedback ||
          "No teacher feedback has been provided."}
      </div>

      <div className="print:hidden mt-2 flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-slate-400">
          {feedback.length}/3000
        </p>

        {hasChanges ? (
          <p className="text-xs font-black text-amber-600">
            Unsaved changes
          </p>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved
          </p>
        )}
      </div>

      <div className="print:hidden mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {savedFeedback ? (
          <button
            type="button"
            disabled={
              isPending ||
              disabled
            }
            onClick={() => {
              setFeedback("");
              saveFeedback("");
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Remove Feedback
          </button>
        ) : null}

        <button
          type="button"
          disabled={
            isPending ||
            disabled ||
            !hasChanges
          }
          onClick={() =>
            saveFeedback()
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          Save Feedback
        </button>
      </div>

      {reviewedAt ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs leading-5 text-slate-400">
            Last reviewed{" "}
            {formatReviewDate(
              reviewedAt
            )}
            {reviewedBy
              ? ` by ${reviewedBy.name} ${reviewedBy.surname}`
              : ""}
            .
          </p>
        </div>
      ) : null}
    </section>
  );
}