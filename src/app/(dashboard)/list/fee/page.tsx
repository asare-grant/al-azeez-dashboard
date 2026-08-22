// // src/app/(dashboard)/list/fee/page.tsx

import prisma from "@/lib/prisma";

import { getCurrentAccessActor } from "@/lib/access-control/current-actor";

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";

import { ITEM_PER_PAGE } from "@/lib/settings";

import { Fee, FeeMaster, FeeStructure, Student } from "@prisma/client";

import React from "react";
import Image from "next/image";

export const revalidate = 0;

type FeeListItem = Fee & {
  master: FeeMaster & {
    student: Student;
  };

  structure: FeeStructure & {
    type: {
      name: string;
    };
  };
};

export default async function FeeListPage(props: {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const searchParams = await props.searchParams;

  /* ======================================================================== */
  /* ACCESS                                                                   */
  /* ======================================================================== */

  const accessActor = await getCurrentAccessActor();

  if (!accessActor) {
    throw new Error("UNAUTHENTICATED");
  }

  const canViewInvoices = accessActor.can("finance.invoices.view");

  const canManageInvoices = accessActor.can("finance.invoices.manage");

  /*
   * Management authority also permits entry into
   * the invoice workspace even if a custom delegated
   * role does not separately include invoices.view.
   */
  if (!canViewInvoices && !canManageInvoices) {
    throw new Error("UNAUTHORIZED");
  }

  /* ======================================================================== */
  /* PAGINATION                                                               */
  /* ======================================================================== */

  const { page, search } = searchParams;

  const p = page ? parseInt(page as string, 10) : 1;

  /* ======================================================================== */
  /* QUERY                                                                    */
  /* ======================================================================== */

  const query: any = {};

  if (search) {
    query.OR = [
      {
        master: {
          student: {
            name: {
              contains: search as string,

              mode: "insensitive",
            },
          },
        },
      },

      {
        master: {
          student: {
            surname: {
              contains: search as string,

              mode: "insensitive",
            },
          },
        },
      },

      {
        master: {
          term: {
            contains: search as string,

            mode: "insensitive",
          },
        },
      },

      {
        structure: {
          studentType: {
            contains: search as string,

            mode: "insensitive",
          },
        },
      },

      {
        structure: {
          boardingType: {
            contains: search as string,

            mode: "insensitive",
          },
        },
      },

      {
        structure: {
          type: {
            name: {
              contains: search as string,

              mode: "insensitive",
            },
          },
        },
      },

      {
        structure: {
          type: {
            category: {
              name: {
                contains: search as string,

                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  /* ======================================================================== */
  /* DATA                                                                     */
  /* ======================================================================== */

  const [data, count] = await prisma.$transaction([
    prisma.fee.findMany({
      where: query,

      include: {
        master: {
          include: {
            student: true,
          },
        },

        structure: {
          include: {
            type: true,
          },
        },
      },

      take: ITEM_PER_PAGE,

      skip: ITEM_PER_PAGE * (p - 1),

      orderBy: {
        id: "desc",
      },
    }),

    prisma.fee.count({
      where: query,
    }),
  ]);

  /* ======================================================================== */
  /* TABLE COLUMNS                                                            */
  /* ======================================================================== */

  const columns = [
    {
      header: "Student",

      accessor: "student",
    },

    {
      header: "Fee Type",

      accessor: "feeType",

      className: "hidden md:table-cell",
    },

    {
      header: "Term",

      accessor: "term",

      className: "hidden md:table-cell",
    },

    {
      header: "Academic Year",

      accessor: "academicYear",

      className: "hidden lg:table-cell",
    },

    {
      header: "Amount",

      accessor: "amount",
    },

    ...(canManageInvoices
      ? [
          {
            header: "Actions",

            accessor: "action",
          },
        ]
      : []),
  ];

  /* ======================================================================== */
  /* ROW                                                                      */
  /* ======================================================================== */

  const renderRow = (item: FeeListItem) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[#F1F0FF]"
    >
      <td className="p-4">
        {item.master.student.name} {item.master.student.surname}
      </td>

      <td className="hidden md:table-cell">
        {item.structure?.type?.name ?? "NA"}
      </td>

      <td className="hidden md:table-cell">{item.master.term}</td>

      <td className="hidden lg:table-cell">{item.master.academicYear}</td>

      <td>{item.amount.toFixed(2)}</td>

      {canManageInvoices ? (
        <td className="flex gap-2 p-2">
          <FormContainer table="fee" type="update" data={item} />

          <FormContainer table="fee" type="delete" id={item.id} />
        </td>
      ) : null}
    </tr>
  );

  /* ======================================================================== */
  /* PAGE                                                                     */
  /* ======================================================================== */

  return (
    <div className="m-4 mt-0 flex-1 rounded-md bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="hidden text-lg font-semibold md:block">All Fees</h1>

        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>

            {canManageInvoices ? (
              <FormContainer table="fee" type="create" />
            ) : null}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={p} count={count} />
    </div>
  );
}
