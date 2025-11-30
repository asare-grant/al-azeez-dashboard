"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();

  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const maxVisiblePages = 5; // max buttons to show at once

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    router.refresh();
  };

  // calculate visible page numbers
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  let endPage = startPage + maxVisiblePages - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <div className="p-4 flex items-center justify-between text-gray-500">
      <button
        disabled={!hasPrev}
        className="py-2 px-4 rounded-md bg-slate-200 text-xs font-semibold disabled:opacity-50 hidden md:block disabled:cursor-not-allowed cursor-pointer"
        onClick={() => changePage(page - 1)}
      >
        Prev
      </button>

      <div className="flex items-center gap-2 text-sm">
        {startPage > 1 && (
          <>
            <button className="px-2 rounded-sm cursor-pointer" onClick={() => changePage(1)}>1</button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {visiblePages.map((p) => (
          <button
            key={p}
            className={`px-2 rounded-sm cursor-pointer ${page === p ? "bg-[#C3EBFA]" : ""}`}
            onClick={() => changePage(p)}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button className="px-2 rounded-sm cursor-pointer" onClick={() => changePage(totalPages)}>
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        className="py-2 px-4 rounded-md cursor-pointer bg-slate-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hidden md:block"
        disabled={!hasNext}
        onClick={() => changePage(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
