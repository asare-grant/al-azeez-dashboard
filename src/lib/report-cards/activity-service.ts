import "server-only";

import type { Prisma, ReportCardActivityType } from "@prisma/client";

export type CreateReportCardActivityInput = {
  tx: Prisma.TransactionClient;

  reportCardId: number;

  type: ReportCardActivityType;

  actorId?: string | null;

  actorRole?: string | null;

  actorName?: string | null;

  title: string;

  description?: string | null;

  note?: string | null;

  metadata?: Prisma.InputJsonValue;
};

export async function createReportCardActivity({
  tx,
  reportCardId,
  type,
  actorId,
  actorRole,
  actorName,
  title,
  description,
  note,
  metadata,
}: CreateReportCardActivityInput) {
  return tx.reportCardActivity.create({
    data: {
      reportCardId,

      type,

      actorId: actorId ?? null,

      actorRole: actorRole ?? null,

      actorName: actorName ?? null,

      title,

      description: description ?? null,

      note: note ?? null,

      metadata: metadata ?? undefined,
    },

    select: {
      id: true,
    },
  });
}
