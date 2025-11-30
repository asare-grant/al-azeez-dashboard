import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let count = 0;

  switch (type) {
    case "old":
      count = await prisma.student.count({
        where: { studentType: "old" },
      });
      break;

    case "new":
      count = await prisma.student.count({
        where: { studentType: "new" },
      });
      break;

    case "boarder":
      count = await prisma.student.count({
        where: { boardingType: "boarder" },
      });
      break;

    case "day":
      count = await prisma.student.count({
        where: { boardingType: "day" },
      });
      break;

    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ count });
}
