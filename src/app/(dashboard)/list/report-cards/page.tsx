import type {
  ReportCardCommandFilters,
} from "@/components/report-cards/types";

import {
  ReportCardCommandCentre,
} from "@/components/report-cards/command-centre";

import {
  getReportCardCommandCentre,
} from "@/lib/report-cards/queries";

import {
  auth,
} from "@clerk/nextjs/server";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type ReportCardsPageProps = {
  searchParams: Promise<
    ReportCardCommandFilters & {
      page?: string;
    }
  >;
};

export default async function ReportCardsPage({
  searchParams,
}: ReportCardsPageProps) {
  const params =
    await searchParams;

  const page =
    Math.max(
      1,
      Number(params.page) || 1,
    );

  const {
    sessionClaims,
  } = await auth();

  const role = (
    sessionClaims?.metadata as {
      role?: string;
    }
  )?.role;

  const result =
    await getReportCardCommandCentre(
      {
        page,
        pageSize: 15,

        filters: {
          search:
            params.search,

          classId:
            params.classId,

          termId:
            params.termId,

          academicYear:
            params.academicYear,

          status:
            params.status,

          calculationStatus:
            params.calculationStatus,
          
          reviewStatus:
            params.reviewStatus,
        },
      },
    );

  return (
    <ReportCardCommandCentre
      items={result.data}
      metrics={result.metrics}
      filterOptions={
        result.filters
      }
      currentFilters={params}
      page={
        result.pagination.page
      }
      totalPages={
        result.pagination
          .totalPages
      }
      total={
        result.pagination.total
      }
      isAdmin={
        role === "admin"
      }
    />
  );
}