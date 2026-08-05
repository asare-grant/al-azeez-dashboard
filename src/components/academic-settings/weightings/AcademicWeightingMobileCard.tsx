import Link from "next/link";

import {
  Edit3,
  Scale,
} from "lucide-react";

import type {
  AcademicWeightingListItem,
} from "@/lib/academic-weightings/types";


import AcademicWeightingStatusBadge from "./AcademicWeightingStatusBadge";

import AcademicWeightingActions from "./AcademicWeightingActions";


export default function AcademicWeightingMobileCard({
  weighting,
}: {
  weighting:
    AcademicWeightingListItem;
}) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <AcademicWeightingStatusBadge
              isActive={
                weighting.isActive
              }
            />

            <h3 className="mt-3 text-xl font-black text-slate-950">
              {
                weighting.grade
                  .level
              }
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              {
                weighting.academicYear
              }{" "}
              •{" "}
              {weighting.term.name.replace(
                /_/g,
                " ",
              )}
            </p>
          </div>

          <AcademicWeightingActions
            id={weighting.id}
            label={`${weighting.grade.level} • ${weighting.academicYear}`}
            isActive={
              weighting.isActive
            }
          />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-blue-50 p-3 text-sm font-bold text-blue-700">
          <Scale className="h-4 w-4" />

          {
            weighting.gradingScale
              .name
          }
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 p-5">
        <WeightMetric
          label="Assignment"
          value={
            weighting.assignmentWeight
          }
        />

        <WeightMetric
          label="Assessment"
          value={
            weighting.assessmentWeight
          }
        />

        <WeightMetric
          label="Exam"
          value={
            weighting.examWeight
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 pb-5">
        <Detail
          label="Pass Mark"
          value={`${weighting.passMark}%`}
        />

        <Detail
          label="Strategy"
          value={weighting.assessmentScoreStrategy.replace(
            /_/g,
            " ",
          )}
        />
      </div>

      <div className="border-t border-slate-100 p-4">
        <Link
          href={`/list/academic-settings/weightings/${weighting.id}/edit`}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-black text-white hover:bg-blue-700"
        >
          <Edit3 className="h-4 w-4" />

          Open Weighting Studio
        </Link>
      </div>
    </article>
  );
}

function WeightMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <p className="text-xl font-black text-slate-950">
        {value}%
      </p>

      <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-xs font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}