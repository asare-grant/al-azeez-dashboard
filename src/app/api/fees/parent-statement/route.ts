import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

import { generateFeeStatementPDF } from "@/lib/pdf/generateFeeStatement";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },

        {
          status: 401,
        },
      );
    }

    const { searchParams } = new URL(req.url);

    const rawFeeMasterId = searchParams.get("feeMasterId");

    const feeMasterId = Number(rawFeeMasterId);

    if (!Number.isInteger(feeMasterId) || feeMasterId <= 0) {
      return NextResponse.json(
        {
          error: "A valid fee invoice is required.",
        },

        {
          status: 400,
        },
      );
    }

    /*
     * Critical ownership validation:
     *
     * invoice
     * → student
     * → parent
     * → current Clerk user
     */
    const feeMaster = await prisma.feeMaster.findFirst({
      where: {
        id: feeMasterId,

        student: {
          parentId: userId,
        },
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
                type: {
                  include: {
                    category: true,
                  },
                },

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
        {
          error: "Fee statement not found or access denied.",
        },

        {
          status: 404,
        },
      );
    }

    const pdfBuffer = await generateFeeStatementPDF(feeMaster);

    const filename =
      `fee-statement-${feeMaster.student.name}-${feeMaster.student.surname}-${feeMaster.term}-${feeMaster.academicYear}.pdf`
        .replace(/\s+/g, "_")
        .replace(/[\/\\:*?"<>|]/g, "-");

    return new NextResponse(
      new Uint8Array(pdfBuffer),

      {
        headers: {
          "Content-Type": "application/pdf",

          "Content-Disposition": `attachment; filename="${filename}"`,

          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    console.error("PARENT FEE STATEMENT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to generate fee statement.",

        details: error instanceof Error ? error.message : String(error),
      },

      {
        status: 500,
      },
    );
  }
}
