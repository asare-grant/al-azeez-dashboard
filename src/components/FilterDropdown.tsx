// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";

// interface FilterDropdownProps {}

// const FilterDropdown: React.FC<FilterDropdownProps> = () => {
//   const router = useRouter();
//   const [open, setOpen] = useState(false);
//   const [filters, setFilters] = useState({
//     student: "",
//     class: "",
//     term: "",
//   });

//   // Toggle dropdown
//   const toggleDropdown = () => setOpen(!open);

//   // Update URL query parameters
//   const applyFilters = () => {
//     const params = new URLSearchParams(window.location.search);

//     // Set or delete params based on filter values
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value) params.set(key, value);
//       else params.delete(key);
//     });

//     router.push(`${window.location.pathname}?${params.toString()}`);
//     setOpen(false);
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     setFilters({ student: "", class: "", term: "" });
//     const params = new URLSearchParams(window.location.search);
//     params.delete("student");
//     params.delete("class");
//     params.delete("term");
//     router.push(`${window.location.pathname}?${params.toString()}`);
//     setOpen(false);
//   };

//   return (
//     <div className="relative">
//       {/* Filter Button */}
//       <button
//         onClick={toggleDropdown}
//         className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C] hover:bg-yellow-300 transition"
//       >
//         <Image src="/filter.png" alt="Filter" width={14} height={14} />
//       </button>

//       {/* Dropdown */}
//       {open && (
//         <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 z-50 p-4">
//           <h3 className="text-sm font-semibold mb-2">Filter Invoices</h3>

//           {/* Student */}
//           <div className="mb-2">
//             <label className="block text-xs font-medium text-gray-600 mb-1">
//               Student
//             </label>
//             <input
//               type="text"
//               placeholder="Student name"
//               value={filters.student}
//               onChange={(e) =>
//                 setFilters((prev) => ({ ...prev, student: e.target.value }))
//               }
//               className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>

//           {/* Class */}
//           <div className="mb-2">
//             <label className="block text-xs font-medium text-gray-600 mb-1">
//               Class
//             </label>
//             <input
//               type="text"
//               placeholder="Class"
//               value={filters.class}
//               onChange={(e) =>
//                 setFilters((prev) => ({ ...prev, class: e.target.value }))
//               }
//               className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>

//           {/* Term */}
//           <div className="mb-4">
//             <label className="block text-xs font-medium text-gray-600 mb-1">
//               Term
//             </label>
//             <input
//               type="text"
//               placeholder="Term"
//               value={filters.term}
//               onChange={(e) =>
//                 setFilters((prev) => ({ ...prev, term: e.target.value }))
//               }
//               className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex justify-between gap-2">
//             <button
//               onClick={clearFilters}
//               className="flex-1 bg-gray-200 hover:bg-gray-300 text-xs py-2 rounded-md"
//             >
//               Clear
//             </button>
//             <button
//               onClick={applyFilters}
//               className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded-md"
//             >
//               Apply
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterDropdown;





"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const grades = [
  "Creche 1",
  "Nursery 1",
  "Nursery 2",
  "KG 1",
  "KG 2",
  "Basic 1",
  // "Basic 1B",
  "Basic 2",
  // "Basic 2B",
  "Basic 3",
  // "Basic 3B",
  "Basic 4",
  // "Basic 4B",
  "Basic 5",
  // "Basic 5B",
  "Basic 6",
  // "Basic 6B",
  "Basic 7",
  // "Basic 7B",
  "Basic 8",
  // "Basic 8B",
  "Basic 9",
  // "Basic 9B",
];

const terms = ["FIRST", "SECOND", "THIRD"];

const FilterDropdown = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({
    student: "",
    grade: "",
    term: "",
  });

  // Load existing URL filters on mount
  useEffect(() => {
    setFilters({
      student: searchParams.get("student") || "",
      grade: searchParams.get("grade") || "",
      term: searchParams.get("term") || "",
    });
  }, [searchParams]);

  // Helper: update single filter & URL
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);

    if (value) params.set(key, value);
    else params.delete(key);

    params.set("page", "1"); // Reset pagination

    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  // Student input updates state only (apply button will push)
  const handleStudentChange = (value: string) => {
    setFilters((prev) => ({ ...prev, student: value }));
  };

  // Apply all filters at once
  const applyFilters = () => {
    const params = new URLSearchParams(window.location.search);

    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });

    params.set("page", "1");

    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });

    setOpen(false);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ student: "", grade: "", term: "" });

    const params = new URLSearchParams(window.location.search);
    params.delete("student");
    params.delete("grade");
    params.delete("term");
    params.set("page", "1");

    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });

    setOpen(false);
  };

  return (
    <div className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FAE27C] hover:bg-yellow-300 transition"
      >
        <Image src="/filter.png" alt="Filter" width={14} height={14} />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-4 z-50">
          <h3 className="text-sm font-semibold mb-3">Filter Results</h3>

          {/* STUDENT NAME */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">
              Student Name
            </label>
            <input
              type="text"
              placeholder="Search by name…"
              value={filters.student}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full p-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* CLASS FILTER */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Grade</label>
            <select
              value={filters.grade}
              onChange={(e) => updateFilter("grade", e.target.value)}
              className="w-full p-2 border rounded-md text-sm outline-none"
            >
              <option value="">All Grades</option>
              {grades.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* TERM FILTER */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-1">Term</label>
            <select
              value={filters.term}
              onChange={(e) => updateFilter("term", e.target.value)}
              className="w-full p-2 border rounded-md text-sm outline-none"
            >
              <option value="">All Terms</option>
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex justify-between">
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>

            <button
              onClick={applyFilters}
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
