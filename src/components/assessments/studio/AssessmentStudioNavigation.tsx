"use client";

import {
  CalendarClock,
  CheckCircle2,
  FileQuestion,
  ListChecks,
  Settings2,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import type {
  AssessmentStudioSectionId,
  AssessmentStudioNavigationItem,
} from "./types";

type AssessmentStudioNavigationProps = {
  activeSection: AssessmentStudioSectionId;
  onSectionChange: (
    section: AssessmentStudioSectionId
  ) => void;
  questionCount: number;
};

const iconMap: Record<
  AssessmentStudioSectionId,
  LucideIcon
> = {
  overview: ListChecks,
  questions: FileQuestion,
  behaviour: Settings2,
  availability: CalendarClock,
  review: CheckCircle2,
};

const items: AssessmentStudioNavigationItem[] = [
  {
    id: "overview",
    label: "Basic Information",
    description: "Title, lesson and instructions",
  },
  {
    id: "questions",
    label: "Questions",
    description: "Build and organise questions",
  },
  {
    id: "behaviour",
    label: "Assessment Behaviour",
    description: "Attempts, timing and navigation",
  },
  {
    id: "availability",
    label: "Availability",
    description: "Start date and closing date",
  },
  {
    id: "review",
    label: "Review & Publish",
    description: "Validate and release",
  },
];

export default function AssessmentStudioNavigation({
  activeSection,
  onSectionChange,
  questionCount,
}: AssessmentStudioNavigationProps) {
  return (
    <>
      <div className="hidden xl:block">
        <div className="sticky top-5 rounded-[26px] border border-slate-200/80 bg-white p-3 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <div className="px-3 pb-3 pt-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              Assessment Studio
            </p>

            <h2 className="mt-2 text-lg font-black text-slate-950">
              Build your assessment
            </h2>
          </div>

          <nav className="space-y-1.5">
            {items.map((item, index) => {
              const Icon = iconMap[item.id];
              const isActive =
                item.id === activeSection;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onSectionChange(item.id)
                  }
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-white/15"
                        : "bg-slate-100 group-hover:bg-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black opacity-60">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <p className="truncate text-sm font-bold">
                        {item.label}
                      </p>
                    </div>

                    <p
                      className={`mt-0.5 truncate text-xs ${
                        isActive
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>

                  {item.id === "questions" ? (
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-black ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {questionCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="xl:hidden">
        <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2">
            {items.map((item, index) => {
              const Icon = iconMap[item.id];
              const isActive =
                item.id === activeSection;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onSectionChange(item.id)
                  }
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />

                  <span>
                    {index + 1}. {item.label}
                  </span>

                  {item.id === "questions" ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                        isActive
                          ? "bg-white/15"
                          : "bg-slate-100"
                      }`}
                    >
                      {questionCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}