import {
  AcademicWeightingCommandCentre,
} from "@/components/academic-settings/weightings";

import {
  getAcademicWeightingFormOptions,
  getAcademicWeightingList,
  getAcademicWeightingMetrics,
} from "@/lib/academic-weightings";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;

    academicYear?: string;
    termId?: string;
    gradeId?: string;
    gradingScaleId?: string;

    status?: string;
  }>;
};

function positiveInteger(
  value?: string,
) {
  const parsed =
    Number(value);

  return Number.isInteger(
    parsed,
  ) && parsed > 0
    ? parsed
    : undefined;
}

export default async function AcademicWeightingPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams;

  const status =
    params.status === "ACTIVE" ||
    params.status === "INACTIVE"
      ? params.status
      : "ALL";

  const [
    list,
    metrics,
    options,
  ] = await Promise.all([
    getAcademicWeightingList({
      page:
        positiveInteger(
          params.page,
        ) ?? 1,

      pageSize: 12,

      search:
        params.search?.trim() ||
        undefined,

      academicYear:
        params.academicYear ||
        undefined,

      termId:
        positiveInteger(
          params.termId,
        ),

      gradeId:
        positiveInteger(
          params.gradeId,
        ),

      gradingScaleId:
        positiveInteger(
          params.gradingScaleId,
        ),

      status,
    }),

    getAcademicWeightingMetrics(),

    getAcademicWeightingFormOptions(),
  ]);

  return (
    <AcademicWeightingCommandCentre
      weightings={list.data}
      metrics={metrics}
      options={options}
      page={list.page}
      totalPages={
        list.totalPages
      }
      total={list.total}
      hasActiveFilters={Boolean(
        params.search ||
          params.academicYear ||
          params.termId ||
          params.gradeId ||
          params.gradingScaleId ||
          params.status,
      )}
    />
  );
}