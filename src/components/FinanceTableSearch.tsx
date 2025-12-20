// // FinanceTableSearch.

// "use client";

// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";

// interface FinanceTableSearchProps {
//   placeholder?: string; // optional prop
// }

// const FinanceTableSearch: React.FC<FinanceTableSearchProps> = () => {
//   const router = useRouter();
//   const [search, setSearch] = useState("");

//   // Initialize search input from URL
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const currentSearch = params.get("search") || "";
//     setSearch(currentSearch);
//   }, []);

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     const params = new URLSearchParams(window.location.search);

//     if (search) {
//       params.set("search", search);
//     } else {
//       params.delete("search");
//     }

//     router.push(`${window.location.pathname}?${params.toString()}`);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2 bg-white"
//     >
//       <Image src="/search.png" alt="Search" width={14} height={14} />
//       <input
//         type="text"
//         placeholder="Search all columns..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="w-[200px] p-2 bg-transparent outline-none text-sm"
//       />
//       <button
//         type="submit"
//         className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition"
//       >
//         Go
//       </button>
//     </form>
//   );
// };

// export default FinanceTableSearch;

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface FinanceTableSearchProps {
  placeholder?: string;
}

const FinanceTableSearch: React.FC<FinanceTableSearchProps> = ({ placeholder }) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Load search term from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("search") || "");
  }, []);

  const updateSearch = () => {
    const params = new URLSearchParams(window.location.search);

    if (search.trim() !== "") {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    // Always reset to page 1
    params.set("page", "1");

    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });

    router.refresh();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateSearch();
  };

  const clearSearch = () => {
    setSearch("");

    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.set("page", "1");

    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });

    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-3 bg-white"
    >
      <Image src="/search.png" alt="Search" width={14} height={14} />

      <input
        type="text"
        placeholder={placeholder || "Search all columns..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-[200px] p-2 bg-transparent outline-none text-sm"
      />

      {search && (
        <button
          type="button"
          onClick={clearSearch}
          className="text-gray-500 text-base px-1 hover:text-gray-700"
        >
          ✕
        </button>
      )}

      <button
        type="submit"
        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition"
      >
        Go
      </button>
    </form>
  );
};

export default FinanceTableSearch;
