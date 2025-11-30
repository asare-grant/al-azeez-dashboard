import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { classId: string } }
) {
  const classId = Number(params.classId);

  if (!classId) {
    return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
  }

  const feeMasters = await prisma.feeMaster.findMany({
    where: { student: { classId } },
    include: { student: true }
  });

  return NextResponse.json(feeMasters);
}
