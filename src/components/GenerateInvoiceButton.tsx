"use client";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const GenerateInvoiceButton = ({
  studentId,
  term,
  academicYear,
}: {
  studentId: string;
  term: string;
  academicYear: string;
}) => {
  const router = useRouter();

  const handleGenerate = async () => {
    try {
      const res = await fetch("/api/fee/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, term, academicYear }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Invoice generated successfully!");
        router.refresh(); // refresh the page to show new invoice
      } else {
        toast.error(data.error || "Failed to generate invoice");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <button
      onClick={handleGenerate}
      className="bg-green-400 text-white px-3 py-1 rounded-md text-sm"
    >
      Generate Invoice
    </button>
  );
};

export default GenerateInvoiceButton;
