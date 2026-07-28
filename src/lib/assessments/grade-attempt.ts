import {
  calculateAssessmentResult,
} from "./grading";

export type GradingQuestion = {
  id: number;
  marks: number;

  options: {
    id: number;
    isCorrect: boolean;
  }[];
};

export type GradingAnswer = {
  id: number;
  questionId: number;
  selectedOptionId: number | null;
};

export function gradeAssessmentAttempt({
  questions,
  answers,
  passMarkPercent,
}: {
  questions: GradingQuestion[];
  answers: GradingAnswer[];
  passMarkPercent: number;
}) {
  const answerMap = new Map(
    answers.map((answer) => [
      answer.questionId,
      answer,
    ])
  );

  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const gradedAnswers = questions.map(
    (question) => {
      const savedAnswer =
        answerMap.get(question.id);

      const selectedOptionId =
        savedAnswer?.selectedOptionId ??
        null;

      const correctOption =
        question.options.find(
          (option) => option.isCorrect
        );

      if (!correctOption) {
        throw new Error(
          `QUESTION_${question.id}_HAS_NO_CORRECT_OPTION`
        );
      }

      const answered =
        selectedOptionId !== null;

      const isCorrect =
        answered &&
        selectedOptionId ===
          correctOption.id;

      const marksAwarded =
        isCorrect ? question.marks : 0;

      if (!answered) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      score += marksAwarded;

      return {
        answerId:
          savedAnswer?.id ?? null,

        questionId:
          question.id,

        selectedOptionId,

        isCorrect,
        marksAvailable:
          question.marks,

        marksAwarded,
      };
    }
  );

  const totalMarks =
    questions.reduce(
      (total, question) =>
        total + question.marks,
      0
    );

  const result =
    calculateAssessmentResult({
      score,
      totalMarks,
      passMarkPercent,
    });

  return {
    ...result,
    correctCount,
    incorrectCount,
    unansweredCount,
    gradedAnswers,
  };
}