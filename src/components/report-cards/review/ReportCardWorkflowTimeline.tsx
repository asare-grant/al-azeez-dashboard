import {
  CheckCircle2,
  Clock3,
  FileEdit,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";

import type {
  ReportCardReviewWorkspaceData,
} from "@/lib/report-cards/review-types";

function formatDateTime(
  value:
    | Date
    | string
    | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
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
    },
  ).format(date);
}

export default function ReportCardWorkflowTimeline({
  reportCard,
}: {
  reportCard:
    ReportCardReviewWorkspaceData;
}) {
  const events = [
    {
      id: "draft",
      title: "Draft generated",
      description:
        "The terminal report-card draft was generated.",
      date:
        reportCard.updatedAt,
      icon: FileEdit,
      complete: true,
    },

    {
      id: "submitted",
      title: "Submitted for review",
      description:
        reportCard.submittedForReviewBy
          ? `Submitted by ${reportCard.submittedForReviewBy}.`
          : "The report has not yet been submitted.",
      date:
        reportCard.submittedForReviewAt,
      icon: Send,
      complete:
        Boolean(
          reportCard.submittedForReviewAt,
        ),
    },

    {
      id: "changes",
      title: "Changes requested",
      description:
        reportCard.reviewNote ||
        "No correction request has been recorded.",
      date:
        reportCard.changesRequestedAt,
      icon: RotateCcw,
      complete:
        Boolean(
          reportCard.changesRequestedAt,
        ),
    },

    {
      id: "approved",
      title: "Administrator approval",
      description:
        reportCard.approvedBy
          ? `Approved by ${reportCard.approvedBy}.`
          : "The report has not been approved.",
      date:
        reportCard.approvedAt,
      icon: ShieldCheck,
      complete:
        Boolean(
          reportCard.approvedAt,
        ),
    },

    {
      id: "published",
      title: "Published and locked",
      description:
        reportCard.publishedBy
          ? `Published by ${reportCard.publishedBy}.`
          : "The report is not yet published.",
      date:
        reportCard.publishedAt,
      icon: CheckCircle2,
      complete:
        Boolean(
          reportCard.publishedAt,
        ),
    },
  ];

  return (
    <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
          Workflow History
        </p>

        <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
          Review and approval timeline
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Follow the report card from draft
          preparation to final publication.
        </p>
      </div>

      <div className="mt-6 space-y-0">
        {events.map(
          (
            event,
            index,
          ) => {
            const Icon =
              event.icon;

            const formattedDate =
              formatDateTime(
                event.date,
              );

            return (
              <div
                key={event.id}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {index <
                events.length - 1 ? (
                  <div className="absolute left-[19px] top-10 h-[calc(100%-20px)] w-px bg-slate-200" />
                ) : null}

                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                    event.complete
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-slate-50 text-slate-300"
                  }`}
                >
                  {event.complete ? (
                    <Icon className="h-4 w-4" />
                  ) : (
                    <Clock3 className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 pt-1">
                  <p
                    className={`text-sm font-black ${
                      event.complete
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {event.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {
                      event.description
                    }
                  </p>

                  {formattedDate ? (
                    <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-blue-600">
                      {formattedDate}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}