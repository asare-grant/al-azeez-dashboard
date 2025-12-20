// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function PUT(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const body = await req.json();
//     let { studentId, date, present, day } = body;
//     const { id } = params;

//     if (!studentId || !date || present === undefined || day === undefined) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     studentId = String(studentId).replace(/\0/g, "").trim();
//     const attendanceDate = new Date(date);
//     if (isNaN(attendanceDate.getTime())) {
//       return NextResponse.json({ error: "Invalid date" }, { status: 400 });
//     }

//     const attendance = await prisma.attendance.update({
//       where: { id: Number(id) },
//       data: {
//         studentId,
//         date: attendanceDate,
//         present: Boolean(present),
//         day: Number(day),
//       },
//     });

//     return NextResponse.json(attendance);
//   } catch (err) {
//     console.error("UPDATE ATTENDANCE ERROR:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }



// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const body = await req.json();
//     const id = Number(params.id);

//     if (Number.isNaN(id)) {
//       return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
//     }

//     const updateData: any = {};

//     if (body.present !== undefined) {
//       updateData.present =
//         body.present === true || body.present === "true" || body.present === 1;
//     }

//     if (Object.keys(updateData).length === 0) {
//       return NextResponse.json(
//         { error: "Nothing to update" },
//         { status: 400 }
//       );
//     }

//     const attendance = await prisma.attendance.update({
//       where: { id },
//       data: updateData,
//     });

//     return NextResponse.json(attendance);
//   } catch (err) {
//     console.error("UPDATE ATTENDANCE ERROR:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }



import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { present } = await req.json();
  const id = Number(params.id);

  if (role !== "admin") {
    const record = await prisma.attendance.findUnique({
      where: { id },
      include: { student: { include: { class: true } } },
    });

    if (record?.student.class.supervisorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated = await prisma.attendance.update({
    where: { id },
    data: { present },
  });

  return NextResponse.json(updated);
}
