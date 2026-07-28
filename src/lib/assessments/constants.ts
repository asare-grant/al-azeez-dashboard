export const ASSESSMENT_LIMITS = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 100,

  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,

  MIN_MARKS_PER_QUESTION: 1,
  MAX_MARKS_PER_QUESTION: 100,

  MIN_DURATION_MINUTES: 1,
  MAX_DURATION_MINUTES: 300,

  MIN_ATTEMPTS: 1,
  MAX_ATTEMPTS: 10,

  MIN_PASS_MARK: 0,
  MAX_PASS_MARK: 100,
} as const;

export const ASSESSMENT_DEFAULTS = {
  passMarkPercent: 50,
  maxAttempts: 1,
  durationMinutes: 30,

  shuffleQuestions: false,
  shuffleOptions: false,
  allowBacktrack: true,
  allowUnanswered: true,

  showInstantResult: true,
  showCorrectAnswers: false,
  showExplanations: false,

  autoSubmit: true,
} as const;

export const ASSESSMENT_STATUS_LABELS = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
} as const;

export const ATTEMPT_STATUS_LABELS = {
  IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted",
  AUTO_SUBMITTED: "Auto Submitted",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
} as const;