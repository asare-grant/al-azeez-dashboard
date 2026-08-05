import type {
  ResultType,
} from "@prisma/client";

import {
  notFound,
} from "next/navigation";

import {
  StudentResultsProfile,
} from "@/components/results/student-profile";

import {
  getStudentResultProfile,
} from "@/lib/results";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type StudentResultsProfilePageProps = {
  params: Promise<{
    studentId: string;
  }>;

  searchParams: Promise<{
    academicYear?: string;
    termId?: string;
    subjectId?: string;
    type?: string;
  }>;
};

const validTypes: ResultType[] = [
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

export default async function StudentResultsProfilePage({
  params,
  searchParams,
}: StudentResultsProfilePageProps) {
  const [
    resolvedParams,
    filters,
  ] = await Promise.all([
    params,
    searchParams,
  ]);

  const requestedType =
    filters.type;

  const type =
    requestedType &&
    validTypes.includes(
      requestedType as ResultType,
    )
      ? (requestedType as ResultType)
      : undefined;

  const data =
    await getStudentResultProfile({
      studentId:
        resolvedParams.studentId,

      academicYear:
        filters.academicYear ||
        undefined,

      termId:
        parsePositiveInteger(
          filters.termId,
        ),

      subjectId:
        parsePositiveInteger(
          filters.subjectId,
        ),

      type,
    });

  if (!data) {
    notFound();
  }

  return (
    <StudentResultsProfile
      data={data}
    />
  );
}