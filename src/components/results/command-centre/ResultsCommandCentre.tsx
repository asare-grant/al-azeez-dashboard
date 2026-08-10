import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  FileBarChart,
  LayoutDashboard,
} from "lucide-react";

import type {
  ResultsCommandCentreData,
} from "@/lib/results";

import ResultsCommandCentreEmptyState from "./ResultsCommandCentreEmptyState";
import ResultsCommandCentreFilters from "./ResultsCommandCentreFilters";
import ResultsCommandCentreHero from "./ResultsCommandCentreHero";
import ResultsCommandCentreMetrics from "./ResultsCommandCentreMetrics";
import ResultsCommandCentreMobileCard from "./ResultsCommandCentreMobileCard";
import ResultsCommandCentrePagination from "./ResultsCommandCentrePagination";
import ResultsCommandCentreTable from "./ResultsCommandCentreTable";

type ResultsCommandCentreProps = {
  data: ResultsCommandCentreData;
  hasActiveFilters: boolean;
};

export default function ResultsCommandCentre({
  data,
  hasActiveFilters,
}: ResultsCommandCentreProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
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
                    Legacy Results
                  </Link>
        
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </div>
      <div className="mx-auto max-w-[1800px]">
        <ResultsCommandCentreHero
          totalResults={
            data.total
          }
          uniqueStudents={
            data.metrics
              .uniqueStudents
          }
        />

        <div className="mt-6">
          <ResultsCommandCentreMetrics
            metrics={
              data.metrics
            }
          />
        </div>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileBarChart className="h-5 w-5 text-blue-600" />

                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                  Academic Records
                </p>
              </div>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                School result records
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Search, compare and
                investigate student
                performance across all
                supported academic result
                types.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
              <p className="text-xl font-black text-slate-950">
                {data.total}
              </p>

              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                Matching Results
              </p>
            </div>
          </div>

          <div className="mt-5">
            <ResultsCommandCentreFilters
              options={
                data.filters
              }
            />
          </div>

          {data.rows.length ===
          0 ? (
            <div className="mt-6">
              <ResultsCommandCentreEmptyState
                filtered={
                  hasActiveFilters
                }
              />
            </div>
          ) : (
            <>
              <div className="mt-6">
                <ResultsCommandCentreTable
                  rows={
                    data.rows
                  }
                />

                <div className="grid gap-4 xl:hidden">
                  {data.rows.map(
                    (result) => (
                      <ResultsCommandCentreMobileCard
                        key={
                          result.id
                        }
                        result={
                          result
                        }
                      />
                    ),
                  )}
                </div>
              </div>

              <ResultsCommandCentrePagination
                page={data.page}
                totalPages={
                  data.totalPages
                }
                total={
                  data.total
                }
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}