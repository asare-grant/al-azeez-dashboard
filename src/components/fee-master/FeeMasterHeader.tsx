// src/components/fee-master/FeeMasterHeader.tsx

"use client";

import {
  useState,
} from "react";

import TableSearch from "@/components/TableSearch";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type FeeMasterHeaderProps = {
  canManageInvoices:
    boolean;
};

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function FeeMasterHeader({
  canManageInvoices,
}: FeeMasterHeaderProps) {
  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  /* ------------------------------------------------------------------------ */
  /* GENERATE INVOICES                                                        */
  /* ------------------------------------------------------------------------ */

  const generateInvoices =
    async () => {
      if (
        !canManageInvoices
      ) {
        return;
      }

      if (
        !confirm(
          "Generate invoices for all students?",
        )
      ) {
        return;
      }

      try {
        setLoading(
          true,
        );

        const response =
          await fetch(
            "/api/generate-invoices",
            {
              method:
                "POST",
            },
          );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success
        ) {
          alert(
            "Invoices generated successfully!",
          );

          window.location.reload();

          return;
        }

        console.error(
          "GENERATE INVOICES ERROR:",
          result,
        );

        alert(
          result.message ??
            "Failed to generate invoices.",
        );
      } catch (
        error
      ) {
        console.error(
          "GENERATE INVOICES ERROR:",
          error,
        );

        alert(
          "Failed to generate invoices.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="hidden text-lg font-semibold lg:block">
        Fee Invoices
      </h1>

      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <TableSearch />

        <div className="flex w-full justify-start md:justify-end">
          {canManageInvoices && (
            <button
              type="button"
              onClick={
                generateInvoices
              }
              disabled={
                loading
              }
              className="rounded-md bg-green-500 p-2 text-sm text-white disabled:bg-gray-400"
            >
              {loading
                ? "Generating..."
                : "Generate Invoice"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}