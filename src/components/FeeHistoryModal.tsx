"use client";

import { X } from "lucide-react";
import FeeStatementButton from "./FeeStatementButton";

const FeeHistoryModal = ({
  feeMaster,
  onClose,
}: {
  feeMaster: any;
  onClose: () => void;
}) => {
  const paid = feeMaster.payments.reduce(
    (sum: number, p: any) => sum + p.amount,
    0
  );

  const balance = feeMaster.totalAmount - paid;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-md w-[90%] md:w-[600px] p-6 relative">
        <button
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-4">
          Fee Payment History
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Total</p>
            <p className="font-semibold">
              GHS {feeMaster.totalAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Paid</p>
            <p className="font-semibold">
              GHS {paid.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Balance</p>
            <p className="font-semibold text-red-600">
              GHS {balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Method</th>
              </tr>
            </thead>
            <tbody>
              {feeMaster.payments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-gray-500">
                    No payments recorded
                  </td>
                </tr>
              ) : (
                feeMaster.payments.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      GHS {p.amount.toFixed(2)}
                    </td>
                    <td className="p-2">{p.method}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <FeeStatementButton feeMasterId={feeMaster.id} />
      </div>
    </div>
  );
};

export default FeeHistoryModal;
