export {
  academicWeightingFailure,
  academicWeightingSuccess,
} from "./action-result";


export {
  changeGradingScaleStatus,
  createGradingScale,
  deleteGradingScale,
  setDefaultGradingScale,
  updateGradingScale,
} from "./actions";

export {
  getAcademicWeightingFormOptions,
  getAvailableGradingScales,
  getGradingScaleById,
  getGradingScaleEditorData,
  getGradingScaleList,
  getGradingScaleMetrics,
} from "./queries";

export type {
  GradingScaleListFilters,
} from "./queries";

export {
  ACADEMIC_WEIGHTING_LIST_PATH,
  GRADING_SCALE_LIST_PATH,
  gradingScaleDetailsPath,
  gradingScaleEditPath,
} from "./paths";


export {
  createDefaultGradeBoundaries,
  createEmptyGradingScale,
  createGradeBoundary,
} from "./factory";



export {
  academicWeightingIdSchema,
  academicWeightingStatusSchema,
} from "./validation";

export type {
  AcademicWeightingIdSchema,
  AcademicWeightingStatusSchema,
} from "./validation";


export {
  changeAcademicWeightingStatus,
  createAcademicWeighting,
  deleteAcademicWeighting,
  updateAcademicWeighting,
} from "./actions";

export {
  getAcademicWeightingById,
  getAcademicWeightingEditorData,
  getAcademicWeightingList,
  getAcademicWeightingMetrics,
} from "./queries";

export type {
  AcademicWeightingDeleteResult,
  AcademicWeightingListFilters,
  AcademicWeightingMetrics,
  AcademicWeightingMutationResult,
  AcademicWeightingStatusResult,
} from "./types";


export {
  createEmptyAcademicWeighting,
} from "./weighting-factory";