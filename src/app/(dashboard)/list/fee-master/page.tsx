// /app/(dashboard)/list/fee-master/page.tsx
// Server component — NO "use client"
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Pagination from "@/components/Pagination";
import FeeMasterHeader from "@/components/fee-master/FeeMasterHeader";
import FeeMasterTable from "@/components/fee-master/FeeMasterTable";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, FeeMaster, Student } from "@prisma/client";

export const revalidate = 0;

type FeeMasterList = FeeMaster & {
  student: Student;
};

export default async function FeeMasterListPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  // Server-side auth
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "";

  // pagination + searcH
  const { page, search } = searchParams;
  const p = page ? parseInt(page as string, 10) : 1;

  const query: Prisma.FeeMasterWhereInput = {};
  if (search) {
    query.OR = [
      {
        student: {
          name: { contains: search as string, mode: "insensitive" },
        },
      },
      {
        student: {
          surname: { contains: search as string, mode: "insensitive" },
        },
      },
      {
        term: { contains: search as string, mode: "insensitive" },
      },
      {
        academicYear : { contains: search as string, mode: "insensitive"}
      },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.feeMaster.findMany({
      where: query,
      include: { student: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.feeMaster.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header (client) */}
      <FeeMasterHeader role={role} />

      {/* Table (client) */}
      <FeeMasterTable role={role} data={data as FeeMasterList[]} />

      {/* Pagination (server-rendered) */}
      <Pagination page={p} count={count} />
    </div>
  );
}
