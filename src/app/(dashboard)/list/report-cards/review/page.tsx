import {
  ReportCardBulkReviewWorkspace,
} from "@/components/report-cards/bulk-review";

import type {
  ReportCardBulkReviewFilters,
} from "@/lib/report-cards/bulk-review-types";

import {
  getReportCardBulkReviewWorkspace,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type BulkReportCardReviewPageProps = {
  searchParams: Promise<
    ReportCardBulkReviewFilters & {
      page?: string;
    }
  >;
};

export default async function BulkReportCardReviewPage({
  searchParams,
}: BulkReportCardReviewPageProps) {
  const params =
    await searchParams;

  const page =
    Math.max(
      1,
      Number(params.page) || 1,
    );

  const result =
    await getReportCardBulkReviewWorkspace({
      page,
      pageSize: 30,

      filters: {
        classId:
          params.classId,

        termId:
          params.termId,

        academicYear:
          params.academicYear,

        reviewStatus:
          params.reviewStatus,

        calculationStatus:
          params.calculationStatus,

        search:
          params.search,
      },
    });

  return (
    <ReportCardBulkReviewWorkspace
      data={result}
      currentFilters={
        params
      }
    />
  );
}