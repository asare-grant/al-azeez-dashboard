// src/lib/notifications/recipients.ts
import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

import type {
  NotificationRecipient,
} from "./service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type NotificationDb =
  | typeof prisma
  | Prisma.TransactionClient;

type ResolverOptions = {
  tx?:
    Prisma.TransactionClient;
};

/* -------------------------------------------------------------------------- */
/*                              SHARED HELPERS                                */
/* -------------------------------------------------------------------------- */

function getDb(
  options: ResolverOptions,
): NotificationDb {
  return (
    options.tx ??
    prisma
  );
}

function normalizeRecipients(
  recipients:
    NotificationRecipient[],
) {
  const unique =
    new Map<
      string,
      NotificationRecipient
    >();

  for (
    const recipient of
    recipients
  ) {
    const recipientId =
      recipient.recipientId.trim();

    const recipientRole =
      recipient.recipientRole.trim();

    if (
      !recipientId ||
      !recipientRole
    ) {
      continue;
    }

    /*
     * recipientId is the real identity key.
     *
     * One user should receive a logical
     * event only once.
     */
    unique.set(
      recipientId,
      {
        recipientId,
        recipientRole,
      },
    );
  }

  return Array.from(
    unique.values(),
  );
}

/* -------------------------------------------------------------------------- */
/*                              ADMIN RECIPIENTS                              */
/* -------------------------------------------------------------------------- */

export async function getAdminNotificationRecipients(
  options: ResolverOptions = {},
): Promise<
  NotificationRecipient[]
> {
  const db =
    getDb(options);

  const admins =
    await db.admin.findMany({
      select: {
        id:
          true,
      },
    });

  return normalizeRecipients(
    admins.map(
      (admin) => ({
        recipientId:
          admin.id,

        recipientRole:
          "admin",
      }),
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                             STUDENT RECIPIENT                              */
/* -------------------------------------------------------------------------- */

export async function getStudentNotificationRecipient(
  studentId: string,
  options: ResolverOptions = {},
): Promise<
  NotificationRecipient | null
> {
  const normalizedStudentId =
    studentId.trim();

  if (!normalizedStudentId) {
    return null;
  }

  const db =
    getDb(options);

  const student =
    await db.student.findUnique({
      where: {
        id:
          normalizedStudentId,
      },

      select: {
        id:
          true,
      },
    });

  if (!student) {
    return null;
  }

  return {
    recipientId:
      student.id,

    recipientRole:
      "student",
  };
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT PARENT RECIPIENTS                          */
/* -------------------------------------------------------------------------- */

export async function getParentNotificationRecipientsForStudent(
  studentId: string,
  options: ResolverOptions = {},
): Promise<
  NotificationRecipient[]
> {
  const normalizedStudentId =
    studentId.trim();

  if (!normalizedStudentId) {
    return [];
  }

  const db =
    getDb(options);

  /*
   * Parent -> students is used here because it
   * supports the natural school relationship:
   *
   * one parent account
   *      ↓
   * one or more children
   */
  const parents =
    await db.parent.findMany({
      where: {
        students: {
          some: {
            id:
              normalizedStudentId,
          },
        },
      },

      select: {
        id:
          true,
      },
    });

  return normalizeRecipients(
    parents.map(
      (parent) => ({
        recipientId:
          parent.id,

        recipientRole:
          "parent",
      }),
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                          CLASS SUPERVISOR                                  */
/* -------------------------------------------------------------------------- */

export async function getClassSupervisorNotificationRecipient(
  classId: number,
  options: ResolverOptions = {},
): Promise<
  NotificationRecipient | null
> {
  if (
    !Number.isInteger(
      classId,
    ) ||
    classId <= 0
  ) {
    return null;
  }

  const db =
    getDb(options);

  const classRecord =
    await db.class.findUnique({
      where: {
        id:
          classId,
      },

      select: {
        supervisorId:
          true,
      },
    });

  const supervisorId =
    classRecord
      ?.supervisorId
      ?.trim();

  if (!supervisorId) {
    return null;
  }

  const teacher =
    await db.teacher.findUnique({
      where: {
        id:
          supervisorId,
      },

      select: {
        id:
          true,
      },
    });

  if (!teacher) {
    return null;
  }

  return {
    recipientId:
      teacher.id,

    recipientRole:
      "teacher",
  };
}

/* -------------------------------------------------------------------------- */
/*                        CLASS TEACHER RECIPIENTS                            */
/* -------------------------------------------------------------------------- */

export async function getClassTeacherNotificationRecipients(
  classId: number,
  options: ResolverOptions = {},
): Promise<
  NotificationRecipient[]
> {
  if (
    !Number.isInteger(
      classId,
    ) ||
    classId <= 0
  ) {
    return [];
  }

  const db =
    getDb(options);

  /*
   * Resolve teachers from the lesson table rather
   * than assuming every teacher linked to a class
   * is necessarily its supervisor.
   */
  const lessons =
    await db.lesson.findMany({
      where: {
        classId,
      },

      select: {
        teacherId:
          true,
      },
    });

  const teacherIds =
    Array.from(
      new Set(
        lessons
          .map(
            (lesson) =>
              lesson.teacherId
                ?.trim(),
          )
          .filter(
            (
              teacherId,
            ): teacherId is string =>
              Boolean(
                teacherId,
              ),
          ),
      ),
    );

  return normalizeRecipients(
    teacherIds.map(
      (teacherId) => ({
        recipientId:
          teacherId,

        recipientRole:
          "teacher",
      }),
    ),
  );
}

/* -------------------------------------------------------------------------- */
/*                     STUDENT + PARENT AUDIENCE                              */
/* -------------------------------------------------------------------------- */

export async function getStudentAndParentNotificationRecipients(
  studentId: string,
  options: ResolverOptions = {},
): Promise<
  NotificationRecipient[]
> {
  const [
    student,
    parents,
  ] =
    await Promise.all([
      getStudentNotificationRecipient(
        studentId,
        options,
      ),

      getParentNotificationRecipientsForStudent(
        studentId,
        options,
      ),
    ]);

  return normalizeRecipients([
    ...(student
      ? [
          student,
        ]
      : []),

    ...parents,
  ]);
}

/* -------------------------------------------------------------------------- */
/*                        ADMIN + TEACHER AUDIENCE                             */
/* -------------------------------------------------------------------------- */

export async function getAcademicManagementRecipients(
  classId: number,
  options: ResolverOptions = {},
): Promise<
  NotificationRecipient[]
> {
  const [
    admins,
    supervisor,
  ] =
    await Promise.all([
      getAdminNotificationRecipients(
        options,
      ),

      getClassSupervisorNotificationRecipient(
        classId,
        options,
      ),
    ]);

  return normalizeRecipients([
    ...admins,

    ...(supervisor
      ? [
          supervisor,
        ]
      : []),
  ]);
}

/* -------------------------------------------------------------------------- */
/*                         REMOVE AN ACTOR                                    */
/* -------------------------------------------------------------------------- */

export function excludeNotificationRecipient(
  recipients:
    NotificationRecipient[],

  recipientId:
    string | null | undefined,
) {
  const normalizedId =
    recipientId?.trim();

  if (!normalizedId) {
    return recipients;
  }

  return recipients.filter(
    (recipient) =>
      recipient.recipientId !==
      normalizedId,
  );
}

/* -------------------------------------------------------------------------- */
/*                       MERGE RECIPIENT GROUPS                               */
/* -------------------------------------------------------------------------- */

export function mergeNotificationRecipients(
  ...groups:
    NotificationRecipient[][]
) {
  return normalizeRecipients(
    groups.flat(),
  );
}


export async function getRoleNotificationRecipients(
  role:
    | "admin"
    | "teacher"
    | "student"
    | "parent",

  options:
    ResolverOptions = {},
): Promise<
  NotificationRecipient[]
> {
  const db =
    getDb(options);

  switch (role) {
    case "admin": {
      return getAdminNotificationRecipients(
        options,
      );
    }

    case "teacher": {
      const teachers =
        await db.teacher.findMany({
          select: {
            id:
              true,
          },
        });

      return normalizeRecipients(
        teachers.map(
          (teacher) => ({
            recipientId:
              teacher.id,

            recipientRole:
              "teacher",
          }),
        ),
      );
    }

    case "student": {
      const students =
        await db.student.findMany({
          select: {
            id:
              true,
          },
        });

      return normalizeRecipients(
        students.map(
          (student) => ({
            recipientId:
              student.id,

            recipientRole:
              "student",
          }),
        ),
      );
    }

    case "parent": {
      const parents =
        await db.parent.findMany({
          select: {
            id:
              true,
          },
        });

      return normalizeRecipients(
        parents.map(
          (parent) => ({
            recipientId:
              parent.id,

            recipientRole:
              "parent",
          }),
        ),
      );
    }
  }
}