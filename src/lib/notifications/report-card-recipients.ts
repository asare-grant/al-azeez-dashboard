import "server-only";

import type { Prisma } from "@prisma/client";

import {
  excludeNotificationRecipient,
  getClassSupervisorNotificationRecipient,
  getPermissionNotificationRecipients,
  getStudentAndParentNotificationRecipients,
  mergeNotificationRecipients,
} from "./recipients";

import type { NotificationRecipient } from "./service";

/* -------------------------------------------------------------------------- */
/*                        REPORT SUBMITTED                                    */
/* -------------------------------------------------------------------------- */

export async function getReportSubmittedRecipients({
  actorId,
  tx,
}: {
  actorId?: string | null;

  tx?: Prisma.TransactionClient;
}): Promise<NotificationRecipient[]> {
  const recipients = await getPermissionNotificationRecipients(
    "report_cards.review",
    {
      tx,

      /*
       * REVIEW is an administrative workflow.
       *
       * A delegated reviewer may still have a legacy
       * Teacher persona, but this notification must
       * route to the management review workspace.
       */
      routingRole: "admin",
    },
  );

  /*
   * If an administrator submitted the report,
   * don't notify that same administrator about
   * their own action.
   */
  return excludeNotificationRecipient(recipients, actorId);
}

/* -------------------------------------------------------------------------- */
/*                     REPORT CHANGES REQUESTED                               */
/* -------------------------------------------------------------------------- */

export async function getReportChangesRequestedRecipients({
  classId,
  actorId,
  tx,
}: {
  classId: number;

  actorId?: string | null;

  tx?: Prisma.TransactionClient;
}): Promise<NotificationRecipient[]> {
  const supervisor = await getClassSupervisorNotificationRecipient(classId, {
    tx,
  });

  const recipients = supervisor ? [supervisor] : [];

  return excludeNotificationRecipient(recipients, actorId);
}

/* -------------------------------------------------------------------------- */
/*                         REPORT APPROVED                                    */
/* -------------------------------------------------------------------------- */

export async function getReportApprovedRecipients({
  classId,
  actorId,
  tx,
}: {
  classId: number;

  actorId?: string | null;

  tx?: Prisma.TransactionClient;
}): Promise<NotificationRecipient[]> {
  const supervisor = await getClassSupervisorNotificationRecipient(classId, {
    tx,
  });

  return excludeNotificationRecipient(supervisor ? [supervisor] : [], actorId);
}

/* -------------------------------------------------------------------------- */
/*                        REPORT PUBLISHED                                    */
/* -------------------------------------------------------------------------- */

export async function getReportPublishedRecipients({
  studentId,
  actorId,
  tx,
}: {
  studentId: string;

  actorId?: string | null;

  tx?: Prisma.TransactionClient;
}): Promise<NotificationRecipient[]> {
  const recipients = await getStudentAndParentNotificationRecipients(
    studentId,
    {
      tx,
    },
  );

  return excludeNotificationRecipient(recipients, actorId);
}

/* -------------------------------------------------------------------------- */
/*                          REPORT STALE                                      */
/* -------------------------------------------------------------------------- */

export async function getReportStaleRecipients({
  classId,
  actorId,
  tx,
}: {
  classId: number;

  actorId?: string | null;

  tx?: Prisma.TransactionClient;
}): Promise<NotificationRecipient[]> {
  const [reviewers, supervisor] = await Promise.all([
    getPermissionNotificationRecipients("report_cards.review", {
      tx,

      /*
       * Stale report cards belong to the
       * administrative review workflow.
       */
      routingRole: "admin",
    }),

    getClassSupervisorNotificationRecipient(classId, {
      tx,
    }),
  ]);

  return excludeNotificationRecipient(
    mergeNotificationRecipients(
      reviewers,

      supervisor ? [supervisor] : [],
    ),

    actorId,
  );
}
