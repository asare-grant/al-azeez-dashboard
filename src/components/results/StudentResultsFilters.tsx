"use client";

import {
  CalendarRange,
  Filter,
  RotateCcw,
} from "lucide-react";

import type {
  TermName,
} from "@prisma/client";

import type {
  UnifiedResultType,
} from "@/lib/results";

export type StudentResultTermOption = {
  id: number;
  name: TermName;
  isActive?: boolean;
};

type StudentResultsFiltersProps = {
  academicYears: string[];
  terms: StudentResultTermOption[];

  academicYear: string;
  termId: string;
  resultType: string;

  onAcademicYearChange:
    (value: string) => void;

  onTermChange:
    (value: string) => void;

  onResultTypeChange:
    (value: string) => void;

  onReset: () => void;
};

export default function StudentResultsFilters({
  academicYears,
  terms,
  academicYear,
  termId,
  resultType,
  onAcademicYearChange,
  onTermChange,
  onResultTypeChange,
  onReset,
}: StudentResultsFiltersProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
        <div className="flex items-center gap-3 xl:mr-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <Filter className="h-4.5 w-4.5" />
          </div>

          <div>
            <p className="text-sm font-black text-slate-900">
              Filter Results
            </p>

            <p className="text-xs text-slate-500">
              Narrow the academic record
            </p>
          </div>
        </div>

        <FilterField
          label="Academic Year"
        >
          <select
            value={academicYear}
            onChange={(event) =>
              onAcademicYearChange(
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All Academic Years
            </option>

            {academicYears.map(
              (year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              )
            )}
          </select>
        </FilterField>

        <FilterField label="Term">
          <select
            value={termId}
            onChange={(event) =>
              onTermChange(
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All Terms
            </option>

            {terms.map((term) => (
              <option
                key={term.id}
                value={term.id}
              >
                {formatTermName(
                  term.name
                )}
                {term.isActive
                  ? " — Active"
                  : ""}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Result Type">
          <select
            value={resultType}
            onChange={(event) =>
              onResultTypeChange(
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">
              All Result Types
            </option>

            {(
              [
                "EXAM",
                "ASSIGNMENT",
                "ASSESSMENT",
              ] satisfies UnifiedResultType[]
            ).map((type) => (
              <option
                key={type}
                value={type}
              >
                {formatTermName(
                  type
                )}
              </option>
            ))}
          </select>
        </FilterField>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400">
        <CalendarRange className="h-3.5 w-3.5" />
        Filters update the visible
        results instantly.
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </label>

      {children}
    </div>
  );
}

function formatTermName(
  value: string
) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}