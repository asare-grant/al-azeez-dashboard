export const GRADING_SCALE_LIST_PATH =
  "/list/academic-settings/grading-scales";

export const gradingScaleDetailsPath = (
  gradingScaleId: number,
) =>
  `${GRADING_SCALE_LIST_PATH}/${gradingScaleId}`;

export const gradingScaleEditPath = (
  gradingScaleId: number,
) =>
  `${GRADING_SCALE_LIST_PATH}/${gradingScaleId}/edit`;

export const ACADEMIC_WEIGHTING_LIST_PATH =
  "/list/academic-settings/weightings";

export const academicWeightingCreatePath =
  `${ACADEMIC_WEIGHTING_LIST_PATH}/create`;

export const academicWeightingEditPath = (
  weightingId: number,
) =>
  `${ACADEMIC_WEIGHTING_LIST_PATH}/${weightingId}/edit`;