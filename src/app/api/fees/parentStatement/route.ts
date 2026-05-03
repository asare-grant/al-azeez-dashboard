// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { PDFDocument, StandardFonts } from "pdf-lib";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const feeMasterId = searchParams.get("feeMasterId");

//   if (!feeMasterId) {
//     return NextResponse.json({ error: "Missing feeMasterId" }, { status: 400 });
//   }

//   const feeMaster = await prisma.feeMaster.findUnique({
//     where: { id: Number(feeMasterId) },
//     include: {
//       student: true,
//       payments: true,
//     },
//   });

//   if (!feeMaster) {
//     return NextResponse.json({ error: "Not found" }, { status: 404 });
//   }

//   const paid = feeMaster.payments.reduce((s, p) => s + p.amount, 0);
//   const balance = feeMaster.totalAmount - paid;

//   // 📄 Create PDF
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage();
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   let y = 750;
//   const draw = (text: string) => {
//     page.drawText(text, { x: 50, y, size: 12, font });
//     y -= 25;
//   };

//   draw("FEE STATEMENT");
//   draw(`Student: ${feeMaster.student.name} ${feeMaster.student.surname}`);
//   draw(`Term: ${feeMaster.term}`);
//   draw(`Academic Year: ${feeMaster.academicYear}`);
//   draw("----------------------------");
//   draw(`Total Fees: GHS ${feeMaster.totalAmount.toFixed(2)}`);
//   draw(`Paid: GHS ${paid.toFixed(2)}`);
//   draw(`Balance: GHS ${balance.toFixed(2)}`);
//   draw("----------------------------");
//   draw("Payments:");

//   if (feeMaster.payments.length === 0) {
//     draw("No payments recorded.");
//   } else {
//     feeMaster.payments.forEach((p) =>
//       draw(
//         `${new Date(p.date).toLocaleDateString()} - GHS ${p.amount.toFixed(
//           2
//         )} (${p.method})`
//       )
//     );
//   }

//   const pdfBytes = await pdfDoc.save();

//   return new NextResponse(Buffer.from(pdfBytes), {
//     headers: {
//       "Content-Type": "application/pdf",
//       "Content-Disposition": 'attachment; filename="fee-statement.pdf"',
//     },
//   });
// }




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