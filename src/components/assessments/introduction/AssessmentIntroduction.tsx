import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import type {
  StudentAssessmentIntroductionData,
} from "@/lib/assessments/types";

import AssessmentInstructionCard from "./AssessmentInstructionCard";
import AssessmentIntroductionHero from "./AssessmentIntroductionHero";
import AssessmentStartPanel from "./AssessmentStartPanel";

type AssessmentIntroductionProps = {
  assessment: StudentAssessmentIntroductionData;
};

export default function AssessmentIntroduction({
  assessment,
}: AssessmentIntroductionProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        <Link
          href="/student/assessments"
          className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assessments
        </Link>

        <AssessmentIntroductionHero
          assessment={assessment}
        />

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <AssessmentInstructionCard
            instructions={
              assessment.instructions
            }
          />

          <div className="lg:sticky lg:top-6">
            <AssessmentStartPanel
              assessment={assessment}
            />
          </div>
        </div>
      </div>
    </div>
  );
}