import type {
  AssessmentBuilderData,
  AssessmentBuilderQuestion,
} from "@/lib/assessments/types";

import type {
  AssessmentStudioSectionId,
} from "../types";

export type AssessmentValidationSeverity =
  | "success"
  | "warning"
  | "error";

export type AssessmentValidationItemData = {
  id: string;
  title: string;
  description: string;
  severity: AssessmentValidationSeverity;
  section: AssessmentStudioSectionId;
};

export type QuestionReadiness = {
  questionIndex: number;
  questionNumber: number;
  title: string;
  isComplete: boolean;
  issues: string[];
};

export type AssessmentReviewResult = {
  isReady: boolean;
  readinessPercentage: number;

  completedChecks: number;
  totalChecks: number;

  errors: AssessmentValidationItemData[];
  warnings: AssessmentValidationItemData[];
  successes: AssessmentValidationItemData[];

  questions: QuestionReadiness[];
};

function reviewQuestion(
  question: AssessmentBuilderQuestion,
  questionIndex: number
): QuestionReadiness {
  const issues: string[] = [];

  if (question.questionText.trim().length < 3) {
    issues.push("Question text is incomplete.");
  }

  if (question.options.length < 2) {
    issues.push(
      "At least two answer options are required."
    );
  }

  const emptyOptions =
    question.options.filter(
      (option) =>
        option.optionText.trim().length === 0
    );

  if (emptyOptions.length > 0) {
    issues.push(
      `${emptyOptions.length} answer ${
        emptyOptions.length === 1
          ? "option is"
          : "options are"
      } empty.`
    );
  }

  const correctOptions =
    question.options.filter(
      (option) => option.isCorrect
    );

  if (correctOptions.length === 0) {
    issues.push(
      "No correct answer has been selected."
    );
  }

  if (correctOptions.length > 1) {
    issues.push(
      "Only one correct answer may be selected."
    );
  }

  if (
    !Number.isFinite(question.marks) ||
    question.marks < 1
  ) {
    issues.push(
      "The question must carry at least one mark."
    );
  }

  const normalizedOptions =
    question.options.map((option) =>
      option.optionText.trim().toLowerCase()
    );

  if (
    new Set(normalizedOptions).size !==
    normalizedOptions.length
  ) {
    issues.push(
      "The question contains duplicate answer options."
    );
  }

  return {
    questionIndex,
    questionNumber: questionIndex + 1,
    title:
      question.questionText.trim() ||
      `Question ${questionIndex + 1}`,
    isComplete: issues.length === 0,
    issues,
  };
}

export function reviewAssessment(
  assessment: AssessmentBuilderData
): AssessmentReviewResult {
  const checks: AssessmentValidationItemData[] =
    [];

  const addCheck = (
    item: AssessmentValidationItemData
  ) => {
    checks.push(item);
  };

  addCheck({
    id: "title",
    title: "Assessment title",
    description:
      assessment.title.trim().length >= 3
        ? "A clear assessment title has been provided."
        : "Enter an assessment title containing at least three characters.",
    severity:
      assessment.title.trim().length >= 3
        ? "success"
        : "error",
    section: "overview",
  });

  addCheck({
    id: "lesson",
    title: "Lesson selected",
    description: assessment.lessonId
      ? "The assessment is connected to a lesson and class."
      : "Select the lesson and class for this assessment.",
    severity: assessment.lessonId
      ? "success"
      : "error",
    section: "overview",
  });

  addCheck({
    id: "instructions",
    title: "Student instructions",
    description:
      assessment.instructions?.trim()
        ? "Student instructions have been provided."
        : "Instructions are optional, but adding them improves clarity.",
    severity:
      assessment.instructions?.trim()
        ? "success"
        : "warning",
    section: "overview",
  });

  const questionReviews =
    assessment.questions.map(reviewQuestion);

  const completeQuestionCount =
    questionReviews.filter(
      (question) => question.isComplete
    ).length;

  addCheck({
    id: "questions",
    title: "Assessment questions",
    description:
      assessment.questions.length === 0
        ? "Add at least one question."
        : completeQuestionCount ===
          assessment.questions.length
        ? `All ${assessment.questions.length} questions are complete.`
        : `${completeQuestionCount} of ${assessment.questions.length} questions are complete.`,
    severity:
      assessment.questions.length > 0 &&
      completeQuestionCount ===
        assessment.questions.length
        ? "success"
        : "error",
    section: "questions",
  });

  const totalMarks =
    assessment.questions.reduce(
      (total, question) =>
        total + Math.max(0, question.marks),
      0
    );

  addCheck({
    id: "marks",
    title: "Assessment marks",
    description:
      totalMarks > 0
        ? `The assessment carries ${totalMarks} total marks.`
        : "The assessment must carry at least one mark.",
    severity:
      totalMarks > 0 ? "success" : "error",
    section: "questions",
  });

  addCheck({
    id: "pass-mark",
    title: "Pass mark configured",
    description: `Students require ${assessment.passMarkPercent}% to pass.`,
    severity:
      assessment.passMarkPercent >= 0 &&
      assessment.passMarkPercent <= 100
        ? "success"
        : "error",
    section: "behaviour",
  });

  addCheck({
    id: "attempts",
    title: "Attempt limit",
    description: `${assessment.maxAttempts} ${
      assessment.maxAttempts === 1
        ? "attempt"
        : "attempts"
    } allowed per student.`,
    severity:
      assessment.maxAttempts >= 1
        ? "success"
        : "error",
    section: "behaviour",
  });

  addCheck({
    id: "timer",
    title: "Assessment timing",
    description:
      assessment.durationMinutes === null
        ? "The assessment is untimed."
        : `Each attempt is limited to ${assessment.durationMinutes} minutes.`,
    severity:
      assessment.durationMinutes === null ||
      assessment.durationMinutes > 0
        ? "success"
        : "error",
    section: "behaviour",
  });

  addCheck({
    id: "auto-submit",
    title: "Automatic submission",
    description:
      assessment.durationMinutes === null
        ? assessment.autoSubmit
          ? "Auto-submit cannot be enabled for an untimed assessment."
          : "Auto-submit is not required for an untimed assessment."
        : assessment.autoSubmit
        ? "Saved answers will be submitted when time expires."
        : "Students may lose an attempt when time expires without automatic submission.",
    severity:
      assessment.durationMinutes === null &&
      assessment.autoSubmit
        ? "error"
        : assessment.durationMinutes !== null &&
          !assessment.autoSubmit
        ? "warning"
        : "success",
    section: "behaviour",
  });

  addCheck({
    id: "feedback",
    title: "Student feedback",
    description:
      assessment.showInstantResult
        ? "Students will receive their results after submission."
        : "Results will be hidden after submission.",
    severity: assessment.showInstantResult
      ? "success"
      : "warning",
    section: "behaviour",
  });

  const startDate = assessment.startDate
    ? new Date(assessment.startDate)
    : null;

  const dueDate = assessment.dueDate
    ? new Date(assessment.dueDate)
    : null;

  const validStartDate =
    startDate &&
    !Number.isNaN(startDate.getTime());

  const validDueDate =
    dueDate &&
    !Number.isNaN(dueDate.getTime());

  addCheck({
    id: "start-date",
    title: "Opening date",
    description: validStartDate
      ? "The opening date and time are configured."
      : "Select a valid opening date and time.",
    severity: validStartDate
      ? "success"
      : "error",
    section: "availability",
  });

  addCheck({
    id: "due-date",
    title: "Closing date",
    description:
      validDueDate &&
      validStartDate &&
      dueDate.getTime() >
        startDate.getTime()
        ? "The closing date occurs after the opening date."
        : "The closing date must occur after the opening date.",
    severity:
      validDueDate &&
      validStartDate &&
      dueDate.getTime() >
        startDate.getTime()
        ? "success"
        : "error",
    section: "availability",
  });

  const now = new Date();

  if (
    validDueDate &&
    dueDate.getTime() <= now.getTime()
  ) {
    addCheck({
      id: "past-due-date",
      title: "Closing date has passed",
      description:
        "Choose a future closing date before publishing.",
      severity: "error",
      section: "availability",
    });
  }

  const errors = checks.filter(
    (check) => check.severity === "error"
  );

  const warnings = checks.filter(
    (check) => check.severity === "warning"
  );

  const successes = checks.filter(
    (check) => check.severity === "success"
  );

  const completedChecks =
  checks.length - errors.length;

  const readinessPercentage =
  checks.length === 0
    ? 0
    : Math.round(
        ((checks.length - errors.length) /
          checks.length) *
          100
      );

  return {
    isReady: errors.length === 0,
    readinessPercentage,
    completedChecks,
    totalChecks: checks.length,
    errors,
    warnings,
    successes,
    questions: questionReviews,
  };
}