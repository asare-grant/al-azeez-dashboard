// /components/fee-master/FeeMasterTable.tsx
// "use client";

import Table from "@/components/Table";
import dynamic from "next/dynamic";
import React from "react";
import { FeeMaster, Student } from "@prisma/client";

// dynamic import of server component FormContainer
const FormContainer = dynamic(() => import("@/components/FormContainer"));

type FeeMasterList = FeeMaster & { student: Student };

export default function FeeMasterTable({
  data,
  role,
}: {
  data: FeeMasterList[];
  role: string;
}) {
  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Term", accessor: "term", className: "hidden lg:table-cell" },
    { header: "Academic Year", accessor: "academicYear", className: "hidden lg:table-cell" },
    { header: "Total Amount", accessor: "totalAmount" },
    { header: "Status", accessor: "status", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: FeeMasterList) => {
    
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
      >
        <td className="p-4">
          {item.student.name} {item.student.surname}
        </td>
        <td className = "hidden lg:table-cell" >{item.term}</td>
        <td className = "hidden lg:table-cell" >{item.academicYear}</td>
        <td>{item.totalAmount.toFixed(2)}</td>
        <td className = "hidden lg:table-cell" >{item.status}</td>

        {role === "admin" && (
          <td className="p-2 flex gap-2 items-center">
            {/* update / delete / create payment */}
            <FormContainer table="fee-master" type="update" data={item} />
            <FormContainer table="fee-master" type="delete" id={item.id} />
            <FormContainer
              table="fee-payment"
              type="create"
              relatedData={{ masterId: item.id }}
            />
          </td>
        )}
      </tr>
    );
  };

  return <Table columns={columns} renderRow={renderRow} data={data} />;
}
