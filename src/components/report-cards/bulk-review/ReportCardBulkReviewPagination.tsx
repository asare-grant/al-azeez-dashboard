"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useMemo,
  useTransition,
} from "react";

type ReportCardBulkReviewPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
};

export default function ReportCardBulkReviewPagination({
  page,
  totalPages,
  total,
  pageSize,
}: ReportCardBulkReviewPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const visiblePages = useMemo(
    () =>
      buildVisiblePages({
        currentPage: page,
        totalPages,
      }),
    [page, totalPages],
  );

  const firstItem =
    total === 0
      ? 0
      : (page - 1) *
          pageSize +
        1;

  const lastItem =
    Math.min(
      page * pageSize,
      total,
    );

  function goToPage(
    nextPage: number,
  ) {
    const safePage = Math.min(
      Math.max(
        1,
        nextPage,
      ),
      totalPages,
    );

    if (
      safePage === page ||
      isPending
    ) {
      return;
    }

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (safePage === 1) {
      params.delete("page");
    } else {
      params.set(
        "page",
        String(safePage),
      );
    }

    const query =
      params.toString();

    startTransition(() => {
      router.push(
        query
          ? `${pathname}?${query}`
          : pathname,
        {
          scroll: false,
        },
      );
    });

    /*
     * The route changes immediately, but the
     * smooth scroll makes the new result page
     * easier to follow.
     */
    window.requestAnimationFrame(
      () => {
        document
          .getElementById(
            "bulk-review-queue",
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      },
    );
  }

  if (
    totalPages <= 1 ||
    total === 0
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-center lg:text-left">
        <p className="text-sm font-bold text-slate-700">
          Showing{" "}
          <span className="font-black text-slate-950">
            {firstItem}
          </span>{" "}
          to{" "}
          <span className="font-black text-slate-950">
            {lastItem}
          </span>{" "}
          of{" "}
          <span className="font-black text-slate-950">
            {total}
          </span>{" "}
          report cards
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Page {page} of{" "}
          {totalPages}
        </p>
      </div>

      <nav
        aria-label="Report-card pagination"
        className="flex flex-wrap items-center justify-center gap-1.5 lg:justify-end"
      >
        <PaginationButton
          label="First page"
          disabled={
            page <= 1 ||
            isPending
          }
          onClick={() =>
            goToPage(1)
          }
        >
          <ChevronsLeft className="h-4 w-4" />
        </PaginationButton>

        <PaginationButton
          label="Previous page"
          disabled={
            page <= 1 ||
            isPending
          }
          onClick={() =>
            goToPage(
              page - 1,
            )
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>

        <div className="mx-1 flex items-center gap-1.5">
          {visiblePages.map(
            (
              item,
              index,
            ) =>
              item ===
              "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-9 min-w-8 items-center justify-center px-1 text-sm font-black text-slate-400"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    goToPage(
                      item,
                    )
                  }
                  disabled={
                    isPending
                  }
                  aria-current={
                    item === page
                      ? "page"
                      : undefined
                  }
                  className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    item === page
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {item}
                </button>
              ),
          )}
        </div>

        <PaginationButton
          label="Next page"
          disabled={
            page >=
              totalPages ||
            isPending
          }
          onClick={() =>
            goToPage(
              page + 1,
            )
          }
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>

        <PaginationButton
          label="Last page"
          disabled={
            page >=
              totalPages ||
            isPending
          }
          onClick={() =>
            goToPage(
              totalPages,
            )
          }
        >
          <ChevronsRight className="h-4 w-4" />
        </PaginationButton>
      </nav>

      {isPending ? (
        <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-blue-50">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-600" />
        </div>
      ) : null}
    </div>
  );
}

function PaginationButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
    >
      {children}
    </button>
  );
}

type VisiblePage =
  | number
  | "ellipsis";

function buildVisiblePages({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}): VisiblePage[] {
  if (totalPages <= 7) {
    return Array.from(
      {
        length:
          totalPages,
      },
      (
        _,
        index,
      ) => index + 1,
    );
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "ellipsis",
      totalPages,
    ];
  }

  if (
    currentPage >=
    totalPages - 3
  ) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}