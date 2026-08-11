import Link from "next/link";

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  ReceiptText,
  School,
  UserRound,
  WalletCards,
} from "lucide-react";

import { auth } from "@clerk/nextjs/server";

import { notFound } from "next/navigation";

import type { FeeStatus } from "@prisma/client";

import prisma from "@/lib/prisma";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type ParentFeeInvoicePageProps = {
  params: Promise<{
    childId: string;

    feeMasterId: string;
  }>;
};

/* -------------------------------------------------------------------------- */
/*                              MONEY FORMAT                                  */
/* -------------------------------------------------------------------------- */

function money(value: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",

    currency: "GHS",

    minimumFractionDigits: 2,
  }).format(value);
}

/* -------------------------------------------------------------------------- */
/*                         FINANCIAL CALCULATION                              */
/* -------------------------------------------------------------------------- */

function resolveFeeSummary({
  totalAmount,
  payments,
}: {
  totalAmount: number;

  payments: {
    amount: number;
  }[];
}): {
  total: number;

  paid: number;

  balance: number;

  status: FeeStatus;
} {
  const paid = payments.reduce(
    (total, payment) => total + payment.amount,

    0,
  );

  const balance = Math.max(
    0,

    totalAmount - paid,
  );

  const status: FeeStatus =
    balance <= 0 ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING";

  return {
    total: totalAmount,

    paid,

    balance,

    status,
  };
}

/* -------------------------------------------------------------------------- */
/*                                PAGE                                        */
/* -------------------------------------------------------------------------- */

export default async function ParentFeeInvoicePage({
  params,
}: ParentFeeInvoicePageProps) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { childId, feeMasterId } = await params;

  const parsedFeeMasterId = Number(feeMasterId);

  if (!Number.isInteger(parsedFeeMasterId) || parsedFeeMasterId <= 0) {
    notFound();
  }

  /*
   * --------------------------------------------------------------
   * SECURITY
   * --------------------------------------------------------------
   *
   * We resolve the invoice through BOTH:
   *
   * feeMasterId
   * +
   * studentId
   * +
   * parentId
   *
   * This prevents a parent changing the URL
   * and viewing another family's invoice.
   */
  const invoice = await prisma.feeMaster.findFirst({
    where: {
      id: parsedFeeMasterId,

      studentId: childId,

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

      payments: {
        orderBy: {
          date: "asc",
        },
      },

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

  if (!invoice) {
    notFound();
  }

  const summary = resolveFeeSummary({
    totalAmount: invoice.totalAmount,

    payments: invoice.payments,
  });

  /*
   * Build running payment balances.
   */
  let runningPaid = 0;

  const paymentHistory = invoice.payments.map((payment) => {
    runningPaid += payment.amount;

    const remainingBalance = Math.max(
      0,

      invoice.totalAmount - runningPaid,
    );

    return {
      ...payment,

      runningPaid,

      remainingBalance,
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1500px]">
        {/* -------------------------------------------------------------- */}
        {/*                          NAVIGATION                             */}
        {/* -------------------------------------------------------------- */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/parent/children/${childId}/fees`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Fee Account
          </Link>

          <a
            href={`/api/fees/parent-statement?feeMasterId=${invoice.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white shadow-sm transition hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download Statement
          </a>
        </div>

        {/* -------------------------------------------------------------- */}
        {/*                             HERO                               */}
        {/* -------------------------------------------------------------- */}

        <section className="relative overflow-hidden rounded-[30px] bg-slate-950 p-6 text-white shadow-[0_32px_90px_rgba(15,23,42,0.22)] sm:rounded-[34px] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-200">
                <ReceiptText className="h-3.5 w-3.5" />
                School Fee Statement
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {invoice.term}
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-300 sm:text-base">
                {invoice.academicYear}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-blue-200">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-black text-white">
                    {invoice.student.name} {invoice.student.surname}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {invoice.student.studentID}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroDetail
                icon={School}
                label="Class"
                value={invoice.student.class.name}
              />

              <HeroDetail
                icon={GraduationCap}
                label="Grade"
                value={invoice.student.grade.level}
              />

              <HeroDetail
                icon={FileText}
                label="Invoice"
                value={`#${invoice.id}`}
              />

              <HeroDetail
                icon={CalendarDays}
                label="Issued"
                value={new Intl.DateTimeFormat("en-GH", {
                  day: "numeric",

                  month: "short",

                  year: "numeric",
                }).format(invoice.createdAt)}
              />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/*                        ACCOUNT METRICS                          */}
        {/* -------------------------------------------------------------- */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <FinanceMetric
            icon={FileText}
            label="Total Invoice"
            value={money(summary.total)}
          />

          <FinanceMetric
            icon={CheckCircle2}
            label="Amount Paid"
            value={money(summary.paid)}
          />

          <FinanceMetric
            icon={Clock3}
            label="Outstanding"
            value={money(summary.balance)}
          />

          <StatusMetric status={summary.status} />
        </section>

        {/* -------------------------------------------------------------- */}
        {/*                         MAIN CONTENT                            */}
        {/* -------------------------------------------------------------- */}

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0 space-y-6">
            {/* ---------------------------------------------------------- */}
            {/*                     FEE BREAKDOWN                          */}
            {/* ---------------------------------------------------------- */}

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Invoice Breakdown
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  School fee charges
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Charges included in this academic-term invoice.
                </p>
              </div>

              {invoice.details.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No fee breakdown is available for this invoice.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {invoice.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-900">
                          {detail.structure.type.name}
                        </p>

                        <p className="mt-1 text-xs capitalize text-slate-400">
                          {detail.structure.type.category.name
                            .toLowerCase()
                            .replace(/_/g, " ")}
                        </p>
                      </div>

                      <p className="shrink-0 font-black text-slate-950">
                        {money(detail.amount)}
                      </p>
                    </div>
                  ))}

                  <div className="flex items-center justify-between bg-slate-50 px-5 py-5 sm:px-6">
                    <p className="font-black text-slate-700">Total Invoice</p>

                    <p className="text-lg font-black text-slate-950">
                      {money(summary.total)}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* ---------------------------------------------------------- */}
            {/*                     PAYMENT HISTORY                        */}
            {/* ---------------------------------------------------------- */}

            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Payment History
                </p>

                <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                  Payments received
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Every payment recorded against this invoice.
                </p>
              </div>

              {paymentHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400">
                    <WalletCards className="h-6 w-6" />
                  </div>

                  <p className="mt-4 font-black text-slate-900">
                    No payments recorded
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Payment records will appear here after they are received.
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[720px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          <TableHeading>Date</TableHeading>

                          <TableHeading>Method</TableHeading>

                          <TableHeading>Payment</TableHeading>

                          <TableHeading>Total Paid</TableHeading>

                          <TableHeading align="right">Balance</TableHeading>
                        </tr>
                      </thead>

                      <tbody>
                        {paymentHistory.map((payment) => (
                          <tr
                            key={payment.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <TableCell>
                              {new Intl.DateTimeFormat("en-GH", {
                                day: "numeric",

                                month: "short",

                                year: "numeric",
                              }).format(payment.date)}
                            </TableCell>

                            <TableCell>
                              <span className="font-bold capitalize text-slate-700">
                                {payment.method
                                  .toLowerCase()
                                  .replace(/_/g, " ")}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className="font-black text-emerald-700">
                                {money(payment.amount)}
                              </span>
                            </TableCell>

                            <TableCell>{money(payment.runningPaid)}</TableCell>

                            <TableCell align="right">
                              <span className="font-black text-slate-900">
                                {money(payment.remainingBalance)}
                              </span>
                            </TableCell>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE */}
                  <div className="divide-y divide-slate-100 md:hidden">
                    {paymentHistory.map((payment) => (
                      <article key={payment.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-emerald-700">
                              {money(payment.amount)}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {new Intl.DateTimeFormat("en-GH", {
                                day: "numeric",

                                month: "short",

                                year: "numeric",
                              }).format(payment.date)}
                            </p>
                          </div>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.11em] text-slate-500">
                            {payment.method.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <MiniMetric
                            label="Total Paid"
                            value={money(payment.runningPaid)}
                          />

                          <MiniMetric
                            label="Balance"
                            value={money(payment.remainingBalance)}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>

          {/* ------------------------------------------------------------ */}
          {/*                       ACCOUNT SUMMARY                        */}
          {/* ------------------------------------------------------------ */}

          <aside className="min-w-0 xl:sticky xl:top-6">
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
              <div className="bg-slate-950 p-5 text-white sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-200">
                  <Banknote className="h-5 w-5" />
                </div>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.17em] text-blue-300">
                  Account Summary
                </p>

                <h2 className="mt-2 text-xl font-black">Fee position</h2>
              </div>

              <div className="space-y-4 p-5 sm:p-6">
                <SummaryRow label="Invoice" value={money(summary.total)} />

                <SummaryRow label="Paid" value={money(summary.paid)} />

                <SummaryRow
                  label="Outstanding"
                  value={money(summary.balance)}
                  strong
                />

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                    Payment Status
                  </p>

                  <div className="mt-2">
                    <StatusBadge status={summary.status} />
                  </div>
                </div>

                <a
                  href={`/api/fees/parent-statement?feeMasterId=${invoice.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white transition hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  Download Fee Statement
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         PRESENTATIONAL COMPONENTS                          */
/* -------------------------------------------------------------------------- */

function HeroDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof School;

  label: string;

  value: string;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
      <Icon className="h-5 w-5 text-blue-300" />

      <p className="mt-3 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-black text-white">{value}</p>
    </article>
  );
}

function FinanceMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;

  label: string;

  value: string;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-xl font-black text-slate-950 sm:text-2xl">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
    </article>
  );
}

function StatusMetric({ status }: { status: FeeStatus }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
          status === "PAID"
            ? "bg-emerald-50 text-emerald-600"
            : status === "PARTIAL"
              ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600"
        }`}
      >
        <WalletCards className="h-5 w-5" />
      </div>

      <div className="mt-4">
        <StatusBadge status={status} />
      </div>

      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        Account Status
      </p>
    </article>
  );
}

function StatusBadge({ status }: { status: FeeStatus }) {
  const className =
    status === "PAID"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "PARTIAL"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] ring-1 ring-inset ${className}`}
    >
      {status}
    </span>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;

  value: string;

  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>

      <p
        className={
          strong
            ? "text-base font-black text-slate-950"
            : "text-sm font-black text-slate-800"
        }
      >
        {value}
      </p>
    </div>
  );
}

function TableHeading({
  children,
  align = "left",
}: {
  children: React.ReactNode;

  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-4 text-[9px] font-black uppercase tracking-[0.13em] text-slate-400 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function TableCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;

  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-5 py-4 text-sm text-slate-600 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="font-black text-slate-900">{value}</p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.11em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
