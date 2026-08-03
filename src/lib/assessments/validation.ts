import { z } from "zod";
import { ASSESSMENT_DEFAULTS, ASSESSMENT_LIMITS } from "./constants";

/* -------------------------------------------------------------------------- */
/*                              ASSESSMENT OPTION                              */
/* -------------------------------------------------------------------------- */

export const assessmentOptionSchema = z.object({
  id: z.coerce.number().int().positive().optional(),

  clientId: z.string().min(1),

  optionText: z
    .string()
    .trim()
    .min(1, "Option text is required.")
    .max(1000, "An option cannot exceed 1,000 characters."),

  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL.")
    .optional()
    .or(z.literal("")),

  isCorrect: z.boolean().default(false),

  position: z.coerce
    .number()
    .int()
    .min(0, "Option position cannot be negative."),
});

export type AssessmentOptionInput = z.infer<typeof assessmentOptionSchema>;

/* -------------------------------------------------------------------------- */
/*                             ASSESSMENT QUESTION                             */
/* -------------------------------------------------------------------------- */

export const assessmentQuestionSchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),

    clientId: z.string().min(1),

    questionText: z
      .string()
      .trim()
      .min(3, "Enter a complete question.")
      .max(5000, "A question cannot exceed 5,000 characters."),

    imageUrl: z
      .string()
      .trim()
      .url("Enter a valid image URL.")
      .optional()
      .or(z.literal("")),

    explanation: z
      .string()
      .trim()
      .max(5000, "The explanation cannot exceed 5,000 characters.")
      .optional()
      .or(z.literal("")),

    marks: z.coerce
      .number()
      .int("Marks must be a whole number.")
      .min(
        ASSESSMENT_LIMITS.MIN_MARKS_PER_QUESTION,
        `A question must carry at least ${ASSESSMENT_LIMITS.MIN_MARKS_PER_QUESTION} mark.`,
      )
      .max(
        ASSESSMENT_LIMITS.MAX_MARKS_PER_QUESTION,
        `A question cannot carry more than ${ASSESSMENT_LIMITS.MAX_MARKS_PER_QUESTION} marks.`,
      ),

    position: z.coerce
      .number()
      .int()
      .min(0, "Question position cannot be negative."),

    options: z
      .array(assessmentOptionSchema)
      .min(
        ASSESSMENT_LIMITS.MIN_OPTIONS,
        `Add at least ${ASSESSMENT_LIMITS.MIN_OPTIONS} answer options.`,
      )
      .max(
        ASSESSMENT_LIMITS.MAX_OPTIONS,
        `A question cannot contain more than ${ASSESSMENT_LIMITS.MAX_OPTIONS} answer options.`,
      ),
  })
  .superRefine((question, ctx) => {
    const correctOptions = question.options.filter(
      (option) => option.isCorrect,
    );

    if (correctOptions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Select the correct answer.",
      });
    }

    if (correctOptions.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message:
          "Multiple-choice questions must have exactly one correct answer.",
      });
    }

    const normalizedOptions = question.options.map((option) =>
      option.optionText.trim().toLowerCase(),
    );

    const duplicateOptionExists =
      new Set(normalizedOptions).size !== normalizedOptions.length;

    if (duplicateOptionExists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "A question cannot contain duplicate answer options.",
      });
    }

    const optionPositions = question.options.map((option) => option.position);

    const duplicatePositionExists =
      new Set(optionPositions).size !== optionPositions.length;

    if (duplicatePositionExists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["options"],
        message: "Each answer option must have a unique position.",
      });
    }
  });

export type AssessmentQuestionInput = z.infer<typeof assessmentQuestionSchema>;

/* -------------------------------------------------------------------------- */
/*                              ASSESSMENT BUILDER                             */
/* -------------------------------------------------------------------------- */

export const assessmentBuilderSchema = z
  .object({
    id: z.coerce.number().int().positive().optional(),

    title: z
      .string()
      .trim()
      .min(3, "Assessment title is required.")
      .max(200, "Assessment title cannot exceed 200 characters."),

    instructions: z
      .string()
      .trim()
      .max(5000, "Instructions cannot exceed 5,000 characters.")
      .optional()
      .or(z.literal("")),

    lessonId: z.coerce.number().int().positive("Select a lesson."),

    academicYear: z
      .string()
      .trim()
      .regex(/^\d{4}\/\d{4}$/, "Enter the academic year as 2026/2027."),

    termId: z.coerce.number().int().positive("Select an academic term."),

    startDate: z.coerce.date({
      message: "Enter a valid start date and time.",
    }),

    dueDate: z.coerce.date({
      message: "Enter a valid due date and time.",
    }),

    durationMinutes: z
      .union([
        z.coerce
          .number()
          .int()
          .min(
            ASSESSMENT_LIMITS.MIN_DURATION_MINUTES,
            "Duration must be at least one minute.",
          )
          .max(
            ASSESSMENT_LIMITS.MAX_DURATION_MINUTES,
            `Duration cannot exceed ${ASSESSMENT_LIMITS.MAX_DURATION_MINUTES} minutes.`,
          ),
        z.null(),
        z.literal(""),
      ])
      .optional()
      .transform((value) => {
        if (value === "" || value === undefined) return null;
        return value;
      }),

    passMarkPercent: z.coerce
      .number()
      .int("Pass mark must be a whole number.")
      .min(ASSESSMENT_LIMITS.MIN_PASS_MARK, "Pass mark cannot be below 0%.")
      .max(ASSESSMENT_LIMITS.MAX_PASS_MARK, "Pass mark cannot exceed 100%.")
      .default(ASSESSMENT_DEFAULTS.passMarkPercent),

    maxAttempts: z.coerce
      .number()
      .int("Maximum attempts must be a whole number.")
      .min(ASSESSMENT_LIMITS.MIN_ATTEMPTS, "At least one attempt is required.")
      .max(
        ASSESSMENT_LIMITS.MAX_ATTEMPTS,
        `Students cannot receive more than ${ASSESSMENT_LIMITS.MAX_ATTEMPTS} attempts.`,
      )
      .default(ASSESSMENT_DEFAULTS.maxAttempts),

    shuffleQuestions: z.boolean().default(ASSESSMENT_DEFAULTS.shuffleQuestions),

    shuffleOptions: z.boolean().default(ASSESSMENT_DEFAULTS.shuffleOptions),

    allowBacktrack: z.boolean().default(ASSESSMENT_DEFAULTS.allowBacktrack),

    allowUnanswered: z.boolean().default(ASSESSMENT_DEFAULTS.allowUnanswered),

    showInstantResult: z
      .boolean()
      .default(ASSESSMENT_DEFAULTS.showInstantResult),

    showCorrectAnswers: z
      .boolean()
      .default(ASSESSMENT_DEFAULTS.showCorrectAnswers),

    showExplanations: z.boolean().default(ASSESSMENT_DEFAULTS.showExplanations),

    autoSubmit: z.boolean().default(ASSESSMENT_DEFAULTS.autoSubmit),

    questions: z
      .array(assessmentQuestionSchema)
      .min(ASSESSMENT_LIMITS.MIN_QUESTIONS, "Add at least one question.")
      .max(
        ASSESSMENT_LIMITS.MAX_QUESTIONS,
        `An assessment cannot contain more than ${ASSESSMENT_LIMITS.MAX_QUESTIONS} questions.`,
      ),
  })
  .superRefine((assessment, ctx) => {
    if (assessment.dueDate <= assessment.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "The due date must be after the start date.",
      });
    }

    const questionPositions = assessment.questions.map(
      (question) => question.position,
    );

    const hasDuplicateQuestionPositions =
      new Set(questionPositions).size !== questionPositions.length;

    if (hasDuplicateQuestionPositions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions"],
        message: "Each question must have a unique position.",
      });
    }

    const normalizedQuestions = assessment.questions.map((question) =>
      question.questionText.trim().toLowerCase(),
    );

    const hasDuplicateQuestions =
      new Set(normalizedQuestions).size !== normalizedQuestions.length;

    if (hasDuplicateQuestions) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions"],
        message: "The assessment contains duplicate questions.",
      });
    }

    // new just ADDED
    if (assessment.showCorrectAnswers && !assessment.showInstantResult) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["showCorrectAnswers"],
        message:
          "Correct answers cannot be shown when instant results are disabled.",
      });
    }

    if (assessment.showExplanations && !assessment.showCorrectAnswers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["showExplanations"],
        message: "Explanations require correct-answer review to be enabled.",
      });
    }

    if (assessment.autoSubmit && assessment.durationMinutes === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["autoSubmit"],
        message: "Automatic submission requires a time limit.",
      });
    }
  });

export type AssessmentBuilderInput = z.infer<typeof assessmentBuilderSchema>;

/* -------------------------------------------------------------------------- */
/*                               DRAFT VALIDATION                              */
/* -------------------------------------------------------------------------- */

/**
 * A draft can be saved before the teacher completes all questions.
 * Publishing will use assessmentBuilderSchema instead.
 */
export const assessmentDraftSchema = z.object({
  id: z.coerce.number().int().positive().optional(),

  title: z
    .string()
    .trim()
    .max(200, "Assessment title cannot exceed 200 characters.")
    .default("Untitled Assessment"),

  instructions: z.string().trim().max(5000).optional().or(z.literal("")),

  lessonId: z.coerce.number().int().positive().optional(),

  termId: z.coerce.number().int().positive().nullable().optional(),

  academicYear: z.string().trim().min(4).max(20).default(""),

  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),

  durationMinutes: z.coerce
    .number()
    .int()
    .min(1)
    .max(300)
    .nullable()
    .optional(),

  passMarkPercent: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .default(ASSESSMENT_DEFAULTS.passMarkPercent),

  maxAttempts: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .default(ASSESSMENT_DEFAULTS.maxAttempts),

  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  allowBacktrack: z.boolean().default(true),
  allowUnanswered: z.boolean().default(true),

  showInstantResult: z.boolean().default(true),
  showCorrectAnswers: z.boolean().default(false),
  showExplanations: z.boolean().default(false),

  autoSubmit: z.boolean().default(true),

  questions: z.array(z.unknown()).default([]),
});

export type AssessmentDraftInput = z.infer<typeof assessmentDraftSchema>;

/* -------------------------------------------------------------------------- */
/*                              STUDENT RESPONSES                              */
/* -------------------------------------------------------------------------- */

export const saveAssessmentAnswerSchema = z.object({
  attemptId: z.coerce.number().int().positive(),

  questionId: z.coerce.number().int().positive(),

  selectedOptionId: z
    .union([z.coerce.number().int().positive(), z.null()])
    .optional(),

  flagged: z.boolean().optional(),

  timeSpentSeconds: z.coerce.number().int().min(0).max(86400).optional(),
});

export type SaveAssessmentAnswerInput = z.infer<
  typeof saveAssessmentAnswerSchema
>;

export const startAssessmentSchema = z.object({
  assessmentId: z.coerce.number().int().positive(),
});

export type StartAssessmentInput = z.infer<typeof startAssessmentSchema>;

export const submitAssessmentSchema = z.object({
  assessmentId: z.coerce
    .number()
    .int()
    .positive(),

  attemptId: z.coerce
    .number()
    .int()
    .positive(),

  submissionMode: z
    .enum(["MANUAL", "AUTO"])
    .default("MANUAL"),
});

export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;

/*------------------------------------
-------------------------------------
      FEEDBACK VALIDATION
-------------------------------------
----------------------------------*/

export const assessmentTeacherFeedbackSchema = z.object({
  assessmentId: z.coerce.number().int().positive(),

  attemptId: z.coerce.number().int().positive(),

  studentId: z.string().min(1),

  feedback: z
    .string()
    .trim()
    .max(3000, "Teacher feedback cannot exceed 3,000 characters."),
});

export type AssessmentTeacherFeedbackInput = z.infer<
  typeof assessmentTeacherFeedbackSchema
>;

export const updateAttemptNavigationSchema = z.object({
  attemptId: z.coerce.number().int().positive(),

  nextQuestionIndex: z.number().int().min(0),

  activeSessionId: z.string().uuid(),

  expectedAttemptVersion: z.number().int().positive(),
});

export type UpdateAttemptNavigationInput = z.infer<
  typeof updateAttemptNavigationSchema
>;
