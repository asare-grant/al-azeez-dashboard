"use client";

import {
  useMemo,
  useState,
} from "react";

import StudentAssessmentCard from "./StudentAssessmentCard";
import StudentAssessmentEmptyState from "./StudentAssessmentEmptyState";
import StudentAssessmentHero from "./StudentAssessmentHero";
import StudentAssessmentMetrics from "./StudentAssessmentMetrics";
import StudentAssessmentTabs from "./StudentAssessmentTabs";

import type {
  StudentAssessmentDashboardProps,
  StudentAssessmentTab,
} from "./types";

export default function StudentAssessmentDashboard({
  studentName,
  items,
  metrics,
}: StudentAssessmentDashboardProps) {
  const [activeTab, setActiveTab] =
    useState<StudentAssessmentTab>(
      "ALL"
    );

  const counts = useMemo(
    () => ({
      ALL: items.length,

      AVAILABLE: items.filter(
        (item) =>
          item.status === "AVAILABLE"
      ).length,

      IN_PROGRESS: items.filter(
        (item) =>
          item.status ===
          "IN_PROGRESS"
      ).length,

      UPCOMING: items.filter(
        (item) =>
          item.status === "UPCOMING"
      ).length,

      COMPLETED: items.filter(
        (item) =>
          item.status ===
          "COMPLETED"
      ).length,

      MISSED: items.filter(
        (item) =>
          item.status === "MISSED"
      ).length,

      CLOSED: items.filter(
        (item) =>
          item.status === "CLOSED"
      ).length,
    }),
    [items]
  );

  const filteredItems =
    useMemo(() => {
      if (activeTab === "ALL") {
        return items;
      }

      return items.filter(
        (item) =>
          item.status === activeTab
      );
    }, [activeTab, items]);

    

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <StudentAssessmentHero
          studentName={studentName}
          availableCount={
            metrics.available
          }
        />

        <div className="mt-6">
          <StudentAssessmentMetrics
            metrics={metrics}
          />
        </div>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                My Assessments
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Assessment workspace
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Start, continue or review
                your assigned assessments.
              </p>
            </div>

            <StudentAssessmentTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              counts={counts}
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="mt-5">
              <StudentAssessmentEmptyState
                filtered={
                  activeTab !== "ALL"
                }
              />
            </div>
          ) : (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {filteredItems.map(
                (assessment) => (
                  <StudentAssessmentCard
                    key={assessment.id}
                    assessment={
                      assessment
                    }
                  />
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}