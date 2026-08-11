// /app/api/fees/report/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const normalizeTerm = (term: string) => {
  switch (term.toUpperCase()) {
    case "FIRST":
      return "First Term";
    case "SECOND":
      return "Second Term";
    case "THIRD":
      return "Third Term";
    default:
      return term;
  }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rawTerm = searchParams.get("term");
    const academicYear = searchParams.get("academicYear");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!rawTerm || !academicYear) {
      return NextResponse.json(
        { error: "term and academicYear required" },
        { status: 400 },
      );
    }

    const term = normalizeTerm(rawTerm);

    const feeMasters = await prisma.feeMaster.findMany({
      where: { term, academicYear },
      include: {
        payments: true,
        student: true,
      },
      orderBy: { id: "desc" },
    });

    let totalFees = 0;
    let totalPaid = 0;

    const studentsOwingAll = feeMasters
      .map((fm) => {
        const paid = fm.payments.reduce((s, p) => s + p.amount, 0);
        const balance = fm.totalAmount - paid;

        totalFees += fm.totalAmount;
        totalPaid += paid;

        return {
          feeMasterId: fm.id,

          studentId: fm.studentId,

          student: `${fm.student.name} ${fm.student.surname}`,

          balance,
        };
      })
      .filter((item) => item.balance > 0);

    const studentsOwing = studentsOwingAll.slice(
      (page - 1) * limit,
      page * limit,
    );

    return NextResponse.json({
      term,
      academicYear,
      totalFees,
      totalPaid,
      outstanding: totalFees - totalPaid,
      collectionRate:
        totalFees === 0 ? 0 : Math.round((totalPaid / totalFees) * 100),
      studentsOwing,
      totalStudents: studentsOwingAll.length,
    });
  } catch (error) {
    console.error("Finance report error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate finance report",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
