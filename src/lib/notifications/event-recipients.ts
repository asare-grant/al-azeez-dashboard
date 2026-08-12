import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

type NotificationTx =
  Prisma.TransactionClient;

type Recipient = {
  recipientId:
    string;

  recipientRole:
    "student" |
    "parent" |
    "teacher";
};

function getClient(
  tx?:
    NotificationTx,
) {
  return (
    tx ??
    prisma
  );
}

function dedupeRecipients(
  recipients:
    Recipient[],
) {
  const map =
    new Map<
      string,
      Recipient
    >();

  for (
    const recipient of
    recipients
  ) {
    map.set(
      `${recipient.recipientRole}:${recipient.recipientId}`,
      recipient,
    );
  }

  return Array.from(
    map.values(),
  );
}

/* -------------------------------------------------------------------------- */
/*                         SCHOOL-WIDE RECIPIENTS                             */
/* -------------------------------------------------------------------------- */

async function getSchoolWideRecipients({
  tx,
}: {
  tx?:
    NotificationTx;
}) {
  const client =
    getClient(
      tx,
    );

  const [
    students,
    parents,
    teachers,
  ] =
    await Promise.all([
      client.student.findMany({
        select: {
          id:
            true,
        },
      }),

      client.parent.findMany({
        select: {
          id:
            true,
        },
      }),

      client.teacher.findMany({
        select: {
          id:
            true,
        },
      }),
    ]);

  return dedupeRecipients([
    ...students.map(
      (
        student,
      ): Recipient => ({
        recipientId:
          student.id,

        recipientRole:
          "student",
      }),
    ),

    ...parents.map(
      (
        parent,
      ): Recipient => ({
        recipientId:
          parent.id,

        recipientRole:
          "parent",
      }),
    ),

    ...teachers.map(
      (
        teacher,
      ): Recipient => ({
        recipientId:
          teacher.id,

        recipientRole:
          "teacher",
      }),
    ),
  ]);
}

/* -------------------------------------------------------------------------- */
/*                          CLASS RECIPIENTS                                  */
/* -------------------------------------------------------------------------- */

async function getClassRecipients({
  classId,
  tx,
}: {
  classId:
    number;

  tx?:
    NotificationTx;
}) {
  const client =
    getClient(
      tx,
    );

  const classRecord =
    await client.class.findUnique({
      where: {
        id:
          classId,
      },

      select: {
        supervisorId:
          true,

        students: {
          select: {
            id:
              true,

            parentId:
              true,
          },
        },

        lessons: {
          select: {
            teacherId:
              true,
          },
        },
      },
    });

  if (
    !classRecord
  ) {
    return [];
  }

  const recipients:
    Recipient[] = [];

  for (
    const student of
    classRecord.students
  ) {
    recipients.push({
      recipientId:
        student.id,

      recipientRole:
        "student",
    });

    if (
      student.parentId
    ) {
      recipients.push({
        recipientId:
          student.parentId,

        recipientRole:
          "parent",
      });
    }
  }

  if (
    classRecord.supervisorId
  ) {
    recipients.push({
      recipientId:
        classRecord.supervisorId,

      recipientRole:
        "teacher",
    });
  }

  for (
    const lesson of
    classRecord.lessons
  ) {
    recipients.push({
      recipientId:
        lesson.teacherId,

      recipientRole:
        "teacher",
    });
  }

  return dedupeRecipients(
    recipients,
  );
}

/* -------------------------------------------------------------------------- */
/*                         PUBLIC RESOLVER                                    */
/* -------------------------------------------------------------------------- */

export async function getEventRecipients({
  classId,
  tx,
}: {
  classId:
    number | null;

  tx?:
    NotificationTx;
}) {
  if (
    classId ===
    null
  ) {
    return getSchoolWideRecipients({
      tx,
    });
  }

  return getClassRecipients({
    classId,

    tx,
  });
}