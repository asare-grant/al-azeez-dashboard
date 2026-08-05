import {
  Calculator,
} from "lucide-react";

import type {
  AcademicWeightingFormOptions,
  AcademicWeightingListItem,
  AcademicWeightingMetrics as Metrics,
} from "@/lib/academic-weightings/types";

import AcademicWeightingEmptyState from "./AcademicWeightingEmptyState";
import AcademicWeightingFilters from "./AcademicWeightingFilters";
import AcademicWeightingHero from "./AcademicWeightingHero";
import AcademicWeightingMetrics from "./AcademicWeightingMetrics";
import AcademicWeightingMobileCard from "./AcademicWeightingMobileCard";
import AcademicWeightingPagination from "./AcademicWeightingPagination";
import AcademicWeightingTable from "./AcademicWeightingTable";

export default function AcademicWeightingCommandCentre({
  weightings,
  metrics,
  options,

  page,
  totalPages,
  total,

  hasActiveFilters,
}: {
  weightings:
    AcademicWeightingListItem[];

  metrics:
    Metrics;

  options:
    AcademicWeightingFormOptions;

  page: number;
  totalPages: number;
  total: number;

  hasActiveFilters: boolean;
}) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">
        <AcademicWeightingHero
          total={metrics.total}
          active={metrics.active}
        />

        <div className="mt-6">
          <AcademicWeightingMetrics
            metrics={metrics}
          />
        </div>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Calculator className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Calculation Rules
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Academic weighting configurations
              </h2>
            </div>
          </div>

          <div className="mt-5">
            <AcademicWeightingFilters
              options={options}
            />
          </div>

          {weightings.length ===
          0 ? (
            <div className="mt-6">
              <AcademicWeightingEmptyState
                filtered={
                  hasActiveFilters
                }
              />
            </div>
          ) : (
            <>
              <div className="mt-6">
                <AcademicWeightingTable
                  weightings={
                    weightings
                  }
                />

                <div className="grid gap-4 xl:hidden">
                  {weightings.map(
                    (weighting) => (
                      <AcademicWeightingMobileCard
                        key={
                          weighting.id
                        }
                        weighting={
                          weighting
                        }
                      />
                    ),
                  )}
                </div>
              </div>

              <AcademicWeightingPagination
                page={page}
                totalPages={
                  totalPages
                }
                total={total}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}