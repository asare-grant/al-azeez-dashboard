"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Search,
} from "lucide-react";

import type {
  TeacherAssessmentSubmissionSummary,
  TeacherAssessmentSubmissionStatus,
} from "@/lib/assessments/types";

import AssessmentSubmissionMetrics from "./AssessmentSubmissionMetrics";
import AssessmentSubmissionMobileCard from "./AssessmentSubmissionMobileCard";
import AssessmentSubmissionTable from "./AssessmentSubmissionTable";
import AssessmentSubmissionsHeader from "./AssessmentSubmissionsHeader";
import AssessmentSubmissionEmptyState from "./AssessmentSubmissionEmptyState";

type AssessmentSubmissionsPageProps = {
  data: TeacherAssessmentSubmissionSummary;
};

type SubmissionFilter =
  | "ALL"
  | TeacherAssessmentSubmissionStatus
  | "PASSED"
  | "FAILED";

export default function AssessmentSubmissionsPage({
  data,
}: AssessmentSubmissionsPageProps) {
  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<SubmissionFilter>(
      "ALL"
    );

  const filteredSubmissions =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return data.submissions.filter(
        (submission) => {
          const fullName =
            `${submission.student.name} ${submission.student.surname}`.toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            fullName.includes(
              normalizedSearch
            ) ||
            submission.student.studentID
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesFilter =
            filter === "ALL"
              ? true
              : filter === "PASSED"
              ? submission.passed ===
                true
              : filter === "FAILED"
              ? submission.passed ===
                false
              : submission.status ===
                filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      data.submissions,
      filter,
      search,
    ]);

  const filters: {
    label: string;
    value: SubmissionFilter;
  }[] = [
    {
      label: "All",
      value: "ALL",
    },
    {
      label: "Submitted",
      value: "SUBMITTED",
    },
    {
      label: "Auto Submitted",
      value: "AUTO_SUBMITTED",
    },
    {
      label: "In Progress",
      value: "IN_PROGRESS",
    },
    {
      label: "Not Started",
      value: "NOT_STARTED",
    },
    {
      label: "Passed",
      value: "PASSED",
    },
    {
      label: "Failed",
      value: "FAILED",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <AssessmentSubmissionsHeader
          assessmentId={
            data.assessment.id
          }
          title={
            data.assessment.title
          }
          subject={
            data.assessment.lesson
              .subject.name
          }
          className={
            data.assessment.lesson
              .class.name
          }
        />

        <div className="mt-6">
          <AssessmentSubmissionMetrics
            metrics={data.metrics}
          />
        </div>

        <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Student Records
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Assessment submissions
              </h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search student name or ID..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-2">
                  {filters.map(
                    (item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setFilter(
                            item.value
                          )
                        }
                        className={`rounded-xl px-3 py-2.5 text-xs font-black transition ${
                          filter ===
                          item.value
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {filteredSubmissions.length ===
          0 ? (
            <div className="mt-5">
              <AssessmentSubmissionEmptyState />
            </div>
          ) : (
            <>
              <AssessmentSubmissionTable
                assessmentId={
                  data.assessment.id
                }
                submissions={
                  filteredSubmissions
                }
              />

              <div className="mt-5 space-y-4 xl:hidden">
                {filteredSubmissions.map(
                  (submission) => (
                    <AssessmentSubmissionMobileCard
                      key={
                        submission.student
                          .id
                      }
                      assessmentId={
                        data.assessment.id
                      }
                      submission={
                        submission
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}