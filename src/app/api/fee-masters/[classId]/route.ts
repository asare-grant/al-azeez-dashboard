// scr/app/api/fee-masters/[classId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await context.params;
    const classIdNumber = Number(classId);

    if (!classIdNumber || Number.isNaN(classIdNumber)) {
      return NextResponse.json(
        { error: "Invalid class ID" },
        { status: 400 }
      );
    }

    const feeMasters = await prisma.feeMaster.findMany({
      where: {
        student: {
          classId: classIdNumber,
        },
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(feeMasters);
  } catch (error) {
    console.error("Fee masters by class error:", error);

    return NextResponse.json(
      { error: "Failed to fetch fee masters" },
      { status: 500 }
    );
  }
}