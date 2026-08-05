"use client";

import {
  FileDown,
  Printer,
} from "lucide-react";

export default function PrintReportCardButton() {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
    >
      <Printer className="h-4 w-4" />

      Print / Save PDF

      <FileDown className="h-4 w-4" />
    </button>
  );
}