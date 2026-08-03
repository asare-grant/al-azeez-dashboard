import {
  Prisma,
  type AssessmentAttemptStatus,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  gradeAssessmentAttempt,
} from "./grade-attempt";

import {
  calculateTimeSpentSeconds,
  hasAttemptExpired,
} from "./timing";

import {
  AssessmentError,
} from "./errors";

import {
  withSerializableRetry,
} from "./transaction";

import {
  createAssessmentAudit,
} from "./audit";

import type {
  AssessmentGradingSummary,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type GradeAttemptInput = {
  assessmentId: number;
  attemptId: number;
  studentId: string;

  submissionMode:
    | "MANUAL"
    | "AUTO";

  submissionToken: string;
};

export type GradeAttemptResult =
  | {
      success: true;
      message: string;
      data: AssessmentGradingSummary;
    }
  | {
      success: false;
      message: string;
      code: string;
      retryable: boolean;
    };

/* -------------------------------------------------------------------------- */
/*                             ERROR NORMALISATION                            */
/* -------------------------------------------------------------------------- */

function getGradingErrorResult(
  error: unknown,
): Extract<
  GradeAttemptResult,
  {
    success: false;
  }
> {
  if (
    error instanceof
    AssessmentError
  ) {
    return {
      success: false,
      code: error.code,
      message: error.message,
      retryable:
        error.retryable,
    };
  }

  if (
    error instanceof
    Prisma.PrismaClientKnownRequestError
  ) {
    if (
      error.code === "P2034"
    ) {
      return {
        success: false,
        code:
          "TRANSACTION_CONFLICT",
        message:
          "The assessment was being processed by another request. Please try again.",
        retryable:
          true,
      };
    }
  }

  if (
    error instanceof Error
  ) {
    switch (error.message) {
      case "ATTEMPT_NOT_FOUND":
        return {
          success: false,
          code:
            "ATTEMPT_NOT_FOUND",
          message:
            "The assessment attempt could not be found.",
          retryable:
            false,
        };

      case "ATTEMPT_NOT_ACTIVE":
        return {
          success: false,
          code:
            "ATTEMPT_NOT_ACTIVE",
          message:
            "This assessment attempt is no longer active.",
          retryable:
            false,
        };

      case "ATTEMPT_EXPIRED":
        return {
          success: false,
          code:
            "ATTEMPT_EXPIRED",
          message:
            "The assessment time has expired.",
          retryable:
            false,
        };

      case "AUTO_SUBMIT_DISABLED":
        return {
          success: false,
          code:
            "AUTO_SUBMIT_DISABLED",
          message:
            "The assessment expired and automatic submission is disabled.",
          retryable:
            false,
        };

      case "UNANSWERED_QUESTIONS_NOT_ALLOWED":
        return {
          success: false,
          code:
            "UNANSWERED_QUESTIONS_NOT_ALLOWED",
          message:
            "Answer every question before submitting this assessment.",
          retryable:
            false,
        };

      case "COMPLETED_ATTEMPT_WITHOUT_RESULT":
        return {
          success: false,
          code:
            "COMPLETED_ATTEMPT_WITHOUT_RESULT",
          message:
            "The completed attempt could not be matched to a result.",
          retryable:
            false,
        };
    }

    if (
      error.message.startsWith(
        "QUESTION_",
      )
    ) {
      return {
        success: false,
        code:
          "INVALID_ANSWER_KEY",
        message:
          "One or more questions have an invalid answer key. Contact your teacher.",
        retryable:
          false,
      };
    }
  }

  return {
    success: false,
    code:
      "INTERNAL_ERROR",
    message:
      "The assessment could not be submitted.",
    retryable:
      true,
  };
}

/* -------------------------------------------------------------------------- */
/*                         GRADE ASSESSMENT ATTEMPT                           */
/* -------------------------------------------------------------------------- */

export async function gradeAttemptForStudent(
  input: GradeAttemptInput,
): Promise<GradeAttemptResult> {
  const {
    assessmentId,
    attemptId,
    studentId,
    submissionMode,
    submissionToken,
  } = input;

  try {
    const result =
      await withSerializableRetry(
        () =>
          prisma.$transaction(
            async (tx) => {
              const now =
                new Date();

              /*
               * Load enough information to validate
               * and claim the attempt.
               */
              const existingAttempt =
                await tx.assessmentAttempt.findFirst({
                  where: {
                    id:
                      attemptId,

                    assessmentId,

                    studentId,
                  },

                  select: {
                    id:
                      true,

                    status:
                      true,

                    startedAt:
                      true,

                    submittedAt:
                      true,

                    expiresAt:
                      true,

                    submissionToken:
                      true,

                    submissionStartedAt:
                      true,

                    assessment: {
                      select: {
                        id:
                          true,

                        title:
                          true,

                        dueDate:
                          true,

                        autoSubmit:
                          true,

                        allowUnanswered:
                          true,

                        passMarkPercent:
                          true,

                        showInstantResult:
                          true,

                        showCorrectAnswers:
                          true,

                        showExplanations:
                          true,

                        durationMinutes:
                          true,
                      },
                    },

                    result: {
                      select: {
                        score:
                          true,

                        totalMarks:
                          true,

                        percentage:
                          true,

                        grade:
                          true,

                        remarks:
                          true,

                        createdAt:
                          true,
                      },
                    },
                  },
                });

              if (
                !existingAttempt
              ) {
                throw new AssessmentError(
                  "ATTEMPT_NOT_FOUND",
                  "The assessment attempt could not be found.",
                  false,
                );
              }

              /*
               * Idempotent retry:
               *
               * If this attempt was already graded,
               * return the existing result instead
               * of grading it a second time.
               */
              if (
                existingAttempt.status ===
                  "SUBMITTED" ||
                existingAttempt.status ===
                  "AUTO_SUBMITTED"
              ) {
                const completedAttempt =
                  await tx.assessmentAttempt.findUnique({
                    where: {
                      id:
                        attemptId,
                    },

                    select: {
                      id:
                        true,

                      score:
                        true,

                      totalMarks:
                        true,

                      percentage:
                        true,

                      correctCount:
                        true,

                      incorrectCount:
                        true,

                      unansweredCount:
                        true,

                      timeSpentSeconds:
                        true,

                      submittedAt:
                        true,

                      assessment: {
                        select: {
                          id:
                            true,

                          title:
                            true,

                          passMarkPercent:
                            true,

                          showInstantResult:
                            true,

                          showCorrectAnswers:
                            true,

                          showExplanations:
                            true,
                        },
                      },

                      result: {
                        select: {
                          grade:
                            true,

                          remarks:
                            true,
                        },
                      },
                    },
                  });

                if (
                  !completedAttempt ||
                  !completedAttempt.result ||
                  !completedAttempt.submittedAt
                ) {
                  throw new AssessmentError(
                    "COMPLETED_ATTEMPT_WITHOUT_RESULT",
                    "The completed attempt could not be matched to a result.",
                    false,
                  );
                }

                return {
                  attemptId:
                    completedAttempt.id,

                  assessmentId:
                    completedAttempt.assessment.id,

                  assessmentTitle:
                    completedAttempt.assessment.title,

                  score:
                    completedAttempt.score ??
                    0,

                  totalMarks:
                    completedAttempt.totalMarks ??
                    0,

                  percentage:
                    completedAttempt.percentage ??
                    0,

                  grade:
                    completedAttempt.result.grade ??
                    "N/A",

                  remarks:
                    completedAttempt.result.remarks ??
                    "Assessment completed.",

                  passed:
                    (
                      completedAttempt.percentage ??
                      0
                    ) >=
                    completedAttempt.assessment
                      .passMarkPercent,

                  correctCount:
                    completedAttempt.correctCount ??
                    0,

                  incorrectCount:
                    completedAttempt.incorrectCount ??
                    0,

                  unansweredCount:
                    completedAttempt.unansweredCount ??
                    0,

                  timeSpentSeconds:
                    completedAttempt.timeSpentSeconds,

                  submittedAt:
                    completedAttempt.submittedAt,

                  showInstantResult:
                    completedAttempt.assessment
                      .showInstantResult,

                  showCorrectAnswers:
                    completedAttempt.assessment
                      .showCorrectAnswers,

                  showExplanations:
                    completedAttempt.assessment
                      .showExplanations,
                } satisfies AssessmentGradingSummary;
              }

              /*
               * Another request owns this attempt's
               * submission lock.
               */
              if (
                existingAttempt.status ===
                  "SUBMITTING" &&
                existingAttempt.submissionToken !==
                  submissionToken
              ) {
                throw new AssessmentError(
                  "ATTEMPT_SUBMITTING",
                  "This assessment is already being submitted.",
                  true,
                );
              }

              if (
                existingAttempt.status !==
                  "IN_PROGRESS" &&
                existingAttempt.status !==
                  "SUBMITTING"
              ) {
                throw new AssessmentError(
                  "ATTEMPT_NOT_ACTIVE",
                  "This assessment attempt is no longer active.",
                  false,
                );
              }

              const attemptExpired =
                hasAttemptExpired({
                  expiresAt:
                    existingAttempt.expiresAt,

                  now,
                }) ||
                existingAttempt.assessment
                  .dueDate <= now;

              /*
               * A manual request cannot submit after
               * the assessment has expired.
               */
              if (
                attemptExpired &&
                submissionMode ===
                  "MANUAL"
              ) {
                throw new AssessmentError(
                  "ATTEMPT_EXPIRED",
                  "The assessment time has expired.",
                  false,
                );
              }

              /*
               * A scheduler may submit an expired
               * attempt only when auto-submit is enabled.
               */
              if (
                attemptExpired &&
                submissionMode ===
                  "AUTO" &&
                !existingAttempt.assessment
                  .autoSubmit
              ) {
                throw new AssessmentError(
                  "AUTO_SUBMIT_DISABLED",
                  "The assessment expired and automatic submission is disabled.",
                  false,
                );
              }

              /*
               * Atomically claim the attempt.
               *
               * A retry with the same token may
               * continue. A different token cannot.
               */
              const lockResult =
                await tx.assessmentAttempt.updateMany({
                  where: {
                    id:
                      attemptId,

                    assessmentId,

                    studentId,

                    OR: [
                      {
                        status:
                          "IN_PROGRESS",
                      },
                      {
                        status:
                          "SUBMITTING",

                        submissionToken,
                      },
                    ],
                  },

                  data: {
                    status:
                      "SUBMITTING",

                    submissionToken,

                    submissionStartedAt:
                      now,

                    lastActivityAt:
                      now,

                    failureReason:
                      null,
                  },
                });

              if (
                lockResult.count !==
                1
              ) {
                throw new AssessmentError(
                  "ATTEMPT_SUBMITTING",
                  "This assessment is already being submitted.",
                  true,
                );
              }

              /*
               * Load the complete assessment,
               * questions and saved answers.
               */
              const attempt =
                await tx.assessmentAttempt.findUnique({
                  where: {
                    id:
                      attemptId,
                  },

                  select: {
                    id:
                      true,

                    startedAt:
                      true,

                    expiresAt:
                      true,

                    assessment: {
                      select: {
                        id:
                          true,

                        title:
                          true,

                        totalMarks:
                          true,

                        passMarkPercent:
                          true,

                        allowUnanswered:
                          true,

                        durationMinutes:
                          true,

                        showInstantResult:
                          true,

                        showCorrectAnswers:
                          true,

                        showExplanations:
                          true,

                        questions: {
                          orderBy: {
                            position:
                              "asc",
                          },

                          select: {
                            id:
                              true,

                            marks:
                              true,

                            options: {
                              select: {
                                id:
                                  true,

                                isCorrect:
                                  true,
                              },
                            },
                          },
                        },
                      },
                    },

                    answers: {
                      select: {
                        id:
                          true,

                        questionId:
                          true,

                        selectedOptionId:
                          true,
                      },
                    },
                  },
                });

              if (
                !attempt
              ) {
                throw new AssessmentError(
                  "ATTEMPT_NOT_FOUND",
                  "The assessment attempt could not be found.",
                  false,
                );
              }

              const answeredCount =
                attempt.answers.filter(
                  (answer) =>
                    answer.selectedOptionId !==
                    null,
                ).length;

              const unansweredCount =
                attempt.assessment.questions
                  .length -
                answeredCount;

              /*
               * Manual submission can be rejected
               * when every question is required.
               */
              if (
                submissionMode ===
                  "MANUAL" &&
                !attempt.assessment
                  .allowUnanswered &&
                unansweredCount >
                  0
              ) {
                await tx.assessmentAttempt.update({
                  where: {
                    id:
                      attemptId,
                  },

                  data: {
                    status:
                      "IN_PROGRESS",

                    submissionToken:
                      null,

                    submissionStartedAt:
                      null,

                    failureReason:
                      "Submission blocked because unanswered questions are not allowed.",

                    lastActivityAt:
                      now,
                  },
                });

                throw new AssessmentError(
                  "UNANSWERED_NOT_ALLOWED",
                  "Answer every question before submitting this assessment.",
                  false,
                );
              }

              /*
               * Grade every question.
               */
              const grading =
                gradeAssessmentAttempt({
                  questions:
                    attempt.assessment
                      .questions,

                  answers:
                    attempt.answers,

                  passMarkPercent:
                    attempt.assessment
                      .passMarkPercent,
                });

              /*
               * Store marking information for every
               * existing answer.
               */
              for (
                const gradedAnswer of
                grading.gradedAnswers
              ) {
                if (
                  gradedAnswer.answerId
                ) {
                  await tx.assessmentAnswer.update({
                    where: {
                      id:
                        gradedAnswer.answerId,
                    },

                    data: {
                      isCorrect:
                        gradedAnswer.isCorrect,

                      marksAwarded:
                        gradedAnswer.marksAwarded,
                    },
                  });

                  continue;
                }

                /*
                 * Create explicit unanswered rows for
                 * review and analytics.
                 */
                await tx.assessmentAnswer.create({
                  data: {
                    attemptId,

                    questionId:
                      gradedAnswer.questionId,

                    selectedOptionId:
                      null,

                    isCorrect:
                      false,

                    marksAwarded:
                      0,

                    flagged:
                      false,

                    answeredAt:
                      null,

                    timeSpentSeconds:
                      0,

                    version:
                      1,
                  },
                });
              }

              const maximumSeconds =
                attempt.assessment
                  .durationMinutes !==
                null
                  ? attempt.assessment
                      .durationMinutes *
                    60
                  : null;

              const timeSpentSeconds =
                calculateTimeSpentSeconds({
                  startedAt:
                    attempt.startedAt,

                  submittedAt:
                    now,

                  maximumSeconds,
                });

              const finalStatus: AssessmentAttemptStatus =
                submissionMode ===
                "AUTO"
                  ? "AUTO_SUBMITTED"
                  : "SUBMITTED";

              /*
               * Store the final attempt totals and
               * clear temporary submission data.
               */
              await tx.assessmentAttempt.update({
                where: {
                  id:
                    attemptId,
                },

                data: {
                  status:
                    finalStatus,

                  submittedAt:
                    now,

                  lastActivityAt:
                    now,

                  timeSpentSeconds,

                  score:
                    grading.score,

                  totalMarks:
                    grading.totalMarks,

                  percentage:
                    grading.percentage,

                  correctCount:
                    grading.correctCount,

                  incorrectCount:
                    grading.incorrectCount,

                  unansweredCount:
                    grading.unansweredCount,

                  submissionToken:
                    null,

                  submissionStartedAt:
                    null,

                  failureReason:
                    null,
                },
              });

              /*
               * Create or update the result row.
               */
              await tx.result.upsert({
                where: {
                  assessmentAttemptId:
                    attemptId,
                },

                create: {
                  score:
                    grading.score,

                  totalMarks:
                    grading.totalMarks,

                  percentage:
                    grading.percentage,

                  grade:
                    grading.grade,

                  remarks:
                    grading.remarks,

                  type:
                    "ASSESSMENT",

                  assessmentId:
                    attempt.assessment.id,

                  assessmentAttemptId:
                    attemptId,

                  studentId,
                },

                update: {
                  score:
                    grading.score,

                  totalMarks:
                    grading.totalMarks,

                  percentage:
                    grading.percentage,

                  grade:
                    grading.grade,

                  remarks:
                    grading.remarks,

                  assessmentId:
                    attempt.assessment.id,

                  studentId,
                },
              });

              /*
               * Record the completed submission.
               */
              await createAssessmentAudit(
                tx,
                {
                  action:
                    submissionMode ===
                    "AUTO"
                      ? "ATTEMPT_AUTO_SUBMITTED"
                      : "ATTEMPT_SUBMITTED",

                  actorId:
                    studentId,

                  actorRole:
                    "student",

                  assessmentId:
                    attempt.assessment.id,

                  attemptId,

                  studentId,

                  metadata: {
                    submissionMode,

                    score:
                      grading.score,

                    totalMarks:
                      grading.totalMarks,

                    percentage:
                      grading.percentage,

                    correctCount:
                      grading.correctCount,

                    incorrectCount:
                      grading.incorrectCount,

                    unansweredCount:
                      grading.unansweredCount,

                    timeSpentSeconds,
                  },
                },
              );

              return {
                attemptId:
                  attempt.id,

                assessmentId:
                  attempt.assessment.id,

                assessmentTitle:
                  attempt.assessment.title,

                score:
                  grading.score,

                totalMarks:
                  grading.totalMarks,

                percentage:
                  grading.percentage,

                grade:
                  grading.grade,

                remarks:
                  grading.remarks,

                passed:
                  grading.passed,

                correctCount:
                  grading.correctCount,

                incorrectCount:
                  grading.incorrectCount,

                unansweredCount:
                  grading.unansweredCount,

                timeSpentSeconds,

                submittedAt:
                  now,

                showInstantResult:
                  attempt.assessment
                    .showInstantResult,

                showCorrectAnswers:
                  attempt.assessment
                    .showCorrectAnswers,

                showExplanations:
                  attempt.assessment
                    .showExplanations,
              } satisfies AssessmentGradingSummary;
            },
            {
              isolationLevel:
                Prisma.TransactionIsolationLevel
                  .Serializable,

              maxWait:
                5_000,

              timeout:
                15_000,
            },
          ),
      );

    return {
      success:
        true,

      message:
        submissionMode ===
        "AUTO"
          ? "Assessment submitted automatically and marked successfully."
          : "Assessment submitted and marked successfully.",

      data:
        result,
    };
  } catch (error) {
    console.error(
      "GRADE ASSESSMENT ATTEMPT ERROR:",
      {
        assessmentId,
        attemptId,
        studentId,
        submissionMode,
        error,
      },
    );

    return getGradingErrorResult(
      error,
    );
  }
}