// import { auth } from "@clerk/nextjs/server";
// import prisma from "@/lib/prisma";
// import AttendanceTable from "@/components/AttendanceTable";

// export const revalidate = 0;

// const AttendanceListPage = async () => {
//   const { sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const classes = await prisma.class.findMany({ orderBy: { name: "asc" } });
//   const students = await prisma.student.findMany({
//     include: { class: true },
//     orderBy: { name: "asc" },
//   });

//   return (
//     <div className="p-4 m-4 mt-0 rounded-md bg-white">
//       <h2 className="text-2xl font-bold">Attendance</h2>
//       <AttendanceTable students={students} classes={classes} />
//     </div>
//   );
// };

// export default AttendanceListPage;





import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import AttendanceTable from "@/components/AttendanceTable";

export const revalidate = 0;

const AttendanceListPage = async () => {
  const { sessionClaims, userId } = await auth();

  const role =
    (sessionClaims?.metadata as { role?: "admin" | "teacher" })?.role ??
    "teacher";

  /**
   * Fetch classes
   * supervisorId is intentionally `string | null`
   * to match Prisma's generated types
   */
  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      supervisorId: true,
    },
    orderBy: { name: "asc" },
  });

  /**
   * Fetch students
   */
  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      classId: true,
    },
    orderBy: { name: "asc" },
  });

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return (
    <div className="p-4 m-4 mt-0 rounded-md bg-white">
      <h2 className="text-2xl font-bold">Attendance</h2>

      <AttendanceTable
        students={students}
        classes={classes}
        role={role}
        userId={userId}
      />
    </div>
  );
};

export default AttendanceListPage;
