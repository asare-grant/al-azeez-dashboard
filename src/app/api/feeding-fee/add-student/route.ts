// src/app/api/feeding-fee/add-student/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const added = await prisma.feedingFeeStudent.upsert({
    where: {
      studentId: body.studentId,
    },
    update: {},
    create: {
      studentId: body.studentId,
    },
  });

  return NextResponse.json(added);
}