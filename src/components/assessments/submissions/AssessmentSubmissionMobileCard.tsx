import Link from "next/link";

import {
  Eye,
  Timer,
  Trophy,
  UserRound,
} from "lucide-react";

import {
  formatAssessmentDuration,
} from "@/lib/assessments/grading";

import type {
  TeacherAssessmentSubmissionItem,
} from "@/lib/assessments/types";

import AssessmentSubmissionStatus from "./AssessmentSubmissionStatus";

type AssessmentSubmissionMobileCardProps = {
  assessmentId: number;
  submission: TeacherAssessmentSubmissionItem;
};

export default function AssessmentSubmissionMobileCard({
  assessmentId,
  submission,
}: AssessmentSubmissionMobileCardProps) {
  const latest =
    submission.latestAttempt;

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UserRound className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-black text-slate-950">
              {submission.student.name}{" "}
              {submission.student.surname}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {
                submission.student
                  .studentID
              }
            </p>
          </div>
        </div>

        <AssessmentSubmissionStatus
          status={submission.status}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MobileMetric
          icon={Trophy}
          label="Highest Score"
          value={
            submission.highestScore
              ? `${submission.highestScore.percentage}%`
              : "—"
          }
        />

        <MobileMetric
          icon={Timer}
          label="Time Used"
          value={
            latest
              ? formatAssessmentDuration(
                  latest.timeSpentSeconds
                )
              : "—"
          }
        />

        <MobileMetric
          icon={Trophy}
          label="Attempts"
          value={`${submission.attemptsUsed}/${submission.maxAttempts}`}
        />

        <MobileMetric
          icon={Trophy}
          label="Grade"
          value={
            submission.highestScore
              ?.grade ?? "—"
          }
        />
      </div>

      {latest &&
      (latest.status ===
        "SUBMITTED" ||
        latest.status ===
          "AUTO_SUBMITTED") ? (
        <Link
          href={`/list/assessments/${assessmentId}/submissions/${submission.student.id}?attemptId=${latest.id}`}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-600/20"
        >
          <Eye className="h-4 w-4" />
          View Submission
        </Link>
      ) : null}
    </article>
  );
}

function MobileMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <Icon className="h-4 w-4 text-blue-600" />

      <p className="mt-2 text-sm font-black text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}