import type { ReportCardReviewWorkspaceData } from "@/lib/report-cards/review-types";

import ReportCardApprovalControls from "./ReportCardApprovalControls";
import ReportCardDetailsForm from "./ReportCardDetailsForm";
import ReportCardReadinessPanel from "./ReportCardReadinessPanel";
import ReportCardReviewHero from "./ReportCardReviewHero";
import ReportCardReviewSubjectTable from "./ReportCardReviewSubjectTable";
import ReportCardWorkflowTimeline from "./ReportCardWorkflowTimeline";
import ReportCardStaleWarning from "./ReportCardStaleWarning";

type ReportCardReviewWorkspaceProps = {
  reportCard: ReportCardReviewWorkspaceData;

  backHref: string;
  printHref: string;
};

export default function ReportCardReviewWorkspace({
  reportCard,
  backHref,
  printHref,
}: ReportCardReviewWorkspaceProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1800px]">
        <ReportCardReviewHero
          reportCard={reportCard}
          backHref={backHref}
          printHref={printHref}
        />

        {reportCard.isStale ? (
          <div className="mt-6">
            <ReportCardStaleWarning
              isStale={reportCard.isStale}
              staleAt={reportCard.staleAt}
              staleReason={reportCard.staleReason}
              regenerationHref={`/list/report-cards/generate?classId=${reportCard.class.id}&academicYear=${encodeURIComponent(
                reportCard.academicYear,
              )}&termId=${reportCard.term.id}`}
            />
          </div>
        ) : null}

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0 space-y-6">
            <ReportCardReadinessPanel readiness={reportCard.readiness} />

            <ReportCardDetailsForm reportCard={reportCard} />

            <ReportCardReviewSubjectTable subjects={reportCard.subjects} />
          </div>

          <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
            <ReportCardApprovalControls reportCard={reportCard} />

            <ReportCardWorkflowTimeline reportCard={reportCard} />
          </aside>
        </div>
      </div>
    </div>
  );
}
