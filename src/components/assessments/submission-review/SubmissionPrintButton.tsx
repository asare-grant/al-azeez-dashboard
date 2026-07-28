"use client";

import {
  Printer,
} from "lucide-react";

export default function SubmissionPrintButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.print()
      }
      className="print:hidden inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
    >
      <Printer className="h-4 w-4" />
      Print Report
    </button>
  );
}