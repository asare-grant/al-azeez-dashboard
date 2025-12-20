// "use client";

// import { useRouter } from "next/navigation";

// const ITEMS = [10, 25, 50, 100];

// const FinancePagination = ({
//   page,
//   count,
//   limit,
// }: {
//   page: number;
//   count: number;
//   limit: number;
// }) => {
//   const router = useRouter();
//   const totalPages = Math.ceil(count / limit);
//   const maxVisiblePages = 5;

//   const hasPrev = page > 1;
//   const hasNext = page < totalPages;

//   const updateParams = (key: string, value: string) => {
//     const params = new URLSearchParams(window.location.search);
//     params.set(key, value);
//     params.set("page", "1"); // reset to page 1 for new filters
//     router.push(`${window.location.pathname}?${params.toString()}`, {
//       scroll: false,
//     });
//     router.refresh();
//   };

//   const changePage = (newPage: number) => {
//     updateParams("page", newPage.toString());
//   };

//   // Visible range
//   let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
//   let endPage = startPage + maxVisiblePages - 1;

//   if (endPage > totalPages) {
//     endPage = totalPages;
//     startPage = Math.max(1, endPage - maxVisiblePages + 1);
//   }

//   const visiblePages = [];
//   for (let i = startPage; i <= endPage; i++) {
//     visiblePages.push(i);
//   }

//   return (
//     <div className="p-4 flex items-center justify-between text-gray-600 gap-4">

//       {/* Items Per Page */}
//       <div className="flex items-center gap-2">
//         <span className="text-sm">Rows per page:</span>
//         <select
//           className="border rounded-md px-2 py-1 text-sm"
//           value={limit}
//           onChange={(e) => updateParams("limit", e.target.value)}
//         >
//           {ITEMS.map((item) => (
//             <option key={item} value={item}>
//               {item}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* FinancePagination Buttons */}
//       <div className="flex items-center gap-2 text-sm">

//         {/* Prev */}
//         <button
//           disabled={!hasPrev}
//           className="py-1 px-3 rounded bg-slate-200 disabled:opacity-40"
//           onClick={() => changePage(page - 1)}
//         >
//           Prev
//         </button>

//         {/* Pages */}
//         {startPage > 1 && (
//           <>
//             <button onClick={() => changePage(1)}>1</button>
//             {startPage > 2 && <span>…</span>}
//           </>
//         )}

//         {visiblePages.map((p) => (
//           <button
//             key={p}
//             className={`px-2 py-1 rounded ${
//               page === p ? "bg-blue-200 font-semibold" : ""
//             }`}
//             onClick={() => changePage(p)}
//           >
//             {p}
//           </button>
//         ))}

//         {endPage < totalPages && (
//           <>
//             {endPage < totalPages - 1 && <span>…</span>}
//             <button onClick={() => changePage(totalPages)}>
//               {totalPages}
//             </button>
//           </>
//         )}

//         {/* Next */}
//         <button
//           disabled={!hasNext}
//           className="py-1 px-3 rounded bg-slate-200 disabled:opacity-40"
//           onClick={() => changePage(page + 1)}
//         >
//           Next
//         </button>

//       </div>
//     </div>
//   );
// };

// export default FinancePagination;


"use client";

import { ArrowLeftFromLineIcon, ArrowRightFromLineIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const ITEMS = [10, 25, 50, 100];

const FinancePagination = ({
  page,
  count,
  limit,
}: {
  page: number;
  count: number;
  limit: number;
}) => {
  const router = useRouter();
  const totalPages = Math.ceil(count / limit);
  const maxVisiblePages = 2;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  // Generic URL param updater
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  // When LIMIT changes, reset pagination
  const updateLimit = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("limit", value);
    params.set("page", "1"); // only here we reset page
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  // When page changes, DO NOT reset to page 1
  const changePage = (newPage: number) => {
    updateParam("page", newPage.toString());
  };

  // Visible range
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
    <div className="p-4 flex flex-col md:flex-row items-center justify-between text-gray-600 gap-4">

      {/* Items Per Page */}
      <div className="flex items-center gap-2">
        <span className="text-sm">Rows per page:</span>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={limit}
          onChange={(e) => updateLimit(e.target.value)}
        >
          {ITEMS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-2 text-sm">

        {/* Prev */}
        <button
          disabled={!hasPrev}
          className="py-2 px-3 rounded bg-slate-200 disabled:opacity-40"
          onClick={() => changePage(page - 1)}
        >
          <ArrowLeftFromLineIcon size={14}/>
        </button>

        {/* Pages */}
        {startPage > 1 && (
          <>
            <button onClick={() => changePage(1)}>1</button>
            {startPage > 2 && <span>…</span>}
          </>
        )}

        {visiblePages.map((p) => (
          <button
            key={p}
            className={`px-2 py-1 rounded ${
              page === p ? "bg-blue-200 font-semibold" : ""
            }`}
            onClick={() => changePage(p)}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span>…</span>}
            <button onClick={() => changePage(totalPages)}>
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          disabled={!hasNext}
          className="py-2 px-3 rounded bg-slate-200 disabled:opacity-40"
          onClick={() => changePage(page + 1)}
        >
          <ArrowRightFromLineIcon size={14}/>
        </button>

      </div>
    </div>
  );
};

export default FinancePagination;
