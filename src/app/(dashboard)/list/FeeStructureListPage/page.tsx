// import FormContainer from "@/components/FormContainer";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import prisma from "@/lib/prisma";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { FeeStructure, Class, Grade, FeeType, Prisma } from "@prisma/client";
// import Image from "next/image";
// import { auth } from "@clerk/nextjs/server";

// export const revalidate = 0; // Disable caching

// type FeeStructureList = FeeStructure & {
//   class?: Class | null;
//   grade?: Grade | null;
//   type: FeeType;
// };

// export default async function FeeStructureListPage(props: {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// }) {
//   const searchParams = await props.searchParams;
//   const { sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const columns = [
//     { header: "Fee Type", accessor: "type" },
//     { header: "Amount", accessor: "amount", className: "hidden md:table-cell" },
//     { header: "Student Type", accessor: "studentType", className: "hidden md:table-cell" },
//     { header: "Boarding Type", accessor: "boardingType", className: "hidden md:table-cell" },
//     { header: "Class", accessor: "class", className: "hidden md:table-cell" },
//     { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
//     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
//   ];

//   const renderRow = (item: FeeStructureList) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
//     >
//       <td className="p-4">{item.type?.name}</td>
//       <td className="hidden md:table-cell">{item.amount}</td>
//       <td className="hidden md:table-cell">{item.studentType}</td>
//       <td className="hidden md:table-cell">{item.boardingType}</td>
//       <td className="hidden md:table-cell">{item.class?.name ?? "-"}</td>
//       <td className="hidden md:table-cell">{item.grade?.level ?? "-"}</td>
//       <td>
//         <div className="flex items-center gap-2">
//           {role === "admin" && (
//             <>
//               <FormContainer table="feeStructure" type="update" data={item} />
//               <FormContainer table="feeStructure" type="delete" id={item.id} />
//             </>
//           )}
//         </div>
//       </td>
//     </tr>
//   );

//   // Pagination
//   const { page, ...queryParams } = searchParams;
//   const p = page ? parseInt(page as string) : 1;

//   // Build Prisma query with search
//   const query: Prisma.FeeStructureWhereInput = {};
//   if (queryParams.search) {
//     query.OR = [
//       { type: { name: { contains: queryParams.search as string, mode: "insensitive" } } },
//       { class: { name: { contains: queryParams.search as string, mode: "insensitive" } } },
//     ];
//   }

//   // Fetch paginated results
//   const [data, count] = await prisma.$transaction([
//     prisma.feeStructure.findMany({
//       where: query,
//       include: { type: { include: { category: true } }, class: true, grade: true },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (p - 1),
//       orderBy: { id: "desc" },
//     }),
//     prisma.feeStructure.count({ where: query }),
//   ]);

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">Fee Structures</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch />
//           <div className="flex items-center gap-4 self-end">
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
//               <Image src="/filter.png" alt="" width={14} height={14} />
//             </button>
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
//               <Image src="/sort.png" alt="" width={14} height={14} />
//             </button>
//             {role === "admin" && <FormContainer table="feeStructure" type="create" />}
//           </div>
//         </div>
//       </div>

//       {/* LIST */}
//       <Table columns={columns} renderRow={renderRow} data={data} />

//       {/* PAGINATION */}
//       <Pagination page={p} count={count} />
//     </div>
//   );
// }

import React from 'react'

const FeeStructureListPage = () => {
  return (
    <div>FeeStructureListPage</div>
  )
}

export default FeeStructureListPage