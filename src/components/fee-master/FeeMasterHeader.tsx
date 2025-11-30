// /components/fee-master/FeeMasterHeader.tsx
"use client";

import TableSearch from "@/components/TableSearch";
import { useState } from "react";

export default function FeeMasterHeader({ role }: { role: string }) {
  const [loading, setLoading] = useState(false);

  const generateInvoices = async () => {
    if (!confirm("Generate invoices for all students?")) return;
    try {
      setLoading(true);
      const res = await fetch("/api/generate-invoices", { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) {
        alert("Invoices generated successfully!");
        // reload to show new invoices
        window.location.reload();
      } else {
        console.error(json);
        alert("Failed to generate invoices.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate invoices.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="hidden lg:block text-lg font-semibold">Fee Invoices</h1>

      <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
        <TableSearch />
        <div className="flex w-full justify-start md:justify-end">
          {role === "admin" && (
            <button
              onClick={generateInvoices}
              disabled={loading}
              className="bg-green-500 text-white p-2 rounded-md text-sm disabled:bg-gray-400"
            >
              {loading ? "Generating..." : "Generate Invoice"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
