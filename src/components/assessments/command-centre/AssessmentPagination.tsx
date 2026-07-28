"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type AssessmentPaginationProps = {
  page: number;
  totalPages: number;
};

export default function AssessmentPagination({
  page,
  totalPages,
}: AssessmentPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams =
    useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function goToPage(nextPage: number) {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set(
      "page",
      String(nextPage)
    );

    router.push(
      `${pathname}?${params.toString()}`
    );
  }

  const pages = Array.from(
    {
      length: totalPages,
    },
    (_, index) => index + 1
  ).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - page) <= 1
  );

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
      <p className="text-sm font-semibold text-slate-500">
        Page{" "}
        <span className="font-black text-slate-800">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-black text-slate-800">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            goToPage(page - 1)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map(
          (pageNumber, index) => {
            const previousPage =
              pages[index - 1];

            return (
              <div
                key={pageNumber}
                className="flex items-center gap-2"
              >
                {previousPage &&
                pageNumber -
                  previousPage >
                  1 ? (
                  <span className="px-1 text-slate-400">
                    …
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={() =>
                    goToPage(
                      pageNumber
                    )
                  }
                  className={`h-10 min-w-10 rounded-xl px-3 text-sm font-black transition ${
                    pageNumber === page
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber}
                </button>
              </div>
            );
          }
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() =>
            goToPage(page + 1)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}