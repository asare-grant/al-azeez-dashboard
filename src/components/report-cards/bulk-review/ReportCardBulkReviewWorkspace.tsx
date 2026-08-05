"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-toastify";

import type {
  ReportCardBulkReviewData,
  ReportCardBulkReviewFilters,
} from "@/lib/report-cards/bulk-review-types";

import ReportCardBulkReviewPagination from "./ReportCardBulkReviewPagination";

import {
  bulkApproveReportCards,
  bulkPublishReportCards,
  bulkRequestReportCardChanges,
} from "@/lib/report-cards/bulk-review-actions";

import ReportCardBulkActionBar from "./ReportCardBulkActionBar";

import ReportCardBulkActionModal, {
  type BulkActionType,
} from "./ReportCardBulkActionModal";

import ReportCardBulkReviewEmptyState from "./ReportCardBulkReviewEmptyState";

import ReportCardBulkReviewFilterss from "./ReportCardBulkReviewFilters";
import ReportCardBulkReviewHero from "./ReportCardBulkReviewHero";
import ReportCardBulkReviewMetrics from "./ReportCardBulkReviewMetrics";
import ReportCardBulkReviewMobileCard from "./ReportCardBulkReviewMobileCard";
import ReportCardBulkReviewTable from "./ReportCardBulkReviewTable";

type ReportCardBulkReviewWorkspaceProps = {
  data: ReportCardBulkReviewData;

  currentFilters: ReportCardBulkReviewFilters;
};

export default function ReportCardBulkReviewWorkspace({
  data,
  currentFilters,
}: ReportCardBulkReviewWorkspaceProps) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [activeAction, setActiveAction] = useState<BulkActionType | null>(null);

  const [note, setNote] = useState("");

  const [isPending, startTransition] = useTransition();

  const selectedItems = useMemo(
    () => data.items.filter((item) => selectedIds.has(item.id)),
    [data.items, selectedIds],
  );

  const approveIds = useMemo(
    () =>
      selectedItems.filter((item) => item.canApprove).map((item) => item.id),
    [selectedItems],
  );

  const correctionIds = useMemo(
    () =>
      selectedItems
        .filter((item) => item.canRequestChanges)
        .map((item) => item.id),
    [selectedItems],
  );

  const publishIds = useMemo(
    () =>
      selectedItems.filter((item) => item.canPublish).map((item) => item.id),
    [selectedItems],
  );

  const allPageSelected =
    data.items.length > 0 &&
    data.items.every((item) => selectedIds.has(item.id));

  function toggleItem(reportCardId: number) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(reportCardId)) {
        next.delete(reportCardId);
      } else {
        next.add(reportCardId);
      }

      return next;
    });
  }

  function toggleAllPage() {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (allPageSelected) {
        for (const item of data.items) {
          next.delete(item.id);
        }
      } else {
        for (const item of data.items) {
          next.add(item.id);
        }
      }

      return next;
    });
  }

  function openAction(action: BulkActionType) {
    setNote("");
    setActiveAction(action);
  }

  function closeModal() {
    if (isPending) {
      return;
    }

    setActiveAction(null);

    setNote("");
  }

  function handleConfirm() {
    if (!activeAction || isPending) {
      return;
    }

    const ids =
      activeAction === "approve"
        ? approveIds
        : activeAction === "request-changes"
          ? correctionIds
          : publishIds;

    if (ids.length === 0) {
      toast.error(
        "None of the selected report cards are eligible for this action.",
      );

      return;
    }

    startTransition(async () => {
      const result =
        activeAction === "approve"
          ? await bulkApproveReportCards({
              reportCardIds: ids,

              reviewNote: note,
            })
          : activeAction === "request-changes"
            ? await bulkRequestReportCardChanges({
                reportCardIds: ids,

                reviewNote: note,
              })
            : await bulkPublishReportCards({
                reportCardIds: ids,
              });

      if (!result.success) {
        toast.error(result.message);

        return;
      }

      toast.success(result.message);

      if (result.data.skipped > 0) {
        toast.warning(
          `${result.data.skipped} selected report card${
            result.data.skipped === 1 ? " was" : "s were"
          } skipped.`,
        );
      }

      setSelectedIds(new Set());

      setActiveAction(null);

      setNote("");

      router.refresh();
    });
  }

const visiblePageKey =
  useMemo(
    () =>
      data.items
        .map(
          (item) =>
            item.id,
        )
        .join("-"),

    [data.items],
  );

useEffect(() => {
  setSelectedIds(
    new Set(),
  );

  setActiveAction(
    null,
  );

  setNote("");
}, [
  data.pagination.page,
  visiblePageKey,
]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-[1800px]">
        <ReportCardBulkReviewHero metrics={data.metrics} />

        <div className="mt-6">
          <ReportCardBulkReviewMetrics metrics={data.metrics} />
        </div>

        <div className="mt-6">
          <ReportCardBulkReviewFilterss
            options={data.options}
            currentFilters={currentFilters}
          />
        </div>

        <section
          id="bulk-review-queue"
          className="relative mt-6 scroll-mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]"
        >
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Review Queue
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-950 sm:text-2xl">
                Student report cards
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select visible report cards and process only the eligible
                records.
              </p>
            </div>

            {data.items.length > 0 ? (
              <button
                type="button"
                onClick={toggleAllPage}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                {allPageSelected
                  ? "Clear Visible Selection"
                  : "Select All Visible"}
              </button>
            ) : null}
          </div>

         {data.items.length === 0 ? (
            <div className="p-5 sm:p-6">
                <ReportCardBulkReviewEmptyState />
            </div>
            ) : (
            <>
                <ReportCardBulkReviewTable
                items={
                    data.items
                }
                selectedIds={
                    selectedIds
                }
                allPageSelected={
                    allPageSelected
                }
                onToggleAll={
                    toggleAllPage
                }
                onToggle={
                    toggleItem
                }
                />

                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:hidden">
                {data.items.map(
                    (item) => (
                    <ReportCardBulkReviewMobileCard
                        key={
                        item.id
                        }
                        item={
                        item
                        }
                        selected={selectedIds.has(
                        item.id,
                        )}
                        onToggle={() =>
                        toggleItem(
                            item.id,
                        )
                        }
                    />
                    ),
                )}
                </div>

                <ReportCardBulkReviewPagination
                page={
                    data.pagination.page
                }
                totalPages={
                    data.pagination
                    .totalPages
                }
                total={
                    data.pagination.total
                }
                pageSize={
                    data.pagination
                    .pageSize
                }
                />
            </>
            )}
        </section>

        <ReportCardBulkActionBar
          selectedCount={selectedIds.size}
          selectableApproveCount={approveIds.length}
          selectableCorrectionCount={correctionIds.length}
          selectablePublishCount={publishIds.length}
          onClear={() => setSelectedIds(new Set())}
          onAction={openAction}
        />
      </div>

      <ReportCardBulkActionModal
        open={activeAction !== null}
        action={activeAction}
        selectedCount={
          activeAction === "approve"
            ? approveIds.length
            : activeAction === "request-changes"
              ? correctionIds.length
              : publishIds.length
        }
        note={note}
        isPending={isPending}
        onNoteChange={setNote}
        onClose={closeModal}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
