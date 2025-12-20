"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";

// Define the invoice type
export type Invoice = {
  id: number;
  student: string;
  class: string;
  term: string;
  totalAmount: number;
  paid: number;
  pending: number;
  status: "PAID" | "PARTIAL" | "PENDING";
};

type FinanceGridProps = {
  invoices: Invoice[];
  role?: string;
};

export const FinanceGrid: React.FC<FinanceGridProps> = ({ invoices, role }) => {
  // Column definitions
  const columnDefs: ColDef<Invoice>[] = useMemo(
    () => [
      { headerName: "ID", field: "id", sortable: true, filter: true, width: 80 },
      { headerName: "Student", field: "student", flex: 1, sortable: true, filter: true },
      { headerName: "Class", field: "class", flex: 1, sortable: true, filter: true },
      { headerName: "Term", field: "term", flex: 1, sortable: true, filter: true },
      {
        headerName: "Total Amount",
        field: "totalAmount",
        flex: 1,
        sortable: true,
        filter: true,
        valueFormatter: (params) => `₵${params.value.toFixed(2)}`,
      },
      {
        headerName: "Paid",
        field: "paid",
        flex: 1,
        sortable: true,
        filter: true,
        valueFormatter: (params) => `₵${params.value.toFixed(2)}`,
      },
      {
        headerName: "Pending",
        field: "pending",
        flex: 1,
        sortable: true,
        filter: true,
        valueFormatter: (params) => `₵${params.value.toFixed(2)}`,
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        sortable: true,
        filter: true,
        cellStyle: (params) => {
          if (params.value === "PAID") return { color: "green", fontWeight: "bold" };
          if (params.value === "PARTIAL") return { color: "orange", fontWeight: "bold" };
          return { color: "red", fontWeight: "bold" };
        },
      },
    ],
    []
  );

  // Row data
  const rowData = useMemo(() => invoices, [invoices]);

  return (
    <div className="ag-theme-alpine" style={{ width: "100%", height: "500px" }}>
      <AgGridReact<Invoice>
        rowData={rowData}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        defaultColDef={{
          resizable: true,
        }}
      />
    </div>
  );
};
