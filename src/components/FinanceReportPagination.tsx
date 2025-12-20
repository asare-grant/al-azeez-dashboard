"use client";

import { ArrowLeftFromLineIcon, ArrowRightFromLineIcon } from "lucide-react";

type Props = {
  page: number;
  limit: number;
  count: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const ITEMS = [10, 25, 50, 100];

const FinancePagination = ({
  page,
  limit,
  count,
  onPageChange,
  onLimitChange,
}: Props) => {
  const totalPages = Math.ceil(count / limit);
  const maxVisiblePages = 3;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Visible range
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) visiblePages.push(i);

  return (
    <div className="p-4 flex flex-col md:flex-row items-center justify-between text-gray-600 gap-4">

      {/* Rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm">Rows per page:</span>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          {ITEMS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-2 text-sm">

        {/* Prev */}
        <button
          disabled={!hasPrev}
          className="py-2 px-3 rounded bg-slate-200 disabled:opacity-40"
          onClick={() => onPageChange(page - 1)}
        >
          <ArrowLeftFromLineIcon size={14}/>
        </button>

        {/* Page numbers */}
        {startPage > 1 && <>
          <button onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <span>…</span>}
        </>}
        {visiblePages.map((p) => (
          <button
            key={p}
            className={`px-2 py-1 rounded ${page === p ? "bg-blue-200 font-semibold" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        {endPage < totalPages && <>
          {endPage < totalPages - 1 && <span>…</span>}
          <button onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>}

        {/* Next */}
        <button
          disabled={!hasNext}
          className="py-2 px-3 rounded bg-slate-200 disabled:opacity-40"
          onClick={() => onPageChange(page + 1)}
        >
          <ArrowRightFromLineIcon size={14}/>
        </button>

      </div>
    </div>
  );
};

export default FinancePagination;
