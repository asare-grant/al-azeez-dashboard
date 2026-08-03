"use client";

import {
  MonitorX,
} from "lucide-react";

export default function AssessmentTabConflict() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-red-50 text-red-600">
          <MonitorX className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-2xl font-black text-slate-950">
          Assessment open elsewhere
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          This attempt appears to be active in
          another browser tab. Close the other tab
          before continuing here.
        </p>
      </div>
    </div>
  );
}