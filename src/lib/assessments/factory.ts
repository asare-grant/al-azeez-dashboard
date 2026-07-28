import type {
  AssessmentBuilderData,
  AssessmentBuilderOption,
  AssessmentBuilderQuestion,
} from "./types";
import { ASSESSMENT_DEFAULTS } from "./constants";

export function createEmptyAssessmentOption(
  position: number
): AssessmentBuilderOption {
  return {
    clientId: crypto.randomUUID(),
    optionText: "",
    imageUrl: "",
    isCorrect: false,
    position,
  };
}

export function createEmptyAssessmentQuestion(
  position: number
): AssessmentBuilderQuestion {
  return {
    clientId: crypto.randomUUID(),
    questionText: "",
    imageUrl: "",
    explanation: "",
    marks: 1,
    position,

    options: [
      createEmptyAssessmentOption(0),
      createEmptyAssessmentOption(1),
      createEmptyAssessmentOption(2),
      createEmptyAssessmentOption(3),
    ],
  };
}

export function createEmptyAssessment(): AssessmentBuilderData {
  return {
    title: "",
    instructions: "",

    lessonId: undefined,

    startDate: undefined,
    dueDate: undefined,

    durationMinutes:
      ASSESSMENT_DEFAULTS.durationMinutes,

    passMarkPercent:
      ASSESSMENT_DEFAULTS.passMarkPercent,

    maxAttempts:
      ASSESSMENT_DEFAULTS.maxAttempts,

    shuffleQuestions:
      ASSESSMENT_DEFAULTS.shuffleQuestions,

    shuffleOptions:
      ASSESSMENT_DEFAULTS.shuffleOptions,

    allowBacktrack:
      ASSESSMENT_DEFAULTS.allowBacktrack,

    allowUnanswered:
      ASSESSMENT_DEFAULTS.allowUnanswered,

    showInstantResult:
      ASSESSMENT_DEFAULTS.showInstantResult,

    showCorrectAnswers:
      ASSESSMENT_DEFAULTS.showCorrectAnswers,

    showExplanations:
      ASSESSMENT_DEFAULTS.showExplanations,

    autoSubmit:
      ASSESSMENT_DEFAULTS.autoSubmit,

    status: "DRAFT",

    questions: [createEmptyAssessmentQuestion(0)],
  };
}

export function duplicateAssessmentQuestion(
  question: AssessmentBuilderQuestion,
  newPosition: number
): AssessmentBuilderQuestion {
  return {
    ...question,

    id: undefined,
    clientId: crypto.randomUUID(),
    position: newPosition,

    options: question.options.map((option, index) => ({
      ...option,
      id: undefined,
      clientId: crypto.randomUUID(),
      position: index,
    })),
  };
}