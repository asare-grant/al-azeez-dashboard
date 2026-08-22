// src/lib/results/result-access.ts

import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

export type ResultsManagementScope =
  | "GLOBAL"
  | "TEACHER_OWNED";

export type ResultsManagementActor = {
  userId: string;

  scope:
    ResultsManagementScope;
};

/* ========================================================================== */
/* PERMISSION GRANT SCOPE                                                     */
/* ========================================================================== */

function assignmentGrantsPermission(
  assignment: {
    role: {
      permissions: {
        permission: {
          key: string;
          isActive: boolean;
        };
      }[];
    };
  },
  permission: string,
) {
  const normalizedPermission =
    permission.trim().toLowerCase();

  return assignment.role.permissions.some(
    (rolePermission) =>
      rolePermission.permission.isActive &&
      rolePermission.permission.key
        .trim()
        .toLowerCase() ===
        normalizedPermission,
  );
}

/* ========================================================================== */
/* REQUIRE RESULTS MANAGEMENT                                                 */
/* ========================================================================== */

export async function requireResultsManagementAccess(): Promise<ResultsManagementActor> {
  const accessActor =
    await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error(
      "You must be signed in to manage academic results.",
    );
  }

  if (
    !accessActor.can(
      "results.manage",
    )
  ) {
    throw new Error(
      "You do not have permission to manage academic results.",
    );
  }

  const grantingAssignments =
    accessActor.activeAssignments.filter(
      (assignment) =>
        assignmentGrantsPermission(
          assignment,
          "results.manage",
        ),
    );

  /*
   * If every explicit RBAC grant comes from Teacher,
   * keep the actor ownership-scoped.
   *
   * A delegated management role granting results.manage
   * produces GLOBAL scope.
   *
   * Transitional legacy administrators may have no
   * explicit granting assignment but accessActor.can()
   * still allows them; they therefore resolve GLOBAL.
   */
  const teacherOwned =
    grantingAssignments.length >
      0 &&
    grantingAssignments.every(
      (assignment) =>
        assignment.role.key
          .trim()
          .toLowerCase() ===
        "teacher",
    );

  return {
    userId:
      accessActor.actor.id,

    scope:
      teacherOwned
        ? "TEACHER_OWNED"
        : "GLOBAL",
  };
}



export async function requireTeacherExamOwnership({
  teacherId,
  examId,
  tx,
}: {
  teacherId: string;

  examId: number;

  tx?:
    Prisma.TransactionClient;
}) {
  const db =
    tx ?? prisma;

  const exam =
    await db.exam.findFirst({
      where: {
        id:
          examId,

        lesson: {
          teacherId,
        },
      },

      select: {
        id:
          true,
      },
    });

  if (!exam) {
    throw new Error(
      "You can only manage examination results for lessons you teach.",
    );
  }
}

export async function requireTeacherAssignmentOwnership({
  teacherId,
  assignmentId,
  tx,
}: {
  teacherId: string;

  assignmentId: number;

  tx?:
    Prisma.TransactionClient;
}) {
  const db =
    tx ?? prisma;

  const assignment =
    await db.assignment.findFirst({
      where: {
        id:
          assignmentId,

        lesson: {
          teacherId,
        },
      },

      select: {
        id:
          true,
      },
    });

  if (!assignment) {
    throw new Error(
      "You can only manage assignment results for lessons you teach.",
    );
  }
}



export async function requireMutableManualResult({
  resultId,
  teacherId,
  scope,
  tx,
}: {
  resultId: number;

  teacherId: string;

  scope:
    ResultsManagementScope;

  tx?:
    Prisma.TransactionClient;
}) {
  const db =
    tx ?? prisma;

  const result =
    await db.result.findFirst({
      where: {
        id:
          resultId,

        type: {
          in: [
            "EXAM",
            "ASSIGNMENT",
          ],
        },

        ...(scope ===
        "TEACHER_OWNED"
          ? {
              OR: [
                {
                  exam: {
                    lesson: {
                      teacherId,
                    },
                  },
                },

                {
                  assignment: {
                    lesson: {
                      teacherId,
                    },
                  },
                },
              ],
            }
          : {}),
      },

      select: {
        id:
          true,

        type:
          true,
      },
    });

  if (!result) {
    throw new Error(
      "This result cannot be modified from the manual Results Entry workspace.",
    );
  }

  return result;
}