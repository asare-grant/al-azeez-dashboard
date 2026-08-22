// src/components/fee-master/FeeMasterTable.tsx

import dynamic from "next/dynamic";

import type {
  FeeMaster,
  Student,
} from "@prisma/client";

import Table from "@/components/Table";

/* ========================================================================== */
/* DYNAMIC FORM CONTAINER                                                     */
/* ========================================================================== */

const FormContainer =
  dynamic(
    () =>
      import(
        "@/components/FormContainer"
      ),
  );

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type FeeMasterList =
  FeeMaster & {
    student:
      Student;
  };

type FeeMasterTableProps = {
  data:
    FeeMasterList[];

  canManageInvoices:
    boolean;

  canRecordPayments:
    boolean;

  canModifyPayments:
    boolean;
};

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function FeeMasterTable({
  data,
  canManageInvoices,
  canRecordPayments,
  canModifyPayments,
}: FeeMasterTableProps) {
  const hasActions =
  canManageInvoices ||
  canRecordPayments ||
  canModifyPayments;

  /* ------------------------------------------------------------------------ */
  /* COLUMNS                                                                  */
  /* ------------------------------------------------------------------------ */

  const columns = [
    {
      header:
        "Student",

      accessor:
        "student",
    },

    {
      header:
        "Term",

      accessor:
        "term",

      className:
        "hidden lg:table-cell",
    },

    {
      header:
        "Academic Year",

      accessor:
        "academicYear",

      className:
        "hidden lg:table-cell",
    },

    {
      header:
        "Total Amount",

      accessor:
        "totalAmount",
    },

    {
      header:
        "Status",

      accessor:
        "status",

      className:
        "hidden lg:table-cell",
    },

    ...(hasActions
      ? [
          {
            header:
              "Actions",

            accessor:
              "action",
          },
        ]
      : []),
  ];

  /* ------------------------------------------------------------------------ */
  /* ROW                                                                      */
  /* ------------------------------------------------------------------------ */

  const renderRow =
    (
      item:
        FeeMasterList,
    ) => (
      <tr
        key={
          item.id
        }
        className="border-b border-gray-200 text-sm even:bg-slate-50 hover:bg-[#F1F0FF]"
      >
        <td className="p-4">
          {
            item
              .student
              .name
          }{" "}
          {
            item
              .student
              .surname
          }
        </td>

        <td className="hidden lg:table-cell">
          {
            item.term
          }
        </td>

        <td className="hidden lg:table-cell">
          {
            item
              .academicYear
          }
        </td>

        <td>
          {item.totalAmount.toFixed(
            2,
          )}
        </td>

        <td className="hidden lg:table-cell">
          {
            item.status
          }
        </td>

        {hasActions && (
          <td className="flex items-center gap-2 p-2">
            {/* ------------------------------------------------------------ */}
            {/* INVOICE MANAGEMENT                                           */}
            {/* ------------------------------------------------------------ */}

            {canManageInvoices && (
              <>
                <FormContainer
                  table="fee-master"
                  type="update"
                  data={
                    item
                  }
                />

                <FormContainer
                  table="fee-master"
                  type="delete"
                  id={
                    item.id
                  }
                />
              </>
            )}

            {/* ------------------------------------------------------------ */}
            {/* PAYMENT RECORDING                                            */}
            {/* ------------------------------------------------------------ */}

            {canRecordPayments && (
              <FormContainer
                table="fee-payment"
                type="create"
                relatedData={{
                  masterId:
                    item.id,
                }}
              />
            )}
          </td>
        )}
      </tr>
    );

  return (
    <Table
      columns={
        columns
      }
      renderRow={
        renderRow
      }
      data={
        data
      }
    />
  );
}