// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import moment from "moment";

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);

//     const classId = searchParams.get("classId");
//     const month = searchParams.get("month"); // MM/YYYY

//     if (!month) {
//       return NextResponse.json(
//         { error: "Month is required (MM/YYYY)" },
//         { status: 400 }
//       );
//     }

//     const startDate = moment(month, "MM/YYYY").startOf("month").toDate();
//     const endDate = moment(month, "MM/YYYY").endOf("month").toDate();

//     const attendance = await prisma.attendance.findMany({
//       where: {
//         date: {
//           gte: startDate,
//           lte: endDate,
//         },
//         ...(classId && {
//           student: { classId: Number(classId) }
//         }),
//       },
//       include: {
//         student: {
//           include: { class: true }
//         }
//       },
//       orderBy: { date: "asc" },
//     });

//     return NextResponse.json({ data: attendance });
//   } catch (err) {
//     console.log("ATTENDANCE LIST ERROR:", err);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import moment from "moment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const month = searchParams.get("month");

  const start = moment(month!, "MM/YYYY").startOf("month").toDate();
  const end = moment(month!, "MM/YYYY").endOf("month").toDate();

  const attendance = await prisma.attendance.findMany({
    where: {
      date: { gte: start, lte: end },
      ...(classId && { student: { classId: Number(classId) } }),
    },
  });

  return NextResponse.json({ data: attendance });
}
