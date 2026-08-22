// src/app/(dashboard)/list/assessments/page.ts
import type { AssessmentStatus } from "@prisma/client";

import { AssessmentCommandCentre } from "@/components/assessments/command-centre";

import {
  getAssessmentDashboardMetrics,
  getAssessmentFilterOptions,
  getTeacherAssessmentList,
} from "@/lib/assessments/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AssessmentListPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    classId?: string;
    subjectId?: string;
  }>;
};

const validStatuses: AssessmentStatus[] = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
];

export default async function AssessmentListPage({
  searchParams,
}: AssessmentListPageProps) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);

  const classId = params.classId ? Number(params.classId) : undefined;

  const subjectId = params.subjectId ? Number(params.subjectId) : undefined;

  const status =
    params.status && validStatuses.includes(params.status as AssessmentStatus)
      ? (params.status as AssessmentStatus)
      : undefined;

  const [listResult, metrics, filterOptions] = await Promise.all([
    getTeacherAssessmentList({
      page,
      pageSize: 10,

      search: params.search?.trim() || undefined,

      classId:
        typeof classId === "number" && Number.isInteger(classId) && classId > 0
          ? classId
          : undefined,

      subjectId:
        typeof subjectId === "number" &&
        Number.isInteger(subjectId) &&
        subjectId > 0
          ? subjectId
          : undefined,

      status,
    }),

    getAssessmentDashboardMetrics(),

    getAssessmentFilterOptions(),
  ]);

  return (
    <AssessmentCommandCentre
      assessments={listResult.data}
      metrics={metrics}
      classes={filterOptions.classes}
      subjects={filterOptions.subjects}
      page={listResult.page}
      totalPages={listResult.totalPages}
      total={listResult.total}
      currentFilters={{
        search: params.search,
        status: params.status,
        classId: params.classId,
        subjectId: params.subjectId,
      }}
    />
  );
}
