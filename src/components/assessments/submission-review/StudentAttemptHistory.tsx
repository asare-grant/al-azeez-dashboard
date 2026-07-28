import Link from "next/link";

import {
  CheckCircle2,
  Clock3,
  TimerOff,
} from "lucide-react";

import type {
  TeacherStudentSubmissionReview,
} from "@/lib/assessments/types";

type StudentAttemptHistoryProps = {
  assessmentId: number;
  studentId: string;

  attempts:
    TeacherStudentSubmissionReview["attempts"];

  selectedAttemptId:
    | number
    | null;
};

function formatDate(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

export default function StudentAttemptHistory({
  assessmentId,
  studentId,
  attempts,
  selectedAttemptId,
}: StudentAttemptHistoryProps) {
  return (
    <section className="print:hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
        Attempt History
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-950">
        Select an attempt
      </h2>

      <div className="mt-5 space-y-3">
        {attempts.map((attempt) => {
          const selected =
            attempt.id ===
            selectedAttemptId;

          const completed =
            attempt.status ===
              "SUBMITTED" ||
            attempt.status ===
              "AUTO_SUBMITTED";

          const Icon =
            attempt.status ===
            "AUTO_SUBMITTED"
              ? TimerOff
              : completed
              ? CheckCircle2
              : Clock3;

          return (
            <Link
              key={attempt.id}
              href={`/list/assessments/${assessmentId}/submissions/${studentId}?attemptId=${attempt.id}`}
              className={`block rounded-2xl border p-4 transition ${
                selected
                  ? "border-blue-500 bg-blue-50 shadow-[0_10px_30px_rgba(37,99,235,0.10)]"
                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-slate-950">
                      Attempt{" "}
                      {attempt.attemptNumber}
                    </p>

                    <p className="text-sm font-black text-blue-700">
                      {attempt.percentage !==
                      null
                        ? `${attempt.percentage}%`
                        : "—"}
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(
                      attempt.startedAt
                    )}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                      {attempt.status.replaceAll(
                        "_",
                        " "
                      )}
                    </span>

                    {attempt.grade ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
                        Grade{" "}
                        {attempt.grade}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}