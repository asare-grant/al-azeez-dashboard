import Pagination from "@/components/Pagination";

import type {
  ReportCardCommandFilters,
  ReportCardCommandItem,
  ReportCardCommandMetrics,
  ReportCardFilterOptions,
} from "../types";

import ReportCardCommandHero from "./ReportCardCommandHero";
import ReportCardEmptyState from "./ReportCardEmptyState";
import ReportCardFilters from "./ReportCardFilters";
import ReportCardMetrics from "./ReportCardMetrics";
import ReportCardMobileCard from "./ReportCardMobileCard";
import ReportCardTable from "./ReportCardTable";

type ReportCardCommandCentreProps = {
  items: ReportCardCommandItem[];

  metrics: ReportCardCommandMetrics;

  filterOptions: ReportCardFilterOptions;

  currentFilters: ReportCardCommandFilters;

  page: number;
  totalPages: number;
  total: number;

  canReview: boolean;
  canPublish: boolean;

  detailsHref?: (reportCardId: number) => string;

  printHref?: (reportCardId: number) => string;

  reviewHref?: (reportCardId: number) => string;
};

function parsePositiveInteger(value?: string) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export default function ReportCardCommandCentre({
  items,
  metrics,
  filterOptions,
  currentFilters,
  page,
  totalPages,
  total,
  canReview,
  canPublish,
  detailsHref,
  printHref,
  reviewHref,
}: ReportCardCommandCentreProps) {
  const selectedClassId = parsePositiveInteger(currentFilters.classId);

  const selectedTermId = parsePositiveInteger(currentFilters.termId);

  const selectedAcademicYear = currentFilters.academicYear?.trim() || undefined;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px]">
        <ReportCardCommandHero
          selectedClassId={selectedClassId}
          selectedAcademicYear={selectedAcademicYear}
          selectedTermId={selectedTermId}
          publishableCount={metrics.publishable}
          canReview={canReview}
          canPublish={canPublish}
        />

        <div className="mt-6">
          <ReportCardMetrics
            metrics={metrics}
            currentFilters={currentFilters}
          />
        </div>

        <div className="mt-6">
          <ReportCardFilters
            options={filterOptions}
            currentFilters={currentFilters}
          />
        </div>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Report Registry
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Student report cards
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {total} report {total === 1 ? "card" : "cards"} match the
                current filters.
              </p>
            </div>

            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-500">
              Page {page} of {totalPages}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-5 sm:p-6">
              <ReportCardEmptyState />
            </div>
          ) : (
            <>
              <ReportCardTable
                items={items}
                detailsHref={detailsHref}
                printHref={printHref}
                reviewHref={reviewHref}
              />

              <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2 xl:hidden">
                {items.map((item) => (
                  <ReportCardMobileCard
                    key={item.id}
                    item={item}
                    detailsHref={detailsHref}
                    printHref={printHref}
                    reviewHref={reviewHref}
                  />
                ))}
              </div>
            </>
          )}

          {totalPages > 1 ? (
            <div className="border-t border-slate-100 p-5">
              <Pagination page={page} count={total} />
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
