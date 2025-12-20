import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import JSZip from "jszip";
import { generateFeeStatementPDF } from "@/lib/pdf/generateFeeStatement";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const term = searchParams.get("term");
  const academicYear = searchParams.get("academicYear");

  if (!term || !academicYear) {
    return NextResponse.json(
      { error: "term and academicYear required" },
      { status: 400 }
    );
  }

  const feeMasters = await prisma.feeMaster.findMany({
    where: { term, academicYear },
    include: {
      student: true,
      payments: true,
    },
  });

  if (feeMasters.length === 0) {
    return NextResponse.json(
      { error: "No fee records found" },
      { status: 404 }
    );
  }

  const zip = new JSZip();

  for (const fm of feeMasters) {
    const pdfBytes = await generateFeeStatementPDF(fm);

    const filename = `${fm.student.name}_${fm.student.surname}_${term}.pdf`
      .replace(/\s+/g, "_");

    zip.file(filename, pdfBytes);
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
  });

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="fee-statements-${term}-${academicYear}.zip"`,
    },
  });
}
