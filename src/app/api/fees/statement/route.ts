// /app/api/fees/statement/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateFeeStatementPDF } from "@/lib/pdf/generateFeeStatement";

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

    const studentId = searchParams.get("studentId");
    const rawTerm = searchParams.get("term");
    const academicYear = searchParams.get("academicYear");

    if (!studentId || !rawTerm) {
      return NextResponse.json(
        { error: "studentId and term required" },
        { status: 400 }
      );
    }

    const term = normalizeTerm(rawTerm);

    const feeMaster = await prisma.feeMaster.findFirst({
      where: {
        studentId,
        term,
        ...(academicYear ? { academicYear } : {}),
      },
      include: {
        student: {
          include: {
            class: true,
            grade: true,
          },
        },
        payments: true,
        details: {
          include: {
            structure: {
              include: {
                type: true,
                class: true,
                grade: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!feeMaster) {
      return NextResponse.json(
        {
          error: "No fee record found",
          searchedFor: {
            studentId,
            term,
            academicYear: academicYear ?? "not provided",
          },
        },
        { status: 404 }
      );
    }

    const pdfBuffer = await generateFeeStatementPDF(feeMaster);

    const filename = `fee-statement-${feeMaster.student.name}-${feeMaster.student.surname}-${feeMaster.term}-${feeMaster.academicYear}.pdf`
      .replace(/\s+/g, "_")
      .replace(/[\/\\:*?"<>|]/g, "-");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Single fee statement error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate fee statement",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}