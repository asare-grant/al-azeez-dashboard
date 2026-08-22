// src/lib/notifications/recipients.ts
import "server-only";

import type { Prisma } from "@prisma/client";

import prisma from "@/lib/prisma";

import type { NotificationRecipient } from "./service";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type NotificationDb = typeof prisma | Prisma.TransactionClient;

type ResolverOptions = {
  tx?: Prisma.TransactionClient;
};

/* -------------------------------------------------------------------------- */
/*                              SHARED HELPERS                                */
/* -------------------------------------------------------------------------- */

function getDb(options: ResolverOptions): NotificationDb {
  return options.tx ?? prisma;
}

function normalizeRecipients(recipients: NotificationRecipient[]) {
  const unique = new Map<string, NotificationRecipient>();

  for (const recipient of recipients) {
    const recipientId = recipient.recipientId.trim();

    const recipientRole = recipient.recipientRole.trim();

    if (!recipientId || !recipientRole) {
      continue;
    }

    /*
     * recipientId is the real identity key.
     *
     * One user should receive a logical
     * event only once.
     */
    unique.set(recipientId, {
      recipientId,
      recipientRole,
    });
  }

  return Array.from(unique.values());
}

/* -------------------------------------------------------------------------- */
/*                    ACCESS CONTROL GOVERNANCE RECIPIENTS                    */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                    ACCESS CONTROL GOVERNANCE RECIPIENTS                    */
/* -------------------------------------------------------------------------- */

export async function getAccessControlGovernanceRecipients(
  options: ResolverOptions = {},
): Promise<NotificationRecipient[]> {
  const db = getDb(options);

  const now = new Date();

  /*
   * Governance notifications are RBAC-authorized.
   *
   * A recipient must:
   *
   * 1. have an ACTIVE account,
   * 2. hold an active role,
   * 3. hold an active, unexpired role assignment,
   * 4. receive at least one governance permission
   *    required to manage delegated access.
   *
   * Legacy role metadata is deliberately not
   * considered an authority source.
   */
  const accounts = await db.userAccount.findMany({
    where: {
      status: "ACTIVE",

      roles: {
        some: {
          AND: [
            {
              role: {
                isActive: true,

                permissions: {
                  some: {
                    permission: {
                      isActive: true,

                      key: {
                        in: ["roles.manage_expiry", "roles.remove"],
                      },
                    },
                  },
                },
              },
            },

            {
              OR: [
                {
                  expiresAt: null,
                },

                {
                  expiresAt: {
                    gt: now,
                  },
                },
              ],
            },
          ],
        },
      },
    },

    select: {
      id: true,
    },
  });

  return normalizeRecipients(
    accounts.map((account) => ({
      recipientId: account.id,

      /*
       * This is a notification-routing persona,
       * not an authorization decision.
       *
       * Eligibility above is determined entirely
       * by effective RBAC authority.
       */
      recipientRole: "access-control",
    })),
  );
}

/* -------------------------------------------------------------------------- */
/*                    ACCESS REVIEW SUPER ADMIN RECIPIENTS                    */
/* -------------------------------------------------------------------------- */

export async function getAccessReviewSuperAdminRecipients(
  options: ResolverOptions = {},
): Promise<NotificationRecipient[]> {
  const db = getDb(options);

  const now = new Date();

  /*
   * Access Review campaigns are a Super-Admin governance
   * responsibility.
   *
   * Unlike the broader Access Control resolver above,
   * this deliberately does NOT use the legacy Admin
   * fallback.
   *
   * The user must hold an active, unexpired super_admin
   * RBAC assignment.
   */
  const accounts = await db.userAccount.findMany({
    where: {
      status: "ACTIVE",

      roles: {
        some: {
          AND: [
            {
              role: {
                key: "super_admin",

                isActive: true,
              },
            },

            {
              OR: [
                {
                  expiresAt: null,
                },

                {
                  expiresAt: {
                    gt: now,
                  },
                },
              ],
            },
          ],
        },
      },
    },

    select: {
      id: true,
    },
  });

  return normalizeRecipients(
    accounts.map((account) => ({
      recipientId: account.id,

      recipientRole: "super_admin",
    })),
  );
}

/* -------------------------------------------------------------------------- */
/*                             STUDENT RECIPIENT                              */
/* -------------------------------------------------------------------------- */

export async function getStudentNotificationRecipient(
  studentId: string,
  options: ResolverOptions = {},
): Promise<NotificationRecipient | null> {
  const normalizedStudentId = studentId.trim();

  if (!normalizedStudentId) {
    return null;
  }

  const db = getDb(options);

  const student = await db.student.findUnique({
    where: {
      id: normalizedStudentId,
    },

    select: {
      id: true,
    },
  });

  if (!student) {
    return null;
  }

  return {
    recipientId: student.id,

    recipientRole: "student",
  };
}

/* -------------------------------------------------------------------------- */
/*                         STUDENT PARENT RECIPIENTS                          */
/* -------------------------------------------------------------------------- */

export async function getParentNotificationRecipientsForStudent(
  studentId: string,
  options: ResolverOptions = {},
): Promise<NotificationRecipient[]> {
  const normalizedStudentId = studentId.trim();

  if (!normalizedStudentId) {
    return [];
  }

  const db = getDb(options);

  /*
   * Parent -> students is used here because it
   * supports the natural school relationship:
   *
   * one parent account
   *      ↓
   * one or more children
   */
  const parents = await db.parent.findMany({
    where: {
      students: {
        some: {
          id: normalizedStudentId,
        },
      },
    },

    select: {
      id: true,
    },
  });

  return normalizeRecipients(
    parents.map((parent) => ({
      recipientId: parent.id,

      recipientRole: "parent",
    })),
  );
}

/* -------------------------------------------------------------------------- */
/*                          CLASS SUPERVISOR                                  */
/* -------------------------------------------------------------------------- */

export async function getClassSupervisorNotificationRecipient(
  classId: number,
  options: ResolverOptions = {},
): Promise<NotificationRecipient | null> {
  if (!Number.isInteger(classId) || classId <= 0) {
    return null;
  }

  const db = getDb(options);

  const classRecord = await db.class.findUnique({
    where: {
      id: classId,
    },

    select: {
      supervisorId: true,
    },
  });

  const supervisorId = classRecord?.supervisorId?.trim();

  if (!supervisorId) {
    return null;
  }

  const teacher = await db.teacher.findUnique({
    where: {
      id: supervisorId,
    },

    select: {
      id: true,
    },
  });

  if (!teacher) {
    return null;
  }

  return {
    recipientId: teacher.id,

    recipientRole: "teacher",
  };
}

/* -------------------------------------------------------------------------- */
/*                        CLASS TEACHER RECIPIENTS                            */
/* -------------------------------------------------------------------------- */

export async function getClassTeacherNotificationRecipients(
  classId: number,
  options: ResolverOptions = {},
): Promise<NotificationRecipient[]> {
  if (!Number.isInteger(classId) || classId <= 0) {
    return [];
  }

  const db = getDb(options);

  /*
   * Resolve teachers from the lesson table rather
   * than assuming every teacher linked to a class
   * is necessarily its supervisor.
   */
  const lessons = await db.lesson.findMany({
    where: {
      classId,
    },

    select: {
      teacherId: true,
    },
  });

  const teacherIds = Array.from(
    new Set(
      lessons
        .map((lesson) => lesson.teacherId?.trim())
        .filter((teacherId): teacherId is string => Boolean(teacherId)),
    ),
  );

  return normalizeRecipients(
    teacherIds.map((teacherId) => ({
      recipientId: teacherId,

      recipientRole: "teacher",
    })),
  );
}

/* -------------------------------------------------------------------------- */
/*                     STUDENT + PARENT AUDIENCE                              */
/* -------------------------------------------------------------------------- */

export async function getStudentAndParentNotificationRecipients(
  studentId: string,
  options: ResolverOptions = {},
): Promise<NotificationRecipient[]> {
  const [student, parents] = await Promise.all([
    getStudentNotificationRecipient(studentId, options),

    getParentNotificationRecipientsForStudent(studentId, options),
  ]);

  return normalizeRecipients([...(student ? [student] : []), ...parents]);
}

/* -------------------------------------------------------------------------- */
/*                        ADMIN + TEACHER AUDIENCE                             */
/* -------------------------------------------------------------------------- */

export async function getAcademicManagementRecipients(
  classId: number,
  options: ResolverOptions = {},
): Promise<NotificationRecipient[]> {
  const [attendanceReportViewers, supervisor] = await Promise.all([
    getPermissionNotificationRecipients("attendance.report", {
      ...options,

      /*
       * This is an administrative attendance
       * oversight notification.
       *
       * The routing persona does not grant access.
       * The destination route remains responsible
       * for enforcing the actor's RBAC permissions.
       */
      routingRole: "admin",
    }),

    getClassSupervisorNotificationRecipient(classId, options),
  ]);

  return normalizeRecipients([
    ...attendanceReportViewers,

    ...(supervisor ? [supervisor] : []),
  ]);
}

/* -------------------------------------------------------------------------- */
/*                         REMOVE AN ACTOR                                    */
/* -------------------------------------------------------------------------- */

export function excludeNotificationRecipient(
  recipients: NotificationRecipient[],

  recipientId: string | null | undefined,
) {
  const normalizedId = recipientId?.trim();

  if (!normalizedId) {
    return recipients;
  }

  return recipients.filter(
    (recipient) => recipient.recipientId !== normalizedId,
  );
}

/* -------------------------------------------------------------------------- */
/*                       MERGE RECIPIENT GROUPS                               */
/* -------------------------------------------------------------------------- */

export function mergeNotificationRecipients(
  ...groups: NotificationRecipient[][]
) {
  return normalizeRecipients(groups.flat());
}

/* -------------------------------------------------------------------------- */
/*                    EFFECTIVE PERMISSION AUDIENCE                           */
/* -------------------------------------------------------------------------- */

export async function getPermissionNotificationRecipients(
  permission: string,

  {
    tx,

    routingRole,
  }: ResolverOptions & {
    routingRole?: string;
  } = {},
): Promise<NotificationRecipient[]> {
  const normalizedPermission = permission.trim().toLowerCase();

  if (!normalizedPermission) {
    return [];
  }

  const db = getDb({
    tx,
  });

  const now = new Date();

  /*
   * Mirror getCurrentAccessActor() effective-access rules:
   *
   * - account must be ACTIVE
   * - role must be active
   * - assignment must be permanent or unexpired
   * - permission must be active
   *
   * This allows system roles and delegated/custom roles
   * to participate without relying on a legacy domain table.
   */
  const users = await db.userAccount.findMany({
    where: {
      status: "ACTIVE",

      roles: {
        some: {
          OR: [
            {
              expiresAt: null,
            },

            {
              expiresAt: {
                gt: now,
              },
            },
          ],

          role: {
            isActive: true,

            permissions: {
              some: {
                permission: {
                  isActive: true,

                  key: normalizedPermission,
                },
              },
            },
          },
        },
      },
    },

    select: {
      id: true,
    },
  });

  return normalizeRecipients(
    users.map((user) => ({
      recipientId: user.id,

      /*
       * Some workflows have a specific routing persona.
       *
       * For example, report_cards.review recipients must
       * enter the administrative review workspace even if
       * the recipient's legacy persona is Teacher.
       *
       * This value affects navigation only. Authorization
       * remains enforced by the destination route.
       */
      recipientRole: routingRole ?? "custom",
    })),
  );
}
