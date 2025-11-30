import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { surname: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 15,
    select: {
      id: true,
      name: true,
      surname: true,
      class: { select: { name: true } },
    },
  });

  return NextResponse.json(students);
}
