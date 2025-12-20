"use client";

import { Wallet, ArrowDownCircle, Scale } from "lucide-react";
import { useState } from "react";
import FeeHistoryModal from "./FeeHistoryModal";

// 🔹 Optional helper (client-side)
const getFeeStatus = (total: number, paid: number) => {
  if (paid >= total) return "PAID";
  if (paid > 0) return "PARTIAL";
  return "PENDING";
};

const StudentFeeCards = ({
  total,
  paid,
  balance,
  feeMaster,
}: {
  total: number;
  paid: number;
  balance: number;
  feeMaster: any;
}) => {
  const [open, setOpen] = useState(false);

  const status = getFeeStatus(total, paid);

  const balanceColor =
    status === "PAID"
      ? "bg-green-100 text-green-700"
      : status === "PARTIAL"
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700";

  const cardClass =
    "flex-1 bg-gray-50 rounded-lg p-4 flex items-center gap-4";

  return (
    <>
      <div className="flex gap-4 mt-4 flex-col lg:flex-row">
        {/* TOTAL */}
        <div className={cardClass}>
          <Wallet className="text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Total Fees</p>
            <p className="font-semibold">
              GHS {total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* PAID */}
        <div className={cardClass}>
          <ArrowDownCircle className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Paid</p>
            <p className="font-semibold">
              GHS {paid.toFixed(2)}
            </p>
          </div>
        </div>

        {/* BALANCE */}
        <div
          className={`flex-1 rounded-lg p-4 flex items-center gap-4 cursor-pointer ${balanceColor}`}
          onClick={() => setOpen(true)}
        >
          <Scale />
          <div>
            <p className="text-xs">Balance</p>
            <p className="font-semibold">
              GHS {balance.toFixed(2)}
            </p>
            <p className="text-[11px] font-medium">{status}</p>
          </div>
        </div>
      </div>

      {open && feeMaster && (
        <FeeHistoryModal
          feeMaster={feeMaster}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default StudentFeeCards;
