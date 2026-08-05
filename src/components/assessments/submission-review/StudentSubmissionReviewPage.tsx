import Link from "next/link";

import { ArrowLeft, BarChart3, LayoutDashboard } from "lucide-react";

import type {
  TeacherStudentSubmissionReview,
} from "@/lib/assessments/types";

import StudentAttemptComparison from "./StudentAttemptComparison";
import StudentAttemptHistory from "./StudentAttemptHistory";
import StudentQuestionReview from "./StudentQuestionReview";
import StudentSubmissionReviewHeader from "./StudentSubmissionReviewHeader";
import StudentSubmissionSummary from "./StudentSubmissionSummary";
import SubmissionReviewEmptyState from "./SubmissionReviewEmptyState";
import TeacherFeedbackPanel from "./TeacherFeedbackPanel";

type StudentSubmissionReviewPageProps = {
  data: TeacherStudentSubmissionReview;
};

export default function StudentSubmissionReviewPage({
  data,
}: StudentSubmissionReviewPageProps) {
  const attempt =
    data.selectedAttempt;

  return (
    <div className="print:bg-white min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="print:max-w-none mx-auto max-w-[1600px]">
        <div className="mb-4 flex flex-wrap gap-3">
                  <Link
                    href="/list/assessments"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Assessments
                  </Link>
        
                  <Link
                    href="/list/results/legacy"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Results Centre
                  </Link>
        
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </div>
        <StudentSubmissionReviewHeader
          data={data}
        />

        {data.attempts.length === 0 ? (
          <div className="mt-6">
            <SubmissionReviewEmptyState />
          </div>
        ) : (
          <>
            <div className="mt-6 grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
              <div className="space-y-5">
                <StudentAttemptHistory
                  assessmentId={
                    data.assessment.id
                  }
                  studentId={
                    data.student.id
                  }
                  attempts={
                    data.attempts
                  }
                  selectedAttemptId={
                    attempt?.id ?? null
                  }
                />

                <StudentAttemptComparison
                  comparison={
                    data.comparison
                  }
                />
              </div>

              <div className="min-w-0 space-y-5">
                <StudentSubmissionSummary
                  data={data}
                />

                <StudentQuestionReview
                  questions={
                    data.questions
                  }
                />
              </div>

              <div className="xl:sticky xl:top-6">
                {attempt ? (
                  <TeacherFeedbackPanel
                    assessmentId={
                      data.assessment.id
                    }
                    studentId={
                      data.student.id
                    }
                    attemptId={
                      attempt.id
                    }
                    initialFeedback={
                      attempt.teacherFeedback
                    }
                    reviewedAt={
                      attempt.reviewedAt
                    }
                    reviewedBy={
                      attempt.reviewedBy
                    }
                    disabled={
                      attempt.status !==
                        "SUBMITTED" &&
                      attempt.status !==
                        "AUTO_SUBMITTED"
                    }
                  />
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}