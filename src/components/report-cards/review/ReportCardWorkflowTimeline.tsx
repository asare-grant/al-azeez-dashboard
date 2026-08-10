// import {
//   CheckCircle2,
//   Clock3,
//   FileEdit,
//   RotateCcw,
//   Send,
//   ShieldCheck,
// } from "lucide-react";

// import type {
//   ReportCardReviewWorkspaceData,
// } from "@/lib/report-cards/review-types";

// function formatDateTime(
//   value:
//     | Date
//     | string
//     | null,
// ) {
//   if (!value) {
//     return null;
//   }

//   const date =
//     new Date(value);

//   if (
//     Number.isNaN(
//       date.getTime(),
//     )
//   ) {
//     return null;
//   }

//   return new Intl.DateTimeFormat(
//     "en-GH",
//     {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//     },
//   ).format(date);
// }

// export default function ReportCardWorkflowTimeline({
//   reportCard,
// }: {
//   reportCard:
//     ReportCardReviewWorkspaceData;
// }) {
//   const events = [
//     {
//       id: "draft",
//       title: "Draft generated",
//       description:
//         "The terminal report-card draft was generated.",
//       date:
//         reportCard.updatedAt,
//       icon: FileEdit,
//       complete: true,
//     },

//     {
//       id: "submitted",
//       title: "Submitted for review",
//       description:
//         reportCard.submittedForReviewBy
//           ? `Submitted by ${reportCard.submittedForReviewBy}.`
//           : "The report has not yet been submitted.",
//       date:
//         reportCard.submittedForReviewAt,
//       icon: Send,
//       complete:
//         Boolean(
//           reportCard.submittedForReviewAt,
//         ),
//     },

//     {
//       id: "changes",
//       title: "Changes requested",
//       description:
//         reportCard.reviewNote ||
//         "No correction request has been recorded.",
//       date:
//         reportCard.changesRequestedAt,
//       icon: RotateCcw,
//       complete:
//         Boolean(
//           reportCard.changesRequestedAt,
//         ),
//     },

//     {
//       id: "approved",
//       title: "Administrator approval",
//       description:
//         reportCard.approvedBy
//           ? `Approved by ${reportCard.approvedBy}.`
//           : "The report has not been approved.",
//       date:
//         reportCard.approvedAt,
//       icon: ShieldCheck,
//       complete:
//         Boolean(
//           reportCard.approvedAt,
//         ),
//     },

//     {
//       id: "published",
//       title: "Published and locked",
//       description:
//         reportCard.publishedBy
//           ? `Published by ${reportCard.publishedBy}.`
//           : "The report is not yet published.",
//       date:
//         reportCard.publishedAt,
//       icon: CheckCircle2,
//       complete:
//         Boolean(
//           reportCard.publishedAt,
//         ),
//     },
//   ];

//   return (
//     <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] sm:p-6">
//       <div>
//         <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
//           Workflow History
//         </p>

//         <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
//           Review and approval timeline
//         </h2>

//         <p className="mt-1 text-sm leading-6 text-slate-500">
//           Follow the report card from draft
//           preparation to final publication.
//         </p>
//       </div>

//       <div className="mt-6 space-y-0">
//         {events.map(
//           (
//             event,
//             index,
//           ) => {
//             const Icon =
//               event.icon;

//             const formattedDate =
//               formatDateTime(
//                 event.date,
//               );

//             return (
//               <div
//                 key={event.id}
//                 className="relative flex gap-4 pb-6 last:pb-0"
//               >
//                 {index <
//                 events.length - 1 ? (
//                   <div className="absolute left-[19px] top-10 h-[calc(100%-20px)] w-px bg-slate-200" />
//                 ) : null}

//                 <div
//                   className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
//                     event.complete
//                       ? "border-blue-200 bg-blue-50 text-blue-600"
//                       : "border-slate-200 bg-slate-50 text-slate-300"
//                   }`}
//                 >
//                   {event.complete ? (
//                     <Icon className="h-4 w-4" />
//                   ) : (
//                     <Clock3 className="h-4 w-4" />
//                   )}
//                 </div>

//                 <div className="min-w-0 pt-1">
//                   <p
//                     className={`text-sm font-black ${
//                       event.complete
//                         ? "text-slate-900"
//                         : "text-slate-400"
//                     }`}
//                   >
//                     {event.title}
//                   </p>

//                   <p className="mt-1 text-xs leading-5 text-slate-500">
//                     {
//                       event.description
//                     }
//                   </p>

//                   {formattedDate ? (
//                     <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-blue-600">
//                       {formattedDate}
//                     </p>
//                   ) : null}
//                 </div>
//               </div>
//             );
//           },
//         )}
//       </div>
//     </section>
//   );
// }

import {
  Archive,
  BadgeCheck,
  Clock3,
  FilePlus2,
  History,
  LockKeyhole,
  MessageSquareWarning,
  PencilLine,
  RefreshCcw,
  RotateCcw,
  Send,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import type {
  ReportCardActivityItem,
  ReportCardReviewWorkspaceData,
} from "@/lib/report-cards/review-types";

type ReportCardWorkflowTimelineProps = {
  reportCard: ReportCardReviewWorkspaceData;
};

function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",

    month: "short",

    year: "numeric",

    hour: "numeric",

    minute: "2-digit",
  }).format(new Date(value));
}

function getActivityVisual(type: string) {
  switch (type) {
    case "GENERATED":
      return {
        icon: FilePlus2,

        iconClass: "bg-blue-50 text-blue-600 ring-blue-100",
      };

    case "REGENERATED":
      return {
        icon: RefreshCcw,

        iconClass: "bg-cyan-50 text-cyan-700 ring-cyan-100",
      };

    case "MARKED_STALE":
      return {
        icon: TriangleAlert,

        iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
      };

    case "DETAILS_UPDATED":
      return {
        icon: PencilLine,

        iconClass: "bg-slate-100 text-slate-600 ring-slate-200",
      };

    case "SUBMITTED_FOR_REVIEW":
      return {
        icon: Send,

        iconClass: "bg-indigo-50 text-indigo-700 ring-indigo-100",
      };

    case "CHANGES_REQUESTED":
      return {
        icon: MessageSquareWarning,

        iconClass: "bg-orange-50 text-orange-700 ring-orange-100",
      };

    case "REOPENED":
      return {
        icon: RotateCcw,

        iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
      };

    case "APPROVED":
      return {
        icon: BadgeCheck,

        iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      };

    case "PUBLISHED":
      return {
        icon: LockKeyhole,

        iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      };

    case "ARCHIVED":
      return {
        icon: Archive,

        iconClass: "bg-slate-100 text-slate-700 ring-slate-200",
      };

    default:
      return {
        icon: History,

        iconClass: "bg-slate-100 text-slate-600 ring-slate-200",
      };
  }
}

function formatActor(activity: ReportCardActivityItem) {
  if (activity.actorName?.trim()) {
    return activity.actorName.trim();
  }

  if (activity.actorRole === "system") {
    return "System";
  }

  if (activity.actorRole === "admin") {
    return "Administrator";
  }

  if (activity.actorRole === "teacher") {
    return "Teacher";
  }

  return null;
}

export default function ReportCardWorkflowTimeline({
  reportCard,
}: ReportCardWorkflowTimelineProps) {
  const activities = reportCard.activities;

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <History className="h-4 w-4" />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
              Audit History
            </p>

            <h2 className="mt-1 text-lg font-black text-slate-950">
              Workflow Timeline
            </h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Immutable activity history for this report card.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="p-6">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-center">
            <History className="mx-auto h-6 w-6 text-slate-400" />

            <p className="mt-3 text-sm font-black text-slate-700">
              No detailed activity history yet
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Activity tracking may have started after this report card was
              originally created.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6">
          <div className="relative">
            <div className="absolute bottom-2 left-[19px] top-2 w-px bg-slate-200" />

            <div className="space-y-6">
              {activities.map((activity, index) => (
                <TimelineItem
                  key={activity.id}
                  activity={activity}
                  first={index === 0}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TimelineItem({
  activity,
  first,
}: {
  activity: ReportCardActivityItem;

  first: boolean;
}) {
  const visual = getActivityVisual(activity.type);

  const Icon = visual.icon;

  const actor = formatActor(activity);

  return (
    <article className="relative flex gap-4">
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-4 ring-white ${visual.iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div
        className={`min-w-0 flex-1 rounded-2xl border p-4 ${
          first
            ? "border-blue-100 bg-blue-50/30"
            : "border-slate-100 bg-slate-50/60"
        }`}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-black text-slate-900">{activity.title}</p>

            {activity.description ? (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {activity.description}
              </p>
            ) : null}
          </div>

          {/* <div className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <Clock3 className="h-3.5 w-3.5" />

            {formatDateTime(
              activity.createdAt,
            )}
          </div> */}
        </div>

        {actor ? (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                <UserRound className="h-3.5 w-3.5" />

                {actor}
              </div>
              <div className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Clock3 className="h-3.5 w-3.5 text-green-300" />

                {formatDateTime(activity.createdAt)}
              </div>
            </div>
          </>
        ) : null}

        {activity.note ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
              Review Note
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
              {activity.note}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
