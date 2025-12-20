"use client";

import { Download } from "lucide-react";

const FeeStatementButton = ({ feeMasterId }: { feeMasterId: number }) => {
  return (
    <a
      href={`/api/fees/parentStatement?feeMasterId=${feeMasterId}`}
      target="_blank"
      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mt-4"
    >
      <Download size={16} />
      Download Fee Statement (PDF)
    </a>
  );
};

export default FeeStatementButton;
