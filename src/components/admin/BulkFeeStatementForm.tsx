"use client";

import { Download } from "lucide-react";
import { useState } from "react";

const BulkFeeStatementForm = () => {
  const [term, setTerm] = useState("FIRST");
  const [year, setYear] = useState("2024/2025");

  return (
    <div className="flex flex-col self-center bg-amber-100 p-4 rounded-md border w-full lg:w-[50%]">
      <h3 className="font-semibold mb-4">Bulk Fee Statements</h3>

      <select
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="border rounded-md p-2 w-full mb-3 border-gray-300"
      >
        <option value="FIRST">First Term</option>
        <option value="SECOND">Second Term</option>
        <option value="THIRD">Third Term</option>
      </select>

      <input
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className="border rounded-md p-2 w-full mb-4 border-gray-300"
        placeholder="Academic Year e.g. 2024/2025"
      />

      <a
        // href={`/api/fees/bulk-statement?term=${term}&academicYear=${year}`}
        href={`/api/fees/bulk-statement?term=${term}&academicYear=${encodeURIComponent(year)}`}
        target="_blank"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        <Download size={16} />
        Download ZIP
      </a>
    </div>
  );
};

export default BulkFeeStatementForm;
