import {
  notFound,
} from "next/navigation";

import {
  GradingScaleStudio,
} from "@/components/academic-settings/grading-scales";

import {
  getGradingScaleEditorData,
} from "@/lib/academic-weightings";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type EditGradingScalePageProps = {
  params: Promise<{
    gradingScaleId: string;
  }>;
};

export default async function EditGradingScalePage({
  params,
}: EditGradingScalePageProps) {
  const {
    gradingScaleId,
  } = await params;

  const parsedId =
    Number(gradingScaleId);

  if (
    !Number.isInteger(
      parsedId,
    ) ||
    parsedId <= 0
  ) {
    notFound();
  }

  const scale =
    await getGradingScaleEditorData(
      parsedId,
    );

  if (!scale) {
    notFound();
  }

  return (
    <GradingScaleStudio
      mode="edit"
      initialScale={scale}
    />
  );
}