import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  getParentNotificationRecipientsForStudent,
} from "./recipients";

export async function getFeeParentRecipients({
  studentId,
  tx,
}: {
  studentId:
    string;

  tx?:
    Prisma.TransactionClient;
}) {
  return getParentNotificationRecipientsForStudent(
    studentId,

    {
      tx,
    },
  );
}