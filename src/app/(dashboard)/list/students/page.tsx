// import FormContainer from "@/components/FormContainer";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import prisma from "@/lib/prisma";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { Class, Prisma, Student } from "@prisma/client";
// import Image from "next/image";
// import Link from "next/link";
// import { auth } from "@clerk/nextjs/server";

// export const revalidate = 0; // ✅ Disable caching

// type StudentList = Student & { class: Class };

// export default async function StudentListPage(props: {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// }) {
//   // ✅ Fix for Next.js 15 — unwrap searchParams
//   const searchParams = await props.searchParams;

//   const { sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const columns = [
//     { header: "Info", accessor: "info" },
//     { header: "Student Type", accessor: "studentType", className: "hidden md:table-cell" },
//     { header: "Boarding Type", accessor: "boardingtype", className: "hidden md:table-cell" },
//     { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
//     { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
//     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
//   ];

//   const renderRow = (item: StudentList) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
//     >
//       <td className="flex items-center gap-4 p-4">
//         <Image
//           src={item.img || "/noAvatar.png"}
//           alt=""
//           width={40}
//           height={40}
//           className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
//         />
//         <div className="flex flex-col">
//           <h3 className="font-semibold">{item.name} {item.surname}</h3>
//           <p className="text-xs text-gray-500">{item.class.name}</p>
//         </div>
//       </td>
//       <td className="hidden md:table-cell">{item.studentType}</td>
//       <td className="hidden md:table-cell">{item.boardingType}</td>
//       <td className="hidden md:table-cell">{item.phone}</td>
//       <td className="hidden md:table-cell">{item.address}</td>
//       <td>
//         <div className="flex items-center gap-2">
//           <Link href={`/list/students/${item.id}`}>
//             <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#C3EBFA]">
//               <Image src="/view.png" alt="" width={16} height={16} />
//             </button>
//           </Link>
//           {role === "admin" && (
//             <FormContainer table="student" type="delete" id={item.id} />
//           )}
//         </div>
//       </td>
//     </tr>
//   );

//   // ✅ Extract and parse pagination
//   const { page, ...queryParams } = searchParams;
//   const p = page ? parseInt(page as string) : 1;
//   console.log("Rendering student page:", p);

//   // ✅ Build dynamic Prisma query
//   const query: Prisma.StudentWhereInput = {};

//   for (const [key, value] of Object.entries(queryParams)) {
//     if (value !== undefined) {
//       switch (key) {
//         case "teacherId":
//           query.class = {
//             lessons: {
//               some: {
//                 teacherId: value as string,
//               },
//             },
//           };
//           break;
//         case "search":
//           query.OR = [
//             {name: { contains: value as string, mode: "insensitive" }},
//             {studentType: { contains: value as string, mode: "insensitive" }},
//             {boardingType: { contains: value as string, mode: "insensitive"}},
//             {class: { name: { contains: value as string, mode: "insensitive" }}},
//           ];
//           break;
//         default:
//           break;
//       }
//     }
//   }

//   // ✅ Fetch paginated results
//   const [data, count] = await prisma.$transaction([
//     prisma.student.findMany({
//       where: query,
//       include: { class: true },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (p - 1),
//     }),
//     prisma.student.count({ where: query }),
//   ]);

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch />
//           <div className="flex items-center gap-4 self-end">
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
//               <Image src="/filter.png" alt="" width={14} height={14} />
//             </button>
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
//               <Image src="/sort.png" alt="" width={14} height={14} />
//             </button>
//             {role === "admin" && (
//               <FormContainer table="student" type="create" />
//             )}
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


import FormContainer from "@/components/FormContainer";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FinancePagination from "@/components/FinancePagination"; // ✅ Use Finance Pagination
import prisma from "@/lib/prisma";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export const revalidate = 0;

type StudentList = Student & { class: Class };

export default async function StudentListPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // -----------------------
  // Extract pagination
  // -----------------------
  const { page, limit, ...queryParams } = searchParams;

  const p = page ? Number(page) : 1;
  const perPage = limit ? Number(limit) : 10; // default 10, just like Finance Dashboard

  // -----------------------
  // Build dynamic query
  // -----------------------
  const query: Prisma.StudentWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "teacherId":
        query.class = {
          lessons: {
            some: {
              teacherId: value as string,
            },
          },
        };
        break;

      case "search":
        query.OR = [
          { name: { contains: value as string, mode: "insensitive" } },
          { surname: { contains: value as string, mode: "insensitive" } },
          { studentType: { contains: value as string, mode: "insensitive" } },
          { boardingType: { contains: value as string, mode: "insensitive" } },
          { class: { name: { contains: value as string, mode: "insensitive" } } },
        ];
        break;

      default:
        break;
    }
  }

  // -----------------------
  // Fetch paginated results
  // -----------------------
  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: { class: true },
      take: perPage,
      skip: perPage * (p - 1),
      orderBy: { id: "desc" },
    }),
    prisma.student.count({ where: query }),
  ]);

  // -----------------------
  // Table setup
  // -----------------------
  const columns = [
    { header: "Info", accessor: "info" },
    {
      header: "Student Type",
      accessor: "studentType",
      className: "hidden md:table-cell",
    },
    {
      header: "Boarding Type",
      accessor: "boardingType",
      className: "hidden md:table-cell",
    },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: StudentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-[#F1F0FF]"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.name} {item.surname}
          </h3>
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>

      <td className="hidden md:table-cell">{item.studentType}</td>
      <td className="hidden md:table-cell">{item.boardingType}</td>
      <td className="hidden lg:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.address}</td>

      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
            <Link href={`/list/students/${item.id}`}>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-[#C3EBFA]">
                <Image src="/view.png" alt="" width={16} height={16} />
              </button>
            </Link>

            <FormContainer table="student" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // -----------------------
  // Page UI
  // -----------------------
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C]">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>

            {role === "admin" && <FormContainer table="student" type="create" />}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION — SAME AS FINANCE DASHBOARD */}
      <FinancePagination page={p} count={count} limit={perPage} />
    </div>
  );
}
