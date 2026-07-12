// import { auth } from "@clerk/nextjs/server";
// import prisma from "@/lib/prisma";
// import FeedingFeeTable from "@/components/FeedingFeeTable";

// export const revalidate = 0;

// const FeedingFeePage = async () => {
//   const { userId } = await auth();

//   if (!userId) {
//     throw new Error("Unauthorized");
//   }

//   const classes = await prisma.class.findMany({
//     select: {
//       id: true,
//       name: true,
//     },
//     orderBy: { name: "asc" },
//   });

//   const students = await prisma.student.findMany({
//     where: {
//       boardingType: "day",
//     },
//     select: {
//       id: true,
//       name: true,
//       surname: true,
//       classId: true,
//       boardingType: true,
//     },
//     orderBy: { name: "asc" },
//   });

//   const feedingStudents = await prisma.feedingFeeStudent.findMany({
//     select: {
//       studentId: true,
//     },
//   });

//   return (
//     <div className="m-4 mt-0 rounded-md bg-white p-4">
//       <h2 className="text-2xl font-bold">Feeding Fee</h2>

//       <FeedingFeeTable
//         classes={classes}
//         students={students}
//         feedingStudents={feedingStudents}
//       />
//     </div>
//   );
// };

// export default FeedingFeePage;



import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import FeedingFeeTable from "@/components/FeedingFeeTable";

export const revalidate = 0;

const FeedingFeePage = async () => {
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
    where: {
      boardingType: "day",
    },
    select: {
      id: true,
      name: true,
      surname: true,
      classId: true,
      boardingType: true,
    },
    orderBy: { name: "asc" },
  });

  const feedingStudents = await prisma.feedingFeeStudent.findMany({
    select: {
      studentId: true,
    },
  });

  return (
    <div className="m-4 mt-0 rounded-md bg-white p-4">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Feeding Fee</h2>

        <Link
          href="/list/feeding-fees/dashboard"
          className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Dashboard
        </Link>
      </div>

      <FeedingFeeTable
        classes={classes}
        students={students}
        feedingStudents={feedingStudents}
      />
    </div>
  );
};

export default FeedingFeePage;