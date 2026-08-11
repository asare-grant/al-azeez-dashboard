import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  excludeNotificationRecipient,
  getAdminNotificationRecipients,
  getClassSupervisorNotificationRecipient,
  getStudentAndParentNotificationRecipients,
  mergeNotificationRecipients,
} from "./recipients";

import type {
  NotificationRecipient,
} from "./service";

/* -------------------------------------------------------------------------- */
/*                        REPORT SUBMITTED                                    */
/* -------------------------------------------------------------------------- */

export async function getReportSubmittedRecipients({
  actorId,
  tx,
}: {
  actorId?:
    string | null;

  tx?:
    Prisma.TransactionClient;
}): Promise<
  NotificationRecipient[]
> {
  const recipients =
    await getAdminNotificationRecipients({
      tx,
    });

  /*
   * If an administrator submitted the report,
   * don't notify that same administrator about
   * their own action.
   */
  return excludeNotificationRecipient(
    recipients,
    actorId,
  );
}

/* -------------------------------------------------------------------------- */
/*                     REPORT CHANGES REQUESTED                               */
/* -------------------------------------------------------------------------- */

export async function getReportChangesRequestedRecipients({
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
  const supervisor =
    await getClassSupervisorNotificationRecipient(
      classId,
      {
        tx,
      },
    );

  const recipients =
    supervisor
      ? [
          supervisor,
        ]
      : [];

  return excludeNotificationRecipient(
    recipients,
    actorId,
  );
}

/* -------------------------------------------------------------------------- */
/*                         REPORT APPROVED                                    */
/* -------------------------------------------------------------------------- */

export async function getReportApprovedRecipients({
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
  const supervisor =
    await getClassSupervisorNotificationRecipient(
      classId,
      {
        tx,
      },
    );

  return excludeNotificationRecipient(
    supervisor
      ? [
          supervisor,
        ]
      : [],
    actorId,
  );
}

/* -------------------------------------------------------------------------- */
/*                        REPORT PUBLISHED                                    */
/* -------------------------------------------------------------------------- */

export async function getReportPublishedRecipients({
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
  const recipients =
    await getStudentAndParentNotificationRecipients(
      studentId,
      {
        tx,
      },
    );

  return excludeNotificationRecipient(
    recipients,
    actorId,
  );
}

/* -------------------------------------------------------------------------- */
/*                          REPORT STALE                                      */
/* -------------------------------------------------------------------------- */

export async function getReportStaleRecipients({
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
  const [
    admins,
    supervisor,
  ] =
    await Promise.all([
      getAdminNotificationRecipients({
        tx,
      }),

      getClassSupervisorNotificationRecipient(
        classId,
        {
          tx,
        },
      ),
    ]);

  return excludeNotificationRecipient(
    mergeNotificationRecipients(
      admins,

      supervisor
        ? [
            supervisor,
          ]
        : [],
    ),

    actorId,
  );
}