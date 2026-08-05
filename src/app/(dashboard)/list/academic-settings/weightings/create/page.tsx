import {
  AcademicWeightingStudio,
} from "@/components/academic-settings/weightings";

import {
  createEmptyAcademicWeighting,
  getAcademicWeightingFormOptions,
} from "@/lib/academic-weightings";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default async function CreateAcademicWeightingPage() {
  const options =
    await getAcademicWeightingFormOptions();

  const defaultScale =
    options.gradingScales.find(
      (scale) =>
        scale.isDefault,
    ) ??
    options.gradingScales[0];

  const defaultTerm =
    options.terms.find(
      (term) =>
        term.isActive,
    ) ??
    options.terms[0];

  return (
    <AcademicWeightingStudio
      mode="create"
      options={options}
      initialWeighting={createEmptyAcademicWeighting({
        defaultGradingScaleId:
          defaultScale?.id,

        defaultTermId:
          defaultTerm?.id,
      })}
    />
  );
}