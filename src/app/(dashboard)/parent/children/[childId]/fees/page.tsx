import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  FileText,
  ReceiptText,
} from "lucide-react";

import Link from "next/link";

import {
  auth,
} from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

type ParentChildFeesPageProps = {
  params:
    Promise<{
      childId:
        string;
    }>;
};

function money(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-GH",
    {
      style:
        "currency",

      currency:
        "GHS",

      minimumFractionDigits:
        2,
    },
  ).format(
    value,
  );
}

type FeeSummaryStatus =
  | "PENDING"
  | "PARTIAL"
  | "PAID";

function getFeeSummary({
  totalAmount,
  payments,
}: {
  totalAmount:
    number;

  payments: {
    amount:
      number;
  }[];
}): {
  total:
    number;

  paid:
    number;

  balance:
    number;

  status:
    FeeSummaryStatus;
} {
  const paid =
    payments.reduce(
      (
        total,
        payment,
      ) =>
        total +
        payment.amount,

      0,
    );

  const balance =
    Math.max(
      0,

      totalAmount -
        paid,
    );

  const status:
    FeeSummaryStatus =
    balance <=
    0
      ? "PAID"
      : paid >
          0
        ? "PARTIAL"
        : "PENDING";

  return {
    total:
      totalAmount,

    paid,

    balance,

    status,
  };
}

export default async function ParentChildFeesPage({
  params,
}: ParentChildFeesPageProps) {
  const {
    userId,
  } =
    await auth();

  if (
    !userId
  ) {
    throw new Error(
      "Unauthorized",
    );
  }

  const {
    childId,
  } =
    await params;

  /*
   * Security is critical here.
   *
   * The parent must actually own this child.
   */
  const student =
    await prisma.student.findFirst({
      where: {
        id:
          childId,

        parentId:
          userId,
      },

      select: {
        id:
          true,

        name:
          true,

        surname:
          true,

        studentID:
          true,

        class: {
          select: {
            id:
              true,

            name:
              true,
          },
        },

        feeMasters: {
          orderBy: {
            createdAt:
              "desc",
          },

          include: {
            payments: {
              orderBy: {
                date:
                  "desc",
              },

              select: {
                id:
                  true,

                amount:
                  true,

                date:
                  true,

                method:
                  true,
              },
            },
          },
        },
      },
    });

  if (
    !student
  ) {
    throw new Error(
      "Student not found or access denied.",
    );
  }

  const invoices =
    student.feeMasters.map(
      (
        invoice,
      ) => ({
        ...invoice,

        summary:
          getFeeSummary(
            invoice,
          ),
      }),
    );

  const totalInvoiced =
    invoices.reduce(
      (
        total,
        invoice,
      ) =>
        total +
        invoice.summary.total,

      0,
    );

  const totalPaid =
    invoices.reduce(
      (
        total,
        invoice,
      ) =>
        total +
        invoice.summary.paid,

      0,
    );

  const totalOutstanding =
    invoices.reduce(
      (
        total,
        invoice,
      ) =>
        total +
        invoice.summary.balance,

      0,
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-[1500px]">
        <Link
          href="/parent"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />

          Parent Dashboard
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-[32px] bg-slate-950 p-6 text-white shadow-[0_30px_90px_rgba(15,23,42,0.20)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.17em] text-blue-200">
              <Banknote className="h-3.5 w-3.5" />

              Student Finance
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              {student.name}{" "}
              {student.surname}
            </h1>

            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              {student.class.name}
              {" • "}
              {student.studentID}
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Review school-fee invoices, payments and outstanding balances for this student.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <FinanceMetric
            icon={
              FileText
            }
            label="Total Invoiced"
            value={
              money(
                totalInvoiced,
              )
            }
          />

          <FinanceMetric
            icon={
              CheckCircle2
            }
            label="Total Paid"
            value={
              money(
                totalPaid,
              )
            }
          />

          <FinanceMetric
            icon={
              Clock3
            }
            label="Outstanding"
            value={
              money(
                totalOutstanding,
              )
            }
          />
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.17em] text-blue-600">
              Account History
            </p>

            <h2 className="mt-2 text-2xl font-black text-slate-950">
              Fee invoices
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Every academic-term invoice issued for this student.
            </p>
          </div>

          {invoices.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
              <ReceiptText className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-4 font-black text-slate-900">
                No fee invoices yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                There are no school-fee records for this student.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {invoices.map(
                (
                  invoice,
                ) => (
                  <Link
                    key={
                      invoice.id
                    }
                    href={`/parent/children/${student.id}/fees/${invoice.id}`}
                    className="group flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-slate-950">
                          {
                            invoice.term
                          }
                        </h3>

                        <StatusBadge
                          status={
                            invoice.summary.status
                          }
                        />
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          invoice.academicYear
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:min-w-[390px]">
                      <MiniMetric
                        label="Invoice"
                        value={money(
                          invoice.summary.total,
                        )}
                      />

                      <MiniMetric
                        label="Paid"
                        value={money(
                          invoice.summary.paid,
                        )}
                      />

                      <MiniMetric
                        label="Balance"
                        value={money(
                          invoice.summary.balance,
                        )}
                      />
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FinanceMetric({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    typeof Banknote;

  label:
    string;

  value:
    string;
}) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-4 text-xl font-black text-slate-950 sm:text-2xl">
        {value}
      </p>

      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
    </article>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-sm font-black text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.11em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    FeeSummaryStatus;
}) {
  const styles =
    status ===
    "PAID"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status ===
          "PARTIAL"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ring-1 ring-inset ${styles}`}
    >
      {status}
    </span>
  );
}