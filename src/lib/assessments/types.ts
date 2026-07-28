import type { AssessmentAttemptStatus, AssessmentStatus } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*                                  LESSONS                                   */
/* -------------------------------------------------------------------------- */

export type AssessmentLessonOption = {
  id: number;
  name: string;

  subject: {
    id: number;
    name: string;
  };

  class: {
    id: number;
    name: string;
  };

  teacher: {
    id: string;
    name: string;
    surname: string;
  };
};

/* -------------------------------------------------------------------------- */
/*                              TEACHER BUILDER                                */
/* -------------------------------------------------------------------------- */

export type AssessmentBuilderOption = {
  id?: number;
  clientId: string;
  optionText: string;
  imageUrl?: string;
  isCorrect: boolean;
  position: number;
};

export type AssessmentBuilderQuestion = {
  id?: number;
  clientId: string;
  questionText: string;
  imageUrl?: string;
  explanation?: string;
  marks: number;
  position: number;
  options: AssessmentBuilderOption[];
};

export type AssessmentBuilderData = {
  id?: number;
  title: string;
  instructions?: string;

  lessonId?: number;

  startDate?: Date | string;
  dueDate?: Date | string;

  durationMinutes: number | null;
  passMarkPercent: number;
  maxAttempts: number;

  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowBacktrack: boolean;
  allowUnanswered: boolean;

  showInstantResult: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;

  autoSubmit: boolean;

  status?: AssessmentStatus;

  questions: AssessmentBuilderQuestion[];
};

/* -------------------------------------------------------------------------- */
/*                           STUDENT-SAFE TEST DATA                            */
/* -------------------------------------------------------------------------- */

/**
 * These types intentionally exclude:
 *
 * isCorrect
 * explanation
 * marksAwarded
 *
 * Never expose the answer key before final submission.
 */

export type StudentAssessmentOption = {
  id: number;
  optionText: string;
  imageUrl: string | null;
  position: number;
};

export type StudentAssessmentQuestion = {
  id: number;
  questionText: string;
  imageUrl: string | null;
  marks: number;
  position: number;
  options: StudentAssessmentOption[];
};

export type StudentSavedAnswer = {
  questionId: number;
  selectedOptionId: number | null;
  flagged: boolean;
};

export type StudentAssessmentPlayerData = {
  assessment: {
    id: number;
    title: string;
    instructions: string | null;

    durationMinutes: number | null;

    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    allowBacktrack: boolean;
    allowUnanswered: boolean;
    autoSubmit: boolean;

    questionCount: number;
    totalMarks: number;

    lesson: {
      subject: {
        name: string;
      };

      class: {
        name: string;
      };

      teacher: {
        name: string;
        surname: string;
      };
    };
  };

  attempt: {
    id: number;
    attemptNumber: number;
    status: AssessmentAttemptStatus;

    startedAt: Date | string;
    expiresAt: Date | string | null;
    lastActivityAt: Date | string;
  };

  questions: StudentAssessmentQuestion[];
  savedAnswers: StudentSavedAnswer[];
};

/* -------------------------------------------------------------------------- */
/*                              RESULT AND REVIEW                              */
/* -------------------------------------------------------------------------- */

export type AssessmentResultSummary = {
  attemptId: number;
  assessmentId: number;
  assessmentTitle: string;

  subject: string;
  className: string;
  teacherName: string;

  attemptNumber: number;

  submissionStatus: "SUBMITTED" | "AUTO_SUBMITTED";

  score: number;
  totalMarks: number;
  percentage: number;

  grade: string;
  remarks: string;

  passed: boolean;

  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;

  timeSpentSeconds: number;
  submittedAt: Date | string;

  showInstantResult: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;

  teacherFeedback: string | null;
  reviewedAt: Date | string | null;
  reviewedByName: string | null;
};

export type AssessmentReviewOption = {
  id: number;
  optionText: string;
  imageUrl: string | null;

  isCorrect: boolean;
  wasSelected: boolean;
};

export type AssessmentReviewQuestion = {
  id: number;
  questionText: string;
  imageUrl: string | null;

  marks: number;
  marksAwarded: number;

  isCorrect: boolean | null;

  explanation: string | null;

  options: AssessmentReviewOption[];
};

export type AssessmentResultReview = {
  summary: AssessmentResultSummary;
  questions: AssessmentReviewQuestion[];
};

/* -------------------------------------------------------------------------- */
/*                                  ACTIONS                                   */
/* -------------------------------------------------------------------------- */

export type AssessmentActionResult<T = never> =
  | {
      success: true;
      error: false;
      message: string;
      data: T;
      fieldErrors?: never;
    }
  | {
      success: false;
      error: true;
      message: string;
      data?: never;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export type AssessmentDraftSaveResult = {
  assessmentId: number;
  updatedAt: Date | string;
};

export type PublishAssessmentResult = {
  assessmentId: number;
  status: AssessmentStatus;
  publishedAt: Date;
};

export type StartAssessmentResult = {
  assessmentId: number;
  attemptId: number;
  attemptNumber: number;
  expiresAt: Date | string | null;
};

export type SaveAnswerResult = {
  answerId: number;
  savedAt: Date | string;
};

// export type SubmitAssessmentResult = AssessmentResultSummary;

export type StudentAssessmentCardStatus =
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "UPCOMING"
  | "COMPLETED"
  | "MISSED"
  | "CLOSED";

export type StudentAssessmentDashboardItem = {
  id: number;
  title: string;
  instructions: string | null;

  status: StudentAssessmentCardStatus;

  startDate: Date | string;
  dueDate: Date | string;

  durationMinutes: number | null;
  totalMarks: number;
  questionCount: number;
  passMarkPercent: number;
  maxAttempts: number;

  attemptsUsed: number;
  attemptsRemaining: number;

  lesson: {
    subject: {
      id: number;
      name: string;
    };

    class: {
      id: number;
      name: string;
    };

    teacher: {
      id: string;
      name: string;
      surname: string;
    };
  };

  activeAttempt: {
    id: number;
    startedAt: Date | string;
    expiresAt: Date | string | null;
    answeredCount: number;
  } | null;

  latestResult: {
    attemptId: number;
    score: number;
    totalMarks: number;
    percentage: number;
    grade: string | null;
    remarks: string | null;
    submittedAt: Date | string;
  } | null;
};

export type StudentAssessmentDashboardMetrics = {
  available: number;
  inProgress: number;
  upcoming: number;
  completed: number;
  missed: number;
  averageScore: number | null;
};

export type StudentAssessmentDashboardData = {
  items: StudentAssessmentDashboardItem[];
  metrics: StudentAssessmentDashboardMetrics;
};

export type StudentAssessmentIntroductionData = {
  id: number;
  title: string;
  instructions: string | null;

  status:
    | "AVAILABLE"
    | "IN_PROGRESS"
    | "UPCOMING"
    | "COMPLETED"
    | "CLOSED"
    | "MISSED";

  startDate: Date | string;
  dueDate: Date | string;

  durationMinutes: number | null;
  totalMarks: number;
  questionCount: number;
  passMarkPercent: number;
  maxAttempts: number;

  attemptsUsed: number;
  attemptsRemaining: number;

  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowBacktrack: boolean;
  allowUnanswered: boolean;
  autoSubmit: boolean;

  lesson: {
    subject: {
      id: number;
      name: string;
    };

    class: {
      id: number;
      name: string;
    };

    teacher: {
      id: string;
      name: string;
      surname: string;
    };
  };

  activeAttempt: {
    id: number;
    attemptNumber: number;
    startedAt: Date | string;
    expiresAt: Date | string | null;
    answeredCount: number;
  } | null;

  latestAttempt: {
    id: number;
    status: AssessmentAttemptStatus;
    score: number | null;
    totalMarks: number | null;
    percentage: number | null;
    submittedAt: Date | string | null;
  } | null;

  canStart: boolean;
  canContinue: boolean;
  canReviewResult: boolean;

  unavailableReason: string | null;
};

export type AssessmentSubmissionMode = "MANUAL" | "AUTO";

export type AssessmentGradedAnswer = {
  answerId: number | null;
  questionId: number;
  selectedOptionId: number | null;

  isCorrect: boolean;
  marksAvailable: number;
  marksAwarded: number;
};

export type AssessmentGradingSummary = {
  attemptId: number;
  assessmentId: number;
  assessmentTitle: string;

  score: number;
  totalMarks: number;
  percentage: number;

  grade: string;
  remarks: string;
  passed: boolean;

  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;

  timeSpentSeconds: number;
  submittedAt: Date | string;

  showInstantResult: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
};

export type SubmitAssessmentResult = AssessmentGradingSummary;

export type TeacherAssessmentSubmissionStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "AUTO_SUBMITTED"
  | "EXPIRED";

export type TeacherAssessmentSubmissionItem = {
  student: {
    id: string;
    studentID: string;
    name: string;
    surname: string;
    img: string | null;
  };

  status: TeacherAssessmentSubmissionStatus;

  attemptsUsed: number;
  maxAttempts: number;

  latestAttempt: {
    id: number;
    attemptNumber: number;
    status:
      | "IN_PROGRESS"
      | "SUBMITTED"
      | "AUTO_SUBMITTED"
      | "EXPIRED"
      | "CANCELLED"
      | "SUBMITTING";

    startedAt: Date | string;
    submittedAt: Date | string | null;

    score: number | null;
    totalMarks: number | null;
    percentage: number | null;

    grade: string | null;
    remarks: string | null;

    timeSpentSeconds: number;
  } | null;

  highestScore: {
    attemptId: number;
    score: number;
    totalMarks: number;
    percentage: number;
    grade: string | null;
  } | null;

  passed: boolean | null;
};

export type TeacherAssessmentSubmissionSummary = {
  assessment: {
    id: number;
    title: string;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

    totalMarks: number;
    questionCount: number;
    passMarkPercent: number;
    maxAttempts: number;

    lesson: {
      subject: {
        id: number;
        name: string;
      };

      class: {
        id: number;
        name: string;
      };

      teacher: {
        id: string;
        name: string;
        surname: string;
      };
    };
  };

  submissions: TeacherAssessmentSubmissionItem[];

  metrics: {
    totalStudents: number;
    submittedStudents: number;
    inProgressStudents: number;
    notStartedStudents: number;
    expiredStudents: number;

    completionRate: number;
    averageScore: number | null;
    passRate: number | null;
    highestScore: number | null;
    lowestScore: number | null;
  };
};

export type AssessmentOptionAnalytics = {
  optionId: number;
  optionText: string;
  isCorrect: boolean;

  selectionCount: number;
  selectionPercentage: number;
};

export type AssessmentQuestionAnalytics = {
  questionId: number;
  questionNumber: number;
  questionText: string;
  marks: number;

  totalResponses: number;
  correctResponses: number;
  incorrectResponses: number;
  unansweredResponses: number;

  correctPercentage: number;
  incorrectPercentage: number;
  unansweredPercentage: number;

  difficulty:
    | "VERY_EASY"
    | "EASY"
    | "MODERATE"
    | "DIFFICULT"
    | "VERY_DIFFICULT";

  averageMarksAwarded: number;

  options: AssessmentOptionAnalytics[];
};

export type AssessmentScoreBand = {
  label: string;
  minimum: number;
  maximum: number;
  count: number;
  percentage: number;
};

export type TeacherAssessmentAnalytics = {
  assessment: {
    id: number;
    title: string;
    status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

    totalMarks: number;
    questionCount: number;
    passMarkPercent: number;

    lesson: {
      subject: {
        name: string;
      };

      class: {
        name: string;
      };

      teacher: {
        name: string;
        surname: string;
      };
    };
  };

  metrics: {
    totalStudents: number;
    submittedStudents: number;
    completionRate: number;

    averageScore: number | null;
    medianScore: number | null;

    passRate: number | null;
    highestScore: number | null;
    lowestScore: number | null;

    averageTimeSeconds: number | null;
  };

  scoreBands: AssessmentScoreBand[];

  questionAnalytics: AssessmentQuestionAnalytics[];

  strongestQuestions: AssessmentQuestionAnalytics[];
  weakestQuestions: AssessmentQuestionAnalytics[];
};

export type TeacherSubmissionReviewOption = {
  id: number;
  optionText: string;
  imageUrl: string | null;

  isCorrect: boolean;
  wasSelected: boolean;
};

export type TeacherSubmissionReviewQuestion = {
  id: number;
  questionNumber: number;
  questionText: string;
  imageUrl: string | null;

  marksAvailable: number;
  marksAwarded: number;

  selectedOptionId: number | null;

  isCorrect: boolean;
  wasAnswered: boolean;
  wasFlagged: boolean;

  timeSpentSeconds: number;

  explanation: string | null;

  options: TeacherSubmissionReviewOption[];
};

export type TeacherSubmissionAttemptSummary = {
  id: number;
  attemptNumber: number;

  status:
    | "IN_PROGRESS"
    | "SUBMITTING"
    | "SUBMITTED"
    | "AUTO_SUBMITTED"
    | "EXPIRED"
    | "CANCELLED";

  startedAt: Date | string;
  submittedAt: Date | string | null;

  score: number | null;
  totalMarks: number | null;
  percentage: number | null;

  grade: string | null;
  remarks: string | null;

  passed: boolean | null;

  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;

  answeredCount: number;
  flaggedCount: number;

  timeSpentSeconds: number;

  teacherFeedback: string | null;
  reviewedAt: Date | string | null;

  reviewedBy: {
    id: string;
    name: string;
    surname: string;
  } | null;
};

export type TeacherStudentSubmissionReview = {
  assessment: {
    id: number;
    title: string;

    status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

    totalMarks: number;
    questionCount: number;
    passMarkPercent: number;
    maxAttempts: number;

    startDate: Date | string;
    dueDate: Date | string;

    lesson: {
      subject: {
        id: number;
        name: string;
      };

      class: {
        id: number;
        name: string;
      };

      teacher: {
        id: string;
        name: string;
        surname: string;
      };
    };
  };

  student: {
    id: string;
    studentID: string;
    name: string;
    surname: string;
    img: string | null;

    className: string;
    gradeLevel: string;
  };

  attempts: TeacherSubmissionAttemptSummary[];

  selectedAttempt: TeacherSubmissionAttemptSummary | null;

  questions: TeacherSubmissionReviewQuestion[];

  comparison: {
    totalAttempts: number;
    completedAttempts: number;

    firstScore: number | null;
    latestScore: number | null;
    highestScore: number | null;
    lowestScore: number | null;

    improvement: number | null;
    averageScore: number | null;

    averageTimeSeconds: number | null;
  };
};
