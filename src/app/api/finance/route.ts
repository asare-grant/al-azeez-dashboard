import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import moment from "moment";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const month = searchParams.get("month"); // ISO string

  let start: Date, end: Date;
  if (month) {
    const m = new Date(month);
    start = moment(m).startOf("month").toDate();
    end = moment(m).endOf("month").toDate();
  } else {
    start = moment().startOf("year").toDate();
    end = moment().endOf("year").toDate();
  }

  // Fetch FeeMasters with optional class filter
  const feeMasters = await prisma.feeMaster.findMany({
  where: {
    ...(classId && { student: { classId: Number(classId) } }),
    createdAt: { gte: start, lte: end },
  },
  select: {
    totalAmount: true,
    createdAt: true, // <-- add this
    payments: {
      select: { amount: true, date: true },
    },
  },
});

  // Initialize month map
  const monthMap: Record<string, { paid: number; balance: number }> = {};
  for (let i = 0; i < 12; i++) {
    const monthName = moment(start).month(i).format("MMM");
    monthMap[monthName] = { paid: 0, balance: 0 };
  }

  // Aggregate payments per month
  feeMasters.forEach((master) => {
    master.payments.forEach((payment) => {
      const m = moment(payment.date).format("MMM");
      monthMap[m].paid += payment.amount;
    });

    // Add totalAmount to balance calculation
    const monthCreated = moment(master.createdAt).format("MMM");
    monthMap[monthCreated].balance += master.totalAmount;
  });

  // Calculate remaining balance = total fees - paid
  Object.keys(monthMap).forEach((m) => {
    monthMap[m].balance = monthMap[m].balance - monthMap[m].paid;
  });

  const data = Object.keys(monthMap).map((month) => ({
    month,
    paid: monthMap[month].paid,
    balance: monthMap[month].balance,
  }));

  return NextResponse.json(data);
}
