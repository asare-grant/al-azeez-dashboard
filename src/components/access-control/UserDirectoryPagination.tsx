import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Link from "next/link";

type Props = {
  page:
    number;

  totalPages:
    number;

  total:
    number;

  searchParams:
    Record<
      string,
      string |
        undefined
    >;
};

function buildHref(
  searchParams:
    Record<
      string,
      string |
        undefined
    >,

  page:
    number,
) {
  const params =
    new URLSearchParams();

  for (
    const [
      key,
      value,
    ] of Object.entries(
      searchParams,
    )
  ) {
    if (
      value
    ) {
      params.set(
        key,
        value,
      );
    }
  }

  if (
    page >
    1
  ) {
    params.set(
      "page",
      String(
        page,
      ),
    );
  } else {
    params.delete(
      "page",
    );
  }

  const query =
    params.toString();

  return query
    ? `/list/access-control/users?${query}`
    : "/list/access-control/users";
}

export default function UserDirectoryPagination({
  page,
  totalPages,
  total,
  searchParams,
}: Props) {
  if (
    total ===
    0
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold text-slate-400">
        Page{" "}
        <span className="font-black text-slate-700">
          {
            page
          }
        </span>{" "}
        of{" "}
        <span className="font-black text-slate-700">
          {
            totalPages
          }
        </span>
        {" · "}
        <span className="font-black text-slate-700">
          {
            total
          }
        </span>{" "}
        users
      </p>

      <div className="flex items-center gap-2">
        {page >
        1 ? (
          <Link
            href={
              buildHref(
                searchParams,
                page - 1,
              )
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <ChevronLeft className="h-4 w-4" />

            Previous
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-black text-slate-300">
            <ChevronLeft className="h-4 w-4" />

            Previous
          </span>
        )}

        {page <
        totalPages ? (
          <Link
            href={
              buildHref(
                searchParams,
                page + 1,
              )
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-950 px-3 text-xs font-black text-white transition hover:bg-blue-700"
          >
            Next

            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-300">
            Next

            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}