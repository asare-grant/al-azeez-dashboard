import "server-only";

import type {
  FeeStatus,
  Prisma,
} from "@prisma/client";

import prisma from "@/lib/prisma";

type FinanceDb =
  | typeof prisma
  | Prisma.TransactionClient;

export type FeeAccountSummary = {
  feeMasterId:
    number;

  totalAmount:
    number;

  paidAmount:
    number;

  balance:
    number;

  status:
    FeeStatus;
};

/* -------------------------------------------------------------------------- */
/*                           MONEY NORMALISATION                              */
/* -------------------------------------------------------------------------- */

function money(
  value: number,
) {
  return Math.round(
    value * 100,
  ) / 100;
}

/* -------------------------------------------------------------------------- */
/*                           STATUS RESOLUTION                                */
/* -------------------------------------------------------------------------- */

export function resolveFeeStatus({
  totalAmount,
  paidAmount,
}: {
  totalAmount:
    number;

  paidAmount:
    number;
}): FeeStatus {
  const total =
    money(
      totalAmount,
    );

  const paid =
    money(
      paidAmount,
    );

  if (
    paid >= total
  ) {
    return "PAID";
  }

  if (
    paid > 0
  ) {
    return "PARTIAL";
  }

  return "PENDING";
}

/* -------------------------------------------------------------------------- */
/*                         CALCULATE ONE ACCOUNT                              */
/* -------------------------------------------------------------------------- */

export async function getFeeAccountSummary({
  feeMasterId,
  tx,
}: {
  feeMasterId:
    number;

  tx?:
    Prisma.TransactionClient;
}): Promise<FeeAccountSummary> {
  const db: FinanceDb =
    tx ??
    prisma;

  const invoice =
    await db.feeMaster.findUnique({
      where: {
        id:
          feeMasterId,
      },

      select: {
        id:
          true,

        totalAmount:
          true,

        payments: {
          select: {
            amount:
              true,
          },
        },
      },
    });

  if (
    !invoice
  ) {
    throw new Error(
      "The fee invoice could not be found.",
    );
  }

  const paidAmount =
    money(
      invoice.payments.reduce(
        (
          total,
          payment,
        ) =>
          total +
          payment.amount,

        0,
      ),
    );

  const totalAmount =
    money(
      invoice.totalAmount,
    );

  const balance =
    money(
      Math.max(
        0,

        totalAmount -
          paidAmount,
      ),
    );

  return {
    feeMasterId:
      invoice.id,

    totalAmount,

    paidAmount,

    balance,

    status:
      resolveFeeStatus({
        totalAmount,

        paidAmount,
      }),
  };
}

/* -------------------------------------------------------------------------- */
/*                         SYNCHRONISE STATUS                                 */
/* -------------------------------------------------------------------------- */

export async function syncFeeMasterStatus({
  feeMasterId,
  tx,
}: {
  feeMasterId:
    number;

  tx:
    Prisma.TransactionClient;
}) {
  const summary =
    await getFeeAccountSummary({
      feeMasterId,

      tx,
    });

  await tx.feeMaster.update({
    where: {
      id:
        feeMasterId,
    },

    data: {
      status:
        summary.status,
    },
  });

  return summary;
}