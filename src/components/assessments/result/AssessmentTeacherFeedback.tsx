import {
  MessageSquareText,
} from "lucide-react";

type AssessmentTeacherFeedbackProps = {
  feedback: string;
  reviewedByName: string | null;
  reviewedAt: Date | string | null;
};

function formatDate(
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
    }
  ).format(new Date(value));
}

export default function AssessmentTeacherFeedback({
  feedback,
  reviewedByName,
  reviewedAt,
}: AssessmentTeacherFeedbackProps) {
  return (
    <section className="rounded-[26px] border border-blue-100 bg-blue-50 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
          <MessageSquareText className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Teacher Feedback
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-7 text-blue-950">
            {feedback}
          </p>

          {reviewedByName ||
          reviewedAt ? (
            <p className="mt-4 text-xs font-semibold text-blue-700">
              {reviewedByName
                ? `Reviewed by ${reviewedByName}`
                : "Reviewed by your teacher"}
              {reviewedAt
                ? ` • ${formatDate(reviewedAt)}`
                : ""}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}