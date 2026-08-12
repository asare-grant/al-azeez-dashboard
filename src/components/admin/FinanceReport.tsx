// src/components/FinanceReport.tsx
"use client";

import { useEffect, useState, useTransition } from "react";

import {
  BellRing,
  Loader2,
  Send,
  TriangleAlert,
  UsersRound,
} from "lucide-react";

import { toast } from "react-toastify";

import FinancePagination from "./../FinanceReportPagination";

import {
  sendOutstandingFeeReminders,
  sendSingleOutstandingFeeReminder,
} from "@/lib/finance/notification-actions";

type StudentOwing = {
  feeMasterId: number;

  studentId: string;

  student: string;

  balance: number;
};

type FinanceReportData = {
  term: string;

  academicYear: string;

  totalFees: number;

  totalPaid: number;

  outstanding: number;

  collectionRate: number;

  studentsOwing: StudentOwing[];

  totalStudents: number;

  error?: string;
};

const FinanceReport = () => {
  const [data, setData] = useState<FinanceReportData | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [term, setTerm] = useState("THIRD");
  const [year, setYear] = useState("2026/2027");

  const [showReminderConfirm, setShowReminderConfirm] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [selectedReminder, setSelectedReminder] = useState<StudentOwing | null>(
    null,
  );

  useEffect(() => {
    const params = new URLSearchParams({
      term,
      academicYear: year,
      page: page.toString(),
      limit: limit.toString(),
    });

    fetch(`/api/fees/report?${params.toString()}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Finance report fetch error:", err));
  }, [term, year, page, limit]);

  function handleSendReminders() {
    if (!data || data.totalStudents === 0 || isPending) {
      return;
    }

    startTransition(async () => {
      const result = await sendOutstandingFeeReminders({
        term: data.term,

        academicYear: data.academicYear,
      });

      if (!result.success) {
        toast.error(result.message);

        return;
      }

      toast.success(result.message);

      if (result.data?.skippedNoParent) {
        toast.warning(
          `${result.data.skippedNoParent} outstanding account${
            result.data.skippedNoParent === 1 ? "" : "s"
          } could not be notified because no parent account is linked.`,
        );
      }

      if (result.data?.skippedDuplicate) {
        toast.info(
          `${result.data.skippedDuplicate} reminder${
            result.data.skippedDuplicate === 1 ? " was" : "s were"
          } already sent today.`,
        );
      }

      setShowReminderConfirm(false);
    });
  }

  function handleSendSingleReminder() {
    if (!selectedReminder || isPending) {
      return;
    }

    startTransition(async () => {
      const result = await sendSingleOutstandingFeeReminder({
        feeMasterId: selectedReminder.feeMasterId,
      });

      if (!result.success) {
        toast.error(result.message);

        return;
      }

      toast.success(result.message);

      setSelectedReminder(null);
    });
  }

  return (
    <>
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
        {/* HEADER */}
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UsersRound className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-blue-600">
                Finance Intelligence
              </p>

              <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Fee Collection Report
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Track collections, outstanding balances and parent reminders by
                academic period.
              </p>
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <select
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);

                setPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            >
              <option value="FIRST">First Term</option>

              <option value="SECOND">Second Term</option>

              <option value="THIRD">Third Term</option>
            </select>

            <input
              value={year}
              onChange={(event) => {
                setYear(event.target.value);

                setPage(1);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              placeholder="Academic Year e.g. 2026/2027"
            />
          </div>
        </div>

        {!data || data.error ? (
          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-bold text-rose-700">
                {data?.error || "No finance report data found."}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* METRICS */}
            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 sm:p-6 md:grid-cols-4">
              <Stat
                label="Expected"
                value={`GHS ${data.totalFees.toFixed(2)}`}
              />

              <Stat
                label="Collected"
                value={`GHS ${data.totalPaid.toFixed(2)}`}
              />

              <Stat
                label="Outstanding"
                value={`GHS ${data.outstanding.toFixed(2)}`}
                warning={data.outstanding > 0}
              />

              <Stat label="Collection Rate" value={`${data.collectionRate}%`} />
            </div>

            {/* STUDENTS OWING HEADER */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <TriangleAlert
                    className={`h-4 w-4 ${
                      data.totalStudents > 0
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  />

                  <p
                    className={`text-xs font-black uppercase tracking-[0.16em] ${
                      data.totalStudents > 0
                        ? "text-amber-700"
                        : "text-slate-400"
                    }`}
                  >
                    Students Owing
                  </p>
                </div>

                <h4 className="mt-2 text-xl font-black text-slate-950">
                  Outstanding fee accounts
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  {data.totalStudents === 0
                    ? "All fee accounts for this period are settled."
                    : `${data.totalStudents} student${
                        data.totalStudents === 1 ? "" : "s"
                      } currently ${
                        data.totalStudents === 1 ? "has" : "have"
                      } an outstanding balance.`}
                </p>
              </div>

              <button
                type="button"
                disabled={data.totalStudents === 0 || isPending}
                onClick={() => setShowReminderConfirm(true)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-black transition ${
                  data.totalStudents > 0
                    ? "bg-amber-500 text-white shadow-[0_10px_30px_rgba(245,158,11,0.20)] hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-[0_14px_35px_rgba(245,158,11,0.28)]"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                <BellRing className="h-4 w-4" />
                Notify Parents
              </button>
            </div>

            {/* OWING TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-slate-400 sm:px-6">
                      Student
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.13em] text-slate-400 sm:px-6">
                      Outstanding Balance
                    </th>

                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.13em] text-slate-400 sm:px-6">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.studentsOwing.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <UsersRound className="h-5 w-5" />
                        </div>

                        <p className="mt-3 font-black text-slate-900">
                          No outstanding accounts
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          All students on this page have settled their fees.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    data.studentsOwing.map((student, index) => (
                      <tr
                        key={`${student.student}-${index}`}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 font-bold text-slate-800 sm:px-6">
                          {student.student}
                        </td>

                        <td className="px-5 py-4 text-right sm:px-6">
                          <span className="inline-flex rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700 ring-1 ring-inset ring-rose-100">
                            GHS {student.balance.toFixed(2)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right sm:px-6">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setSelectedReminder(student)}
                            className="group inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-[10px] font-black text-amber-700 transition hover:border-amber-300 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <BellRing className="h-3.5 w-3.5 transition-transform group-hover:scale-105" />
                            Remind Parent
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="border-t border-slate-100 p-5 sm:p-6">
              <FinancePagination
                page={page}
                limit={limit}
                count={data.totalStudents}
                onPageChange={setPage}
                onLimitChange={(nextLimit) => {
                  setLimit(nextLimit);

                  setPage(1);
                }}
              />
            </div>
          </>
        )}
      </section>

      {/* -------------------------------------------------------------- */}
      {/*                 REMINDER CONFIRMATION MODAL                     */}
      {/* -------------------------------------------------------------- */}

      {showReminderConfirm && data ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close reminder confirmation"
            onClick={() => {
              if (!isPending) {
                setShowReminderConfirm(false);
              }
            }}
            className="absolute inset-0"
          />

          <section className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.30)]">
            <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
              <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />

              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                  <BellRing className="h-5 w-5" />
                </div>

                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                  Parent Communication
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  Send Fee Reminders?
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Parents linked to outstanding fee accounts will receive an
                  in-app reminder showing the current balance for their child.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <ConfirmMetric
                  label="Accounts"
                  value={String(data.totalStudents)}
                />

                <ConfirmMetric
                  label="Outstanding"
                  value={`GHS ${data.outstanding.toFixed(2)}`}
                />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                  Academic Period
                </p>

                <p className="mt-1 font-black text-slate-900">
                  {data.term}
                  {" • "}
                  {data.academicYear}
                </p>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowReminderConfirm(false)}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSendReminders}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-xs font-black text-white shadow-[0_10px_25px_rgba(245,158,11,0.18)] transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Reminders
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {/* -------------------------------------------------------------- */}
      {/*              INDIVIDUAL REMINDER CONFIRMATION                 */}
      {/* -------------------------------------------------------------- */}

      {selectedReminder ? (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6">
          <div className="flex min-h-full items-end justify-center sm:items-center">
            <button
              type="button"
              aria-label="Close individual reminder confirmation"
              onClick={() => {
                if (!isPending) {
                  setSelectedReminder(null);
                }
              }}
              className="absolute inset-0"
            />

            <section className="relative z-10 my-3 w-full max-w-md overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.30)] sm:my-6">
              {/* HEADER */}
              <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                    <BellRing className="h-5 w-5" />
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
                    Individual Fee Reminder
                  </p>

                  <h3 className="mt-2 text-2xl font-black">Remind Parent?</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    The linked parent will receive an in-app notification
                    immediately, while a WhatsApp reminder will be securely
                    queued for delivery to the parent's registered contact
                    number.
                  </p>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 sm:p-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                    Student
                  </p>

                  <p className="mt-1 font-black text-slate-950">
                    {selectedReminder.student}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <ConfirmMetric
                    label="Outstanding"
                    value={`GHS ${selectedReminder.balance.toFixed(2)}`}
                  />

                  <ConfirmMetric label="Delivery" value="2 Channels" />
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/70">
                  <div className="p-4">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <BellRing className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black text-blue-950">
                          Multi-channel parent reminder
                        </p>

                        <p className="mt-1 text-xs leading-5 text-blue-700">
                          The reminder will be delivered through the school's
                          notification centre and queued for WhatsApp delivery.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY CHANNELS */}
                  <div className="grid grid-cols-2 gap-px border-t border-blue-100 bg-blue-100">
                    <div className="bg-white/80 p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500" />

                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                          In-App
                        </p>
                      </div>

                      <p className="mt-1 text-xs font-black text-slate-900">
                        Immediate
                      </p>
                    </div>

                    <div className="bg-white/80 p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-amber-500" />

                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
                          WhatsApp
                        </p>
                      </div>

                      <p className="mt-1 text-xs font-black text-slate-900">
                        Queued
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setSelectedReminder(null)}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleSendSingleReminder}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-xs font-black text-white shadow-[0_10px_25px_rgba(245,158,11,0.18)] transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Reminder...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Parent Reminder
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
};

function Stat({
  label,
  value,
  warning = false,
}: {
  label: string;

  value: string;

  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        warning
          ? "border-amber-200 bg-amber-50/70"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-[10px] font-black uppercase tracking-[0.11em] ${
          warning ? "text-amber-700" : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function ConfirmMetric({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-lg font-black text-slate-950">{value}</p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
    </div>
  );
}

export default FinanceReport;
