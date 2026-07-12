import prisma from "@/lib/prisma";
import Link from "next/link";
import { Banknote, CalendarDays, ChartBar, Bus } from "lucide-react";

export const revalidate = 0;

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const getWeekNumber = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
};

export default async function BusFeeDashboardPage() {
  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const activeTerm = await prisma.schoolTerm.findFirst({
    where: {
      startDate: { lte: today },
      endDate: { gte: today },
      isActive: true,
    },
  });

  const termStart = activeTerm?.startDate ?? startOfMonth;
  const termEnd = activeTerm?.endDate ?? today;

  const [
    totalBusStudents,
    allPayments,
    todayPayments,
    monthPayments,
    termPayments,
    recentPayments,
  ] = await prisma.$transaction([
    prisma.busFeeStudent.count(),

    prisma.busFeePayment.findMany({
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            class: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    }),

    prisma.busFeePayment.findMany({
      where: {
        date: {
          gte: startOfToday,
          lt: endOfToday,
        },
      },
    }),

    prisma.busFeePayment.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: today,
        },
      },
    }),

    prisma.busFeePayment.findMany({
      where: {
        date: {
          gte: termStart,
          lte: termEnd,
        },
      },
    }),

    prisma.busFeePayment.findMany({
      take: 10,
      orderBy: { date: "desc" },
      include: {
        student: {
          select: {
            name: true,
            surname: true,
            class: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  const termRevenue = termPayments.reduce((sum, p) => sum + p.amount, 0);

  const dailyBreakdown = termPayments.reduce<Record<string, number>>(
    (acc, payment) => {
      const key = payment.date.toISOString().split("T")[0];
      acc[key] = (acc[key] || 0) + payment.amount;
      return acc;
    },
    {},
  );

  const weeklyBreakdown = termPayments.reduce<Record<string, number>>(
    (acc, payment) => {
      const week = `Week ${getWeekNumber(payment.date)}`;
      acc[week] = (acc[week] || 0) + payment.amount;
      return acc;
    },
    {},
  );

  const cards = [
    {
      title: "Bus Students",
      value: totalBusStudents,
      icon: Bus,
    },
    {
      title: "Today Revenue",
      value: `GHS ${formatMoney(todayRevenue)}`,
      icon: CalendarDays,
    },
    {
      title: "This Month",
      value: `GHS ${formatMoney(monthRevenue)}`,
      icon: ChartBar,
    },
    {
      title: "This Term",
      value: `GHS ${formatMoney(termRevenue)}`,
      icon: Banknote,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Bus Fee Dashboard</h1>
          <p className="text-sm text-gray-500">
            View bus fee payments, daily totals, weekly totals and term revenue.
          </p>
        </div>

        <Link
          href="/list/bus-fees"
          className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white"
        >
          Back to Bus Fee
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-md border border-blue-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{card.title}</span>
                <Icon size={20} className="text-blue-600" />
              </div>

              <h2 className="mt-3 text-2xl font-bold">{card.value}</h2>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-md bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Bus Fee by Day</h2>

          <div className="flex flex-col gap-2">
            {Object.entries(dailyBreakdown).length === 0 ? (
              <p className="text-sm text-gray-500">No daily payment yet.</p>
            ) : (
              Object.entries(dailyBreakdown).map(([date, amount]) => (
                <div
                  key={date}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-3 text-sm"
                >
                  <span>{date}</span>
                  <span className="font-semibold text-blue-700">
                    GHS {formatMoney(amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-md bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Bus Fee by Week</h2>

          <div className="flex flex-col gap-2">
            {Object.entries(weeklyBreakdown).length === 0 ? (
              <p className="text-sm text-gray-500">No weekly payment yet.</p>
            ) : (
              Object.entries(weeklyBreakdown).map(([week, amount]) => (
                <div
                  key={week}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-3 text-sm"
                >
                  <span>{week}</span>
                  <span className="font-semibold text-green-700">
                    GHS {formatMoney(amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Recent Bus Payments</h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3">Student</th>
                <th className="p-3">Class</th>
                <th className="p-3">Date</th>
                <th className="p-3">Day</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>

            <tbody>
              {recentPayments.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {payment.student.name} {payment.student.surname}
                  </td>
                  <td className="p-3">{payment.student.class.name}</td>
                  <td className="p-3">
                    {payment.date.toISOString().split("T")[0]}
                  </td>
                  <td className="p-3">Day {payment.day}</td>
                  <td className="p-3 font-semibold text-blue-700">
                    GHS {formatMoney(payment.amount)}
                  </td>
                </tr>
              ))}

              {recentPayments.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={5}>
                    No bus fee payment recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-green-200 bg-green-50 p-4">
        <h2 className="text-lg font-semibold text-green-800">
          Total Bus Fee Revenue
        </h2>
        <p className="mt-2 text-3xl font-bold text-green-700">
          GHS {formatMoney(totalRevenue)}
        </p>
      </div>
    </div>
  );
}