"use client";

import { useState } from "react";
import { Download } from "lucide-react";

const FeeStatementForm = ({ studentId }: { studentId: string }) => {
  const [term, setTerm] = useState("FIRST");

  return (
    <div className="bg-cyan-200 p-4 rounded-md border">
      <h3 className="font-semibold mb-3">Generate Fee Statement</h3>

      <select
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="border rounded-md p-2 w-full mb-4 border-amber-50"
      >
        <option value="FIRST">First Term</option>
        <option value="SECOND">Second Term</option>
        <option value="THIRD">Third Term</option>
      </select>

      <a
        href={`/api/fees/statement?studentId=${studentId}&term=${term}`}
        target="_blank"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        <Download size={16} />
        Download Statement
      </a>
    </div>
  );
};

export default FeeStatementForm;
