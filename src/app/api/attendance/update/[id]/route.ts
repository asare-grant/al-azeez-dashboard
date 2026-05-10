// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { sessionClaims, userId } = await auth();
//   const role = (sessionClaims?.metadata as { role?: string })?.role;

//   const { present } = await req.json();
//   const id = Number(params.id);

//   if (role !== "admin") {
//     const record = await prisma.attendance.findUnique({
//       where: { id },
//       include: { student: { include: { class: true } } },
//     });

//     if (record?.student.class.supervisorId !== userId) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }
//   }

//   const updated = await prisma.attendance.update({
//     where: { id },
//     data: { present },
//   });

//   return NextResponse.json(updated);
// }



import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { sessionClaims, userId } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    const { id } = await context.params;
    const attendanceId = Number(id);

    if (!attendanceId || Number.isNaN(attendanceId)) {
      return NextResponse.json(
        { error: "Invalid attendance ID" },
        { status: 400 }
      );
    }

    const { present } = await req.json();

    if (typeof present !== "boolean") {
      return NextResponse.json(
        { error: "Invalid attendance value" },
        { status: 400 }
      );
    }

    if (role !== "admin") {
      const record = await prisma.attendance.findUnique({
        where: { id: attendanceId },
        include: {
          student: {
            include: {
              class: true,
            },
          },
        },
      });

      if (!record) {
        return NextResponse.json(
          { error: "Attendance record not found" },
          { status: 404 }
        );
      }

      if (record.student.class.supervisorId !== userId) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: { present },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Attendance update error:", error);

    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}