import type {
  StudentAssessmentPlayerData,
} from "@/lib/assessments/types";

export type AssessmentPlayerAnswerState = {
  questionId: number;
  selectedOptionId: number | null;
  flagged: boolean;
  saveStatus:
    | "saved"
    | "saving"
    | "error";
};

export type AssessmentPlayerProps = {
  data: StudentAssessmentPlayerData;
};

export type AssessmentQuestionStatus =
  | "current"
  | "answered"
  | "unanswered"
  | "flagged";


//   export type AssessmentPlayerAnswerState = {
//   questionId: number;

//   selectedOptionId:
//     | number
//     | null;

//   flagged: boolean;

//   version: number;

//   saveStatus:
//     | "saved"
//     | "queued"
//     | "saving"
//     | "error";

//   lastSavedAt: Date | null;

//   errorMessage: string | null;
// };