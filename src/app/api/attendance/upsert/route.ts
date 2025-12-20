// // app/api/attendance/upsert/route.ts
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function POST(req: Request) {
//   const { sessionClaims, userId } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const { studentId, date, present, day } = await req.json();
//   const parsedDate = new Date(date);

//   if (role !== "admin") {
//     const student = await prisma.student.findUnique({
//       where: { id: studentId },
//       include: { class: true },
//     });

//     if (student?.class.supervisorId !== userId) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }
//   }

//   const attendance = await prisma.attendance.upsert({
//     where: {
//       studentId_date: {
//         studentId,
//         date: parsedDate,
//       },
//     },
//     update: { present },
//     create: { studentId, date: parsedDate, present, day },
//   });

//   return NextResponse.json(attendance);
// }



import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { studentId, date, day, present } = await req.json();

  // Check permissions for non-admin
  if (role !== "admin") {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (student?.class.supervisorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Upsert attendance: either update existing or create new
  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_date: { studentId, date: new Date(date) },
    },
    update: { present },
    create: { studentId, date: new Date(date), day, present },
  });

  return NextResponse.json(attendance, { status: 200 });
}
