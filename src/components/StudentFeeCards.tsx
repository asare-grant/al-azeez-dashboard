"use client";

import { Wallet, ArrowDownCircle, Scale, ArrowRight, } from "lucide-react";
import { useState } from "react";
import FeeHistoryModal from "./FeeHistoryModal";
import Link from "next/link";

type FeeDisplayStatus = "PENDING" | "PARTIAL" | "PAID";

type FeeMasterLite = {
  id: number;

  term: string;

  academicYear: string;

  totalAmount: number;

  payments: {
    id: number;

    amount: number;

    date: Date | string;

    method: string;
  }[];
};

// 🔹 Optional helper (client-side)
const getFeeStatus = (
  total: number,

  paid: number,
): FeeDisplayStatus => {
  if (paid >= total) {
    return "PAID";
  }

  if (paid > 0) {
    return "PARTIAL";
  }

  return "PENDING";
};

const StudentFeeCards = ({
  studentId,
  total,
  paid,
  balance,
  feeMaster,
}: {
  studentId: string;
  total: number;
  paid: number;
  balance: number;
  feeMaster: FeeMasterLite | undefined;
}) => {
  const [open, setOpen] = useState(false);

  const status = getFeeStatus(total, paid);

  const balanceColor =
    status === "PAID"
      ? "bg-green-100 text-green-700"
      : status === "PARTIAL"
        ? "bg-orange-100 text-orange-700"
        : "bg-red-100 text-red-700";

  const cardClass = "flex-1 bg-gray-50 rounded-lg p-4 flex items-center gap-4";

  return (
  <>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
            Student Finance
          </p>

          <h3 className="mt-1 text-base font-black text-slate-950">
            Fee Overview
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Current fee position and payment summary.
          </p>
        </div>

        <Link
          href={`/parent/children/${studentId}/fees`}
          className="group inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-black text-blue-700 transition duration-200 hover:border-blue-300 hover:bg-blue-100 sm:w-auto"
        >
          View Fee Account

          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* FINANCIAL METRICS */}
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {/* TOTAL */}
        <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Wallet className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Total Fees
            </p>

            <p className="mt-1 truncate text-base font-black text-slate-900">
              GHS {total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* PAID */}
        <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <ArrowDownCircle className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Amount Paid
            </p>

            <p className="mt-1 truncate text-base font-black text-slate-900">
              GHS {paid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* BALANCE */}
        <button
          type="button"
          onClick={() => {
            if (feeMaster) {
              setOpen(true);
            }
          }}
          disabled={!feeMaster}
          className={`flex min-w-0 items-center gap-3 rounded-2xl p-4 text-left transition duration-200 ${
            feeMaster
              ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
              : "cursor-default opacity-70"
          } ${balanceColor}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/60">
            <Scale className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-70">
              Balance
            </p>

            <p className="mt-1 truncate text-base font-black">
              GHS {balance.toFixed(2)}
            </p>

            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] opacity-70">
              {status}
            </p>
          </div>
        </button>
      </div>
    </section>

    {open && feeMaster && (
      <FeeHistoryModal
        feeMaster={feeMaster}
        onClose={() =>
          setOpen(false)
        }
      />
    )}
  </>
);

  // return (
  //   <>
  //     <div className="flex gap-4 mt-4 flex-col lg:flex-row">
  //       {/* TOTAL */}
  //       <div className={cardClass}>
  //         <Wallet className="text-blue-600" />
  //         <div>
  //           <p className="text-xs text-gray-500">Total Fees</p>
  //           <p className="font-semibold">GHS {total.toFixed(2)}</p>
  //         </div>
  //       </div>

  //       {/* PAID */}
  //       <div className={cardClass}>
  //         <ArrowDownCircle className="text-green-600" />
  //         <div>
  //           <p className="text-xs text-gray-500">Paid</p>
  //           <p className="font-semibold">GHS {paid.toFixed(2)}</p>
  //         </div>
  //       </div>

  //       {/* BALANCE */}
  //       <div
  //         className={`flex-1 rounded-lg p-4 flex items-center gap-4 cursor-pointer ${balanceColor}`}
  //         onClick={() => setOpen(true)}
  //       >
  //         <Scale />
  //         <div>
  //           <p className="text-xs">Balance</p>
  //           <p className="font-semibold">GHS {balance.toFixed(2)}</p>
  //           <p className="text-[11px] font-medium">{status}</p>
  //         </div>
  //       </div>
  //     </div>

  //     {open && feeMaster && (
  //       <FeeHistoryModal feeMaster={feeMaster} onClose={() => setOpen(false)} />
  //     )}
  //   </>
  // );
};

export default StudentFeeCards;
