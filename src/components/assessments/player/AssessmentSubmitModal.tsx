"use client";

import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  Loader2,
  Send,
  X,
} from "lucide-react";

type AssessmentSubmitModalProps = {
  open: boolean;

  questionCount: number;
  answeredCount: number;
  unansweredCount: number;
  flaggedCount: number;

  allowUnanswered: boolean;
  isSubmitting: boolean;
  autoSubmission?: boolean;

  onClose: () => void;
  onConfirm: () => void;
};

export default function AssessmentSubmitModal({
  open,
  questionCount,
  answeredCount,
  unansweredCount,
  flaggedCount,
  allowUnanswered,
  isSubmitting,
  autoSubmission = false,
  onClose,
  onConfirm,
}: AssessmentSubmitModalProps) {
  if (!open) {
    return null;
  }

  const submissionBlocked =
    !allowUnanswered &&
    unansweredCount > 0 &&
    !autoSubmission;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[30px] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.3)]">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ${
                autoSubmission
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {autoSubmission ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <Send className="h-6 w-6" />
              )}
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Final Submission
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {autoSubmission
                  ? "Time has expired"
                  : "Submit assessment?"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {autoSubmission
                  ? "Your saved answers are ready for automatic submission."
                  : "Review your progress before final submission."}
              </p>
            </div>
          </div>

          {!autoSubmission ? (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SubmissionMetric
              label="Questions"
              value={questionCount}
            />

            <SubmissionMetric
              label="Answered"
              value={answeredCount}
              success
            />

            <SubmissionMetric
              label="Unanswered"
              value={unansweredCount}
              warning={
                unansweredCount >
                0
              }
            />

            <SubmissionMetric
              label="Flagged"
              value={flaggedCount}
              flagged
            />
          </div>

          {submissionBlocked ? (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-black text-red-900">
                  Complete every question
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  This assessment does not
                  allow unanswered questions.
                </p>
              </div>
            </div>
          ) : flaggedCount > 0 &&
            !autoSubmission ? (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Bookmark className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

              <div>
                <p className="text-sm font-black text-amber-900">
                  Flagged questions remain
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  You have marked{" "}
                  {flaggedCount}{" "}
                  {flaggedCount === 1
                    ? "question"
                    : "questions"}{" "}
                  for review.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-black text-emerald-900">
                  Ready for submission
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  Your saved responses will
                  be submitted for marking.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {!autoSubmission ? (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700"
              >
                Continue Reviewing
              </button>
            ) : null}

            <button
              type="button"
              onClick={onConfirm}
              disabled={
                isSubmitting ||
                submissionBlocked
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}

              {autoSubmission
                ? "Submit Saved Answers"
                : "Confirm Submission"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmissionMetric({
  label,
  value,
  success = false,
  warning = false,
  flagged = false,
}: {
  label: string;
  value: number;
  success?: boolean;
  warning?: boolean;
  flagged?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        success
          ? "border-emerald-100 bg-emerald-50"
          : warning
          ? "border-red-100 bg-red-50"
          : flagged
          ? "border-amber-100 bg-amber-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-xl font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}