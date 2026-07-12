// src/app/api/feeding-fee/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import moment from "moment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const classId = searchParams.get("classId");
  const month = searchParams.get("month");

  const selectedDate = month ? moment(month, "MM/YYYY") : moment();

  const startDate = selectedDate.startOf("month").toDate();
  const endDate = selectedDate.endOf("month").toDate();

  const payments = await prisma.feedingFeePayment.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      student: {
        ...(classId ? { classId: Number(classId) } : {}),
      },
    },
  });

  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  const body = await req.json();

  const date = new Date(body.date);

  const saved = await prisma.feedingFeePayment.upsert({
    where: {
      studentId_date: {
        studentId: body.studentId,
        date,
      },
    },
    update: {
      amount: Number(body.amount),
      day: Number(body.day),
    },
    create: {
      studentId: body.studentId,
      amount: Number(body.amount),
      date,
      day: Number(body.day),
    },
  });

  return NextResponse.json(saved);
}