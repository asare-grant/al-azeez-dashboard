import Link from "next/link";

import {
  Edit3,
  Scale,
} from "lucide-react";

import type {
  AcademicWeightingListItem,
} from "@/lib/academic-weightings/types";


import AcademicWeightingStatusBadge from "./AcademicWeightingStatusBadge";

import AcademicWeightingActions  from "./AcademicWeightingActions";

function formatStrategy(
  value: string,
) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function AcademicWeightingTable({
  weightings,
}: {
  weightings:
    AcademicWeightingListItem[];
}) {
  return (
    <div className="hidden overflow-hidden rounded-[26px] border border-slate-200 xl:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1300px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <Heading>
                Academic Period
              </Heading>

              <Heading>
                Grade
              </Heading>

              <Heading>
                Grading Scale
              </Heading>

              <Heading>
                Assignment
              </Heading>

              <Heading>
                Assessment
              </Heading>

              <Heading>
                Examination
              </Heading>

              <Heading>
                Strategy
              </Heading>

              <Heading>
                Pass Mark
              </Heading>

              <Heading>
                Status
              </Heading>

              <Heading align="right">
                Actions
              </Heading>
            </tr>
          </thead>

          <tbody>
            {weightings.map(
              (weighting) => (
                <tr
                  key={
                    weighting.id
                  }
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                >
                  <Cell>
                    <p className="font-black text-slate-950">
                      {
                        weighting.academicYear
                      }
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {weighting.term.name.replace(
                        /_/g,
                        " ",
                      )}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="font-black text-slate-800">
                      {
                        weighting.grade
                          .level
                      }
                    </p>
                  </Cell>

                  <Cell>
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" />

                      <p className="font-bold text-slate-700">
                        {
                          weighting
                            .gradingScale
                            .name
                        }
                      </p>
                    </div>
                  </Cell>

                  <WeightCell
                    value={
                      weighting.assignmentWeight
                    }
                  />

                  <WeightCell
                    value={
                      weighting.assessmentWeight
                    }
                  />

                  <WeightCell
                    value={
                      weighting.examWeight
                    }
                  />

                  <Cell>
                    <p className="text-sm font-bold text-slate-700">
                      {formatStrategy(
                        weighting.assessmentScoreStrategy,
                      )}
                    </p>
                  </Cell>

                  <Cell>
                    <p className="text-lg font-black text-blue-700">
                      {
                        weighting.passMark
                      }
                      %
                    </p>
                  </Cell>

                  <Cell>
                    <AcademicWeightingStatusBadge
                      isActive={
                        weighting.isActive
                      }
                    />
                  </Cell>

                  <Cell align="right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/list/academic-settings/weightings/${weighting.id}/edit`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 text-xs font-black text-blue-700 hover:bg-blue-100"
                      >
                        <Edit3 className="h-3.5 w-3.5" />

                        Edit
                      </Link>

                      <AcademicWeightingActions
                        id={
                          weighting.id
                        }
                        label={`${weighting.grade.level} • ${weighting.academicYear}`}
                        isActive={
                          weighting.isActive
                        }
                      />
                    </div>
                  </Cell>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WeightCell({
  value,
}: {
  value: number;
}) {
  return (
    <Cell>
      <span className="inline-flex min-w-14 justify-center rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-800">
        {value}%
      </span>
    </Cell>
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
      className={`whitespace-nowrap px-4 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 ${
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