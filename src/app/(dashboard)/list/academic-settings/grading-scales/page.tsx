import type {
  GradingScaleStatus,
} from "@prisma/client";

import 
  GradingScaleCommandCentre
 from "@/components/academic-settings/grading-scales/GradingScaleCommandCentre";

import {
  getGradingScaleList,
  getGradingScaleMetrics,
} from "@/lib/academic-weightings";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type GradingScaleListPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

const validStatuses: GradingScaleStatus[] =
  [
    "DRAFT",
    "ACTIVE",
    "ARCHIVED",
  ];

function parsePositiveInteger(
  value?: string,
) {
  if (!value) {
    return undefined;
  }

  const parsed =
    Number(value);

  return Number.isInteger(
    parsed,
  ) && parsed > 0
    ? parsed
    : undefined;
}

export default async function GradingScaleListPage({
  searchParams,
}: GradingScaleListPageProps) {
  const params =
    await searchParams;

  const status =
    params.status &&
    validStatuses.includes(
      params.status as GradingScaleStatus,
    )
      ? (params.status as GradingScaleStatus)
      : "ALL";

  const [
    listResult,
    metrics,
  ] = await Promise.all([
    getGradingScaleList({
      page:
        parsePositiveInteger(
          params.page,
        ) ?? 1,

      pageSize: 12,

      search:
        params.search?.trim() ||
        undefined,

      status,
    }),

    getGradingScaleMetrics(),
  ]);

  const hasActiveFilters =
    Boolean(
      params.search ||
        params.status,
    );

  return (
    <GradingScaleCommandCentre
      scales={
        listResult.data
      }
      metrics={metrics}
      page={listResult.page}
      totalPages={
        listResult.totalPages
      }
      total={
        listResult.total
      }
      hasActiveFilters={
        hasActiveFilters
      }
    />
  );
}