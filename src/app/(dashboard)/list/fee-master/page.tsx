// src/app/(dashboard)/list/fee-master/page.tsx

import type {
  FeeMaster,
  Prisma,
  Student,
} from "@prisma/client";

import FeeMasterHeader from "@/components/fee-master/FeeMasterHeader";
import FeeMasterTable from "@/components/fee-master/FeeMasterTable";
import Pagination from "@/components/Pagination";

import {
  getCurrentAccessActor,
} from "@/lib/access-control";

import prisma from "@/lib/prisma";
import {
  ITEM_PER_PAGE,
} from "@/lib/settings";

export const revalidate =
  0;

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type FeeMasterList =
  FeeMaster & {
    student:
      Student;
  };

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

export default async function FeeMasterListPage(
  props: {
    searchParams: Promise<{
      [key: string]:
        | string
        | string[]
        | undefined;
    }>;
  },
) {
  const searchParams =
    await props.searchParams;

  /* ------------------------------------------------------------------------ */
  /* ACCESS                                                                   */
  /* ------------------------------------------------------------------------ */

  const accessActor =
    await getCurrentAccessActor();

  if (
    !accessActor
  ) {
    throw new Error(
      "UNAUTHENTICATED",
    );
  }

  /*
   * At minimum, someone entering the invoice list
   * must be able to view invoices.
   */
  if (
    !accessActor.can(
      "finance.invoices.view",
    ) &&
    !accessActor.can(
      "finance.invoices.manage",
    )
  ) {
    throw new Error(
      "UNAUTHORIZED",
    );
  }

  const canManageInvoices =
    accessActor.can(
      "finance.invoices.manage",
    );

  const canRecordPayments =
    accessActor.can(
      "finance.payments.record",
    );

  const canModifyPayments =
    accessActor.can(
      "finance.payments.modify",
    );

  /* ------------------------------------------------------------------------ */
  /* PAGINATION / SEARCH                                                      */
  /* ------------------------------------------------------------------------ */

  const {
    page,
    search,
  } =
    searchParams;

  const p =
    Math.max(
      1,
      page
        ? parseInt(
            page as string,
            10,
          ) || 1
        : 1,
    );

  const query:
    Prisma.FeeMasterWhereInput =
    {};

  if (
    typeof search ===
      "string" &&
    search.trim()
  ) {
    const searchValue =
      search.trim();

    query.OR = [
      {
        student: {
          name: {
            contains:
              searchValue,

            mode:
              "insensitive",
          },
        },
      },

      {
        student: {
          surname: {
            contains:
              searchValue,

            mode:
              "insensitive",
          },
        },
      },

      {
        term: {
          contains:
            searchValue,

          mode:
            "insensitive",
        },
      },

      {
        academicYear: {
          contains:
            searchValue,

          mode:
            "insensitive",
        },
      },
    ];
  }

  /* ------------------------------------------------------------------------ */
  /* DATA                                                                     */
  /* ------------------------------------------------------------------------ */

  const [
    data,
    count,
  ] =
    await prisma.$transaction([
      prisma.feeMaster.findMany({
        where:
          query,

        include: {
          student:
            true,
        },

        take:
          ITEM_PER_PAGE,

        skip:
          ITEM_PER_PAGE *
          (p - 1),

        orderBy: {
          createdAt:
            "desc",
        },
      }),

      prisma.feeMaster.count({
        where:
          query,
      }),
    ]);

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <FeeMasterHeader
        canManageInvoices={
          canManageInvoices
        }
      />

      <FeeMasterTable
        data={
          data as
            FeeMasterList[]
        }
        canManageInvoices={
          canManageInvoices
        }
        canRecordPayments={
          canRecordPayments
        }
        canModifyPayments={
          canModifyPayments
        }
      />

      <Pagination
        page={p}
        count={count}
      />
    </div>
  );
}