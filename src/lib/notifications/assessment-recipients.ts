import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  excludeNotificationRecipient,
  getStudentNotificationRecipient,
  mergeNotificationRecipients,
} from "./recipients";

import type {
  NotificationRecipient,
} from "./service";

/* -------------------------------------------------------------------------- */
/*                     ASSESSMENT CLASS RECIPIENTS                            */
/* -------------------------------------------------------------------------- */

export async function getAssessmentStudentRecipients({
  classId,
  actorId,
  tx,
}: {
  classId:
    number;

  actorId?:
    string | null;

  tx?:
    Prisma.TransactionClient;
}): Promise<
  NotificationRecipient[]
> {
  const db =
    tx;

  /*
   * If we're already inside a transaction,
   * use it. Otherwise we'll import the normal
   * Prisma client locally to keep this resolver
   * compatible with both contexts.
   */
  let studentIds:
    string[];

  if (db) {
    const students =
      await db.student.findMany({
        where: {
          classId,
        },

        select: {
          id:
            true,
        },
      });

    studentIds =
      students.map(
        (student) =>
          student.id,
      );
  } else {
    const {
      default:
        prisma,
    } =
      await import(
        "@/lib/prisma"
      );

    const students =
      await prisma.student.findMany({
        where: {
          classId,
        },

        select: {
          id:
            true,
        },
      });

    studentIds =
      students.map(
        (student) =>
          student.id,
      );
  }

  const recipients =
    studentIds.map(
      (studentId) => ({
        recipientId:
          studentId,

        recipientRole:
          "student",
      }),
    );

  return excludeNotificationRecipient(
    recipients,
    actorId,
  );
}

/* -------------------------------------------------------------------------- */
/*                    ASSESSMENT RESULT RECIPIENT                             */
/* -------------------------------------------------------------------------- */

export async function getAssessmentResultRecipient({
  studentId,
  actorId,
  tx,
}: {
  studentId:
    string;

  actorId?:
    string | null;

  tx?:
    Prisma.TransactionClient;
}): Promise<
  NotificationRecipient[]
> {
  const student =
    await getStudentNotificationRecipient(
      studentId,
      {
        tx,
      },
    );

  return excludeNotificationRecipient(
    student
      ? [
          student,
        ]
      : [],
    actorId,
  );
}