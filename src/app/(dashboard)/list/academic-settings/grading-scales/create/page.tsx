import {
  GradingScaleStudio,
} from "@/components/academic-settings/grading-scales";

import {
  createEmptyGradingScale,
} from "@/lib/academic-weightings";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export default function CreateGradingScalePage() {
  return (
    <GradingScaleStudio
      mode="create"
      initialScale={
        createEmptyGradingScale()
      }
    />
  );
}