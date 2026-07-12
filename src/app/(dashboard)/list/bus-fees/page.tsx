import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import BusFeeTable from "@/components/BusFeeTable";

export const revalidate = 0;

const BusFeePage = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      classId: true,
      boardingType: true,
    },
    orderBy: { name: "asc" },
  });

  const busStudents = await prisma.busFeeStudent.findMany({
    select: {
      studentId: true,
    },
  });

  return (
    <div className="m-4 mt-0 rounded-md bg-white p-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Bus Fee</h2>

        <Link
          href="/list/bus-fees/dashboard"
          className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Dashboard
        </Link>
      </div>

      <BusFeeTable
        classes={classes}
        students={students}
        busStudents={busStudents}
      />
    </div>
  );
};

export default BusFeePage;