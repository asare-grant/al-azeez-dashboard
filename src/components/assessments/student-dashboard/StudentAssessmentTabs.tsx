"use client";

import type {
  StudentAssessmentTab,
} from "./types";

type StudentAssessmentTabsProps = {
  activeTab: StudentAssessmentTab;

  onChange: (
    tab: StudentAssessmentTab
  ) => void;

  counts: Record<
    StudentAssessmentTab,
    number
  >;
};

const tabs: {
  label: string;
  value: StudentAssessmentTab;
}[] = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Available",
    value: "AVAILABLE",
  },
  {
    label: "In Progress",
    value: "IN_PROGRESS",
  },
  {
    label: "Upcoming",
    value: "UPCOMING",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
  {
    label: "Missed",
    value: "MISSED",
  },
];

export default function StudentAssessmentTabs({
  activeTab,
  onChange,
  counts,
}: StudentAssessmentTabsProps) {
  return (
    <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const active =
            activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                onChange(tab.value)
              }
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-white text-slate-500"
                }`}
              >
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}