"use server";

import { revalidatePath } from "next/cache";

import {
  Prisma,
  type AssessmentAttemptStatus,
  type AssessmentStatus,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  assessmentTeacherFeedbackSchema,
  type AssessmentTeacherFeedbackInput,
  startAssessmentSchema,
  type StartAssessmentInput,
  assessmentBuilderSchema,
  assessmentDraftSchema,
  saveAssessmentAnswerSchema,
  submitAssessmentSchema,
  type AssessmentBuilderInput,
  type AssessmentDraftInput,
  type SaveAssessmentAnswerInput,
  type SubmitAssessmentInput,
  updateAttemptNavigationSchema,
} from "./validation";

import { createAssessmentAudit } from "@/lib/assessments/audit";

import { syncAssessmentResult } from "@/lib/results/assessment-result-sync";

import { withSerializableRetry } from "@/lib/assessments/transaction";

import { inspectAssessmentIntegrity } from "./integrity";

import { gradeAssessmentAttempt } from "./grade-attempt";

import { assessmentFailure, assessmentSuccess } from "./action-result";

// import { requireAssessmentManager } from "./auth";
import { requireAssessmentStudent, requireAssessmentManager } from "./auth";

import {
  calculateAssessmentTotals,
  normalizeQuestionPositions,
} from "./normalize";

import { canManageAssessment, canUseLessonForAssessment } from "./permissions";

import type {
  AssessmentActionResult,
  AssessmentDraftSaveResult,
  AssessmentBuilderData,
  PublishAssessmentResult,
  StartAssessmentResult,
  SaveAnswerResult,
  AssessmentGradingSummary,
} from "./types";

import {
  calculateTimeSpentSeconds,
  calculateAttemptExpiry,
  hasAttemptExpired,
} from "./timing";
import { AssessmentError } from "./errors";

import {
  notifyAssessmentFeedbackAdded,
  notifyAssessmentPublished,
  notifyAssessmentResultReady,
  notifyAssessmentScheduled,
} from "@/lib/notifications";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const ASSESSMENT_LIST_PATH = "/list/assessments";

function assessmentEditPath(assessmentId: number) {
  return `/list/assessments/${assessmentId}/edit`;
}

function assessmentDetailsPath(assessmentId: number) {
  return `/list/assessments/${assessmentId}`;
}

/* -------------------------------------------------------------------------- */
/*                              ERROR MESSAGES                                */
/* -------------------------------------------------------------------------- */

function getAssessmentErrorMessage(error: unknown): string {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  ) {
    return "The assessment was being saved by another request. Please try again.";
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHENTICATED":
        return "You must sign in to continue.";

      case "UNAUTHORIZED":
        return "You are not authorised to perform this action.";

      case "ASSESSMENT_NOT_FOUND":
        return "The assessment could not be found.";

      case "LESSON_NOT_ALLOWED":
        return "You cannot create an assessment for that lesson.";

      case "PUBLISHED_ASSESSMENT_LOCKED":
        return "Published assessments cannot be structurally edited.";

      case "ASSESSMENT_HAS_ATTEMPTS":
        return "This assessment already has student attempts and cannot be deleted.";

      case "ATTEMPT_NOT_FOUND":
        return "The selected submission could not be found.";

      case "ATTEMPT_NOT_COMPLETED":
        return "Feedback can only be added to a completed submission.";

      default:
        return error.message || "Something went wrong.";
    }
  }

  return "Something went wrong while processing the assessment.";
}

/* -------------------------------------------------------------------------- */
/*                      CREATE A NEW EMPTY ASSESSMENT DRAFT                    */
/* -------------------------------------------------------------------------- */

export async function createAssessmentDraft({
  lessonId,
}: {
  lessonId?: number;
} = {}): Promise<AssessmentActionResult<AssessmentDraftSaveResult>> {
  try {
    const { userId, role } = await requireAssessmentManager();

    if (lessonId) {
      const allowed = await canUseLessonForAssessment({
        lessonId,
        userId,
        role,
      });

      if (!allowed) {
        return assessmentFailure(
          "You cannot create an assessment for that lesson.",
        );
      }
    }

    let resolvedLessonId = lessonId;

    if (!resolvedLessonId) {
      const firstAvailableLesson = await prisma.lesson.findFirst({
        where:
          role === "teacher"
            ? {
                teacherId: userId,
              }
            : undefined,

        select: {
          id: true,
        },

        orderBy: {
          id: "asc",
        },
      });

      if (!firstAvailableLesson) {
        return assessmentFailure(
          role === "teacher"
            ? "You do not have a lesson available for assessment creation."
            : "Create a lesson before creating an assessment.",
        );
      }

      resolvedLessonId = firstAvailableLesson.id;
    }

    const now = new Date();

    const defaultDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeTerm = await prisma.schoolTerm.findFirst({
      where: {
        isActive: true,
      },

      orderBy: {
        startDate: "desc",
      },

      select: {
        id: true,
        startDate: true,
      },
    });

    const currentYear = now.getFullYear();

    const defaultAcademicYear = `${currentYear}/${currentYear + 1}`;

    const assessment = await prisma.assessment.create({
      data: {
        title: "Untitled Assessment",
        instructions: "",

        academicYear: defaultAcademicYear,

        termId: activeTerm?.id ?? null,

        startDate: now,
        dueDate: defaultDueDate,

        durationMinutes: 30,
        passMarkPercent: 50,
        maxAttempts: 1,

        shuffleQuestions: false,
        shuffleOptions: false,
        allowBacktrack: true,
        allowUnanswered: true,

        showInstantResult: true,
        showCorrectAnswers: false,
        showExplanations: false,

        autoSubmit: true,

        status: "DRAFT",

        lessonId: resolvedLessonId,

        totalMarks: 0,
        questionCount: 0,
      },

      select: {
        id: true,
        updatedAt: true,
      },
    });

    revalidatePath(ASSESSMENT_LIST_PATH);

    return assessmentSuccess("Assessment draft created.", {
      assessmentId: assessment.id,
      updatedAt: assessment.updatedAt,
    });
  } catch (error) {
    console.error("CREATE ASSESSMENT DRAFT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                         SAVE ASSESSMENT DRAFT                               */
/* -------------------------------------------------------------------------- */

/**
 * This action is for auto-saving incomplete work.
 *
 * It saves the assessment metadata only.
 * Complete question saving is handled by saveAssessmentBuilder().
 */
export async function saveAssessmentMetadataDraft(
  input: AssessmentDraftInput,
): Promise<AssessmentActionResult<AssessmentDraftSaveResult>> {
  try {
    const parsed = assessmentDraftSchema.safeParse(input);

    if (!parsed.success) {
      return assessmentFailure(
        "Some draft information could not be saved.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const data = parsed.data;

    if (!data.id) {
      return assessmentFailure(
        "Create the assessment draft before saving changes.",
      );
    }

    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId: data.id,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to edit this assessment.",
      );
    }

    const currentAssessment = await prisma.assessment.findUnique({
      where: {
        id: data.id,
      },

      select: {
        id: true,
        status: true,
        lessonId: true,
      },
    });

    if (!currentAssessment) {
      return assessmentFailure("The assessment could not be found.");
    }

    if (currentAssessment.status !== "DRAFT") {
      return assessmentFailure("Only draft assessments can be auto-saved.");
    }

    if (data.lessonId) {
      const lessonAllowed = await canUseLessonForAssessment({
        lessonId: data.lessonId,
        userId,
        role,
      });

      if (!lessonAllowed) {
        return assessmentFailure("You cannot use the selected lesson.");
      }
    }

    const assessment = await prisma.assessment.update({
      where: {
        id: data.id,
      },

      data: {
        title: data.title.trim() || "Untitled Assessment",

        instructions: data.instructions?.trim() || null,

        ...(data.lessonId
          ? {
              lessonId: data.lessonId,
            }
          : {}),

        ...(data.startDate
          ? {
              startDate: data.startDate,
            }
          : {}),

        ...(data.dueDate
          ? {
              dueDate: data.dueDate,
            }
          : {}),

        academicYear: data.academicYear.trim(),

        termId: data.termId,

        durationMinutes: data.durationMinutes ?? null,

        passMarkPercent: data.passMarkPercent,

        maxAttempts: data.maxAttempts,

        shuffleQuestions: data.shuffleQuestions,

        shuffleOptions: data.shuffleOptions,

        allowBacktrack: data.allowBacktrack,

        allowUnanswered: data.allowUnanswered,

        showInstantResult: data.showInstantResult,

        showCorrectAnswers: data.showCorrectAnswers,

        showExplanations: data.showExplanations,

        autoSubmit: data.autoSubmit,
      },

      select: {
        id: true,
        updatedAt: true,
      },
    });

    revalidatePath(assessmentEditPath(assessment.id));

    return assessmentSuccess("Draft saved.", {
      assessmentId: assessment.id,
      updatedAt: assessment.updatedAt,
    });
  } catch (error) {
    console.error("SAVE ASSESSMENT METADATA DRAFT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                       SAVE COMPLETE ASSESSMENT BUILDER                      */
/* -------------------------------------------------------------------------- */

export async function saveAssessmentBuilder(
  input: AssessmentBuilderInput,
): Promise<AssessmentActionResult<AssessmentDraftSaveResult>> {
  try {
    const parsed = assessmentBuilderSchema.safeParse(input);

    if (!parsed.success) {
      return assessmentFailure(
        "Please correct the highlighted assessment fields.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const data = parsed.data;

    if (!data.id) {
      return assessmentFailure(
        "Create the assessment draft before saving questions.",
      );
    }

    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId: data.id,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to edit this assessment.",
      );
    }

    const lessonAllowed = await canUseLessonForAssessment({
      lessonId: data.lessonId,
      userId,
      role,
    });

    if (!lessonAllowed) {
      return assessmentFailure("You cannot use the selected lesson.");
    }

    const normalizedQuestions = normalizeQuestionPositions(
      data.questions.map((question) => ({
        ...question,

        clientId: question.clientId || `question-${question.position}`,

        imageUrl: question.imageUrl || "",

        explanation: question.explanation || "",

        options: question.options.map((option) => ({
          ...option,

          clientId: option.clientId || `option-${option.position}`,

          imageUrl: option.imageUrl || "",
        })),
      })),
    );

    const { questionCount, totalMarks } =
      calculateAssessmentTotals(normalizedQuestions);

    const assessment = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.assessment.findUnique({
          where: {
            id: data.id,
          },

          select: {
            id: true,
            status: true,

            _count: {
              select: {
                attempts: true,
              },
            },
          },
        });

        if (!existing) {
          throw new Error("ASSESSMENT_NOT_FOUND");
        }

        if (existing.status !== "DRAFT") {
          throw new Error("PUBLISHED_ASSESSMENT_LOCKED");
        }

        if (existing._count.attempts > 0) {
          throw new Error("PUBLISHED_ASSESSMENT_LOCKED");
        }

        /*
         * Because this assessment is still a draft and has no
         * student attempts, we can safely replace its question tree.
         *
         * AssessmentQuestion -> AssessmentOption cascades through
         * the Prisma relations defined in the schema.
         */
        await tx.assessmentQuestion.deleteMany({
          where: {
            assessmentId: data.id,
          },
        });

        return tx.assessment.update({
          where: {
            id: data.id,
          },

          data: {
            title: data.title.trim(),

            instructions: data.instructions?.trim() || null,

            academicYear: data.academicYear.trim(),

            termId: data.termId,

            startDate: data.startDate,
            dueDate: data.dueDate,

            durationMinutes: data.durationMinutes ?? null,

            passMarkPercent: data.passMarkPercent,

            maxAttempts: data.maxAttempts,

            shuffleQuestions: data.shuffleQuestions,

            shuffleOptions: data.shuffleOptions,

            allowBacktrack: data.allowBacktrack,

            allowUnanswered: data.allowUnanswered,

            showInstantResult: data.showInstantResult,

            showCorrectAnswers: data.showCorrectAnswers,

            showExplanations: data.showExplanations,

            autoSubmit: data.autoSubmit,

            lessonId: data.lessonId,

            totalMarks,
            questionCount,

            questions: {
              create: normalizedQuestions.map((question) => ({
                questionText: question.questionText.trim(),

                imageUrl: question.imageUrl?.trim() || null,

                explanation: question.explanation?.trim() || null,

                marks: question.marks,
                position: question.position,

                options: {
                  create: question.options.map((option) => ({
                    optionText: option.optionText.trim(),

                    imageUrl: option.imageUrl?.trim() || null,

                    isCorrect: option.isCorrect,

                    position: option.position,
                  })),
                },
              })),
            },
          },

          select: {
            id: true,
            updatedAt: true,
          },
        });
      },
      {
        isolationLevel: "Serializable",
        maxWait: 5000,
        timeout: 15000,
      },
    );

    revalidatePath(ASSESSMENT_LIST_PATH);
    // revalidatePath(assessmentEditPath(assessment.id));
    revalidatePath(assessmentDetailsPath(assessment.id));

    return assessmentSuccess("Assessment saved successfully.", {
      assessmentId: assessment.id,
      updatedAt: assessment.updatedAt,
    });
  } catch (error) {
    console.error("SAVE ASSESSMENT BUILDER ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                           PUBLISH ASSESSMENT                                */
/* -------------------------------------------------------------------------- */

export async function publishAssessment(
  input: AssessmentBuilderInput,
): Promise<AssessmentActionResult<PublishAssessmentResult>> {
  try {
    /*
     * Publishing first performs the same strict validation
     * required by the complete Assessment Studio.
     */
    const parsed = assessmentBuilderSchema.safeParse(input);

    if (!parsed.success) {
      return assessmentFailure(
        "Complete all required fields before publishing.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const data = parsed.data;

    if (!data.id) {
      return assessmentFailure(
        "The assessment must be saved before publishing.",
      );
    }

    console.log("PUBLISH: validation passed", data.id);

    console.log("PUBLISH: saving builder");

    /*
     * Save the latest question structure first.
     */
    const saveResult = await saveAssessmentBuilder(data);

    console.log("PUBLISH: builder save completed", saveResult.success);

    if (!saveResult.success) {
      return assessmentFailure<PublishAssessmentResult>(
        saveResult.message,
        saveResult.fieldErrors,
      );
    }

    const integrity = await inspectAssessmentIntegrity(data.id);

    if (!integrity.valid) {
      return assessmentFailure<PublishAssessmentResult>(
        integrity.errors.join(" "),
      );
    }

    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId: data.id,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to publish this assessment.",
      );
    }

    const now = new Date();

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: data.id,
      },

      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!assessment) {
      return assessmentFailure("The assessment could not be found.");
    }

    // New Guard Just Added
    if (assessment.status !== "DRAFT") {
      return assessmentFailure("Only draft assessments can be published.");
    }

    if (assessment.questionCount < 1) {
      return assessmentFailure("Add at least one question before publishing.");
    }

    if (assessment.totalMarks < 1) {
      return assessmentFailure("The assessment must carry at least one mark.");
    }

    for (const question of assessment.questions) {
      const correctOptionCount = question.options.filter(
        (option) => option.isCorrect,
      ).length;

      if (correctOptionCount !== 1) {
        return assessmentFailure(
          `Question ${
            question.position + 1
          } must have exactly one correct answer.`,
        );
      }
    }

    const nextStatus: AssessmentStatus =
      assessment.startDate > now
        ? "SCHEDULED"
        : assessment.dueDate > now
          ? "PUBLISHED"
          : "CLOSED";

    if (nextStatus === "CLOSED") {
      return assessmentFailure(
        "The due date has already passed. Change the assessment dates before publishing.",
      );
    }

    console.log("PUBLISH: updating status", nextStatus);

    const published = await prisma.$transaction(
      async (tx) => {
        const updated = await tx.assessment.update({
          where: {
            id: assessment.id,
          },

          data: {
            status: nextStatus,

            publishedAt: now,

            closedAt: null,
          },

          select: {
            id: true,

            title: true,

            status: true,

            publishedAt: true,

            startDate: true,

            lesson: {
              select: {
                class: {
                  select: {
                    id: true,

                    name: true,
                  },
                },

                subject: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        const notificationInput = {
          tx,

          assessmentId: updated.id,

          assessmentTitle: updated.title,

          classId: updated.lesson.class.id,

          className: updated.lesson.class.name,

          subjectName: updated.lesson.subject.name,

          actorId: userId,

          actorRole: role,

          actorName: null,
        };

        if (updated.status === "SCHEDULED") {
          await notifyAssessmentScheduled({
            ...notificationInput,

            scheduledFor: updated.startDate,
          });
        } else {
          await notifyAssessmentPublished(notificationInput);
        }

        return updated;
      },

      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 10_000,

        timeout: 30_000,
      },
    );

    console.log("PUBLISH: completed", published.id, published.status);

    revalidatePath(ASSESSMENT_LIST_PATH);
    revalidatePath(assessmentEditPath(published.id));
    revalidatePath(assessmentDetailsPath(published.id));

    return assessmentSuccess(
      published.status === "SCHEDULED"
        ? "Assessment scheduled successfully."
        : "Assessment published successfully.",
      {
        assessmentId: published.id,
        status: published.status,
        publishedAt: published.publishedAt ?? now,
      },
    );
  } catch (error) {
    console.error("PUBLISH ASSESSMENT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                         RETURN ASSESSMENT TO DRAFT                          */
/* -------------------------------------------------------------------------- */

export async function returnAssessmentToDraft(
  assessmentId: number,
): Promise<AssessmentActionResult<undefined>> {
  try {
    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to modify this assessment.",
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        status: true,

        _count: {
          select: {
            attempts: true,
          },
        },
      },
    });

    if (!assessment) {
      return assessmentFailure("The assessment could not be found.");
    }

    // New Guard Just Added
    if (assessment.status === "ARCHIVED") {
      return assessmentFailure(
        "Archived assessments cannot be returned directly to draft.",
      );
    }

    if (assessment._count.attempts > 0) {
      return assessmentFailure(
        "This assessment cannot return to draft because students have already started it.",
      );
    }

    await prisma.assessment.update({
      where: {
        id: assessmentId,
      },

      data: {
        status: "DRAFT",
        publishedAt: null,
        closedAt: null,
      },
    });

    revalidatePath(ASSESSMENT_LIST_PATH);
    revalidatePath(assessmentEditPath(assessmentId));

    return assessmentSuccess("Assessment returned to draft.", undefined);
  } catch (error) {
    console.error("RETURN ASSESSMENT TO DRAFT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                CLOSE ASSESSMENT                               */
/* -------------------------------------------------------------------------- */

export async function closeAssessment(
  assessmentId: number,
): Promise<AssessmentActionResult<undefined>> {
  try {
    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to close this assessment.",
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        status: true,
      },
    });

    if (!assessment) {
      return assessmentFailure("The assessment could not be found.");
    }

    if (assessment.status === "ARCHIVED") {
      return assessmentFailure("Archived assessments cannot be closed.");
    }

    await prisma.assessment.update({
      where: {
        id: assessmentId,
      },

      data: {
        status: "CLOSED",
        closedAt: new Date(),
      },
    });

    revalidatePath(ASSESSMENT_LIST_PATH);
    revalidatePath(assessmentDetailsPath(assessmentId));

    return assessmentSuccess("Assessment closed successfully.", undefined);
  } catch (error) {
    console.error("CLOSE ASSESSMENT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                             ARCHIVE ASSESSMENT                              */
/* -------------------------------------------------------------------------- */

export async function archiveAssessment(
  assessmentId: number,
): Promise<AssessmentActionResult<undefined>> {
  try {
    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to archive this assessment.",
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        status: true,

        _count: {
          select: {
            attempts: {
              where: {
                status: "IN_PROGRESS",
              },
            },
          },
        },
      },
    });

    const activeAttemptCount = await prisma.assessmentAttempt.count({
      where: {
        assessmentId,
        status: "IN_PROGRESS",
      },
    });

    if (activeAttemptCount > 0) {
      return assessmentFailure(
        "This assessment has active student attempts. Close it before archiving.",
      );
    }

    if (!assessment) {
      return assessmentFailure("The assessment could not be found.");
    }

    await prisma.assessment.update({
      where: {
        id: assessmentId,
      },

      data: {
        status: "ARCHIVED",

        closedAt: assessment.status === "CLOSED" ? undefined : new Date(),
      },
    });

    revalidatePath(ASSESSMENT_LIST_PATH);
    revalidatePath(assessmentDetailsPath(assessmentId));

    return assessmentSuccess("Assessment archived successfully.", undefined);
  } catch (error) {
    console.error("ARCHIVE ASSESSMENT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                           DUPLICATE ASSESSMENT                              */
/* -------------------------------------------------------------------------- */

export async function duplicateAssessment(
  assessmentId: number,
): Promise<AssessmentActionResult<AssessmentDraftSaveResult>> {
  try {
    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to duplicate this assessment.",
      );
    }

    const source = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      include: {
        questions: {
          orderBy: {
            position: "asc",
          },

          include: {
            options: {
              orderBy: {
                position: "asc",
              },
            },
          },
        },
      },
    });

    if (!source) {
      return assessmentFailure("The assessment could not be found.");
    }

    const lessonAllowed = await canUseLessonForAssessment({
      lessonId: source.lessonId,
      userId,
      role,
    });

    if (!lessonAllowed) {
      return assessmentFailure(
        "You cannot duplicate this assessment into the selected lesson.",
      );
    }

    const now = new Date();

    const newDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const duplicate = await prisma.assessment.create({
      data: {
        title: `${source.title} — Copy`,
        instructions: source.instructions,

        startDate: now,
        dueDate: newDueDate,

        durationMinutes: source.durationMinutes,

        passMarkPercent: source.passMarkPercent,

        maxAttempts: source.maxAttempts,

        shuffleQuestions: source.shuffleQuestions,

        shuffleOptions: source.shuffleOptions,

        allowBacktrack: source.allowBacktrack,

        allowUnanswered: source.allowUnanswered,

        showInstantResult: source.showInstantResult,

        showCorrectAnswers: source.showCorrectAnswers,

        showExplanations: source.showExplanations,

        autoSubmit: source.autoSubmit,

        status: "DRAFT",

        totalMarks: source.totalMarks,

        questionCount: source.questionCount,

        lessonId: source.lessonId,

        questions: {
          create: source.questions.map((question) => ({
            questionText: question.questionText,

            imageUrl: question.imageUrl,

            explanation: question.explanation,

            marks: question.marks,

            position: question.position,

            options: {
              create: question.options.map((option) => ({
                optionText: option.optionText,

                imageUrl: option.imageUrl,

                isCorrect: option.isCorrect,

                position: option.position,
              })),
            },
          })),
        },
      },

      select: {
        id: true,
        updatedAt: true,
      },
    });

    revalidatePath(ASSESSMENT_LIST_PATH);

    return assessmentSuccess("Assessment duplicated successfully.", {
      assessmentId: duplicate.id,
      updatedAt: duplicate.updatedAt,
    });
  } catch (error) {
    console.error("DUPLICATE ASSESSMENT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                             DELETE ASSESSMENT                               */
/* -------------------------------------------------------------------------- */

export async function deleteAssessment(
  assessmentId: number,
): Promise<AssessmentActionResult<undefined>> {
  try {
    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to delete this assessment.",
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: {
        id: assessmentId,
      },

      select: {
        id: true,
        status: true,

        _count: {
          select: {
            attempts: true,
            results: true,
          },
        },
      },
    });

    if (!assessment) {
      return assessmentFailure("The assessment could not be found.");
    }

    if (assessment.status !== "DRAFT") {
      return assessmentFailure(
        "Only draft assessments can be permanently deleted. Close or archive published assessments instead.",
      );
    }

    if (assessment._count.attempts > 0 || assessment._count.results > 0) {
      return assessmentFailure(
        "This assessment has student records and cannot be permanently deleted.",
      );
    }

    await prisma.assessment.delete({
      where: {
        id: assessmentId,
      },
    });

    revalidatePath(ASSESSMENT_LIST_PATH);

    return assessmentSuccess("Assessment deleted successfully.", undefined);
  } catch (error) {
    console.error("DELETE ASSESSMENT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                     SAVE INCOMPLETE ASSESSMENT DRAFT                        */
/* -------------------------------------------------------------------------- */

export async function saveIncompleteAssessmentDraft(
  input: AssessmentBuilderData,
): Promise<AssessmentActionResult<AssessmentDraftSaveResult>> {
  try {
    if (!input.id) {
      return assessmentFailure(
        "The assessment draft must exist before it can be saved.",
      );
    }

    const { userId, role } = await requireAssessmentManager();

    const allowed = await canManageAssessment({
      assessmentId: input.id,
      userId,
      role,
    });

    if (!allowed) {
      return assessmentFailure(
        "You are not authorised to edit this assessment.",
      );
    }

    if (!input.lessonId) {
      return assessmentFailure("Select a lesson before saving the assessment.");
    }

    const lessonAllowed = await canUseLessonForAssessment({
      lessonId: input.lessonId,
      userId,
      role,
    });

    if (!lessonAllowed) {
      return assessmentFailure("You cannot use the selected lesson.");
    }

    const normalizedQuestions = normalizeQuestionPositions(input.questions);

    const totals = calculateAssessmentTotals(normalizedQuestions);

    const assessment = await prisma.$transaction(
      async (tx) => {
        const existing = await tx.assessment.findUnique({
          where: {
            id: input.id,
          },

          select: {
            status: true,

            _count: {
              select: {
                attempts: true,
              },
            },
          },
        });

        if (!existing) {
          throw new Error("ASSESSMENT_NOT_FOUND");
        }

        if (existing.status !== "DRAFT" || existing._count.attempts > 0) {
          throw new Error("PUBLISHED_ASSESSMENT_LOCKED");
        }

        await tx.assessmentQuestion.deleteMany({
          where: {
            assessmentId: input.id,
          },
        });

        return tx.assessment.update({
          where: {
            id: input.id,
          },

          data: {
            title: input.title.trim() || "Untitled Assessment",

            instructions: input.instructions?.trim() || null,

            lessonId: input.lessonId,

            academicYear: input.academicYear.trim(),

            termId: input.termId,

            startDate: input.startDate ? new Date(input.startDate) : new Date(),

            dueDate: input.dueDate
              ? new Date(input.dueDate)
              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

            durationMinutes: input.durationMinutes ?? null,

            passMarkPercent: input.passMarkPercent,

            maxAttempts: input.maxAttempts,

            shuffleQuestions: input.shuffleQuestions,

            shuffleOptions: input.shuffleOptions,

            allowBacktrack: input.allowBacktrack,

            allowUnanswered: input.allowUnanswered,

            showInstantResult: input.showInstantResult,

            showCorrectAnswers: input.showCorrectAnswers,

            showExplanations: input.showExplanations,

            autoSubmit: input.autoSubmit,

            totalMarks: totals.totalMarks,

            questionCount: totals.questionCount,

            questions: {
              create: normalizedQuestions.map((question) => ({
                questionText:
                  question.questionText.trim() || "Untitled question",

                imageUrl: question.imageUrl?.trim() || null,

                explanation: question.explanation?.trim() || null,

                marks: Math.max(1, question.marks || 1),

                position: question.position,

                options: {
                  create: question.options.map((option) => ({
                    optionText: option.optionText.trim() || "Untitled option",

                    imageUrl: option.imageUrl?.trim() || null,

                    isCorrect: option.isCorrect,

                    position: option.position,
                  })),
                },
              })),
            },
          },

          select: {
            id: true,
            updatedAt: true,
          },
        });
      },
      {
        isolationLevel: "Serializable",
        maxWait: 5000,
        timeout: 15000,
      },
    );

    // revalidatePath(ASSESSMENT_LIST_PATH);

    // revalidatePath(assessmentEditPath(assessment.id));

    return assessmentSuccess("Assessment draft saved.", {
      assessmentId: assessment.id,
      updatedAt: assessment.updatedAt,
    });
  } catch (error) {
    console.error("SAVE INCOMPLETE ASSESSMENT DRAFT ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

/* -------------------------------------------------------------------------- */
/*                         START ASSESSMENT ATTEMPT                            */
/* -------------------------------------------------------------------------- */

export async function startAssessmentAttempt(
  input: StartAssessmentInput,
): Promise<AssessmentActionResult<StartAssessmentResult>> {
  try {
    const parsed = startAssessmentSchema.safeParse(input);

    if (!parsed.success) {
      return assessmentFailure(
        "Invalid assessment request.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { assessmentId } = parsed.data;

    const { userId } = await requireAssessmentStudent();

    const result = await prisma.$transaction(
      async (tx) => {
        const now = new Date();

        const assessment = await tx.assessment.findFirst({
          where: {
            id: assessmentId,

            lesson: {
              class: {
                students: {
                  some: {
                    id: userId,
                  },
                },
              },
            },
          },

          select: {
            id: true,
            title: true,

            status: true,

            startDate: true,
            dueDate: true,

            durationMinutes: true,
            maxAttempts: true,

            autoSubmit: true,

            questionCount: true,
            totalMarks: true,
          },
        });

        if (!assessment) {
          throw new Error("ASSESSMENT_NOT_FOUND");
        }

        if (assessment.questionCount < 1 || assessment.totalMarks < 1) {
          throw new Error("ASSESSMENT_NOT_READY");
        }

        if (assessment.status !== "PUBLISHED") {
          throw new Error(
            assessment.status === "SCHEDULED"
              ? "ASSESSMENT_NOT_OPEN"
              : "ASSESSMENT_CLOSED",
          );
        }

        if (assessment.startDate > now) {
          throw new Error("ASSESSMENT_NOT_OPEN");
        }

        if (assessment.dueDate <= now) {
          throw new Error("ASSESSMENT_CLOSED");
        }

        const attempts = await tx.assessmentAttempt.findMany({
          where: {
            assessmentId,
            studentId: userId,

            status: {
              not: "CANCELLED",
            },
          },

          orderBy: {
            attemptNumber: "desc",
          },

          select: {
            id: true,
            attemptNumber: true,
            status: true,
            expiresAt: true,
          },
        });

        /*
         * Return the existing valid active attempt
         * instead of creating a duplicate.
         */
        const activeAttempt = attempts.find(
          (attempt) =>
            attempt.status === "IN_PROGRESS" &&
            (!attempt.expiresAt || attempt.expiresAt > now),
        );

        if (activeAttempt) {
          return {
            assessmentId,
            attemptId: activeAttempt.id,

            attemptNumber: activeAttempt.attemptNumber,

            expiresAt: activeAttempt.expiresAt,

            resumed: true,
          };
        }

        /*
         * Expired attempts count as attempts because
         * the student already started them.
         *
         * Automatic grading of expired attempts will
         * be connected in the submission-engine step.
         */
        const staleAttemptIds = attempts
          .filter(
            (attempt) =>
              attempt.status === "IN_PROGRESS" &&
              attempt.expiresAt &&
              attempt.expiresAt <= now,
          )
          .map((attempt) => attempt.id);

        if (staleAttemptIds.length > 0) {
          await tx.assessmentAttempt.updateMany({
            where: {
              id: {
                in: staleAttemptIds,
              },
            },

            data: {
              status: "EXPIRED",
              submittedAt: now,
            },
          });
        }

        const usedAttempts = attempts.length;

        if (usedAttempts >= assessment.maxAttempts) {
          throw new Error("ATTEMPT_LIMIT_REACHED");
        }

        const nextAttemptNumber =
          attempts.length > 0
            ? Math.max(...attempts.map((attempt) => attempt.attemptNumber)) + 1
            : 1;

        const expiresAt = calculateAttemptExpiry({
          startedAt: now,

          dueDate: assessment.dueDate,

          durationMinutes: assessment.durationMinutes,
        });

        const attempt = await tx.assessmentAttempt.create({
          data: {
            assessmentId,
            studentId: userId,

            attemptNumber: nextAttemptNumber,

            status: "IN_PROGRESS",

            startedAt: now,
            expiresAt,

            lastActivityAt: now,

            timeSpentSeconds: 0,
          },

          select: {
            id: true,
            attemptNumber: true,
            expiresAt: true,
          },
        });

        return {
          assessmentId,
          attemptId: attempt.id,

          attemptNumber: attempt.attemptNumber,

          expiresAt: attempt.expiresAt,

          resumed: false,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath(`/student/assessments/${result.assessmentId}`);

    revalidatePath("/student/assessments");

    return assessmentSuccess(
      result.resumed
        ? "Your existing attempt is ready."
        : "Assessment attempt started.",

      {
        assessmentId: result.assessmentId,

        attemptId: result.attemptId,

        attemptNumber: result.attemptNumber,

        expiresAt: result.expiresAt,
      },
    );
  } catch (error) {
    console.error("START ASSESSMENT ATTEMPT ERROR:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "ASSESSMENT_NOT_FOUND":
          return assessmentFailure(
            "This assessment could not be found or is not assigned to your class.",
          );

        case "ASSESSMENT_NOT_READY":
          return assessmentFailure("This assessment is not ready to be taken.");

        case "ASSESSMENT_NOT_OPEN":
          return assessmentFailure("This assessment has not opened yet.");

        case "ASSESSMENT_CLOSED":
          return assessmentFailure("This assessment is closed.");

        case "ATTEMPT_LIMIT_REACHED":
          return assessmentFailure(
            "You have used all available attempts for this assessment.",
          );

        case "UNAUTHENTICATED":
          return assessmentFailure("Sign in to begin the assessment.");

        case "UNAUTHORIZED":
          return assessmentFailure("Only students can begin assessments.");
      }
    }

    return assessmentFailure("The assessment attempt could not be started.");
  }
}

/* -------------------------------------------------------------------------- */
/*                          SAVE STUDENT ANSWER                                */
/* -------------------------------------------------------------------------- */

export async function saveAssessmentAnswer(
  input: SaveAssessmentAnswerInput,
): Promise<AssessmentActionResult<SaveAnswerResult>> {
  try {
    const parsed = saveAssessmentAnswerSchema.safeParse(input);

    if (!parsed.success) {
      return assessmentFailure(
        "The answer could not be saved.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const {
      attemptId,
      questionId,
      selectedOptionId,
      flagged,
      timeSpentSeconds,
    } = parsed.data;

    const { userId } = await requireAssessmentStudent();

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const attempt = await tx.assessmentAttempt.findFirst({
        where: {
          id: attemptId,
          studentId: userId,
          status: "IN_PROGRESS",
        },

        select: {
          id: true,
          assessmentId: true,
          status: true,

          expiresAt: true,

          assessment: {
            select: {
              dueDate: true,
              allowBacktrack: true,
            },
          },
        },
      });

      if (!attempt) {
        throw new AssessmentError(
          "ATTEMPT_NOT_FOUND",
          "This assessment attempt could not be found.",
        );
      }

      if (attempt.status !== "IN_PROGRESS") {
        throw new AssessmentError(
          "ATTEMPT_NOT_ACTIVE",
          "This assessment attempt is no longer active.",
        );
      }

      if (
        hasAttemptExpired({
          expiresAt: attempt.expiresAt,
          now,
        }) ||
        attempt.assessment.dueDate <= now
      ) {
        throw new Error("ATTEMPT_EXPIRED");
      }

      const question = await tx.assessmentQuestion.findFirst({
        where: {
          id: questionId,
          assessmentId: attempt.assessmentId,
        },

        select: {
          id: true,
        },
      });

      if (!question) {
        throw new AssessmentError(
          "INVALID_QUESTION",
          "The selected question is invalid.",
        );
      }

      if (selectedOptionId !== undefined && selectedOptionId !== null) {
        const option = await tx.assessmentOption.findFirst({
          where: {
            id: selectedOptionId,
            questionId,
          },

          select: {
            id: true,
          },
        });

        if (!option) {
          throw new AssessmentError(
            "INVALID_OPTION",
            "The selected answer option is invalid.",
          );
        }
      }

      const answer = await tx.assessmentAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId,
          },
        },

        create: {
          attemptId,
          questionId,

          selectedOptionId: selectedOptionId ?? null,

          flagged: flagged ?? false,

          answeredAt: selectedOptionId ? now : null,

          timeSpentSeconds: timeSpentSeconds ?? 0,
        },

        update: {
          ...(selectedOptionId !== undefined
            ? {
                selectedOptionId: selectedOptionId ?? null,

                answeredAt: selectedOptionId ? now : null,
              }
            : {}),

          ...(flagged !== undefined
            ? {
                flagged,
              }
            : {}),

          ...(timeSpentSeconds !== undefined
            ? {
                timeSpentSeconds,
              }
            : {}),
        },

        select: {
          id: true,
          updatedAt: true,
        },
      });

      await tx.assessmentAttempt.update({
        where: {
          id: attemptId,
        },

        data: {
          lastActivityAt: now,
        },
      });

      return answer;
    });

    return assessmentSuccess("Answer saved.", {
      answerId: result.id,
      savedAt: result.updatedAt,
    });
  } catch (error) {
    console.error("SAVE ASSESSMENT ANSWER ERROR:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "ATTEMPT_NOT_FOUND":
          return assessmentFailure(
            "This assessment attempt is no longer available.",
          );

        case "ATTEMPT_EXPIRED":
          return assessmentFailure("Your assessment time has expired.");

        case "QUESTION_NOT_FOUND":
          return assessmentFailure(
            "The selected question does not belong to this assessment.",
          );

        case "OPTION_NOT_FOUND":
          return assessmentFailure("The selected answer option is invalid.");
      }
    }

    return assessmentFailure("Your answer could not be saved.");
  }
}

/* -------------------------------------------------------------------------- */
/*                    GRADE AND SUBMIT ASSESSMENT ATTEMPT                      */
/* -------------------------------------------------------------------------- */

export async function submitAssessmentAttempt(
  input: SubmitAssessmentInput,
): Promise<AssessmentActionResult<AssessmentGradingSummary>> {
  const parsed = submitAssessmentSchema.safeParse(input);

  if (!parsed.success) {
    return assessmentFailure(
      "The assessment submission is invalid.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { assessmentId, attemptId, submissionMode } = parsed.data;

  try {
    const { userId } = await requireAssessmentStudent();

    const result = await prisma.$transaction(
      async (tx) => {
        const now = new Date();

        /*
         * First load only enough information to
         * validate and lock the attempt.
         */
        const existingAttempt = await tx.assessmentAttempt.findFirst({
          where: {
            id: attemptId,
            assessmentId,
            studentId: userId,
          },

          select: {
            id: true,
            status: true,

            startedAt: true,
            submittedAt: true,
            expiresAt: true,

            assessment: {
              select: {
                id: true,
                title: true,

                dueDate: true,

                autoSubmit: true,
                allowUnanswered: true,

                passMarkPercent: true,

                showInstantResult: true,
                showCorrectAnswers: true,
                showExplanations: true,

                durationMinutes: true,
              },
            },

            result: {
              select: {
                score: true,
                totalMarks: true,
                percentage: true,
                grade: true,
                remarks: true,
                createdAt: true,
              },
            },
          },
        });

        if (!existingAttempt) {
          throw new Error("ATTEMPT_NOT_FOUND");
        }

        /*
         * An already completed attempt returns its
         * existing result instead of grading twice.
         */
        if (
          existingAttempt.status === "SUBMITTED" ||
          existingAttempt.status === "AUTO_SUBMITTED"
        ) {
          if (!existingAttempt.result) {
            throw new Error("COMPLETED_ATTEMPT_WITHOUT_RESULT");
          }

          const completedAttempt = await tx.assessmentAttempt.findUnique({
            where: {
              id: attemptId,
            },

            select: {
              id: true,
              score: true,
              totalMarks: true,
              percentage: true,
              correctCount: true,
              incorrectCount: true,
              unansweredCount: true,
              timeSpentSeconds: true,
              submittedAt: true,

              assessment: {
                select: {
                  id: true,
                  title: true,
                  passMarkPercent: true,

                  showInstantResult: true,
                  showCorrectAnswers: true,
                  showExplanations: true,
                  lesson: {
                    select: {
                      class: {
                        select: {
                          id: true,

                          name: true,
                        },
                      },

                      subject: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },

              result: {
                select: {
                  grade: true,
                  remarks: true,
                },
              },
            },
          });

          if (
            !completedAttempt ||
            !completedAttempt.result ||
            !completedAttempt.submittedAt
          ) {
            throw new Error("COMPLETED_ATTEMPT_WITHOUT_RESULT");
          }

          return {
            attemptId: completedAttempt.id,

            assessmentId: completedAttempt.assessment.id,

            assessmentTitle: completedAttempt.assessment.title,

            score: completedAttempt.score ?? 0,

            totalMarks: completedAttempt.totalMarks ?? 0,

            percentage: completedAttempt.percentage ?? 0,

            grade: completedAttempt.result.grade ?? "N/A",

            remarks: completedAttempt.result.remarks ?? "Assessment completed",

            passed:
              (completedAttempt.percentage ?? 0) >=
              completedAttempt.assessment.passMarkPercent,

            correctCount: completedAttempt.correctCount ?? 0,

            incorrectCount: completedAttempt.incorrectCount ?? 0,

            unansweredCount: completedAttempt.unansweredCount ?? 0,

            timeSpentSeconds: completedAttempt.timeSpentSeconds,

            submittedAt: completedAttempt.submittedAt,

            showInstantResult: completedAttempt.assessment.showInstantResult,

            showCorrectAnswers: completedAttempt.assessment.showCorrectAnswers,

            showExplanations: completedAttempt.assessment.showExplanations,
          };
        }

        if (existingAttempt.status === "SUBMITTING") {
          throw new Error("SUBMISSION_IN_PROGRESS");
        }

        if (existingAttempt.status !== "IN_PROGRESS") {
          throw new Error("ATTEMPT_NOT_ACTIVE");
        }

        const attemptExpired =
          hasAttemptExpired({
            expiresAt: existingAttempt.expiresAt,
            now,
          }) || existingAttempt.assessment.dueDate <= now;

        /*
         * Manual submission is rejected after expiry.
         * Automatic submission is permitted because
         * it submits whatever was already saved.
         */
        if (attemptExpired && submissionMode === "MANUAL") {
          throw new Error("ATTEMPT_EXPIRED");
        }

        if (
          attemptExpired &&
          submissionMode === "AUTO" &&
          !existingAttempt.assessment.autoSubmit
        ) {
          throw new Error("AUTO_SUBMIT_DISABLED");
        }

        /*
         * Atomically claim the attempt for grading.
         * Only an IN_PROGRESS attempt can be claimed.
         */
        const lockResult = await tx.assessmentAttempt.updateMany({
          where: {
            id: attemptId,
            assessmentId,
            studentId: userId,

            OR: [
              {
                status: "IN_PROGRESS",
              },
              {
                status: "SUBMITTING",
              },
            ],
          },

          data: {
            status: "SUBMITTING",

            submissionStartedAt: now,

            lastActivityAt: now,

            failureReason: null,
          },
        });

        if (lockResult.count !== 1) {
          throw new AssessmentError(
            "ATTEMPT_SUBMITTING",
            "This assessment is already being submitted.",
          );
        }

        const attempt = await tx.assessmentAttempt.findUnique({
          where: {
            id: attemptId,
          },

          select: {
            id: true,
            startedAt: true,
            expiresAt: true,

            assessment: {
              select: {
                id: true,
                title: true,

                lesson: {
                  select: {
                    class: {
                      select: {
                        id: true,

                        name: true,
                      },
                    },

                    subject: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },

                totalMarks: true,
                passMarkPercent: true,
                allowUnanswered: true,

                durationMinutes: true,

                showInstantResult: true,
                showCorrectAnswers: true,
                showExplanations: true,

                questions: {
                  orderBy: {
                    position: "asc",
                  },

                  select: {
                    id: true,
                    marks: true,

                    options: {
                      select: {
                        id: true,
                        isCorrect: true,
                      },
                    },
                  },
                },
              },
            },

            answers: {
              select: {
                id: true,
                questionId: true,
                selectedOptionId: true,
              },
            },
          },
        });

        if (!attempt) {
          throw new Error("ATTEMPT_NOT_FOUND");
        }

        const answeredCount = attempt.answers.filter(
          (answer) => answer.selectedOptionId !== null,
        ).length;

        const unansweredCount =
          attempt.assessment.questions.length - answeredCount;

        if (
          submissionMode === "MANUAL" &&
          !attempt.assessment.allowUnanswered &&
          unansweredCount > 0
        ) {
          /*
           * Return the attempt to active because
           * validation failed before grading.
           */
          await tx.assessmentAttempt.update({
            where: {
              id: attemptId,
            },

            data: {
              status: "IN_PROGRESS",
            },
          });

          throw new Error("UNANSWERED_QUESTIONS_NOT_ALLOWED");
        }

        const grading = gradeAssessmentAttempt({
          questions: attempt.assessment.questions,

          answers: attempt.answers,

          passMarkPercent: attempt.assessment.passMarkPercent,
        });

        /*
         * Update existing answer rows with marking.
         */
        for (const gradedAnswer of grading.gradedAnswers) {
          if (gradedAnswer.answerId) {
            await tx.assessmentAnswer.update({
              where: {
                id: gradedAnswer.answerId,
              },

              data: {
                isCorrect: gradedAnswer.isCorrect,

                marksAwarded: gradedAnswer.marksAwarded,
              },
            });
          } else {
            /*
             * Create an explicit unanswered record.
             * This makes review and analytics easier.
             */
            await tx.assessmentAnswer.create({
              data: {
                attemptId,
                questionId: gradedAnswer.questionId,

                selectedOptionId: null,

                isCorrect: false,
                marksAwarded: 0,

                flagged: false,
                answeredAt: null,
                timeSpentSeconds: 0,
              },
            });
          }
        }

        const maximumSeconds =
          attempt.assessment.durationMinutes !== null
            ? attempt.assessment.durationMinutes * 60
            : null;

        const timeSpentSeconds = calculateTimeSpentSeconds({
          startedAt: attempt.startedAt,

          submittedAt: now,

          maximumSeconds,
        });

        const finalStatus: AssessmentAttemptStatus =
          submissionMode === "AUTO" ? "AUTO_SUBMITTED" : "SUBMITTED";

        await tx.assessmentAttempt.update({
          where: {
            id: attemptId,
          },

          data: {
            status: finalStatus,

            submittedAt: now,
            lastActivityAt: now,

            timeSpentSeconds,

            score: grading.score,
            totalMarks: grading.totalMarks,

            percentage: grading.percentage,

            correctCount: grading.correctCount,

            incorrectCount: grading.incorrectCount,

            unansweredCount: grading.unansweredCount,
          },
        });

        await syncAssessmentResult({
          tx,

          assessmentId: attempt.assessment.id,

          assessmentAttemptId: attemptId,

          studentId: userId,

          score: grading.score,

          totalMarks: grading.totalMarks,

          percentage: grading.percentage,

          grade: grading.grade,

          remarks: grading.remarks,
        });

        /*
         * Notify the student only after:
         *
         * 1. grading succeeded,
         * 2. the attempt was completed,
         * 3. the academic Result was synchronized,
         * 4. any report-card invalidation attached to
         *    result synchronization also succeeded.
         *
         * Everything remains inside the same transaction.
         */
        if (attempt.assessment.showInstantResult) {
          await notifyAssessmentResultReady({
            tx,

            assessmentId: attempt.assessment.id,

            assessmentTitle: attempt.assessment.title,

            classId: attempt.assessment.lesson.class.id,

            className: attempt.assessment.lesson.class.name,

            subjectName: attempt.assessment.lesson.subject.name,

            studentId: userId,

            attemptId,

            score: grading.score,

            totalMarks: grading.totalMarks,

            percentage: grading.percentage,

            actorId: null,

            actorRole: "system",

            actorName: "Assessment Engine",
          });
        }

        return {
          attemptId: attempt.id,

          assessmentId: attempt.assessment.id,

          assessmentTitle: attempt.assessment.title,

          score: grading.score,

          totalMarks: grading.totalMarks,

          percentage: grading.percentage,

          grade: grading.grade,

          remarks: grading.remarks,

          passed: grading.passed,

          correctCount: grading.correctCount,

          incorrectCount: grading.incorrectCount,

          unansweredCount: grading.unansweredCount,

          timeSpentSeconds,

          submittedAt: now,

          showInstantResult: attempt.assessment.showInstantResult,

          showCorrectAnswers: attempt.assessment.showCorrectAnswers,

          showExplanations: attempt.assessment.showExplanations,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    revalidatePath("/student/assessments");

    revalidatePath(`/student/assessments/${assessmentId}`);

    revalidatePath(`/student/assessments/${assessmentId}/result`);

    revalidatePath("/list/results");

    revalidatePath("/list/report-cards");

    revalidatePath("/list/report-cards/generate");

    return assessmentSuccess(
      "Assessment submitted and marked successfully.",
      result,
    );
  } catch (error) {
    console.error("SUBMIT ASSESSMENT ATTEMPT ERROR:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "ATTEMPT_NOT_FOUND":
          return assessmentFailure(
            "The assessment attempt could not be found.",
          );

        case "ATTEMPT_NOT_ACTIVE":
          return assessmentFailure(
            "This assessment attempt is no longer active.",
          );

        case "SUBMISSION_IN_PROGRESS":
          return assessmentFailure(
            "This assessment is already being submitted.",
          );

        case "ATTEMPT_EXPIRED":
          return assessmentFailure("The assessment time has expired.");

        case "AUTO_SUBMIT_DISABLED":
          return assessmentFailure(
            "The assessment expired and automatic submission is disabled.",
          );

        case "UNANSWERED_QUESTIONS_NOT_ALLOWED":
          return assessmentFailure(
            "Answer every question before submitting this assessment.",
          );

        case "COMPLETED_ATTEMPT_WITHOUT_RESULT":
          return assessmentFailure(
            "The completed attempt could not be matched to a result.",
          );
      }

      if (error.message.startsWith("QUESTION_")) {
        return assessmentFailure(
          "One or more questions have an invalid answer key. Contact your teacher.",
        );
      }
    }

    return assessmentFailure("The assessment could not be submitted.");
  }
}

/* -------------------------------------------------------------------------- */
/*                         SAVE TEACHER FEEDBACK                               */
/* -------------------------------------------------------------------------- */

export async function saveAssessmentTeacherFeedback(
  input: AssessmentTeacherFeedbackInput,
): Promise<
  AssessmentActionResult<{
    attemptId: number;
    feedback: string | null;
    reviewedAt: Date;
  }>
> {
  try {
    const parsed = assessmentTeacherFeedbackSchema.safeParse(input);

    if (!parsed.success) {
      return assessmentFailure(
        "Teacher feedback is invalid.",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { assessmentId, attemptId, studentId, feedback } = parsed.data;

    const normalizedFeedback = feedback.trim();

    const { userId, role } = await requireAssessmentManager();

    const result = await prisma.$transaction(
      async (tx) => {
        const attempt = await tx.assessmentAttempt.findFirst({
          where: {
            id: attemptId,
            assessmentId,
            studentId,

            assessment: {
              ...(role === "teacher"
                ? {
                    lesson: {
                      teacherId: userId,
                    },
                  }
                : {}),
            },
          },

          select: {
            id: true,
            status: true,
            teacherFeedback: true,

            assessment: {
              select: {
                id: true,

                title: true,

                lesson: {
                  select: {
                    class: {
                      select: {
                        id: true,

                        name: true,
                      },
                    },

                    subject: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!attempt) {
          throw new AssessmentError(
            "ATTEMPT_NOT_FOUND",
            "The selected submission could not be found.",
          );
        }

        if (
          attempt.status !== "SUBMITTED" &&
          attempt.status !== "AUTO_SUBMITTED"
        ) {
          throw new AssessmentError(
            "ATTEMPT_NOT_COMPLETED",
            "Feedback can only be added to a completed submission.",
          );
        }

        const reviewedAt = new Date();

        const updatedAttempt = await tx.assessmentAttempt.update({
          where: {
            id: attemptId,
          },

          data: {
            teacherFeedback: normalizedFeedback || null,

            reviewedAt,

            /*
             * Administrators may not have a Teacher row
             * matching their Clerk ID.
             */
            reviewedById: role === "teacher" ? userId : null,
          },

          select: {
            id: true,
            teacherFeedback: true,
            reviewedAt: true,
          },
        });

        /*
         * Notify only when feedback is added.
         *
         * Removing feedback is still a valid
         * workflow change, but it should not
         * create a new notification.
         */
        if (normalizedFeedback) {
          await notifyAssessmentFeedbackAdded({
            tx,

            assessmentId: attempt.assessment.id,

            assessmentTitle: attempt.assessment.title,

            classId: attempt.assessment.lesson.class.id,

            className: attempt.assessment.lesson.class.name,

            subjectName: attempt.assessment.lesson.subject.name,

            studentId,

            attemptId,

            actorId: userId,

            actorRole: role,

            actorName: null,
          });
        }

        await createAssessmentAudit(tx, {
          action: "FEEDBACK_CREATED",

          actorId: userId,

          actorRole: role,

          assessmentId,

          attemptId,

          studentId,

          metadata: {
            feedbackAdded: Boolean(normalizedFeedback),

            previousFeedback: attempt.teacherFeedback,

            currentFeedback: normalizedFeedback || null,
          },
        });

        return {
          attemptId: updatedAttempt.id,

          feedback: updatedAttempt.teacherFeedback,

          reviewedAt: updatedAttempt.reviewedAt ?? reviewedAt,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,

        maxWait: 5_000,
        timeout: 10_000,
      },
    );

    revalidatePath(`/list/assessments/${assessmentId}/submissions`);

    revalidatePath(
      `/list/assessments/${assessmentId}/submissions/${studentId}`,
    );

    revalidatePath(`/student/assessments/${assessmentId}/result`);

    return assessmentSuccess(
      normalizedFeedback
        ? "Teacher feedback saved."
        : "Teacher feedback removed.",
      result,
    );
  } catch (error) {
    console.error("SAVE ASSESSMENT TEACHER FEEDBACK ERROR:", error);

    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}

export async function updateAssessmentNavigation(rawInput: unknown) {
  const parsed = updateAttemptNavigationSchema.safeParse(rawInput);

  if (!parsed.success) {
    return assessmentFailure("The navigation request is invalid.");
  }

  const {
    attemptId,
    nextQuestionIndex,
    activeSessionId,
    expectedAttemptVersion,
  } = parsed.data;

  try {
    const { userId } = await requireAssessmentStudent();

    const result = await prisma.$transaction(async (tx) => {
      const attempt = await tx.assessmentAttempt.findFirst({
        where: {
          id: attemptId,
          studentId: userId,
          status: "IN_PROGRESS",
        },

        select: {
          id: true,
          assessmentId: true,
          version: true,

          currentQuestionIndex: true,
          highestQuestionIndex: true,

          assessment: {
            select: {
              questionCount: true,
              allowBacktrack: true,
            },
          },
        },
      });

      if (!attempt) {
        throw new AssessmentError(
          "ATTEMPT_NOT_ACTIVE",
          "The assessment attempt is no longer active.",
        );
      }

      if (attempt.version !== expectedAttemptVersion) {
        throw new AssessmentError(
          "VERSION_CONFLICT",
          "The assessment was updated in another tab.",
          true,
        );
      }

      if (nextQuestionIndex >= attempt.assessment.questionCount) {
        throw new AssessmentError(
          "INVALID_QUESTION",
          "The selected question does not exist.",
        );
      }

      if (
        !attempt.assessment.allowBacktrack &&
        nextQuestionIndex < attempt.highestQuestionIndex
      ) {
        throw new AssessmentError(
          "BACKTRACKING_BLOCKED",
          "Backtracking is disabled.",
        );
      }

      const updated = await tx.assessmentAttempt.update({
        where: {
          id: attemptId,
        },

        data: {
          currentQuestionIndex: nextQuestionIndex,

          highestQuestionIndex: Math.max(
            attempt.highestQuestionIndex,
            nextQuestionIndex,
          ),

          activeSessionId,
          activeSessionSeenAt: new Date(),

          lastActivityAt: new Date(),

          version: {
            increment: 1,
          },
        },

        select: {
          currentQuestionIndex: true,
          highestQuestionIndex: true,
          version: true,
        },
      });

      await createAssessmentAudit(tx, {
        action: "NAVIGATION_UPDATED",

        actorId: userId,
        actorRole: "student",

        assessmentId: attempt.assessmentId,

        attemptId,
        studentId: userId,

        metadata: {
          currentQuestionIndex: updated.currentQuestionIndex,

          highestQuestionIndex: updated.highestQuestionIndex,
        },
      });

      return updated;
    });

    return assessmentSuccess("Position saved.", result);
  } catch (error) {
    return assessmentFailure(getAssessmentErrorMessage(error));
  }
}
