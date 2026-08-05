import type {
  ResultType,
} from "@prisma/client";

import {
  ResultsCommandCentre,
} from "@/components/results/command-centre";

import {
  getResultsCommandCentre,
} from "@/lib/results";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type ResultsManagementPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;

    classId?: string;
    subjectId?: string;
    studentId?: string;

    academicYear?: string;
    termId?: string;
  }>;
};

const validResultTypes: ResultType[] =
  [
    "EXAM",
    "ASSIGNMENT",
    "ASSESSMENT",
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

export default async function ResultsManagementPage({
  searchParams,
}: ResultsManagementPageProps) {
  const params =
    await searchParams;

  const requestedType =
    params.type;

  const type =
    requestedType &&
    validResultTypes.includes(
      requestedType as ResultType,
    )
      ? (requestedType as ResultType)
      : "ALL";

  const data =
    await getResultsCommandCentre({
      page:
        parsePositiveInteger(
          params.page,
        ) ?? 1,

      pageSize: 15,

      search:
        params.search?.trim() ||
        undefined,

      type,

      classId:
        parsePositiveInteger(
          params.classId,
        ),

      subjectId:
        parsePositiveInteger(
          params.subjectId,
        ),

      studentId:
        params.studentId ||
        undefined,

      academicYear:
        params.academicYear ||
        undefined,

      termId:
        parsePositiveInteger(
          params.termId,
        ),
    });

  const hasActiveFilters =
    Boolean(
      params.search ||
        params.type ||
        params.classId ||
        params.subjectId ||
        params.studentId ||
        params.academicYear ||
        params.termId,
    );

  return (
    <ResultsCommandCentre
      data={data}
      hasActiveFilters={
        hasActiveFilters
      }
    />
  );
}