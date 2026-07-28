export type AssessmentStudioSectionId =
  | "overview"
  | "questions"
  | "behaviour"
  | "availability"
  | "review";

export type AssessmentSaveStatus =
  | "saved"
  | "saving"
  | "unsaved"
  | "error";

export type AssessmentStudioNavigationItem = {
  id: AssessmentStudioSectionId;
  label: string;
  description: string;
};