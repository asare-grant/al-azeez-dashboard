import Link from "next/link";

import {
  Eye,
} from "lucide-react";


import { 
    formatAssessmentDuration 
} from "@/lib/assessments/grading";



import AssessmentSubmissionStatus from "./AssessmentSubmissionStatus";
import { 
    TeacherAssessmentSubmissionItem 
} from "@/lib/assessments/types";

type AssessmentSubmissionTableProps = {
  assessmentId: number;
  submissions: TeacherAssessmentSubmissionItem[];
};

function formatDate(
  value: Date | string | null
) {
  if (!value) {
    return "—";
  }

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

export default function AssessmentSubmissionTable({
  assessmentId,
  submissions,
}: AssessmentSubmissionTableProps) {
  return (
    <div className="hidden overflow-x-auto xl:block">
      <table className="w-full min-w-[1150px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
            <Heading>Student</Heading>
            <Heading>Status</Heading>
            <Heading>Attempts</Heading>
            <Heading>Latest Score</Heading>
            <Heading>Highest Score</Heading>
            <Heading>Grade</Heading>
            <Heading>Time Used</Heading>
            <Heading>Submitted</Heading>
            <Heading align="right">
              Action
            </Heading>
          </tr>
        </thead>

        <tbody>
          {submissions.map(
            (submission) => {
              const latest =
                submission.latestAttempt;

              return (
                <tr
                  key={
                    submission.student.id
                  }
                  className="border-b border-slate-100"
                >
                  <Cell>
                    <div>
                      <p className="font-black text-slate-950">
                        {
                          submission.student
                            .name
                        }{" "}
                        {
                          submission.student
                            .surname
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {
                          submission.student
                            .studentID
                        }
                      </p>
                    </div>
                  </Cell>

                  <Cell>
                    <AssessmentSubmissionStatus
                      status={
                        submission.status
                      }
                    />
                  </Cell>

                  <Cell>
                    <p className="font-black text-slate-800">
                      {
                        submission.attemptsUsed
                      }
                      /
                      {
                        submission.maxAttempts
                      }
                    </p>
                  </Cell>

                  <Cell>
                    <ScoreDisplay
                      percentage={
                        latest?.percentage ??
                        null
                      }
                      score={
                        latest?.score ??
                        null
                      }
                      totalMarks={
                        latest?.totalMarks ??
                        null
                      }
                    />
                  </Cell>

                  <Cell>
                    <ScoreDisplay
                      percentage={
                        submission
                          .highestScore
                          ?.percentage ??
                        null
                      }
                      score={
                        submission
                          .highestScore
                          ?.score ?? null
                      }
                      totalMarks={
                        submission
                          .highestScore
                          ?.totalMarks ??
                        null
                      }
                    />
                  </Cell>

                  <Cell>
                    <p className="font-black text-slate-800">
                      {submission
                        .highestScore
                        ?.grade ?? "—"}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="text-sm font-bold text-slate-700">
                      {latest
                        ? formatAssessmentDuration(
                            latest.timeSpentSeconds
                          )
                        : "—"}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="text-sm font-bold text-slate-700">
                      {formatDate(
                        latest?.submittedAt ??
                          null
                      )}
                    </p>
                  </Cell>

                  <Cell align="right">
                    {latest &&
                    (latest.status ===
                      "SUBMITTED" ||
                      latest.status ===
                        "AUTO_SUBMITTED") ? (
                      <Link
                        href={`/list/assessments/${assessmentId}/submissions/${submission.student.id}?attemptId=${latest.id}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    ) : (
                      <span className="text-xs font-bold text-slate-300">
                        No result
                      </span>
                    )}
                  </Cell>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </div>
  );
}

function Heading({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Cell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-5 align-middle ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

function ScoreDisplay({
  percentage,
  score,
  totalMarks,
}: {
  percentage: number | null;
  score: number | null;
  totalMarks: number | null;
}) {
  if (
    percentage === null ||
    score === null
  ) {
    return (
      <span className="text-slate-400">
        —
      </span>
    );
  }

  return (
    <div>
      <p className="text-lg font-black text-slate-950">
        {percentage}%
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {score}/{totalMarks ?? "—"}
      </p>
    </div>
  );
}