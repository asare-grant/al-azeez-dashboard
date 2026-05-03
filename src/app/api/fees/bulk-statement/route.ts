// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import JSZip from "jszip";
// import { generateFeeStatementPDF } from "@/lib/pdf/generateFeeStatement";

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
//       student: true,
//       payments: true,
//     },
//   });

//   if (feeMasters.length === 0) {
//     return NextResponse.json(
//       { error: "No fee records found" },
//       { status: 404 }
//     );
//   }

//   const zip = new JSZip();

//   for (const fm of feeMasters) {
//     const pdfBytes = await generateFeeStatementPDF(fm);

//     const filename = `${fm.student.name}_${fm.student.surname}_${term}.pdf`
//       .replace(/\s+/g, "_");

//     zip.file(filename, pdfBytes);
//   }

//   const zipBuffer = await zip.generateAsync({
//     type: "nodebuffer",
//   });

//   return new NextResponse(new Uint8Array(zipBuffer), {
//     headers: {
//       "Content-Type": "application/zip",
//       "Content-Disposition": `attachment; filename="fee-statements-${term}-${academicYear}.zip"`,
//     },
//   });
// }



// /app/api/fees/bulk-statement/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import JSZip from "jszip";
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

    const rawTerm = searchParams.get("term");
    const academicYear = searchParams.get("academicYear");

    if (!rawTerm || !academicYear) {
      return NextResponse.json(
        { error: "term and academicYear required" },
        { status: 400 }
      );
    }

    const term = normalizeTerm(rawTerm);

    const feeMasters = await prisma.feeMaster.findMany({
      where: {
        term,
        academicYear,
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
        id: "desc",
      },
    });

    if (feeMasters.length === 0) {
      return NextResponse.json(
        {
          error: "No fee records found",
          searchedFor: {
            term,
            academicYear,
          },
        },
        { status: 404 }
      );
    }

    const zip = new JSZip();

    for (const feeMaster of feeMasters) {
      const pdfBytes = await generateFeeStatementPDF(feeMaster);

      const filename = `${feeMaster.student.name}_${feeMaster.student.surname}_${feeMaster.term}_${feeMaster.academicYear}.pdf`
        .replace(/\s+/g, "_")
        .replace(/[\/\\:*?"<>|]/g, "-");

      zip.file(filename, pdfBytes);
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
    });

    const safeTerm = term.replace(/\s+/g, "_");
    const safeAcademicYear = academicYear.replace(/[\/\\:*?"<>|]/g, "-");

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="fee-statements-${safeTerm}-${safeAcademicYear}.zip"`,
      },
    });
  } catch (error) {
    console.error("Bulk fee statement error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate fee statements",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}