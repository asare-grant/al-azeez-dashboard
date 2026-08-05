import {
  ReportCardGenerationStudio,
} from "@/components/report-cards/generate";

import {
  getReportCardGenerationOptions,
  getReportCardGenerationReadiness,
} from "@/lib/report-cards/queries";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type GenerateReportCardsPageProps = {
  searchParams: Promise<{
    classId?: string;
    academicYear?: string;
    termId?: string;
  }>;
};

function parsePositiveInteger(
  value?: string,
) {
  const parsed =
    Number(value);

  return (
    Number.isInteger(parsed) &&
    parsed > 0
      ? parsed
      : null
  );
}

export default async function GenerateReportCardsPage({
  searchParams,
}: GenerateReportCardsPageProps) {
  const params =
    await searchParams;

  const options =
    await getReportCardGenerationOptions();

  const classId =
    parsePositiveInteger(
      params.classId,
    );

  const termId =
    parsePositiveInteger(
      params.termId,
    );

  const academicYear =
    params.academicYear
      ?.trim() ||
    options.defaultAcademicYear ||
    "";

  const selectedTermId =
    termId ??
    options.defaultTermId;

  const readiness =
    classId &&
    selectedTermId &&
    academicYear
      ? await getReportCardGenerationReadiness({
          classId,

          academicYear,

          termId:
            selectedTermId,
        })
      : null;

  return (
    <ReportCardGenerationStudio
      options={options}
      initialSelection={{
        classId,

        academicYear,

        termId:
          selectedTermId,
      }}
      readiness={
        readiness
      }
    />
  );
}