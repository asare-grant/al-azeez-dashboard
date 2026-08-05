import {
  notFound,
} from "next/navigation";

import {
  AcademicWeightingStudio,
} from "@/components/academic-settings/weightings";

import {
  getAcademicWeightingEditorData,
  getAcademicWeightingFormOptions,
} from "@/lib/academic-weightings";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type PageProps = {
  params: Promise<{
    weightingId: string;
  }>;
};

export default async function EditAcademicWeightingPage({
  params,
}: PageProps) {
  const {
    weightingId,
  } = await params;

  const parsedId =
    Number(weightingId);

  if (
    !Number.isInteger(
      parsedId,
    ) ||
    parsedId <= 0
  ) {
    notFound();
  }

  const [
    weighting,
    options,
  ] = await Promise.all([
    getAcademicWeightingEditorData(
      parsedId,
    ),

    getAcademicWeightingFormOptions(),
  ]);

  if (!weighting) {
    notFound();
  }

  return (
    <AcademicWeightingStudio
      mode="edit"
      initialWeighting={
        weighting
      }
      options={options}
    />
  );
}