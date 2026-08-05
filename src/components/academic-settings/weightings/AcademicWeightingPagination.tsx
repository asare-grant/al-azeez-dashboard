"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AcademicWeightingPagination({
  page,
  totalPages,
  total,
}: {
  page: number;
  totalPages: number;
  total: number;
}) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const searchParams =
    useSearchParams();

  function navigate(
    nextPage: number,
  ) {
    if (
      nextPage < 1 ||
      nextPage > totalPages
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (nextPage === 1) {
      params.delete("page");
    } else {
      params.set(
        "page",
        String(nextPage),
      );
    }

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname,
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-500">
        Page{" "}
        <span className="font-black text-slate-900">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-black text-slate-900">
          {totalPages}
        </span>{" "}
        • {total} academic weightings
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            navigate(page - 1)
          }
          disabled={page <= 1}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />

          Previous
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(page + 1)
          }
          disabled={
            page >= totalPages
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next

          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}