import {
  FileBarChart,
} from "lucide-react";

import type {
  StudentResultProfileData,
} from "@/lib/results";

import StudentProfileResultCard from "./StudentProfileResultCard";
import StudentProfileResultsTable from "./StudentProfileResultsTable";
import StudentResultsProfileFilters from "./StudentResultsProfileFilters";
import StudentResultsProfileHero from "./StudentResultsProfileHero";
import StudentResultsProfileMetrics from "./StudentResultsProfileMetrics";
import StudentSubjectPerformance from "./StudentSubjectPerformance";

export default function StudentResultsProfile({
  data,
}: {
  data:
    StudentResultProfileData;
}) {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1700px]">
        <StudentResultsProfileHero
          student={data.student}
          totalResults={
            data.metrics
              .totalResults
          }
        />

        <div className="mt-6">
          <StudentResultsProfileMetrics
            metrics={data.metrics}
          />
        </div>

        <div className="mt-6">
          <StudentResultsProfileFilters
            options={
              data.filterOptions
            }
          />
        </div>

        <div className="mt-6">
          <StudentSubjectPerformance
            subjects={
              data.subjectPerformance
            }
          />
        </div>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileBarChart className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Academic History
              </p>

              <h2 className="mt-1 text-xl font-black text-slate-950">
                Individual result records
              </h2>
            </div>
          </div>

          {data.records.length ===
          0 ? (
            <div className="flex min-h-[300px] items-center justify-center text-center">
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  No matching results
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Reset the filters or select a different academic period.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <StudentProfileResultsTable
                studentId={
                  data.student.id
                }
                records={
                  data.records
                }
              />

              <div className="grid gap-4 xl:hidden">
                {data.records.map(
                  (record) => (
                    <StudentProfileResultCard
                      key={
                        record.id
                      }
                      studentId={
                        data.student
                          .id
                      }
                      result={
                        record
                      }
                    />
                  ),
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}