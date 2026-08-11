// src/app/api/fees/parentStatement/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateFeeStatementPDF } from "@/lib/pdf/generateFeeStatement";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const feeMasterId = searchParams.get("feeMasterId");

    if (!feeMasterId) {
      return NextResponse.json(
        { error: "Missing feeMasterId" },
        { status: 400 }
      );
    }

    const feeMaster = await prisma.feeMaster.findUnique({
      where: {
        id: Number(feeMasterId),
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
    });

    if (!feeMaster) {
      return NextResponse.json(
        { error: "Fee record not found" },
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
    console.error("Parent fee receipt error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate parent fee receipt",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}