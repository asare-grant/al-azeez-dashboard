// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     let { studentId, date, present, day } = body;

//     // === 1. Validate required fields ===
//     if (!studentId || !date || present === undefined || day === undefined) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     // === 2. Sanitize studentId ===
//     studentId = String(studentId).replace(/\0/g, "").trim();
//     if (studentId.length === 0) {
//       return NextResponse.json(
//         { error: "Invalid studentId" },
//         { status: 400 }
//       );
//     }

//     // === 3. Validate date ===
//     const attendanceDate = new Date(date);
//     if (!(attendanceDate instanceof Date) || isNaN(attendanceDate.getTime())) {
//       return NextResponse.json(
//         { error: "Invalid date format" },
//         { status: 400 }
//       );
//     }

//     // === 4. Validate present ===
//     if (typeof present !== "boolean") {
//       return NextResponse.json(
//         { error: "Invalid value for present" },
//         { status: 400 }
//       );
//     }

//     // === 5. Validate day ===
//     day = Number(day);
//     if (!Number.isInteger(day) || day < 1 || day > 31) {
//       return NextResponse.json(
//         { error: "Invalid day value" },
//         { status: 400 }
//       );
//     }

//     // === 6. Log the sanitized values ===
//     console.log("Creating attendance:", {
//       studentId,
//       date: attendanceDate.toISOString(),
//       present,
//       day,
//     });

//     // === 7. Create attendance record ===
//     const attendance = await prisma.attendance.create({
//       data: {
//         studentId,
//         date: attendanceDate,
//         present,
//         day,
//       },
//     });

//     return NextResponse.json(attendance, { status: 201 });
//   } catch (err) {
//     console.error("CREATE ATTENDANCE ERROR:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }





// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     let { studentId, date, present, day } = body;

//     // normalize checkbox value
//     present = present === true || present === "true" || present === 1;

//     if (!studentId || !date || day === undefined) {
//       return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//     }

//     studentId = String(studentId).trim();

//     const attendanceDate = new Date(date);
//     if (isNaN(attendanceDate.getTime())) {
//       return NextResponse.json({ error: "Invalid date" }, { status: 400 });
//     }

//     const attendance = await prisma.attendance.create({
//       data: {
//         studentId,
//         date: attendanceDate,
//         present,
//         day: Number(day),
//       },
//     });

//     return NextResponse.json(attendance, { status: 201 });
//   } catch (err) {
//     console.error("CREATE ATTENDANCE ERROR:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }




import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { studentId, date, present, day } = await req.json();

  if (role !== "admin") {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (student?.class.supervisorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const attendance = await prisma.attendance.create({
    data: { studentId, date: new Date(date), present, day },
  });

  return NextResponse.json(attendance, { status: 201 });
}
