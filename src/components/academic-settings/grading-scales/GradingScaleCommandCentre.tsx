import {
  Scale,
} from "lucide-react";

import type {
  GradingScaleListItem,
} from "@/lib/academic-weightings/types";

import GradingScaleEmptyState from "./GradingScaleEmptyState";
import GradingScaleFilters from "./GradingScaleFilters";
import GradingScaleHero from "./GradingScaleHero";
import GradingScaleMetrics from "./GradingScaleMetrics";
import GradingScaleMobileCard from "./GradingScaleMobileCard";
import GradingScalePagination from "./GradingScalePagination";
import GradingScaleTable from "./GradingScaleTable";

type GradingScaleCommandCentreProps = {
  scales: GradingScaleListItem[];

  metrics: {
    total: number;
    draft: number;
    active: number;
    archived: number;

    defaultScale: {
      id: number;
      name: string;
      status: string;
    } | null;
  };

  page: number;
  totalPages: number;
  total: number;

  hasActiveFilters: boolean;
};

export default function GradingScaleCommandCentre({
  scales,
  metrics,
  page,
  totalPages,
  total,
  hasActiveFilters,
}: GradingScaleCommandCentreProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">
        <GradingScaleHero
          total={metrics.total}
          active={metrics.active}
        />

        <div className="mt-6">
          <GradingScaleMetrics
            metrics={metrics}
          />
        </div>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />

                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                  Grading Standards
                </p>
              </div>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                School grading scales
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Configure the score ranges, grade labels and remarks used by
                academic results and report cards.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
              <p className="text-xl font-black text-slate-950">
                {total}
              </p>

              <p className="text-[10px] font-black uppercase tracking-[0.13em] text-slate-400">
                Matching Scales
              </p>
            </div>
          </div>

          <div className="mt-5">
            <GradingScaleFilters />
          </div>

          {scales.length ===
          0 ? (
            <div className="mt-6">
              <GradingScaleEmptyState
                filtered={
                  hasActiveFilters
                }
              />
            </div>
          ) : (
            <>
              <div className="mt-6">
                <GradingScaleTable
                  scales={scales}
                />

                <div className="grid gap-4 xl:hidden">
                  {scales.map(
                    (scale) => (
                      <GradingScaleMobileCard
                        key={
                          scale.id
                        }
                        scale={
                          scale
                        }
                      />
                    ),
                  )}
                </div>
              </div>

              <GradingScalePagination
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