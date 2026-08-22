// src/components/results/StudentResultsPage.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { TermName } from "@prisma/client";

import type { UnifiedResultType, UnifiedStudentResult } from "@/lib/results";

import StudentResultMobileCard from "./StudentResultMobileCard";
import StudentResultsEmptyState from "./StudentResultsEmptyState";
import StudentResultsFilters from "./StudentResultsFilters";
import StudentResultsHero from "./StudentResultsHero";
import StudentResultsMetrics from "./StudentResultsMetrics";
import StudentResultsTable from "./StudentResultsTable";
import { ArrowLeft, BarChart3, LayoutDashboard } from "lucide-react";

type TermOption = {
  id: number;
  name: TermName;
  isActive?: boolean;
};

type StudentResultsPageProps = {
  studentName: string;

  results: UnifiedStudentResult[];

  terms: TermOption[];

  mode?: "student" | "parent";
};

export default function StudentResultsPage({
  studentName,
  results,
  terms,
  mode = "student",
}: StudentResultsPageProps) {
  const [academicYear, setAcademicYear] = useState("");

  const [termId, setTermId] = useState("");

  const [resultType, setResultType] = useState("");

  const academicYears = useMemo(() => {
    return Array.from(
      new Set(
        results
          .map((result) => result.academicYear)
          .filter((value): value is string => Boolean(value)),
      ),
    ).sort((a, b) => b.localeCompare(a));
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      const matchesYear = !academicYear || result.academicYear === academicYear;

      const matchesTerm = !termId || result.term?.id === Number(termId);

      const matchesType = !resultType || result.type === resultType;

      return matchesYear && matchesTerm && matchesType;
    });
  }, [academicYear, resultType, results, termId]);

  const validPercentages = filteredResults
    .map((result) => result.percentage)
    .filter((value): value is number => value !== null);

  const averagePercentage =
    validPercentages.length > 0
      ? validPercentages.reduce((sum, value) => sum + value, 0) /
        validPercentages.length
      : null;

  const highestPercentage =
    validPercentages.length > 0 ? Math.max(...validPercentages) : null;

  const passedCount = validPercentages.filter(
    (percentage) => percentage >= 50,
  ).length;

  const selectedTerm = terms.find((term) => term.id === Number(termId));

  function resetFilters() {
    setAcademicYear("");
    setTermId("");
    setResultType("");
  }

  const hasFilters = Boolean(academicYear || termId || resultType);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex flex-wrap gap-3">
          {mode === "student" ? (
            <>
              <Link
                href="/list/assessments"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Assessments
              </Link>

              {/* <Link
                href="/list/results/legacy"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <BarChart3 className="h-4 w-4" />
                Legacy Results
              </Link> */}

              <Link
                href="/student"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/parent/results"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                My Children
              </Link>

              {/* <Link
                href="/list/results/legacy"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <BarChart3 className="h-4 w-4" />
                Legacy Results
              </Link> */}

              <Link
                href="/student"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </>
          )}
        </div>
        <StudentResultsHero
          studentName={studentName}
          totalResults={filteredResults.length}
          academicYear={academicYear || null}
          termName={selectedTerm?.name ?? null}
        />

        <div className="mt-6">
          <StudentResultsMetrics
            totalResults={filteredResults.length}
            averagePercentage={averagePercentage}
            highestPercentage={highestPercentage}
            passedCount={passedCount}
          />
        </div>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Academic Records
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              Unified Results Centre
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              View examinations, assignments and online assessments in one
              place.
            </p>
          </div>

          <div className="mt-5">
            <StudentResultsFilters
              academicYears={academicYears}
              terms={terms}
              academicYear={academicYear}
              termId={termId}
              resultType={resultType}
              onAcademicYearChange={setAcademicYear}
              onTermChange={setTermId}
              onResultTypeChange={setResultType}
              onReset={resetFilters}
            />
          </div>

          {filteredResults.length === 0 ? (
            <div className="mt-6">
              <StudentResultsEmptyState filtered={hasFilters} />
            </div>
          ) : (
            <>
              <div className="mt-6 hidden lg:block">
                <StudentResultsTable results={filteredResults} />
              </div>

              <div className="mt-6 grid gap-4 lg:hidden">
                {filteredResults.map((result) => (
                  <StudentResultMobileCard key={result.id} result={result} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
