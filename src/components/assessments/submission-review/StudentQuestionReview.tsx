import {
  FileSearch,
} from "lucide-react";

import type {
  TeacherSubmissionReviewQuestion,
} from "@/lib/assessments/types";

import StudentQuestionReviewCard from "./StudentQuestionReviewCard";

type StudentQuestionReviewProps = {
  questions:
    TeacherSubmissionReviewQuestion[];
};

export default function StudentQuestionReview({
  questions,
}: StudentQuestionReviewProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="print:shadow-none rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-blue-600">
          <FileSearch className="h-6 w-6" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
            Response Review
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Question-by-question responses
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Review the student’s selected
            answers, marks and time spent.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {questions.map(
          (question) => (
            <StudentQuestionReviewCard
              key={question.id}
              question={question}
            />
          )
        )}
      </div>
    </section>
  );
}