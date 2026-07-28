import type {
  AssessmentBuilderOption,
  AssessmentBuilderQuestion,
} from "./types";

export function normalizeOptionPositions(
  options: AssessmentBuilderOption[]
): AssessmentBuilderOption[] {
  return options.map((option, index) => ({
    ...option,
    position: index,
  }));
}

export function normalizeQuestionPositions(
  questions: AssessmentBuilderQuestion[]
): AssessmentBuilderQuestion[] {
  return questions.map((question, index) => ({
    ...question,
    position: index,

    options: normalizeOptionPositions(
      question.options
    ),
  }));
}

export function calculateAssessmentTotals(
  questions: AssessmentBuilderQuestion[]
): {
  questionCount: number;
  totalMarks: number;
} {
  return {
    questionCount: questions.length,

    totalMarks: questions.reduce(
      (total, question) => total + question.marks,
      0
    ),
  };
}