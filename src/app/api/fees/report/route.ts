// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const term = searchParams.get("term");
//   const academicYear = searchParams.get("academicYear");

//   if (!term || !academicYear) {
//     return NextResponse.json(
//       { error: "term and academicYear required" },
//       { status: 400 }
//     );
//   }

//   const feeMasters = await prisma.feeMaster.findMany({
//     where: { term, academicYear },
//     include: {
//       payments: true,
//       student: true,
//     },
//   });

//   let totalFees = 0;
//   let totalPaid = 0;

//   const studentBalances = feeMasters.map((fm) => {
//     const paid = fm.payments.reduce((s, p) => s + p.amount, 0);
//     totalFees += fm.totalAmount;
//     totalPaid += paid;

//     return {
//       student: `${fm.student.name} ${fm.student.surname}`,
//       total: fm.totalAmount,
//       paid,
//       balance: fm.totalAmount - paid,
//     };
//   });

//   return NextResponse.json({
//     term,
//     academicYear,
//     totalFees,
//     totalPaid,
//     outstanding: totalFees - totalPaid,
//     collectionRate:
//       totalFees === 0 ? 0 : Math.round((totalPaid / totalFees) * 100),
//     studentsOwing: studentBalances.filter((s) => s.balance > 0),
//   });
// }



import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const term = searchParams.get("term");
  const academicYear = searchParams.get("academicYear");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!term || !academicYear) {
    return NextResponse.json(
      { error: "term and academicYear required" },
      { status: 400 }
    );
  }

  // -----------------------------
  // TOTALS: total fees and paid for all students in this term/year
  // -----------------------------
  const feeMasters = await prisma.feeMaster.findMany({
    where: { term, academicYear },
    include: { payments: true },
  });

  let totalFees = 0;
  let totalPaid = 0;

  feeMasters.forEach((fm) => {
    const paid = fm.payments.reduce((s, p) => s + p.amount, 0);
    totalFees += fm.totalAmount;
    totalPaid += paid;
  });

  // -----------------------------
  // Fetch students owing with pagination (database-level)
  // -----------------------------
  // First, get IDs of all feeMasters with balance > 0
  const owingFeeMasters = await prisma.feeMaster.findMany({
    where: { term, academicYear },
    include: { payments: true },
  });

  const owingIds = owingFeeMasters
    .filter((fm) => {
      const paid = fm.payments.reduce((s, p) => s + p.amount, 0);
      return paid < fm.totalAmount;
    })
    .map((fm) => fm.id);

  // Paginate directly by IDs
  const paginatedFeeMasters = await prisma.feeMaster.findMany({
    where: { id: { in: owingIds } },
    include: { payments: true, student: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: "desc" },
  });

  const studentsOwing = paginatedFeeMasters.map((fm) => {
    const paid = fm.payments.reduce((s, p) => s + p.amount, 0);
    return {
      student: `${fm.student.name} ${fm.student.surname}`,
      balance: fm.totalAmount - paid,
    };
  });

  return NextResponse.json({
    term,
    academicYear,
    totalFees,
    totalPaid,
    outstanding: totalFees - totalPaid,
    collectionRate: totalFees === 0 ? 0 : Math.round((totalPaid / totalFees) * 100),
    studentsOwing,
    totalStudents: owingIds.length, // for pagination
  });
}

