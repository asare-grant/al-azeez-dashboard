import {
  notFound,
} from "next/navigation";

import {
  ReportCardCommandCentre,
} from "@/components/report-cards/command-centre";

import type {
  ReportCardCommandFilters,
} from "@/components/report-cards/types";

import {
  getTeacherClassReportCardCommandCentre,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type TeacherClassReportCardsPageProps = {
  params: Promise<{
    classId: string;
  }>;

  searchParams: Promise<
    ReportCardCommandFilters & {
      page?: string;
    }
  >;
};

export default async function TeacherClassReportCardsPage({
  params,
  searchParams,
}: TeacherClassReportCardsPageProps) {
  const [
    resolvedParams,
    filters,
  ] = await Promise.all([
    params,
    searchParams,
  ]);

  const classId = Number(
    resolvedParams.classId,
  );

  if (
    !Number.isInteger(classId) ||
    classId <= 0
  ) {
    notFound();
  }

  const page = Math.max(
    1,
    Number(filters.page) || 1,
  );

  const result =
    await getTeacherClassReportCardCommandCentre({
      classId,
      page,
      pageSize: 15,

      filters: {
        search: filters.search,

        academicYear:
          filters.academicYear,

        termId: filters.termId,

        status: filters.status,

        calculationStatus:
          filters.calculationStatus,

        reviewStatus:
          filters.reviewStatus,
      },
    });

  if (!result) {
    notFound();
  }

  return (
    <ReportCardCommandCentre
      items={result.data}
      metrics={result.metrics}
      filterOptions={result.filters}
      currentFilters={{
        ...filters,
        classId: String(classId),
      }}
      page={result.pagination.page}
      totalPages={
        result.pagination.totalPages
      }
      total={result.pagination.total}
      isAdmin={false}
      detailsHref={(reportCardId) =>
        `/teacher/classes/${classId}/report-cards/${reportCardId}`
      }
      reviewHref={(reportCardId) =>
        `/teacher/classes/${classId}/report-cards/${reportCardId}/review`
      }
      printHref={(reportCardId) =>
        `/teacher/classes/${classId}/report-cards/${reportCardId}/print`
      }
    />
  );
}